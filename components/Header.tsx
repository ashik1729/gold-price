"use client";

import BrandLogo from "./BrandLogo";
import FullscreenButton from "./FullscreenButton";
import MarketStatusBadge from "./MarketStatus";
import {
  COMPANY_SUBTITLE,
  COMPANY_TITLE,
  TIMEZONE,
} from "@/lib/constants";
import {
  formatQatarDate,
  formatQatarTime,
} from "@/lib/currencyFormatter";
import type { MarketStatus } from "@/lib/types";
import { useSyncExternalStore } from "react";

interface HeaderProps {
  status: MarketStatus;
  lastUpdatedLabel: string | null;
  onRetry: () => void;
}

function subscribeToClock(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
}

function getClockSnapshot() {
  return Date.now();
}

function getServerClockSnapshot() {
  return 0;
}

export default function Header({
  status,
  lastUpdatedLabel,
  onRetry,
}: HeaderProps) {
  const nowMs = useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getServerClockSnapshot
  );

  const now = nowMs > 0 ? new Date(nowMs) : null;
  const timeLabel = now ? formatQatarTime(now, TIMEZONE) : "—";
  const dateLabel = now ? formatQatarDate(now, TIMEZONE) : "—";

  return (
    <header className="relative z-10 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1920px] flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:px-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <BrandLogo />
          <div>
            <h1 className="font-display text-2xl tracking-[0.18em] text-[var(--text-primary)] sm:text-3xl lg:text-4xl">
              {COMPANY_TITLE}
            </h1>
            <p className="mt-0.5 text-[10px] tracking-[0.32em] text-[var(--accent)] sm:text-xs lg:text-sm">
              {COMPANY_SUBTITLE}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end lg:gap-6">
          <div className="text-left lg:text-right">
            <p
              className="font-sans text-xl font-semibold tabular-nums tracking-wide text-[var(--accent-light)] sm:text-2xl lg:text-3xl"
              aria-live="polite"
              aria-atomic="true"
            >
              {timeLabel}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)] sm:text-sm">
              {dateLabel}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)]/80 sm:text-xs">
              Asia / Qatar
            </p>
          </div>

          <MarketStatusBadge
            status={status}
            lastUpdatedLabel={lastUpdatedLabel}
            onRetry={onRetry}
          />

          <FullscreenButton />
        </div>
      </div>
    </header>
  );
}
