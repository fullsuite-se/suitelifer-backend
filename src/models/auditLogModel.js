import { db } from "../config/db.js";
import { v7 as uuidv7 } from "uuid";

const auditLogsTable = () => db("sl_audit_logs");

export const AuditLog = {
  getLogs: async (limit, offset, search = "") => {
    const query = auditLogsTable()
      .select("log_id AS logId", "description", "date", "action", "user_id")
      .modify((qb) => {
        if (search) {
          qb.whereILike("description", `%${search}%`);
        }
      })
      .orderBy("date", "desc")
      .limit(limit)
      .offset(offset);

    const countQuery = auditLogsTable()
      .modify((qb) => {
        if (search) {
          qb.whereILike("description", `%${search}%`);
        }
      })
      .count("* AS count")
      .first();

    const [logs, { count }] = await Promise.all([query, countQuery]);

    return { logs, count };
  },

  addLog: async (newLog) => {
    // Add log_id if not provided
    const logData = {
      log_id: uuidv7(),
      ...newLog
    };
    
    const result = await auditLogsTable().insert(logData);
    return result;
  },
};
