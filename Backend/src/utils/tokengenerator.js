import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

export const generateTokenForAdmin = (adminId) => {
  return jwt.sign({ adminId }, process.env.JWT_SECRET_ADMIN, {
    expiresIn: "3d",
  });
};

export const generateTokenForUser = (userId, userEmail, is_verified) => {
  return jwt.sign(
    { userId, userEmail, is_verified },
    process.env.JWT_SECRET_USER,
    {
      expiresIn: "3d",
    },
  );
};
