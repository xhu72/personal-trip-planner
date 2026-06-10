import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../types/Trip';
import { Activity } from '../types/Activity';

const TRIP_KEY       = (tripId: string) => `trip:${tripId}`;
const ACTIVITIES_KEY = (tripId: string) => `activities:${tripId}`;

export async function cacheTripData(trip: Trip, activities: Activity[]): Promise<void> {
  await AsyncStorage.setItem(TRIP_KEY(trip.id), JSON.stringify(trip));
  await AsyncStorage.setItem(ACTIVITIES_KEY(trip.id), JSON.stringify(activities));
}

export async function getCachedTrip(tripId: string): Promise<Trip | null> {
  const data = await AsyncStorage.getItem(TRIP_KEY(tripId));
  if (!data) return null;
  return JSON.parse(data) as Trip;
}

export async function getCachedActivities(tripId: string): Promise<Activity[] | null> {
  const data = await AsyncStorage.getItem(ACTIVITIES_KEY(tripId));
  if (!data) return null;
  return JSON.parse(data) as Activity[];
}

export async function clearTripCache(tripId: string) {
  await AsyncStorage.removeItem(TRIP_KEY(tripId));
  await AsyncStorage.removeItem(ACTIVITIES_KEY(tripId));
}