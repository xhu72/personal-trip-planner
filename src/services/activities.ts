import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Activity } from '../types/Activity';

const COLLECTION = 'activities';

function docToActivity(id: string, data: Record<string, any>): Activity {
  let isBooked = false;
  if (data.isBooked !== undefined && data.isBooked !== null) {
    isBooked = data.isBooked;
  }

  let bookingDetails = {};
  if (data.bookingDetails !== undefined && data.bookingDetails !== null) {
    bookingDetails = data.bookingDetails;
  }

  return {
    id,
    tripId:    data.tripId,
    title:     data.title,
    location:  data.location,
    date:      data.date,
    time:      data.time,
    duration:  data.duration,
    category:  data.category,
    isBooked,
    bookingDetails,
    createdAt: new Date(data.createdAt).toISOString(),
  };
}

export async function createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: Date.now(),
  });
  return { ...data, id: ref.id, createdAt: new Date(Date.now()).toISOString() };
}

export async function getTripActivities(tripId: string) {
  const q = query(
    collection(db, COLLECTION),
    where('tripId', '==', tripId)
  );

  const snap = await getDocs(q);

  const activities = snap.docs.map(doc => {
    return docToActivity(doc.id, doc.data());
  });

  activities.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;

    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;

    return 0;
  });

  return activities;
}

export async function getActivity(activityId: string): Promise<Activity | null> {
  const snap = await getDoc(doc(db, COLLECTION, activityId));
  if (!snap.exists()) return null;
  return docToActivity(snap.id, snap.data());
}

export async function updateActivity(
  activityId: string,
  changes: Partial<Omit<Activity, 'id' | 'tripId' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, activityId), changes);
}

export async function deleteActivity(activityId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, activityId));
}

export function groupByDate(activities: Activity[]) {
  const groups: Record<string, Activity[]> = {};
  for (const activity of activities) {
    const date = activity.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
  }

  return groups;
}
