import bcrypt from "bcrypt";
import { admin } from "../../models/admin.model.js";
import { eq } from "drizzle-orm";
import { generateTokenForAdmin } from "../../utils/tokengenerator.js";
import { db } from "../../config/DB.config.js";

export const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const [user] = await db
      .select()
      .from(admin)
      .where(eq(admin.admin_id, userId));

    if (!user) {
      return res.status(401).json({ message: "Invalid userId" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = generateTokenForAdmin(user.admin_id);

    console.log(token);

    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      admin: {
        admin_id: user.admin_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getme = async (req, res) => {
  try {
    const { id } = req.admin;
    const [adminData] = await db
      .select({
        admin_id: admin.admin_id,
      })
      .from(admin)
      .where(eq(admin.admin_id, id));

    if (!adminData) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin fetched successfully",
      admin: adminData,
    });
  } catch (error) {
    console.error("Getme error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
