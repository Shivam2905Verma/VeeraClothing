import { db } from "../../config/DB.config.js";
import { cart_items } from "../../models/cart_items.model.js";
import { product_variants } from "../../models/product_variants.model.js";
import { products } from "../../models/product.model.js";
import { eq, and } from "drizzle-orm";

const getUserId = (req) => req.user?.userId;

export async function getCart(req, res) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found",
      });
    }

    // INNER JOIN cart_items -> product_variants -> products
    const items = await db
      .select({
        cart_item_id: cart_items.id,
        quantity: cart_items.quantity,
        variant_id: product_variants.id,
        color: product_variants.color,
        price: product_variants.price,
        stock: product_variants.stock,
        product_id: products.id,
        category_id: products.category_id,
        name: products.name,
        image_url: products.image_url,
      })
      .from(cart_items)
      .innerJoin(
        product_variants,
        eq(cart_items.variant_id, product_variants.id),
      )
      .innerJoin(products, eq(product_variants.product_id, products.id))
      .where(eq(cart_items.user_id, userId));

    // Calculate subtotal for each item and overall cart total
    let cartTotal = 0;
    const formattedItems = items.map((item) => {
      const itemPrice = Number(item.price) || 0;
      const itemSubtotal = itemPrice * item.quantity;
      cartTotal += itemSubtotal;

      return {
        ...item,
        price: itemPrice,
        subtotal: itemSubtotal,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      items: formattedItems,
      total_items: formattedItems.length,
      cart_total: cartTotal,
    });
  } catch (error) {
    console.error("Error in getCart:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart items",
    });
  }
}

// Add an item to the cart (or increment quantity if already exists)
export async function addToCart(req, res) {
  try {
    const userId = getUserId(req);

    console.log(req.user);

    console.log(userId);

    const { variant_id, quantity = 1 } = req.body;

    // 1. Verify variant exists and check stock
    const [variant] = await db
      .select()
      .from(product_variants)
      .where(eq(product_variants.id, variant_id));

    if (!variant || !variant.is_active) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found or inactive",
      });
    }

    // 2. Check if item already exists in user's cart
    const [existingCartItem] = await db
      .select()
      .from(cart_items)
      .where(
        and(
          eq(cart_items.user_id, userId),
          eq(cart_items.variant_id, variant_id),
        ),
      );

    const newQuantity = existingCartItem
      ? existingCartItem.quantity + quantity
      : quantity;

    if (newQuantity > variant.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more items. Maximum stock available is ${variant.stock}`,
      });
    }

    let cartItemId;
    // 3. Upsert item (Update if exists, Insert if new)
    if (existingCartItem) {
      await db
        .update(cart_items)
        .set({ quantity: newQuantity })
        .where(eq(cart_items.id, existingCartItem.id));
      cartItemId = existingCartItem.id;
    } else {
      const [result] = await db.insert(cart_items).values({
        user_id: userId,
        variant_id: variant_id,
        quantity: newQuantity,
      });
      cartItemId = result.insertId;
    }

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cartItemId,
    });
  } catch (error) {
    console.error("Error in addToCart:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
    });
  }
}

/**
 * Update quantity of a specific cart item
 */
export async function updateCartItemQuantity(req, res) {
  try {
    const userId = getUserId(req);
    const { cartItemId, quantity } = req.body;

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await db
        .delete(cart_items)
        .where(
          and(eq(cart_items.id, cartItemId), eq(cart_items.user_id, userId)),
        );

      return res.status(200).json({
        success: true,
        message: "Item removed from cart",
      });
    }

    // Check if cart item belongs to user and check variant stock
    const [item] = await db
      .select({
        cart_item_id: cart_items.id,
        stock: product_variants.stock,
      })
      .from(cart_items)
      .innerJoin(
        product_variants,
        eq(cart_items.variant_id, product_variants.id),
      )
      .where(
        and(eq(cart_items.id, cartItemId), eq(cart_items.user_id, userId)),
      );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (quantity > item.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.stock} items available in stock`,
      });
    }

    await db
      .update(cart_items)
      .set({ quantity })
      .where(eq(cart_items.id, cartItemId));

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
    });
  } catch (error) {
    console.error("Error in updateCartItemQuantity:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
}

/**
 * Remove a single item from the cart
 */
export async function removeCartItem(req, res) {
  try {
    const userId = getUserId(req);
    const { id: cartItemId } = req.params;

    await db
      .delete(cart_items)
      .where(
        and(eq(cart_items.id, cartItemId), eq(cart_items.user_id, userId)),
      );

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
    });
  } catch (error) {
    console.error("Error in removeCartItem:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
    });
  }
}

/**
 * Clear the entire cart for logged-in user
 */
export async function clearCart(req, res) {
  try {
    const userId = getUserId(req);

    await db.delete(cart_items).where(eq(cart_items.user_id, userId));

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error in clearCart:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
}
