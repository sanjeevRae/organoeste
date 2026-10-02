"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BlogPost } from "@/data/blog-posts";
import { BLANK_POST, toForm, type PostForm } from "@/lib/admin-format";
import {
  adminBootstrap,
  adminSavePost,
  adminUploadImage,
  type AdminState,
} from "../actions";
import { EditorPanel, Login, download } from "../AdminClient";

type Post = BlogPost & { id?: number };

export default function FullPageEditor({
  slug,
  initial,
  authed,
}: {
  slug: string | null;
  initial: AdminState;
  authed: boolean;
}) {
  const router = useRouter();
  const [ok, setOk] = useState(authed);
  const [posts, setPosts] = useState<Post[]>(initial.posts as Post[]);
  const [categories, setCategories] = useState<string[]>(initial.categories);
  const [form, setForm] = useState<PostForm | null>(null);
  const [isNew, setIsNew] = useState(slug === null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  /** Set only when MySQL refused the write; the user decides whether to download. */
  const [fallback, setFallback] = useState<{ name: string; text: string } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!ok) return;
    const key = slug === null ? "dash-popout:new" : `dash-popout:${slug}`;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as PostForm;
        if (slug === null || parsed.slug === slug || !parsed.slug) {
          setForm(parsed);
          setIsNew(slug === null);
          return;
        }
      }
    } catch {
      /* unreadable draft — fall through to server data */
    }
    if (slug === null) {
      setForm(BLANK_POST(categories[0] ?? "Compostagem"));
      setIsNew(true);
      return;
    }
    const target = posts.find((p) => p.slug === slug);
    if (target) {
      setForm(toForm(target));
      setIsNew(false);
    } else {
      setMissing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ok]);

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
    // No automatic download: the button appears only if the DB refused the write.
    if (res.download) setFallback(res.download);
    if (!res.ok) {
      setNotice(res.error ?? "Could not save.");
      return;
    }
    if (res.posts) setPosts(res.posts as Post[]);
    try {
      sessionStorage.removeItem(slug === null ? "dash-popout:new" : `dash-popout:${form.slug}`);
    } catch {
      /* ignore */
    }
    // Adopt the real id/slug so repeat saves stay UPDATEs on the same row.
    if (res.saved) {
      const saved = res.saved;
      setForm((prev) => (prev ? { ...prev, id: saved.id, slug: saved.slug } : prev));
    }
    if (isNew) setIsNew(false);
    setNotice(isNew ? "Post published and saved in the database." : "Changes saved in the database.");
    if (res.saved && form.slug && res.saved.slug !== slug && slug !== null) {
      router.replace(`/admin/post/${res.saved.slug}`);
    }
  }

  function backToList() {
    router.push("/admin");
  }

  if (!ok) {
    return (
      <div className="dash-editpage">
        <Login
          onOk={() => {
            setOk(true);
            void refresh();
          }}
        />
      </div>
    );
  }

  if (missing) {
    return (
      <div className="dash-editpage">
        <div className="dash-panel" role="alert">
          <div className="dash-panel-head">
            <h2 className="dash-panel-title">Post not found</h2>
          </div>
          <div className="dash-panel-body">
            <p className="dash-sub">This post no longer exists.</p>
            <div className="dash-actions">
              <button type="button" className="dash-btn-primary" onClick={backToList}>
                Back to list
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="dash-editpage">
        <p className="dash-loading">Loading editor…</p>
      </div>
    );
  }

  return (
    <div className="dash-editpage">
      <EditorPanel
        form={form}
        setForm={setForm}
        categories={categories.length ? categories : [form.category].filter(Boolean)}
        notice={notice}
        saving={saving}
        isNew={isNew}
        onClose={backToList}
        onSave={save}
        onCancel={() => {
          if (isNew) backToList();
          else {
            const current = posts.find((p) => p.slug === (slug ?? form.slug));
            if (current) setForm(toForm(current));
            setNotice("");
          }
        }}
        onUpload={uploadFile}
        showPopout={false}
        fallback={fallback}
        onDownload={fallback ? () => download(fallback.name, fallback.text) : undefined}
      />
    </div>
  );
}
