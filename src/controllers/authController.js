import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Auth } from "../models/authModel.js";
import { verifyRecaptchaToken } from "../utils/verifyRecaptchaToken.js";
import transporter from "../utils/nodemailer.js";
import { User } from "../models/userModel.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await Auth.authenticate(email);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.user_password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const accessToken = jwt.sign(
    {
      email: user.user_email,
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

export const getServices = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const services = await Auth.getServices(id);

    if (!services || services.length === 0) {
      return res
        .status(404)
        .json({ message: "No services found for this user" });
    }

    return res.status(200).json({ message: "Services retrieved", services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
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
    process.env.ACCESS_TOKEN_SECRET,
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
            <p>If you didn't request this, you can ignore this email. Your password will remain unchanged.</p>
            <p style="color: #777; font-size: 12px;">For security reasons, this link will expire in 15 minutes.</p>
            <p>Best regards,<br><strong>Suitelifer Team</strong></p>
          </div>
        `,
  });
  res.status(200).json({
    isSuccess: true,
    message: "Password reset link sent! Check your email.",
  });
};
