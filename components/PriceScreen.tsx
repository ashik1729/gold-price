"use client";

import { Maximize, Minimize } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  COMPANY_SUBTITLE,
  COMPANY_TITLE,
  DAY_BASELINE_KEY,
  REFRESH_INTERVAL_MS,
  STORAGE_KEY,
  TIMEZONE,
} from "@/lib/constants";
import {
  formatChangeAbsolute,
  formatChangePercent,
  formatQatarDateShort,
  formatQatarTime,
  formatQatarWeekday,
  formatSpotUSD,
  formatUpdatedAt,
} from "@/lib/currencyFormatter";
import {
  getAskPrice,
  getBidPrice,
  getPriceChange,
} from "@/lib/goldCalculations";
import type {
  DayBaselinePrices,
  MarketStatus,
  MetalsApiResponse,
  PriceChange,
} from "@/lib/types";

const FETCH_TIMEOUT_MS = 15000;

function readCache(): MetalsApiResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MetalsApiResponse;
    if (
      typeof parsed?.gold?.price === "number" &&
      typeof parsed?.silver?.price === "number" &&
      typeof parsed?.updatedAt === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeCache(data: MetalsApiResponse) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage failures (common on locked-down TV browsers).
  }
}

function qatarDateKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function readDayBaseline(): DayBaselinePrices | null {
  try {
    const raw = localStorage.getItem(DAY_BASELINE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DayBaselinePrices;
    if (
      typeof parsed?.date === "string" &&
      typeof parsed?.gold === "number" &&
      typeof parsed?.silver === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeDayBaseline(baseline: DayBaselinePrices) {
  try {
    localStorage.setItem(DAY_BASELINE_KEY, JSON.stringify(baseline));
  } catch {
    // Ignore storage failures.
  }
}

function getTodayBaseline(): DayBaselinePrices | null {
  const existing = readDayBaseline();
  if (existing && existing.date === qatarDateKey()) {
    return existing;
  }
  return null;
}

function resolveDayBaseline(
  gold: number,
  silver: number
): DayBaselinePrices {
  const existing = getTodayBaseline();
  if (existing) return existing;

  const baseline: DayBaselinePrices = {
    date: qatarDateKey(),
    gold,
    silver,
  };
  writeDayBaseline(baseline);
  return baseline;
}

function changesAgainstBaseline(
  gold: number,
  silver: number,
  baseline: DayBaselinePrices | null
): { gold: PriceChange | null; silver: PriceChange | null } {
  if (!baseline) {
    return { gold: null, silver: null };
  }
  return {
    gold: getPriceChange(gold, baseline.gold),
    silver: getPriceChange(silver, baseline.silver),
  };
}

function ChangePill({ change }: { change: PriceChange | null }) {
  if (!change) {
    return <div className="change-pill flat">—</div>;
  }

  const arrow =
    change.direction === "up" ? "▲" : change.direction === "down" ? "▼" : "•";

  return (
    <div className={`change-pill ${change.direction}`} aria-live="polite">
      <span className="change-arrow" aria-hidden="true">
        {arrow}
      </span>
      <span>{formatChangeAbsolute(change.absolute)}</span>
      <span className="pct">{formatChangePercent(change.percent)}</span>
    </div>
  );
}

function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
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
      // Fullscreen may be blocked on TV browsers.
    }
  }, []);

  return (
    <button
      type="button"
      className="fs-btn"
      onClick={toggle}
      aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
    >
      {isFullscreen ? (
        <Minimize className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Maximize className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

function QuoteCard({
  title,
  side,
  price,
  change,
  metal,
}: {
  title: string;
  side: "BID" | "ASK";
  price: number;
  change: PriceChange | null;
  metal: "gold" | "silver";
}) {
  return (
    <article className={`spot ${metal} ${side.toLowerCase()}`}>
      <div className="spot-title">
        {title} {side}
      </div>
      <div className="spot-side">{side} · USD / OZ</div>
      <div className="spot-price">{formatSpotUSD(price)}</div>
      <ChangePill change={change} />
    </article>
  );
}

interface PriceScreenProps {
  initialData: MetalsApiResponse | null;
  initialError?: string | null;
}

export default function PriceScreen({
  initialData,
  initialError = null,
}: PriceScreenProps) {
  const [data, setData] = useState<MetalsApiResponse | null>(initialData);
  const [status, setStatus] = useState<MarketStatus>(
    initialData ? "live" : initialError ? "error" : "loading"
  );
  const [now, setNow] = useState<Date>(() => new Date());
  const [goldChange, setGoldChange] = useState<PriceChange | null>(
    initialData
      ? { absolute: 0, percent: 0, direction: "flat" }
      : null
  );
  const [silverChange, setSilverChange] = useState<PriceChange | null>(
    initialData
      ? { absolute: 0, percent: 0, direction: "flat" }
      : null
  );
  const fetchingRef = useRef(false);
  const seededRef = useRef(false);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!initialData) return;

    const id = window.setTimeout(() => {
      if (seededRef.current) return;
      seededRef.current = true;
      writeCache(initialData);
      const baseline = resolveDayBaseline(
        initialData.gold.price,
        initialData.silver.price
      );
      const changes = changesAgainstBaseline(
        initialData.gold.price,
        initialData.silver.price,
        baseline
      );
      setGoldChange(changes.gold);
      setSilverChange(changes.silver);
    }, 0);

    return () => window.clearTimeout(id);
  }, [initialData]);

  const fetchPrices = useCallback(async (mode: "initial" | "refresh") => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (mode === "refresh") {
      setStatus("updating");
    }

    const supportsAbort = typeof AbortController !== "undefined";
    const controller = supportsAbort ? new AbortController() : null;
    const timeoutId = window.setTimeout(() => {
      controller?.abort();
    }, FETCH_TIMEOUT_MS);

    try {
      const response = await fetch("/api/metals", {
        cache: "no-store",
        ...(controller ? { signal: controller.signal } : {}),
      });
      if (!response.ok) throw new Error("Failed to load metal prices");

      const payload = (await response.json()) as MetalsApiResponse;
      if (
        typeof payload.gold?.price !== "number" ||
        typeof payload.silver?.price !== "number"
      ) {
        throw new Error("Invalid metal price response");
      }

      setData(payload);
      writeCache(payload);

      const baseline = resolveDayBaseline(
        payload.gold.price,
        payload.silver.price
      );
      const changes = changesAgainstBaseline(
        payload.gold.price,
        payload.silver.price,
        baseline
      );
      setGoldChange(changes.gold);
      setSilverChange(changes.silver);

      setStatus("live");
    } catch {
      setStatus("error");
    } finally {
      window.clearTimeout(timeoutId);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const bootId = window.setTimeout(() => {
      if (!initialData) {
        const cached = readCache();
        if (cached) {
          setData(cached);
          setStatus("updating");
          const changes = changesAgainstBaseline(
            cached.gold.price,
            cached.silver.price,
            getTodayBaseline()
          );
          setGoldChange(changes.gold);
          setSilverChange(changes.silver);
          void fetchPrices("refresh");
          return;
        }
        void fetchPrices("initial");
        return;
      }

      void fetchPrices("refresh");
    }, initialData ? 5000 : 0);

    const intervalId = window.setInterval(() => {
      void fetchPrices("refresh");
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearTimeout(bootId);
      window.clearInterval(intervalId);
    };
  }, [fetchPrices, initialData]);

  const lastUpdatedLabel = data
    ? formatUpdatedAt(data.updatedAt, TIMEZONE)
    : null;

  const showSkeleton = !data && status === "loading";

  const statusText =
    status === "loading"
      ? "Connecting to live price…"
      : status === "updating"
        ? "Updating prices…"
        : status === "error"
          ? data
            ? `Unable to refresh — showing last price (${lastUpdatedLabel})`
            : "Unable to update live price"
          : `Live price updated ${lastUpdatedLabel}`;

  return (
    <main className="screen">
      <header className="topbar">
        <div>
          <div aria-live="polite" aria-atomic="true" suppressHydrationWarning>
            {formatQatarTime(now, TIMEZONE)}
          </div>
          <div className="small-label">QATAR TIME</div>
        </div>

        <div className="topbar-actions">
          <div style={{ textAlign: "right" }}>
            <div suppressHydrationWarning>
              {formatQatarWeekday(now, TIMEZONE)}
            </div>
            <div className="small-label" suppressHydrationWarning>
              {formatQatarDateShort(now, TIMEZONE)}
            </div>
          </div>
          <FullscreenButton />
        </div>
      </header>

      <section className="brand">
        <div className="brand-mark" aria-hidden="true">
          ◈
        </div>
        <h1>{COMPANY_TITLE}</h1>
        <div className="brand-sub">{COMPANY_SUBTITLE}</div>
        <div className="status-bar" role="status" aria-live="polite">
          <div>
            <span
              className={`status-dot${
                status === "error"
                  ? " error"
                  : status === "loading" || status === "updating"
                    ? " loading"
                    : ""
              }`}
            />
            <span>{statusText}</span>
            {status === "error" && (
              <button
                type="button"
                className="retry-btn"
                onClick={() => void fetchPrices("refresh")}
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </section>

      {showSkeleton ? (
        <section className="spot-panel quotes" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`spot ${i > 1 ? "silver" : ""}`}>
              <div className="skeleton-block" style={{ width: "55%", height: 14 }} />
              <div
                className="skeleton-block"
                style={{ width: "70%", height: 48, marginTop: 16 }}
              />
            </div>
          ))}
        </section>
      ) : data ? (
        <section className="spot-panel quotes" aria-label="Bid and ask prices">
          <QuoteCard
            title="GOLD"
            side="BID"
            metal="gold"
            price={getBidPrice(data.gold.price)}
            change={goldChange}
          />
          <QuoteCard
            title="GOLD"
            side="ASK"
            metal="gold"
            price={getAskPrice(data.gold.price)}
            change={goldChange}
          />
          <QuoteCard
            title="SILVER"
            side="BID"
            metal="silver"
            price={getBidPrice(data.silver.price)}
            change={silverChange}
          />
          <QuoteCard
            title="SILVER"
            side="ASK"
            metal="silver"
            price={getAskPrice(data.silver.price)}
            change={silverChange}
          />
        </section>
      ) : (
        <section className="spot-panel" role="alert">
          <article className="spot" style={{ gridColumn: "1 / -1" }}>
            <div className="spot-title">UNABLE TO LOAD LIVE PRICES</div>
            <div className="spot-live muted" style={{ marginTop: "1rem" }}>
              No demo prices are shown
            </div>
            <button
              type="button"
              className="retry-btn"
              style={{ marginTop: "1.25rem" }}
              onClick={() => void fetchPrices("refresh")}
            >
              Retry
            </button>
          </article>
        </section>
      )}
    </main>
  );
}
