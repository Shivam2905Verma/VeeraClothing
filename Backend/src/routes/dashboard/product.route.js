import { Router } from "express";
import multer from "multer";
import {
  getAllDashboardProducts,
  getDashboardProductById,
  createProduct,
  createVariant,
  inactiveProduct,
  inactiveVariant,
  activateProduct,
  activateVariant,
  updateProduct,
  updateVariant,
  permanentDeleteProduct,
  permanentDeleteVariant,
  uploadNewProductImage,
  deleteProductImage,
} from "../../controllers/dashboard/product.controller.js";
import { zodValidateData } from "../../middleware/validateData.middleware.js";
import {
  createProductSchema,
  createVariantSchema,
  updateProductSchema,
  updateVariantSchema,
} from "../../validators/dashboard/product.schema.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";
const productDashboardRouter = Router();
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

productDashboardRouter.use(verifyAdmin);

productDashboardRouter.get("/", getAllDashboardProducts);
productDashboardRouter.get("/:id", getDashboardProductById);

productDashboardRouter.post(
  "/createproduct",
  upload.array("images", 5),
  zodValidateData(createProductSchema),
  createProduct,
);
productDashboardRouter.put(
  "/updateproduct/:id",
  zodValidateData(updateProductSchema),
  updateProduct,
);
productDashboardRouter.patch("/inactiveproduct/:id", inactiveProduct);
productDashboardRouter.patch("/activeproduct/:id", activateProduct);
productDashboardRouter.delete("/deleteproduct/:id", permanentDeleteProduct);

productDashboardRouter.post(
  "/createvariant",
  zodValidateData(createVariantSchema),
  createVariant,
);
productDashboardRouter.put(
  "/updatevariant/:id",
  zodValidateData(updateVariantSchema),
  updateVariant,
);
productDashboardRouter.patch("/inactivevariant/:id", inactiveVariant);
productDashboardRouter.patch("/activevariant/:id", activateVariant);
productDashboardRouter.delete("/deletevariant/:id", permanentDeleteVariant);

// images
productDashboardRouter.post(
  "/:id/uploadImage",
  upload.array("images", 5),
  uploadNewProductImage,
);
productDashboardRouter.delete("/:id/deleteimage/:imageId", deleteProductImage);

export default productDashboardRouter;
