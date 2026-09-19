import { db } from "../../config/DB.config.js";
import { spotlights } from "../../models/spotlight.model.js";
import { eq, asc } from "drizzle-orm";
import { uploadToCloudinary } from "../../config/cloudinary.config.js";

export const getAllDashboardSpotlights = async (req, res) => {
  try {
    const data = await db
      .select()
      .from(spotlights)
      .orderBy(asc(spotlights.id));

    return res.status(200).json({
      success: true,
      message: "Spotlights fetched successfully",
      spotlights: data,
    });
  } catch (error) {
    console.error("getAllDashboardSpotlights error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch spotlights",
    });
  }
};

export const createSpotlight = async (req, res) => {
  try {
    const { tag = "SPOTLIGHT", title, link_url = "/shopall" } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.buffer, "spotlights");
      image_url = uploadRes.secure_url;
    }

    if (!title || !image_url) {
      return res.status(400).json({
        success: false,
        message: "Title and Image are required",
      });
    }

    await db.insert(spotlights).values({
      tag: tag || "SPOTLIGHT",
      title,
      image_url,
      link_url: link_url || "/shopall",
      is_active: true,
    });

    return res.status(201).json({
      success: true,
      message: "Spotlight created successfully",
    });
  } catch (error) {
    console.error("createSpotlight error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create spotlight",
    });
  }
};

export const updateSpotlight = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid spotlight ID",
      });
    }

    const { tag, title, link_url, is_active } = req.body;
    const updateData = {};

    if (tag !== undefined) updateData.tag = tag;
    if (title !== undefined) updateData.title = title;
    if (link_url !== undefined) updateData.link_url = link_url;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.buffer, "spotlights");
      updateData.image_url = uploadRes.secure_url;
    } else if (req.body.image_url) {
      updateData.image_url = req.body.image_url;
    }

    await db
      .update(spotlights)
      .set(updateData)
      .where(eq(spotlights.id, id));

    return res.status(200).json({
      success: true,
      message: "Spotlight updated successfully",
    });
  } catch (error) {
    console.error("updateSpotlight error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update spotlight",
    });
  }
};

export const deleteSpotlight = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid spotlight ID",
      });
    }

    await db.delete(spotlights).where(eq(spotlights.id, id));

    return res.status(200).json({
      success: true,
      message: "Spotlight deleted successfully",
    });
  } catch (error) {
    console.error("deleteSpotlight error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete spotlight",
    });
  }
};
