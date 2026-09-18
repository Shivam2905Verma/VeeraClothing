import { eq, and, ne, inArray } from "drizzle-orm";
import { db } from "../../config/DB.config.js";
import { categories } from "../../models/categories.model.js";
import { products } from "../../models/product.model.js";
import { categories_measurements } from "../../models/category_measurements.model.js";
import { measurement_types } from "../../models/measurement_types.model.js";

// GET ALL CATEGORIES WITH THEIR LINKED MEASUREMENTS
export const getCategories = async (req, res) => {
  try {
    const allCategories = await db.select().from(categories);

    if (allCategories.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        categories: [],
      });
    }

    // Fetch all category-measurement links joined with measurement_types
    const categoryIds = allCategories.map((c) => c.id);
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
        eq(categories_measurements.measurement_type_id, measurement_types.id)
      )
      .where(inArray(categories_measurements.category_id, categoryIds));

    // Group measurements by category ID
    const measurementsByCatId = {};
    links.forEach((link) => {
      if (!measurementsByCatId[link.category_id]) {
        measurementsByCatId[link.category_id] = [];
      }
      measurementsByCatId[link.category_id].push({
        id: link.measurement_id,
        name: link.measurement_name,
        unit: link.measurement_unit,
      });
    });

    const enrichedCategories = allCategories.map((cat) => ({
      ...cat,
      measurements: measurementsByCatId[cat.id] || [],
    }));

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      categories: enrichedCategories,
    });
  } catch (error) {
    console.error("Error in getCategories controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// CREATE CATEGORY WITH OPTIONAL MEASUREMENT TYPES
export const createCategory = async (req, res) => {
  try {
    const { categoryName, measurementTypeIds = [] } = req.body;

    const [existingCategory] = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.name, categoryName))
      .limit(1);

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
        category: existingCategory,
      });
    }

    const [result] = await db.insert(categories).values({
      name: categoryName,
    });

    const categoryId = result?.insertId;

    // Insert linked measurement types if provided
    if (categoryId && Array.isArray(measurementTypeIds) && measurementTypeIds.length > 0) {
      const validIds = [...new Set(measurementTypeIds)];
      const measurementRecords = validIds.map((typeId) => ({
        category_id: categoryId,
        measurement_type_id: typeId,
      }));
      await db.insert(categories_measurements).values(measurementRecords);
    }

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      categoryId,
    });
  } catch (error) {
    console.error("Error in create category controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// UPDATE CATEGORY AND ITS LINKED MEASUREMENT TYPES
export const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { categoryName, measurementTypeIds } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check duplicate name if name changed
    if (categoryName && categoryName !== existingCategory.name) {
      const [duplicate] = await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.name, categoryName),
            ne(categories.id, id)
          )
        )
        .limit(1);

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `Category '${categoryName}' already exists`,
        });
      }

      await db
        .update(categories)
        .set({ name: categoryName })
        .where(eq(categories.id, id));
    }

    // Sync measurement types if provided
    if (Array.isArray(measurementTypeIds)) {
      // Remove previous category-measurement links
      await db
        .delete(categories_measurements)
        .where(eq(categories_measurements.category_id, id));

      // Insert new links
      if (measurementTypeIds.length > 0) {
        const validIds = [...new Set(measurementTypeIds)];
        const records = validIds.map((typeId) => ({
          category_id: id,
          measurement_type_id: typeId,
        }));
        await db.insert(categories_measurements).values(records);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error in update category controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Check if products are assigned to this category
    const linkedProducts = await db
      .select()
      .from(products)
      .where(eq(products.category_id, id));

    if (linkedProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category because there are active products assigned to it.",
      });
    }

    // Delete associated category_measurements
    await db
      .delete(categories_measurements)
      .where(eq(categories_measurements.category_id, id));

    // Delete category
    await db.delete(categories).where(eq(categories.id, id));

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error in delete category controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};
