import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getActivity, updateActivity } from '../../src/services/activities';
import { Activity } from '../../src/types/Activity';

export default function BookingDetailScreen() {
  const router = useRouter();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [confirmationNo, setConfirmationNo] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerUrl, setProviderUrl] = useState('');

  useEffect(() => {
    if (!activityId) return;

    getActivity(activityId).then(data => {
      if (!data) return;
      setActivity(data);
      const booking = data.bookingDetails;

      if (booking.confirmationNo) setConfirmationNo(booking.confirmationNo);
      if (booking.providerName) setProviderName(booking.providerName);
      if (booking.providerUrl) setProviderUrl(booking.providerUrl);
    }).finally(() => setLoading(false));
  }, [activityId]);

  function validate(): string | null {
    if (!confirmationNo.trim() && !providerName.trim() && !providerUrl.trim()) {
      return 'Please enter at least one booking detail.';
    }
    return null;
  }

  async function handleSave() {
    const error = validate();
    if (error) { console.error(error); return; }
    if (!activityId) return;

    setSaving(true);
    try {
      await updateActivity(activityId, {
        isBooked: true,
        bookingDetails: {
          confirmationNo: confirmationNo.trim() || undefined,
          providerName: providerName.trim() || undefined,
          providerUrl: providerUrl.trim() || undefined,
          bookedAt: new Date().toISOString(),
        },
      });
      router.back();
    } catch (e) {
      console.error('Failed to save booking:', e);
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    if (!activityId) return;
    try {
      await updateActivity(activityId, {
        isBooked: false,
        bookingDetails: {},
      });
      router.back();
    } catch (e) {
      console.error('Failed to clear booking:', e);
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

  const hasExistingBooking =
    !!activity.bookingDetails.confirmationNo ||
    !!activity.bookingDetails.providerName ||
    !!activity.bookingDetails.providerUrl;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.heading}>Booking details</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.activityCard}>
          <Text style={styles.activityTitle} numberOfLines={1}>
            {activity.title}
          </Text>
          <Text style={styles.activityMeta}>
            {activity.category} · {activity.date} · {activity.time}
          </Text>
        </View>

        <Text style={styles.label}>Confirmation number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. TKJ-2025-8821"
          value={confirmationNo}
          onChangeText={setConfirmationNo}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Provider name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Airbnb"
          value={providerName}
          onChangeText={setProviderName}
        />

        <Text style={styles.label}>Booking URL</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          value={providerUrl}
          onChangeText={setProviderUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Pressable
          style={[styles.primaryBtn, saving && styles.disabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Save booking</Text>
          )}
        </Pressable>

        {hasExistingBooking && (
          <Pressable style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>Clear booking</Text>
          </Pressable>
        )}
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
  inner: {
    padding: 20,
    paddingBottom: 48,
  },
  activityCard: {
    backgroundColor: '#EEF5FD',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3C6B',
    marginBottom: 3,
  },
  activityMeta: {
    fontSize: 12,
    color: '#555',
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
  primaryBtn: {
    backgroundColor: '#185FA5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: '#E24B4A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#E24B4A',
    fontSize: 16,
    fontWeight: '500',
  },
  notFound: {
    fontSize: 16,
    color: '#888',
  },
});
