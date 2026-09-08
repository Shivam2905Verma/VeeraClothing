import { Router } from "express";
import {
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
} from "../../controllers/dashboard/product.controller.js";
const productDashboardRouter = Router();
// config/multer.js
import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

productDashboardRouter.post("/createproduct", createProduct);
productDashboardRouter.put("/updateproduct/:id", updateProduct);
productDashboardRouter.patch("/inactiveproduct/:id", inactiveProduct);
productDashboardRouter.patch("/activeproduct/:id", activateProduct);
productDashboardRouter.delete("/deleteproduct/:id", permanentDeleteProduct);

productDashboardRouter.post("/createvariant", createVariant);
productDashboardRouter.put("/updatevariant/:id", updateVariant);
productDashboardRouter.patch("/inactivevariant/:id", inactiveVariant);
productDashboardRouter.patch("/activevariant/:id", activateVariant);
productDashboardRouter.delete("/deletevariant/:id", permanentDeleteVariant);

productDashboardRouter.post("/upload-image", uploadImage);
productDashboardRouter.delete(
  "/product/:product_id/delete-image/:image_id",
  deleteImage,
);

export default productDashboardRouter;
