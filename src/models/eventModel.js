import { db } from "../config/db.js";

const eventsTable = () => db("sl_events");

export const Event = {
  getAllEvents: async () => {
    return await eventsTable()
      .select(
        "event_id AS eventId",
        "title",
        "description",
        "date_start AS start",
        "date_end AS end",
        "gdrive_link AS gdriveLink",
        "sl_events.created_at AS createdAt",
        db.raw(`
          CONCAT(
            first_name, ' ',
            IF(middle_name IS NOT NULL AND middle_name != '', CONCAT(LEFT(middle_name, 1), '. '), ''),
            last_name
          ) AS createdBy
        `)
      )
      .join("sl_user_accounts", {
        "sl_user_accounts.user_id": "sl_events.created_by",
      });
  },

  getTodayEvents: async (today) => {
    return await eventsTable()
      .select(
        "event_id AS eventId",
        "title",
        "description",
        "date_start AS start",
        "date_end AS end",
        "gdrive_link AS gdriveLink",
        "sl_events.created_at AS createdAt",
        db.raw(
          `CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy`
        )
      )
      .join(
        "sl_user_accounts",
        "sl_user_accounts.user_id",
        "sl_events.created_by"
      )
      .whereRaw("DATE(date_start) = ?", [today])
      .orderBy("date_start", "asc");
  },

  getUpcomingEvents: async (today) => {
    return await eventsTable()
      .select(
        "event_id AS eventId",
        "title",
        "description",
        "date_start AS start",
        "date_end AS end",
        "gdrive_link AS gdriveLink",
        "sl_events.created_at AS createdAt",
        db.raw(
          `CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy`
        )
      )
      .join(
        "sl_user_accounts",
        "sl_user_accounts.user_id",
        "sl_events.created_by"
      )
      .whereRaw("DATE(date_start) > ?", [today])
      .orderBy("date_start", "asc");
  },

  insertEvent: async (newEvent) => {
    return await eventsTable().insert(newEvent);
  },

  updateEvent: async (event_id, updates) => {
    return await eventsTable().update(updates).where({ event_id });
  },

  deleteEvent: async (event_id) => {
    return await eventsTable().where({ event_id }).del();
  },
};
