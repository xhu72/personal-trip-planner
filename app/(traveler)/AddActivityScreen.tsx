import { useState, useEffect, useRef } from 'react';
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
import DatePickerInput from '../../src/components/DatePickerInput';
import TimePickerInput from '../../src/components/TimePickerInput';
import DurationPickerInput from '../../src/components/DurationPickerInput';
import { searchPlaces, getPlaceCoordinates, PlaceSuggestion } from '../../src/services/places';
import { ActivityCategory, Coordinates } from '../../src/types/Activity';
import { CATEGORY_COLORS } from './ActivitiesScreen';

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
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function handleLocationChange(text: string) {
    setLocation(text);
    setCoordinates(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      const places = await searchPlaces(text);
      setSuggestions(places);
    }, 350);
  }

  async function handleSelectPlace(suggestion: PlaceSuggestion) {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    setLocation(suggestion.description);
    setSuggestions([]);

    try {
      const coords = await getPlaceCoordinates(suggestion.placeId);
      setCoordinates(coords);
    } catch (e) {
      console.error('Failed to get place coordinates:', e);
    }
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
        coordinates,
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
          placeholder="Search for a place..."
          value={location}
          onChangeText={handleLocationChange}
        />

        {suggestions.length > 0 && (
          <View style={styles.suggestionList}>
            {suggestions.map(suggestion => (
              <Pressable
                key={suggestion.placeId}
                style={styles.suggestionItem}
                onPress={() => handleSelectPlace(suggestion)}
              >
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {suggestion.description}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {coordinates && (
          <Text style={styles.coordHint}>📍 Location pinned on map</Text>
        )}

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
        <DatePickerInput value={date} onChange={setDate} placeholder="YYYY-MM-DD" />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Time</Text>
            <TimePickerInput value={time} onChange={setTime} placeholder="09:00" />
          </View>
          <View style={{ width: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Duration</Text>
            <DurationPickerInput value={duration} onChange={setDuration} />
          </View>
        </View>

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
  suggestionList: {
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 10,
    marginTop: -12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: '#222',
  },
  coordHint: {
    fontSize: 13,
    color: '#1E8E3E',
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