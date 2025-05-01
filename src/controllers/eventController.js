import moment from "moment";
import { Event } from "../models/eventModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.status(200).json({ success: true, events });
  } catch (err) {
    console.log("Unable to fetch Events", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTodayEvents = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");

    const todayEvents = await Event.getTodayEvents(today);

    return res.status(200).json({ success: true, todayEvents });

    return res.status(200);
  } catch (err) {
    console.log("Unable to fetch today's Events", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUpcomingEvents = async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");

    const upcomingEvents = await Event.getUpcomingEvents(today);

    return res.status(200).json({ success: true, upcomingEvents });
  } catch (err) {
    console.log("Unable to fetch Upcoming Events", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const insertEvent = async (req, res) => {
  try {
    const { title, description, start, end, userId } = req.body;

    if ((!title, !description, !start, !userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newEvent = {
      event_id: uuidv7(),
      title,
      description,
      date_start: new Date(start).toISOString().slice(0, 19).replace("T", " "),
      date_end:
        new Date(end).toISOString().slice(0, 19).replace("T", " ") ?? null,
      created_at: now(),
      created_by: userId,
    };

    await Event.insertEvent(newEvent);

    res
      .status(201)
      .json({ success: true, message: "Event added successfully" });
  } catch (err) {
    console.log("Unable to add Event",err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId, title, description, start, end, userId } = req.body;

    if ((!eventId, !title, !description, !start, !userId)) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: event id, title, description, date start, or user id",
      });
    }

    const updates = {
      title,
      description,
      date_start: new Date(start).toISOString().slice(0, 19).replace("T", " "),
      date_end:
        new Date(end).toISOString().slice(0, 19).replace("T", " ") ?? null,
    };

    await Event.updateEvent(eventId, updates);

    res
      .status(200)
      .json({ success: true, message: "Event Updated Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    if (!eventId)
      return res
        .status(400)
        .json({ success: false, message: "Missing required field: event id" });

    await Event.deleteEvent(eventId);

    res
      .status(200)
      .json({ succes: true, message: "Event Deleted Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
