import { eq } from "drizzle-orm";
import { db } from "../../config/DB.config.js";
import { categories } from "../../models/categories.model.js";
import { products } from "../../models/product.model.js";

export const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

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

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Error in create category controller:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// update category
export const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { categoryName } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

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

    await db
      .update(categories)
      .set({
        name: categoryName,
      })
      .where(eq(categories.id, id));

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.log("Error in update category controller", error);
    throw error;
  }
};

// delete category
export const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    const existingCategory = await db
      .select()
      .from(products)
      .where(eq(products.category_id, id));

    if (existingCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Can't delete category because there are products in this category",
      });
    }

    await db.delete(categories).where(eq(categories.id, id));

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log("Error in delete category controller", error);
    throw error;
  }
};
