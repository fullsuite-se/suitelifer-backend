import express from "express";
import {
  deletePersonalityTest,
  getAllPersonalityTests,
  insertPersonalityTest,
  updatePersonalityTest,
} from "../controllers/personalityTestController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/personality-test", verifyToken, getAllPersonalityTests);

router.post("/personality-test", verifyToken, insertPersonalityTest);

router.put("/personality-test", verifyToken, updatePersonalityTest);

router.delete("/personality-test", verifyToken, deletePersonalityTest);

export default router;
