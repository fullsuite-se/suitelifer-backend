import { AuditLog } from "../models/auditLogModel.js";
import { now } from "../utils/date.js";
import { v7 as uuidv7 } from "uuid";

export const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || "";

    const { logs, count } = await AuditLog.getLogs(limit, offset, search);

    res.status(200).json({ logs, total: Number(count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addLog = async (req, res) => {
  try {
    const { description, action, userId } = req.body;

    const newLog = {
      log_id: uuidv7(),
      description,
      date: now(),
      action,
      user_id: userId,
    };

    await AuditLog.addLog(newLog);

    res.status(201).json({ success: true, message: "Log Added Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
