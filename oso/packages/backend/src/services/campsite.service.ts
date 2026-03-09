import axios from "axios";
import NodeCache from "node-cache";
import type { SearchParksParams, Park, Campground, ActivityType } from "../types/index.js";

// Cache campsite data for 1 hour to reduce API calls
const cache = new NodeCache({ stdTTL: 3600 });

const NPS_BASE_URL = "https://developer.nps.gov/api/v1";

class CampsiteService {
  private npsApiKey: string | undefined;

  constructor() {
    this.npsApiKey = process.env.NPS_API_KEY;
  }

  /**
   * Search for parks in California
   */
  async searchParks({ state = "CA", query = "", limit = 10 }: SearchParksParams): Promise<Park[]> {
    try {
      const cacheKey = `parks_${state}_${query}_${limit}`;
      const cached = cache.get<Park[]>(cacheKey);
      if (cached) {
        console.log("Returning cached parks data");
        return cached;
      }

      const params: Record<string, any> = {
        stateCode: state,
        limit,
        api_key: this.npsApiKey,
      };

      if (query) {
        params.q = query;
      }

      const response = await axios.get(`${NPS_BASE_URL}/parks`, { params });
      const parks: Park[] = response.data.data;

      cache.set(cacheKey, parks);
      return parks;
    } catch (error) {
      const err = error as Error;
      console.error("Error fetching parks:", err.message);
      throw new Error("Failed to fetch parks data");
    }
  }

  /**
   * Get detailed information about a specific park
   */
  async getParkDetails(parkCode: string): Promise<Park> {
    try {
      const cacheKey = `park_${parkCode}`;
      const cached = cache.get<Park>(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${NPS_BASE_URL}/parks`, {
        params: {
          parkCode,
          api_key: this.npsApiKey,
        },
      });

      const parkDetails: Park = response.data.data[0];
      cache.set(cacheKey, parkDetails);
      return parkDetails;
    } catch (error) {
      const err = error as Error;
      console.error("Error fetching park details:", err.message);
      throw new Error("Failed to fetch park details");
    }
  }

  /**
   * Get campgrounds for a specific park
   */
  async getCampgrounds(parkCode: string): Promise<Campground[]> {
    try {
      const cacheKey = `campgrounds_${parkCode}`;
      const cached = cache.get<Campground[]>(cacheKey);
      if (cached) {
        console.log(`Returning cached campgrounds for ${parkCode}`);
        return cached;
      }

      console.log(`Fetching campgrounds for parkCode: ${parkCode}`);
      const response = await axios.get(`${NPS_BASE_URL}/campgrounds`, {
        params: {
          parkCode,
          api_key: this.npsApiKey,
        },
      });

      console.log(`NPS API Response for ${parkCode}:`, {
        total: response.data.total,
        count: response.data.data?.length || 0,
        limit: response.data.limit,
      });

      const campgrounds: Campground[] = response.data.data || [];

      // Even if empty, cache it to avoid repeated API calls
      cache.set(cacheKey, campgrounds);

      if (campgrounds.length === 0) {
        console.log(`No campgrounds found in NPS API for parkCode: ${parkCode}`);
      }

      return campgrounds;
    } catch (error) {
      const err = error as any;
      console.error("Error fetching campgrounds:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        parkCode,
      });
      throw new Error("Failed to fetch campgrounds");
    }
  }

  /**
   * Get activities available at parks
   */
  async getActivities(): Promise<ActivityType[]> {
    try {
      const cacheKey = "activities";
      const cached = cache.get<ActivityType[]>(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${NPS_BASE_URL}/activities`, {
        params: {
          api_key: this.npsApiKey,
        },
      });

      const activities: ActivityType[] = response.data.data;
      cache.set(cacheKey, activities);
      return activities;
    } catch (error) {
      const err = error as Error;
      console.error("Error fetching activities:", err.message);
      throw new Error("Failed to fetch activities");
    }
  }

  /**
   * Search parks by activity
   */
  async searchByActivity(activityId: string, state: string = "CA"): Promise<Park[]> {
    try {
      const cacheKey = `parks_activity_${activityId}_${state}`;
      const cached = cache.get<Park[]>(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${NPS_BASE_URL}/activities/parks`, {
        params: {
          id: activityId,
          stateCode: state,
          api_key: this.npsApiKey,
        },
      });

      const parks: Park[] = response.data.data[0]?.parks || [];
      cache.set(cacheKey, parks);
      return parks;
    } catch (error) {
      const err = error as Error;
      console.error("Error searching by activity:", err.message);
      throw new Error("Failed to search parks by activity");
    }
  }

  /**
   * Format campsite data for AI context
   */
  formatForAI(campsites: Park[]): string {
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
