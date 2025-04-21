import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";
import { Newsletter } from "../models/newsletterModel.js";

export const getIssues = async (req, res) => {
  try {
    const { year } = req.query;

    const issues = await Newsletter.getIssues(year);

    res.status(200).json({ success: true, issues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getCurrentlyPublishedIssue = async (req, res) => {
  try {
    const currentIssue = await Newsletter.getCurrentlyPublishedIssue();

    res.status(200).json({ success: true, currentIssue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertIssue = async (req, res) => {
  try {
    const { month, year, userId } = req.body;

    const newIssue = {
      issue_id: uuidv7(),
      month,
      year,
      created_at: now(),
      created_by: userId,
    };

    await Newsletter.insertIssue(newIssue);

    res
      .status(201)
      .json({ success: true, message: "New Issue Added Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateCurrentlyPublished = async (req, res) => {
  try {
    const { issueId } = req.body;

    if (!issueId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required field: issue id" });
    }

    await Newsletter.updateCurrentlyPublished(issueId);

    res.status(200).json({
      success: true,
      message: "Currently Published Newsletter Issue Updated Successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getNewsletters = async (req, res) => {
  try {
    const { issueId } = req.query;

    const newsletters = await Newsletter.getIssueNewsletters(issueId);

    res.status(200).json({ success: true, newsletters });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertNewsletter = async (req, res) => {
  try {
    const { title, article, section, pseudonym, userId, issueId } = req.body;

    const newNewsletter = {
      newsletter_id: uuidv7(),
      title,
      article,
      section,
      pseudonym,
      created_at: now(),
      created_by: userId,
      issue_id: issueId,
    };

    await Newsletter.insertNewsletter(newNewsletter);

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

export const updateNewsletter = async (req, res) => {
  try {
    const { newsletterId, title, article, section, pseudonym, userId } =
      req.body;

    if (
      !title ||
      !article ||
      section === null ||
      section === undefined ||
      pseudonym === null ||
      pseudonym === undefined ||
      !userId
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const updates = {
      title,
      article,
      section,
      pseudonym,
    };

    await Newsletter.updateNewsletter(updates, newsletterId);

    res.status(200).json({
      success: true,
      message: "Newsletter Article Updated Successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteNewsletter = async (req, res) => {
  try {
    const { newsletterId } = req.body;

    if (!newsletterId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: newsletter id",
      });
    }

    await Newsletter.deleteNewsletter(newsletterId);

    res.status(200).json({
      success: true,
      message: "Newsletter Article Deleted Successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
