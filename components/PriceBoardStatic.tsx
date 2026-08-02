import {
  COMPANY_SUBTITLE,
  COMPANY_TITLE,
  TIMEZONE,
} from "@/lib/constants";
import {
  formatQatarDateShort,
  formatQatarTime,
  formatQatarWeekday,
  formatSpotUSD,
  formatUpdatedAt,
} from "@/lib/currencyFormatter";
import { getAskPrice, getBidPrice } from "@/lib/goldCalculations";
import type { MetalsApiResponse } from "@/lib/types";

type PriceBoardStaticProps = {
  data: MetalsApiResponse | null;
  error: string | null;
  generatedAt: Date;
};

function StaticQuote({
  title,
  side,
  metal,
  price,
}: {
  title: string;
  side: "BID" | "ASK";
  metal: "gold" | "silver";
  price: number;
}) {
  return (
    <article className={`spot ${metal} ${side.toLowerCase()}`}>
      <div className="spot-eyebrow">{title}</div>
      <div className="spot-title">{side}</div>
      <div className="spot-side">USD / OZ</div>
      <div className="spot-price">{formatSpotUSD(price)}</div>
      <div className="change-pill flat">—</div>
    </article>
  );
}

/**
 * Pure server HTML board — works with zero client JavaScript (old TV browsers).
 * Capable browsers hide this once PriceScreen mounts and takes over.
 */
export default function PriceBoardStatic({
  data,
  error,
  generatedAt,
}: PriceBoardStaticProps) {
  const statusText = data
    ? `Live price updated ${formatUpdatedAt(data.updatedAt, TIMEZONE)}`
    : error
      ? "Unable to update live price"
      : "Connecting to live price…";

  return (
    <main className="screen" id="legacy-board">
      <div className="screen-bg" aria-hidden="true">
        <div
          className="screen-bg__image focus-center is-active"
          style={{ backgroundImage: 'url("/brand-assets/page10-img1.jpg")' }}
        />
        <div className="screen-bg__veil" />
      </div>

      <header className="topbar">
        <div>
          <div>{formatQatarTime(generatedAt, TIMEZONE)}</div>
          <div className="small-label">QATAR TIME</div>
        </div>
        <div className="topbar-actions">
          <div style={{ textAlign: "right" }}>
            <div>{formatQatarWeekday(generatedAt, TIMEZONE)}</div>
            <div className="small-label">
              {formatQatarDateShort(generatedAt, TIMEZONE)}
            </div>
          </div>
        </div>
      </header>

      <section className="brand">
        <div className="brand-lockup">
          {/* Plain img — next/image optimizer breaks on many TV browsers. */}
          <img
            src="/brand-assets/page4-img1.png"
            alt=""
            width={56}
            height={56}
            className="brand-logo"
          />
          <div className="brand-copy">
            <h1>{COMPANY_TITLE}</h1>
            <div className="brand-sub">{COMPANY_SUBTITLE}</div>
          </div>
        </div>
        <div className="status-bar" role="status">
          <div>
            <span
              className={`status-dot${error && !data ? " error" : ""}`}
            />
            <span>{statusText}</span>
          </div>
        </div>
      </section>

      {data ? (
        <section className="spot-panel quotes" aria-label="Bid and ask prices">
          <StaticQuote
            title="GOLD"
            side="BID"
            metal="gold"
            price={getBidPrice(data.gold.bid)}
          />
          <StaticQuote
            title="GOLD"
            side="ASK"
            metal="gold"
            price={getAskPrice(data.gold.ask)}
          />
          <StaticQuote
            title="SILVER"
            side="BID"
            metal="silver"
            price={getBidPrice(data.silver.bid)}
          />
          <StaticQuote
            title="SILVER"
            side="ASK"
            metal="silver"
            price={getAskPrice(data.silver.ask)}
          />
        </section>
      ) : (
        <section className="spot-panel" role="alert">
          <article className="spot" style={{ gridColumn: "1 / -1" }}>
            <div className="spot-title">UNABLE TO LOAD LIVE PRICES</div>
            <div className="spot-live muted" style={{ marginTop: "1rem" }}>
              {error?.includes("429") || error?.toLowerCase().includes("limit")
                ? "Price feed temporarily unavailable. Retrying…"
                : (error ?? "No demo prices are shown")}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
