"use client";

import { Maximize, Minimize } from "lucide-react";
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  BACKGROUND_MEDIA,
  BACKGROUND_ROTATE_MS,
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
/** How long green/red card backgrounds stay before returning to gray. */
const FLASH_HOLD_MS = 1000;

function readCache(): MetalsApiResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MetalsApiResponse;
    if (
      typeof parsed?.gold?.price === "number" &&
      typeof parsed?.gold?.bid === "number" &&
      typeof parsed?.gold?.ask === "number" &&
      typeof parsed?.silver?.price === "number" &&
      typeof parsed?.silver?.bid === "number" &&
      typeof parsed?.silver?.ask === "number" &&
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
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    // Asia/Qatar = UTC+3, no DST
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60_000;
    const q = new Date(utcMs + 3 * 3600_000);
    const y = q.getFullYear();
    const m = String(q.getMonth() + 1).padStart(2, "0");
    const d = String(q.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
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
      <span className="change-abs">{formatChangeAbsolute(change.absolute)}</span>
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

function BackgroundStage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mediaReady, setMediaReady] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % BACKGROUND_MEDIA.length);
  }, []);

  // Defer video + rotation until JS runs — keeps old TV first paint light (SSR = first image).
  useEffect(() => {
    setMediaReady(true);
  }, []);

  useEffect(() => {
    if (!mediaReady || BACKGROUND_MEDIA.length < 2) return;

    const active = BACKGROUND_MEDIA[activeIndex];
    if (active.type === "video") {
      // Advance when the video finishes (handled via onEnded).
      return;
    }

    const id = window.setTimeout(goNext, BACKGROUND_ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [activeIndex, goNext, mediaReady]);

  useEffect(() => {
    if (!mediaReady) return;

    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex && BACKGROUND_MEDIA[index]?.type === "video") {
        video.currentTime = 0;
        void video.play().catch(() => {
          // If autoplay fails, don't leave the board stuck on a dead slide.
          goNext();
        });
      } else {
        video.pause();
      }
    });
  }, [activeIndex, goNext, mediaReady]);

  const slides = mediaReady
    ? BACKGROUND_MEDIA
    : BACKGROUND_MEDIA.filter((item) => item.type === "image").slice(0, 1);

  return (
    <div className="screen-bg" aria-hidden="true">
      {slides.map((item, index) => {
        const focus = item.focus ?? "center";
        const active = index === activeIndex ? " is-active" : "";
        if (item.type === "video") {
          return (
            <video
              key={item.src}
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              className={`screen-bg__video focus-${focus}${active}`}
              src={item.src}
              muted
              playsInline
              preload="metadata"
              onEnded={goNext}
            />
          );
        }
        return (
          <div
            key={item.src}
            className={`screen-bg__image focus-${focus}${active}`}
            style={{ backgroundImage: `url("${item.src}")` }}
          />
        );
      })}
      <div className="screen-bg__veil" />
    </div>
  );
}

function QuoteCard({
  title,
  side,
  price,
  change,
  metal,
  flash,
}: {
  title: string;
  side: "BID" | "ASK";
  price: number;
  change: PriceChange | null;
  metal: "gold" | "silver";
  flash: "up" | "down" | "flat";
}) {
  return (
    <article
      className={`spot ${metal} ${side.toLowerCase()} flash-${flash}`}
    >
      <div className="spot-eyebrow">{title}</div>
      <div className="spot-title">{side}</div>
      <div className="spot-side">USD / OZ</div>
      <div className="spot-price">{formatSpotUSD(price)}</div>
      <ChangePill change={change} />
    </article>
  );
}

interface PriceScreenProps {
  initialData: MetalsApiResponse | null;
  initialError?: string | null;
  /** From server `GOLDAPI_ENABLED` — false stops client polling. */
  apiEnabled?: boolean;
}

export default function PriceScreen({
  initialData,
  initialError = null,
  apiEnabled = true,
}: PriceScreenProps) {
  // null until client mount — avoids duplicate SSR UI; legacy board stays if JS fails.
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<MetalsApiResponse | null>(initialData);
  const [status, setStatus] = useState<MarketStatus>(() => {
    if (initialData) return "live";
    if (initialError) return "error";
    // No JS + no SSR prices must not sit on "Connecting…" forever (old TVs).
    if (!apiEnabled) return "error";
    return "loading";
  });
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
  const [goldFlash, setGoldFlash] = useState<"up" | "down" | "flat">("flat");
  const [silverFlash, setSilverFlash] = useState<"up" | "down" | "flat">(
    "flat"
  );
  const fetchingRef = useRef(false);
  const seededRef = useRef(false);
  const prevGoldRef = useRef<number | null>(initialData?.gold.price ?? null);
  const prevSilverRef = useRef<number | null>(
    initialData?.silver.price ?? null
  );
  const goldFlashTimerRef = useRef<number | null>(null);
  const silverFlashTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      prevGoldRef.current = initialData.gold.price;
      prevSilverRef.current = initialData.silver.price;
      resolveDayBaseline(initialData.gold.price, initialData.silver.price);
      setGoldChange({ absolute: 0, percent: 0, direction: "flat" });
      setSilverChange({ absolute: 0, percent: 0, direction: "flat" });
      setGoldFlash("flat");
      setSilverFlash("flat");
    }, 0);

    return () => window.clearTimeout(id);
  }, [initialData]);

  const triggerFlash = useCallback(
    (
      metal: "gold" | "silver",
      direction: "up" | "down" | "flat"
    ) => {
      if (direction === "flat") return;

      if (metal === "gold") {
        setGoldFlash(direction);
        if (goldFlashTimerRef.current) {
          window.clearTimeout(goldFlashTimerRef.current);
        }
        goldFlashTimerRef.current = window.setTimeout(() => {
          setGoldFlash("flat");
        }, FLASH_HOLD_MS);
        return;
      }

      setSilverFlash(direction);
      if (silverFlashTimerRef.current) {
        window.clearTimeout(silverFlashTimerRef.current);
      }
      silverFlashTimerRef.current = window.setTimeout(() => {
        setSilverFlash("flat");
      }, FLASH_HOLD_MS);
    },
    []
  );

  // Soft-fail on old TV browsers that lack AbortController / fetch quirks.
  const fetchPrices = useCallback(async (mode: "initial" | "refresh") => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (mode === "initial") {
      setStatus("loading");
    }

    const supportsAbort = typeof AbortController !== "undefined";
    const controller = supportsAbort ? new AbortController() : null;
    const timeoutId = window.setTimeout(() => {
      controller?.abort();
    }, FETCH_TIMEOUT_MS);

    try {
      if (typeof fetch !== "function") {
        throw new Error("Fetch API unavailable");
      }

      const response = await fetch(`/api/metals?t=${Date.now()}`, {
        cache: "no-store",
        ...(controller ? { signal: controller.signal } : {}),
      });
      if (!response.ok) throw new Error("Failed to load metal prices");

      const payload = (await response.json()) as MetalsApiResponse;
      if (
        typeof payload.gold?.price !== "number" ||
        typeof payload.gold?.bid !== "number" ||
        typeof payload.gold?.ask !== "number" ||
        typeof payload.silver?.price !== "number" ||
        typeof payload.silver?.bid !== "number" ||
        typeof payload.silver?.ask !== "number"
      ) {
        throw new Error("Invalid metal price response");
      }

      // Browser console: compare consecutive polls to judge goldapi.net freshness.
      console.info("[metals poll]", {
        at: payload.updatedAt,
        gold: {
          price: payload.gold.price,
          bid: payload.gold.bid,
          ask: payload.gold.ask,
          displayBid: getBidPrice(payload.gold.bid),
          displayAsk: getAskPrice(payload.gold.ask),
        },
        silver: {
          price: payload.silver.price,
          bid: payload.silver.bid,
          ask: payload.silver.ask,
          displayBid: getBidPrice(payload.silver.bid),
          displayAsk: getAskPrice(payload.silver.ask),
        },
      });

      const prevGold = prevGoldRef.current;
      const prevSilver = prevSilverRef.current;
      const goldTick =
        typeof prevGold === "number"
          ? getPriceChange(payload.gold.price, prevGold)
          : null;
      const silverTick =
        typeof prevSilver === "number"
          ? getPriceChange(payload.silver.price, prevSilver)
          : null;

      prevGoldRef.current = payload.gold.price;
      prevSilverRef.current = payload.silver.price;

      // Keep day baseline stored; pill shows last-tick move (previous poll → now).
      resolveDayBaseline(payload.gold.price, payload.silver.price);

      startTransition(() => {
        setData((prev) => {
          if (
            prev &&
            prev.gold.price === payload.gold.price &&
            prev.gold.bid === payload.gold.bid &&
            prev.gold.ask === payload.gold.ask &&
            prev.silver.price === payload.silver.price &&
            prev.silver.bid === payload.silver.bid &&
            prev.silver.ask === payload.silver.ask
          ) {
            return prev;
          }
          return payload;
        });

        // Only update pill when price actually moved; otherwise keep last move.
        if (goldTick && goldTick.direction !== "flat") {
          setGoldChange(goldTick);
        }
        if (silverTick && silverTick.direction !== "flat") {
          setSilverChange(silverTick);
        }

        setStatus((prev) => (prev === "live" ? prev : "live"));
      });

      if (goldTick?.direction === "up" || goldTick?.direction === "down") {
        triggerFlash("gold", goldTick.direction);
      }
      if (silverTick?.direction === "up" || silverTick?.direction === "down") {
        triggerFlash("silver", silverTick.direction);
      }

      writeCache(payload);
    } catch {
      startTransition(() => {
        setStatus((prev) => (prev === "error" ? prev : "error"));
      });
    } finally {
      window.clearTimeout(timeoutId);
      fetchingRef.current = false;
    }
  }, [triggerFlash]);

  useEffect(() => {
    if (!mounted) return;

    if (!apiEnabled) {
      // Kill switch: keep SSR/cache on screen, do not call /api/metals.
      const cached = readCache();
      if (cached) {
        startTransition(() => {
          setData(cached);
          prevGoldRef.current = cached.gold.price;
          prevSilverRef.current = cached.silver.price;
          setStatus("live");
        });
      } else if (!initialData) {
        startTransition(() => setStatus("error"));
      }
      return () => {
        if (goldFlashTimerRef.current) window.clearTimeout(goldFlashTimerRef.current);
        if (silverFlashTimerRef.current) {
          window.clearTimeout(silverFlashTimerRef.current);
        }
      };
    }

    if (!initialData) {
      const cached = readCache();
      if (cached) {
        startTransition(() => {
          setData(cached);
          prevGoldRef.current = cached.gold.price;
          prevSilverRef.current = cached.silver.price;
          setGoldChange({ absolute: 0, percent: 0, direction: "flat" });
          setSilverChange({ absolute: 0, percent: 0, direction: "flat" });
          setGoldFlash("flat");
          setSilverFlash("flat");
          setStatus("live");
        });
        void fetchPrices("refresh");
      } else {
        void fetchPrices("initial");
      }
    } else {
      void fetchPrices("refresh");
    }

    const intervalId = window.setInterval(() => {
      void fetchPrices("refresh");
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      if (goldFlashTimerRef.current) window.clearTimeout(goldFlashTimerRef.current);
      if (silverFlashTimerRef.current) {
        window.clearTimeout(silverFlashTimerRef.current);
      }
    };
  }, [mounted, fetchPrices, initialData, apiEnabled]);

  const lastUpdatedLabel = data
    ? formatUpdatedAt(data.updatedAt, TIMEZONE)
    : null;

  const showSkeleton = !data && status === "loading";

  const statusText =
    status === "loading"
      ? "Connecting to live price…"
      : status === "error"
        ? data
          ? `Unable to refresh — showing last price (${lastUpdatedLabel})`
          : "Unable to update live price"
        : `Live price updated ${lastUpdatedLabel}`;

  const isBusy = status === "loading";

  if (!mounted) {
    return null;
  }

  return (
    <main
      className="screen screen--live"
      style={{ background: "#061634", color: "#f8f2e7" }}
    >
      <BackgroundStage />
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
        <div className="brand-lockup">
          <img
            src="/brand-assets/page4-img1.png"
            alt=""
            aria-hidden="true"
            className="brand-logo"
            width={56}
            height={56}
          />
          <div className="brand-copy">
            <h1>{COMPANY_TITLE}</h1>
            <div className="brand-sub">{COMPANY_SUBTITLE}</div>
          </div>
        </div>
        <div className="status-bar" role="status" aria-live="polite">
          <div>
            <span
              className={`status-dot${
                status === "error" ? " error" : isBusy ? " loading" : ""
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
            price={getBidPrice(data.gold.bid)}
            change={goldChange}
            flash={goldFlash}
          />
          <QuoteCard
            title="GOLD"
            side="ASK"
            metal="gold"
            price={getAskPrice(data.gold.ask)}
            change={goldChange}
            flash={goldFlash}
          />
          <QuoteCard
            title="SILVER"
            side="BID"
            metal="silver"
            price={getBidPrice(data.silver.bid)}
            change={silverChange}
            flash={silverFlash}
          />
          <QuoteCard
            title="SILVER"
            side="ASK"
            metal="silver"
            price={getAskPrice(data.silver.ask)}
            change={silverChange}
            flash={silverFlash}
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
