/* Inline SVG icon set for the /solucoes page (stroke style, currentColor).
   Paths are hand-drawn lucide-style glyphs; whatsapp reuses the brand glyph. */

const PATHS: Record<string, React.ReactNode> = {
  leaf: (
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2.5 1.5 6.5-1.5 11-2 3-5.5 6-8.5 7Zm0 0c-1.5-4 1-9 5-11" />
  ),
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  truck: (
    <>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18h-5" />
      <path d="M15 8h4l3 4v5a1 1 0 0 1-1 1h-2" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  filter: (
    <>
      <path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z" />
      <path d="M7 4v3M4 7h6" />
    </>
  ),
  recycle: (
    <>
      <path d="m7 19-4-7 3.5-1L8 14l-1 5Z" />
      <path d="m17 19 4-7-3.5-1L16 14l1 5Z" />
      <path d="M12 4 9 9h6l-3-5Z" />
      <path d="M8.5 10.5h7M9 16.5c-1.5-.8-2-2.5-1-4M15 16.5c1.5-.8 2-2.5 1-4M12 6.5V9" />
    </>
  ),
  sprout: (
    <>
      <path d="M7 20h10" />
      <path d="M12 20v-8" />
      <path d="M12 12C12 8 9 5 4 5c0 5 3 7 8 7Z" />
      <path d="M12 12c0-3 2.5-6 8-6 0 4.5-3.5 6.5-8 6Z" />
    </>
  ),
  factory: (
    <>
      <path d="M2 20h20" />
      <path d="M4 20v-9l5 3V9l5 3V4h6v16" />
      <path d="M8 17h2M13 17h2M17 17h1" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M3 3h2l2.5 12.5a1 1 0 0 0 1 .5h8.5a1 1 0 0 0 1-.8L20 8H6" />
    </>
  ),
  kit: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M12 11v5M9.5 13.5h5" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v8M4 3v4a3 3 0 0 0 6 0V3M7 13v8" />
      <path d="M17 3c-2 2-2.5 5-2.5 8H17v10M17 3v10" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="13" width="4" height="7" rx="1.5" />
      <rect x="17" y="13" width="4" height="7" rx="1.5" />
    </>
  ),
  "badge-check": (
    <>
      <circle cx="12" cy="10" r="6" />
      <path d="m9.5 10 1.8 1.8 3.2-3.6" />
      <path d="m9 15-1.5 6L12 19l4.5 2L15 15" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M7 15v3M12 10v8M17 6v12" />
    </>
  ),
  "file-check": (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
      <path d="M14 2v6h6" />
      <path d="m9 15 2 2 4-4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  "truck-clock": (
    <>
      <path d="M13 17V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11h2" />
      <path d="M13 8h4l3 4v5h-2" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
      <circle cx="17" cy="9" r="4.5" />
      <path d="M17 7v2l1.5 1" />
    </>
  ),
  "bin-clock": (
    <>
      <path d="M4 8h13M9 8V5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v3" />
      <path d="M6 8l1 12a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l1-12" />
      <circle cx="17.5" cy="15.5" r="4" />
      <path d="M17.5 13.5v2l1.4 1" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  sparkles: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  at: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
};

export default function SolIcon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] ?? PATHS.leaf}
    </svg>
  );
}

export function WhatsappGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.116-.198.058-.372-.03-.52-.086-.148-.66-1.59-.905-2.174-.238-.57-.48-.494-.66-.503l-.56-.01c-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}
