import express from "express";
import { getExample, getExample2 } from "../controllers/exampleController.js";

const router = express.Router();

router.get("/", getExample);
router.get("/example2", getExample2);

export default router;
