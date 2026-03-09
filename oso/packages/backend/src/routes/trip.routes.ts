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
  generateMealPlan,
  generateGearList,
} from "../controllers/trip.controller.js";
import { authenticate } from "../config/auth.middleware.js";

const router = express.Router();

// All trip routes require authentication
router.use(authenticate);

// Create trip
router.post("/", createTrip);

// Get user's trips
router.get("/", getUserTrips);

// Get trip by ID
router.get("/:tripId", getTrip);

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

// AI generation endpoints
router.post("/generate/meal-plan", generateMealPlan);
router.post("/generate/gear-list", generateGearList);

export default router;
