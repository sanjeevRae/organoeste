"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FIRST_VIDEO_ID = "--6H65KgVeg";
const SECOND_VIDEO_ID = "5EzSC-bpC5c";
const VIDEO_THUMBNAIL = `https://img.youtube.com/vi/${FIRST_VIDEO_ID}/maxresdefault.jpg`;

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function WhatWeDo() {
  const [videoOpen, setVideoOpen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const phaseRef = useRef(0);
  const transitionedRef = useRef(false);

  const closeVideo = useCallback(() => setVideoOpen(false), []);
  const openVideo = useCallback(() => setVideoOpen(true), []);

  useEffect(() => {
    if (!videoOpen) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // The iframe may already have been removed by YouTube.
        }
        playerRef.current = null;
      }
      phaseRef.current = 0;
      transitionedRef.current = false;
      return;
    }

    let cancelled = false;
    let initTimeout: number | undefined;
    let previousReadyCallback: (() => void) | undefined;
    let readyCallback: (() => void) | undefined;

    const initializePlayer = () => {
      if (
        cancelled ||
        !playerContainerRef.current ||
        !window.YT?.Player ||
        playerRef.current
      ) {
        return;
      }

      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        videoId: FIRST_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          enablejsapi: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            try {
              event.target.playVideo();
            } catch {
              // Playback can be blocked until the browser accepts the action.
            }
          },
          onStateChange: (event: any) => {
            const youtube = window.YT;
            const target = event?.target;
            if (!youtube || !target) return;

            if (
              phaseRef.current === 0 &&
              event.data === youtube.PlayerState.ENDED &&
              !transitionedRef.current
            ) {
              transitionedRef.current = true;
              phaseRef.current = 1;
              try {
                target.loadVideoById({
                  videoId: SECOND_VIDEO_ID,
                  startSeconds: 7,
                });
              } catch {
                // Leave the player open if YouTube cannot load the next clip.
              }
            } else if (
              phaseRef.current === 1 &&
              event.data === youtube.PlayerState.ENDED
            ) {
              phaseRef.current = 2;
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      initTimeout = window.setTimeout(initializePlayer, 40);
    } else {
      previousReadyCallback = window.onYouTubeIframeAPIReady;
      readyCallback = () => {
        try {
          previousReadyCallback?.();
        } catch {
          // Do not let another callback prevent this player from initializing.
        }
        initializePlayer();
      };
      window.onYouTubeIframeAPIReady = readyCallback;

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeVideo();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      cancelled = true;
      if (initTimeout !== undefined) window.clearTimeout(initTimeout);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";

      if (readyCallback && window.onYouTubeIframeAPIReady === readyCallback) {
        window.onYouTubeIframeAPIReady = previousReadyCallback;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore teardown errors from an already-closed YouTube iframe.
        }
        playerRef.current = null;
      }
    };
  }, [videoOpen, closeVideo]);

  return (
    <section className="whatwedo-section" id="o-que-fazemos" aria-label="O Que Fazemos">
      <div className="whatwedo-shell">
        <div className="whatwedo-media">
          <img
            className="whatwedo-thumbnail"
            src={VIDEO_THUMBNAIL}
            alt="Prévia do vídeo institucional sobre o trabalho da Organoeste"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => {
              const fallback = `https://img.youtube.com/vi/${FIRST_VIDEO_ID}/hqdefault.jpg`;
              if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
            }}
          />
          <div className="whatwedo-tab" aria-hidden="true">
            <span>O Que Fazemos</span>
          </div>
          <button
            type="button"
            className="whatwedo-play"
            onClick={openVideo}
            aria-label="Assistir aos vídeos sobre o que fazemos"
            aria-haspopup="dialog"
            aria-expanded={videoOpen}
          >
            <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
              <circle cx="32" cy="32" r="32" fill="#ffffff" />
              <path d="M26 19.5 47.5 32 26 44.5Z" fill="#151515" />
            </svg>
          </button>
        </div>
      </div>

      {videoOpen && (
        <div
          className="whatwedo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Vídeos sobre o que fazemos"
          onClick={closeVideo}
        >
          <div
            className="whatwedo-lightbox-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="whatwedo-lightbox-close"
              onClick={closeVideo}
              aria-label="Fechar vídeos"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            <div ref={playerContainerRef} className="whatwedo-lightbox-player" />
          </div>
        </div>
      )}
    </section>
  );
}
