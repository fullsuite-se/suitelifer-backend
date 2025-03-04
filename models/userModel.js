import { db } from "../config/db.js";

export const User = {
  getAllUsers: async () => {
    return await db.select("*").from("hris_user_accounts");
  },

  getUser: async (user_id) => {
    return await db.select("*").from("hris_user_accounts").where({user_id: user_id});
  }
};
