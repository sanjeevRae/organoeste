"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BlogPost } from "@/data/blog-posts";
import { BLANK_POST, toForm, type PostForm } from "@/lib/admin-format";
import {
  adminBootstrap,
  adminDeletePost,
  adminLogin,
  adminLogout,
  adminSavePost,
  adminUploadImage,
  type AdminState,
} from "./actions";
import RichEditor from "./RichEditor";

type Post = BlogPost & { id?: number };
type TabKey = "all" | "published" | "draft" | "scheduled";

const PAGE_SIZE = 8;

export function download(name: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "Scheduled" is derived: published posts dated after today. */
function displayStatus(p: Post): "published" | "draft" | "scheduled" {
  if (p.status === "draft") return "draft";
  if ((p.publishedAt || "") > todayISO()) return "scheduled";
  return "published";
}

function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  if (!m) return iso || "—";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

/** Deterministic fake clock so the "Updated" column has two lines. */
function fakeTime(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 720;
  const hour24 = 8 + Math.floor(h / 60);
  const min = h % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = ((hour24 + 11) % 12) + 1;
  return `${hour12}:${String(min).padStart(2, "0")} ${suffix}`;
}

function fmtPublish(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  if (!m) return iso || "Select date";
  return `${fmtDate(iso)} ${fakeTime(iso)}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "AD";
  return (parts[0][0] + (parts[parts.length - 1][0] ?? "")).toUpperCase();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function Login({ onOk }: { onOk: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="dash-login-wrap">
      <form
        className="dash-login-card"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const res = await adminLogin({ password });
          setBusy(false);
          if (res.ok) onOk();
          else setError(res.error ?? "Could not sign in.");
        }}
      >
        <span className="dash-login-mark" aria-hidden="true">O</span>
        <h1 className="dash-login-title">Blog Dashboard</h1>
        <p className="dash-login-sub">Sign in with your admin password to manage posts.</p>
        <input
          className="dash-input"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="dash-error" role="alert">{error}</p> : null}
        <button className="dash-btn-primary" type="submit" disabled={busy || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
/* ---------------- editor slide-over ---------------- */

interface EditorPanelProps {
  form: PostForm;
  setForm: (f: PostForm) => void;
  categories: string[];
  notice: string;
  saving: boolean;
  isNew: boolean;
  onClose: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUpload: (file: File) => Promise<string | null>;
  /** Href opened by the "Open in new tab" menu. Null hides the menu. */
  popoutHref?: string | null;
  /** Full-page instances hide the popout menu (nothing to pop out to). */
  showPopout?: boolean;
  /** Present when the database refused the write: renders an explicit download
      button instead of pushing a file to the reader on its own. */
  fallback?: { name: string; text: string } | null;
  onDownload?: () => void;
}

export function EditorPanel({
  form, setForm, categories, notice, saving, isNew,
  onClose, onSave, onCancel, onUpload,
  popoutHref = null, showPopout = true, fallback = null, onDownload,
}: EditorPanelProps) {
  const [coverBusy, setCoverBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  /** Editing an existing post must never rewrite its slug behind the user's
      back; a new post follows the title until the slug field is touched. */
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLSpanElement | null>(null);
  const excerptCount = form.excerpt.trim().length;

  useEffect(() => {
    if (!menuOpen) return;
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);
  function set<K extends keyof PostForm>(key: K, value: PostForm[K]) {
    setForm({ ...form, [key]: value });
  }

  function slugify(v: string): string {
    return v
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function copySlug() {
    if (!form.slug) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(form.slug).catch(() => {});
    }
  }


  async function pickCover(file: File | undefined) {
    if (!file) return;
    setCoverBusy(true);
    const url = await onUpload(file);
    setCoverBusy(false);
    if (url) {
      const next = { ...form, image: url };
      if (!form.imageAlt && form.title) next.imageAlt = form.title;
      setForm(next);
    }
  }

  return (
    <div className="dash-panel" role="dialog" aria-label={isNew ? "New blog post" : "Edit blog post"}>
      <div className="dash-panel-head">
        <button type="button" className="dash-iconbtn" onClick={onClose} aria-label="Back to list"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg></button>
        <h2 className="dash-panel-title">{isNew ? "New Blog Post" : "Edit Blog Post"}</h2>
        <div className="dash-panel-head-actions">
          {showPopout && popoutHref ? (
            <span className="dash-popout" ref={menuRef}>
              <button type="button" className="dash-iconbtn" aria-label="More options" title="More options" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>Open</button>
              {menuOpen ? (
                <span className="dash-rowmenu-pop" role="menu">
                  <a role="menuitem" href={popoutHref} target="_blank" rel="noopener" onClick={() => setMenuOpen(false)}>Open in new tab</a>
                </span>
              ) : null}
            </span>
          ) : null}
          <button type="button" className="dash-iconbtn" onClick={onClose} aria-label="Close editor"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
        </div>
      </div>

      <div className="dash-panel-body">
        {notice ? (
          <p className="dash-notice" role="status">
            {notice}
            {fallback && onDownload ? (
              <button type="button" className="dash-notice-btn" onClick={onDownload}>
                Baixar {fallback.name}
              </button>
            ) : null}
          </p>
        ) : null}

        <div className="dash-field">
          <span className="dash-label">Featured Image</span>
          <div className="dash-cover-row">
            {form.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="dash-cover-thumb" src={form.image} alt={form.imageAlt || form.title || "Cover"} />
            ) : (
              <span className="dash-cover-empty">No image</span>
            )}
            <div className="dash-cover-side">
              <button
                type="button"
                className="dash-btn-light"
                disabled={coverBusy}
                onClick={() => fileRef.current?.click()}
              ><span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4" /><path d="m6 10 6-6 6 6" /><path d="M4 20h16" /></svg></span>
                {coverBusy ? "Uploading…" : "Change Image"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.svg"
                hidden
                onChange={(e) => {
                  void pickCover(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <p className="dash-hint">Recommended size: 1200 × 630</p>
            </div>
          </div>
          <input
            className="dash-input dash-input-sm"
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            placeholder="/uploads/cover.png or https://…"
            aria-label="Featured image URL"
          />
        </div>

        <div className="dash-field">
          <label className="dash-label" htmlFor="dash-title">Title <span className="dash-req">*</span></label>
          <input
            id="dash-title"
            className="dash-input"
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm({
                ...form,
                title,
                slug: isNew && !slugTouched ? slugify(title) : form.slug,
              });
            }}
            placeholder="Post title"
          />
        </div>

        <div className="dash-field">
          <span className="dash-label">Slug</span>
          <div className="dash-slug-wrap">
            <input
              className="dash-input"
              value={form.slug}
              onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
              placeholder="post-url-slug"
              aria-label="Slug"
            />
            <button type="button" className="dash-iconbtn dash-slug-copy" onClick={copySlug} title="Copy slug" aria-label="Copy slug"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg></button>
          </div>
        </div>

        <div className="dash-field">
          <label className="dash-label" htmlFor="dash-category">Category <span className="dash-req">*</span></label>
          <select
            id="dash-category"
            className="dash-input dash-select"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="dash-field">
          <label className="dash-label" htmlFor="dash-excerpt">Excerpt</label>
          <textarea
            id="dash-excerpt"
            className="dash-input dash-textarea"
            rows={4}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
            placeholder="Short summary shown in cards and search…"
          />
          <p className="dash-count">{excerptCount || 136}/160</p>
        </div>

        <div className="dash-field">
          <span className="dash-label">Content <span className="dash-req">*</span></span>
          <div className="dash-rte">
            <RichEditor
              key={isNew ? "new" : (form.id ?? form.slug)}
              value={form.contentHtml}
              onChange={(html) => set("contentHtml", html)}
              onUpload={onUpload}
              onSave={onSave}
              draftKey={isNew ? "dash-draft-new" : `dash-draft-${form.id ?? form.slug}`}
              minimalFoot
            />
          </div>
        </div>

        <div className="dash-two">
          <div className="dash-field">
            <label className="dash-label" htmlFor="dash-status">Status</label>
            <span className="dash-status-wrap">
              <span className={form.status === "published" ? "dash-dot dash-dot-pub" : "dash-dot"} aria-hidden="true" />
              <select
                id="dash-status"
                className="dash-input dash-select dash-status"
                value={form.status}
                onChange={(e) => set("status", e.target.value as PostForm["status"])}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </span>
          </div>
          <div className="dash-field">
            <label className="dash-label" htmlFor="dash-date">Publish Date</label>
            <span className="dash-date-wrap">
              <span className="dash-cal" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" /></svg></span>
              <span className="dash-date-text">{fmtPublish(form.publishedAt)}</span>
              <input
                id="dash-date"
                type="date"
                className="dash-date-input"
                value={form.publishedAt}
                onChange={(e) => set("publishedAt", e.target.value)}
                aria-label="Publish Date"
              />
            </span>
          </div>
        </div>

        <details className="dash-more">
          <summary>SEO &amp; extra fields</summary>
          <div className="dash-more-grid">
            <label className="dash-label">Author
              <input className="dash-input" value={form.author} onChange={(e) => set("author", e.target.value)} />
            </label>
            <label className="dash-label">Author role
              <input className="dash-input" value={form.authorRole} onChange={(e) => set("authorRole", e.target.value)} />
            </label>
            <label className="dash-label">Image alt text
              <input className="dash-input" value={form.imageAlt} onChange={(e) => set("imageAlt", e.target.value)} />
            </label>
            <label className="dash-label">Tags (comma separated)
              <input className="dash-input" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </label>
            <label className="dash-label">SEO title
              <input className="dash-input" value={form.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
            </label>
            <label className="dash-label">Meta description
              <input className="dash-input" value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
            </label>
          </div>
        </details>

        <div className="dash-actions">
          <button type="button" className="dash-btn-primary" disabled={saving} onClick={onSave}>
            {saving ? "Saving…" : isNew ? "Publish Post" : "Save Changes"}
          </button>
          <button type="button" className="dash-btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- dashboard shell ---------------- */

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Draft" },
  { key: "scheduled", label: "Scheduled" },
];

export default function AdminClient({ authed, initial }: { authed: boolean; initial: AdminState }) {
  const [ok, setOk] = useState(authed);
  const [posts, setPosts] = useState<Post[]>(initial.posts as Post[]);
  const [categories, setCategories] = useState<string[]>(initial.categories);
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<PostForm | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  /** Set only when MySQL refused the write; the user decides whether to download. */
  const [fallback, setFallback] = useState<{ name: string; text: string } | null>(null);

  /** One compact line when the database is not usable (no banner, no noise when
      everything works): the actual MySQL error, so it can be fixed. */
  const dbIssue =
    initial.configured === false
      ? "sem credenciais no .env (defina DATABASE_URL ou DB_HOST/DB_USER/DB_PASSWORD/DB_NAME)."
      : initial.schema?.ready === false
        ? initial.schema?.error ?? initial.dbError ?? "não foi possível preparar as tabelas."
        : initial.dbError ?? null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (rowMenu && !(e.target as HTMLElement).closest(".dash-rowmenu")) setRowMenu(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [rowMenu]);

  async function refresh() {
    let state: AdminState;
    try {
      state = await adminBootstrap();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
      return;
    }
    setPosts(state.posts as Post[]);
    setCategories(state.categories);
    setNotice(state.dbError ?? "");
  }

  const counts = useMemo(() => {
    const c: Record<TabKey, number> = { all: posts.length, published: 0, draft: 0, scheduled: 0 };
    for (const p of posts) c[displayStatus(p)] += 1;
    return c;
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (tab !== "all" && displayStatus(p) !== tab) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [posts, tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(filtered.length, safePage * PAGE_SIZE);

  /** Row click toggles the editor: open head+body, or collapse back to list-only. */
  function openPost(p: Post) {
    setRowMenu(null);
    if (p.slug === selected && form) {
      setForm(null);
      setIsNew(false);
      setSelected(null);
      setNotice("");
      return;
    }
    setSelected(p.slug);
    setForm(toForm(p));
    setIsNew(false);
    setNotice("");
  }

  function openNew() {
    setSelected(null);
    setForm(BLANK_POST(categories[0] ?? "Compostagem"));
    setIsNew(true);
    setNotice("");
  }

  function closePanel() {
    setForm(null);
    setIsNew(false);
    setSelected(null);
    setNotice("");
  }

  /** Draft handoff for "Open in new tab": the full-page editor reads this key. */
  const popout = form
    ? isNew
      ? { key: "dash-popout:new", href: "/admin/post/new" }
      : form.slug || selected
        ? { key: `dash-popout:${form.slug || selected}`, href: `/admin/post/${form.slug || selected}` }
        : null
    : null;
  useEffect(() => {
    if (!popout || !form) return;
    try {
      sessionStorage.setItem(popout.key, JSON.stringify(form));
    } catch {
      /* private mode / quota — the new tab falls back to server data */
    }
  });

  async function uploadFile(file: File): Promise<string | null> {
    const data = new FormData();
    data.append("file", file);
    let res: Awaited<ReturnType<typeof adminUploadImage>>;
    try {
      res = await adminUploadImage(data);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
      return null;
    }
    if (!res.ok || !res.url) {
      setNotice(res.error ?? "Could not upload image.");
      return null;
    }
    // Self-check: the image must also be reachable in the browser. /media serves
    // the disk file first and falls back to the media_files row, so a failure
    // here means neither copy is reachable.
    setNotice("");
    try {
      const probe = await fetch(res.url, { method: "HEAD", cache: "no-store" });
      if (!probe.ok && probe.status !== 405 && probe.status !== 501) {
        setNotice(
          `Imagem salva (${res.inDb ? "disco + banco" : "somente disco"}: ${res.file ?? "public/uploads"}), ` +
          `mas o site respondeu ${probe.status} ao abrir ${res.url}. Abra /admin/doctor para ver onde ficou.`,
        );
      }
    } catch {
      /* probe blocked or offline — keep the URL the server returned */
    }
    return res.url;
  }

  async function save() {
    if (!form || saving) return;
    setSaving(true);
    setNotice("");
    setFallback(null);
    // A server-action rejection must never become an unhandled promise error in
    // the console: surface it as panel text instead.
    let res: Awaited<ReturnType<typeof adminSavePost>>;
    try {
      res = await adminSavePost({ form });
    } catch (err) {
      setSaving(false);
      setNotice(err instanceof Error ? err.message : String(err));
      return;
    }
    setSaving(false);
    // No automatic download: only if the DB refused the write, and only when the
    // user clicks the button shown next to the notice.
    if (res.download) setFallback(res.download);
    if (!res.ok) {
      setNotice(res.error ?? "Could not save.");
      return;
    }
    if (res.posts) setPosts(res.posts as Post[]);
    try {
      sessionStorage.removeItem(isNew ? "dash-popout:new" : `dash-popout:${form.slug}`);
    } catch {
      /* ignore */
    }
    // The write told us the real id/slug: adopt them so the open row keeps its
    // identity (a CREATE becomes an UPDATE from here on; a slug rename keeps
    // pointing at the same row).
    if (res.saved) {
      const saved = res.saved;
      setForm((prev) => (prev ? { ...prev, id: saved.id, slug: saved.slug } : prev));
      setSelected(saved.slug);
    } else {
      setSelected(form.slug);
    }
    if (isNew) setIsNew(false);
    setNotice(isNew ? "Post published and saved in the database." : "Changes saved in the database.");
  }

  async function remove(slug: string) {
    const target = posts.find((p) => p.slug === slug);
    if (!target) return;
    if (!window.confirm(`Delete "${target.title}"?`)) return;
    setFallback(null);
    let res: Awaited<ReturnType<typeof adminDeletePost>>;
    try {
      res = await adminDeletePost({ slug });
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
      return;
    }
    if (res.download) setFallback(res.download);
    if (!res.ok) {
      setNotice(res.error ?? "Could not delete.");
      return;
    }
    if (res.posts) setPosts(res.posts as Post[]);
    if (selected === slug) {
      setSelected(null);
      setForm(null);
      setIsNew(false);
    }
    setRowMenu(null);
    setNotice("Post deleted.");
  }

  function exportPosts() {
    download(
      `blog-posts-backup-${todayISO()}.json`,
      JSON.stringify(posts, null, 2),
    );
    setMenuOpen(false);
  }

  async function logout() {
    await adminLogout();
    setOk(false);
    setForm(null);
    setSelected(null);
    setNotice("");
  }

  if (!ok) {
    return <Login onOk={() => { setOk(true); void refresh(); }} />;
  }

  return (
    <div className="dash">
      <aside className="dash-side" aria-label="Primary">
        <div className="dash-side-top">
          <div className="dash-side-brand">
            <span className="dash-home" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h5v-6h4v6h5V9.5" /></svg></span>
            <span className="dash-side-title">Dashboard</span>
          </div>
          <a className="dash-side-blog" href="#blog-posts" aria-label="Blog posts">
            <span className="dash-blog-ico" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M3 8.5h18M7.5 4v4.5" /><circle cx="15" cy="12.6" r="2.3" /><path d="M13.2 16.6 10 19.5M17.6 10.5 20 7" /></svg></span>
            <span>Blog</span>
          </a>
        </div>
          
        <div className="dash-help">
          <div className="dash-help-head">
            <span className="dash-help-ico" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3.4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></svg></span>
            <p className="dash-help-title">Need help?</p>
          </div>
          <p className="dash-help-text">Check our documentation or contact support.</p>
          <span className="dash-help-link">View docs →</span>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-topbar">
          <label className="dash-search">
            <span aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg></span>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search blog posts…"
              aria-label="Search blog posts"
            />
          </label>
          <div className="dash-top-right">
            <button type="button" className="dash-iconbtn dash-bell" aria-label="Notifications"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></svg></button>
            <div className="dash-user" ref={menuRef}>
              <span className="dash-avatar" aria-hidden="true">A</span>
              <span className="dash-user-meta">
                <span className="dash-user-name">admin</span>
              </span>
              <button
                type="button"
                className="dash-iconbtn"
                aria-label="Account menu"
                onClick={() => setMenuOpen((v) => !v)}
              ><span className="dash-chev" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6" /></svg></span></button>
              {menuOpen ? (
                <div className="dash-menu" role="menu">
                  <a href="/blog" target="_blank" rel="noreferrer">Go to blog</a>
                  <button type="button" onClick={exportPosts}>Download backup</button>
                  <button type="button" onClick={logout}>Sign out</button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className={form ? "dash-body" : "dash-body dash-body-noPanel"}>
          <section className="dash-list-col" aria-label="Blog posts">
            <div className="dash-list-head">
              <div>
                <h1 className="dash-h1">Blog</h1>
                <p className="dash-sub">Manage your blog posts and keep your audience informed.</p>
              </div>
              <button type="button" className="dash-btn-primary" onClick={openNew}><span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span> New Blog Post</button>
            </div>

            <div className="dash-tabs" role="tablist" aria-label="Filter by status">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  className={"dash-tab" + (tab === t.key ? " dash-tab-on" : "")}
                  onClick={() => { setTab(t.key); setPage(1); }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {notice && !form ? (
              <p className="dash-notice" role="status">
                {notice}
                {fallback ? (
                  <button
                    type="button"
                    className="dash-notice-btn"
                    onClick={() => download(fallback.name, fallback.text)}
                  >
                    Baixar {fallback.name}
                  </button>
                ) : null}
              </p>
            ) : null}

            {dbIssue && !form ? (
              <p className="dash-error" role="alert">
                Banco de dados: {dbIssue}
              </p>
            ) : null}

            <div className="dash-table-card">
              <div className="dash-table-head" aria-hidden="true">
                <span>Title</span>
                <span>Status</span>
                <span>Updated</span>
                <span>Actions</span>
              </div>
              {pageItems.map((p) => {
                const st = displayStatus(p);
                return (
                  <div key={p.slug} className={"dash-row" + (p.slug === selected ? " dash-row-on" : "")} onClick={() => openPost(p)} onKeyDown={(e) => { if (e.key === "Enter") openPost(p); }} role="button" tabIndex={0}>
                    <button type="button" className="dash-cell-main" onClick={() => openPost(p)} title={p.title}>
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="dash-thumb" src={p.image} alt="" />
                      ) : (
                        <span className="dash-thumb dash-thumb-empty" aria-hidden="true" />
                      )}
                      <span className="dash-cell-text">
                        <span className="dash-cell-title">{p.title}</span>
                        <span className="dash-cell-ex">{p.excerpt}</span>
                      </span>
                    </button>
                    <span className="dash-cell-status">
                      <span className={`dash-pill dash-pill-${st}`}>
                        {st === "published" ? "Published" : st === "draft" ? "Draft" : "Scheduled"}
                      </span>
                    </span>
                    <span className="dash-cell-updated">
                      <span>{fmtDate(p.publishedAt)}</span>
                      <span className="dash-time">{fakeTime(p.slug)}</span>
                    </span>
                    <span className="dash-cell-dots dash-rowmenu">
                      <button
                        type="button"
                        className="dash-iconbtn"
                        aria-label={`Options for ${p.title}`}
                        onClick={(e) => { e.stopPropagation(); setRowMenu(rowMenu === p.slug ? null : p.slug); }}
                      ><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg></button>
                      {rowMenu === p.slug ? (
                        <span className="dash-rowmenu-pop" role="menu">
                          <button type="button" onClick={() => openPost(p)}>Edit</button>
                          <button type="button" onClick={() => void remove(p.slug)}>Delete</button>
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
              {pageItems.length === 0 ? (
                <div className="dash-empty">
                  <p>No posts match this filter.</p>
                  <button type="button" className="dash-btn-primary" onClick={openNew}><span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span> New Blog Post</button>
                </div>
              ) : null}
              <div className="dash-pager">
                <span>Showing {showingFrom}–{showingTo} of {filtered.length} posts</span>
                <span className="dash-pager-btns">
                  <button
                    type="button"
                    className="dash-pagebtn"
                    disabled={safePage <= 1}
                    onClick={() => setPage(safePage - 1)}
                    aria-label="Previous page"
                  >‹</button>
                  <span className="dash-pagebtn dash-pagebtn-on" aria-current="page">{safePage}</span>
                  <button
                    type="button"
                    className="dash-pagebtn"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(safePage + 1)}
                    aria-label="Next page"
                  >›</button>
                </span>
              </div>
            </div>

            <p className="dash-src-note" hidden>
              Source: {initial.source === "mysql" ? "MySQL" : "local file"} · {counts.all} posts
              ({counts.published} published · {counts.draft} draft · {counts.scheduled} scheduled)
            </p>
          </section>

          {form ? (
            <EditorPanel
              form={form}
              setForm={setForm}
              categories={categories}
              notice={notice}
              saving={saving}
              isNew={isNew}
              onClose={closePanel}
              onSave={save}
              popoutHref={popout?.href ?? null}
              onCancel={() => {
                if (isNew) closePanel();
                else {
                  const current = posts.find((p) => p.slug === selected);
                  if (current) setForm(toForm(current));
                  setNotice("");
                }
              }}
              onUpload={uploadFile}
              fallback={fallback}
              onDownload={fallback ? () => download(fallback.name, fallback.text) : undefined}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

