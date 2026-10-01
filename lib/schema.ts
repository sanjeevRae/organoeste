/* Database schema — the single source of truth for the blog store.
 *
 *  - the app applies it at runtime through ensureSchema() (idempotent), so a
 *    database created in cPanel starts working without importing any SQL file;
 *  - scripts/seed-mysql.cjs reads these very statements to write
 *    scripts/db_setup.sql and scripts/db_setup.cpanel.sql;
 *  - scripts/db-apply.cjs imports the generated files (npm run db:push).
 *
 *  Keep every statement starting with "CREATE TABLE IF NOT EXISTS" inside a
 *  backtick string: the seed script extracts them with a regex. */

import { db, dbConfigured } from "./db";

export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS media_files (
  name VARCHAR(128) NOT NULL PRIMARY KEY,
  mime VARCHAR(64) NOT NULL,
  bytes INT UNSIGNED NOT NULL,
  data LONGBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_media_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  author VARCHAR(160) NOT NULL DEFAULT 'Equipe Organoeste',
  author_role VARCHAR(160) NOT NULL DEFAULT '',
  published_at DATE NOT NULL,
  updated_at DATE NOT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  image VARCHAR(255) NOT NULL,
  image_alt VARCHAR(255) NOT NULL DEFAULT '',
  content_html MEDIUMTEXT NOT NULL,
  show_toc TINYINT(1) NOT NULL DEFAULT 1,
  seo_title VARCHAR(255) NULL,
  meta_description VARCHAR(320) NULL,
  focus_keyword VARCHAR(160) NULL,
  canonical_url VARCHAR(255) NULL,
  og_image VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status_published (status, published_at),
  INDEX idx_category (category),
  FULLTEXT INDEX ft_content (title, excerpt, content_html)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS blog_tags (
  post_id INT NOT NULL,
  tag VARCHAR(100) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, tag),
  CONSTRAINT fk_blog_tags_post FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
];

/** Columns added over time: a database created from an older/partial export
    gets them on the first admin request instead of failing every write. */
export const POST_COLUMN_REPAIRS: { column: string; ddl: string }[] = [
  { column: "author_role", ddl: "author_role VARCHAR(160) NOT NULL DEFAULT ''" },
  { column: "image_alt", ddl: "image_alt VARCHAR(255) NOT NULL DEFAULT ''" },
  { column: "show_toc", ddl: "show_toc TINYINT(1) NOT NULL DEFAULT 1" },
  { column: "seo_title", ddl: "seo_title VARCHAR(255) NULL" },
  { column: "meta_description", ddl: "meta_description VARCHAR(320) NULL" },
  { column: "focus_keyword", ddl: "focus_keyword VARCHAR(160) NULL" },
  { column: "canonical_url", ddl: "canonical_url VARCHAR(255) NULL" },
  { column: "og_image", ddl: "og_image VARCHAR(255) NULL" },
  { column: "featured", ddl: "featured TINYINT(1) NOT NULL DEFAULT 0" },
  { column: "status", ddl: "status ENUM('draft','published') NOT NULL DEFAULT 'draft'" },
  { column: "created_at", ddl: "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP" },
  { column: "updated_ts", ddl: "updated_ts TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" },
];

export interface SchemaState {
  ready: boolean;
  /** Tables/columns created by this process (empty when nothing was missing). */
  added?: string[];
  error?: string;
}

let cached: { at: number; value: SchemaState } | null = null;
let running: Promise<SchemaState> | null = null;

/** Retry a failed attempt after this long (a fixed DB shouldn't need a restart). */
const RETRY_MS = 30_000;

export function schemaState(): SchemaState {
  return cached?.value ?? { ready: false };
}

function message(err: unknown): string {
  const text = err instanceof Error ? err.message : String(err);
  return text.replace(/\s+/g, " ").slice(0, 300);
}

async function apply(): Promise<SchemaState> {
  const added: string[] = [];
  try {
    for (const sql of SCHEMA_STATEMENTS) await db().query(sql);
    const [rows] = await db().query(
      "SELECT TABLE_NAME AS t, COLUMN_NAME AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()",
    );
    const have = new Set(
      (rows as { t: string; c: string }[]).map((r) => `${String(r.t).toLowerCase()}.${String(r.c).toLowerCase()}`),
    );
    for (const repair of POST_COLUMN_REPAIRS) {
      if (have.has(`blog_posts.${repair.column}`.toLowerCase())) continue;
      await db().query(`ALTER TABLE blog_posts ADD COLUMN ${repair.ddl}`);
      added.push(repair.column);
    }
    return { ready: true, added };
  } catch (err) {
    return { ready: false, added, error: message(err) };
  }
}

/** Creates/repairs the tables once per process. Never throws: the caller keeps
    working from the bundled data when the database is unusable. */
export async function ensureSchema(): Promise<SchemaState> {
  if (!dbConfigured()) {
    const value: SchemaState = { ready: false, error: "Sem DATABASE_URL/DB_HOST no ambiente (.env)." };
    cached = { at: Date.now(), value };
    return value;
  }
  if (cached && (cached.value.ready || Date.now() - cached.at < RETRY_MS)) return cached.value;
  if (!running) running = apply();
  const value = await running;
  running = null;
  cached = { at: Date.now(), value };
  return value;
}

