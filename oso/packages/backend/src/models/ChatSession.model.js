import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    campsites: [mongoose.Schema.Types.Mixed],
    searchQuery: String,
  },
});

const chatSessionSchema = new mongoose.Schema(
  {
    // Session info
    userId: { type: String, required: true }, // user ID or temporary session ID
    sessionName: String,

    // Chat messages
    messages: [messageSchema],

    // Current trip being planned (if created)
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },

    // User preferences extracted from chat
    preferences: {
      states: [String],
      activities: [String],
      groupSize: Number,
      experienceLevel: String,
      dates: {
        startDate: Date,
        endDate: Date,
        flexible: Boolean,
      },
      budget: String,
    },

    // Session status
    status: {
      type: String,
      enum: ["active", "converted", "abandoned"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ status: 1 });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);

export default ChatSession;
