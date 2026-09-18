import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  getMe,
} from "../../controllers/main/auth.controller.js";
import { verifyUser } from "../../middleware/verifyUser.midleware.js";
import {
  loginUserSchema,
  registerUserSchema,
} from "../../validators/main/auth.schema.js";
import { zodValidateData } from "../../middleware/validateData.middleware.js";

const userRouter = Router();

userRouter.post("/register", zodValidateData(registerUserSchema), registerUser);
userRouter.post("/verifyemail", verifyEmail);
userRouter.post("/login", zodValidateData(loginUserSchema), loginUser);
userRouter.post("/logout", logoutUser);
userRouter.get("/getme", verifyUser, getMe);

export default userRouter;
