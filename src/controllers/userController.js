import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
};

export const updateUserPassword = async (req, res) => {
  const { newPassword, token } = req.body;

  if (!newPassword || !token) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "Invalid request" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.getUser(decoded.userId);

    if (!user) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "Invalid request" });
    }

    const tokenIsValid = await bcrypt.compare(token, user.user_key);

    if (!tokenIsValid) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "Invalid request" });
    }
    res.json(user);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.error("Token has expired:", error.name);
      return res.status(400).json({
        isSuccess: false,
        message:
          "Your password reset link has expired. Please request a new one.",
      });
    }

    console.error("Other error:", error.name);
    return res
      .status(400)
      .json({ isSuccess: false, message: "Invalid request" });
  }
};
