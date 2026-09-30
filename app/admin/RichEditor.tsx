"use client";

/* Editor visual estilo Word para o painel do blog, sem dependências externas:
   contentEditable + comandos do navegador + manipulação própria de DOM.

   Recursos: estilos de bloco, fonte/tamanho/cor, marca-texto, listas, recuos,
   alinhamento, links, imagens (upload, URL, colar e arrastar), vídeo do YouTube,
   tabelas editáveis, código, sobrescrito/subscrito, caracteres especiais,
   localizar/substituir, atalhos de Markdown, modo foco, contagem de palavras e
   rascunho automático no navegador. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Uploads a file and resolves to its public URL (null when it failed). */
  onUpload: (file: File) => Promise<string | null>;
  /** Called by Ctrl/Cmd+S so the page can save without a trip to the toolbar. */
  onSave?: () => void;
  /** Used to keep an automatic draft in localStorage. */
  draftKey?: string;
  /** Compact dashboard mode: hides the full footer behind a single "Words: N" line. */
  minimalFoot?: boolean;
}

type MenuKey = "blocks" | "color" | "hilite" | "link" | "image" | "video" | "table" | "special" | "find" | null;

interface Choice {
  label: string;
  value: string;
}

const BLOCKS: Choice[] = [
  { label: "Parágrafo", value: "p" },
  { label: "Título (H2)", value: "h2" },
  { label: "Subtítulo (H3)", value: "h3" },
  { label: "Seção (H4)", value: "h4" },
  { label: "Citação", value: "blockquote" },
  { label: "Bloco de código", value: "pre" },
];

const FONTS: Choice[] = [
  { label: "Fonte padrão", value: "" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Sem serifa", value: "Arial, Helvetica, sans-serif" },
  { label: "Serifada", value: "Georgia, 'Times New Roman', serif" },
  { label: "Monoespaçada", value: "'Courier New', Courier, monospace" },
];

const SIZES: Choice[] = [
  { label: "Pequeno", value: "14px" },
  { label: "Normal", value: "16px" },
  { label: "Médio", value: "18px" },
  { label: "Grande", value: "22px" },
  { label: "Título", value: "28px" },
];

const LINE_HEIGHTS: Choice[] = [
  { label: "Entrelinha 1,4", value: "1.4" },
  { label: "Entrelinha 1,6", value: "1.6" },
  { label: "Entrelinha 1,8", value: "1.8" },
  { label: "Entrelinha 2,0", value: "2" },
];

const TEXT_COLORS = [
  "#111111", "#3c3c3c", "#7a7a7a", "#ffffff",
  "#2e8b4d", "#1f6f3a", "#9bd1af", "#e9f4ec",
  "#1f6fb2", "#cfe4f5", "#c98a1b", "#fdf3e3",
  "#b23b3b", "#f6d5d5", "#7a4fb2", "#e5dcf6",
];

const HILITE_COLORS = ["#fff2a8", "#d7f5df", "#cfe4f5", "#ffd9e8", "#ffe2cc", "#e5dcf6", "#f1f1f1", "transparent"];

const SPECIALS = [
  "—", "–", "…", "«", "»", "“", "”", "‘", "’", "€", "©", "®", "™",
  "°", "±", "×", "÷", "≤", "≥", "≠", "≈", "½", "¼", "→", "←", "↑", "↓",
  "•", "▪", "§", "¶", "µ", "Ω", "α", "β", "π", "√", "∞", "≡", "·", "º", "ª",
];

const EMOJIS = [
  "✅", "❌", "⚠️", "💡", "🌱", "♻️", "🌍", "🌾", "🐛", "🚛",
  "📦", "📊", "📈", "📌", "🔁", "🔍", "⭐", "❤️", "👍", "🙌",
  "🎯", "🕒", "🧪", "💧", "🔥", "🏷️", "📝", "💬", "🔗", "🏆",
];

const ALLOWED_PASTE_TAGS = new Set([
  "P", "H2", "H3", "H4", "H5", "H6", "BLOCKQUOTE", "UL", "OL", "LI",
  "STRONG", "B", "EM", "I", "U", "S", "DEL", "SUP", "SUB", "MARK",
  "A", "IMG", "BR", "HR", "CODE", "PRE", "SPAN",
  "TABLE", "THEAD", "TBODY", "TR", "TD", "TH", "FIGURE", "FIGCAPTION",
]);

const KEEP_PASTE_STYLE = /(?:^|;)\s*(text-align|font-weight|font-style|text-decoration|color|background-color|font-size|font-family)\s*:\s*[^;]+/gi;
// ---------- pure helpers ----------

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Turns any YouTube link into a privacy-friendly embed URL. */
function youtubeEmbed(url: string): string | null {
  const trimmed = url.trim();
  if (!/^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(trimmed)) return null;
  const id = /(?:youtu\.be\/|\/embed\/|\/shorts\/|[?&]v=)([A-Za-z0-9_-]{6,})/.exec(trimmed)?.[1];
  if (!id) return null;
  const start = /[?&](?:t|start)=(\d{1,6})/.exec(trimmed)?.[1];
  return "https://www.youtube-nocookie.com/embed/" + id + (start ? "?start=" + start : "");
}

/** Strips Word/Google-Docs junk from pasted HTML before it enters the editor. */
function cleanPastedHtml(html: string): string {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  const body = parsed.body;
  body.querySelectorAll("script,style,meta,link,title,iframe,object,embed,form,input,button,video,audio").forEach((node) => node.remove());
  body.querySelectorAll("*").forEach((node) => {
    if (!ALLOWED_PASTE_TAGS.has(node.tagName)) {
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }
    for (const attr of Array.from(node.attributes)) {
      if (!/^(?:style|href|src|alt|colspan|rowspan|scope|class)$/i.test(attr.name)) node.removeAttribute(attr.name);
    }
    const element = node as HTMLElement;
    if (element.hasAttribute("style")) {
      const kept = (element.getAttribute("style") ?? "").match(KEEP_PASTE_STYLE);
      if (kept && kept.length > 0) element.setAttribute("style", kept.join(";"));
      else element.removeAttribute("style");
    }
    if (node.tagName === "SPAN" && !element.getAttribute("style")) {
      node.replaceWith(...Array.from(node.childNodes));
    }
  });
  return body.innerHTML;
}

/** Word/char/reading-time stats from the rendered text. */
function computeStats(html: string): { words: number; chars: number; mins: number } {
  const text = html
    .replace(/<(?:br|hr)\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;
  return { words, chars: text.length, mins: Math.max(1, Math.round(words / 180)) };
}

function textNodesWithin(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const out: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    const parent = (current as Text).parentElement;
    if (parent && !/^(?:SCRIPT|STYLE)$/.test(parent.tagName) && (current as Text).data.trim()) {
      out.push(current as Text);
    }
    current = walker.nextNode();
  }
  return out;
}
// ---------- component ----------

export default function RichEditor({ value, onChange, onUpload, onSave, draftKey, minimalFoot }: RichEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const savedRange = useRef<Range | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const replaceTarget = useRef<HTMLImageElement | null>(null);

  const [menu, setMenu] = useState<MenuKey>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [stats, setStats] = useState({ words: 0, chars: 0, mins: 1 });
  const [full, setFull] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState("");
  const [draft, setDraft] = useState<{ html: string; at: number } | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [inTable, setInTable] = useState(false);
  const [findTerm, setFindTerm] = useState("");
  const [replaceTerm, setReplaceTerm] = useState("");
  const [findMsg, setFindMsg] = useState("");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [highlight, setHighlight] = useState(HILITE_COLORS[0]);
  const [blockTag, setBlockTag] = useState("p");

  /** Short-lived inline feedback message under the toolbar. */
  const notice = useCallback((message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash((current) => (current === message ? "" : current)), 2600);
  }, []);

  const emit = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const html = el.innerHTML;
    setStats(computeStats(el.innerText || html));
    onChange(html);
  }, [onChange]);

  // Keep the DOM in sync with the incoming value (post switch, draft restore...).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== value) el.innerHTML = value || "";
    setStats(computeStats(el.innerText || value || ""));
  }, [value]);

  // Word-like colours/fonts need CSS style attributes instead of legacy tags.
  useEffect(() => {
    try {
      document.execCommand("styleWithCSS", false, "true");
    } catch {
      /* older browsers ignore this */
    }
  }, []);

  // Remember the caret/selection so popovers and selects can act on it later.
  useEffect(() => {
    const onSelectionChange = () => {
      const el = ref.current;
      const sel = window.getSelection();
      if (!el || !sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) return;
      savedRange.current = range.cloneRange();
      setHasImage(Boolean(imageInRange(range)));
      setInTable(Boolean(cellFromRange(range)));
      setBlockTag((currentBlock()?.tagName ?? "P").toLowerCase());
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  function selectionRange(): Range | null {
    const el = ref.current;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    return el.contains(range.commonAncestorContainer) ? range : null;
  }

  function imageInRange(range: Range): HTMLImageElement | null {
    const el = ref.current;
    if (!el) return null;
    const start = range.startContainer;
    const element = start.nodeType === Node.TEXT_NODE ? start.parentElement : (start as HTMLElement);
    const nested = element?.closest?.("img");
    if (nested && el.contains(nested)) return nested as HTMLImageElement;
    const hit = Array.from(el.querySelectorAll("img")).find((candidate) => range.intersectsNode(candidate));
    return (hit as HTMLImageElement | undefined) ?? null;
  }

  function cellFromRange(range: Range): HTMLTableCellElement | null {
    const el = ref.current;
    if (!el) return null;
    const start = range.startContainer;
    const element = start.nodeType === Node.TEXT_NODE ? start.parentElement : (start as HTMLElement);
    const cell = element?.closest?.("td,th");
    return cell && el.contains(cell) ? (cell as HTMLTableCellElement) : null;
  }

  function focusDoc(): HTMLElement | null {
    const el = ref.current;
    if (!el) return null;
    el.focus();
    const sel = window.getSelection();
    const range = savedRange.current;
    if (sel && range && el.contains(range.commonAncestorContainer)) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
    return el;
  }

  /** Runs a browser editing command on the remembered selection. */
  const run = useCallback(
    (command: string, argument?: string) => {
      const el = focusDoc();
      if (!el) return;
      document.execCommand("styleWithCSS", false, "true");
      document.execCommand(command, false, argument ?? "");
      emit();
    },
    [emit],
  );

  function currentBlock(): HTMLElement | null {
    const el = ref.current;
    const range = selectionRange();
    if (!el) return null;
    let node: Node | null = range ? range.startContainer : null;
    if (!node) return null;
    let element: HTMLElement | null = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
    while (element && element.parentElement && element.parentElement !== el) element = element.parentElement;
    return element && element !== el ? element : null;
  }

  function elementFromSelection(tag: string): HTMLElement | null {
    const el = ref.current;
    const range = selectionRange();
    if (!el || !range) return null;
    const start = range.startContainer;
    const element = start.nodeType === Node.TEXT_NODE ? start.parentElement : (start as HTMLElement);
    const hit = element?.closest?.(tag);
    return hit && el.contains(hit) ? (hit as HTMLElement) : null;
  }
  /** Applies an inline CSS declaration to the selection (or to its block). */
  function applyInlineStyle(property: string, styleValue: string) {
    const el = focusDoc();
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) {
      const block = currentBlock();
      if (!block) {
        notice("Selecione um trecho de texto primeiro.");
        return;
      }
      block.style.setProperty(property, styleValue);
      emit();
      return;
    }
    const span = document.createElement("span");
    span.style.setProperty(property, styleValue);
    try {
      range.surroundContents(span);
    } catch {
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
    const next = document.createRange();
    next.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(next);
    savedRange.current = next.cloneRange();
    emit();
  }

  /** Wraps the selection in a tag such as <code>, <mark> or <sup>. */
  function wrapSelection(tagName: string) {
    const el = focusDoc();
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) {
      notice("Selecione o texto antes de aplicar essa formatação.");
      return;
    }
    const wrapper = document.createElement(tagName);
    try {
      range.surroundContents(wrapper);
    } catch {
      wrapper.appendChild(range.extractContents());
      range.insertNode(wrapper);
    }
    const next = document.createRange();
    next.selectNodeContents(wrapper);
    sel.removeAllRanges();
    sel.addRange(next);
    savedRange.current = next.cloneRange();
    emit();
  }

  function setBlock(tag: string) {
    run("formatBlock", "<" + tag + ">");
  }

  function setBlockStyle(property: string, propertyValue: string) {
    const block = currentBlock();
    if (!block) {
      notice("Clique no parágrafo que deve ser ajustado.");
      return;
    }
    block.style.setProperty(property, propertyValue);
    emit();
  }

  function insertHtml(html: string) {
    focusDoc();
    document.execCommand("insertHTML", false, html);
    emit();
  }

  function insertText(text: string) {
    focusDoc();
    document.execCommand("insertText", false, text);
    emit();
  }

  function insertLink() {
    const el = focusDoc();
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;
    const existing = elementFromSelection("a") as HTMLAnchorElement | null;
    const answer = window.prompt(
      "Endereço do link (https://…, /blog/pagina ou #ancora). Deixe vazio para remover.",
      existing?.getAttribute("href") ?? "https://",
    );
    if (answer === null) return;
    const url = answer.trim();
    if (!url) {
      if (existing) {
        existing.replaceWith(...Array.from(existing.childNodes));
        emit();
      }
      return;
    }
    if (existing) {
      existing.setAttribute("href", url);
      emit();
      return;
    }
    if (sel.isCollapsed) {
      insertHtml('<a href="' + escapeHtml(url) + '">' + escapeHtml(url) + "</a>");
      return;
    }
    document.execCommand("createLink", false, url);
    emit();
  }

  async function uploadInto(file: File) {
    setBusy(true);
    try {
      const url = await onUpload(file);
      if (!url) return;
      const target = replaceTarget.current;
      if (target && target.isConnected) {
        target.setAttribute("src", url);
        replaceTarget.current = null;
        emit();
        notice("Imagem substituída.");
        return;
      }
      focusDoc();
      insertHtml('<img src="' + escapeHtml(url) + '" alt="" style="width:100%" />');
      notice("Imagem inserida no texto.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function insertImageUrl() {
    const url = window.prompt("URL da imagem", "https://");
    if (!url || !url.trim()) return;
    insertHtml('<img src="' + escapeHtml(url.trim()) + '" alt="" style="width:100%" />');
    setMenu(null);
  }

  function insertVideo() {
    const url = window.prompt("Cole o link do YouTube (watch, youtu.be ou shorts)", "https://www.youtube.com/watch?v=");
    if (!url) return;
    const embed = youtubeEmbed(url);
    if (!embed) {
      notice("Não reconheci esse link do YouTube.");
      return;
    }
    insertHtml(
      '<figure class="blg-video"><iframe src="' + escapeHtml(embed) +
        '" title="Vídeo incorporado" loading="lazy" allowfullscreen></iframe></figure><p><br></p>',
    );
    setMenu(null);
  }
  // ---------- image controls ----------

  function selectedImage(): HTMLImageElement | null {
    const range = selectionRange();
    return range ? imageInRange(range) : null;
  }

  function requireImage(): HTMLImageElement | null {
    const img = selectedImage();
    if (!img) notice("Clique na imagem do texto para usar esses controles.");
    return img;
  }

  function imageWidth(percent: string) {
    const img = requireImage();
    if (!img) return;
    img.removeAttribute("width");
    img.removeAttribute("height");
    img.style.setProperty("width", percent);
    emit();
  }

  function imageAlign(direction: "left" | "center" | "right") {
    const img = requireImage();
    if (!img) return;
    if (direction === "center") {
      img.style.removeProperty("float");
      img.style.setProperty("display", "block");
      img.style.setProperty("margin", "0 auto");
    } else {
      img.style.removeProperty("display");
      img.style.setProperty("float", direction);
      img.style.setProperty("margin", direction === "left" ? "0 18px 12px 0" : "0 0 12px 18px");
    }
    emit();
  }

  function imageAlt() {
    const img = requireImage();
    if (!img) return;
    const answer = window.prompt("Texto alternativo (descreva a imagem para SEO e acessibilidade)", img.getAttribute("alt") ?? "");
    if (answer === null) return;
    img.setAttribute("alt", answer.trim());
    emit();
  }

  function imageDelete() {
    const img = requireImage();
    if (!img) return;
    img.remove();
    emit();
  }

  function imageReplace() {
    const img = requireImage();
    if (!img) return;
    replaceTarget.current = img;
    fileRef.current?.click();
  }

  // ---------- tables ----------

  function insertTable(rows: number, cols: number) {
    let html = '<table style="border-collapse:collapse"><tbody>';
    for (let r = 0; r < rows; r += 1) {
      html += "<tr>";
      for (let c = 0; c < cols; c += 1) {
        html += r === 0 ? '<th scope="col">&nbsp;</th>' : "<td>&nbsp;</td>";
      }
      html += "</tr>";
    }
    html += "</tbody></table><p><br></p>";
    insertHtml(html);
    setMenu(null);
    notice("Tabela " + rows + "×" + cols + " inserida.");
  }

  function currentCell(): HTMLTableCellElement | null {
    const range = selectionRange();
    return range ? cellFromRange(range) : null;
  }

  function requireCell(): HTMLTableCellElement | null {
    const cell = currentCell();
    if (!cell) notice("Clique dentro de uma célula da tabela.");
    return cell;
  }

  function emptyCell(tagName: "td" | "th"): HTMLTableCellElement {
    const cell = document.createElement(tagName);
    cell.innerHTML = "&nbsp;";
    return cell;
  }

  function tableOp(op: "row-above" | "row-below" | "row-del" | "col-before" | "col-after" | "col-del" | "header" | "remove") {
    const cell = requireCell();
    if (!cell) return;
    const table = cell.closest("table");
    const row = cell.closest("tr");
    if (!table || !row) return;

    if (op === "remove") {
      table.remove();
      emit();
      notice("Tabela removida.");
      return;
    }

    if (op === "row-above" || op === "row-below" || op === "row-del") {
      if (op === "row-del") {
        if (table.querySelectorAll("tr").length <= 1) {
          table.remove();
          emit();
          return;
        }
        row.remove();
        emit();
        return;
      }
      const isHeaderRow = row.parentElement instanceof HTMLTableSectionElement && row.rowIndex === 0;
      const fresh = document.createElement("tr");
      for (let i = 0; i < row.children.length; i += 1) {
        fresh.appendChild(emptyCell(isHeaderRow ? "th" : "td"));
      }
      row.insertAdjacentElement(op === "row-below" ? "afterend" : "beforebegin", fresh);
      emit();
      return;
    }

    const index = Array.from(row.children).indexOf(cell);
    if (op === "col-del") {
      const rows = Array.from(table.querySelectorAll("tr"));
      if (rows.some((candidate) => candidate.children.length <= 1)) {
        table.remove();
        emit();
        return;
      }
      rows.forEach((candidate) => candidate.children[index]?.remove());
      emit();
      return;
    }
    Array.from(table.querySelectorAll("tr")).forEach((candidate) => {
      const reference = candidate.children[index];
      const tagName = reference?.tagName === "TH" ? "th" : "td";
      const fresh = emptyCell(tagName);
      if (reference) reference.insertAdjacentElement(op === "col-after" ? "afterend" : "beforebegin", fresh);
      else candidate.appendChild(fresh);
    });
    emit();
  }

  function toggleHeaderRow() {
    const cell = requireCell();
    if (!cell) return;
    const table = cell.closest("table");
    const firstRow = table?.querySelector("tr");
    if (!firstRow) return;
    const toHeader = Array.from(firstRow.children).some((child) => child.tagName === "TD");
    Array.from(firstRow.children).forEach((child) => {
      const replacement = emptyCell(toHeader ? "th" : "td");
      replacement.innerHTML = child.innerHTML;
      if (toHeader) replacement.setAttribute("scope", "col");
      child.replaceWith(replacement);
    });
    emit();
  }
  // ---------- find & replace ----------

  function findMatches(): { node: Text; index: number }[] {
    const el = ref.current;
    const term = findTerm.trim().toLowerCase();
    if (!el || !term) return [];
    const hits: { node: Text; index: number }[] = [];
    for (const node of textNodesWithin(el)) {
      const hay = node.data.toLowerCase();
      let at = hay.indexOf(term);
      while (at >= 0) {
        hits.push({ node, index: at });
        at = hay.indexOf(term, at + term.length);
      }
    }
    return hits;
  }

  function selectHit(hit: { node: Text; index: number }, length: number) {
    const range = document.createRange();
    range.setStart(hit.node, hit.index);
    range.setEnd(hit.node, Math.min(hit.index + length, hit.node.data.length));
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    savedRange.current = range.cloneRange();
    hit.node.parentElement?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function findNext() {
    const term = findTerm.trim();
    if (!term) {
      setFindMsg("Digite um termo para procurar.");
      return;
    }
    const hits = findMatches();
    if (hits.length === 0) {
      setFindMsg("Nenhuma ocorrência encontrada.");
      return;
    }
    const range = selectionRange();
    const cursorNode = range?.endContainer ?? null;
    const cursorOffset = range?.endOffset ?? -1;
    const nextIndex = cursorNode ? hits.findIndex((hit) => hit.node === cursorNode && hit.index >= cursorOffset) : 0;
    const target = hits[nextIndex >= 0 ? nextIndex : 0];
    selectHit(target, term.length);
    setFindMsg("Ocorrência " + (hits.indexOf(target) + 1) + " de " + hits.length + ".");
  }

  function replaceCurrent() {
    const term = findTerm.trim();
    if (!term) return;
    const range = selectionRange();
    const sel = window.getSelection();
    if (!range || !sel || sel.isCollapsed || sel.toString().toLowerCase() !== term.toLowerCase()) {
      findNext();
      return;
    }
    focusDoc();
    document.execCommand("insertText", false, replaceTerm);
    emit();
    findNext();
  }

  function replaceAll() {
    const term = findTerm.trim();
    if (!term) return;
    const hits = findMatches();
    if (hits.length === 0) {
      setFindMsg("Nenhuma ocorrência encontrada.");
      return;
    }
    const sel = window.getSelection();
    focusDoc();
    // Backwards, so the offsets of the remaining hits stay valid.
    for (let i = hits.length - 1; i >= 0; i -= 1) {
      const hit = hits[i];
      if (!hit.node.isConnected) continue;
      const range = document.createRange();
      range.setStart(hit.node, hit.index);
      range.setEnd(hit.node, Math.min(hit.index + term.length, hit.node.data.length));
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand("insertText", false, replaceTerm);
    }
    emit();
    setFindMsg(hits.length + " ocorrência(s) substituída(s).");
  }
  // ---------- Markdown shortcuts ----------

  function stripMarker(marker: string): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    if (range.startContainer.nodeType !== Node.TEXT_NODE) return false;
    const node = range.startContainer as Text;
    const offset = range.startOffset;
    if (marker && node.data.slice(offset - marker.length, offset) !== marker) return false;
    if (marker) {
      const removal = document.createRange();
      removal.setStart(node, offset - marker.length);
      removal.setEnd(node, offset);
      sel.removeAllRanges();
      sel.addRange(removal);
      document.execCommand("delete");
    }
    return true;
  }

  /** "# ", "## ", "> ", "- " and "1. " turn the current line into a block. */
  function markdownBlock(): boolean {
    const block = currentBlock();
    if (!block) return false;
    const text = (block.textContent ?? "").replace(/\u00a0/g, " ").trimEnd();
    let marker = "";
    let command = "";
    let argument = "";
    if (text === "#") {
      marker = "#";
      command = "formatBlock";
      argument = "<h2>";
    } else if (text === "##") {
      marker = "##";
      command = "formatBlock";
      argument = "<h3>";
    } else if (text === "###") {
      marker = "###";
      command = "formatBlock";
      argument = "<h4>";
    } else if (text === ">") {
      marker = ">";
      command = "formatBlock";
      argument = "<blockquote>";
    } else if (/^[-*+]$/.test(text)) {
      marker = text;
      command = "insertUnorderedList";
    } else if (text === "1.") {
      marker = "1.";
      command = "insertOrderedList";
    } else {
      return false;
    }
    if (!stripMarker(marker)) return false;
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, argument || undefined);
    emit();
    return true;
  }

  function replaceRangeWithTag(node: Text, from: number, to: number, tagName: string, inner: string): boolean {
    const sel = window.getSelection();
    if (!sel) return false;
    const range = document.createRange();
    range.setStart(node, from);
    range.setEnd(node, to);
    range.deleteContents();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("insertHTML", false, "<" + tagName + ">" + escapeHtml(inner) + "</" + tagName + ">");
    emit();
    return true;
  }

  /** **negrito**, *itálico* and `código` convert as the closing mark is typed. */
  function markdownInline(marker: "*" | "`"): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    if (!range.collapsed || range.startContainer.nodeType !== Node.TEXT_NODE) return false;
    const node = range.startContainer as Text;
    const upto = node.data.slice(0, range.startOffset);
    if (marker === "`") {
      if (!upto.endsWith("`")) return false;
      const open = upto.lastIndexOf("`", upto.length - 2);
      if (open < 0) return false;
      const inner = upto.slice(open + 1, upto.length - 1);
      if (!inner || inner.includes("`")) return false;
      return replaceRangeWithTag(node, open, upto.length, "code", inner);
    }
    const strong = upto.endsWith("**");
    const size = strong ? 2 : 1;
    const open = upto.lastIndexOf("*".repeat(size), upto.length - size - 1);
    if (open < 0) return false;
    const inner = upto.slice(open + size, upto.length - size);
    if (!inner || inner.includes("*")) return false;
    return replaceRangeWithTag(node, open, upto.length, strong ? "strong" : "em", inner);
  }
  // ---------- input events ----------

  function moveCell(backwards: boolean) {
    const cell = currentCell();
    const table = cell?.closest("table");
    if (!cell || !table) return;
    const cells = Array.from(table.querySelectorAll("td,th"));
    const index = cells.indexOf(cell);
    const target = cells[backwards ? index - 1 : index + 1] ?? (backwards ? cells[cells.length - 1] : cells[0]);
    if (!target) return;
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    savedRange.current = range.cloneRange();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const meta = event.ctrlKey || event.metaKey;

    if (event.key === "Escape") {
      setMenu(null);
      return;
    }
    if (event.key === "Tab" && currentCell()) {
      event.preventDefault();
      moveCell(event.shiftKey);
      return;
    }
    if (!meta && !event.altKey && (event.key === "*" || event.key === "`") && markdownInline(event.key)) {
      event.preventDefault();
      return;
    }
    if (!meta && event.key === " " && markdownBlock()) {
      event.preventDefault();
      return;
    }
    if (!meta) return;

    const key = event.key.toLowerCase();
    if (key === "s") {
      event.preventDefault();
      onSave?.();
      notice("Salvando o artigo…");
      return;
    }
    if (key === "k") {
      event.preventDefault();
      insertLink();
      return;
    }
    if (key === "f") {
      event.preventDefault();
      setMenu("find");
      return;
    }
    if (key === "e") {
      event.preventDefault();
      setBlock("pre");
      return;
    }
    if (event.shiftKey && key === "h") {
      event.preventDefault();
      run("hiliteColor", highlight);
      return;
    }
    if (event.shiftKey && key === "7") {
      event.preventDefault();
      run("insertOrderedList");
      return;
    }
    if (event.shiftKey && key === "8") {
      event.preventDefault();
      run("insertUnorderedList");
      return;
    }
    if (event.shiftKey && key === "d") {
      event.preventDefault();
      setFull((current) => !current);
    }
  }

  function onPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const data = event.clipboardData;
    if (!data) return;
    const imageItem = Array.from(data.items).find((item) => item.kind === "file" && item.type.startsWith("image/"));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        event.preventDefault();
        void uploadInto(file);
        return;
      }
    }
    const html = data.getData("text/html");
    if (html) {
      event.preventDefault();
      document.execCommand("insertHTML", false, cleanPastedHtml(html));
      emit();
      notice("Conteúdo colado e limpo automaticamente.");
      return;
    }
    const text = data.getData("text/plain");
    if (text) {
      event.preventDefault();
      document.execCommand("insertText", false, text);
      emit();
    }
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    const files = Array.from(event.dataTransfer?.files ?? []).filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;
    event.preventDefault();
    void (async () => {
      for (const file of files) await uploadInto(file);
    })();
  }

  // ---------- effects ----------

  // Offer to recover a draft that survived a reload.
  useEffect(() => {
    if (!draftKey) return;
    try {
      const stored = window.localStorage.getItem(draftKey);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { html?: string; at?: number };
      if (parsed.html && parsed.html !== value) setDraft({ html: parsed.html, at: parsed.at ?? Date.now() });
    } catch {
      /* storage may be unavailable */
    }
    // Only checked when the editor opens another post.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useEffect(() => {
    if (!draftKey) return;
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify({ html: value, at: Date.now() }));
        setSavedAt(Date.now());
      } catch {
        /* ignore quota errors */
      }
    }, 1200);
    return () => window.clearTimeout(id);
  }, [value, draftKey]);

  useEffect(() => {
    if (!full) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [full]);

  function restoreDraft() {
    if (!draft) return;
    const el = ref.current;
    if (el) el.innerHTML = draft.html;
    onChange(draft.html);
    setDraft(null);
    notice("Rascunho restaurado.");
  }

  function discardDraft() {
    if (draftKey) {
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
    }
    setDraft(null);
  }
  // ---------- render ----------

  const savedClock = savedAt ? new Date(savedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
  const keep = (event: React.MouseEvent) => event.preventDefault();

  const Tb = ({ title, on, disabled, action, children }: {
    title: string;
    on?: boolean;
    disabled?: boolean;
    action: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      className={"rte-btn" + (on ? " rte-btn-on" : "")}
      title={title}
      aria-label={title}
      aria-pressed={on ? true : undefined}
      tabIndex={-1}
      disabled={disabled}
      onMouseDown={keep}
      onClick={action}
    >
      {children}
    </button>
  );

  const MenuBtn = ({ id, title, label }: { id: Exclude<MenuKey, null>; title: string; label: string }) => (
    <button
      type="button"
      className={"rte-btn" + (menu === id ? " rte-btn-on" : "")}
      title={title}
      aria-label={title}
      aria-expanded={menu === id}
      tabIndex={-1}
      onMouseDown={keep}
      onClick={() => setMenu(menu === id ? null : id)}
    >
      {label}
    </button>
  );

  const popOver = (id: Exclude<MenuKey, null>, children: React.ReactNode) =>
    menu === id ? (
      <div className="rte-pop" role="dialog" aria-label={id}>
        {children}
      </div>
    ) : null;

  /** Wraps an image action so it explains itself when no image is selected. */
  const withImage = (action: () => void) => () => {
    if (!hasImage) {
      notice("Clique na imagem do texto para usar esses controles.");
      return;
    }
    action();
  };

  return (
    <div className={"rte" + (full ? " rte-full" : "")}>
      <div className="rte-bar rte-bar-compact" role="toolbar" aria-label="Article formatting">
        <select
          className="rte-select rte-style-select rte-paragraph"
          title="Style"
          aria-label="Style"
          value={blockTag}
          onChange={(event) => setBlock(event.target.value)}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="blockquote">Quote</option>
          <option value="pre">Code block</option>
        </select>
        <span className="rte-sep" />
        <Tb title="Bold (Ctrl+B)" action={() => run("bold")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M7 4h7a4 4 0 0 1 0 8H7zM7 12h8a4 4 0 0 1 0 8H7z" /></svg></Tb>
        <Tb title="Italic (Ctrl+I)" action={() => run("italic")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M10 4h8M6 20h8M14 4l-4 16" /></svg></Tb>
        <Tb title="Underline (Ctrl+U)" action={() => run("underline")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 4v7a6 6 0 0 0 12 0V4" /><path d="M4 20h16" /></svg></Tb>
        <Tb title="Link (Ctrl+K)" action={() => setMenu(menu === "link" ? null : "link")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" /><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5" /></svg></Tb>
        <span className="rte-sep" />
        <Tb title="Bulleted list" action={() => run("insertUnorderedList")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="5" cy="6" r="1.4" fill="currentColor" stroke="none" /><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="5" cy="18" r="1.4" fill="currentColor" stroke="none" /></svg></Tb>
        <Tb title="Numbered list" action={() => run("insertOrderedList")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 6h9M11 12h9M11 18h9" /><path d="M4 5.5v3L6 7M4 12h2.5M4 12l2.5-1.5M4 17.5h2M4 17.5 6.5 19" /></svg></Tb>
        <Tb title="Align left" action={() => run("justifyLeft")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h10M4 18h14" /></svg></Tb>
        <Tb title="Align center" action={() => run("justifyCenter")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M7 12h10M5 18h14" /></svg></Tb>
        <Tb title="Add image" action={() => setMenu(menu === "image" ? null : "image")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m5 17 5-4 4 3 3-2 2 1.5" /></svg></Tb>
        <Tb title="Add video" action={() => setMenu(menu === "video" ? null : "video")}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9.5v5l4.5-2.5z" /></svg></Tb>
        <Tb title="More formatting" on={moreOpen} action={() => setMoreOpen((v) => !v)}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg></Tb>
      </div>
      {moreOpen ? (
        <div className="rte-bar rte-more" role="toolbar" aria-label="More formatting">
          <Tb title="Undo (Ctrl+Z)" action={() => run("undo")}>↺</Tb>
          <Tb title="Redo (Ctrl+Y)" action={() => run("redo")}>↻</Tb>
          <select
            className="rte-select"
            title="Font"
            aria-label="Font"
            defaultValue=""
            onChange={(event) => {
              if (event.target.value) applyInlineStyle("font-family", event.target.value);
            }}
          >
            {FONTS.map((font) => (
              <option key={font.label} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
          <select
            className="rte-select rte-select-sm"
            title="Text size"
            aria-label="Text size"
            defaultValue="16px"
            onChange={(event) => applyInlineStyle("font-size", event.target.value)}
          >
            {SIZES.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
          <Tb title="Strikethrough" action={() => run("strikeThrough")}><span className="rte-s">S</span></Tb>
          <Tb title="Inline code" action={() => wrapSelection("code")}>{"</>"}</Tb>
          <Tb title="Superscript" action={() => run("superscript")}>x²</Tb>
          <Tb title="Subscript" action={() => run("subscript")}>x₂</Tb>
          <MenuBtn id="color" title="Text color" label="Color ▾" />
          <MenuBtn id="hilite" title="Highlight" label="Mark ▾" />
          <Tb title="Clear formatting" action={() => run("removeFormat")}>Clear</Tb>
          <Tb title="Decrease indent" action={() => run("outdent")}>− Indent</Tb>
          <Tb title="Increase indent" action={() => run("indent")}>+ Indent</Tb>
          <Tb title="Align right" action={() => run("justifyRight")}>Right</Tb>
          <Tb title="Justify" action={() => run("justifyFull")}>Justify</Tb>
          <MenuBtn id="table" title="Table" label="Table ▾" />
          <MenuBtn id="special" title="Symbols and emoji" label="Symbols ▾" />
          <MenuBtn id="find" title="Find and replace (Ctrl+F)" label="Find ▾" />
          <Tb title="Focus mode" on={full} action={() => setFull((current) => !current)}>
            {full ? "Exit focus" : "Focus"}
          </Tb>
        </div>
      ) : null}

      {flash ? (
        <p className="rte-flash" role="status">
          {flash}
        </p>
      ) : null}

      {popOver("color", (
        <div className="rte-swatches" aria-label="Cores do texto">
          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="rte-sw"
              style={{ background: color }}
              title={"Cor " + color}
              aria-label={"Cor " + color}
              onClick={() => {
                run("foreColor", color);
                setMenu(null);
              }}
            />
          ))}
          <label className="rte-custom">
            Personalizada
            <input type="color" defaultValue="#2e8b4d" onChange={(event) => run("foreColor", event.target.value)} />
          </label>
        </div>
      ))}

      {popOver("hilite", (
        <div className="rte-swatches" aria-label="Marca-texto">
          {HILITE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="rte-sw"
              style={{ background: color === "transparent" ? "#fff" : color }}
              title={color === "transparent" ? "Remover marcação" : "Marca " + color}
              aria-label={color === "transparent" ? "Remover marcação" : "Marca " + color}
              onClick={() => {
                setHighlight(color);
                run("hiliteColor", color);
                setMenu(null);
              }}
            />
          ))}
          <label className="rte-custom">
            Personalizada
            <input
              type="color"
              defaultValue="#fff2a8"
              onChange={(event) => {
                setHighlight(event.target.value);
                run("hiliteColor", event.target.value);
              }}
            />
          </label>
        </div>
      ))}

      {popOver("link", (
        <div className="rte-menu">
          <button type="button" onMouseDown={keep} onClick={() => { insertLink(); setMenu(null); }}>
            Inserir ou editar link
          </button>
          <button type="button" onMouseDown={keep} onClick={() => { run("unlink"); setMenu(null); }}>
            Remover link
          </button>
          <p className="rte-pop-hint">Ctrl+K também insere links. Use /blog/pagina para links internos.</p>
        </div>
      ))}
      {popOver("image", (
        <div className="rte-menu rte-menu-wide">
          <div className="rte-row">
            <button type="button" className="rte-btn rte-btn-primary" onMouseDown={keep} onClick={() => fileRef.current?.click()}>
              Enviar do dispositivo
            </button>
            <button type="button" className="rte-btn" onMouseDown={keep} onClick={insertImageUrl}>
              Usar URL
            </button>
          </div>
          <p className="rte-pop-title">Tamanho</p>
          <div className="rte-row">
            {["25%", "50%", "75%", "100%"].map((width) => (
              <button key={width} type="button" className="rte-btn" onMouseDown={keep} onClick={withImage(() => imageWidth(width))}>
                {width}
              </button>
            ))}
          </div>
          <p className="rte-pop-title">Posição</p>
          <div className="rte-row">
            <button type="button" className="rte-btn" onMouseDown={keep} onClick={withImage(() => imageAlign("left"))}>Esquerda</button>
            <button type="button" className="rte-btn" onMouseDown={keep} onClick={withImage(() => imageAlign("center"))}>Centralizar</button>
            <button type="button" className="rte-btn" onMouseDown={keep} onClick={withImage(() => imageAlign("right"))}>Direita</button>
          </div>
          <p className="rte-pop-title">Outras ações</p>
          <div className="rte-row">
            <button type="button" className="rte-btn" onMouseDown={keep} onClick={withImage(imageAlt)}>Texto alternativo</button>
            <button type="button" className="rte-btn" onMouseDown={keep} onClick={withImage(imageReplace)}>Substituir</button>
            <button type="button" className="rte-btn rte-btn-danger" onMouseDown={keep} onClick={withImage(imageDelete)}>Remover</button>
          </div>
          <p className="rte-pop-hint">
            Você também pode colar (Ctrl+V) ou arrastar imagens direto para o texto.
          </p>
        </div>
      ))}

      {popOver("video", (
        <div className="rte-menu rte-menu-wide">
          <button type="button" className="rte-btn rte-btn-primary" onMouseDown={keep} onClick={insertVideo}>
            Inserir vídeo do YouTube
          </button>
          <p className="rte-pop-hint">
            Aceita links youtube.com/watch, youtu.be ou shorts. O vídeo sai como embed responsivo com carregamento otimizado.
          </p>
        </div>
      ))}
      {popOver("table", (
        <div className="rte-menu rte-menu-wide">
          <p className="rte-pop-title">Nova tabela</p>
          <div className="rte-row">
            <label className="rte-field">
              Linhas
              <input
                type="number"
                min={2}
                max={12}
                value={tableRows}
                onChange={(event) => setTableRows(Math.min(12, Math.max(2, Number(event.target.value) || 2)))}
              />
            </label>
            <label className="rte-field">
              Colunas
              <input
                type="number"
                min={2}
                max={8}
                value={tableCols}
                onChange={(event) => setTableCols(Math.min(8, Math.max(2, Number(event.target.value) || 2)))}
              />
            </label>
            <button type="button" className="rte-btn rte-btn-primary" onMouseDown={keep} onClick={() => insertTable(tableRows, tableCols)}>
              Inserir
            </button>
          </div>
          <p className="rte-pop-title">{inTable ? "Editar tabela" : "Editar tabela (clique em uma célula)"}</p>
          <div className="rte-row">
            <button type="button" className="rte-btn" disabled={!inTable} onMouseDown={keep} onClick={() => tableOp("row-above")}>+ Linha acima</button>
            <button type="button" className="rte-btn" disabled={!inTable} onMouseDown={keep} onClick={() => tableOp("row-below")}>+ Linha abaixo</button>
            <button type="button" className="rte-btn" disabled={!inTable} onMouseDown={keep} onClick={() => tableOp("row-del")}>− Linha</button>
          </div>
          <div className="rte-row">
            <button type="button" className="rte-btn" disabled={!inTable} onMouseDown={keep} onClick={() => tableOp("col-before")}>+ Coluna à esquerda</button>
            <button type="button" className="rte-btn" disabled={!inTable} onMouseDown={keep} onClick={() => tableOp("col-after")}>+ Coluna à direita</button>
            <button type="button" className="rte-btn" disabled={!inTable} onMouseDown={keep} onClick={() => tableOp("col-del")}>− Coluna</button>
          </div>
          <div className="rte-row">
            <button type="button" className="rte-btn" disabled={!inTable} onMouseDown={keep} onClick={toggleHeaderRow}>Alternar cabeçalho</button>
            <button type="button" className="rte-btn rte-btn-danger" disabled={!inTable} onMouseDown={keep} onClick={() => tableOp("remove")}>Excluir tabela</button>
          </div>
          <p className="rte-pop-hint">Use Tab para navegar entre as células e Shift+Tab para voltar.</p>
        </div>
      ))}

      {popOver("special", (
        <div className="rte-menu rte-menu-wide">
          <p className="rte-pop-title">Emojis</p>
          <div className="rte-chars">
            {EMOJIS.map((emoji) => (
              <button key={emoji} type="button" className="rte-char" onMouseDown={keep} onClick={() => insertText(emoji)}>
                {emoji}
              </button>
            ))}
          </div>
          <p className="rte-pop-title">Símbolos</p>
          <div className="rte-chars">
            {SPECIALS.map((symbol) => (
              <button key={symbol} type="button" className="rte-char" onMouseDown={keep} onClick={() => insertText(symbol)}>
                {symbol}
              </button>
            ))}
          </div>
        </div>
      ))}

      {popOver("find", (
        <div className="rte-menu rte-menu-wide">
          <div className="rte-row">
            <label className="rte-field rte-field-grow">
              Localizar
              <input
                type="text"
                value={findTerm}
                placeholder="termo"
                onChange={(event) => setFindTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    findNext();
                  }
                }}
              />
            </label>
            <label className="rte-field rte-field-grow">
              Substituir por
              <input type="text" value={replaceTerm} onChange={(event) => setReplaceTerm(event.target.value)} />
            </label>
          </div>
          <div className="rte-row">
            <button type="button" className="rte-btn" onMouseDown={keep} onClick={findNext}>Localizar próximo</button>
            <button type="button" className="rte-btn" onMouseDown={keep} onClick={replaceCurrent}>Substituir</button>
            <button type="button" className="rte-btn rte-btn-primary" onMouseDown={keep} onClick={replaceAll}>Substituir tudo</button>
          </div>
          <p className="rte-pop-hint">{findMsg || "Ctrl+F abre esta caixa. A busca ignora maiúsculas e minúsculas."}</p>
        </div>
      ))}
      <div className="rte-body">
        <div
          ref={ref}
          className={"rte-doc" + (busy ? " rte-doc-busy" : "")}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Conteúdo do artigo"
          spellCheck
          data-placeholder="Escreva aqui. Atalhos: # título, - lista, > citação, **negrito**, `código`. Cole ou arraste imagens."
          onInput={emit}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onDrop={onDrop}
          onDragOver={(event) => event.preventDefault()}
          onBlur={() => setMenu(null)}
        />
        {busy ? <p className="rte-busy" role="status">Enviando imagem…</p> : null}
      </div>

      <div className="rte-foot">
        <span className="rte-stat">
          {stats.words} palavras · {stats.chars} caracteres · {stats.mins} min de leitura
          {hasImage ? " · imagem selecionada" : ""}
          {inTable ? " · tabela ativa" : ""}
        </span>
        <span className="rte-foot-actions">
          {draft ? (
            <>
              <span className="rte-draft-note">Rascunho local de {new Date(draft.at).toLocaleString("pt-BR")}</span>
              <button className="rte-btn rte-btn-sm" type="button" onMouseDown={keep} onClick={restoreDraft}>
                Restaurar
              </button>
              <button className="rte-btn rte-btn-sm" type="button" onMouseDown={keep} onClick={discardDraft}>
                Descartar
              </button>
            </>
          ) : null}
          {savedClock ? <span className="rte-saved">rascunho local salvo às {savedClock}</span> : null}
          <span className="rte-hint-inline">Ctrl+S salva · Ctrl+K link · Ctrl+F localizar · Ctrl+Shift+D modo foco</span>
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="rte-file"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadInto(file);
        }}
      />
    </div>
  );
}
