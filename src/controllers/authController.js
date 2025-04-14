import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Auth } from "../models/authModel.js";
import { verifyRecaptchaToken } from "../utils/verifyRecaptchaToken.js";
import transporter from "../utils/nodemailer.js";
import { User } from "../models/userModel.js";
import { v7 as uuidv7 } from "uuid";
import { db } from "../config/db.js";
import crypto from "crypto";

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await Auth.authenticate(email);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (!user.is_verified) {
    return res.status(403).json({
      message:
        "Account not yet verified. Please check your email for the verification link.",
      isNotVerified: true,
      userId: user.user_id,
      email: user.user_email,
    });
  }

  const isMatch = await bcrypt.compare(password, user.user_password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const accessToken = jwt.sign(
    {
      email: user.user_email,
      role: user.user_type,
      id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" } // Change this to 1h for production
  );

  const refreshToken = jwt.sign(
    {
      email: user.user_email,
      role: user.user_type,
      id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" } // Change this to 30d for production
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  res.json({ accessToken });
};
export const logout = (req, res) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    expires: new Date(0), // Expire immediately
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
    expires: new Date(0),
  });

  res.json({ message: "Logged out successfully", isLoggedOut: true });
};
export const register = async (req, res) => {
  const { firstName, middleName, lastName, workEmail, password } = req.body;

  const userId = uuidv7();
  const hashedPassword = await bcrypt.hash(password, 10);

  const data = {
    user_id: userId,
    user_email: workEmail,
    user_password: hashedPassword,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    created_at: db.fn.now(),
  };
  try {
    await Auth.registerUser(data);
    res.status(200).json({
      isSuccess: true,
      message: "User added successfully",
      userId: userId,
      email: workEmail,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendEmailVerificationCode = async (req, res) => {
  const { userId, email } = req.body;

  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  const hashedCode = await bcrypt.hash(code, 10);

  const token = jwt.sign({ userId: userId }, process.env.PASSWORD_RESET_KEY, {
    expiresIn: "15m",
  });

  const data = {
    code_id: uuidv7(),
    user_id: userId,
    verification_code: hashedCode,
    created_at: db.fn.now(),
    expires_at: db.raw("NOW() + INTERVAL 15 MINUTE"),
  };

  try {
    await Auth.addEmailVerificationCode(data);

    const verificationLink =
      process.env.NODE_ENV === "production"
        ? `${process.env.LIVE_URL}/verify-account?code=${code}&id=${token}`
        : `${process.env.VITE_API_BASE_URL}/verify-account?code=${code}&id=${token}`;

    await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: "Verify Your Account - Suitelifer",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #0097b2;">Verify Your Suitelifer Account</h2>
          <p>Hello,</p>
          <p>Thank you for signing up for Suitelifer! To complete your registration, please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${verificationLink}" 
              style="background-color: #0097b2; color: white; padding: 10px 20px; text-decoration: none; 
              border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify My Account
            </a>
          </p>
          <p><strong>This link is valid for 15 minutes.</strong> If it expires, please request a new verification email.</p>
          <p>If you didn't sign up for Suitelifer, you can ignore this email.</p>
          <p style="color: #777; font-size: 12px;">For security reasons, this link will expire in 15 minutes.</p>
        </div>
      `,
    });

    res.status(200).json({
      isSuccess: true,
      message: "Account verification link sent! Check your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const verifyEmailVerificationCode = async (req, res) => {
  const { code, id } = req.query;

  try {
    const decoded = jwt.verify(id, process.env.PASSWORD_RESET_KEY);

    console.log(decoded.userId);

    const user = await Auth.getEmailVerificationCodeById(decoded.userId);

    const isMatch = await bcrypt.compare(code, user.verification_code);

    if (!isMatch) {
      return res
        .status(401)
        .json({ isSuccess: false, message: "Invalid credentials" });
    }

    // Update the status of the account
    await Auth.updateUserVerificationStatus(user.user_id);
    res
      .status(200)
      .json({ isSuccess: true, message: "Account successfuly verified" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.error("Token has expired:", error.message);
      return res.status(400).json({
        isSuccess: false,
        message:
          "Your password verification link has expired. Please request a new one.",
      });
    }
    console.error("Other error:", error.message);
    return res
      .status(400)
      .json({ isSuccess: false, message: error.message || "Invalid request" });
  }
};

export const userInfo = (req, res) => {
  res.json({ user: req.user });
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token provided" });
  }

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Invalid or expired refresh token" });
      }

      if (!decoded || !decoded.email || !decoded.id) {
        return res.status(401).json({ message: "Invalid refresh token data" });
      }

      const newAccessToken = jwt.sign(
        {
          email: decoded.email,
          role: decoded.role,
          id: decoded.id,
          first_name: decoded.first_name,
          last_name: decoded.last_name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      });

      res.json({ accessToken: newAccessToken });
    }
  );
};

export const verifyApplication = async (req, res) => {
  const { recaptchaToken } = req.body;

  const response = await verifyRecaptchaToken(recaptchaToken);

  if (!response.isSuccess) {
    return res.status(400).json({ message: recaptcha.message });
  }

  if (!response.isHuman) {
    return res.status(403).json({ message: recaptcha.message });
  }

  return res.status(200).json({ message: response.message });
};

export const generatePasswordResetLink = async (req, res) => {
  const { email } = req.body;

  const user = await User.getUserByEmail(email);

  if (!user) {
    return res
      .status(404)
      .json({ isSuccess: false, message: "Email not found or invalid" });
  }

  const resetToken = jwt.sign(
    { userId: user.user_id },
    process.env.PASSWORD_RESET_KEY,
    { expiresIn: "15m" }
  );

  const hashedToken = await bcrypt.hash(resetToken, 10);
  await User.updateUserKey(user.user_id, hashedToken);

  const resetLink =
    process.env.NODE_ENV === "production"
      ? `${process.env.LIVE_URL}/reset-password?token=${resetToken}`
      : `${process.env.VITE_API_BASE_URL}/reset-password?token=${resetToken}`;

  await transporter.sendMail({
    from: process.env.NODEMAILER_USER,
    to: email,
    subject: "Reset Your Password - Suitelifer",
    html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 500px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #0097b2;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your Suitelifer account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" 
                style="background-color: #0097b2; color: white; padding: 10px 20px; text-decoration: none; 
                border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </p>
            <p><strong>This link is valid for 15 minutes.</strong> If it expires, you will need to request a new password reset.</p>
            <p>If you didn't request this, you can ignore this email. Your password will remain unchanged.</p>
            <p style="color: #777; font-size: 12px;">For security reasons, this link will expire in 15 minutes.</p>
          </div>
        `,
  });
  res.status(200).json({
    isSuccess: true,
    message: "Password reset link sent! Check your email.",
  });
};
