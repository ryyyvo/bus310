// Trip component types
export interface ActivityItem {
  name: string;
  description?: string;
  time?: string;
  location?: string;
  notes?: string;
}

export interface GearItem {
  item: string;
  quantity?: number | string; // Allow both number and string for flexibility
  category?: string;
  assignedTo?: string;
  purchased?: boolean;
  purchaseUrl?: string;
  notes?: string;
}

export interface FoodItem {
  item: string;
  meal?: string;
  day?: number;
  quantity?: string;
  assignedTo?: string;
  purchased?: boolean;
  notes?: string;
}

export interface ItineraryDay {
  day: number;
  date?: Date;
  activities?: ActivityItem[];
  notes?: string;
}

export interface CampsiteInfo {
  name?: string;
  parkName?: string;
  location?: {
    state?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  reservationUrl?: string;
  npsId?: string;
  campsiteId?: string;
  amenities?: string[];
  siteType?: string;
}

export interface RouteInfo {
  startLocation?: string;
  estimatedDriveTime?: string;
  distance?: string;
  waypoints?: string[];
}

// Trip entity
export interface Trip {
  _id: string;
  name: string;
  description?: string;
  campsite?: CampsiteInfo;
  startDate: Date;
  endDate: Date;
  owner: string;
  collaborators?: string[];
  itinerary?: ItineraryDay[];
  gearList?: GearItem[];
  foodList?: FoodItem[];
  route?: RouteInfo;
  status: "planning" | "booked" | "confirmed" | "completed" | "cancelled";
  chatSessionId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface CreateTripRequest {
  name: string;
  description?: string;
  campsite?: CampsiteInfo;
  startDate: string | Date;
  endDate: string | Date;
  owner: string;
  collaborators?: string[];
  itinerary?: ItineraryDay[];
  gearList?: GearItem[];
  foodList?: FoodItem[];
  route?: RouteInfo;
  status?: "planning" | "booked" | "confirmed" | "completed" | "cancelled";
  chatSessionId?: string;
  notes?: string;
}

export interface CreateTripResponse {
  trip: Trip;
}

export interface GetTripResponse {
  trip: Trip;
}

export interface GetUserTripsResponse {
  count: number;
  trips: Trip[];
}

export interface UpdateTripRequest {
  name?: string;
  description?: string;
  campsite?: CampsiteInfo;
  startDate?: string | Date;
  endDate?: string | Date;
  collaborators?: string[];
  itinerary?: ItineraryDay[];
  gearList?: GearItem[];
  foodList?: FoodItem[];
  route?: RouteInfo;
  status?: "planning" | "booked" | "confirmed" | "completed" | "cancelled";
  notes?: string;
}

export interface UpdateTripResponse {
  trip: Trip;
}

export interface DeleteTripResponse {
  message: string;
}

export interface AddCollaboratorRequest {
  collaboratorId: string;
}

export interface AddCollaboratorResponse {
  trip: Trip;
}

export interface UpdateGearListRequest {
  gearList: GearItem[];
}

export interface UpdateGearListResponse {
  trip: Trip;
}

export interface UpdateFoodListRequest {
  foodList: FoodItem[];
}

export interface UpdateFoodListResponse {
  trip: Trip;
}

export interface UpdateItineraryRequest {
  itinerary: ItineraryDay[];
}

export interface UpdateItineraryResponse {
  trip: Trip;
}

// AI Generation types
export interface GenerateMealPlanRequest {
  numberOfDays: number;
  numberOfPeople: number;
  dietaryRestrictions?: string[];
  preferences?: string[];
}

export interface GenerateMealPlanResponse {
  mealPlan: FoodItem[];
}

export interface GenerateGearListRequest {
  numberOfDays: number;
  numberOfPeople: number;
  campingStyle?: string;
  weather?: string;
  activities?: string[];
}

export interface GenerateGearListResponse {
  gearList: GearItem[];
}
