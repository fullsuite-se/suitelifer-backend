import express from "express";
import {
  login,
  logout,
  refreshToken,
  userInfo,
  verifyApplication,
  sendPasswordResetLink,
  register,
  sendAccountVerificationLink,
  verifyAccountVerificationLink,
} from "../controllers/authController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/login", login);

router.post("/logout", logout);

router.post("/register", register);

router.post("/send-account-verification-link", sendAccountVerificationLink);

router.get("/verify-account-verification-link", verifyAccountVerificationLink);

router.post("/send-password-reset-link", sendPasswordResetLink);

router.get("/refresh-token", refreshToken);

router.post("/verify-recaptcha", verifyApplication);

router.get("/user-info", verifyToken, userInfo);

export default router;
