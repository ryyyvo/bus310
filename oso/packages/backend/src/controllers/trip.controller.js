import Trip from '../models/Trip.model.js';
import ChatSession from '../models/ChatSession.model.js';

/**
 * Create a new trip
 */
export const createTrip = async (req, res) => {
  try {
    const { chatSessionId, ...tripData } = req.body;

    // Validate required fields
    if (!tripData.name || !tripData.owner || !tripData.startDate || !tripData.endDate) {
      return res.status(400).json({
        error: 'Missing required fields: name, owner, startDate, endDate'
      });
    }

    const trip = new Trip({
      ...tripData,
      chatSessionId,
      status: 'planning'
    });

    await trip.save();

    // Update chat session if provided
    if (chatSessionId) {
      await ChatSession.findByIdAndUpdate(chatSessionId, {
        tripId: trip._id,
        status: 'converted'
      });
    }

    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

/**
 * Get trip by ID
 */
export const getTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
};

/**
 * Get all trips for a user
 */
export const getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;

    const trips = await Trip.find({
      $or: [
        { owner: userId },
        { collaborators: userId }
      ]
    }).sort({ updatedAt: -1 });

    res.json({
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

/**
 * Update trip
 */
export const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const updates = req.body;

    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
};

/**
 * Delete trip
 */
export const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findByIdAndDelete(tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
};

/**
 * Add collaborator to trip
 */
export const addCollaborator = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { collaboratorId } = req.body;

    if (!collaboratorId) {
      return res.status(400).json({ error: 'collaboratorId is required' });
    }

    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $addToSet: { collaborators: collaboratorId } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
};

/**
 * Update gear list
 */
export const updateGearList = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { gearList } = req.body;

    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: { gearList } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error updating gear list:', error);
    res.status(500).json({ error: 'Failed to update gear list' });
  }
};

/**
 * Update food list
 */
export const updateFoodList = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { foodList } = req.body;

    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: { foodList } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error updating food list:', error);
    res.status(500).json({ error: 'Failed to update food list' });
  }
};

/**
 * Update itinerary
 */
export const updateItinerary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { itinerary } = req.body;

    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $set: { itinerary } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error updating itinerary:', error);
    res.status(500).json({ error: 'Failed to update itinerary' });
  }
};
