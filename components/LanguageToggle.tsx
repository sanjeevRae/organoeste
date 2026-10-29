"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

/* GTranslate exposes doGTranslate() globally; declare it for TypeScript. */
declare global {
  interface Window {
    doGTranslate?: (pair: string) => void;
  }
}

/**
 * LanguageToggle — custom pill-shaped PT | ES segmented toggle.
 *
 * Uses the free GTranslate Website Translator Widget (cdn.gtranslate.net).
 * The widget is loaded in app/layout.tsx; this component only drives it via
 * the global doGTranslate() function and keeps its own UI state in sync.
 *
 * Brand names (Organoeste, OLAM, Fertipower) are excluded via translate="no"
 * on the elements themselves — no JS filtering needed.
 */

const BRAND_GREEN = "#2f8f36";

export default function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeLang, setActiveLang] = useState<"pt" | "es">("pt");
  const initialized = useRef(false);

  /* ------------------------------------------------------------------ */
  /*  Detect current language on mount.                                 */
  /*  GTranslate (wrapping the deprecated Google Translate element) sets  */
  /*  a `googtrans` cookie like `/pt/es` or `/pt/default`.               */
  /* ------------------------------------------------------------------ */
  const readPersistedLang = useCallback((): "pt" | "es" => {
    if (typeof document === "undefined") return "pt";
    const match = document.cookie.match(
      /(?:^|; )\s*googtrans=([^;]+)/
    );
    if (!match) return "pt";
    const value = match[1]; // e.g. "/pt/es" or "/pt/default"
    const parts = value.split("/");
    const target = parts[parts.length - 1];
    return target === "es" ? "es" : "pt";
  }, []);

  /* ------------------------------------------------------------------ */
  /*  Switch language via GTranslate.                                   */
  /*  doGTranslate('source|target') — source is always the site's       */
  /*  original language (pt).                                            */
  /* ------------------------------------------------------------------ */
  const switchLang = useCallback(
    (target: "pt" | "es") => {
      if (typeof window === "undefined" || typeof window.doGTranslate === "undefined") return;
      setActiveLang(target);
      window.doGTranslate(`pt|${target === "es" ? "es" : "pt"}`);
    },
    []
  );

  /* ------------------------------------------------------------------ */
  /*  Re-apply translation on client-side navigation so Spanish         */
  /*  survives Next.js route changes.                                   */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const persisted = readPersistedLang();
      setActiveLang(persisted);
      // If Spanish was previously selected, re-apply on first load.
      if (persisted === "es") {
        switchLang("es");
      }
      return;
    }
    // On subsequent navigations, re-apply the active language.
    if (activeLang === "es") {
      switchLang("es");
    }
  }, [pathname, activeLang, readPersistedLang, switchLang]);

  return (
    <div
      className="language-toggle"
      role="group"
      aria-label="Idioma / Language"
    >
      <button
        type="button"
        className={`lang-segment ${activeLang === "pt" ? "is-active" : ""}`}
        aria-pressed={activeLang === "pt"}
        onClick={() => switchLang("pt")}
      >
        PT
      </button>
      <button
        type="button"
        className={`lang-segment ${activeLang === "es" ? "is-active" : ""}`}
        aria-pressed={activeLang === "es"}
        onClick={() => switchLang("es")}
      >
        ES
      </button>
    </div>
  );
}