import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Circle, Marker } from 'react-native-maps';
import { router } from 'expo-router';
import {
  addPlace,
  addQuest,
  completeQuest,
  listPlaces,
  listQuests,
  type Place,
  type Quest,
} from '../src/db/places';
import { currentPosition, permissionState, requestPermission, syncRegions } from '../src/location/geofence';
import { ui } from '../src/ui/copy.catalogue';
import { ContentColumn, Pill, Rule } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { radius, space } from '../src/ui/tokens';
import { body, hero, meta, supporting } from '../src/ui/type';

export default function Map() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();

  const [perm, setPerm] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [here, setHere] = useState<{ lat: number; lon: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selected, setSelected] = useState<Place | null>(null);
  const [draftQuest, setDraftQuest] = useState('');
  const [monitored, setMonitored] = useState(0);

  const reload = useCallback(async () => {
    setPlaces(await listPlaces());
    setQuests(await listQuests());
  }, []);

  useEffect(() => {
    void (async () => {
      setPerm(await permissionState());
      await reload();
    })();
  }, [reload]);

  const enableLocation = async () => {
    const s = await requestPermission();
    setPerm(s);
    if (s === 'granted') {
      try {
        setHere(await currentPosition());
      } catch {
        /* proximity is optional */
      }
      const r = await syncRegions();
      setMonitored(r.monitored);
    }
  };

  const anchorHere = async () => {
    if (perm !== 'granted') return enableLocation();
    const pos = await currentPosition();
    setHere(pos);
    Alert.prompt?.('Name this place', 'What do you call it?', async (label?: string) => {
      if (!label) return;
      await addPlace(label, pos.lat, pos.lon);
      await reload();
      const r = await syncRegions();
      setMonitored(r.monitored);
    });
  };

  const attachQuest = async () => {
    const t = draftQuest.trim();
    if (!t || !selected) return;
    await addQuest(t, selected.id, 'arrive');
    setDraftQuest('');
    await reload();
    const r = await syncRegions();
    setMonitored(r.monitored);
  };

  const questsFor = (id: string) => quests.filter((q) => q.placeId === id);

  /* ---------------------------------------------------------- denied path */
  // Location is NEVER required. With permission denied the map degrades to a
  // plain list and every place-bound quest still works manually (FR-2.4).
  if (perm !== 'granted') {
    return (
      <View style={{ flex: 1, backgroundColor: p.paper }}>
        <ContentColumn style={{ paddingTop: insets.top + space[4] }}>
          <Pressable onPress={() => router.back()} hitSlop={16} style={{ minHeight: 48, justifyContent: 'center' }}>
            <Text style={[meta, { color: p.inkMuted }]}>{ui.back}</Text>
          </Pressable>
          <Text style={[hero(size), { color: p.ink, marginTop: space[5] }]}>places</Text>
          <Text style={[supporting, { color: p.inkSecondary, marginTop: space[3] }]}>
            The map remembers what you wanted to do near places you go. Locations stay on this device.
          </Text>
          <View style={{ flex: 1 }} />
          <View style={{ marginBottom: space[5] }}>
            <Pill label="Use my location" onPress={enableLocation} />
          </View>
          <Text style={[meta, { color: p.inkMuted, marginBottom: space[6] }]}>
            Everything works without it. Quests just wait for you to open them.
          </Text>
        </ContentColumn>
      </View>
    );
  }

  /* ------------------------------------------------------------ map path */
  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn style={{ paddingTop: insets.top + space[4] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} hitSlop={16} style={{ minHeight: 48, justifyContent: 'center' }}>
            <Text style={[meta, { color: p.inkMuted }]}>{ui.back}</Text>
          </Pressable>
          <Text style={[meta, { color: p.inkMuted }]}>
            {monitored > 0 ? `watching ${monitored}` : 'nothing to watch yet'}
          </Text>
        </View>

        <Text style={[hero(size), { color: p.ink, marginTop: space[3], marginBottom: space[4] }]}>
          places
        </Text>

        <View
          style={{
            height: 260,
            borderRadius: radius.card,
            overflow: 'hidden',
            marginBottom: space[5],
          }}
        >
          <MapView
            style={{ flex: 1 }}
            showsUserLocation
            initialRegion={
              here
                ? { latitude: here.lat, longitude: here.lon, latitudeDelta: 0.03, longitudeDelta: 0.03 }
                : undefined
            }
          >
            {places.map((pl) => (
              <View key={pl.id}>
                <Marker
                  coordinate={{ latitude: pl.lat, longitude: pl.lon }}
                  title={pl.label}
                  description={`${questsFor(pl.id).length} waiting`}
                  onPress={() => setSelected(pl)}
                />
                <Circle
                  center={{ latitude: pl.lat, longitude: pl.lon }}
                  radius={pl.radiusM}
                  strokeColor={p.accent}
                  fillColor={`${p.accent}22`}
                />
              </View>
            ))}
          </MapView>
        </View>

        <View style={{ marginBottom: space[5] }}>
          <Pill label="Remember this place" onPress={anchorHere} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + space[7] }}>
          {places.length === 0 && (
            <Text style={[body, { color: p.inkSecondary }]}>
              No places yet. Anchor one where you already go.
            </Text>
          )}

          {places.map((pl) => (
            <Pressable key={pl.id} onPress={() => setSelected(selected?.id === pl.id ? null : pl)}>
              <View style={{ paddingVertical: space[3] }}>
                <Text style={[body, { color: p.ink }]}>{pl.label}</Text>
                <Text style={[meta, { color: p.inkMuted, marginTop: space[1] }]}>
                  {questsFor(pl.id).length} waiting · {pl.radiusM}m
                </Text>

                {selected?.id === pl.id && (
                  <View style={{ marginTop: space[3] }}>
                    {questsFor(pl.id).map((q) => (
                      <Pressable
                        key={q.id}
                        onPress={async () => {
                          await completeQuest(q.id);
                          await reload();
                        }}
                        style={{ minHeight: 48, justifyContent: 'center' }}
                      >
                        <Text style={[supporting, { color: p.inkSecondary }]}>· {q.title}</Text>
                      </Pressable>
                    ))}
                    <TextInput
                      value={draftQuest}
                      onChangeText={setDraftQuest}
                      onSubmitEditing={attachQuest}
                      placeholder="what, when you're here?"
                      placeholderTextColor={p.inkMuted}
                      style={[
                        supporting,
                        {
                          color: p.ink,
                          borderBottomWidth: 2,
                          borderBottomColor: p.ink,
                          paddingBottom: space[2],
                          marginTop: space[3],
                        },
                      ]}
                    />
                  </View>
                )}
              </View>
              <Rule />
            </Pressable>
          ))}
        </ScrollView>
      </ContentColumn>
    </View>
  );
}
