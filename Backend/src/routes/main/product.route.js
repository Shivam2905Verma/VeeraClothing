import { Router } from "express";
import {
  getAllProducts,
  getProductById,
  searchProducts,
  getMaxPrice,
} from "../../controllers/main/product.controller.js";

const productRouter = Router();

productRouter.get("/", getAllProducts);
productRouter.get("/search", searchProducts);
productRouter.get("/pricerange", getMaxPrice);
productRouter.get("/:id", getProductById);

export default productRouter;
