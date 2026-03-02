// Park and campground types
export interface Activity {
  id: string;
  name: string;
}

export interface Park {
  id: string;
  name?: string;
  fullName: string;
  parkCode: string;
  description: string;
  states: string;
  latitude?: string;
  longitude?: string;
  activities?: Activity[];
  entranceFees?: any[];
  directionsInfo?: string;
  directionsUrl?: string;
  url?: string;
  weatherInfo?: string;
  [key: string]: any;
}

export interface Campground {
  id: string;
  name: string;
  parkCode: string;
  description: string;
  latitude?: string;
  longitude?: string;
  audioDescription?: string;
  isPassportStampLocation?: string;
  passportStampLocationDescription?: string;
  passportStampImages?: any[];
  reservationInfo?: string;
  reservationUrl?: string;
  regulationsOverview?: string;
  amenities?: any;
  contacts?: any;
  fees?: any[];
  directionsOverview?: string;
  directionsUrl?: string;
  [key: string]: any;
}

export interface ActivityType {
  id: string;
  name: string;
}

// Service method parameters
export interface SearchParksParams {
  state?: string;
  query?: string;
  limit?: number;
}

// API Request/Response types
export interface SearchParksQuery {
  state?: string;
  query?: string;
  limit?: string;
}

export interface SearchParksResponse {
  count: number;
  parks: Park[];
}

export interface GetParkDetailsResponse {
  park: Park;
}

export interface GetCampgroundsResponse {
  count: number;
  campgrounds: Campground[];
}

export interface GetActivitiesResponse {
  count: number;
  activities: ActivityType[];
}

export interface SearchByActivityQuery {
  state?: string;
}

export interface SearchByActivityResponse {
  count: number;
  parks: Park[];
}
