import { Router } from "express";
import { verifyUser } from "../../middleware/verifyUser.midleware.js";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "../../controllers/main/cart.controller.js";
import {
  addToCartSchema,
  updateCartItemQuantitySchema,
} from "../../validators/main/cart.schema.js";
import { zodValidateData } from "../../middleware/validateData.middleware.js";

const cartRouter = Router();

// Protect all cart routes with verifyUser middleware
cartRouter.use(verifyUser);

cartRouter.get("/", getCart);
cartRouter.post("/add", zodValidateData(addToCartSchema), addToCart);
cartRouter.patch(
  "/updatequantity",
  zodValidateData(updateCartItemQuantitySchema),
  updateCartItemQuantity,
);
cartRouter.delete("/clear", clearCart);
cartRouter.delete("/removeitem/:id", removeCartItem);

export default cartRouter;
