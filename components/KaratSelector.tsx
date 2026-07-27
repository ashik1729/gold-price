"use client";

import { KARAT_OPTIONS } from "@/lib/constants";
import type { GoldKarat } from "@/lib/types";

interface KaratSelectorProps {
  value: GoldKarat;
  onChange: (karat: GoldKarat) => void;
}

export default function KaratSelector({ value, onChange }: KaratSelectorProps) {
  return (
    <div
      className="inline-flex flex-wrap gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 p-1.5"
      role="radiogroup"
      aria-label="Select gold karat for weight prices"
    >
      {KARAT_OPTIONS.map((karat) => {
        const selected = value === karat;
        return (
          <button
            key={karat}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(karat)}
            className={`min-w-[3.75rem] rounded-lg px-3 py-2 text-sm font-semibold tracking-wide transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:min-w-[4.5rem] sm:px-4 sm:py-2.5 sm:text-base ${
              selected
                ? "bg-gradient-to-b from-[var(--accent-light)] to-[var(--accent)] text-[#042f2e] shadow-[0_4px_16px_rgba(34,211,238,0.35)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-light)] hover:text-[var(--accent-soft)]"
            }`}
          >
            {karat}
          </button>
        );
      })}
    </div>
  );
}
