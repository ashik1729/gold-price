import { GOLD_API_URL, SILVER_API_URL } from "@/lib/constants";
import type { ExternalMetalApiResponse, MetalsApiResponse } from "@/lib/types";

async function fetchMetalPrice(
  url: string,
  fallbackSymbol: string
): Promise<{ symbol: string; price: number }> {
  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "VictoriaGoldDiamonds/1.0",
      },
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown network error";
    throw new Error(`Network error fetching ${fallbackSymbol}: ${detail}`);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${fallbackSymbol}: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as ExternalMetalApiResponse;

  if (typeof data.price !== "number" || Number.isNaN(data.price)) {
    throw new Error(`Invalid price payload for ${fallbackSymbol}`);
  }

  return {
    symbol: data.symbol ?? fallbackSymbol,
    price: data.price,
  };
}

export async function fetchMetals(): Promise<MetalsApiResponse> {
  const [gold, silver] = await Promise.all([
    fetchMetalPrice(GOLD_API_URL, "XAU"),
    fetchMetalPrice(SILVER_API_URL, "XAG"),
  ]);

  return {
    gold,
    silver,
    updatedAt: new Date().toISOString(),
  };
}
