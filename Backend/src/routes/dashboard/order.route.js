import { Router } from "express";
import {
  getAllDashboardOrders,
  getDashboardOrderById,
  updateDashboardOrderStatus,
} from "../../controllers/dashboard/order.controller.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";

const orderDashboardRouter = Router();

orderDashboardRouter.use(verifyAdmin);

orderDashboardRouter.get("/", getAllDashboardOrders);
orderDashboardRouter.get("/:id", getDashboardOrderById);
orderDashboardRouter.patch("/:id/status", updateDashboardOrderStatus);

export default orderDashboardRouter;
