import { Router } from "express";
import { verifyAdmin } from "../../middleware/verifyAdmin.middleware.js";
import { zodValidateData } from "../../middleware/validateData.middleware.js";
import {
  createMeasurementSchema,
  updateMeasurementSchema,
} from "../../validators/dashboard/measurement.schema.js";
import {
  getMeasurements,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from "../../controllers/dashboard/measurement.controller.js";

const measurementDashboardroute = Router();

measurementDashboardroute.use(verifyAdmin);

measurementDashboardroute.get("/", getMeasurements);
measurementDashboardroute.post(
  "/create",
  zodValidateData(createMeasurementSchema),
  createMeasurement
);
measurementDashboardroute.put(
  "/update/:id",
  zodValidateData(updateMeasurementSchema),
  updateMeasurement
);
measurementDashboardroute.delete("/delete/:id", deleteMeasurement);

export default measurementDashboardroute;
