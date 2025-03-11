import express from "express";
import { getAllEvents } from "../controllers/eventController.js";

const router = express.Router();

router.get("/all-events", getAllEvents);

export default router;
