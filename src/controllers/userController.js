import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { compactDecrypt, importPKCS8 } from "jose";
import { Auth } from "../models/authModel.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    console.log(err);
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

    const user = await Auth.getEmailVerificationCodeById(payload.id);

    const isMatch = await bcrypt.compare(payload.code, user.verification_code);

    if (!isMatch) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "Invalid verification code" });
    }

    // Hash the new password and update the user
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updatePassword(user.user_id, hashedPassword);

    await Auth.deleteEmailVerificationCodesById(user.user_id);
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
