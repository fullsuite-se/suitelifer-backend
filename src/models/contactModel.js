import { db } from "../config/db.js";

const table = () => db("sl_contact");

export const Contact = {
  getContact: async () => {
    return await db
      .select(
        "contact_id AS contactId",
        "website_email AS websiteEmail",
        "website_tel AS websiteTel",
        "website_phone AS websitePhone",
        "careers_email AS careersEmail",
        "internship_email AS internshipEmail",
        "careers_phone AS careersPhone"
      )
      .from("sl_contact")
      .orderBy("created_at", "desc")
      .first();
  },
  insertContact: async (newContact) => {
    await table().insert(newContact);
  },
};
