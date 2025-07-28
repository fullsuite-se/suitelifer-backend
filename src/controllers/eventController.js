import { Event } from "../models/eventModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.status(200).json(events);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const insertEvent = async (req, res) => {
  try {
    const { title, description, dateStart, dateEnd, userId } = req.body;

    if ((!title, !description, !dateStart, !userId)) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newEvent = {
      event_id: uuidv7(),
      title,
      description,
      date_start: dateStart,
      date_end: dateEnd ?? null,
      created_at: now(),
      created_by: userId,
    };

    await Event.insertEvent(newEvent);

    res
      .status(201)
      .json({ success: true, message: "Event added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { title, description, dateStart, dateEnd, userId } = req.body;

    if ((!title, !description, !dateStart, !userId)) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Missing required fields: title, description, date start, or user id",
        });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
