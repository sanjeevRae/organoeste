import { constants, promises as fs } from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/admin";
import { db } from "@/lib/db";
import { mediaDbError, mediaNameOk } from "@/lib/media-store";
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
  const dir = uploadsDir();
  const info = await describeDir(dir);
  let mediaRows: number | null = null;
  try {
    const [rows] = await db().query("SELECT COUNT(*) AS n FROM media_files");
    mediaRows = Number((rows as { n: unknown }[])[0]?.n ?? 0);
  } catch (err) {
    mediaRows = null;
  }
  const body: Record<string, unknown> = {
    build: readBuildId(),
    mediaRouteLive: true,
    mediaDb: { rows: mediaRows, error: mediaDbError() },
    cwd: process.cwd(),
    uploadsDir: dir,
    uploadsDirFromEnv: !!process.env.UPLOAD_DIR?.trim(),
    ...info,
    routes: { primary: "/media/<nome>", legacy: "/uploads/<nome>" },
    siblings: await siblingCopies(dir),
  };
  const file = path.basename(new URL(req.url).searchParams.get("file") ?? "");
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
