import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  getTripMedia,
  addMedia,
  toggleFavorite,
  deleteMedia,
} from '../../src/utils/mediaStorage';
import { Media } from '../../src/types/Media';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - 4) / 3;

export default function MediaScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  const [photos, setPhotos] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!tripId) return;
      getTripMedia(tripId).then(data => setPhotos(data)).finally(() => setLoading(false));
    }, [tripId]),
  );

  async function handleAddPhotos() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Please allow access to your photo library in Settings.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    for (const asset of result.assets) {
      const newPhoto = await addMedia({
        tripId,
        uri: asset.uri,
        isFavorite: false,
        addedAt: new Date().toISOString(),
      });
      setPhotos(prev => [...prev, newPhoto]);
    }
  }

  function handlePhotoPress(photo: Media) {
    const isFav = photo.isFavorite;
    Alert.alert(
      photo.isFavorite ? '⭐ Favorited' : 'Photo',
      'What would you like to do?',
      [
        {
          text: isFav ? 'Remove from favorites' : 'Add to favorites',
          onPress: async () => {
            await toggleFavorite(tripId, photo.id);

            const updated = await getTripMedia(tripId);
            setPhotos(updated);
          },
        },
        {
          text: 'Delete photo',
          style: 'destructive',
          onPress: () => confirmDelete(photo),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  }

  function confirmDelete(photo: Media) {
    Alert.alert('Delete photo', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMedia(tripId, photo.id);
          const updated = await getTripMedia(tripId);
          setPhotos(updated);
        },
      },
    ]);
  }

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
        <Text style={styles.heading}>Photos</Text>
        <Text style={styles.count}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={photos}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyTitle}>No photos yet</Text>
            <Text style={styles.emptySub}>
              Tap the button below to add photos from your gallery
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.photoCell}
            onPress={() => handlePhotoPress(item)}
          >
            <Image
              source={{ uri: item.uri }}
              style={styles.photo}
              resizeMode="cover"
            />
            {item.isFavorite && (
              <View style={styles.favBadge}>
                <Text style={styles.favIcon}>⭐</Text>
              </View>
            )}
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={handleAddPhotos}>
        <Text style={styles.fabText}>Add photos</Text>
      </Pressable>
    </SafeAreaView>
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
  count: {
    fontSize: 13,
    color: '#888',
    width: 60,
    textAlign: 'right',
  },
  grid: {
    padding: 2,
    paddingBottom: 100,
  },
  photoCell: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
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
  empty: {
    alignItems: 'center',
    paddingTop: 80,
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
