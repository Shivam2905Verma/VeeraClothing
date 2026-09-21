import { Router } from "express";
import {
  getDashboardRevenueAndOrders,
  getDashboardOverview,
} from "../../controllers/dashboard/dashboard.controller.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";

const dashboardRouter = Router();

// 1. Route for date-filtered revenue and orders metrics
dashboardRouter.get("/analytics", verifyAdmin, getDashboardRevenueAndOrders);

// 2. Route for active products, total customers, and recent 10 orders
dashboardRouter.get("/overview", verifyAdmin, getDashboardOverview);

export default dashboardRouter;
