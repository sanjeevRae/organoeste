import { constants, promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/admin";
import { db } from "@/lib/db";
import { mediaDbError, mediaNameOk } from "@/lib/media-store";
import { dbConfigured } from "@/lib/db";
import { allPosts } from "@/lib/posts";
import { uploadsDir } from "@/lib/upload-dir";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SiblingCopy {
  dir: string;
  files: number;
  newest: string | null;
}

function readBuildId(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const built = require("node:fs").readFileSync(
      path.join(process.cwd(), ".next", "BUILD_ID"),
      "utf8",
    ) as string;
    return built.trim() || null;
  } catch {
    return null;
  }
}

async function describeDir(dir: string): Promise<{ exists: boolean; writable: boolean; files: number; newest: string | null }> {
  const out = { exists: false, writable: false, files: 0, newest: null as string | null };
  let entries: string[];
  try {
    entries = (await fs.readdir(dir)).filter((n) => n !== ".gitkeep");
  } catch {
    return out;
  }
  out.exists = true;
  try {
    await fs.access(dir, constants.W_OK);
    out.writable = true;
  } catch {
    /* exists but read-only */
  }
  out.files = entries.length;
  if (entries.length) {
    const stats = await Promise.all(
      entries.map(async (n) => ({ n, t: (await fs.stat(path.join(dir, n))).mtimeMs })),
    );
    stats.sort((a, b) => b.t - a.t);
    out.newest = stats[0].n;
  }
  return out;
}

/** Best-effort hunt for duplicate copies of the project on the same account
    (the classic "the file landed in the folder nobody serves"). Only one level
    up, only folders literally named public/uploads. */
async function siblingCopies(main: string): Promise<SiblingCopy[]> {
  const found: SiblingCopy[] = [];
  const parent = path.dirname(path.resolve(process.cwd()));
  let siblings: string[] = [];
  try {
    siblings = await fs.readdir(parent);
  } catch {
    return found;
  }
  for (const folder of siblings) {
    const candidate = path.join(parent, folder, "public", "uploads");
    if (path.resolve(candidate) === path.resolve(main)) continue;
    const info = await describeDir(candidate);
    if (info.exists) found.push({ dir: candidate, files: info.files, newest: info.newest });
  }
  return found;
}

/** GET /admin/doctor — admin-only JSON: where uploads really live, which build
    is running, and whether a given file is reachable. Open it while logged in,
    e.g. /admin/doctor?file=1700000000000-ab12cd-capa.png */
export async function GET(req: Request) {
  const store = await cookies();
  if (!isAdminCookie(store.get(ADMIN_COOKIE)?.value)) {
    return Response.json({ error: "entre no painel (/admin) para ver o diagnóstico." }, { status: 401 });
  }
  const search = new URL(req.url).searchParams;
  const probe = (search.get("probe") ?? "").trim().slice(0, 160);
  const dir = uploadsDir();
  const info = await describeDir(dir);

  const out: Record<string, unknown> = {
    build: readBuildId(),
    cwd: process.cwd(),
    mediaRouteLive: true,
    env: {
      dbConfigured: dbConfigured(),
      blogSource: process.env.BLOG_SOURCE ?? "mysql",
      mediaFolderFromEnv: !!process.env.UPLOAD_DIR?.trim(),
    },
    routes: {
      primary: "/media/<nome>",
      legacy: "/uploads/<nome>",
    },
  };

  // Database: tables, row counts, newest/edited row, and precise errors.
  const blogDb: Record<string, unknown> = { configured: dbConfigured() };
  try {
    const [tables] = await db().query(
      "SELECT TABLE_NAME AS t FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()",
    );
    const names = (tables as { t: string }[]).map((r) => String(r.t));
    blogDb.tables = names;
    blogDb.hasMediaFiles = names.includes("media_files");
    blogDb.hasBlog = ["blog_categories", "blog_posts", "blog_tags"].every((t) => names.includes(t));
    if (blogDb.hasBlog) {
      const [counts] = await db().query(
        "SELECT (SELECT COUNT(*) FROM blog_posts) AS posts, " +
          "(SELECT COUNT(*) FROM blog_categories) AS categories, " +
          "(SELECT COUNT(*) FROM blog_tags) AS tags",
      );
      const c = (counts as Record<string, unknown>[])[0] as Record<string, number>;
      blogDb.posts = Number(c.posts ?? 0);
      blogDb.categories = Number(c.categories ?? 0);
      blogDb.tags = Number(c.tags ?? 0);
      const [rows] = await db().query(
        "SELECT slug, title, status, updated_at, updated_ts FROM blog_posts ORDER BY updated_ts DESC LIMIT 5",
      );
      blogDb.recent = rows;
    }
    let mediaRows: number | null = null;
    if (blogDb.hasMediaFiles) {
      const [m] = await db().query("SELECT COUNT(*) AS n FROM media_files");
      mediaRows = Number((m as { n: unknown }[])[0]?.n ?? 0);
    }
    blogDb.mediaFiles = mediaRows;
  } catch (err) {
    blogDb.error = err instanceof Error ? err.message : String(err);
  }
  out.blogDb = blogDb;
  out.mediaDb = { rows: typeof blogDb.mediaFiles === "number" ? blogDb.mediaFiles : null, error: mediaDbError() };
  out.uploadsDir = dir;

  // ?probe=<slug|trecho do título> — exactly what the public pages fetch, so a
  // stale cache/build can be told apart from a row that is not in the database.
  if (probe) {
    const found = blogDb.hasBlog
      ? await db().query(
          "SELECT id, slug, title, status, image, updated_ts FROM blog_posts WHERE slug = ? OR title LIKE ? ORDER BY updated_ts DESC LIMIT 5",
          [probe, `%${probe}%`],
        ).then(([rows]) => rows)
      : null;
    out.probe = {
      query: probe,
      inDatabase: found,
      count: Array.isArray(found) ? found.length : null,
      whatPagesRead: await allPosts()
        .then((posts) => posts.map((p) => ({ slug: p.slug, title: p.title, status: p.status, image: p.image })))
        .catch((err) => ({ error: err instanceof Error ? err.message : String(err) })),
      source: blogDb.hasBlog ? "mysql" : "file (bundled)",
    };
  }

  const body: Record<string, unknown> = {
    ...out,
    ...info,
    siblings: await siblingCopies(dir),
  };
  const file = path.basename(search.get("file") ?? "");
  if (file) {
    let disk: { exists: boolean; bytes: number | null } = { exists: false, bytes: null };
    try {
      const stat = await fs.stat(path.join(dir, file));
      disk = { exists: stat.isFile(), bytes: stat.size };
    } catch {
      /* no disk file — the DB row is the fallback */
    }
    let row: { exists: boolean; bytes: number | null } | null = null;
    if (mediaNameOk(file)) {
      try {
        const [rows] = await db().query("SELECT bytes FROM media_files WHERE name = ? LIMIT 1", [file]);
        const hit = (rows as { bytes: unknown }[])[0];
        row = { exists: !!hit, bytes: hit ? Number(hit.bytes) : null };
      } catch {
        row = null;
      }
    }
    body.checkedFile = {
      name: file,
      disk,
      row,
      exists: disk.exists || row?.exists === true,
      url: `/media/${file}`,
      legacyUrl: `/uploads/${file}`,
    };
  }
  return Response.json(body, { headers: { "cache-control": "no-store" } });
}
