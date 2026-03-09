import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  name: String,
  description: String,
  time: String,
  location: String,
  notes: String,
});

const gearItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: mongoose.Schema.Types.Mixed, default: 1 }, // Allow both Number and String
  category: String,
  assignedTo: String,
  purchased: { type: Boolean, default: false },
  purchaseUrl: String,
  notes: String, // Add notes field that AI is using
});

const foodItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  meal: String,
  day: Number,
  quantity: String, // Allow string quantities like "4 servings"
  assignedTo: String,
  purchased: { type: Boolean, default: false },
  notes: String, // Add notes field that AI might use
});

const itineraryDaySchema = new mongoose.Schema({
  day: Number,
  date: Date,
  activities: [activitySchema],
  notes: String,
});

const tripSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,

    campsite: {
      name: String,
      parkName: String,
      location: {
        state: String,
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
      reservationUrl: String,
      npsId: String,
      campsiteId: String,
      amenities: [String],
      siteType: String,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    owner: { type: String, required: true },
    collaborators: [{ type: String }],

    itinerary: [itineraryDaySchema],
    gearList: [gearItemSchema],
    foodList: [foodItemSchema],

    route: {
      startLocation: String,
      estimatedDriveTime: String,
      distance: String,
      waypoints: [String],
    },

    status: {
      type: String,
      enum: ["planning", "booked", "confirmed", "completed", "cancelled"],
      default: "planning",
    },

    chatSessionId: String,

    notes: String,
  },
  {
    timestamps: true,
  },
);

tripSchema.index({ owner: 1, createdAt: -1 });
tripSchema.index({ collaborators: 1 });
tripSchema.index({ "campsite.parkName": 1 });

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
