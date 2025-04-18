import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";
import { Newsletter } from "../models/newsletterModel.js";

export const getNewsletters = async (req, res) => {
  try {
    const { month = null, year } = req.query;

    const newsletters = await Newsletter.getNewsletters(month, year);

    res.status(200).json({ success: true, newsletters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertNewsletter = async (req, res) => {
  try {
    const { title, article, section, pseudonym, userId } = req.body;

    const month = now().getMonth() + 1;
    const year = now().getFullYear();

    const newNewsletter = {
      newsletter_id: uuidv7(),
      title,
      article,
      month,
      year,
      section,
      pseudonym,
      created_at: now(),
      created_by: userId,
    };

    await Newsletter.addNewsletter(newNewsletter);

    res.status(200).json({
      success: true,
      message: "Newsletter Added Successfully",
      newNewsletter,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
