import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  getMe,
} from "../../controllers/main/auth.controller.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/verifyemail", verifyEmail);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.get("/getme", getMe);

export default userRouter;
