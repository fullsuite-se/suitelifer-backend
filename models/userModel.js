import { db } from "../config/db.js";

export const User = {
  getAllUsers: async () => {
    return await db.select("*").from("users");
  },
};
