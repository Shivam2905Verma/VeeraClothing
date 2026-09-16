import jwt from "jsonwebtoken";
import { db } from "../../config/DB.config.js";
import { user } from "../../models/user.model.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateTokenForUser } from "../../utils/tokengenerator.js";
import { sendVerificationEmail } from "../../service/mail.service.js";

export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.insert(user).values({
      name,
      email,
      password: hashedPassword,
    });

    const emailToken = generateTokenForUser(result.insertId, email, false);

    await sendVerificationEmail(email, emailToken);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: result.insertId,
        name,
        email,
      },
    });
  } catch (error) {
    console.log(error);
    console.log("Error from registration controller: ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

export async function verifyEmail(req, res) {
  try {
    const token = req.query.token || req.body?.token;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);

    if (!decoded) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    const email = decoded.userEmail || decoded.email;
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (!foundUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (foundUser.is_verified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }

    await db
      .update(user)
      .set({ is_verified: true })
      .where(eq(user.id, foundUser.id));

    // Generate new token with is_verified: true to overwrite old cookie
    const newToken = generateTokenForUser(foundUser.id, foundUser.email, true);

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        is_verified: true,
      },
    });
  } catch (error) {
    console.log("Error from verify email controller: ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    if (existingUser.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser[0].password,
    );

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const token = generateTokenForUser(
      existingUser[0].id,
      existingUser[0].email,
      existingUser[0].is_verified,
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.log("Error from login controller: ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

export function logoutUser(req, res) {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log("Error from logout controller: ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

export async function getMe(req, res) {
  try {
    let userId = req.user?.userId || req.user?.id;

    if (!userId) {
      const token = req.cookies.token;
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);
      userId = decoded?.userId;
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [foundUser] = await db.select().from(user).where(eq(user.id, userId));

    if (!foundUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        is_verified: foundUser.is_verified,
      },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
