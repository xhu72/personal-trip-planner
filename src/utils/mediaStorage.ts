import AsyncStorage from '@react-native-async-storage/async-storage';
import { Media, NewMedia } from '../types/Media';

const MEDIA_KEY = (tripId: string) => `media:${tripId}`;

export async function getTripMedia(tripId: string): Promise<Media[]> {
  const data = await AsyncStorage.getItem(MEDIA_KEY(tripId));
  if (!data) return [];
  return JSON.parse(data) as Media[];
}

export async function addMedia(data: NewMedia): Promise<Media> {
  const existing = await getTripMedia(data.tripId);
  const newItem: Media = {
    ...data,
    id: Date.now().toString(),
  };
  await AsyncStorage.setItem(MEDIA_KEY(data.tripId), JSON.stringify([...existing, newItem]));
  return newItem;
}

export async function toggleFavorite(tripId: string, mediaId: string): Promise<void> {
  const existing = await getTripMedia(tripId);
  const updated  = existing.map(m =>
    m.id === mediaId ? { ...m, isFavorite: !m.isFavorite } : m,
  );
  await AsyncStorage.setItem(MEDIA_KEY(tripId), JSON.stringify(updated));
}

export async function deleteMedia(tripId: string, mediaId: string): Promise<void> {
  const existing = await getTripMedia(tripId);
  const updated  = existing.filter(m => m.id !== mediaId);
  await AsyncStorage.setItem(MEDIA_KEY(tripId), JSON.stringify(updated));
}

export async function getFavoriteMedia(tripId: string): Promise<Media[]> {
  const all = await getTripMedia(tripId);
  return all.filter(m => m.isFavorite);
}
