import { Router } from "express";
import {
  getAllDashboardOrders,
  getDashboardOrderById,
  updateDashboardOrderStatus,
} from "../../controllers/dashboard/order.controller.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";
import { zodValidateData } from "../../middleware/validateData.middleware.js";
import { updateOrderStatusSchema } from "../../validators/dashboard/order.schema.js";

const orderDashboardRouter = Router();

orderDashboardRouter.use(verifyAdmin);

orderDashboardRouter.get("/", getAllDashboardOrders);
orderDashboardRouter.get("/:id", getDashboardOrderById);
orderDashboardRouter.patch(
  "/:id/status",
  zodValidateData(updateOrderStatusSchema),
  updateDashboardOrderStatus,
);

export default orderDashboardRouter;
