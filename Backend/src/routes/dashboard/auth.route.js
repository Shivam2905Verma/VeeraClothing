import { Router } from "express";
import {
  getme,
  login,
  logout,
} from "../../controllers/dashboard/auth.controller.js";
import { zodValidateData } from "../../middleware/validateData.middleware.js";
import { loginSchema } from "../../validators/dashboard/auth.schema.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";
const authDashboardRouter = Router();

authDashboardRouter.post("/login", zodValidateData(loginSchema), login);
authDashboardRouter.post("/logout", verifyAdmin, logout);
authDashboardRouter.get("/getme", verifyAdmin, getme);

export default authDashboardRouter;
