import campsiteService from '../services/campsite.service.js';

/**
 * Search for parks
 */
export const searchParks = async (req, res) => {
  try {
    const { state = 'CA', query = '', limit = 10 } = req.query;

    const parks = await campsiteService.searchParks({
      state,
      query,
      limit: parseInt(limit)
    });

    res.json({
      count: parks.length,
      parks
    });
  } catch (error) {
    console.error('Error searching parks:', error);
    res.status(500).json({ error: 'Failed to search parks' });
  }
};

/**
 * Get park details
 */
export const getParkDetails = async (req, res) => {
  try {
    const { parkCode } = req.params;

    const park = await campsiteService.getParkDetails(parkCode);

    if (!park) {
      return res.status(404).json({ error: 'Park not found' });
    }

    res.json(park);
  } catch (error) {
    console.error('Error fetching park details:', error);
    res.status(500).json({ error: 'Failed to fetch park details' });
  }
};

/**
 * Get campgrounds for a park
 */
export const getCampgrounds = async (req, res) => {
  try {
    const { parkCode } = req.params;

    const campgrounds = await campsiteService.getCampgrounds(parkCode);

    res.json({
      count: campgrounds.length,
      campgrounds
    });
  } catch (error) {
    console.error('Error fetching campgrounds:', error);
    res.status(500).json({ error: 'Failed to fetch campgrounds' });
  }
};

/**
 * Get all available activities
 */
export const getActivities = async (req, res) => {
  try {
    const activities = await campsiteService.getActivities();

    res.json({
      count: activities.length,
      activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

/**
 * Search parks by activity
 */
export const searchByActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { state = 'CA' } = req.query;

    const parks = await campsiteService.searchByActivity(activityId, state);

    res.json({
      count: parks.length,
      parks
    });
  } catch (error) {
    console.error('Error searching by activity:', error);
    res.status(500).json({ error: 'Failed to search parks by activity' });
  }
};
