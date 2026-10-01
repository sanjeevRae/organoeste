import path from "node:path";
import { mediaBytes } from "@/lib/media-store";
import { uploadsDir } from "@/lib/upload-dir";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// NOTE: never hardcode the folder here — uploadsDir() is the single source of
// truth shared with the store layer (lib/media-store.ts), so writer and reader
// can never disagree. Bytes reach the browser through mediaBytes(): the disk
// file when it is there, the media_files DB row when it is not.

/** Any sane filename the uploader may have produced (timestamp-slug.ext). */
const SAFE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}\.(jpg|jpeg|png|webp|gif|svg)$/i;

function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

/** Disk readability check for a validated name; the bytes then come from
    mediaBytes() (disk file, else the media_files DB row). */
function resolveUploadPath(name: string): string | null {
  if (!SAFE_NAME.test(name)) return null;
  const dir = uploadsDir();
  const resolved = path.resolve(dir, name);
  // Comparing against the resolved basename keeps reads inside the folder.
  return resolved === path.join(dir, path.basename(name)) ? resolved : null;
}

function headersFor(size: number, type: string): Headers {
  return new Headers({
    "content-type": type,
    "content-length": String(size),
    // Names are unique per upload, so the bytes never change: cache hard.
    "cache-control": "public, max-age=31536000, immutable",
  });
}

/** GET /media/<file> — serves an admin upload, from disk when the file is
    there and from the media_files DB row when the host dropped it. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const found = await mediaBytes(name);
  if (!found) return notFound();
  // Uploads top out at 5 MB, so a single buffered read keeps the code (and the
  // tracing warning) simpler than a stream; content-length stays exact.
  return new Response(new Uint8Array(found.bytes), { headers: headersFor(found.bytes.length, found.mime) });
}

/** HEAD is what browsers/proxies and the dashboard's self-check use. */
export async function HEAD(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!resolveUploadPath(name)) return notFound();
  const found = await mediaBytes(name);
  if (!found) return notFound();
  return new Response(null, { headers: headersFor(found.bytes.length, found.mime) });
}

