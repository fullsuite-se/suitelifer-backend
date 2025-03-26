import express from "express";
import {
  getAllPersonalityTests,
  insertPersonalityTest,
  updatePersonalityTest,
} from "../controllers/personalityTestController.js";

const router = express.Router();

router.get("/get-all-personality-tests", getAllPersonalityTests);

router.post("/add-personality-test", insertPersonalityTest);

router.post("/edit-personality-test", updatePersonalityTest);

export default router;
