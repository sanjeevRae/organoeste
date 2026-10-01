import { createReadStream, promises as fs } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Same directory the uploader writes to (lib/admin-upload.ts), so the file is
    always found even when the host serves `public/` from somewhere else. */
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/** Any sane filename the uploader may have produced (timestamp-slug.ext). */
const SAFE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}\.(jpg|jpeg|png|webp|gif|svg)$/i;

function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

/** Validated absolute path for a request name, or null (traversal / bad ext). */
function resolveUploadPath(name: string): string | null {
  if (!SAFE_NAME.test(name)) return null;
  const resolved = path.resolve(UPLOAD_DIR, name);
  // Comparing against the resolved basename keeps reads inside public/uploads.
  return resolved === path.join(UPLOAD_DIR, path.basename(name)) ? resolved : null;
}

function headersFor(size: number, type: string): Headers {
  return new Headers({
    "content-type": type,
    "content-length": String(size),
    // Names are unique per upload, so the bytes never change: cache hard.
    "cache-control": "public, max-age=31536000, immutable",
  });
}

/** Size + content type of a readable upload file, or null when missing. */
async function describe(file: string): Promise<{ size: number; type: string } | null> {
  try {
    const stat = await fs.stat(file);
    if (!stat.isFile()) return null;
    return {
      size: stat.size,
      type: MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    };
  } catch {
    return null;
  }
}

/** GET /media/<file> — serves an admin upload from public/uploads. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const file = resolveUploadPath(name);
  if (!file) return notFound();
  const info = await describe(file);
  if (!info) return notFound();
  // Streamed so a 5 MB image is never held in memory; content-length comes from
  // the stat above, so the response is still a normal sized file.
  const body = Readable.toWeb(createReadStream(file)) as ReadableStream<Uint8Array>;
  return new Response(body, { headers: headersFor(info.size, info.type) });
}

/** HEAD is what browsers/proxies and the dashboard's self-check use. */
export async function HEAD(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const file = resolveUploadPath(name);
  if (!file) return notFound();
  const info = await describe(file);
  if (!info) return notFound();
  return new Response(null, { headers: headersFor(info.size, info.type) });
}

