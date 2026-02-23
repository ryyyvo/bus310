import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: String,
  description: String,
  time: String,
  location: String,
  notes: String
});

const gearItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  category: String, // e.g., 'shelter', 'cooking', 'clothing', 'safety'
  assignedTo: String, // user who's bringing it
  purchased: { type: Boolean, default: false },
  purchaseUrl: String
});

const foodItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  meal: String, // e.g., 'breakfast', 'lunch', 'dinner', 'snack'
  day: Number,
  assignedTo: String,
  purchased: { type: Boolean, default: false }
});

const itineraryDaySchema = new mongoose.Schema({
  day: Number,
  date: Date,
  activities: [activitySchema],
  notes: String
});

const tripSchema = new mongoose.Schema({
  // Basic trip info
  name: { type: String, required: true },
  description: String,

  // Campsite details
  campsite: {
    name: String,
    parkName: String,
    location: {
      state: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    reservationUrl: String,
    npsId: String, // National Parks Service ID
    campsiteId: String,
    amenities: [String],
    siteType: String // e.g., 'tent', 'RV', 'group'
  },

  // Trip dates
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  // Collaboration
  owner: { type: String, required: true }, // user ID or email for now
  collaborators: [{ type: String }], // array of user IDs or emails

  // Trip planning
  itinerary: [itineraryDaySchema],
  gearList: [gearItemSchema],
  foodList: [foodItemSchema],

  // Route planning
  route: {
    startLocation: String,
    estimatedDriveTime: String,
    distance: String,
    waypoints: [String]
  },

  // Status
  status: {
    type: String,
    enum: ['planning', 'booked', 'confirmed', 'completed', 'cancelled'],
    default: 'planning'
  },

  // Chat history (optional, for reference)
  chatSessionId: String,

  // Notes
  notes: String

}, {
  timestamps: true
});

// Indexes for efficient queries
tripSchema.index({ owner: 1, createdAt: -1 });
tripSchema.index({ collaborators: 1 });
tripSchema.index({ 'campsite.parkName': 1 });

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
