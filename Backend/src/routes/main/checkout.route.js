import { Router } from "express";
import { verifyUser } from "../../middleware/verifyUser.midleware.js";
import {
  getPaymentMethods,
  placeOrder,
} from "../../controllers/main/checkout.controller.js";

const checkoutRouter = Router();

checkoutRouter.get("/paymentmethods", getPaymentMethods);
checkoutRouter.post("/place-order", verifyUser, placeOrder);

export default checkoutRouter;
