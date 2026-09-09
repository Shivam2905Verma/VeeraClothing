import { Router } from "express";
import { login, logout } from "../../controllers/dashboard/auth.controller.js";
import { zodValidateData } from "../../middleware/validateData.middleware.js";
import { loginSchema } from "../../validators/dashboard/auth.schema.js";
const authDashboardRouter = Router();

authDashboardRouter.post("/login", zodValidateData(loginSchema), login);
authDashboardRouter.post("/logout", logout);

export default authDashboardRouter;
