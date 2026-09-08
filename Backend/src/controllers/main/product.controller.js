import { db } from "../../config/DB.config.js";
import { products } from "../../models/product.model.js";
import { eq } from "drizzle-orm";

export async function getAllProducts(req, res) {
  try {
    const result = await db.select().from(products);

    return res.status(200).json({
      success: true,
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

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("getProductById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
}
