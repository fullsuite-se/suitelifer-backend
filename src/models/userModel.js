import { db } from "../config/db.js";

const userAccounts = "sl_user_accounts";
const userAccountsTable = () => db("sl_user_accounts");

export const User = {
  getAllUsers: async () => {
    return await db.select("*").from(userAccounts);
  },

  updateUserRole: async (user_type, user_id) => {
    return await userAccountsTable().update({ user_type }).where({ user_id });
  },

  updateUserStatus: async (is_active, user_id) => {
    return await userAccountsTable().update({ is_active }).where({ user_id });
  },

  deleteUserAccount: async (user_id) => {
    return await userAccountsTable().where({ user_id }).del();
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
