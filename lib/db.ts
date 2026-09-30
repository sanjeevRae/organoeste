// MySQL connection for the blog store. Used by the /admin dashboard and other
// server-only paths — never import this from a client component.
// Configure with DATABASE_URL (preferred) or the discrete DB_* variables.
import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

/** Shared pool (created once, reused everywhere). Throws only when used. */
export function db(): mysql.Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL;
  pool = url
    ? mysql.createPool(url)
    : mysql.createPool({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD ?? "",
        database: process.env.DB_NAME || "organoeste",
        charset: "utf8mb4",
        waitForConnections: true,
        connectionLimit: 5,
        connectTimeout: 8000,
      });
  return pool;
}

export interface DbHealth {
  ok: boolean;
  posts: number;
  error?: string;
}

/** Reachability check for the admin bootstrap: server up + table readable. */
export async function dbPing(): Promise<DbHealth> {
  try {
    const [rows] = await db().query("SELECT COUNT(*) AS n FROM blog_posts");
    const n = Array.isArray(rows) ? Number((rows[0] as { n: unknown }).n) : 0;
    return { ok: true, posts: n };
  } catch (err) {
    return { ok: false, posts: 0, error: err instanceof Error ? err.message : String(err) };
  }
}
