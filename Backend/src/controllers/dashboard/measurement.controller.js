import { eq, and, ne } from "drizzle-orm";
import { db } from "../../config/DB.config.js";
import { measurement_types } from "../../models/measurement_types.model.js";
import { categories_measurements } from "../../models/category_measurements.model.js";
import { order_measurements } from "../../models/order_measurements.model.js";

// GET ALL MEASUREMENT TYPES
export const getMeasurements = async (req, res) => {
  try {
    const measurements = await db.select().from(measurement_types);

    return res.status(200).json({
      success: true,
      message: "Measurements fetched successfully",
      measurements,
    });
  } catch (error) {
    console.error("Error in getMeasurements controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch measurements",
    });
  }
};

// CREATE MEASUREMENT TYPE
export const createMeasurement = async (req, res) => {
  try {
    const { name, unit } = req.body;

    // Check if measurement type already exists with same name and unit
    const [existingMeasurement] = await db
      .select()
      .from(measurement_types)
      .where(eq(measurement_types.name, name))
      .limit(1);

    if (existingMeasurement) {
      return res.status(409).json({
        success: false,
        message: `Measurement type '${name}' already exists`,
        measurement: existingMeasurement,
      });
    }

    const [result] = await db.insert(measurement_types).values({
      name,
      unit,
    });

    return res.status(201).json({
      success: true,
      message: "Measurement created successfully",
      insertId: result?.insertId,
    });
  } catch (error) {
    console.error("Error in createMeasurement controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create measurement",
    });
  }
};

// UPDATE MEASUREMENT TYPE
export const updateMeasurement = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, unit } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid measurement ID",
      });
    }

    // Check if measurement exists
    const [existing] = await db
      .select()
      .from(measurement_types)
      .where(eq(measurement_types.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Measurement not found",
      });
    }

    // Check for duplicate name if name is changing
    if (name && name !== existing.name) {
      const [duplicate] = await db
        .select()
        .from(measurement_types)
        .where(
          and(
            eq(measurement_types.name, name),
            ne(measurement_types.id, id)
          )
        )
        .limit(1);

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Measurement type '${name}' already exists`,
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (unit !== undefined) updateData.unit = unit;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    await db
      .update(measurement_types)
      .set(updateData)
      .where(eq(measurement_types.id, id));

    return res.status(200).json({
      success: true,
      message: "Measurement updated successfully",
    });
  } catch (error) {
    console.error("Error in updateMeasurement controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update measurement",
    });
  }
};

// DELETE MEASUREMENT TYPE
export const deleteMeasurement = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid measurement ID",
      });
    }

    // Check if measurement type exists
    const [existing] = await db
      .select()
      .from(measurement_types)
      .where(eq(measurement_types.id, id))
      .limit(1);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Measurement not found",
      });
    }

    // Check if linked to categories
    const categoryLinks = await db
      .select()
      .from(categories_measurements)
      .where(eq(categories_measurements.measurement_type_id, id))
      .limit(1);

    if (categoryLinks.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete measurement type because it is linked to one or more categories",
      });
    }

    // Check if linked to orders
    const orderLinks = await db
      .select()
      .from(order_measurements)
      .where(eq(order_measurements.measurement_type_id, id))
      .limit(1);

    if (orderLinks.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete measurement type because it is associated with existing orders",
      });
    }

    await db
      .delete(measurement_types)
      .where(eq(measurement_types.id, id));

    return res.status(200).json({
      success: true,
      message: "Measurement deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteMeasurement controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete measurement",
    });
  }
};
