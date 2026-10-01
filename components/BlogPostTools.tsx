"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const ARTICLE_SELECTOR = ".blg-content";

function PlayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M4.9 2.7a.9.9 0 0 1 1.35-.78l7.4 4.55a.9.9 0 0 1 0 1.55l-7.4 4.55a.9.9 0 0 1-1.35-.78z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" focusable="false">
      <rect x="4" y="3" width="3.1" height="10" rx="1" />
      <rect x="8.9" y="3" width="3.1" height="10" rx="1" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6.6 9.4a2.5 2.5 0 0 0 3.5 0l2.3-2.3a2.5 2.5 0 0 0-3.5-3.5L7.9 4.6" />
      <path d="M9.4 6.6a2.5 2.5 0 0 0-3.5 0L3.6 8.9a2.5 2.5 0 0 0 3.5 3.5l1-1" />
    </svg>
  );
}

/** Cloud/neural voices sound far better than the local SAPI/eSpeak ones, so rank
    whatever the device offers and take the best Portuguese one available. */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase().replace("_", "-");
  if (!lang.startsWith("pt")) return 0;
  let score = lang === "pt-br" ? 60 : 20; // pt-PT only as a last resort
  if (name.includes("natural")) score += 40;
  if (name.includes("neural")) score += 40;
  if (name.includes("online")) score += 15;
  if (name.includes("google")) score += 20;
  if (name.includes("microsoft")) score += 10;
  if (name.includes("espeak") || name.includes("compact") || name.includes("robot")) score -= 40;
  if (!voice.localService) score += 8; // the remote ones are the good ones
  if (voice.default) score += 2;
  return score;
}

function bestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = 0;
  for (const voice of voices) {
    const score = scoreVoice(voice);
    if (score > bestScore) {
      bestScore = score;
      best = voice;
    }
  }
  return best;
}

const CHUNK_CHARS = 220;

/** Chrome drops a single long utterance after ~15 s, so speak the article in
    sentence-sized queue items; overly long sentences are cut at a comma. */
function splitLongSentence(sentence: string): string[] {
  const parts: string[] = [];
  let rest = sentence;
  while (rest.length > CHUNK_CHARS) {
    const window = rest.slice(0, CHUNK_CHARS);
    const cut = Math.max(window.lastIndexOf(", "), window.lastIndexOf("; "), window.lastIndexOf(": "), window.lastIndexOf(" "));
    if (cut < 40) break; // no sensible break point: keep what is left whole
    parts.push(rest.slice(0, cut + 1));
    rest = rest.slice(cut + 1);
  }
  parts.push(rest);
  return parts;
}

function toChunks(text: string): string[] {
  const sentences = text.match(/[^.!?…]+[.!?…]+|\S[^.!?…]*$/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    for (const piece of splitLongSentence(sentence)) {
      if (current && current.length + piece.length > CHUNK_CHARS) {
        chunks.push(current.trim());
        current = piece;
      } else {
        current += piece;
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function clock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function BlogPostListen({ duration }: { duration: string }) {
  // Rendered on the server too, so the toolbar looks complete on first paint and
  // only disappears where the browser has no Speech Synthesis at all.
  const [supported, setSupported] = useState(true);
  const [speech, setSpeech] = useState<"idle" | "playing" | "paused">("idle");
  const [elapsed, setElapsed] = useState(0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const chunksRef = useRef<string[]>([]);
  const timerRef = useRef<number | null>(null);

  const stopClock = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startClock = useCallback(() => {
    stopClock();
    timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
  }, [stopClock]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      setSupported(false);
      return;
    }
    const refresh = () => {
      voiceRef.current = bestVoice(synth.getVoices());
    };
    refresh(); // Chrome fills the list asynchronously
    synth.addEventListener("voiceschanged", refresh);
    return () => {
      synth.removeEventListener("voiceschanged", refresh);
      stopClock();
      try {
        synth.cancel();
      } catch {
        /* speech is optional */
      }
    };
  }, [stopClock]);

  const speakChunk = useCallback(
    function speak(synth: SpeechSynthesis, index: number) {
      const text = chunksRef.current[index];
      if (!text) {
        setSpeech("idle");
        setElapsed(0);
        stopClock();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 1;
      utterance.pitch = 1;
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.onend = () => speak(synth, index + 1);
      utterance.onerror = () => {
        setSpeech("idle");
        setElapsed(0);
        stopClock();
      };
      synth.speak(utterance);
    },
    [stopClock]
  );

  const toggle = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speech === "playing") {
      synth.pause();
      stopClock();
      setSpeech("paused");
      return;
    }
    if (speech === "paused") {
      synth.resume();
      startClock();
      setSpeech("playing");
      return;
    }
    // The article markup is already on the page, so read it from the DOM instead
    // of shipping a second copy of the text to the browser.
    const text = (document.querySelector(ARTICLE_SELECTOR)?.textContent ?? "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return;
    chunksRef.current = toChunks(text);
    setElapsed(0);
    synth.cancel();
    speakChunk(synth, 0);
    startClock();
    setSpeech("playing");
  }, [speech, speakChunk, startClock, stopClock]);

  const label = speech === "playing" ? "Pausar" : speech === "paused" ? "Continuar" : "Ouvir artigo";
  const timing = speech === "idle" ? duration : `${clock(elapsed)} / ${duration}`;

  if (!supported) return <span className="blg-bar-time">{duration}</span>;

  return (
    <span className="blg-bar-group">
      <button
        type="button"
        className="blg-play"
        onClick={toggle}
        aria-label={label}
        aria-pressed={speech !== "idle"}
      >
        {speech === "playing" ? <PauseIcon /> : <PlayIcon />}
      </button>
      <span className="blg-bar-label">{label}</span>
      <span className="blg-bar-div" aria-hidden="true" />
      <span className="blg-bar-time">{timing}</span>
    </span>
  );
}

export function BlogPostShare({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    try {
      if (typeof nav.share === "function") {
        await nav.share({ title, text: title, url });
        return;
      }
      await nav.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* dismissed by the user or blocked by the browser; nothing to do */
    }
  }, [title, url]);

  return (
    <button type="button" className="blg-share" onClick={share} aria-label="Compartilhar este artigo">
      <LinkIcon />
      <span>{copied ? "Link copiado" : "Compartilhar"}</span>
    </button>
  );
}
