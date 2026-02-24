# Camping Trip Planner - Backend API

Express.js backend for the camping trip planning application, featuring AI-powered chat assistance and integration with National Parks Service API.

## Architecture Overview

The backend uses a **Retrieval-Augmented Generation (RAG)** pattern to combine:

- Real-time campsite data from National Parks Service API
- AI-powered conversational interface (Groq with Llama 4 Maverick)
- MongoDB for storing trips, user data, and chat history

### Data Flow

```
UI Modal (constraints) → User Query → AI generates search params →
Fetch campsites from NPS API → Format context with constraints →
AI generates response with real data → Store in MongoDB
```

### RAG System Prompt Structure

The system follows **best RAG practices** with optimal prompt ordering:

```
[1. Role & Instructions]
You are a RAG assistant that helps users find their ideal campsite...

[2. User Constraints - from UI modal]
Known user constraints:
- Dates: 2026-06-10 to 2026-06-15
- Party size: 4
- Budget: $40–$80 per night

[3. Retrieved Data - closest to conversation]
## Available Campsites (From API)
1. Yosemite National Park...
2. Joshua Tree...
```

**Why this order?**

- System instructions establish role and behavior
- Constraints tell the AI what to filter for
- Retrieved data is last to leverage LLM "recency bias" (more attention to recent context)

## Tech Stack

- **Node.js** + **Express** - Server framework
- **MongoDB** + **Mongoose** - Database
- **Groq API** (groq-sdk) - AI chat with meta-llama/llama-4-maverick-17b-128e-instruct
- **National Parks Service API** - Campsite data
- **node-cache** - In-memory caching for API responses

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Entry point
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── models/
│   │   ├── Trip.model.js      # Trip schema
│   │   ├── ChatSession.model.js
│   │   └── User.model.js
│   ├── services/
│   │   ├── ai.service.js      # Groq AI integration (Llama 4)
│   │   └── campsite.service.js # NPS API integration
│   ├── controllers/
│   │   ├── chat.controller.js
│   │   ├── campsite.controller.js
│   │   └── trip.controller.js
│   └── routes/
│       ├── chat.routes.js
│       ├── campsite.routes.js
│       └── trip.routes.js
├── package.json
└── .env
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Get API Keys

#### Groq API Key

1. Go to https://console.groq.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key

#### National Parks Service API Key

1. Go to https://www.nps.gov/subjects/developer/get-started.htm
2. Click "Get an API Key"
3. Fill out the form
4. Check your email for the API key

### 3. Set Up MongoDB

**Option A: Local MongoDB**

```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string (looks like `mongodb+srv://...`)

### 4. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/camping_planner
# or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/camping_planner

# Groq API (Llama 4 Maverick)
GROQ_API_KEY=your-groq-api-key-here

# National Parks Service API
NPS_API_KEY=your-nps-key-here
```

### 5. Start the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server will start on http://localhost:3001

## API Documentation

### Chat Endpoints

#### Create Chat Session

```http
POST /api/chat/sessions
Content-Type: application/json

{
  "userId": "user123"
}
```

**Response:**

```json
{
  "sessionId": "65f1a2b3c4d5e6f7g8h9i0j1",
  "messages": [
    {
      "role": "assistant",
      "content": "Hi! I'm here to help you plan an amazing camping trip..."
    }
  ]
}
```

#### Send Message

```http
POST /api/chat/sessions/:sessionId/messages
Content-Type: application/json

{
  "message": "I want to go camping near Yosemite with 4 friends for 3 days",
  "constraints": {
    "startDate": "2026-06-10",
    "endDate": "2026-06-15",
    "partySize": 4,
    "budgetMin": 40,
    "budgetMax": 80,
    "campingStyle": "car camping",
    "amenities": ["bathrooms", "water"]
  }
}
```

**Constraints Object (all fields optional):**

- `startDate` (string, ISO-8601): Trip start date
- `endDate` (string, ISO-8601): Trip end date
- `partySize` (number): Number of people
- `budgetMin` (number): Minimum budget per night
- `budgetMax` (number): Maximum budget per night
- `campingStyle` (string): e.g., "car camping", "backpacking", "RV"
- `amenities` (array): Required amenities

**Response:**

```json
{
  "message": "Great choice! Yosemite is perfect for...",
  "campsites": [...],
  "preferences": {
    "groupSize": 5,
    "states": ["California"]
  }
}
```

#### Get Chat Session

```http
GET /api/chat/sessions/:sessionId
```

#### Get User's Chat Sessions

```http
GET /api/chat/users/:userId/sessions
```

### Campsite Endpoints

#### Search Parks

```http
GET /api/campsites/parks?state=CA&query=yosemite&limit=10
```

**Response:**

```json
{
  "count": 5,
  "parks": [
    {
      "fullName": "Yosemite National Park",
      "description": "...",
      "states": "CA",
      "parkCode": "yose",
      "activities": [...]
    }
  ]
}
```

#### Get Park Details

```http
GET /api/campsites/parks/:parkCode
```

#### Get Campgrounds

```http
GET /api/campsites/parks/:parkCode/campgrounds
```

#### Get Activities

```http
GET /api/campsites/activities
```

#### Search Parks by Activity

```http
GET /api/campsites/activities/:activityId/parks?state=CA
```

### Trip Endpoints

#### Create Trip

```http
POST /api/trips
Content-Type: application/json

{
  "name": "Yosemite Adventure",
  "owner": "user123",
  "startDate": "2024-06-15",
  "endDate": "2024-06-17",
  "campsite": {
    "name": "Upper Pines Campground",
    "parkName": "Yosemite National Park",
    "parkCode": "yose"
  },
  "chatSessionId": "65f1a2b3c4d5e6f7g8h9i0j1"
}
```

#### Get Trip

```http
GET /api/trips/:tripId
```

#### Get User's Trips

```http
GET /api/trips/users/:userId
```

#### Update Trip

```http
PUT /api/trips/:tripId
Content-Type: application/json

{
  "status": "booked",
  "notes": "Reserved sites 45-47"
}
```

#### Delete Trip

```http
DELETE /api/trips/:tripId
```

#### Add Collaborator

```http
POST /api/trips/:tripId/collaborators
Content-Type: application/json

{
  "collaboratorId": "user456"
}
```

#### Update Gear List

```http
PUT /api/trips/:tripId/gear
Content-Type: application/json

{
  "gearList": [
    {
      "item": "Tent (4-person)",
      "quantity": 2,
      "category": "shelter",
      "assignedTo": "user123"
    },
    {
      "item": "Sleeping bags",
      "quantity": 5,
      "category": "sleeping"
    }
  ]
}
```

#### Update Food List

```http
PUT /api/trips/:tripId/food
Content-Type: application/json

{
  "foodList": [
    {
      "item": "Pancake mix",
      "meal": "breakfast",
      "day": 1,
      "assignedTo": "user123"
    }
  ]
}
```

#### Update Itinerary

```http
PUT /api/trips/:tripId/itinerary
Content-Type: application/json

{
  "itinerary": [
    {
      "day": 1,
      "date": "2024-06-15",
      "activities": [
        {
          "name": "Hike to Vernal Fall",
          "time": "9:00 AM",
          "notes": "Moderate difficulty, 5.4 miles round trip"
        }
      ]
    }
  ]
}
```

### Health Check

```http
GET /api/health
```

## How It Works: AI + Campsite Data Integration

### Message Flow with Constraints

1. **User sets constraints** in UI modal (dates, party size, budget)
2. **User sends a message** via the chat interface with constraints attached
3. **AI analyzes message** to extract search parameters (location, activities, etc.)
4. **Backend fetches campsite data** from National Parks Service API
5. **System prompt is built** in optimal order:
   - Role instructions
   - User constraints (from modal)
   - Retrieved campsite data
6. **AI generates response** using real campsite information + constraints
7. **Response is sent** to user with campsite recommendations
8. **Session is stored** in MongoDB for persistence

### RAG Implementation Details

**Location:** `src/services/ai.service.js`

The `formatConstraints()` method formats user constraints into the system prompt:

```javascript
// Example output when constraints are provided:
Known user constraints:
- Dates: 2026-06-10 to 2026-06-15
- Party size: 4
- Budget: $40–$80 per night
- Camping style: car camping
- Required amenities: bathrooms, water
```

The `chat()` method accepts three parameters:

- `messages`: Chat history
- `campsiteContext`: Formatted campsite data from NPS API
- `constraints`: User constraints object (optional)

This RAG approach ensures:

- ✅ Accurate, up-to-date campsite information
- ✅ Natural conversational interface
- ✅ Personalized recommendations based on constraints
- ✅ No hallucinated campsite data
- ✅ Optimal prompt structure for LLM performance

## Frontend Integration

### Sending Messages with Constraints

When integrating with your React frontend, send constraints from the UI modal along with each message:

```javascript
// React example
const sendMessage = async (message, constraints) => {
  const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      constraints: {
        startDate: constraints.startDate,
        endDate: constraints.endDate,
        partySize: constraints.partySize,
        budgetMin: constraints.budgetMin,
        budgetMax: constraints.budgetMax,
        campingStyle: constraints.campingStyle,
        amenities: constraints.amenities,
      },
    }),
  });

  return response.json();
};
```

### UI Modal → Backend Flow

1. User opens constraints modal in React
2. User sets dates, party size, budget, etc.
3. User sends chat message
4. Frontend includes constraints object in POST request
5. Backend formats constraints into system prompt
6. AI uses constraints to filter and recommend campsites

### Storing Constraints in Chat Session

Constraints are session-level (not message-level), so you can:

- Store them in React state
- Send them with every message in the session
- Update them when user modifies the modal

## Development Tips

### Testing the Chat Flow

Use curl or Postman to test the chat:

```bash
# 1. Create session
curl -X POST http://localhost:3001/api/chat/sessions \
  -H "Content-Type: application/json" \
  -d '{"userId": "test123"}'

# 2. Send message without constraints
curl -X POST http://localhost:3001/api/chat/sessions/SESSION_ID/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to camp near Yosemite for 3 days"}'

# 3. Send message WITH constraints (as from UI modal)
curl -X POST http://localhost:3001/api/chat/sessions/SESSION_ID/messages \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I want to camp near Yosemite",
    "constraints": {
      "startDate": "2026-06-10",
      "endDate": "2026-06-15",
      "partySize": 4,
      "budgetMin": 40,
      "budgetMax": 80
    }
  }'
```

### Monitoring Logs

The server logs important events:

- MongoDB connection status
- API requests to NPS
- AI service calls
- Cache hits/misses

### Caching

Campsite data is cached for 1 hour to reduce API calls. Clear cache by restarting the server.

## Implementation Status

### ✅ Completed

- [x] Express server with MongoDB integration
- [x] RAG pattern with Groq AI (Llama 4 Maverick)
- [x] National Parks Service API integration with caching
- [x] User constraints support (dates, party size, budget, etc.)
- [x] Optimal system prompt structure (Role → Constraints → Data)
- [x] Chat session management
- [x] Trip CRUD operations with collaboration support
- [x] Gear, food, and itinerary planning
- [x] Campsite search and filtering

### Next Steps

- [ ] Connect frontend React app to backend API
- [ ] Add user authentication (JWT or session-based)
- [ ] Implement WebSocket for real-time collaboration
- [ ] Add email notifications for trip updates
- [ ] Integrate weather API for trip planning
- [ ] Add California State Parks API integration
- [ ] Implement rate limiting and request validation
- [ ] Add unit and integration tests
- [ ] Store constraints in ChatSession model for persistence
- [ ] Add constraint validation in controller

## Key Implementation Notes

### RAG Architecture Decisions

**Why we put constraints in the system prompt:**

- Constraints are session-level (dates, budget, party size don't change per message)
- System prompt stays consistent across the conversation
- Better than putting in user message since constraints aren't part of the query

**Why retrieved data goes last in system prompt:**

- LLMs exhibit "recency bias" - more attention to recent context
- Campsite data is most relevant to the current query
- Follows RAG best practices

**Prompt structure we implemented:**

```
## Role
You are a RAG assistant...

## Known User Constraints
- Dates: 2026-06-10 to 2026-06-15
- Party size: 4

## Available Campsites (From API)
1. Yosemite National Park...
```

### File Locations Reference

- **AI Service:** `src/services/ai.service.js`
  - `formatConstraints()` - Formats constraints for prompt
  - `chat()` - Main RAG function with constraints support
  - `generateSearchParams()` - Extract search terms from message
  - `extractPreferences()` - Parse user preferences

- **Campsite Service:** `src/services/campsite.service.js`
  - `searchParks()` - Query NPS API
  - `formatForAI()` - Format campsite data for system prompt

- **Chat Controller:** `src/controllers/chat.controller.js`
  - `sendMessage()` - Accepts constraints from request body
  - Passes constraints to `aiService.chat()`

### Constraints Object Schema

```typescript
interface Constraints {
  startDate?: string; // ISO-8601 format
  endDate?: string; // ISO-8601 format
  partySize?: number;
  budgetMin?: number;
  budgetMax?: number;
  campingStyle?: string; // "car camping", "backpacking", "RV"
  amenities?: string[]; // ["bathrooms", "water", "showers"]
}
```

## Troubleshooting

**MongoDB connection error:**

- Ensure MongoDB is running: `brew services list`
- Check MONGODB_URI in `.env`

**Groq API error:**

- Verify API key is correct in `.env`
- Check API quota and rate limits at https://console.groq.com/

**National Parks API error:**

- Verify API key is valid
- Check rate limits (default: 1000 requests/hour)
