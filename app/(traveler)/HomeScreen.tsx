import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useAuth } from '../../src/context/AuthContext';
import { getUserTrips } from '../../src/services/trips';
import { Trip } from '../../src/types/Trip';
import { createActivity, getTripActivities } from '../../src/services/activities';
function getTripStatus(trip: Trip) {
  const today = new Date().toISOString().slice(0, 10);

  let label = '';
  let color = '';
  let bg = '';

  if (trip.endDate < today) {
    label = 'Completed';
    color = '#27500A';
    bg = '#EAF3DE';
  } else if (trip.startDate <= today) {
    label = 'Active';
    color = '#712B13';
    bg = '#FAECE7';
  } else {
    label = 'Upcoming';
    color = '#0C447C';
    bg = '#E6F1FB';
  }

  return {
    label,
    color,
    bg,
  };
}

function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const status = getTripStatus(trip);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={[styles.statusPill, { backgroundColor: status.bg }]}>
        <Text style={[styles.statusText, { color: status.color }]}>
          {status.label}
        </Text>
      </View>

      <Text style={styles.cardTitle}>{trip.title}</Text>

      <Text style={styles.cardMeta}>
        {trip.startDate}  →  {trip.endDate}  ·  {trip.numberOfDays} days
      </Text>

      <Text style={styles.cardDest} numberOfLines={1}>
        {trip.destinations.join(', ')}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.budgetLabel}>Budget</Text>
        <Text style={styles.budgetAmount}>${trip.totalBudget.toLocaleString()}</Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    async function loadTrips() {
      if (!user) return;

      try {
        const data = await getUserTrips(user.uid);
        setTrips(data);
        /* testing activity
        if (data.length > 0) {
          await createActivity({
            tripId:         data[0].id,
            title:          'Test Activity',
            location:       'Tokyo Station',
            date:           '2025-10-03',
            time:           '09:00',
            duration:       60,
            category:       'Attraction',
            isBooked:       false,
            bookingDetails: {},
          });
          const all = await getTripActivities(data[0].id);
          console.log('Activities:', all.length, all[0].title);
        }*/
      } catch (e) {
        console.error(e);
      }
    }

    loadTrips();
    
  }, [user]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(userDoc => {
      let name = '';
      if (userDoc.data() && userDoc.data()?.name) {
        name = userDoc.data()?.name;
      }
      setFirstName(name.split(' ')[0]);
    });
  }, [user]);

  async function handleSignOut() {
    await signOut(auth);
  }

  /* async function testRules() {
    if (trips.length === 0) {
      console.log('No trips loaded to test with.');
      return;
    }
    const tripId = trips[0].id;
    console.log('Testing with trip ID:', tripId);
    try {
      const tripDoc = await getDoc(doc(db, 'trips', tripId));
      if (tripDoc.exists()) {
        console.log('Read allowed:', tripDoc.data());
      } else {
        console.log('Read allowed but document does not exist');
      }
    } catch (error) {
      console.log('Read denied:', error);
    }
  } */

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {firstName || 'there'}</Text>
          <Text style={styles.heading}>My trips</Text>
        </View>
        <Pressable onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      <FlatList
        data={trips}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySub}>Tap the button below to plan your first trip</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            onPress={() =>
              router.push({
                pathname: '/(traveler)/TripSummaryScreen',
                params: { tripId: item.id },
              })
            }
          />
        )}
      />

      {/* <Pressable style={styles.testBtn} onPress={testRules}>
        <Text style={styles.testBtnText}>Test rules</Text>
      </Pressable> */}

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/(traveler)/CreateTripScreen')}
      >
        <Text style={styles.fabText}>+ New trip</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  greeting: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A3C6B',
  },
  signOutText: {
    fontSize: 13,
    color: '#185FA5',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E4E4',
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  cardDest: {
    fontSize: 13,
    color: '#555',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#888',
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#185FA5',
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
  /*
  testBtn: {
    position: 'absolute',
    bottom: 84,
    left: 24,
    right: 24,
    backgroundColor: '#888',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  testBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },*/
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
