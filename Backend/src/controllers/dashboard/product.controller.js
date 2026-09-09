import { eq, inArray } from "drizzle-orm";
import { uploadToCloudinary } from "../../config/cloudinary.config.js";
import { db } from "../../config/DB.config.js";
import { cart_items } from "../../models/cart_items.model.js";
import { order_items } from "../../models/order_items.model.js";
import { products } from "../../models/product.model.js";
import { product_images } from "../../models/product_images.model.js";
import { product_variants } from "../../models/product_variants.model.js";

// Transaction = all operations succeed together, or none of them are applied.
export async function createProduct(req, res) {
  try {
    const { name, description, category_id } = req.body;
    const variants = JSON.parse(req.body.variants);
    const files = req.files;

    if (!name || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required",
      });
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one variant is required",
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    // 1. Upload all image buffers in parallel to Cloudinary
    const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer));
    const imageUrls = await Promise.all(uploadPromises);

    const result = await db.transaction(async (tx) => {
      // 1. Create product
      const [product] = await tx.insert(products).values({
        name,
        description,
        category_id: parseInt(category_id),
      });

      // 2. Create variants using product.id
      const variantValues = variants.map((variant) => ({
        product_id: product.insertId,
        color: variant.color,
        price: variant.price,
        stock: variant.stock,
      }));

      const createdVariants = await tx
        .insert(product_variants)
        .values(variantValues);

      // Create image rows using the Cloudinary URLs
      const imageValues = imageUrls.map((url) => ({
        product_id: product.insertId,
        image_url: url,
      }));
      const createdImages = await tx.insert(product_images).values(imageValues);

      return {
        product,
        variants: createdVariants,
        images: createdImages,
      };
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: result,
    });
  } catch (error) {
    console.error("createProduct:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
}

export async function createVariant(req, res) {
  try {
    const { variants } = req.body;

    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one variant is required",
      });
    }

    const variantValues = variants.map((variant) => ({
      product_id: variant.product_id,
      color: variant.color,
      price: variant.price,
      stock: variant.stock,
    }));

    const createdVariants = await db
      .insert(product_variants)
      .values(variantValues);

    return res.status(201).json({
      success: true,
      message: "Variant created successfully",
      data: createdVariants,
    });
  } catch (error) {
    console.error("createVariant:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create variant",
    });
  }
}

export async function updateProduct(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const { name, description, category_id } = req.body;

    if (isNaN(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    if (!name || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required",
      });
    }

    await db
      .update(products)
      .set({
        name,
        description,
        category_id,
      })
      .where(eq(products.id, productId));

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("updateProduct:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
}

export async function updateVariant(req, res) {
  try {
    const variantId = parseInt(req.params.id);
    const { color, price, stock } = req.body;

    if (isNaN(variantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid variant ID" });
    }

    if (!color || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: "Color, price, and stock are required",
      });
    }

    await db
      .update(product_variants)
      .set({
        color,
        price,
        stock,
      })
      .where(eq(product_variants.id, variantId));

    return res.status(200).json({
      success: true,
      message: "Variant updated successfully",
    });
  } catch (error) {
    console.error("updateVariant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update variant",
    });
  }
}

export async function inactiveProduct(req, res) {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    await db.transaction(async (tx) => {
      const [productUpdate] = await tx
        .update(products)
        .set({ is_active: false })
        .where(eq(products.id, productId));

      if (productUpdate.affectedRows === 0) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      await tx
        .update(product_variants)
        .set({ is_active: false })
        .where(eq(product_variants.product_id, productId));

      const variants = await tx
        .select({ id: product_variants.id })
        .from(product_variants)
        .where(eq(product_variants.product_id, productId));

      const variantIds = variants.map((v) => v.id);

      if (variantIds.length > 0) {
        await tx
          .delete(cart_items)
          .where(inArray(cart_items.variant_id, variantIds));
      }
    });

    return res.status(200).json({
      success: true,
      message: "Product and variants deactivated successfully",
    });
  } catch (error) {
    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.error("inactiveProduct error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate product",
    });
  }
}

export async function inactiveVariant(req, res) {
  try {
    const variantId = parseInt(req.params.id);

    if (isNaN(variantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    const [variantUpdate] = await db
      .update(product_variants)
      .set({ is_active: false })
      .where(eq(product_variants.id, variantId));

    if (variantUpdate.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    await db.delete(cart_items).where(eq(cart_items.variant_id, variantId));

    return res.status(200).json({
      success: true,
      message: "Variant deactivated successfully",
    });
  } catch (error) {
    console.error("inactiveVariant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate variant",
    });
  }
}

export async function activateProduct(req, res) {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    await db.transaction(async (tx) => {
      // 1. Activate the parent product
      const [productUpdate] = await tx
        .update(products)
        .set({ is_active: true })
        .where(eq(products.id, productId));

      if (productUpdate.affectedRows === 0) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      // 2. Activate all associated child variants
      await tx
        .update(product_variants)
        .set({ is_active: true })
        .where(eq(product_variants.product_id, productId));
    });

    return res.status(200).json({
      success: true,
      message: "Product and variants activated successfully",
    });
  } catch (error) {
    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.error("activateProduct error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to activate product",
    });
  }
}

export async function activateVariant(req, res) {
  try {
    const variantId = parseInt(req.params.id);

    if (isNaN(variantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    await db.transaction(async (tx) => {
      // 1. Fetch variant and check parent product's status
      const [variant] = await tx
        .select({
          id: product_variants.id,
          productId: product_variants.product_id,
          parentActive: products.is_active,
        })
        .from(product_variants)
        .innerJoin(products, eq(product_variants.product_id, products.id))
        .where(eq(product_variants.id, variantId));

      if (!variant) {
        throw new Error("VARIANT_NOT_FOUND");
      }

      // 2. Guard: Prevent enabling a variant if the parent product is inactive
      if (!variant.parentActive) {
        throw new Error("PARENT_INACTIVE");
      }

      // 3. Activate the variant
      await tx
        .update(product_variants)
        .set({ is_active: true })
        .where(eq(product_variants.id, variantId));
    });

    return res.status(200).json({
      success: true,
      message: "Variant activated successfully",
    });
  } catch (error) {
    if (error.message === "VARIANT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    if (error.message === "PARENT_INACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Cannot activate variant while the parent product is inactive",
      });
    }

    console.error("activateVariant error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to activate variant",
    });
  }
}

export async function permanentDeleteProduct(req, res) {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 1. Get all variant IDs for this product
    const variants = await db
      .select({ id: product_variants.id })
      .from(product_variants)
      .where(eq(product_variants.product_id, productId));

    const variantIds = variants.map((v) => v.id);

    // 2. Check if any variant has ever been purchased
    if (variantIds.length > 0) {
      const pastOrders = await db
        .select({ id: order_items.id })
        .from(order_items)
        .where(inArray(order_items.variant_id, variantIds))
        .limit(1);

      if (pastOrders.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot permanently delete this product because sales records exist. Please archive/deactivate it instead.",
        });
      }
    }

    // 3. Single delete query: MySQL triggers CASCADE down to variants/carts/images
    const [result] = await db
      .delete(products)
      .where(eq(products.id, productId));

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product permanently deleted",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
}

export async function permanentDeleteVariant(req, res) {
  try {
    const variantId = parseInt(req.params.id);

    if (isNaN(variantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid variant ID",
      });
    }

    // 1. Find the target variant and retrieve its parent product_id
    const [targetVariant] = await db
      .select({
        id: product_variants.id,
        productId: product_variants.product_id,
      })
      .from(product_variants)
      .where(eq(product_variants.id, variantId))
      .limit(1);

    if (!targetVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    // 2. Count total variants linked to this product
    const [variantCountResult] = await db
      .select({ count: sql`COUNT(*)` })
      .from(product_variants)
      .where(eq(product_variants.product_id, targetVariant.productId));

    const totalVariants = Number(variantCountResult.count);

    if (totalVariants <= 1) {
      return res.status(400).json({
        success: false,
        message:
          "There is only one variant of this product. You have to delete the product.",
      });
    }

    // 3. Check if this variant has ever been purchased
    const pastOrders = await db
      .select({ id: order_items.id })
      .from(order_items)
      .where(eq(order_items.variant_id, variantId))
      .limit(1);

    if (pastOrders.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot permanently delete this variant because sales records exist. Please archive/deactivate it instead.",
      });
    }

    // 4. Delete the variant (cart items cascade automatically via FK)
    await db.delete(product_variants).where(eq(product_variants.id, variantId));

    return res.status(200).json({
      success: true,
      message: "Variant permanently deleted",
    });
  } catch (error) {
    console.error("permanentDeleteVariant error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to permanently delete variant",
    });
  }
}
