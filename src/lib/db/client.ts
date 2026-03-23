import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  _db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

function createDb() {
  const sqlite = new Database("sqlite.db");
  sqlite.pragma("journal_mode = WAL");
  return drizzle(sqlite, { schema });
}

export const db = globalForDb._db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb._db = db;
}
