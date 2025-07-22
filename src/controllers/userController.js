import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { compactDecrypt, importPKCS8 } from "jose";
import { Auth } from "../models/authModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    console.log("Unable to fetch Users", err);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error - Unable to fetch users",
      error: err.message 
    });
  }
};

export const updateUserType = async (req, res) => {
  try {
    const { userType, accountId } = req.body;

    if (!userType || !accountId) {
      return res.status(400).json({
        success: false,
        message: "Missing Required Fields: user type or user id",
      });
    }

    await User.updateUserRole(userType, accountId);

    return res
      .status(200)
      .json({ success: true, message: "User Type Updated Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { isActive, accountId } = req.body;

    if (!accountId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required field: user id" });
    }

    await User.updateUserStatus(isActive, accountId);

    res
      .status(200)
      .json({ success: true, message: "User Status Updated Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: account id",
      });
    }

    await User.deleteUserAccount(accountId);

    res
      .status(200)
      .json({ success: true, message: "User Account Deleted Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateUserPassword = async (req, res) => {
  const { newPassword, payloadEncrypted } = req.body;

  if (!newPassword || !payloadEncrypted) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "Invalid request" });
  }

  try {
    const privateKeyPEM = process.env.JWE_PRIVATE_KEY;
    const privateKey = await importPKCS8(privateKeyPEM, "RSA-OAEP");

    const { plaintext } = await compactDecrypt(payloadEncrypted, privateKey);
    const payload = JSON.parse(new TextDecoder().decode(plaintext));

    // Checking if yung token is still valid
    if (Date.now() / 1000 > payload.exp) {
      return res.status(400).json({
        isSuccess: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    const user = await Auth.getVerificationCodeById(payload.id);

    const isMatch = await bcrypt.compare(payload.code, user.verification_code);

    if (!isMatch) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "Invalid verification code" });
    }

    // Hash the new password and update the user
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updatePassword(user.user_id, hashedPassword);

    await Auth.deleteVerificationCodesById(user.user_id);
    // Invalidate the reset token/s
    res
      .status(200)
      .json({ isSuccess: true, message: "Password updated successfully" });
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

async function searchUsers(req, res) {
  const query = (req.query.q || '').toLowerCase();
  const users = await db.query(
    `SELECT user_id, CONCAT(first_name, ' ', last_name) AS name, email, avatar
     FROM sl_user_accounts
     WHERE LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(email) LIKE ?
     LIMIT 10`,
    [`%${query}%`, `%${query}%`, `%${query}%`]
  );
  res.json({ success: true, data: users });
}

export { searchUsers };
