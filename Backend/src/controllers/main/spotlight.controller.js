import { db } from "../../config/DB.config.js";
import { spotlights } from "../../models/spotlight.model.js";
import { eq, asc } from "drizzle-orm";

export const getSpotlights = async (req, res) => {
  try {
    const data = await db
      .select()
      .from(spotlights)
      .orderBy(asc(spotlights.id))
      .limit(2);

    return res.status(200).json({
      success: true,
      message: "Spotlights fetched successfully",
      spotlights: data,
    });
  } catch (error) {
    console.error("getSpotlights error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch spotlights",
    });
  }
};
