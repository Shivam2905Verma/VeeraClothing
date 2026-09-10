import jwt from "jsonwebtoken";

export function verifyUser(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER);

    if (!decoded) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log("Error from verify user middleware: ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
