import type { Request, Response } from "express";
import campsiteService from "../services/campsite.service.js";
import type { SearchParksQuery } from "../types/index.js";

/**
 * Search for parks
 */
export const searchParks = async (req: Request, res: Response) => {
  try {
    const {
      state = "CA",
      query = "",
      limit = "10",
    } = req.query as SearchParksQuery;

    const parks = await campsiteService.searchParks({
      state,
      query,
      limit: parseInt(limit as string),
    });

    res.json({
      count: parks.length,
      parks,
    });
  } catch (error) {
    console.error("Error searching parks:", error);
    res.status(500).json({ error: "Failed to search parks" });
  }
};

/**
 * Get park details
 */
export const getParkDetails = async (req: Request, res: Response) => {
  try {
    const { parkCode } = req.params;

    const park = await campsiteService.getParkDetails(parkCode);

    if (!park) {
      return res.status(404).json({ error: "Park not found" });
    }

    return res.json(park);
  } catch (error) {
    console.error("Error fetching park details:", error);
    return res.status(500).json({ error: "Failed to fetch park details" });
  }
};

/**
 * Get campgrounds for a park
 */
export const getCampgrounds = async (
  req: Request<{ parkCode: string }>,
  res: Response,
) => {
  try {
    const { parkCode } = req.params;

    const campgrounds = await campsiteService.getCampgrounds(parkCode);

    return res.json({
      count: campgrounds.length,
      campgrounds,
    });
  } catch (error) {
    console.error("Error fetching campgrounds:", error);
    return res.status(500).json({ error: "Failed to fetch campgrounds" });
  }
};

/**
 * Get all available activities
 */
export const getActivities = async (_req: Request, res: Response) => {
  try {
    const activities = await campsiteService.getActivities();

    return res.json({
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return res.status(500).json({ error: "Failed to fetch activities" });
  }
};

/**
 * Search parks by activity
 */
export const searchByActivity = async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    const { state = "CA" } = req.query as SearchParksQuery;

    const parks = await campsiteService.searchByActivity(activityId, state);

    res.json({
      count: parks.length,
      parks,
    });
  } catch (error) {
    console.error("Error searching by activity:", error);
    res.status(500).json({ error: "Failed to search parks by activity" });
  }
};
