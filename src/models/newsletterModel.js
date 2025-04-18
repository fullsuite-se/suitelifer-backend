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
        db.raw("COUNT(CASE WHEN section = 1 THEN 1 END) AS section1_count"),
        db.raw("COUNT(CASE WHEN section = 2 THEN 1 END) AS section2_count"),
        db.raw("COUNT(CASE WHEN section = 3 THEN 1 END) AS section3_count"),
        db.raw("COUNT(CASE WHEN section = 4 THEN 1 END) AS section4_count"),
        db.raw("COUNT(CASE WHEN section = 5 THEN 1 END) AS section5_count"),
        db.raw("COUNT(CASE WHEN section = 6 THEN 1 END) AS section6_count"),
        db.raw("COUNT(CASE WHEN section = 7 THEN 1 END) AS section7_count"),
        db.raw("SUM(section = 0) as unassigned_count")
      )
      .innerJoin("sl_newsletters", {
        "sl_newsletters.issue_id": "sl_newsletter_issues.issue_id",
      })
      .andWhereBetween("section", [0, 7])
      .groupBy("sl_newsletter_issues.issue_id")
      .orderBy("month", "desc");

    const getStatus = (count) => {
      if (count === 0) return "No articles yet";
      if (count === 1) return "Ready";
      return "Has duplicates";
    };

    return rows.map((row) => ({
      issueId: row.issueId,
      month: row.month,
      year: row.year,
      articleCount: row.articleCount,
      readyArticles: row.readyArticles,
      unassigned: Number(row.unassigned_count),
    }));
  },

  insertIssue: async (newIssue) => {
    return issuesTable().insert(newIssue);
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
