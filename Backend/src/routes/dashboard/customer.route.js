import { Router } from "express";
import { getAllDashboardCustomers } from "../../controllers/dashboard/customer.controller.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";

const customerDashboardRouter = Router();

customerDashboardRouter.use(verifyAdmin);

customerDashboardRouter.get("/", getAllDashboardCustomers);

export default customerDashboardRouter;
