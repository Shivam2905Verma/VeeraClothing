import { Router } from "express";
import { verifyUser } from "../../middleware/verifyUser.midleware.js";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  syncCart,
} from "../../controllers/main/cart.controller.js";

const cartRouter = Router();

// Protect all cart routes with verifyUser middleware
cartRouter.use(verifyUser);

cartRouter.get("/", getCart);
cartRouter.post("/add", addToCart);
cartRouter.put("/:id", updateCartItemQuantity);
cartRouter.delete("/clear", clearCart);
cartRouter.delete("/:id", removeCartItem);
cartRouter.post("/sync", syncCart);

export default cartRouter;
