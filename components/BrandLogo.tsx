export default function BrandLogo() {
  return (
    <div
      className="brand-logo flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/35 bg-gradient-to-br from-[var(--accent)]/20 via-[var(--surface)] to-[var(--surface-light)] shadow-[0_0_24px_rgba(34,211,238,0.18)] sm:h-14 sm:w-14"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 48 48"
        className="h-7 w-7 sm:h-8 sm:w-8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M24 6L28.5 16.5H39L30.5 23.5L34 34.5L24 27.5L14 34.5L17.5 23.5L9 16.5H19.5L24 6Z"
          stroke="url(#blueGrad)"
          strokeWidth="1.5"
          fill="url(#blueFill)"
          fillOpacity="0.25"
        />
        <circle cx="24" cy="24" r="3" fill="url(#blueGrad)" />
        <defs>
          <linearGradient id="blueGrad" x1="9" y1="6" x2="39" y2="34">
            <stop stopColor="#67e8f9" />
            <stop offset="0.5" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="blueFill" x1="24" y1="6" x2="24" y2="34">
            <stop stopColor="#22d3ee" />
            <stop offset="1" stopColor="#0e7490" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
