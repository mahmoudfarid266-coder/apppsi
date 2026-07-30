import * as Location from 'expo-location';
import { listPlaces, listQuests, recordVisit, type Place } from '../db/places';
import { notifyNow } from '../lib/notify';

/**
 * Geofencing — the SENSE stage for place-bound quests.
 *
 * Hard constraints from constitution Principle XII and NFR-7/NFR-9:
 *
 *  - iOS monitors at most 20 regions. We keep a ROLLING ACTIVE SET of the 20
 *    highest-scoring places and re-evaluate on significant location change.
 *  - NO continuous background positioning. Region monitoring is OS-managed and
 *    costs ~nothing; continuous GPS is only permitted inside an explicit,
 *    user-visible, user-ended session.
 *  - Location is NEVER a required permission. Every place trigger degrades to a
 *    manual or time-based quest when permission is denied (FR-2.4).
 *  - Precise coordinates never leave the device.
 */

export const GEOFENCE_TASK = 'rudder-geofence';
export const MAX_REGIONS = 20; // iOS hard limit

export type PermissionState = 'granted' | 'denied' | 'undetermined';

/** Foreground only. We deliberately do NOT request background location here. */
export async function requestPermission(): Promise<PermissionState> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status === Location.PermissionStatus.GRANTED) return 'granted';
  if (status === Location.PermissionStatus.DENIED) return 'denied';
  return 'undetermined';
}

export async function permissionState(): Promise<PermissionState> {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status === Location.PermissionStatus.GRANTED) return 'granted';
  if (status === Location.PermissionStatus.DENIED) return 'denied';
  return 'undetermined';
}

/** One-shot position. Used to anchor a new place, never polled. */
export async function currentPosition() {
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return { lat: pos.coords.latitude, lon: pos.coords.longitude };
}

function haversineM(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Choose which 20 regions to monitor. Pure so it can be tested without a device.
 *
 * Score favours places that have open quests, then proximity. A place with no
 * open quest is not worth a monitoring slot.
 */
export function selectRegions(
  places: Place[],
  questCountByPlace: Record<string, number>,
  from: { lat: number; lon: number } | null,
  max = MAX_REGIONS
): Place[] {
  return [...places]
    .map((p) => {
      const quests = questCountByPlace[p.id] ?? 0;
      const dist = from ? haversineM(from, p) : Number.MAX_SAFE_INTEGER;
      // Quests dominate; distance breaks ties. Places with nothing to do score 0.
      const score = quests * 1_000_000 - Math.min(dist, 999_999);
      return { p, score, quests };
    })
    .filter((x) => x.quests > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((x) => x.p);
}

/** (Re)arm the rolling active set. Safe to call repeatedly. */
export async function syncRegions(): Promise<{ monitored: number; skipped: string }> {
  if ((await permissionState()) !== 'granted') {
    return { monitored: 0, skipped: 'permission not granted' };
  }

  const places = await listPlaces();
  const quests = await listQuests();
  const byPlace: Record<string, number> = {};
  for (const q of quests) if (q.placeId) byPlace[q.placeId] = (byPlace[q.placeId] ?? 0) + 1;

  let here: { lat: number; lon: number } | null = null;
  try {
    here = await currentPosition();
  } catch {
    here = null; // proximity is a nice-to-have, not a requirement
  }

  const chosen = selectRegions(places, byPlace, here);

  if (chosen.length === 0) {
    if (await Location.hasStartedGeofencingAsync(GEOFENCE_TASK)) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
    }
    return { monitored: 0, skipped: 'no places with open quests' };
  }

  await Location.startGeofencingAsync(
    GEOFENCE_TASK,
    chosen.map((p) => ({
      identifier: p.id,
      latitude: p.lat,
      longitude: p.lon,
      radius: p.radiusM,
      notifyOnEnter: true,
      notifyOnExit: true,
    }))
  );

  return { monitored: chosen.length, skipped: '' };
}

/**
 * Called by the registered task when a region boundary is crossed.
 *
 * THIS IS WHERE A LOCATION REMINDER BECOMES A REMINDER. An earlier version
 * recorded the visit and said nothing, which made the whole feature inert.
 */
export async function onRegionEvent(placeId: string, entered: boolean) {
  const places = await listPlaces();
  const place = places.find((p) => p.id === placeId);
  if (!place) return;

  if (entered) await recordVisit(placeId);

  const open = (await listQuests(placeId)).filter(
    (q) => q.triggerKind === (entered ? 'arrive' : 'leave') || q.triggerKind === 'pass_near'
  );
  if (open.length === 0) return;

  const first = open[0];
  const more = open.length - 1;
  await notifyNow(
    entered ? `You're at ${place.label}` : `Leaving ${place.label}`,
    more > 0 ? `${first.title} — and ${more} more here` : first.title
  );
}
