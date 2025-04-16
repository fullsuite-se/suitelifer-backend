import express from "express";
import {
  deletePersonalityTest,
  getAllPersonalityTests,
  insertPersonalityTest,
  updatePersonalityTest,
} from "../controllers/personalityTestController.js";
import verifyToken from "../middlewares/verifyToken.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/personality-test", verifyToken, getAllPersonalityTests);

router.post(
  "/personality-test",
  verifyToken,
  verifyAdmin,
  insertPersonalityTest
);

router.put(
  "/personality-test",
  verifyToken,
  verifyAdmin,
  updatePersonalityTest
);

router.delete(
  "/personality-test",
  verifyToken,
  verifyAdmin,
  deletePersonalityTest
);

export default router;
