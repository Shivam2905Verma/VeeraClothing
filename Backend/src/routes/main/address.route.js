import express from "express";
import { verifyUser } from "../../middleware/verifyUser.midleware.js";
import {
  getUserAddresses,
  saveUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from "../../controllers/main/address.controller.js";
import { zodValidateData } from "../../middleware/validateData.middleware.js";
import { registerAddressSchema } from "../../validators/main/address.schema.js";

const addressRouter = express.Router();

addressRouter.get("/", verifyUser, getUserAddresses);
addressRouter.post(
  "/",
  verifyUser,
  zodValidateData(registerAddressSchema),
  saveUserAddress,
);
addressRouter.put(
  "/:id",
  verifyUser,
  zodValidateData(registerAddressSchema),
  updateUserAddress,
);
addressRouter.delete("/:id", verifyUser, deleteUserAddress);

export default addressRouter;

