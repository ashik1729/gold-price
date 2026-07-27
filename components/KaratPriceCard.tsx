import { Info } from "lucide-react";
import { GOLD_PURITY_LABEL, PRICE_MARKUP_USD } from "@/lib/constants";
import { formatQAR, formatUSD } from "@/lib/currencyFormatter";
import type { GoldKarat } from "@/lib/types";

interface KaratPriceCardProps {
  karat: GoldKarat;
  usd: number;
  qar: number;
}

function GoldBarIcon({ karat }: { karat: GoldKarat }) {
  const gradId = `barGrad-${karat}`;
  return (
    <svg
      viewBox="0 0 40 28"
      className="h-5 w-7 sm:h-6 sm:w-8"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20L10 6H30L36 20H4Z"
        fill={`url(#${gradId})`}
        stroke="#67e8f9"
        strokeWidth="1"
      />
      <path
        d="M4 20H36V24H4V20Z"
        fill="#0e7490"
        stroke="#67e8f9"
        strokeWidth="0.8"
      />
      <defs>
        <linearGradient id={gradId} x1="4" y1="6" x2="36" y2="20">
          <stop stopColor="#67e8f9" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function KaratPriceCard({ karat, usd, qar }: KaratPriceCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 transition-all duration-300 hover:border-[var(--accent)]/45 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-xl text-[var(--accent-light)] sm:text-2xl lg:text-3xl">
            {karat} Gold
          </h3>
          <p className="mt-1 text-xs text-[var(--text-secondary)] sm:text-sm">
            Purity {GOLD_PURITY_LABEL[karat]}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--accent)]/10">
          <GoldBarIcon karat={karat} />
        </div>
      </div>

      <div className="mt-4 space-y-1 sm:mt-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)] sm:text-xs">
          Victoria Selling Price / Gram
        </p>
        <p className="price-lg font-sans font-semibold tabular-nums text-[var(--text-primary)]">
          {formatUSD(usd)}
        </p>
        <p className="price-md font-sans tabular-nums text-[var(--accent-soft)]">
          {formatQAR(qar)}
        </p>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] sm:mt-4 sm:text-xs">
        <Info className="h-3 w-3 text-[var(--accent)]" aria-hidden="true" />
        Includes USD {PRICE_MARKUP_USD} adjustment
      </p>
    </article>
  );
}
