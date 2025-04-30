import { v7 as uuidv7 } from "uuid";
import { now } from "../utils/date.js";
import { Newsletter } from "../models/newsletterModel.js";

export const getAllIssues = async (req, res) => {
  try {
    const issues = await Newsletter.getAllIssues();
    res.status(200).json({ success: true, issues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

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

export const getOldestPublishedIssue = async (req, res) => {
  try {
    const oldestIssue = await Newsletter.getOldestPublishedIssue();

    res.status(200).json({ success: true, oldestIssue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertIssue = async (req, res) => {
  try {
    const { month, year, userId } = req.body;
    const existing = await Newsletter.findIssueByMonthAndYear(month, year);
    if (existing) {
      return res.status(400).json({
        success: false,
        month: month,
        year: year,
      });
    }
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

export const getNewsletterById = async (req, res) => {
  try {
    const { id } = req.params;

    const newsletter = await Newsletter.getNewsletterById(id);

    if (!newsletter) {
      return res
        .status(404)
        .json({ success: false, message: "Newsletter not found" });
    }

    res.status(200).json({ success: true, newsletter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertNewsletter = async (req, res) => {
  try {
    const { title, article, section, pseudonym, userId, issueId, isOverride } =
      req.body;

    const newsletter_id = uuidv7();

    if (isOverride) {
      const existingNewsletter = await Newsletter.findNewsletterBySection(
        Number(section),
        issueId
      );
      console.log("existingNewsletter", existingNewsletter);
      console.log(existingNewsletter?.newsletter_id);
      if (existingNewsletter && existingNewsletter?.newsletter_id) {
        await Newsletter.makeNewsletterUnassigned(
          existingNewsletter.newsletter_id
        );
      } else {
        console.log("No existing newsletter found for this section");
      }
    }

    const newNewsletter = {
      newsletter_id,
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
      newsletterId: newsletter_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const insertNewsletterImages = async (req, res) => {
  try {
    const { newsletterId, images } = req.body;

    if (!newsletterId || !images || !Array.isArray(images)) {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid required fields",
      });
    }

    const isValidUrl = (url) => {
      return /^https:\/\/res\.cloudinary\.com\/.+\.(webp|jpg|jpeg|png|heic)$/.test(
        url
      );
    };

    const seen = new Set();
    const validImages = [];

    for (const image of images) {
      if (!isValidUrl(image)) continue;
      if (seen.has(image)) continue;
      seen.add(image);
      validImages.push({
        newsletter_image_id: uuidv7(),
        image_url: image,
        newsletter_id: newsletterId,
      });
    }

    if (validImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid or unique images provided",
      });
    }

    await Newsletter.insertNewsletterImage(validImages);

    res.status(200).json({
      success: true,
      message: "Newsletter Images Added Successfully",
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
