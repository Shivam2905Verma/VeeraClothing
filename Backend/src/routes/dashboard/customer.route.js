import {
  getAllDashboardCustomers,
  deleteDashboardCustomer,
} from "../../controllers/dashboard/customer.controller.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";
import { Router } from "express";

const customerDashboardRouter = Router();

customerDashboardRouter.use(verifyAdmin);

customerDashboardRouter.get("/", getAllDashboardCustomers);
customerDashboardRouter.delete("/:id", deleteDashboardCustomer);

export default customerDashboardRouter;
