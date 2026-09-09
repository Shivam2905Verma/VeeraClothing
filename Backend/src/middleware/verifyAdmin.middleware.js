import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token found.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN);

    req.admin = {
      id: decoded.adminId,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or tampered token.",
    });
  }
};
