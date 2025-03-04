import { db } from "../config/db.js";

export const Event = {
  getAllEvents: async () => {
    return await db.select("*").from("sl_events");
  },
};
