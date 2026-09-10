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
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("admin_token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
