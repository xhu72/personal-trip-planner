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
import { Trip } from '../types/Trip';

const COLLECTION = 'trips';

// converts raw data objects into Trip objects your app can use.
function docToTrip(id: string, data: Record<string, any>): Trip {
  let destinations = [];
  if (Array.isArray(data.destinations)) {
    destinations = data.destinations;
  }

  return {
    id,
    userId: data.userId,
    title: data.title,
    destinations,
    startDate: data.startDate,
    endDate: data.endDate,
    numberOfDays: data.numberOfDays,
    totalBudget: data.totalBudget,
    createdAt: new Date(data.createdAt).toISOString(),
  };
}

export async function createTrip(data: Omit<Trip, 'id' | 'createdAt'>): Promise<Trip> {
  const ref = await addDoc(collection(db, COLLECTION), {...data, createdAt: Date.now(),
  });
  return { ...data, id: ref.id, createdAt: new Date(Date.now()).toISOString() };
}

export async function getUserTrips(userId: string): Promise<Trip[]> {
  const getQuery = query(
    collection(db, COLLECTION), where('userId', '==', userId),
  );
  const allDocs = await getDocs(getQuery);
  const trips = allDocs.docs.map(d => docToTrip(d.id, d.data()));
  return trips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const oneDoc = await getDoc(doc(db, COLLECTION, tripId));
  if (!oneDoc.exists()) return null;
  return docToTrip(oneDoc.id, oneDoc.data());
}

export async function updateTrip(
  tripId: string,
  changes: Partial<Omit<Trip, 'id' | 'userId' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, tripId), changes);
}

export async function deleteTrip(tripId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, tripId));
}