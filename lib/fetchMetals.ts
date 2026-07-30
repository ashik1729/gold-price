import { GOLDAPI_ENABLED, GOLDAPI_NET_BASE_URL } from "@/lib/constants";
import type { ExternalGoldApiNetResponse, MetalsApiResponse } from "@/lib/types";

async function fetchMetalFromGoldApiNet(
  metalCode: "XAU" | "XAG",
  fallbackSymbol: string
): Promise<{ symbol: string; price: number; bid: number; ask: number }> {
  const apiKey = process.env.GOLDAPI_NET_KEY;
  if (!apiKey) {
    throw new Error("GOLDAPI_NET_KEY is not configured");
  }

  const url = `${GOLDAPI_NET_BASE_URL}/${metalCode}/USD`;
  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "VictoriaGoldDiamonds/1.0",
        "x-api-key": apiKey,
      },
    });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown network error";
    throw new Error(`Network error fetching ${fallbackSymbol}: ${detail}`);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Failed to fetch ${fallbackSymbol}: ${response.status} ${response.statusText}${body ? ` — ${body.slice(0, 200)}` : ""}`
    );
  }

  const data = (await response.json()) as ExternalGoldApiNetResponse;

  if (
    typeof data.price !== "number" ||
    typeof data.bid !== "number" ||
    typeof data.ask !== "number" ||
    Number.isNaN(data.price) ||
    Number.isNaN(data.bid) ||
    Number.isNaN(data.ask)
  ) {
    throw new Error(`Invalid price payload for ${fallbackSymbol}`);
  }

  // Helps judge free-plan freshness while testing 5s polls (check server logs).
  console.info(
    `[goldapi.net] ${fallbackSymbol} price=${data.price} bid=${data.bid} ask=${data.ask}`
  );

  return {
    symbol: data.symbol ?? fallbackSymbol,
    price: data.price,
    bid: data.bid,
    ask: data.ask,
  };
}

export async function fetchMetals(): Promise<MetalsApiResponse> {
  if (!GOLDAPI_ENABLED) {
    throw new Error("Gold API disabled (GOLDAPI_ENABLED=false)");
  }

  const [gold, silver] = await Promise.all([
    fetchMetalFromGoldApiNet("XAU", "XAU"),
    fetchMetalFromGoldApiNet("XAG", "XAG"),
  ]);

  return {
    gold,
    silver,
    updatedAt: new Date().toISOString(),
  };
}
