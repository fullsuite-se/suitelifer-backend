import express from "express";
import {
  getServices,
  login,
  logout,
  refreshToken,
  userInfo,
  verifyApplication,
  generatePasswordResetLink,
  register,
  sendEmailVerificationCode,
  verifyEmailVerificationCode,
} from "../controllers/authController.js";
import verifyJWT from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/login", login);

router.post("/register", register);

router.post("/send-verification-code", sendEmailVerificationCode);

router.get("/verify-verification-code", verifyEmailVerificationCode);

router.post("/logout", logout);

router.post("/verify-recaptcha", verifyApplication);

router.get("/user-info", verifyJWT, userInfo);

router.get("/get-services/:id", getServices);

router.get("/refresh-token", refreshToken);

router.post("/reset-password", generatePasswordResetLink);

router.get("/profile", verifyJWT, (req, res) => {
  return res.json({ message: "Profile data", user: req.user });
});

export default router;
