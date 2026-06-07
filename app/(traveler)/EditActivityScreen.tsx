import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getActivity, updateActivity, deleteActivity } from '../../src/services/activities';
import { Activity, ActivityCategory } from '../../src/types/Activity';
import { CATEGORY_COLORS, formatDuration } from './ActivitiesScreen';

const CATEGORIES: ActivityCategory[] = [
  'Food',
  'Attraction',
  'Transport',
  'Accommodation',
];

export default function EditActivityScreen() {
  const router = useRouter();
  const { activityId, tripId } = useLocalSearchParams<{
    activityId: string;
    tripId: string;
  }>();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading]   = useState(true);

  const [title, setTitle]       = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Attraction');
  const [date, setDate]         = useState('');
  const [time, setTime]         = useState('');
  const [duration, setDuration] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!activityId) return;
    getActivity(activityId)
      .then(data => {
        if (!data) return;
        setActivity(data);
        setTitle(data.title);
        setLocation(data.location);
        setCategory(data.category);
        setDate(data.date);
        setTime(data.time);
        setDuration(String(data.duration));
        setIsBooked(data.isBooked);
      })
      .finally(() => setLoading(false));
  }, [activityId]);

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
    if (!activityId) return;

    setSaving(true);
    try {
      await updateActivity(activityId, {
        title:    title.trim(),
        location: location.trim(),
        category,
        date,
        time,
        duration: Number(duration),
        isBooked,
      });
      router.back();
    } catch (e) {
      console.error('Failed to save changes:', e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!activityId) return;
    try {
      await deleteActivity(activityId);
      router.back();
    } catch (e) {
      console.error('Failed to delete activity:', e);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.notFound}>Activity not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.heading}>Edit activity</Text>
        <Pressable onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. P&M Restaurant"
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Downtown Toronto"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map(cat => {
            const colors   = CATEGORY_COLORS[cat];
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
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="09:00"
            />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="60"
            />
          </View>
        </View>

        {Number(duration) > 0 && (
          <Text style={styles.hint}>{formatDuration(Number(duration))}</Text>
        )}

        <Text style={styles.label}>Booked?</Text>
        <View style={styles.bookedRow}>
          <Text style={styles.bookedLabel}>Mark as booked</Text>
          <Switch
            value={isBooked}
            onValueChange={setIsBooked}
            trackColor={{ false: '#D8D8D8', true: '#185FA5' }}
            thumbColor="#fff"
          />
        </View>

        <Pressable
          style={[styles.primaryBtn, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.primaryBtnText}>
            {saving ? 'Saving...' : 'Save changes'}
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
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
  deleteText: {
    fontSize: 14,
    color: '#E24B4A',
    width: 48,
    textAlign: 'right',
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
  bookedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F8FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  bookedLabel: {
    fontSize: 15,
    color: '#333',
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
  notFound: {
    fontSize: 16,
    color: '#888',
  },
});
