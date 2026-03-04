# Authentication System Documentation

## Overview

This document describes the authentication and user state management system implemented in the OSO camping application. The system uses JWT (JSON Web Tokens) for stateless authentication with bcrypt for password hashing.

## Architecture

### Backend Components

#### 1. User Model (`/packages/backend/src/models/User.model.ts`)

**Schema:**
```typescript
interface IUser {
  email: string;              // Unique, lowercase, trimmed
  name: string;               // User's display name
  password: string;           // Hashed with bcrypt (min 6 chars)
  preferences: {
    favoriteParks: string[];
    preferredActivities: string[];
    experienceLevel: "beginner" | "intermediate" | "advanced";
    homeLocation: {
      city?: string;
      state?: string;
    };
  };
  savedTrips: ObjectId[];     // References to Trip documents
  isActive: boolean;          // Account status (default: true)
  lastLogin?: Date;           // Last successful login timestamp
  createdAt: Date;            // Auto-generated
  updatedAt: Date;            // Auto-generated
}
```

**Key Features:**
- Password is never returned in queries by default (`select: false`)
- Password is automatically hashed before saving using bcrypt (10 salt rounds)
- Includes `comparePassword(candidatePassword: string): Promise<boolean>` method

#### 2. Authentication Controller (`/packages/backend/src/controllers/auth.controller.ts`)

**Endpoints:**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Authenticate user | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/password` | Change password | Yes |

#### 3. Authentication Middleware (`/packages/backend/src/config/auth.middleware.ts`)

**`authenticate` Middleware:**
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token signature and expiration
- Attaches `userId` to request object
- Returns 401 for invalid/missing/expired tokens

**`optionalAuth` Middleware:**
- Same as `authenticate` but doesn't fail on missing/invalid tokens
- Useful for endpoints that work with or without authentication

## API Reference

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "preferences": {
      "favoriteParks": [],
      "preferredActivities": [],
      "experienceLevel": "beginner",
      "homeLocation": {}
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Missing required fields or invalid data
- `400`: User already exists
- `500`: Server error

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "preferences": { ... },
    "lastLogin": "2024-01-15T14:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Missing email or password
- `401`: Invalid credentials or account deactivated
- `500`: Server error

### 3. Get User Profile

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "preferences": { ... },
    "savedTrips": [...],
    "lastLogin": "2024-01-15T14:30:00.000Z",
    "createdAt": "2024-01-10T08:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: No token, invalid token, or expired token
- `404`: User not found
- `500`: Server error

### 4. Update User Profile

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "preferences": {
    "favoriteParks": ["Yosemite", "Yellowstone"],
    "preferredActivities": ["hiking", "camping"],
    "experienceLevel": "intermediate",
    "homeLocation": {
      "city": "San Francisco",
      "state": "CA"
    }
  }
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "Jane Doe",
    "preferences": { ... }
  }
}
```

**Error Responses:**
- `401`: Authentication error
- `404`: User not found
- `500`: Server error

### 5. Change Password

**Endpoint:** `PUT /api/auth/password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newsecurepassword456"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400`: Missing passwords or new password too short
- `401`: Current password incorrect or authentication error
- `404`: User not found
- `500`: Server error

## Frontend Integration Pattern

### 1. Store Authentication Token

After successful login/register, store the JWT token:

```javascript
// Store in localStorage (or use a more secure approach)
localStorage.setItem('authToken', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### 2. Include Token in API Requests

Add the token to all authenticated requests:

```javascript
const token = localStorage.getItem('authToken');

fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Handle Token Expiration

Detect expired tokens and redirect to login:

```javascript
if (response.status === 401) {
  // Token expired or invalid
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  // Redirect to login page
  window.location.href = '/login';
}
```

### 4. State Management Pattern

**Recommended approach using React Context:**

```javascript
// AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token and fetch user profile
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('authToken', data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Security Considerations

### Backend

1. **Password Security:**
   - Minimum 6 characters enforced
   - Hashed with bcrypt (10 salt rounds)
   - Never returned in API responses

2. **JWT Security:**
   - Tokens expire after 7 days
   - Use strong secret key in production (`JWT_SECRET` env variable)
   - Tokens are stateless (no server-side session storage)

3. **Email Validation:**
   - Emails are lowercased and trimmed
   - Unique constraint enforced at database level

4. **Account Status:**
   - `isActive` flag allows disabling accounts without deletion
   - Inactive users cannot login

### Frontend

1. **Token Storage:**
   - Consider using httpOnly cookies instead of localStorage for better XSS protection
   - Clear tokens on logout

2. **HTTPS Required:**
   - Always use HTTPS in production to protect tokens in transit

3. **Token Refresh:**
   - Current implementation uses 7-day expiration
   - Consider implementing refresh tokens for better security

## Environment Variables

Required environment variables in `/packages/backend/.env`:

```bash
# JWT Secret (MUST be changed in production)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/oso

# Server Configuration
PORT=3001
NODE_ENV=development
UI_URL=http://localhost:5173
```

## Testing the API

### Using curl:

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile (replace TOKEN)
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Future Enhancements

1. **Email Verification:**
   - Add email verification flow for new registrations
   - Add `emailVerified` boolean to User model

2. **Password Reset:**
   - Implement forgot password flow
   - Generate temporary reset tokens

3. **Refresh Tokens:**
   - Implement refresh token mechanism
   - Short-lived access tokens with longer-lived refresh tokens

4. **OAuth Integration:**
   - Add social login (Google, GitHub, etc.)

5. **Session Management:**
   - Add ability to view and revoke active sessions
   - Implement token blacklist for logout

6. **Rate Limiting:**
   - Add rate limiting to prevent brute force attacks
   - Implement account lockout after failed attempts

7. **Two-Factor Authentication:**
   - Add optional 2FA support
   - SMS or authenticator app integration
