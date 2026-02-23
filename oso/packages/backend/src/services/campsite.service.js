import axios from "axios";
import NodeCache from "node-cache";

// Cache campsite data for 1 hour to reduce API calls
const cache = new NodeCache({ stdTTL: 3600 });

const NPS_BASE_URL = "https://developer.nps.gov/api/v1";

class CampsiteService {
  constructor() {
    this.npsApiKey = process.env.NPS_API_KEY;
  }

  /**
   * Search for parks in California
   * @param {Object} params - Search parameters
   * @param {string} params.state - State code (e.g., 'CA')
   * @param {string} params.query - Search query
   * @param {number} params.limit - Number of results
   * @returns {Array} Array of parks
   */
  async searchParks({ state = "CA", query = "", limit = 10 }) {
    try {
      const cacheKey = `parks_${state}_${query}_${limit}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log("Returning cached parks data");
        return cached;
      }

      const params = {
        stateCode: state,
        limit,
        api_key: this.npsApiKey,
      };

      if (query) {
        params.q = query;
      }

      const response = await axios.get(`${NPS_BASE_URL}/parks`, { params });
      const parks = response.data.data;

      cache.set(cacheKey, parks);
      return parks;
    } catch (error) {
      console.error("Error fetching parks:", error.message);
      throw new Error("Failed to fetch parks data");
    }
  }

  /**
   * Get detailed information about a specific park
   * @param {string} parkCode - NPS park code
   * @returns {Object} Park details
   */
  async getParkDetails(parkCode) {
    try {
      const cacheKey = `park_${parkCode}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${NPS_BASE_URL}/parks`, {
        params: {
          parkCode,
          api_key: this.npsApiKey,
        },
      });

      const parkDetails = response.data.data[0];
      cache.set(cacheKey, parkDetails);
      return parkDetails;
    } catch (error) {
      console.error("Error fetching park details:", error.message);
      throw new Error("Failed to fetch park details");
    }
  }

  /**
   * Get campgrounds for a specific park
   * @param {string} parkCode - NPS park code
   * @returns {Array} Array of campgrounds
   */
  async getCampgrounds(parkCode) {
    try {
      const cacheKey = `campgrounds_${parkCode}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${NPS_BASE_URL}/campgrounds`, {
        params: {
          parkCode,
          api_key: this.npsApiKey,
        },
      });

      const campgrounds = response.data.data;
      cache.set(cacheKey, campgrounds);
      return campgrounds;
    } catch (error) {
      console.error("Error fetching campgrounds:", error.message);
      throw new Error("Failed to fetch campgrounds");
    }
  }

  /**
   * Get activities available at parks
   * @returns {Array} Array of activities
   */
  async getActivities() {
    try {
      const cacheKey = "activities";
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${NPS_BASE_URL}/activities`, {
        params: {
          api_key: this.npsApiKey,
        },
      });

      const activities = response.data.data;
      cache.set(cacheKey, activities);
      return activities;
    } catch (error) {
      console.error("Error fetching activities:", error.message);
      throw new Error("Failed to fetch activities");
    }
  }

  /**
   * Search parks by activity
   * @param {string} activityId - Activity ID from NPS
   * @param {string} state - State code
   * @returns {Array} Array of parks with that activity
   */
  async searchByActivity(activityId, state = "CA") {
    try {
      const cacheKey = `parks_activity_${activityId}_${state}`;
      const cached = cache.get(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${NPS_BASE_URL}/activities/parks`, {
        params: {
          id: activityId,
          stateCode: state,
          api_key: this.npsApiKey,
        },
      });

      const parks = response.data.data[0]?.parks || [];
      cache.set(cacheKey, parks);
      return parks;
    } catch (error) {
      console.error("Error searching by activity:", error.message);
      throw new Error("Failed to search parks by activity");
    }
  }

  /**
   * Format campsite data for AI context
   * @param {Array} campsites - Array of campsite objects
   * @returns {string} Formatted string for AI
   */
  formatForAI(campsites) {
    if (!campsites || campsites.length === 0) {
      return "No campsites found matching the criteria.";
    }

    return campsites
      .map((site, index) => {
        return `
${index + 1}. ${site.name || site.fullName}
   - Location: ${site.states || "N/A"}
   - Description: ${site.description?.substring(0, 200)}...
   - Activities: ${site.activities?.map((a) => a.name).join(", ") || "N/A"}
   - Park Code: ${site.parkCode}
      `.trim();
      })
      .join("\n\n");
  }
}

export default new CampsiteService();
