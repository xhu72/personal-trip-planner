import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { createTrip } from '../../src/services/trips';

function daysBetween(start: string, end: string): number {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (isNaN(startTime) || isNaN(endTime) || endTime < startTime) return 0;
  return Math.round((endTime - startTime) / 86_400_000) + 1;
}

export default function CreateTripScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [destinations, setDestinations] = useState<string[]>([]);
  const [destInput, setDestInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  function addDestination() {
    const value = destInput.trim();
    if (!value || destinations.includes(value)) return;
    setDestinations(prev => [...prev, value]);
    setDestInput('');
  }

  function removeDestination(d: string) {
    setDestinations(prev => prev.filter(x => x !== d));
  }

  function validate(): string | null {
    if (!title.trim()) return 'Give your trip a name.';
    if (!destinations.length) return 'Add at least one destination.';
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) return 'Start date must be YYYY-MM-DD.';
    if (!dateRegex.test(endDate)) return 'End date must be YYYY-MM-DD.';
    if (endDate < startDate) return 'End date must be after start date.';
    const amount = Number(budget);
    if (!amount || amount <= 0) return 'Enter a valid budget.';
    return null;
  }

  const numDays = daysBetween(startDate, endDate);

  async function handleSave() {
    const error = validate();
    if (error) {
      alert(error);
      return;
    }
    if (!user) return;
    try {
      const trip = await createTrip({
        userId: user.uid,
        title: title.trim(),
        destinations:destinations,
        startDate:startDate,
        endDate:endDate,
        numberOfDays: numDays,
        totalBudget: Number(budget),
      });
      router.replace({
        pathname: '/(traveler)/TripSummaryScreen',
        params: { tripId: trip.id },
      });
    } catch {
      alert('Could not save trip. Please try again.');
    }
  }



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.containerContent} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>

        <Text style={styles.title}>New trip</Text>

        <Text style={styles.label}>Trip name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Summer in Mississauga"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Destinations</Text>

        {destinations.map(d => (
          <View key={d} style={styles.destinationTag}>
            <Text style={styles.destinationTagText} numberOfLines={1}>{d}</Text>
            <Pressable onPress={() => removeDestination(d)}>
              <Text style={styles.destRemove}>✕</Text>
            </Pressable>
          </View>
        ))}

        <View style={styles.destRow}>
          <TextInput
            style={[styles.input, styles.destInput]}
            placeholder="e.g. Tokyo, Japan"
            value={destInput}
            onChangeText={setDestInput}
            onSubmitEditing={addDestination}
            returnKeyType="done"
          />
          <Pressable style={styles.addBtn} onPress={addDestination}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <Text style={styles.label}>Start date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.label}>End date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        {numDays > 0 && (
          <Text style={styles.dayCount}>{numDays} days</Text>
        )}

        <Text style={styles.label}>Total budget (USD)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2500"
          value={budget}
          onChangeText={setBudget}
        />

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Create trip</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  backIcon: {
    fontSize: 20,
    color: 'black',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A3C6B',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    marginBottom: 16,
  },
  destinationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF5FD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 8,
    gap: 8,
  },
  destinationTagText: {
    flex: 1,
    fontSize: 14,
    color: '#185FA5',
  },
  destRemove: {
    fontSize: 14,
    color: '#A32D2D',
    paddingLeft: 4,
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  destInput: {
    flex: 1,
  },
  addBtn: {
    backgroundColor: '#185FA5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCol: {
    flex: 1,
  },
  dayCount: {
    fontSize: 13,
    color: '#185FA5',
    marginTop: -8,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#185FA5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
