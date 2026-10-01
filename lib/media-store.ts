/* Media store layer. Disk first (cheap), MySQL as the source of truth when it
   is reachable (hosts whose Node process cannot keep files). The /media route
   reads through mediaBytes(); saveUpload() writes to both when possible. */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "./db";
import { uploadsDir } from "./upload-dir";

/** Latest failure of the optional DB side (surfaced by /admin/doctor). */
let lastDbMediaError: string | null = null;

export function mediaDbError(): string | null {
  return lastDbMediaError;
}

const MEDIA_NAME_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,80}\.(jpg|jpeg|png|webp|gif|svg)$/i;

export function mediaNameOk(name: string): boolean {
  return MEDIA_NAME_RE.test(name);
}

async function writeDisk(name: string, bytes: Buffer): Promise<string | null> {
  try {
    const dir = uploadsDir();
    await mkdir(dir, { recursive: true });
    const target = path.join(dir, name);
    await writeFile(target, bytes);
    return target;
  } catch {
    return null;
  }
}

async function writeDb(name: string, mime: string, bytes: Buffer): Promise<boolean> {
  try {
    await db().query(
      "INSERT INTO media_files (name, mime, bytes, data) VALUES (?, ?, ?, ?) " +
        "ON DUPLICATE KEY UPDATE mime = ?, bytes = ?, data = ?",
      [name, mime, bytes.length, bytes, mime, bytes.length, bytes],
    );
    lastDbMediaError = null;
    return true;
  } catch (err) {
    lastDbMediaError = err instanceof Error ? err.message : String(err);
    return false;
  }
}

/** Where this upload ended up: the file on disk and/or the DB row. */
export interface StoredMedia {
  name: string;
  diskFile: string | null;
  inDb: boolean;
  bytes: number;
}

export async function storeUpload(name: string, mime: string, bytes: Buffer): Promise<StoredMedia> {
  const target = await writeDisk(name, bytes);
  const inDb = await writeDb(name, mime, bytes);
  return { name, diskFile: target, inDb, bytes: bytes.length };
}

/** Image bytes for /media: disk file first, DB row when the file is gone. */
export async function mediaBytes(name: string): Promise<{ bytes: Buffer; mime: string; from: "disk" | "db" } | null> {
  if (!mediaNameOk(name)) return null;
  try {
    const target = path.join(uploadsDir(), name);
    const bytes = await readFile(target);
    return { bytes, mime: mediaMime(name), from: "disk" };
  } catch {
    /* the file is not (or no longer) on this disk — ask the DB */
  }
  try {
    const [rows] = await db().query("SELECT mime, data FROM media_files WHERE name = ? LIMIT 1", [name]);
    const row = (rows as { mime: string; data: Buffer | Uint8Array | string }[])[0];
    if (!row || row.data === null || row.data === undefined) return null;
    const bytes = Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data as Uint8Array);
    lastDbMediaError = null;
    return { bytes, mime: row.mime || mediaMime(name), from: "db" };
  } catch (err) {
    lastDbMediaError = err instanceof Error ? err.message : String(err);
    return null;
  }
}

/** MIME by extension (upload-time types only; svgs keep their own type). */
export function mediaMime(name: string): string {
  switch (path.extname(name).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
