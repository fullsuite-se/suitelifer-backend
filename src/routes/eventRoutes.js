import express from "express";
import { getAllEvents, insertEvent } from "../controllers/eventController.js";

const router = express.Router();

router.get("/all-events", getAllEvents);

router.post("/add-event", insertEvent);

export default router;
