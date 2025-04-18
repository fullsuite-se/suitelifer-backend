import { db } from "../config/db.js";

const newsletterTable = () => db("sl_newsletters");

export const Newsletter = {
  getNewsletters: async (month, year) => {
    const query = newsletterTable()
      .select(
        "newsletter_id AS newsletterId",
        "title",
        "article",
        "month",
        "year",
        "pseudonym",
        "sl_newsletters.created_at AS createdAt",
        db.raw(
          "CONCAT(sl_user_accounts.first_name, ' ', LEFT(sl_user_accounts.middle_name, 1), '. ', sl_user_accounts.last_name) AS createdBy"
        )
      )
      .join("sl_user_accounts", {
        "sl_newsletters.created_by": "sl_user_accounts.user_id",
      })
      .where({ year });

    if (month > 0 && month < 13) {
      query.andWhere({ month });
    }

    query.orderBy("sl_newsletters.created_at", "asc");

    return query;
  },

  addNewsletter: async (newNewsletter) => {
    return await newsletterTable().insert(newNewsletter);
  },
};
