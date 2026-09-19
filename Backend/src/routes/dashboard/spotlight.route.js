import { Router } from "express";
import multer from "multer";
import {
  getAllDashboardSpotlights,
  createSpotlight,
  updateSpotlight,
  deleteSpotlight,
} from "../../controllers/dashboard/spotlight.controller.js";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";

const spotlightDashboardRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

spotlightDashboardRouter.use(verifyAdmin);

spotlightDashboardRouter.get("/", getAllDashboardSpotlights);
spotlightDashboardRouter.post("/", upload.single("image"), createSpotlight);
spotlightDashboardRouter.put("/:id", upload.single("image"), updateSpotlight);
spotlightDashboardRouter.delete("/:id", deleteSpotlight);

export default spotlightDashboardRouter;
