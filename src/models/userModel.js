import { db } from "../config/db.js";

const userAccounts = "sl_user_accounts";

export const User = {
  getAllUsers: async () => {
    return await db.select("*").from(userAccounts);
  },

  getUser: async (user_id) => {
    return await db
      .select("*")
      .from(userAccounts)
      .where({ user_id: user_id })
      .first();
  },

  getUserByEmail: async (email) => {
    return await db(userAccounts)
      .where(`${userAccounts}.user_email`, email)
      .first();
  },

  updateUserKey: async (userId, generatedKey) => {
    return await db(userAccounts)
      .where({ user_id: userId })
      .update({ reset_key: generatedKey });
  },

  updatePassword: async (userId, newPassword) => {
    return await db(userAccounts)
      .where({ user_id: userId })
      .update({ user_password: newPassword });
  },
};
