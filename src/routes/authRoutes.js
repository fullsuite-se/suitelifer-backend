import express from "express";
import {
  login,
  logout,
  refreshToken,
  userInfo,
  verifyApplication,
  sentPasswordResetLink,
  register,
  sendAccountVerificationLink,
  verifyAccountVerificationLink,
} from "../controllers/authController.js";
import verifyJWT from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/login", login);

router.post("/logout", logout);

router.post("/register", register);

router.post("/send-account-verification-link", sendAccountVerificationLink);

router.get("/verify-account-verification-link", verifyAccountVerificationLink);

router.post("/send-password-reset-link", sentPasswordResetLink);

router.get("/refresh-token", refreshToken);

router.post("/verify-recaptcha", verifyApplication);

router.get("/user-info", verifyJWT, userInfo);

export default router;
