import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createActivity } from '../../src/services/activities';
import { getTrip } from '../../src/services/trips';
import { ActivityCategory } from '../../src/types/Activity';
import { CATEGORY_COLORS, formatDuration } from './ActivitiesScreen';

const CATEGORIES: ActivityCategory[] = [
  'Food',
  'Attraction',
  'Transport',
  'Accommodation',
];

export default function AddActivityScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  const [title, setTitle]         = useState('');
  const [location, setLocation]   = useState('');
  const [category, setCategory]   = useState<ActivityCategory>('Attraction');
  const [date, setDate]           = useState('');
  const [time, setTime]           = useState('09:00');
  const [duration, setDuration]   = useState('60');
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    if (!tripId) return;
    getTrip(tripId).then(trip => {
      if (trip) setDate(trip.startDate);
    });
  }, [tripId]);

  function validate(): string | null {
    if (!title.trim()) return 'Please enter a title.';
    if (!location.trim()) return 'Please enter a location.';
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return 'Date must be YYYY-MM-DD format.';
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) return 'Time must be HH:MM format e.g. 09:30';
    const minutes = Number(duration);
    if (!duration || isNaN(minutes) || minutes <= 0) return 'Enter a valid duration in minutes.';
    return null;
  }

  async function handleSave() {
    const error = validate();
    if (error) { console.error(error); return; }
    if (!tripId) return;

    setSaving(true);
    try {
      await createActivity({
        tripId,
        title:          title.trim(),
        location:       location.trim(),
        category,
        date,
        time,
        duration:       Number(duration),
        isBooked:       false,
        bookingDetails: {},
      });
      router.back();
    } catch (e) {
      console.error('Failed to save activity:', e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.heading}>Add activity</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. P&M Restaurant"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Downtown Toronto"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map(cat => {
            const colors  = CATEGORY_COLORS[cat];
            const selected = category === cat;
            return (
              <Pressable
                key={cat}
                style={[
                  styles.categoryChip,
                  selected && {
                    backgroundColor: colors.bg,
                    borderColor:     colors.dot,
                    borderWidth:     1.5,
                  },
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selected && { color: colors.text, fontWeight: '600' },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="09:00"
              value={time}
              onChangeText={setTime}
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="60"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
        </View>

        {Number(duration) > 0 && (
          <Text style={styles.hint}>{formatDuration(Number(duration))}</Text>
        )}

        <Pressable
          style={[styles.primaryBtn, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryBtnText}>
            {saving ? 'Saving...' : 'Save activity'}
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E4E4',
  },
  backText: {
    fontSize: 20,
    color: 'black',
    width: 48,
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A3C6B',
  },
  inner: {
    padding: 20,
    paddingBottom: 48,
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    backgroundColor: '#F4F4F4',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#555',
  },
  row: {
    flexDirection: 'row',
  },
  hint: {
    fontSize: 13,
    color: '#185FA5',
    marginTop: -8,
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: '#185FA5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});