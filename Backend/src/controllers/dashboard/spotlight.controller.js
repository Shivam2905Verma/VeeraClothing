import { db } from "../../config/DB.config.js";
import { spotlights } from "../../models/spotlight.model.js";
import { eq, asc } from "drizzle-orm";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../config/cloudinary.config.js";

export const getAllDashboardSpotlights = async (req, res) => {
  try {
    const data = await db.select().from(spotlights).orderBy(asc(spotlights.id));

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
    const { tag, title, link_url } = req.body;
    let image_url = req.body.image_url;
    let public_id = req.body.public_id || "";

    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.buffer, "spotlights");
      image_url = uploadRes.secure_url;
      public_id = uploadRes.public_id;
    }

    await db.insert(spotlights).values({
      tag: tag || "SPOTLIGHT",
      title,
      image_url,
      public_id: public_id || "",
      link_url: link_url || "/shopall",
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

    const [existing] = await db
      .select()
      .from(spotlights)
      .where(eq(spotlights.id, id));

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Spotlight not found",
      });
    }

    const { tag, title, link_url } = req.body;
    const updateData = {
      tag: tag || existing.tag,
      title: title || existing.title,
      link_url: link_url || existing.link_url,
    };

    if (req.file) {
      const uploadRes = await uploadToCloudinary(req.file.buffer, "spotlights");
      updateData.image_url = uploadRes.secure_url;
      updateData.public_id = uploadRes.public_id;

      // Delete previous image from Cloudinary if it existed
      if (existing.public_id) {
        try {
          await deleteFromCloudinary(existing.public_id);
        } catch (delErr) {
          console.log(
            "Failed to delete previous image from Cloudinary:",
            delErr,
          );
        }
      }
    }

    await db.update(spotlights).set(updateData).where(eq(spotlights.id, id));

    return res.status(200).json({
      success: true,
      message: "Spotlight updated successfully",
    });
  } catch (error) {
    console.log("updateSpotlight error:", error);
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

    const [existing] = await db
      .select()
      .from(spotlights)
      .where(eq(spotlights.id, id));

    if (existing?.public_id) {
      try {
        await deleteFromCloudinary(existing.public_id);
      } catch (delErr) {
        console.error(
          "Failed to delete image from Cloudinary on delete:",
          delErr,
        );
      }
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
