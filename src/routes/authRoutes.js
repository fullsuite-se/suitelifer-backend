import express from "express";
import {
  getServices,
  login,
  logout,
  refreshToken,
  userInfo,
  verifyApplication,
} from "../controllers/authController.js";
import verifyJWT from "../middlewares/verifyJWT.js";
import { recaptcha } from "../middlewares/recaptcha.js";

const router = express.Router();

router.post("/login", recaptcha, login);

router.post("/logout", logout);

router.post("/verify-recaptcha", verifyApplication);

router.get("/user-info", verifyJWT, userInfo);

router.get("/get-services/:id", getServices);

router.get("/refresh-token", refreshToken);

router.get("/profile", verifyJWT, (req, res) => {
  return res.json({ message: "Profile data", user: req.user });
});

export default router;
