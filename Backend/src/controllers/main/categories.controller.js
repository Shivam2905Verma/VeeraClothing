import { db } from "../../config/DB.config.js";
import { categories } from "../../models/categories.model.js";

export const getAllCategories = async (req, res) => {
  try {
    const allCategories = await db.select().from(categories);
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories: allCategories,
    });
  } catch (error) {
    console.error("Error in getAllCategories controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};
