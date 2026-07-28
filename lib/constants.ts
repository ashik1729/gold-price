import type { GoldKarat, WeightOption } from "./types";

export const COMPANY_NAME = "Victoria Gold & Diamonds";
export const COMPANY_TITLE = "VICTORIA";
export const COMPANY_SUBTITLE = "GOLD & DIAMONDS";

/** USD markup for legacy weight/karat calculations. From env. */
export const PRICE_MARKUP_USD = Number.parseFloat(
  process.env.NEXT_PUBLIC_PRICE_MARKUP_USD ?? "2"
);

/** Bid = live spot − this amount (USD/oz). Same for gold and silver. */
export const BID_OFFSET_USD = Number.parseFloat(
  process.env.NEXT_PUBLIC_BID_OFFSET_USD ?? "1"
);
/** Ask = live spot + this amount (USD/oz). Same for gold and silver. */
export const ASK_OFFSET_USD = Number.parseFloat(
  process.env.NEXT_PUBLIC_ASK_OFFSET_USD ?? "2"
);

export const USD_TO_QAR = 3.64;
export const REFRESH_INTERVAL_MS = 60000;
export const TROY_OUNCE_IN_GRAMS = 31.1034768;
export const TIMEZONE = "Asia/Qatar";

export const GOLD_API_URL = "https://api.gold-api.com/price/XAU";
export const SILVER_API_URL = "https://api.gold-api.com/price/XAG";

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
