import express from "express";
import {
  getAllPersonalityTests,
  insertPersonalityTest,
} from "../controllers/personalityTestController.js";

const router = express.Router();

router.get("/get-all-personality-tests", getAllPersonalityTests);

router.post("/add-personality-test", insertPersonalityTest);

export default router;
