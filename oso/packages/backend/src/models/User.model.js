import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },

  // User preferences
  preferences: {
    favoriteParks: [String],
    preferredActivities: [String],
    experienceLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    homeLocation: {
      city: String,
      state: String
    }
  },

  // Saved trips
  savedTrips: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  }],

  // Account status
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

export default User;
