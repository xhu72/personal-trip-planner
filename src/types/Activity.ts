export type ActivityCategory = 'Food' | 'Transport' | 'Accommodation' | 'Attraction';

export type BookingDetails = {
  confirmationNo?: string;
  providerName?:   string;
  providerUrl?:    string;
  bookedAt?:       string;   // ISO string
}

export type Activity = {
  id:             string;
  tripId:         string;
  title:          string;
  location:       string;
  date:           string;    // "YYYY-MM-DD"
  time:           string;    // "HH:MM"  e.g. "09:30"
  duration:       number;    // minutes  e.g. 90
  category:       ActivityCategory;
  isBooked:       boolean;
  bookingDetails: BookingDetails;
  createdAt:      string;    // ISO string
}

export type NewActivity = Omit<Activity, 'id' | 'createdAt'>;