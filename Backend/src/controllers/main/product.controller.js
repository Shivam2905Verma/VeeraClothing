import { db } from "../../config/DB.config.js";
import { products } from "../../models/product.model.js";
import { categories } from "../../models/categories.model.js";
import { product_images } from "../../models/product_images.model.js";
import { product_variants } from "../../models/product_variants.model.js";
import { eq, and, or, like, gte, lte, asc, desc, max, min } from "drizzle-orm";

export async function searchProducts(req, res) {
  try {
    const query = (
      req.query.q ||
      req.query.query ||
      req.query.search ||
      ""
    ).trim();
    const categoryId = req.query.categoryId
      ? Number(req.query.categoryId)
      : null;
    const minPrice =
      req.query.minPrice !== undefined && req.query.minPrice !== ""
        ? Number(req.query.minPrice)
        : null;
    const maxPrice =
      req.query.maxPrice !== undefined && req.query.maxPrice !== ""
        ? Number(req.query.maxPrice)
        : null;
    const sortBy = req.query.sortBy || "default";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = req.query.limit ? Number(req.query.limit) : 18;
    const offset = (page - 1) * limit;

    // Conditions array
    const conditions = [eq(products.is_active, true)];

    // Text Search Condition (if query provided)
    if (query) {
      const searchTerm = `%${query}%`;
      conditions.push(
        or(
          like(products.name, searchTerm),
          like(products.description, searchTerm),
          like(categories.name, searchTerm),
        ),
      );
    }

    // Category ID Condition
    if (categoryId && !isNaN(categoryId)) {
      conditions.push(eq(products.category_id, categoryId));
    }

    // Price Range Conditions
    if (minPrice !== null && !isNaN(minPrice)) {
      conditions.push(gte(products.price, minPrice));
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      conditions.push(lte(products.price, maxPrice));
    }

    // Build Query
    let dbQuery = db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        image_url: products.image_url,
        category_id: products.category_id,
        category_name: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.category_id, categories.id))
      .where(and(...conditions));

    // Sort By Order
    if (sortBy === "low-to-high") {
      dbQuery = dbQuery.orderBy(asc(products.price));
    } else if (sortBy === "high-to-low") {
      dbQuery = dbQuery.orderBy(desc(products.price));
    } else {
      dbQuery = dbQuery.orderBy(desc(products.createdAt));
    }

    // Pagination Limit & Offset
    if (limit && !isNaN(limit) && limit > 0) {
      dbQuery = dbQuery.limit(limit).offset(offset);
    }

    const result = await dbQuery;

    return res.status(200).json({
      success: true,
      message: "Products searched successfully",
      products: result,
      page,
      limit,
      hasMore: result.length === limit,
    });
  } catch (error) {
    console.error("searchProducts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search products",
    });
  }
}

export async function getAllProducts(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 18;
    const offset = (page - 1) * limit;
    const minPrice =
      req.query.minPrice !== undefined && req.query.minPrice !== ""
        ? Number(req.query.minPrice)
        : null;
    const maxPrice =
      req.query.maxPrice !== undefined && req.query.maxPrice !== ""
        ? Number(req.query.maxPrice)
        : null;
    const sortBy = req.query.sortBy || "default";

    const conditions = [eq(products.is_active, true)];

    if (minPrice !== null && !isNaN(minPrice)) {
      conditions.push(gte(products.price, minPrice));
    }

    if (maxPrice !== null && !isNaN(maxPrice)) {
      conditions.push(lte(products.price, maxPrice));
    }

    let dbQuery = db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        image_url: products.image_url,
      })
      .from(products)
      .where(and(...conditions));

    if (sortBy === "low-to-high") {
      dbQuery = dbQuery.orderBy(asc(products.price));
    } else if (sortBy === "high-to-low") {
      dbQuery = dbQuery.orderBy(desc(products.price));
    } else {
      dbQuery = dbQuery.orderBy(desc(products.createdAt));
    }

    if (limit && !isNaN(limit) && limit > 0) {
      dbQuery = dbQuery.limit(limit).offset(offset);
    }

    const result = await dbQuery;

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products: result,
      page,
      limit,
      hasMore: result.length === limit,
    });
  } catch (error) {
    console.error("getAllProducts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
}

export async function getProductById(req, res) {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const [[product], images, variants] = await Promise.all([
      db
        .select()
        .from(products)
        .where(and(eq(products.id, productId), eq(products.is_active, true))),
      db
        .select()
        .from(product_images)
        .where(eq(product_images.product_id, productId)),
      db
        .select()
        .from(product_variants)
        .where(
          and(
            eq(product_variants.product_id, productId),
            eq(product_variants.is_active, true),
          ),
        ),
    ]);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product: {
        ...product,
        images,
        variants,
      },
    });
  } catch (error) {
    console.error("getProductById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
}

export async function getMaxPrice(req, res) {
  try {
    const result = await db
      .select({
        maxPrice: max(products.price),
        minPrice: min(products.price),
      })
      .from(products)
      .where(eq(products.is_active, true));

    const maxPrice = Number(result[0]?.maxPrice) || 0;
    const minPrice = Number(result[0]?.minPrice) || 0;

    return res.status(200).json({
      success: true,
      maxPrice,
      minPrice,
    });
  } catch (error) {
    console.error("getMaxPrice error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch price range",
    });
  }
}

export async function getNewArrivals(req, res) {
  try {
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        image_url: products.image_url,
      })
      .from(products)
      .leftJoin(categories, eq(products.category_id, categories.id))
      .where(eq(products.is_active, true))
      .orderBy(desc(products.createdAt))
      .limit(6);

    return res.status(200).json({
      success: true,
      message: "New arrivals fetched successfully",
      products: result,
    });
  } catch (error) {
    console.error("getNewArrivals error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch new arrivals",
    });
  }
}
