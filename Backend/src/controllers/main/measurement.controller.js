import { inArray, eq } from "drizzle-orm";
import { db } from "../../config/DB.config.js";
import { categories_measurements } from "../../models/category_measurements.model.js";
import { measurement_types } from "../../models/measurement_types.model.js";

export async function getMeasurementOfCategories(req, res) {
  try {
    const { categoryIds } = req.body;
    const uniqueCategoryIds = [...new Set(categoryIds)];

    if (uniqueCategoryIds.length === 0) {
      return res.status(200).json({
        success: true,
        measurements: [],
      });
    }

    const links = await db
      .select({
        category_id: categories_measurements.category_id,
        measurement_id: measurement_types.id,
        measurement_name: measurement_types.name,
        measurement_unit: measurement_types.unit,
      })
      .from(categories_measurements)
      .innerJoin(
        measurement_types,
        eq(categories_measurements.measurement_type_id, measurement_types.id),
      )
      .where(inArray(categories_measurements.category_id, uniqueCategoryIds));

    // Consolidate into unique measurement types
    const measurementMap = new Map();
    links.forEach((link) => {
      if (!measurementMap.has(link.measurement_id)) {
        measurementMap.set(link.measurement_id, {
          id: link.measurement_id,
          name: link.measurement_name,
          unit: link.measurement_unit,
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: "Category measurements fetched successfully",
      measurements: Array.from(measurementMap.values()),
    });
  } catch (error) {
    console.error("Error in getMeasurementOfCategories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category measurements",
    });
  }
}
