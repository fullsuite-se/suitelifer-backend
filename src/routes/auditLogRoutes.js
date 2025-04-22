import express from "express";
import { addLog, getLogs } from "../controllers/auditLogController.js";

const router = express.Router();

router.get("/audit-logs", getLogs);

router.post("/audit-logs", addLog);

export default router;
