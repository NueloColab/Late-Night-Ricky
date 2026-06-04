import { createClient } from "@libsql/client";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import Database from "better-sqlite3";
import { drizzle as drizzleBetterSqlite } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

let db: any;

if (TURSO_URL) {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_AUTH_TOKEN });
  db = drizzleLibsql(client, { schema });
} else {
  const sqlite = new Database("./sqlite.db");
  db = drizzleBetterSqlite(sqlite, { schema });
}

export { db };
