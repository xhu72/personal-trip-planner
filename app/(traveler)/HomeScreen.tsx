import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { createTrip, getUserTrips } from '../../src/services/trips';

export default function HomeScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    async function test() {
      if (!user) return;
      try {
        await createTrip({
          userId: user.uid,
          title: 'Test Trip',
          destinations: ['Tokyo, Japan'],
          startDate: '2025-06-10',
          endDate: '2025-06-20',
          numberOfDays: 11,
          totalBudget: 3000,
          isPrivate: true,
        });

        const trips = await getUserTrips(user.uid);
        setStatus(`Success! Found ${trips.length} trip(s). First: "${trips[0].title}"`);
      } catch (e: any) {
        setStatus(`Error: ${e.message}`);
      }
    }
    test();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 24 },
  text: { 
    fontSize: 16, 
    textAlign: 'center', 
    color: '#333' },
});