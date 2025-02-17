import express from "express";
import {
  login,
  logout,
  refreshToken,
  userInfo,
} from "../controllers/exampleController.js";
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

// import express from "express";

// const router = express.Router();

// router.get("/profile", verifyJWT, (req, res) => {
//   return res.json({ message: "Profile data", user: req.user });
// });

// router.get("/another-protected-route", verifyJWT, (req, res) => {
//   return res.json({ message: "This is another protected route", user: req.user });
// });
// export default router;
