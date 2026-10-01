import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function dbConfigured(): boolean {
  return !!(process.env.DATABASE_URL?.trim() || process.env.DB_HOST?.trim());
}

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
  configured: boolean;
  posts: number;
  tables: boolean;
  error?: string;
}

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
