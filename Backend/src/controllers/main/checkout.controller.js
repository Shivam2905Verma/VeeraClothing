import { eq } from "drizzle-orm";
import { db } from "../../config/DB.config.js";
import { payment_methods } from "../../models/payment_methods.model.js";
import { address } from "../../models/address.model.js";
import { order } from "../../models/order.model.js";
import { order_items } from "../../models/order_items.model.js";
import { order_item_measurements } from "../../models/order_item_measurement.model.js";
import { cart_items } from "../../models/cart_items.model.js";
import { product_variants } from "../../models/product_variants.model.js";
import { products } from "../../models/product.model.js";

const getUserId = (req) => req.user?.userId;

// GET ALL PAYMENT METHODS
export const getPaymentMethods = async (req, res) => {
  try {
    let methods = await db.select().from(payment_methods);

    return res.status(200).json({
      success: true,
      paymentMethods: methods,
    });
  } catch (error) {
    console.error("Error in getPaymentMethods:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment methods",
    });
  }
};

// PLACE ORDER WITH CART, ADDRESS, MEASUREMENTS, AND PAYMENT METHOD
export const placeOrder = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { order: orderData, measurements } = req.body;

    console.log(orderData, measurements);

    // // 1. Fetch user's cart items from DB
    const cartList = await db
      .select({
        cart_item_id: cart_items.id,
        quantity: cart_items.quantity,
        variant_id: product_variants.id,
        price: product_variants.price,
        stock: product_variants.stock,
        product_id: products.id,
        category_id: products.category_id,
      })
      .from(cart_items)
      .innerJoin(
        product_variants,
        eq(cart_items.variant_id, product_variants.id),
      )
      .innerJoin(products, eq(product_variants.product_id, products.id))
      .where(eq(cart_items.user_id, userId));

    console.log(cartList);

    if (cartList.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Your cart is empty. Please add items before placing an order.",
      });
    }

    if (!orderData.addressId) {
      return res.status(400).json({
        success: false,
        message: "Please provide address",
      });
    }

    if (!orderData.paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: "Please provide payment method",
      });
    }

    if (!Object.keys(measurements).length) {
      return res.status(400).json({
        success: false,
        message: "Please provide measurements",
      });
    }

    // 2. Calculate Totals
    let totalAmount = 0;
    cartList.forEach((item) => {
      totalAmount += Number(item.price) * item.quantity;
    });

    const deliveryFee = totalAmount >= 999 ? 0 : 99; // e.g. Free shipping above 999
    const finalAmount = totalAmount + deliveryFee;

    // 3. Here payment step happens from cashfree

    // 4. Create order
    const [orderResult] = await db.insert(order).values({
      user_id: userId,
      address_id: orderData.addressId,
      payment_method_id: orderData.paymentMethodId,
      order_status: "pending",
      payment_status: "pending",
      total_amount: totalAmount.toFixed(2),
      discount: 0,
      final_amount: finalAmount.toFixed(2),
    });

    const newOrderId = orderResult.insertId;

    // 5. Insert Order Items
    for (const item of cartList) {
      const itemSubtotal = Number(item.price) * item.quantity;
      await db.insert(order_items).values({
        order_id: newOrderId,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: Number(item.price).toFixed(2),
        subtotal: itemSubtotal.toFixed(2),
      });
    }

    // 6. Save custom tailoring measurements for this order if provided
    for (const [measurementTypeId, val] of Object.entries(measurements)) {
      if (measurementTypeId && val) {
        await db.insert(order_item_measurements).values({
          order_id: newOrderId,
          measurement_type_id: Number(measurementTypeId),
          measurement_value: val,
        });
      }
    }

    await db.delete(cart_items).where(eq(cart_items.user_id, userId));

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
    });
  } catch (error) {
    console.error("Error in placeOrder:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to place order. Please try again.",
    });
  }
};
