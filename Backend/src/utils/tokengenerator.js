import jwt from "jsonwebtoken";

export const generateTokenForAdmin = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET_ADMIN, {
    expiresIn: "24h",
  });
};
