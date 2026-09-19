import { Router } from "express";
import { getMeasurementOfCategories } from "../../controllers/main/measurement.controller.js";

const measurementRouter = Router();

// Get all measurements needed for categories / cart items
measurementRouter.post("/", getMeasurementOfCategories);

export default measurementRouter;

