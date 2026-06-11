import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  FlatList,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { getFavoriteMedia } from '../../src/utils/mediaStorage';
import { getTripActivities } from '../../src/services/activities';
import { Media } from '../../src/types/Media';
import { Activity } from '../../src/types/Activity';
import { CATEGORY_COLORS } from './ActivitiesScreen';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - 48) / 3; 

type Tab = 'photos' | 'booked';

export default function FavoritesScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  const [activeTab, setActiveTab] = useState<Tab>('photos');
  const [favoritePhotos, setFavoritePhotos] = useState<Media[]>([]);
  const [bookedActivities, setBookedActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!tripId) return;

      async function load() {
        const activities = await getTripActivities(tripId);
        const favPhotos = await getFavoriteMedia(tripId);
        setBookedActivities(activities.filter(a => a.isBooked));
        setFavoritePhotos(favPhotos);
        setLoading(false);
      }

      load();
    }, [tripId]),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.heading}>Favorites</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === 'photos' && styles.tabActive]}
          onPress={() => setActiveTab('photos')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'photos' && styles.tabTextActive,
            ]}
          >
            ⭐ Photos ({favoritePhotos.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'booked' && styles.tabActive]}
          onPress={() => setActiveTab('booked')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'booked' && styles.tabTextActive,
            ]}
          >
            ✓ Booked ({bookedActivities.length})
          </Text>
        </Pressable>
      </View>

      {activeTab === 'photos' ? (
        <PhotosTab photos={favoritePhotos} />
      ) : (
        <BookedTab activities={bookedActivities} router={router} tripId={tripId} />
      )}
    </SafeAreaView>
  );
}

function PhotosTab({ photos }: { photos: Media[] }) {
  if (photos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>⭐</Text>
        <Text style={styles.emptyTitle}>No favorite photos yet</Text>
        <Text style={styles.emptySub}>
          Open Photos and tap a photo to mark it as a favorite
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      keyExtractor={item => item.id}
      numColumns={3}
      contentContainerStyle={styles.photoGrid}
      renderItem={({ item }) => (
        <View style={styles.photoCell}>
          <Image
            source={{ uri: item.uri }}
            style={styles.photo}
            resizeMode="cover"
          />
          <View style={styles.favBadge}>
            <Text style={styles.favIcon}>⭐</Text>
          </View>
        </View>
      )}
    />
  );
}

function BookedTab({
  activities,
  router,
  tripId,
}: {
  activities: Activity[];
  router: any;
  tripId: string;
}) {
  if (activities.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>✓</Text>
        <Text style={styles.emptyTitle}>No booked activities yet</Text>
        <Text style={styles.emptySub}>
          Open an activity and add booking details to see it here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.bookedList}>
      <Text style={styles.sectionLabel}>
        {activities.length} booked activit{activities.length === 1 ? 'y' : 'ies'}
      </Text>
      {activities.map(activity => {
        const colors = CATEGORY_COLORS[activity.category];
        return (
          <Pressable
            key={activity.id}
            style={styles.actCard}
            onPress={() =>
              router.push({
                pathname: '/(traveler)/EditActivityScreen',
                params: { activityId: activity.id, tripId },
              })
            }
          >
            <View style={[styles.catDot, { backgroundColor: colors.dot }]} />
            <View style={styles.actBody}>
              <Text style={styles.actTitle} numberOfLines={1}>
                {activity.title}
              </Text>
              <Text style={styles.actMeta}>
                {activity.date}  ·  {activity.time}  ·  {activity.category}
              </Text>
              {activity.bookingDetails.confirmationNo && (
                <Text style={styles.actConfirmation} numberOfLines={1}>
                  Ref: {activity.bookingDetails.confirmationNo}
                </Text>
              )}
            </View>
            <View style={styles.bookedBadge}>
              <Text style={styles.bookedText}>✓</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
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
    width: 60,
  },
  heading: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#1A3C6B',
    textAlign: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E4E4',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#185FA5',
  },
  tabText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#185FA5',
    fontWeight: '700',
  },
  photoGrid: {
    padding: 16,
    paddingBottom: 32,
  },
  photoCell: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: 4,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  favBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  favIcon: {
    fontSize: 11,
  },
  bookedList: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  actCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E4E4',
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  actBody: {
    flex: 1,
  },
  actTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  actMeta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  actConfirmation: {
    fontSize: 11,
    color: '#185FA5',
  },
  bookedBadge: {
    backgroundColor: '#EAF3DE',
    borderRadius: 20,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookedText: {
    fontSize: 12,
    color: '#27500A',
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
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
});
