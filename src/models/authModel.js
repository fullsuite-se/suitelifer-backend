import { db } from "../config/db.js";

const userAccountTable = "sl_user_accounts";
const emailVerificationCodeTable = "sl_email_verification_codes";

export const Auth = {
  authenticate: async (email) => {
    return await db.transaction(async (trx) => {
      return await trx(userAccountTable)
        .select(
          `${userAccountTable}.user_email`,
          `${userAccountTable}.user_type`,
          `${userAccountTable}.user_id`,
          `${userAccountTable}.user_password`,
          `${userAccountTable}.first_name`,
          `${userAccountTable}.last_name`,
          `${userAccountTable}.is_verified`
        )
        .where(`${userAccountTable}.user_email`, email)
        .first();
    });
  },

  getEmailVerificationCodeById: async (id) => {
    return await db(emailVerificationCodeTable)
      .where(`${emailVerificationCodeTable}.user_id`, id)
      .orderBy(`${emailVerificationCodeTable}.created_at`, "desc")
      .first();
  },

  registerUser: async (user) => {
    return await db(userAccountTable).insert(user);
  },

  addEmailVerificationCode: async (user) => {
    return await db(emailVerificationCodeTable).insert(user);
  },

  updateUserVerificationStatus: async (id) => {
    return await db(userAccountTable).where("user_id", id).update({
      is_verified: true,
    });
  },
};
