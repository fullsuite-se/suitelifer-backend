import { db } from "../config/db.js";

const table = () => db("sl_events")

export const Event = {
  getAllEvents: async () => {
    return await db("sl_events");
  },

  insertEvent: async (newEvent) => {
    return await table().insert(newEvent);
  }
};
