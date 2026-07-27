import { Gem } from "lucide-react";

interface SpotPriceCardProps {
  title: string;
  subtitle: string;
  badge: string;
  primaryValue: string;
  secondaryValue?: string;
  accent?: "spot" | "selling";
  icon?: "gold" | "silver" | "gem";
}

export default function SpotPriceCard({
  title,
  subtitle,
  badge,
  primaryValue,
  secondaryValue,
  accent = "spot",
  icon = "gold",
}: SpotPriceCardProps) {
  const isSpot = accent === "spot";

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border p-4 sm:p-5 lg:p-6 ${
        isSpot
          ? "border-[var(--accent)]/35 bg-gradient-to-br from-[var(--surface-light)] via-[var(--surface)] to-[#06101c] shadow-[0_0_40px_rgba(34,211,238,0.1)]"
          : "border-[var(--border)] bg-[var(--surface)]/90"
      }`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--accent)]/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-xs ${
              isSpot
                ? "border-[var(--accent)]/45 text-[var(--accent-light)]"
                : "border-[var(--accent-soft)]/35 text-[var(--accent-soft)]"
            }`}
          >
            {badge}
          </span>
          <h3 className="font-display mt-2 text-base text-[var(--text-primary)] sm:text-lg lg:text-xl xl:text-2xl">
            {title}
          </h3>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--text-secondary)] sm:text-xs">
            {subtitle}
          </p>
        </div>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--accent)]/10 text-[var(--accent)] sm:h-10 sm:w-10"
          aria-hidden="true"
        >
          {icon === "silver" ? (
            <span className="text-sm font-semibold text-slate-300 sm:text-base">
              Ag
            </span>
          ) : icon === "gem" ? (
            <Gem className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <span className="text-sm font-semibold text-[var(--accent-light)] sm:text-base">
              Au
            </span>
          )}
        </div>
      </div>

      <p
        className={`relative mt-4 font-sans font-semibold tabular-nums tracking-tight text-[var(--accent-light)] ${
          isSpot ? "price-hero" : "price-lg"
        }`}
      >
        {primaryValue}
      </p>

      {secondaryValue && (
        <p className="relative mt-1 font-sans text-base tabular-nums text-[var(--accent-soft)] sm:text-lg lg:text-xl">
          {secondaryValue}
        </p>
      )}
    </article>
  );
}
