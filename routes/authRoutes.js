import express from "express";
import {
  login,
  logout,
  refreshToken,
  userInfo,
} from "../controllers/authController.js";
import verifyJWT from "../middlewares/verifyJWT.js";

const router = express.Router();

router.post("/login", login);

router.post("/logout", logout);

router.get("/user-info", verifyJWT, userInfo);

router.get("/refresh-token", refreshToken);

router.get("/profile", verifyJWT, (req, res) => {
  return res.json({ message: "Profile data", user: req.user });
});

export default router;
