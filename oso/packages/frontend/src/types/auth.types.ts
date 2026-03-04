// User types
export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    favoriteParks: string[];
    preferredActivities: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    homeLocation: {
      city?: string;
      state?: string;
    };
  };
  savedTrips?: string[];
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

// Request types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  preferences?: Partial<User['preferences']>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Response types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ProfileResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}
