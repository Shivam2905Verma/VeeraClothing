import { sql, eq, and, notInArray, desc } from "drizzle-orm";
import { db } from "../../config/DB.config.js";
import { order } from "../../models/order.model.js";
import { products } from "../../models/product.model.js";
import { user } from "../../models/user.model.js";
import { address } from "../../models/address.model.js";
import { order_items } from "../../models/order_items.model.js";

/**
 * 1. GET REVENUE & ORDERS STATS (Date range filtered)
 * Query Params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD (or ?from=...&to=...)
 */
export const getDashboardRevenueAndOrders = async (req, res) => {
  try {
    const startDate = req.query.startDate || req.query.from;
    const endDate = req.query.endDate || req.query.to;

    const conditions = [];

    if (startDate) {
      conditions.push(sql`DATE(${order.createdAt}) >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`DATE(${order.createdAt}) <= ${endDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Aggregate revenue & orders within the given date range
    const [stats] = await db
      .select({
        // Total revenue: only paid and non-cancelled/returned orders
        totalRevenue: sql`COALESCE(
          SUM(
            CASE 
              WHEN ${order.payment_status} = 'paid' 
               AND ${order.order_status} NOT IN ('cancelled', 'returned') 
              THEN ${order.final_amount} 
              ELSE 0 
            END
          ), 
          0
        )`.as("totalRevenue"),

        // Total orders placed in this time range
        totalOrders: sql`COUNT(${order.id})`.as("totalOrders"),

        // Paid orders count
        paidOrders: sql`COUNT(CASE WHEN ${order.payment_status} = 'paid' THEN 1 END)`.as("paidOrders"),

        // Pending/processing orders count
        pendingOrders: sql`COUNT(CASE WHEN ${order.order_status} = 'pending' THEN 1 END)`.as("pendingOrders"),

        // Cancelled orders count
        cancelledOrders: sql`COUNT(CASE WHEN ${order.order_status} = 'cancelled' THEN 1 END)`.as("cancelledOrders"),
      })
      .from(order)
      .where(whereClause);

    return res.status(200).json({
      success: true,
      message: "Revenue and orders stats fetched successfully",
      data: {
        totalRevenue: Number(stats?.totalRevenue || 0),
        totalOrders: Number(stats?.totalOrders || 0),
        paidOrders: Number(stats?.paidOrders || 0),
        pendingOrders: Number(stats?.pendingOrders || 0),
        cancelledOrders: Number(stats?.cancelledOrders || 0),
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      },
    });
  } catch (error) {
    console.error("getDashboardRevenueAndOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch revenue and order metrics",
      error: error.message,
    });
  }
};

/**
 * 2. GET OVERVIEW STATS & RECENT 10 ORDERS
 * Fetches:
 * - Total active products
 * - Total registered customers
 * - Top 10 most recent orders with customer name, item count, total, status, and time
 */
export const getDashboardOverview = async (req, res) => {
  try {
    // 1. Total active products count
    const [productsResult] = await db
      .select({
        totalActiveProducts: sql`COUNT(${products.id})`.as("totalActiveProducts"),
      })
      .from(products)
      .where(eq(products.is_active, true));

    // 2. Total active registered customers count
    const [customersResult] = await db
      .select({
        totalCustomers: sql`COUNT(${user.id})`.as("totalCustomers"),
      })
      .from(user)
      .where(eq(user.is_deleted, false));

    // 3. Recent 10 orders with customer & items summary
    const recentOrders = await db
      .select({
        id: order.id,
        orderIdFormatted: sql`CONCAT('ORD-', LPAD(${order.id}, 4, '0'))`.as("orderIdFormatted"),
        customerName: sql`COALESCE(${user.name}, CONCAT(${address.firstname}, ' ', ${address.lastname}), 'Guest')`.as("customerName"),
        customerEmail: user.email,
        totalAmount: order.final_amount,
        orderStatus: order.order_status,
        paymentStatus: order.payment_status,
        createdAt: order.createdAt,
        totalItems: sql`COALESCE((
          SELECT SUM(${order_items.quantity}) 
          FROM ${order_items} 
          WHERE ${order_items.order_id} = ${order.id}
        ), 0)`.as("totalItems"),
      })
      .from(order)
      .leftJoin(user, eq(order.user_id, user.id))
      .leftJoin(address, eq(order.address_id, address.id))
      .orderBy(desc(order.createdAt))
      .limit(10);

    return res.status(200).json({
      success: true,
      message: "Dashboard overview fetched successfully",
      data: {
        totalActiveProducts: Number(productsResult?.totalActiveProducts || 0),
        totalCustomers: Number(customersResult?.totalCustomers || 0),
        recentOrders,
      },
    });
  } catch (error) {
    console.error("getDashboardOverview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard overview",
      error: error.message,
    });
  }
};
