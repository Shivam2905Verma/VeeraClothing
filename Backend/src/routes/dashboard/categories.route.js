import { Router } from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/dashboard/categories.controller.js";
import { zodValidateData } from "../../middleware/validateData.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/dashboard/categories.schema.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";
const categoriesDashboardRouter = Router();

categoriesDashboardRouter.use(verifyAdmin);

categoriesDashboardRouter.post(
  "/createcategory",
  zodValidateData(createCategorySchema),
  createCategory,
);
categoriesDashboardRouter.put(
  "/updatecategory/:id",
  zodValidateData(updateCategorySchema),
  updateCategory,
);
categoriesDashboardRouter.delete("/deletecategory/:id", deleteCategory);

export default categoriesDashboardRouter;
