import express from "express";
import {
  deletePersonalityTest,
  getAllPersonalityTests,
  insertPersonalityTest,
  updatePersonalityTest,
} from "../controllers/personalityTestController.js";

const router = express.Router();

router.get("/personality-test", getAllPersonalityTests);

router.post("/personality-test", insertPersonalityTest);

router.put("/personality-test", updatePersonalityTest);

router.delete("/personality-test", deletePersonalityTest);

export default router;
