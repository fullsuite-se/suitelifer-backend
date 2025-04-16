import express from "express";
import { getAllEvents, insertEvent } from "../controllers/eventController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/all-events", verifyToken, getAllEvents);

router.post("/add-event", verifyToken, verifyAdmin, insertEvent);

export default router;
