import { Coordinates } from '../types/Activity';

const PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

export type PlaceSuggestion = {
  placeId:     string;
  description: string;
};

export async function searchPlaces(input: string): Promise<PlaceSuggestion[]> {
  if (!input.trim()) return [];

  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
    `?input=${encodeURIComponent(input)}&key=${PLACES_API_KEY}`;

  const res  = await fetch(url);
  const json = await res.json();

  if (json.status !== 'OK') return [];

  return json.predictions.slice(0, 5).map((prediction: any) => ({
    placeId:     prediction.place_id,
    description: prediction.description,
  }));
}

export async function getPlaceCoordinates(placeId: string): Promise<Coordinates | null> {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json` +
    `?place_id=${placeId}&fields=geometry&key=${PLACES_API_KEY}`;

  const res  = await fetch(url);
  const json = await res.json();

  if (json.status !== 'OK') return null;

  const location = json.result?.geometry?.location;
  if (!location) return null;

  return { lat: location.lat, lng: location.lng };
}
