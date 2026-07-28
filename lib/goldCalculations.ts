import {
  ASK_OFFSET_USD,
  BID_OFFSET_USD,
  GOLD_PURITY,
  PRICE_MARKUP_USD,
  TROY_OUNCE_IN_GRAMS,
  USD_TO_QAR,
} from "./constants";
import type { CalculatedPrice, GoldKarat, PriceChange } from "./types";

/** Bid price (USD/oz) = live spot − $1. */
export function getBidPrice(liveSpotPerOunce: number): number {
  return liveSpotPerOunce - BID_OFFSET_USD;
}

/** Ask price (USD/oz) = live spot + $2. */
export function getAskPrice(liveSpotPerOunce: number): number {
  return liveSpotPerOunce + ASK_OFFSET_USD;
}

export function getGoldPricePerGram24K(liveGoldPricePerOunce: number): number {
  return liveGoldPricePerOunce / TROY_OUNCE_IN_GRAMS;
}

export function getKaratPricePerGram(
  liveGoldPricePerOunce: number,
  karat: GoldKarat
): number {
  const goldPricePerGram24K = getGoldPricePerGram24K(liveGoldPricePerOunce);
  return goldPricePerGram24K * GOLD_PURITY[karat];
}

/** Convert a USD amount to QAR (no markup). */
export function toQAR(usd: number): number {
  return usd * USD_TO_QAR;
}

/**
 * Victoria selling price: calculated USD + env markup, then QAR.
 * Markup is applied once per displayed selling-price item.
 */
export function applyVictoriaMarkup(calculatedUSD: number): CalculatedPrice {
  const usd = calculatedUSD + PRICE_MARKUP_USD;
  const qar = usd * USD_TO_QAR;
  return { usd, qar };
}

/** Gold oz selling price = live spot oz + markup from env. */
export function getGoldOunceSellingPrice(
  liveGoldPricePerOunce: number
): CalculatedPrice {
  return applyVictoriaMarkup(liveGoldPricePerOunce);
}

export function getKaratSellingPricePerGram(
  liveGoldPricePerOunce: number,
  karat: GoldKarat
): CalculatedPrice {
  const karatPricePerGram = getKaratPricePerGram(liveGoldPricePerOunce, karat);
  return applyVictoriaMarkup(karatPricePerGram);
}

export function getWeightSellingPrice(
  liveGoldPricePerOunce: number,
  karat: GoldKarat,
  grams: number
): CalculatedPrice {
  const karatPricePerGram = getKaratPricePerGram(liveGoldPricePerOunce, karat);
  const calculatedUSD = karatPricePerGram * grams;
  return applyVictoriaMarkup(calculatedUSD);
}

/** Compare current spot to previous stored spot. */
export function getPriceChange(
  current: number,
  previous: number | null | undefined
): PriceChange | null {
  if (typeof previous !== "number" || previous <= 0) return null;

  const absolute = current - previous;
  const percent = (absolute / previous) * 100;

  if (Math.abs(absolute) < 0.0001) {
    return { absolute: 0, percent: 0, direction: "flat" };
  }

  return {
    absolute,
    percent,
    direction: absolute > 0 ? "up" : "down",
  };
}
