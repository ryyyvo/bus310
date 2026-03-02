// Chat message types
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  metadata?: {
    campsites?: any[];
    searchQuery?: string;
  };
}

// User preferences extracted from conversation
export interface ChatPreferences {
  states?: string[];
  activities?: string[];
  groupSize?: number;
  experienceLevel?: "beginner" | "intermediate" | "advanced";
  dates?: {
    startDate?: Date;
    endDate?: Date;
    flexible?: boolean;
  };
  budget?: "low" | "medium" | "high";
}

// User constraints from UI modal
export interface UserConstraints {
  startDate?: string;
  endDate?: string;
  partySize?: number;
  budgetMin?: number;
  budgetMax?: number;
  campingStyle?: string;
  amenities?: string[];
}

// Chat session
export interface ChatSession {
  _id: string;
  userId: string;
  sessionName?: string;
  messages: ChatMessage[];
  tripId?: string;
  preferences?: ChatPreferences;
  status: "active" | "converted" | "abandoned";
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response types
export interface CreateChatSessionRequest {
  userId: string;
}

export interface CreateChatSessionResponse {
  sessionId: string;
  messages: ChatMessage[];
}

export interface SendMessageRequest {
  message: string;
  constraints?: UserConstraints;
}

export interface SendMessageResponse {
  message: string;
  campsites: any[];
  preferences: ChatPreferences;
}

export interface GetChatSessionResponse {
  session: ChatSession;
}

export interface GetUserChatSessionsResponse {
  sessions: ChatSession[];
}

// AI Service types
export interface SearchParams {
  query: string;
  state: string;
  activities: string[];
}
