import { Router } from "express";
import {
  getAllProducts,
  getProductById,
} from "../../controllers/main/product.controller.js";

const productRouter = Router();

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);

export default productRouter;
