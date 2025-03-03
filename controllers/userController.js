import { db } from "../config/db.js";
import { User } from "../models/userModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};
