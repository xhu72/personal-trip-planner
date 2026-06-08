import { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, Region, Polyline } from 'react-native-maps';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { getTripActivities } from '../../src/services/activities';
import { getTrip } from '../../src/services/trips';
import { Activity, ActivityCategory } from '../../src/types/Activity';
import { Trip } from '../../src/types/Trip';
import { CATEGORY_COLORS } from './ActivitiesScreen';

export default function TripMapScreen() {
  const router  = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const mapRef  = useRef<MapView>(null);

  const [trip, setTrip]             = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeCategories, setActiveCategories] = useState<ActivityCategory[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!tripId) return;

      async function load() {
        try {
          const tripData = await getTrip(tripId);
          const actData = await getTripActivities(tripId);

          setTrip(tripData);
          setActivities(actData);
        } finally {
          setLoading(false);
        }
      }

      load();
    }, [tripId]),
  );

  const mappable = activities.filter(a => a.coordinates !== null);


  function formatCalloutDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day:   'numeric',
    });
  }

  function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
      </SafeAreaView>
    );
  }

  const defaultRegion: Region = {
    latitude:       43.6532,
    longitude:      -79.3832,
    latitudeDelta:  0.05,
    longitudeDelta: 0.05,
  };

  //get categories in the trip activities
  const allCategories = mappable.map(a => a.category);
  const uniqueCategoriesSet = new Set(allCategories);
  const uniqueCategoriesArray = Array.from(uniqueCategoriesSet);
  const presentCategories = uniqueCategoriesArray as ActivityCategory[];

  //filtered or all
  let visibleActivities: Activity[];
  const isFiltering = activeCategories !== null;
  if (isFiltering) {
    visibleActivities = mappable.filter(a =>
      activeCategories.includes(a.category)
    );
  } else {
    visibleActivities = mappable;
  }

  const routeCoordinates = [...visibleActivities]
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    })
    .map(a => ({
      latitude:  a.coordinates!.lat,
      longitude: a.coordinates!.lng,
    }));

  function onMapReady() {
    if (!visibleActivities.length) return;

    const coords = visibleActivities.map(a => ({
      latitude:  a.coordinates!.lat,
      longitude: a.coordinates!.lng,
    }));

    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 40, bottom: 80, left: 40 },
      animated: true,
    });
  }

  /*
  1.no filter, show all
  2.category is already selected, only one category and user clicks it again, show all
  3.category is already selected, but more than one selected, remove this category from list
  4.category is NOT selected yet, add this category to selection
  */
  function toggleCategory(cat: ActivityCategory) {
    setActiveCategories(prev => {
      if (prev === null) {
        return [cat];
      }

      const already = prev.includes(cat);
      if (already && prev.length === 1) {
        return null;
      }
      if (already) {
        return prev.filter(c => c !== cat);
      }

      return [...prev, cat];
    });
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        initialRegion={defaultRegion}
        onMapReady={onMapReady}
        showsUserLocation
        showsCompass
      >
        {mappable.map(activity => {
          const visibleIndex = visibleActivities.findIndex(a => a.id === activity.id);
          const isVisible    = visibleIndex !== -1;
          const colors       = CATEGORY_COLORS[activity.category];
          return (
            <Marker
              key={activity.id}
              coordinate={{
                latitude:  activity.coordinates!.lat,
                longitude: activity.coordinates!.lng,
              }}
              opacity={isVisible ? 1 : 0}
              tappable={isVisible}
              pinColor={colors.dot}
            >
              <View style={[styles.markerPin, { backgroundColor: colors.dot }]}>
                <Text style={styles.markerNumber}>
                  {isVisible ? visibleIndex + 1 : ''}
                </Text>
              </View>

              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {activity.title}
                  </Text>

                  <Text style={styles.calloutMeta}>
                    {formatCalloutDate(activity.date)}{'  ·  '}{activity.time}{'  ·  '}{formatDuration(activity.duration)}
                  </Text>

                  <View style={[styles.calloutPill, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.calloutPillText, { color: colors.text }]}>
                      {activity.category}
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}

        {routeCoordinates.length >= 2 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#185FA5"
            strokeWidth={3}
            lineDashPattern={[10, 8]}
            lineJoin="round"
          />
        )}  
      </MapView>

      <SafeAreaView style={styles.headerWrapper} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.heading} numberOfLines={1}>
              {trip?.title ?? 'Map'}
            </Text>
            <Text style={styles.headingSub}>
              {visibleActivities.length} pin{visibleActivities.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={{ width: 48 }} />
        </View>
      </SafeAreaView>

      {mappable.length === 0 && (
        <View style={styles.nopins}>
          <Text style={styles.nopinsIcon}>📍</Text>
          <Text style={styles.nopinsTitle}>No pins yet</Text>
          <Text style={styles.nopinsSub}>
            Add activities with a location to see them here
          </Text>
        </View>
      )}

      {presentCategories.length > 1 && (
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <Pressable
              style={[
                styles.filterChip,
                activeCategories === null && styles.filterChipAllActive,
              ]}
              onPress={() => setActiveCategories(null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeCategories === null && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>

            {presentCategories.map(cat => {
              const colors   = CATEGORY_COLORS[cat];
              const isActive = activeCategories === null || activeCategories.includes(cat);
              return (
                <Pressable
                  key={cat}
                  style={[
                    styles.filterChip,
                    isActive && {
                      backgroundColor: colors.bg,
                      borderColor:     colors.dot,
                    },
                  ]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && { color: colors.text, fontWeight: '600' },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  markerPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  markerNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  callout: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    minWidth: 160,
    maxWidth: 220,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  calloutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A3C6B',
    marginBottom: 3,
  },
  calloutMeta: {
    fontSize: 11,
    color: '#888',
    marginBottom: 6,
  },
  calloutPill: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  calloutPillText: {
    fontSize: 10,
    fontWeight: '500',
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
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
  nopins: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  nopinsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  nopinsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  nopinsSub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  filterBar: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth:  StyleSheet.hairlineWidth,
    borderTopColor:  '#E4E4E4',
    paddingTop:    10,
    paddingBottom: 28,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap:               8,
    flexDirection:     'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical:   7,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       '#D8D8D8',
    backgroundColor:   '#F4F4F4',
  },
  filterChipAllActive: {
    backgroundColor: '#185FA5',
    borderColor:     '#185FA5',
  },
  filterChipText: {
    fontSize:   12,
    color:      '#888',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
});
