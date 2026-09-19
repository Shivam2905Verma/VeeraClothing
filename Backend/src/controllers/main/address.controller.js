import { eq, and } from "drizzle-orm";
import { db } from "../../config/DB.config.js";
import { address } from "../../models/address.model.js";

const getUserId = (req) => req.user?.userId;

// GET USER SAVED ADDRESSES
export const getUserAddresses = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const addresses = await db
      .select()
      .from(address)
      .where(eq(address.user_id, userId));

    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      addresses,
    });
  } catch (error) {
    console.error("Error in getUserAddresses:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved addresses",
    });
  }
};

// SAVE NEW ADDRESS
export const saveUserAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      firstname,
      lastname,
      country,
      address_line_1,
      landmark,
      city,
      state,
      zip_code,
      phone,
    } = req.body;

    const [result] = await db.insert(address).values({
      user_id: userId,
      firstname,
      lastname,
      country: country || "India (INR ₹)",
      address_line_1,
      landmark: landmark || null,
      city,
      state,
      zip_code,
      phone,
    });

    const [newAddress] = await db
      .select()
      .from(address)
      .where(eq(address.id, result?.insertId));

    return res.status(201).json({
      success: true,
      message: "Address saved successfully",
      addressId: result?.insertId,
      address: newAddress,
    });
  } catch (error) {
    console.error("Error in saveUserAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save address",
    });
  }
};

// UPDATE ADDRESS
export const updateUserAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const {
      firstname,
      lastname,
      country,
      address_line_1,
      landmark,
      city,
      state,
      zip_code,
      phone,
    } = req.body;

    const [existing] = await db
      .select()
      .from(address)
      .where(and(eq(address.id, Number(id)), eq(address.user_id, userId)));

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await db
      .update(address)
      .set({
        firstname: firstname || existing.firstname,
        lastname: lastname || existing.lastname,
        country: country || existing.country || "India (INR ₹)",
        address_line_1: address_line_1 || existing.address_line_1,
        landmark: landmark !== undefined ? landmark : existing.landmark,
        city: city || existing.city,
        state: state || existing.state,
        zip_code: zip_code || existing.zip_code,
        phone: phone || existing.phone,
      })
      .where(and(eq(address.id, Number(id)), eq(address.user_id, userId)));

    const [updated] = await db
      .select()
      .from(address)
      .where(eq(address.id, Number(id)));

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address: updated,
    });
  } catch (error) {
    console.error("Error in updateUserAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
};

// DELETE ADDRESS
export const deleteUserAddress = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(address)
      .where(and(eq(address.id, Number(id)), eq(address.user_id, userId)));

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    await db
      .delete(address)
      .where(and(eq(address.id, Number(id)), eq(address.user_id, userId)));

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteUserAddress:", error);
    if (error?.code === "ER_ROW_IS_REFERENCED_2" || error?.errno === 1451) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete this address because it is linked to past orders.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to delete address",
    });
  }
};

