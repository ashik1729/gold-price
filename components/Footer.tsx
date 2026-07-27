import { COMPANY_NAME, PRICE_MARKUP_USD, TIMEZONE } from "@/lib/constants";
import { formatUpdatedAt } from "@/lib/currencyFormatter";

interface FooterProps {
  updatedAt: string | null;
}

export default function Footer({ updatedAt }: FooterProps) {
  const updateLabel = updatedAt
    ? formatUpdatedAt(updatedAt, TIMEZONE)
    : null;

  return (
    <footer className="relative z-10 mt-auto border-t border-[var(--champagne)]/15 bg-[var(--surface)]/60 backdrop-blur-sm">
      <div className="mx-auto max-w-[1920px] px-4 py-6 text-center sm:px-6 lg:px-10">
        <p className="font-display text-lg tracking-[0.15em] text-[var(--champagne)]">
          {COMPANY_NAME}
        </p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Live precious-metal reference prices
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Prices are indicative and may change without notice
        </p>
        <p className="mt-3 text-xs text-[var(--gold-primary)]/90 sm:text-sm">
          Displayed selling prices include a USD {PRICE_MARKUP_USD} price
          adjustment per displayed item.
        </p>
        {updateLabel && (
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            API update time: {updateLabel} (Asia/Qatar)
          </p>
        )}
      </div>
    </footer>
  );
}
