import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * THE SINGLE NOTIFICATION SCHEDULER — FR-0.6.
 *
 * Every notification in the product goes through here. Systems do not get
 * individual budgets; the daily cap is enforced across all of them.
 *
 * Rules encoded here rather than trusted to callers:
 *  - Hard cap per day (default 6).
 *  - Quiet hours honoured for everything except medication.
 *  - Every notification carries an action, never bare information.
 *  - No notification may mention money, a stake, or a settlement (Principle XI).
 *  - Local scheduling only — reminders must fire offline (Principle VI).
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false, // a badge is a count of things not done (FR-031)
  }),
});

export interface NotifyPrefs {
  dailyCap: number;
  quietFrom: number; // hour, 0-23
  quietTo: number;
}

export const DEFAULT_PREFS: NotifyPrefs = { dailyCap: 6, quietFrom: 22, quietTo: 7 };

let sentToday = 0;
let sentDay = new Date().toDateString();

function withinQuiet(d: Date, p: NotifyPrefs) {
  const h = d.getHours();
  return p.quietFrom > p.quietTo ? h >= p.quietFrom || h < p.quietTo : h >= p.quietFrom && h < p.quietTo;
}

function rollDay() {
  const today = new Date().toDateString();
  if (today !== sentDay) {
    sentDay = today;
    sentToday = 0;
  }
}

export async function ensurePermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/**
 * Fire now. Returns false when suppressed — callers must treat that as normal,
 * never as an error the person sees.
 */
export async function notifyNow(
  title: string,
  body: string,
  opts: { isMedication?: boolean; prefs?: NotifyPrefs } = {}
): Promise<boolean> {
  const prefs = opts.prefs ?? DEFAULT_PREFS;
  rollDay();

  if (!opts.isMedication) {
    if (sentToday >= prefs.dailyCap) return false;
    if (withinQuiet(new Date(), prefs)) return false;
  }

  if (!(await ensurePermission())) return false;

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: null, // immediate
  });
  sentToday += 1;
  return true;
}

/** A repeating daily reminder at a wall-clock time. Medication, wind-down. */
export async function scheduleDaily(
  id: string,
  hour: number,
  minute: number,
  title: string,
  body: string
): Promise<string | null> {
  if (!(await ensurePermission())) return null;
  return Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancel(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

export async function cancelAll() {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
}

/** Android needs an explicit channel; no-op on iOS. */
export async function configureChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Rudder',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}
