"use client";

import { Maximize, Minimize } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may be blocked by the browser.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-light)] text-[var(--accent-soft)] transition-colors hover:border-[var(--accent)]/60 hover:text-[var(--accent-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:h-11 sm:w-11"
    >
      {isFullscreen ? (
        <Minimize className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Maximize className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
