// lib/db-utils/query-wrapper.ts
import { query } from "@/lib/db";
import { DatabaseError } from "@/lib/error/database-error";

export async function safeQuery(sql: string, params: any[] = []) {
  try {
    return await query(sql, params);
  } catch (err) {
    throw new DatabaseError("Database error", err);
  }
}
