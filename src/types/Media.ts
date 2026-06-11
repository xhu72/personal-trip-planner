export type Media = {
  id:         string;
  tripId:     string;
  uri:        string;       
  isFavorite: boolean;
  addedAt:    string;      
}

export type NewMedia = Omit<Media, 'id'>;