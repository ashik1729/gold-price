export type GoldKarat = "24K" | "22K" | "21K" | "18K";

export type MarketStatus = "live" | "updating" | "error" | "loading";

export interface MetalPrice {
  symbol: string;
  price: number;
}

export interface MetalsApiResponse {
  gold: MetalPrice;
  silver: MetalPrice;
  updatedAt: string;
}

export interface PreviousMetalPrices {
  gold: number;
  silver: number;
}

export interface PriceChange {
  absolute: number;
  percent: number;
  direction: "up" | "down" | "flat";
}

export interface ExternalMetalApiResponse {
  price: number;
  symbol?: string;
  name?: string;
  updatedAt?: string;
  currency?: string;
}

export interface WeightOption {
  id: string;
  label: string;
  grams: number;
}

export interface CalculatedPrice {
  usd: number;
  qar: number;
}

export interface GoldPurityMap {
  "24K": number;
  "22K": number;
  "21K": number;
  "18K": number;
}
