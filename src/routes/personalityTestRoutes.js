import express from "express";
import {
  deletePersonalityTest,
  getAllPersonalityTests,
  insertPersonalityTest,
  updatePersonalityTest,
} from "../controllers/personalityTestController.js";

const router = express.Router();

router.get("/get-all-personality-tests", getAllPersonalityTests);

router.post("/add-personality-test", insertPersonalityTest);

router.post("/edit-personality-test", updatePersonalityTest);

router.post("/delete-personality-test", deletePersonalityTest);

export default router;
