import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { list, subscribe, type Capture } from '../src/db';
import { companion, ui } from '../src/ui/copy.catalogue';
import { ContentColumn, Rule } from '../src/ui/primitives';
import { usePalette, useSizeClass } from '../src/ui/theme';
import { space } from '../src/ui/tokens';
import { body, hero, meta, tabular } from '../src/ui/type';

function when(ts: number) {
  const d = new Date(ts);
  const days = Math.floor((Date.now() - ts) / 86_400_000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'long' }).toLowerCase();
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toLowerCase();
}

export default function Inbox() {
  const p = usePalette();
  const size = useSizeClass();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Capture[]>([]);

  useEffect(() => {
    const load = () => void list().then(setItems);
    load();
    return subscribe(load);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: p.paper }}>
      <ContentColumn style={{ paddingTop: insets.top + space[4] }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={ui.back}
          hitSlop={16}
          style={{ minHeight: 48, justifyContent: 'center' }}
        >
          <Text style={[meta, { color: p.inkMuted }]}>{ui.back}</Text>
        </Pressable>

        <Text style={[hero(size), { color: p.ink, marginTop: space[5] }]}>{ui.inboxTitle}</Text>

        {/* A neutral count. Never a badge, never accent, never a colour that
            reads as alarm (FR-028). Nothing here aggregates things NOT done. */}
        <Text style={[meta, tabular, { color: p.inkMuted, marginTop: space[1] }]}>
          {items.length > 0 ? `${items.length} ${ui.unreadSuffix}` : ''}
        </Text>

        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          style={{ marginTop: space[6] }}
          contentContainerStyle={{ paddingBottom: insets.bottom + space[7] }}
          // Ordering is newest-first from the query. NEVER oldest-first (FR-027).
          ListEmptyComponent={
            <Text style={[body, { color: p.inkSecondary }]}>{companion.empty}</Text>
          }
          ItemSeparatorComponent={() => (
            <View style={{ paddingVertical: space[4] }}>
              <Rule />
            </View>
          )}
          renderItem={({ item }) => (
            <View style={{ paddingVertical: space[1] }}>
              <Text style={[body, { color: p.ink }]}>{item.editedText ?? item.originalText}</Text>
              {/* Age is stated plainly. A three-week-old item looks exactly
                  like a fresh one — no amber, no "overdue", no escalation. */}
              <Text style={[meta, { color: p.inkMuted, marginTop: space[1] }]}>
                {when(item.capturedAt)}
              </Text>
            </View>
          )}
        />
      </ContentColumn>
    </View>
  );
}
