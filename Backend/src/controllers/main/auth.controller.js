import { db } from "../../config/DB.config.js";
import { user } from "../../models/user.model.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { generateTokenForUser } from "../../utils/tokengenerator.js";
import { sendVerificationEmail } from "../../service/mail.service.js";

export async function registerUser(req, res) {
  try {
    const { name, email, password, mobile_no } = req.body;

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
      mobile_no,
    });

    const emailToken = generateTokenForUser(result.insertId, email);

    await sendVerificationEmail(email, emailToken);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: result.insertId,
        name,
        email,
        mobile_no,
      },
    });
  } catch (error) {
    console.log("Error from registration controller: ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);

    if (!decoded) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    const [user] = await db
      .select()
      .from(user)
      .where(eq(user.email, decoded.email));

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.is_verified) {
      return res
        .status(400)
        .json({ success: false, message: "User already verified" });
    }

    await db
      .update(user)
      .set({ is_verified: true })
      .where(eq(user.id, user.id));

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
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
    const { id } = req.user;

    const user = await db.select().from(user).where(eq(user.id, id));

    return res.status(200).json({
      success: true,
      data: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        mobile_no: user[0].mobile_no,
      },
    });
  } catch (error) {
    console.log("Error from get me controller: ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
