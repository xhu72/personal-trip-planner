import { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTrip, deleteTrip } from '../../src/services/trips';
import { Trip } from '../../src/types/Trip';
import {
  cacheTripData,
  getCachedTrip,
  getCachedActivities,
} from '../../src/utils/offlineCache';
import { getTripActivities } from '../../src/services/activities';

const DAILY_ESTIMATES = [
  { label: 'Food',       dailyRate: 60 },
  { label: 'Transport',  dailyRate: 30 },
  { label: 'Activities', dailyRate: 25 },
  { label: 'Misc',       dailyRate: 15 },
];

function getCostEstimates(trip: Trip) {
  return DAILY_ESTIMATES.map(item => ({
    label: item.label,
    amount: item.dailyRate * trip.numberOfDays,
  }));
}

function BudgetBar({ used, total }: { used: number; total: number }) {
  const percent = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const color = percent > 90 ? '#E24B4A' : percent > 70 ? '#BA7517' : '#185FA5';

  return (
    <View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percent}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.barLabel}>
        ${used.toLocaleString()} estimated of ${total.toLocaleString()} budget
        {'  '}({Math.round(percent)}%)
      </Text>
    </View>
  );
}

export default function TripSummaryScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    async function load() {
      const cached = await getCachedTrip(tripId);
      if (cached) {
        setTrip(cached);
      }

      try {
        const freshTrip = await getTrip(tripId);
        const freshActivities = await getTripActivities(tripId);
        if (freshTrip) {
          setTrip(freshTrip);
          setIsOffline(false);
          if (freshActivities) {
            await cacheTripData(freshTrip, freshActivities);
          }
        }
      } catch {
        setIsOffline(true);
      }
    }

    load();
  }, [tripId]);

  async function handleDelete() {
    if (!tripId) return;
    await deleteTrip(tripId);
    router.replace('/(traveler)/HomeScreen');
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.containerContent}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.notFoundText}>Trip not found.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const costs = getCostEstimates(trip);
  const totalEstimate = costs.reduce((sum, c) => sum + c.amount, 0);
  const totalColor = totalEstimate > trip.totalBudget ? '#E24B4A' : '#185FA5';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.containerContent}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineBannerText}>
              📵  You're offline — showing cached data
            </Text>
          </View>
        )}

        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.meta}>
          {trip.startDate}  →  {trip.endDate}  ·  {trip.numberOfDays} days
        </Text>

        <View style={styles.tagRow}>
          {trip.destinations.map(d => (
            <View key={d} style={styles.tag}>
              <Text style={styles.tagText}>{d}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Budget overview</Text>
        <BudgetBar used={totalEstimate} total={trip.totalBudget} />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Estimated costs</Text>
        <Text style={styles.sectionSub}>Based on {trip.numberOfDays} days</Text>

        <View style={styles.costBox}>
          {costs.map(c => (
            <View key={c.label} style={[styles.costRow, styles.costRowDivider]}>
              <Text style={styles.costLabel}>{c.label}</Text>
              <Text style={styles.costAmount}>${c.amount.toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated total</Text>
            <Text style={[styles.totalAmount, { color: totalColor }]}>
              ${totalEstimate.toLocaleString()}
            </Text>
          </View>
        </View>

        {totalEstimate > trip.totalBudget && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Estimates exceed your budget by ${(totalEstimate - trip.totalBudget).toLocaleString()}.
              Consider adjusting your budget or trip length.
            </Text>
          </View>
        )}

        <View style={styles.actionGrid}>
          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: '/(traveler)/ActivitiesScreen',
                params: { tripId },
              })
            }
          >
            <Text style={styles.actionIcon}>🗓</Text>
            <Text style={styles.actionLabel}>Itinerary</Text>
          </Pressable>

          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: '/(traveler)/TripMapScreen',
                params: { tripId },
              })
            }
          >
            <Text style={styles.actionIcon}>🗺</Text>
            <Text style={styles.actionLabel}>Map</Text>
          </Pressable>

          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: '/(traveler)/MediaScreen',
                params: { tripId },
              })
            }
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionLabel}>Photos</Text>
          </Pressable> 

          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              router.push({
                pathname: '/(traveler)/FavoritesScreen',
                params: { tripId },
              })
            }
          >
            <Text style={styles.actionIcon}>⭐</Text>
            <Text style={styles.actionLabel}>Favorites</Text>
          </Pressable>  
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  containerContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backIcon: {
    fontSize: 20,
    color: 'black',
  },
  deleteText: {
    fontSize: 14,
    color: '#E24B4A',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A3C6B',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#E6F1FB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 13,
    color: '#0C447C',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A3C6B',
    marginBottom: 8,
  },
  sectionSub: {
    fontSize: 12,
    color: '#AAA',
    marginBottom: 12,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#E0E8F4',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
  },
  costBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E4E4',
    overflow: 'hidden',
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  costRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  costLabel: {
    fontSize: 14,
    color: '#555',
  },
  costAmount: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E0E8F4',
    backgroundColor: '#EEF5FD',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A3C6B',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#185FA5',
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  actionBtn: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems:  'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor:'#E4E4E4',
    gap: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A3C6B',
  },
  notFoundText: {
    fontSize: 16,
    color: '#888',
  },
  actionGrid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            12,
    marginTop:      8,
    marginBottom:   16,
  },
  mapBtn: {
    width:           54,
    height:          54,
    borderRadius:    12,
    backgroundColor: '#EEF5FD',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     '#D6E4F7',
  },
  mapBtnIcon: {
    fontSize: 22,
  },
  offlineBanner: {
    backgroundColor:   '#FFF3CD',
    paddingVertical:   8,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FFD166',
  },
  offlineBannerText: {
    fontSize:  13,
    color:     '#856404',
    textAlign: 'center',
  },
  actionIcon:{
    fontSize:24,
  },
});
