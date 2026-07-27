import { Scale } from "lucide-react";
import { PRICE_MARKUP_USD } from "@/lib/constants";
import { formatQAR, formatUSD } from "@/lib/currencyFormatter";
import type { GoldKarat } from "@/lib/types";

interface WeightPriceCardProps {
  label: string;
  karat: GoldKarat;
  usd: number;
  qar: number;
}

export default function WeightPriceCard({
  label,
  karat,
  usd,
  qar,
}: WeightPriceCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-light)]/70 p-3 transition-all duration-300 hover:border-[var(--accent)]/40 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-base text-[var(--text-primary)] sm:text-lg lg:text-xl">
            {label}
          </h3>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--accent)] sm:text-xs">
            {karat}
          </p>
        </div>
        <Scale
          className="h-3.5 w-3.5 shrink-0 text-[var(--accent-soft)]/60 sm:h-4 sm:w-4"
          aria-hidden="true"
        />
      </div>

      <div className="mt-3 space-y-0.5">
        <p className="font-sans text-base font-semibold tabular-nums text-[var(--accent-light)] sm:text-lg lg:text-xl xl:text-2xl">
          {formatUSD(usd)}
        </p>
        <p className="font-sans text-sm tabular-nums text-[var(--accent-soft)] sm:text-base lg:text-lg">
          {formatQAR(qar)}
        </p>
      </div>

      <p className="mt-2 text-[9px] uppercase tracking-wider text-[var(--text-secondary)] sm:text-[10px]">
        USD {PRICE_MARKUP_USD} adjustment included
      </p>
    </article>
  );
}
