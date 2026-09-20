import { Router } from "express";
import multer from "multer";
import {
  getAllDashboardSpotlights,
  createSpotlight,
  updateSpotlight,
  deleteSpotlight,
} from "../../controllers/dashboard/spotlight.controller.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";
import { zodValidateData } from "../../middleware/validateData.middleware.js";
import {
  createSpotlightSchema,
  updateSpotlightSchema,
} from "../../validators/dashboard/spotlight.schema.js";

const spotlightDashboardRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

spotlightDashboardRouter.use(verifyAdmin);

spotlightDashboardRouter.get("/", getAllDashboardSpotlights);
spotlightDashboardRouter.post(
  "/",
  upload.single("image"),
  zodValidateData(createSpotlightSchema),
  createSpotlight,
);
spotlightDashboardRouter.put(
  "/:id",
  upload.single("image"),
  zodValidateData(updateSpotlightSchema),
  updateSpotlight,
);
spotlightDashboardRouter.delete("/:id", deleteSpotlight);

export default spotlightDashboardRouter;
