import path from "node:path";

/** Single source of truth for where editor uploads live.
 *
 *  Default: `<process.cwd()>/public/uploads` — how cPanel/Passenger starts the
 *  app (cwd = application root), and exactly where Next serves `public/` from.
 *
 *  Set `UPLOAD_DIR` to an absolute path when the host starts Node from a
 *  different folder than the one the request reaches — e.g. two copies of the
 *  project on the same account, or the app root remapped by the panel. Both the
 *  uploader (`lib/admin-upload.ts`) and the reader (`app/media/[name]`) call this
 *  function on every operation, so write and read can never disagree — and a
 *  server `UPLOAD_DIR` change applies after a plain Restart, no rebuild needed. */
export function uploadsDir(): string {
  const custom = process.env.UPLOAD_DIR?.trim();
  return custom ? path.resolve(custom) : path.join(process.cwd(), "public", "uploads");
}
