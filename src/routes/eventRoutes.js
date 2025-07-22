import express from "express";
import {
  deleteEvent,
  getAllEvents,
  getTodayEvents,
  getUpcomingEvents,
  insertEvent,
  updateEvent,
} from "../controllers/eventController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/events", getAllEvents);

router.get("/events/today", getTodayEvents);

router.get("/events/upcoming", getUpcomingEvents);

router.post("/events", verifyToken, verifyAdmin, insertEvent);

router.put("/events", verifyToken, verifyAdmin, updateEvent);

router.delete("/events", verifyToken, verifyAdmin, deleteEvent);

export default router;
