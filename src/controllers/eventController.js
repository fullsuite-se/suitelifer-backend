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
    const { title, dateTime, description, userId } = req.body;

    if ((!title, !dateTime, !description, !userId)) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newEvent = {
      event_id: uuidv7(),
      title,
      date_time: dateTime,
      description,
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
