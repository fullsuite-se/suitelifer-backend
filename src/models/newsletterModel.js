import { db } from "../config/db.js";
import { deleteNewsletter } from "../controllers/newsletterController.js";

const issuesTable = () => db("sl_newsletter_issues");
const newsletterTable = () => db("sl_newsletters");
const newsletterImagesTable = () => db("sl_newsletter_images");

export const Newsletter = {
  getIssues: async (year) => {
    const rows = await issuesTable()
      .select(
        "sl_newsletter_issues.issue_id AS issueId",
        "month",
        "year",
        "is_published",
        "sl_newsletter_issues.created_at as issueCreatedAt",
        "is_published",
        "sl_newsletter_issues.created_at as issueCreatedAt",
        db.raw("COUNT(sl_newsletters.newsletter_id) AS articleCount"),
        db.raw(
          "COUNT(DISTINCT CASE WHEN section > 0 THEN section END) AS assigned"
        ),
        db.raw(
          "SUM(CASE WHEN section = 0 THEN 1 ELSE 0 END) as unassigned_count"
        )
      )
      .leftJoin("sl_newsletters", {
        "sl_newsletters.issue_id": "sl_newsletter_issues.issue_id",
      })
      .where("sl_newsletter_issues.year", year)
      .groupBy("sl_newsletter_issues.issue_id", "month", "year")
      .orderBy("month", "desc");

    return rows.map((row) => ({
      issueId: row.issueId,
      month: row.month,
      year: row.year,
      is_published: row.is_published,
      articleCount: Number(row.articleCount) || 0,
      assigned: Number(row.assigned) || 0,
      unassigned: Number(row.unassigned_count) || 0,
      issueCreatedAt: row.issueCreatedAt,
    }));
  },

  getCurrentlyPublishedIssue: async () => {
    const rows = await issuesTable()
      .select(
        "sl_newsletter_issues.issue_id AS issueId",
        "month",
        "year",
        "is_published",
        "sl_newsletter_issues.created_at as issueCreatedAt",
        db.raw("COUNT(newsletter_id) AS articleCount"),
        db.raw(
          "COUNT(DISTINCT CASE WHEN section > 0 THEN section END) AS assigned"
        ),
        db.raw("SUM(section = 0) as unassigned_count")
      )
      .innerJoin("sl_newsletters", {
        "sl_newsletters.issue_id": "sl_newsletter_issues.issue_id",
      })
      .where({ is_published: 1 })
      .groupBy("sl_newsletter_issues.issue_id");

    return rows.map((row) => ({
      issueId: row.issueId,
      month: row.month,
      year: row.year,
      is_published: row.is_published,
      articleCount: row.articleCount,
      assigned: row.assigned,
      unassigned: Number(row.unassigned_count),
      issueCreatedAt: row.issueCreatedAt,
    }))[0];
  },

  getOldestPublishedIssue: async () => {
    const row = await issuesTable()
      .select(
        "sl_newsletter_issues.issue_id AS issueId",
        "month",
        "year",
        "is_published",
        "sl_newsletter_issues.created_at as issueCreatedAt",
        db.raw("COUNT(newsletter_id) AS articleCount"),
        db.raw(
          "COUNT(DISTINCT CASE WHEN section > 0 THEN section END) AS assigned"
        ),
        db.raw("SUM(section = 0) as unassigned_count")
      )
      .leftJoin("sl_newsletters", {
        "sl_newsletters.issue_id": "sl_newsletter_issues.issue_id",
      })
      .groupBy("sl_newsletter_issues.issue_id", "month", "year")
      .orderBy("year", "asc")
      .first();

    return {
      issueId: row.issueId,
      month: row.month,
      year: row.year,
      is_published: row.is_published,
      articleCount: row.articleCount,
      assigned: row.assigned,
      unassigned: Number(row.unassigned_count),
      issueCreatedAt: row.issueCreatedAt,
    };
  },

  insertIssue: async (newIssue) => {
    return issuesTable().insert(newIssue);
  },

  findIssueByMonthAndYear: async (month, year) => {
    return await issuesTable()
      .select("issue_id")
      .where({ month, year })
      .first();
  },

  updateCurrentlyPublished: async (issue_id) => {
    await issuesTable().update({ is_published: 0 });

    return await issuesTable().update({ is_published: 1 }).where({ issue_id });
  },

  unpublishIssue: async (issue_id) => {
    return await issuesTable().update({ is_published: 0 }).where({ issue_id });
  },

  getIssueNewsletters: async (issue_id) => {
    const results = await newsletterTable()
      .select(
        "sl_newsletters.newsletter_id AS newsletterId",
        "title",
        "article",
        "pseudonym",
        "section",
        "sl_newsletters.created_at AS createdAt",
        "sl_newsletters.issue_id AS issueId",
        db.raw(
          "CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy"
        ),
        db.raw(`GROUP_CONCAT(sl_newsletter_images.image_url) AS images`)
      )
      .join("sl_user_accounts", {
        "sl_newsletters.created_by": "sl_user_accounts.user_id",
      })
      .leftJoin("sl_newsletter_images", {
        "sl_newsletter_images.newsletter_id": "sl_newsletters.newsletter_id",
      })
      .where({ issue_id })
      .groupBy(
        "sl_newsletters.newsletter_id",
        "sl_newsletters.title",
        "sl_newsletters.article",
        "sl_newsletters.pseudonym",
        "sl_newsletters.section",
        "sl_newsletters.created_at",
        "sl_user_accounts.first_name",
        "sl_user_accounts.middle_name",
        "sl_user_accounts.last_name"
      )
      .orderBy("section", "asc");

    return results.map((row) => ({
      ...row,
      images: row.images ? row.images.split(",") : [],
    }));
  },
  getNewsletterById: async (newsletterId) => {
    const result = await newsletterTable()
      .select(
        "sl_newsletters.newsletter_id AS newsletterId",
        "title",
        "article",
        "pseudonym",
        "section",
        "sl_newsletters.created_at AS createdAt",
        db.raw(`
          CONCAT(
            first_name, ' ',
            IF(middle_name IS NOT NULL AND middle_name != '', CONCAT(LEFT(middle_name, 1), '. '), ''),
            last_name
          ) AS createdBy
        `),
        db.raw(`GROUP_CONCAT(sl_newsletter_images.image_url) AS images`)
      )
      .join("sl_user_accounts", {
        "sl_newsletters.created_by": "sl_user_accounts.user_id",
      })
      .leftJoin("sl_newsletter_images", {
        "sl_newsletter_images.newsletter_id": "sl_newsletters.newsletter_id",
      })
      .where("sl_newsletters.newsletter_id", newsletterId)
      .groupBy(
        "sl_newsletters.newsletter_id",
        "sl_newsletters.title",
        "sl_newsletters.article",
        "sl_newsletters.pseudonym",
        "sl_newsletters.section",
        "sl_newsletters.created_at",
        "sl_user_accounts.first_name",
        "sl_user_accounts.middle_name",
        "sl_user_accounts.last_name"
      )
      .first();

    if (!result) return null;

    return {
      ...result,
      images: result.images ? result.images.split(",") : [],
    };
  },

  findNewsletterBySection: async (section, issue_id) => {
    return await newsletterTable()
      .select("newsletter_id")
      .where({ section, issue_id })
      .first();
  },

  makeNewsletterUnassigned: async (newsletterId) => {
    return await newsletterTable()
      .update({ section: 0 })
      .where({ newsletter_id: newsletterId });
  },

  insertNewsletter: async (newNewsletter) => {
    return await newsletterTable().insert(newNewsletter);
  },

  updateNewsletter: async (updates, newsletter_id) => {
    return await newsletterTable().update(updates).where({ newsletter_id });
  },

  deleteNewsletter: async (newsletter_id) => {
    return await newsletterTable().where({ newsletter_id }).del();
  },
  deleteNewsletterImage: async (newsletter_id) => {
    return await newsletterImagesTable()
      .where({ newsletter_id })
      .del();
  },

  insertNewsletterImage: async (newImage) => {
    return await newsletterImagesTable().insert(newImage);
  },

  deleteNewsletterImageByImageUrl: async (imageUrl) => {
    return await newsletterImagesTable()
      .where({ image_url: imageUrl })
      .del();
  }
  
};
