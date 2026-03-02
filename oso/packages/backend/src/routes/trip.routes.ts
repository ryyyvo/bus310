import express from "express";
import {
  createTrip,
  getTrip,
  getUserTrips,
  updateTrip,
  deleteTrip,
  addCollaborator,
  updateGearList,
  updateFoodList,
  updateItinerary,
} from "../controllers/trip.controller.js";

const router = express.Router();

// Create trip
router.post("/", createTrip);

// Get trip by ID
router.get("/:tripId", getTrip);

// Get user's trips
router.get("/users/:userId", getUserTrips);

// Update trip
router.put("/:tripId", updateTrip);

// Delete trip
router.delete("/:tripId", deleteTrip);

// Add collaborator
router.post("/:tripId/collaborators", addCollaborator);

// Update specific trip components
router.put("/:tripId/gear", updateGearList);
router.put("/:tripId/food", updateFoodList);
router.put("/:tripId/itinerary", updateItinerary);

export default router;
