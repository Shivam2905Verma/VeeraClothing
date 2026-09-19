import { Router } from "express";
import { getSpotlights } from "../../controllers/main/spotlight.controller.js";

const spotlightRouter = Router();

spotlightRouter.get("/", getSpotlights);

export default spotlightRouter;
