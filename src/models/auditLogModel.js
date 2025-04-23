import { db } from "../config/db.js";

const auditLogsTable = () => db("sl_audit_logs");

export const AuditLog = {
  getLogs: async (limit, offset) => {
    const logs = await auditLogsTable()
      .select("log_id AS logId", "description", "date", "action", "user_id")
      .limit(limit)
      .offset(offset).orderBy("date", "desc");
    const { count } = await auditLogsTable().count("* AS count").first();

    return { logs, count };
  },

  addLog: async (newLog) => {
    return auditLogsTable().insert(newLog);
  },
};
