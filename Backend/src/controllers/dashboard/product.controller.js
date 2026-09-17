import { eq, inArray, and } from "drizzle-orm";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../config/cloudinary.config.js";
import { db } from "../../config/DB.config.js";
import { cart_items } from "../../models/cart_items.model.js";
import { order_items } from "../../models/order_items.model.js";
import { products } from "../../models/product.model.js";
import { product_images } from "../../models/product_images.model.js";
import { product_variants } from "../../models/product_variants.model.js";

export async function getAllDashboardProducts(req, res) {
  try {
    const result = await db.select().from(products);
    return res.status(200).json({
      success: true,
      message: "All dashboard products fetched successfully",
      products: result,
    });
  } catch (error) {
    console.error("getAllDashboardProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard products",
    });
  }
}

export async function getDashboardProductById(req, res) {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const [[product], images, variants] = await Promise.all([
      db.select().from(products).where(eq(products.id, productId)),
      db
        .select()
        .from(product_images)
        .where(eq(product_images.product_id, productId)),
      db
        .select()
        .from(product_variants)
        .where(eq(product_variants.product_id, productId)),
    ]);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      product: {
        ...product,
        images,
        variants,
      },
    });
  } catch (error) {
    console.error("getDashboardProductById error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch product" });
  }
}

// Transaction = all operations succeed together, or none of them are applied.
export async function createProduct(req, res) {
  try {
    const {
      name,
      description,
      highlights,
      composition,
      care,
      extra_info,
      category_id,
      variants,
    } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    // 1. Upload all image buffers in parallel to Cloudinary
    const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer));
    const uploadedImages = await Promise.all(uploadPromises);

    // 2. Compute aggregated product values
    const frontImage = uploadedImages[0].secure_url;
    const initialPrice = Number(variants[0].price);
    const totalStock = variants.reduce(
      (sum, variant) => sum + Number(variant.stock || 0),
      0,
    );

    const result = await db.transaction(async (tx) => {
      // 3. Create product with front image, base price, and aggregated stock
      const [product] = await tx.insert(products).values({
        name,
        description,
        category_id: parseInt(category_id, 10),
        image_url: frontImage,
        price: initialPrice,
        stock: totalStock,
        highlights,
        composition,
        care,
        extra_info,
      });

      // 4. Create variants using product.insertId
      const variantValues = variants.map((variant) => ({
        product_id: product.insertId,
        color: variant.color,
        price: Number(variant.price),
        stock: Number(variant.stock),
      }));

      const createdVariants = await tx
        .insert(product_variants)
        .values(variantValues);

      // 5. Create product image records with image_url and public_id
      const imageValues = uploadedImages.map((image) => ({
        product_id: product.insertId,
        image_url: image.secure_url,
        public_id: image.public_id,
      }));

      const createdImages = await tx.insert(product_images).values(imageValues);

      return {
        product: {
          id: product.insertId,
          name,
          price: initialPrice,
          stock: totalStock,
        },
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
    const { name, description, highlights, composition, care, extra_info } =
      req.body;
    const category_id = req.body.category_id
      ? Number(req.body.category_id)
      : undefined;

    if (isNaN(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }

    const updateFields = {
      name,
      description,
      category_id,
      highlights,
      composition,
      care,
      extra_info,
    };

    await db
      .update(products)
      .set(updateFields)
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
    const { color } = req.body;
    const price = Number(req.body.price);
    const stock = Number(req.body.stock);

    if (isNaN(variantId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid variant ID" });
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

export async function deleteProductImage(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const imageId = parseInt(req.params.imageId);
    const is_cover = req.body.is_cover;

    console.log(is_cover);
    console.log(req.body);

    if (isNaN(productId) || isNaN(imageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID or image ID",
      });
    }

    // 1. Find the image in product_images
    const [image] = await db
      .select()
      .from(product_images)
      .where(
        and(
          eq(product_images.id, imageId),
          eq(product_images.product_id, productId),
        ),
      );

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Product image not found",
      });
    }

    // 2. Delete image from Cloudinary
    if (image.public_id) {
      try {
        await deleteFromCloudinary(image.public_id);
      } catch (cloudErr) {
        console.error("Cloudinary delete error:", cloudErr);
      }
    }

    // 3. Delete from database
    await db.delete(product_images).where(eq(product_images.id, imageId));

    // 4. If this image was set as product cover image (products.image_url), update with another image
    if (is_cover) {
      const [remainingImage] = await db
        .select()
        .from(product_images)
        .where(eq(product_images.product_id, productId))
        .limit(1);

      if (remainingImage) {
        await db
          .update(products)
          .set({ image_url: remainingImage.image_url })
          .where(eq(products.id, productId));
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product image deleted successfully",
      deletedImageId: imageId,
    });
  } catch (error) {
    console.error("deleteProductImage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete product image",
    });
  }
}

export async function uploadNewProductImage(req, res) {
  try {
    const productId = parseInt(req.params.id);
    const { isCover } = req.body;
    let image_isCover = [];
    if (isCover) {
      try {
        image_isCover =
          typeof isCover === "string" ? JSON.parse(isCover) : isCover;
      } catch (e) {
        image_isCover = [];
      }
    }
    if (!Array.isArray(image_isCover)) {
      image_isCover = [Boolean(image_isCover)];
    }

    console.log("image_isCover:", image_isCover);

    if (isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Verify product exists
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

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image file is required",
      });
    }

    const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer));
    const uploadedImages = await Promise.all(uploadPromises);

    const coverUpdates = image_isCover.map(async (item, index) => {
      if (item && uploadedImages[index]) {
        await db
          .update(products)
          .set({
            image_url: uploadedImages[index].secure_url,
          })
          .where(eq(products.id, productId));
      }
    });

    await Promise.all(coverUpdates);

    const imagePromises = uploadedImages.map((image) =>
      db.insert(product_images).values({
        product_id: productId,
        image_url: image.secure_url,
        public_id: image.public_id,
      }),
    );

    await Promise.all(imagePromises);

    return res.status(201).json({
      success: true,
      message: "Product images uploaded successfully",
    });
  } catch (error) {
    console.error("uploadNewProductImage error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload product image",
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
