// MySQL connection for the blog store. Used by the /admin dashboard and the
// public blog pages — never import this from a client component.
// Configure with DATABASE_URL (preferred) or the discrete DB_* variables
// (the safer route on cPanel, where generated passwords often contain @ # !).
import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

/** Is a database configured at all? Without it everything falls back to the
    bundled data/blog-posts.ts, so the site still builds and serves. */
export function dbConfigured(): boolean {
  return !!(process.env.DATABASE_URL?.trim() || process.env.DB_HOST?.trim());
}

/** mysql://user:pass@host:3306/dbname?ssl=true — parsed like mysql2 does
    (percent-decoded credentials) so a password with @ or # cannot break it. */
function configFromUrl(raw: string): mysql.ConnectionOptions {
  const u = new URL(raw);
  return {
    host: decodeURIComponent(u.hostname),
    port: Number(u.port || 3306),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.replace(/^\//, "")),
  };
}

/** Shared pool (created once, reused everywhere). Throws only when used. */
export function db(): mysql.Pool {
  if (pool) return pool;
  const url = process.env.DATABASE_URL?.trim();
  const ssl =
    process.env.DB_SSL === "true" || (!!url && new URL(url).searchParams.get("ssl") === "true")
      ? { rejectUnauthorized: false }
      : undefined;
  const shared = {
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 5),
    connectTimeout: 8000,
    // Shared hosting drops idle sockets; keeping them warm avoids the first
    // query after a quiet period failing with PROTOCOL_CONNECTION_LOST.
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    ...(ssl ? { ssl } : {}),
  };
  pool = url
    ? mysql.createPool({ ...configFromUrl(url), ...shared })
    : mysql.createPool({
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD ?? "",
        database: process.env.DB_NAME || "organoeste",
        ...shared,
      });
  return pool;
}

export interface DbHealth {
  ok: boolean;
  /** False when no DATABASE_URL/DB_HOST is set, i.e. file mode on purpose. */
  configured: boolean;
  posts: number;
  /** False when the server answered but the tables were never imported. */
  tables: boolean;
  error?: string;
}

/** Reachability check used by the admin bootstrap: server up + table readable.
    Distinguishes "no credentials", "cannot connect" and "schema missing" so the
    dashboard can say what to fix after the first deploy. */
export async function dbPing(): Promise<DbHealth> {
  if (!dbConfigured()) {
    return { ok: false, configured: false, posts: 0, tables: false, error: "Sem DATABASE_URL/DB_HOST no ambiente." };
  }
  try {
    const [rows] = await db().query("SELECT COUNT(*) AS n FROM blog_posts");
    const n = Array.isArray(rows) ? Number((rows[0] as { n: unknown }).n) : 0;
    return { ok: true, configured: true, posts: n, tables: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const tables = !/ER_NO_SUCH_TABLE|doesn't exist|unknown table/i.test(message);
    return { ok: false, configured: true, posts: 0, tables, error: message };
  }
}
