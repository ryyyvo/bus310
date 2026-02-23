import express from 'express';
import {
  searchParks,
  getParkDetails,
  getCampgrounds,
  getActivities,
  searchByActivity
} from '../controllers/campsite.controller.js';

const router = express.Router();

// Search parks
router.get('/parks', searchParks);

// Get park details
router.get('/parks/:parkCode', getParkDetails);

// Get campgrounds for a park
router.get('/parks/:parkCode/campgrounds', getCampgrounds);

// Get all activities
router.get('/activities', getActivities);

// Search parks by activity
router.get('/activities/:activityId/parks', searchByActivity);

export default router;
