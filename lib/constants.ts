import type { GoldKarat, WeightOption } from "./types";

export const COMPANY_NAME = "Victoria Gold & Diamonds";
export const COMPANY_TITLE = "VICTORIA";
export const COMPANY_SUBTITLE = "GOLD & DIAMONDS";

/** USD markup for legacy weight/karat calculations. From env. */
export const PRICE_MARKUP_USD = Number.parseFloat(
  process.env.NEXT_PUBLIC_PRICE_MARKUP_USD ?? "2"
);

/** Display bid = API bid − this amount (USD/oz). Same for gold and silver. */
export const BID_OFFSET_USD = Number.parseFloat(
  process.env.NEXT_PUBLIC_BID_OFFSET_USD ?? "1"
);
/** Display ask = API ask + this amount (USD/oz). Same for gold and silver. */
export const ASK_OFFSET_USD = Number.parseFloat(
  process.env.NEXT_PUBLIC_ASK_OFFSET_USD ?? "2"
);

export const USD_TO_QAR = 3.64;

/**
 * When true, prefer goldapi.net (real bid/ask). On failure/429, falls back to
 * free gold-api.com automatically. Set false to skip goldapi.net entirely
 * (recommended until you buy Pro — free plan is only 100 calls/month).
 */
export const GOLDAPI_ENABLED =
  (process.env.GOLDAPI_ENABLED ?? "false").toLowerCase() === "true";

/** Client poll interval (ms). Default 5000 for goldapi.net free/pro testing. */
export const REFRESH_INTERVAL_MS = Number.parseInt(
  process.env.NEXT_PUBLIC_REFRESH_INTERVAL_MS ?? "5000",
  10
);

/**
 * Full-page reload interval (seconds) for TV / no-JS browsers.
 * Modern browsers remove this meta tag via inline script and keep silent polling.
 * Set `NEXT_PUBLIC_META_REFRESH_SEC=0` to disable.
 */
export const META_REFRESH_SEC = Number.parseInt(
  process.env.NEXT_PUBLIC_META_REFRESH_SEC ?? "30",
  10
);
export const TROY_OUNCE_IN_GRAMS = 31.1034768;
export const TIMEZONE = "Asia/Qatar";

/** Full-bleed showroom backgrounds that crossfade on the TV screen. */
export type BackgroundMedia = {
  src: string;
  type: "image" | "video";
  /** Crop focus — `right` keeps subject clear of the center price cards. */
  focus?: "center" | "right";
};

export const BACKGROUND_MEDIA: readonly BackgroundMedia[] = [
  { src: "/brand-assets/page10-img1.jpg", type: "image", focus: "center" },
  { src: "/brand-assets/gold-splash.png", type: "image", focus: "right" },
  { src: "/brand-assets/homepage_lady_fortuna_2.mp4", type: "video", focus: "center" },
  { src: "/brand-assets/fortuna-die.png", type: "image", focus: "right" },
  { src: "/brand-assets/fortuna-collection.png", type: "image", focus: "right" },
] as const;

/** How long each still image stays visible before fading to the next. */
export const BACKGROUND_ROTATE_MS = 3000;

/** Docs path `/price/...` is stale; live endpoint is `/api/price/{metal}/{currency}`. */
export const GOLDAPI_NET_BASE_URL = "https://app.goldapi.net/api/price";

export const STORAGE_KEY = "victoria-metals-cache";
/** First gold/silver prices seen today (Qatar date) — used for up/down %. */
export const DAY_BASELINE_KEY = "victoria-metals-day-baseline";

export const GOLD_PURITY: Record<GoldKarat, number> = {
  "24K": 1,
  "22K": 22 / 24,
  "21K": 21 / 24,
  "18K": 18 / 24,
};

export const GOLD_PURITY_LABEL: Record<GoldKarat, string> = {
  "24K": "99.9%",
  "22K": "91.6%",
  "21K": "87.5%",
  "18K": "75%",
};

export const KARAT_OPTIONS: GoldKarat[] = ["24K", "22K", "21K", "18K"];

/** Main TV display weights (matches showroom preview layout). */
export const DISPLAY_WEIGHT_OPTIONS: WeightOption[] = [
  { id: "1kg", label: "1 kg", grams: 1000 },
  { id: "100g", label: "100 g", grams: 100 },
  { id: "1oz", label: "1 oz", grams: TROY_OUNCE_IN_GRAMS },
  { id: "10g", label: "10 g", grams: 10 },
];

export const WEIGHT_OPTIONS: WeightOption[] = [
  { id: "1g", label: "1 Gram", grams: 1 },
  { id: "5g", label: "5 Grams", grams: 5 },
  { id: "10g", label: "10 Grams", grams: 10 },
  { id: "20g", label: "20 Grams", grams: 20 },
  { id: "50g", label: "50 Grams", grams: 50 },
  { id: "100g", label: "100 Grams", grams: 100 },
  { id: "1oz", label: "1 Troy Ounce", grams: TROY_OUNCE_IN_GRAMS },
  { id: "1kg", label: "1 Kilogram", grams: 1000 },
];
