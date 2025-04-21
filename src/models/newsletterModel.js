import { db } from "../config/db.js";

const issuesTable = () => db("sl_newsletter_issues");
const newsletterTable = () => db("sl_newsletters");

export const Newsletter = {
  getIssues: async (year) => {
    const rows = await issuesTable()
      .select(
        "sl_newsletter_issues.issue_id AS issueId",
        "month",
        "year",
        db.raw("COUNT(newsletter_id) AS articleCount"),
        db.raw(
          "COUNT(DISTINCT CASE WHEN section > 0 THEN section END) AS readyArticles"
        ),
        db.raw("SUM(section = 0) as unassigned_count")
      )
      .where({ year })
      .innerJoin("sl_newsletters", {
        "sl_newsletters.issue_id": "sl_newsletter_issues.issue_id",
      })
      .groupBy("sl_newsletter_issues.issue_id")
      .orderBy("month", "desc");

    return rows.map((row) => ({
      issueId: row.issueId,
      month: row.month,
      year: row.year,
      articleCount: row.articleCount,
      readyArticles: row.readyArticles,
      unassigned: Number(row.unassigned_count),
    }));
  },

  getCurrentlyPublishedIssue: async () => {
    const rows = await issuesTable()
      .select(
        "sl_newsletter_issues.issue_id AS issueId",
        "month",
        "year",
        db.raw("COUNT(newsletter_id) AS articleCount"),
        db.raw(
          "COUNT(DISTINCT CASE WHEN section > 0 THEN section END) AS readyArticles"
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
      articleCount: row.articleCount,
      readyArticles: row.readyArticles,
      unassigned: Number(row.unassigned_count),
    }))[0];
  },

  insertIssue: async (newIssue) => {
    return issuesTable().insert(newIssue);
  },

  updateCurrentlyPublished: async (issue_id) => {
    await issuesTable().update({ is_published: 0 });

    return await issuesTable().update({ is_published: 1 }).where({ issue_id });
  },

  getIssueNewsletters: async (issue_id) => {
    return newsletterTable()
      .select(
        "newsletter_id AS newsletterId",
        "title",
        "article",
        "pseudonym",
        "section",
        "sl_newsletters.created_at AS createdAt",
        db.raw(
          "CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy"
        )
      )
      .join("sl_user_accounts", {
        "sl_newsletters.created_by": "sl_user_accounts.user_id",
      })
      .where({ issue_id })
      .orderBy("section", "desc");
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
};
