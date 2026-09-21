import { eq, desc, and, or, like } from "drizzle-orm";
import { db } from "../../config/DB.config.js";
import { order } from "../../models/order.model.js";
import { user } from "../../models/user.model.js";
import { address } from "../../models/address.model.js";
import { payment_methods } from "../../models/payment_methods.model.js";
import { order_items } from "../../models/order_items.model.js";
import { product_variants } from "../../models/product_variants.model.js";
import { products } from "../../models/product.model.js";
import { order_item_measurements } from "../../models/order_item_measurement.model.js";
import { measurement_types } from "../../models/measurement_types.model.js";

// 1. GET ALL ORDERS FOR DASHBOARD (WITH SEARCH, STATUS FILTERS, AND PAGINATION)
export const getAllDashboardOrders = async (req, res) => {
  try {
    const search = (
      req.query.search ||
      req.query.q ||
      req.query.query ||
      ""
    ).trim();
    const payment_status = (
      req.query.payment_status ||
      req.query.paymentStatus ||
      ""
    ).trim();
    const order_status = (
      req.query.order_status ||
      req.query.orderStatus ||
      ""
    ).trim();
    const page = req.query.page ? Math.max(1, parseInt(req.query.page, 10)) : 1;
    const limit = req.query.limit
      ? Math.max(1, parseInt(req.query.limit, 10))
      : 15;
    const offset = (page - 1) * limit;

    const conditions = [];

    // Filter by Payment Status
    if (payment_status && payment_status.toUpperCase() !== "ALL") {
      conditions.push(eq(order.payment_status, payment_status.toLowerCase()));
    }

    // Filter by Order Status
    if (order_status && order_status.toUpperCase() !== "ALL") {
      conditions.push(eq(order.order_status, order_status.toLowerCase()));
    }

    // Filter by Search Query
    if (search) {
      const searchTerm = `%${search}%`;
      const searchConditions = [
        like(user.name, searchTerm),
        like(user.email, searchTerm),
        like(address.firstname, searchTerm),
        like(address.lastname, searchTerm),
        like(address.phone, searchTerm),
        like(payment_methods.name, searchTerm),
      ];

      // If search matches numeric order id or #ORD-xxx format
      const cleanId = search.replace(/^#?ORD-?/i, "").trim();
      const numId = Number(cleanId);
      if (!isNaN(numId) && Number.isInteger(numId) && numId > 0) {
        searchConditions.push(eq(order.id, numId));
      }

      conditions.push(or(...searchConditions));
    }

    // Fetch Paginated Order Records (fetch limit + 1 to check if more orders exist)
    let dataQuery = db
      .select({
        id: order.id,
        order_status: order.order_status,
        payment_status: order.payment_status,
        final_amount: order.final_amount,
        customer_name: user.name,
        customer_email: user.email,
        recipient_firstname: address.firstname,
        recipient_lastname: address.lastname,
        phone: address.phone,
        payment_method: payment_methods.name,
        createdAt: order.createdAt,
      })
      .from(order)
      .leftJoin(user, eq(order.user_id, user.id))
      .leftJoin(address, eq(order.address_id, address.id))
      .leftJoin(
        payment_methods,
        eq(order.payment_method_id, payment_methods.id),
      );

    if (conditions.length > 0) {
      dataQuery = dataQuery.where(and(...conditions));
    }

    const ordersList = await dataQuery
      .orderBy(desc(order.id))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = ordersList.length > limit;
    if (hasMore) {
      ordersList.pop();
    }

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: ordersList,
      hasMore,
      page,
      limit,
    });
  } catch (error) {
    console.error("getAllDashboardOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// 2. GET ORDER BY ID WITH ITEMS, MEASUREMENTS, AND SHIPPING DETAILS
export const getDashboardOrderById = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const [orderDetail] = await db
      .select({
        id: order.id,
        user_id: order.user_id,
        order_status: order.order_status,
        payment_status: order.payment_status,
        total_amount: order.total_amount,
        discount: order.discount,
        final_amount: order.final_amount,
        createdAt: order.createdAt,
        customer_name: user.name,
        customer_email: user.email,
        address_line_1: address.address_line_1,
        landmark: address.landmark,
        city: address.city,
        state: address.state,
        zip_code: address.zip_code,
        phone: address.phone,
        firstname: address.firstname,
        lastname: address.lastname,
        payment_method: payment_methods.name,
      })
      .from(order)
      .leftJoin(user, eq(order.user_id, user.id))
      .leftJoin(address, eq(order.address_id, address.id))
      .leftJoin(
        payment_methods,
        eq(order.payment_method_id, payment_methods.id),
      )
      .where(eq(order.id, orderId));

    if (!orderDetail) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Fetch items and measurements concurrently in parallel
    const [items, measurements] = await Promise.all([
      db
        .select({
          id: order_items.id,
          quantity: order_items.quantity,
          price: order_items.price,
          subtotal: order_items.subtotal,
          variant_id: product_variants.id,
          color: product_variants.color,
          product_id: products.id,
          product_name: products.name,
          image_url: products.image_url,
        })
        .from(order_items)
        .leftJoin(
          product_variants,
          eq(order_items.variant_id, product_variants.id),
        )
        .leftJoin(products, eq(product_variants.product_id, products.id))
        .where(eq(order_items.order_id, orderId)),

      db
        .select({
          id: order_item_measurements.id,
          measurement_value: order_item_measurements.measurement_value,
          type_name: measurement_types.name,
          unit: measurement_types.unit,
        })
        .from(order_item_measurements)
        .leftJoin(
          measurement_types,
          eq(order_item_measurements.measurement_type_id, measurement_types.id),
        )
        .where(eq(order_item_measurements.order_id, orderId)),
    ]);

    return res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      order: {
        ...orderDetail,
        items,
        measurements,
      },
    });
  } catch (error) {
    console.error("getDashboardOrderById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};

// 3. UPDATE ORDER STATUS / PAYMENT STATUS
export const updateDashboardOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const { order_status, payment_status } = req.body;
    const updateData = {
      order_status,
      payment_status,
    };

    await db.update(order).set(updateData).where(eq(order.id, orderId));

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("updateDashboardOrderStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update order",
    });
  }
};
