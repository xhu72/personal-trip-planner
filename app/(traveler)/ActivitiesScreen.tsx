import { useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTripActivities, groupByDate } from '../../src/services/activities';
import { getTrip } from '../../src/services/trips';
import { Activity, ActivityCategory } from '../../src/types/Activity';
import { Trip } from '../../src/types/Trip';

export const CATEGORY_COLORS = {
  Food: {
    dot: '#E05C28',
    bg: '#FDE8DC',
    text: '#8B2A0A',
  },
  Attraction: {
    dot: '#185FA5',
    bg: '#D6E4F7',
    text: '#0C3D7A',
  },
  Transport: {
    dot: '#7F77DD',
    bg: '#E8E6FA',
    text: '#3D3592',
  },
  Accommodation: {
    dot: '#27500A',
    bg: '#EAF3DE',
    text: '#163006',
  },
} as const;

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatDayHeader(dateStr: string, tripStart: string): string {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const start  = new Date(tripStart);
  const date   = new Date(dateStr);
  const dayNum = Math.round((date.getTime() - start.getTime()) / MS_PER_DAY) + 1;

  const formatted = date.toLocaleDateString('en-US', {
    month:   'short',
    day:     'numeric',
    weekday: 'short',
  });
  return `Day ${dayNum}  ·  ${formatted}`;
}

function ActivityCard({ activity, onPress }: {
  activity: Activity;
  onPress: () => void;
}) {
  const { dot, bg, text } = CATEGORY_COLORS[activity.category];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.catDot, { backgroundColor: dot }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {activity.title}
          </Text>

          {activity.isBooked && (
            <Text style={styles.bookedText}>Booked</Text>
          )}
        </View>

        <Text style={styles.cardMeta}>
          {activity.time} · {formatDuration(activity.duration)} · {activity.location}
        </Text>

        <View style={[styles.catPill, { backgroundColor: bg }]}>
          <Text style={[styles.catPillText, { color: text }]}>
            {activity.category}
          </Text>
        </View>

      </View>
    </Pressable>
  );
}

export default function ActivitiesScreen() {
  const router      = useRouter();
  const { tripId }  = useLocalSearchParams<{ tripId: string }>();

  const [trip, setTrip]               = useState<Trip | null>(null);
  const [activities, setActivities]   = useState<Activity[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function load() {
      if (!tripId) return;
      try {
        setLoading(true);

        const tripData = await getTrip(tripId);
        const actData = await getTripActivities(tripId);

        setTrip(tripData);
        setActivities(actData);
      } catch (e) {
        console.error('Failed to load activities:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tripId]);

  function buildSections() {
    const grouped = groupByDate(activities);
    const sortedDates = Object.keys(grouped).sort();
    return sortedDates.map(date => {
      let startDate: string;
      if (trip) {
        startDate = trip.startDate;
      } else {
        startDate = date;
      }
      return { title: formatDayHeader(date, startDate), data: grouped[date] };
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
      </SafeAreaView>
    );
  }

  const sections = buildSections();

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.heading} numberOfLines={1}>
            {trip?.title ?? 'Itinerary'}
          </Text>
          <Text style={styles.headingSub}>
            {activities.length} activit{activities.length === 1 ? 'y' : 'ies'}
          </Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <Text style={styles.dayLabel}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <ActivityCard
            activity={item}
            onPress={() =>
              router.push({
                pathname: '/(traveler)/EditActivityScreen',
                params: { activityId: item.id, tripId },
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySub}>
              Tap the button below to add your first activity
            </Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />

      <Pressable
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: '/(traveler)/AddActivityScreen',
            params: { tripId },
          })
        }
      >
        <Text style={styles.fabText}>+ Add activity</Text>
      </Pressable>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E4E4',
  },
  backText: {
    fontSize: 20,
    color: 'black',
    width: 48,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A3C6B',
  },
  headingSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E4E4',
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  bookedBadge: {
    backgroundColor: '#EAF3DE',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  bookedText: {
    fontSize: 10,
    color: '#27500A',
    fontWeight: '500',
  },
  cardMeta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  catPill: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    left: 24,
    right: 24,
    backgroundColor: '#185FA5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
