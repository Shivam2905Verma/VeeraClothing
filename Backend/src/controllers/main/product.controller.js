import { db } from "../../config/DB.config.js";
import { products } from "../../models/product.model.js";
import { product_images } from "../../models/product_images.model.js";
import { product_variants } from "../../models/product_variants.model.js";
import { eq, and } from "drizzle-orm";

export async function getAllProducts(req, res) {
  try {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.is_active, true));

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products: result,
    });
  } catch (error) {
    console.error("getAllProducts:", error);

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
        .where(
          and(eq(products.id, productId), eq(products.is_active, true)),
        ),
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
