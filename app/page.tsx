"use client";

import { Maximize, Minimize } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  COMPANY_SUBTITLE,
  COMPANY_TITLE,
  DISPLAY_WEIGHT_OPTIONS,
  KARAT_OPTIONS,
  KARAT_ROTATE_INTERVAL_MS,
  PREVIOUS_PRICES_KEY,
  REFRESH_INTERVAL_MS,
  STORAGE_KEY,
  TIMEZONE,
} from "@/lib/constants";
import {
  formatChangeAbsolute,
  formatChangePercent,
  formatQARAmount,
  formatQatarDateShort,
  formatQatarTime,
  formatQatarWeekday,
  formatSpotUSD,
  formatUpdatedAt,
  formatUSD,
} from "@/lib/currencyFormatter";
import {
  getGoldOunceSellingPrice,
  getPriceChange,
  getWeightSellingPrice,
} from "@/lib/goldCalculations";
import type {
  GoldKarat,
  MarketStatus,
  MetalsApiResponse,
  PreviousMetalPrices,
  PriceChange,
} from "@/lib/types";

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
    // Ignore storage failures.
  }
}

function readPreviousPrices(): PreviousMetalPrices | null {
  try {
    const raw = localStorage.getItem(PREVIOUS_PRICES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreviousMetalPrices;
    if (
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

function writePreviousPrices(prices: PreviousMetalPrices) {
  try {
    localStorage.setItem(PREVIOUS_PRICES_KEY, JSON.stringify(prices));
  } catch {
    // Ignore storage failures.
  }
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
      // Fullscreen may be blocked.
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

export default function HomePage() {
  const [data, setData] = useState<MetalsApiResponse | null>(null);
  const [status, setStatus] = useState<MarketStatus>("loading");
  const [selectedKarat, setSelectedKarat] = useState<GoldKarat>("24K");
  const [now, setNow] = useState<Date | null>(null);
  const [goldChange, setGoldChange] = useState<PriceChange | null>(null);
  const [silverChange, setSilverChange] = useState<PriceChange | null>(null);
  const fetchingRef = useRef(false);

  // Qatar clock — updates once per second (client only).
  useEffect(() => {
    const tick = () => setNow(new Date());
    const bootId = window.setTimeout(tick, 0);
    const intervalId = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(bootId);
      window.clearInterval(intervalId);
    };
  }, []);

  // Auto-rotate karat tabs for TV display.
  useEffect(() => {
    const id = window.setInterval(() => {
      setSelectedKarat((current) => {
        const index = KARAT_OPTIONS.indexOf(current);
        const next = (index + 1) % KARAT_OPTIONS.length;
        return KARAT_OPTIONS[next];
      });
    }, KARAT_ROTATE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, []);

  const fetchPrices = useCallback(async (mode: "initial" | "refresh") => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (mode === "refresh") {
      setStatus("updating");
    }

    try {
      const response = await fetch("/api/metals", { cache: "no-store" });
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

      const previous = readPreviousPrices();
      setGoldChange(getPriceChange(payload.gold.price, previous?.gold));
      setSilverChange(getPriceChange(payload.silver.price, previous?.silver));
      writePreviousPrices({
        gold: payload.gold.price,
        silver: payload.silver.price,
      });

      setStatus("live");
    } catch {
      setStatus("error");
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  // Load cache + start live refresh (once on mount).
  useEffect(() => {
    const cached = readCache();
    const previous = readPreviousPrices();

    if (cached) {
      setData(cached);
      setStatus("updating");
      setGoldChange(getPriceChange(cached.gold.price, previous?.gold));
      setSilverChange(getPriceChange(cached.silver.price, previous?.silver));
    }

    const bootId = window.setTimeout(() => {
      void fetchPrices(cached ? "refresh" : "initial");
    }, 0);

    const intervalId = window.setInterval(() => {
      void fetchPrices("refresh");
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearTimeout(bootId);
      window.clearInterval(intervalId);
    };
  }, [fetchPrices]);

  const lastUpdatedLabel = data
    ? formatUpdatedAt(data.updatedAt, TIMEZONE)
    : null;

  const showSkeleton = !data && status === "loading";
  const goldOz = data ? getGoldOunceSellingPrice(data.gold.price) : null;

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
          <div aria-live="polite" aria-atomic="true">
            {now ? formatQatarTime(now, TIMEZONE) : "--:--:--"}
          </div>
          <div className="small-label">QATAR TIME</div>
        </div>

        <div className="topbar-actions">
          <div style={{ textAlign: "right" }}>
            <div>{now ? formatQatarWeekday(now, TIMEZONE) : "---"}</div>
            <div className="small-label">
              {now ? formatQatarDateShort(now, TIMEZONE) : "---"}
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
      </section>

      {showSkeleton ? (
        <>
          <section className="spot-panel" aria-hidden="true">
            <div className="spot">
              <div className="skeleton-block" style={{ width: "55%", height: 14 }} />
              <div
                className="skeleton-block"
                style={{ width: "70%", height: 48, marginTop: 16 }}
              />
            </div>
            <div className="spot silver">
              <div className="skeleton-block" style={{ width: "55%", height: 14 }} />
              <div
                className="skeleton-block"
                style={{ width: "70%", height: 48, marginTop: 16 }}
              />
            </div>
          </section>
          <div className="cards" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card">
                <div className="skeleton-block" style={{ width: "40%", height: 18 }} />
                <div
                  className="skeleton-block"
                  style={{ width: "80%", height: 28, marginTop: 28 }}
                />
                <div
                  className="skeleton-block"
                  style={{ width: "70%", height: 28, marginTop: 18 }}
                />
              </div>
            ))}
          </div>
        </>
      ) : data && goldOz ? (
        <>
          <section className="spot-panel" aria-label="Spot prices">
            <article className="spot">
              <div className="spot-title">GOLD SPOT (USD / OZ)</div>
              <div className="spot-price">{formatSpotUSD(goldOz.usd)}</div>
              <ChangePill change={goldChange} />
            </article>

            <article className="spot silver">
              <div className="spot-title">SILVER SPOT (USD / OZ)</div>
              <div className="spot-price">
                {formatSpotUSD(data.silver.price)}
              </div>
              <ChangePill change={silverChange} />
            </article>
          </section>

          <div
            className="tabs"
            role="radiogroup"
            aria-label="Select gold karat"
          >
            {KARAT_OPTIONS.map((karat) => (
              <button
                key={karat}
                type="button"
                role="radio"
                aria-checked={selectedKarat === karat}
                className={`tab${selectedKarat === karat ? " active" : ""}`}
                onClick={() => setSelectedKarat(karat)}
              >
                GOLD {karat}
              </button>
            ))}
          </div>

          <section
            className="cards"
            aria-label={`${selectedKarat} weight prices`}
          >
            {DISPLAY_WEIGHT_OPTIONS.map((weight) => {
              const price = getWeightSellingPrice(
                data.gold.price,
                selectedKarat,
                weight.grams
              );
              return (
                <article key={weight.id} className="card">
                  <div className="card-head">
                    <span>{weight.label}</span>
                    <span className="mini-live">LIVE</span>
                  </div>
                  <div className="row">
                    <div className="currency">QAR</div>
                    <div className="value">{formatQARAmount(price.qar)}</div>
                  </div>
                  <div className="row">
                    <div className="currency">USD</div>
                    <div className="value usd">{formatUSD(price.usd)}</div>
                  </div>
                </article>
              );
            })}
          </section>
        </>
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

      <footer className="status-bar">
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
      </footer>
    </main>
  );
}
