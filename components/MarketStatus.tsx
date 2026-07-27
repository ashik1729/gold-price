"use client";

import { AlertTriangle, Loader2, Radio } from "lucide-react";
import type { MarketStatus } from "@/lib/types";

interface MarketStatusProps {
  status: MarketStatus;
  lastUpdatedLabel: string | null;
  onRetry?: () => void;
}

const STATUS_COPY: Record<MarketStatus, string> = {
  live: "Live Market Data",
  updating: "Updating Prices",
  error: "Unable to update live price",
  loading: "Loading Prices",
};

export default function MarketStatusBadge({
  status,
  lastUpdatedLabel,
  onRetry,
}: MarketStatusProps) {
  const isError = status === "error";
  const isUpdating = status === "updating" || status === "loading";
  const isLive = status === "live";

  return (
    <div className="flex flex-col items-end gap-1 text-right">
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs tracking-wide sm:text-sm ${
          isError
            ? "border-amber-400/40 bg-amber-500/10 text-amber-100"
            : isLive
              ? "border-[var(--live)]/40 bg-[var(--live)]/10 text-[var(--live)]"
              : "border-[var(--accent)]/35 bg-[var(--accent)]/10 text-[var(--accent-light)]"
        }`}
        role="status"
        aria-live="polite"
      >
        {isError ? (
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        ) : isUpdating ? (
          <Loader2
            className="h-3.5 w-3.5 shrink-0 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Radio
            className="h-3.5 w-3.5 shrink-0 animate-pulse"
            aria-hidden="true"
          />
        )}
        <span className="font-medium">{STATUS_COPY[status]}</span>
      </div>

      {lastUpdatedLabel && (
        <p className="text-[10px] text-[var(--text-secondary)] sm:text-xs lg:text-sm">
          Last updated at {lastUpdatedLabel}
        </p>
      )}

      {isError && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-0.5 rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100 transition-colors hover:bg-amber-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          Retry
        </button>
      )}
    </div>
  );
}
