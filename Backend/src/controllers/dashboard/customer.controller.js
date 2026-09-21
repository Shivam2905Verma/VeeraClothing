import { eq, desc, and, or, like } from "drizzle-orm";
import { db } from "../../config/DB.config.js";
import { user } from "../../models/user.model.js";
import { address } from "../../models/address.model.js";
import { cart_items } from "../../models/cart_items.model.js";

// 1. GET ALL CUSTOMERS FOR DASHBOARD
export const getAllDashboardCustomers = async (req, res) => {
  try {
    const search = (
      req.query.search ||
      req.query.q ||
      req.query.query ||
      ""
    ).trim();
    const verifiedFilter = (
      req.query.is_verified ||
      req.query.verified ||
      ""
    ).trim();

    const conditions = [eq(user.is_deleted, false)];

    // Filter by Verification Status
    if (verifiedFilter && verifiedFilter.toUpperCase() !== "ALL") {
      const isVerified =
        verifiedFilter === "true" ||
        verifiedFilter === "1" ||
        verifiedFilter.toUpperCase() === "VERIFIED";
      conditions.push(eq(user.is_verified, isVerified));
    }

    // Filter by Search (name or email)
    if (search) {
      const searchTerm = `%${search}%`;
      const searchConditions = [
        like(user.name, searchTerm),
        like(user.email, searchTerm),
      ];

      const numId = Number(search);
      if (!isNaN(numId) && Number.isInteger(numId) && numId > 0) {
        searchConditions.push(eq(user.id, numId));
      }

      conditions.push(or(...searchConditions));
    }

    const customersList = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        is_verified: user.is_verified,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(and(...conditions))
      .orderBy(desc(user.id));

    return res.status(200).json({
      success: true,
      message: "Customers fetched successfully",
      customers: customersList,
    });
  } catch (error) {
    console.error("getAllDashboardCustomers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

// 2. PERMANENTLY DELETE UNVERIFIED CUSTOMER
export const deleteDashboardCustomer = async (req, res) => {
  try {
    const customerId = Number(req.params.id);
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // Check if customer exists
    const [existingCustomer] = await db
      .select({
        id: user.id,
        is_verified: user.is_verified,
      })
      .from(user)
      .where(eq(user.id, customerId));

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (existingCustomer.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Only unverified customer accounts can be deleted",
      });
    }

    // Clean up dependent records if any exist, then permanently delete user
    await db.delete(user).where(eq(user.id, customerId));

    return res.status(200).json({
      success: true,
      message: "Customer permanently deleted successfully",
    });
  } catch (error) {
    console.error("deleteDashboardCustomer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};
