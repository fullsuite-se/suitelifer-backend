import { db } from "../config/db.js";

const userAccountTable = "sl_user_accounts";
const verificationCodeTable = "sl_verification_codes";

export const Auth = {
  authenticate: async (email) => {
    return await db.transaction(async (trx) => {
      return await trx(userAccountTable)
        .select(
          `${userAccountTable}.user_email`,
          `${userAccountTable}.user_type`,
          `${userAccountTable}.user_id`,
          // `${userAccountTable}.user_password`,
          `${userAccountTable}.profile_pic`,
          `${userAccountTable}.first_name`,
          `${userAccountTable}.last_name`,
          `${userAccountTable}.is_verified`,
          `${userAccountTable}.is_active`
        )
        .where(`${userAccountTable}.user_email`, email)
        .first();
    });
  },

  getVerificationCodeById: async (id) => {
    return await db(verificationCodeTable)
      .where(`${verificationCodeTable}.user_id`, id)
      .orderBy(`${verificationCodeTable}.created_at`, "desc")
      .first();
  },

  getVerificationCodeAttempt: async (id) => {
    return await db(verificationCodeTable)
      .where(`${verificationCodeTable}.user_id`, id)
      .andWhere(
        `${verificationCodeTable}.created_at`,
        ">=",
        db.raw("NOW() - INTERVAL 10 MINUTE")
      )
      .count("* as attempt")
      .first();
  },

  deleteVerificationCodesById: async (id) => {
    return await db(verificationCodeTable).where("user_id", id).del();
  },

  registerUser: async (user) => {
    return await db(userAccountTable).insert(user);
  },

  addVerificationCode: async (user) => {
    return await db(verificationCodeTable).insert(user);
  },

  updateUserVerificationStatus: async (id) => {
    return await db(userAccountTable).where("user_id", id).update({
      is_verified: true,
    });
  },
};
