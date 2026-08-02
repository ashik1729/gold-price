import { GOLDAPI_ENABLED, GOLDAPI_NET_BASE_URL } from "@/lib/constants";
import type {
  ExternalGoldApiNetResponse,
  ExternalMetalApiResponse,
  MetalsApiResponse,
} from "@/lib/types";

type MetalQuote = {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
};

const FREE_GOLD_URL = "https://api.gold-api.com/price/XAU";
const FREE_SILVER_URL = "https://api.gold-api.com/price/XAG";

async function fetchMetalFromFreeApi(
  url: string,
  fallbackSymbol: string
): Promise<MetalQuote> {
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

  // Free API is spot-only — bid/ask start at spot; Victoria offsets apply in UI.
  console.info(`[gold-api.com] ${fallbackSymbol} price=${data.price}`);

  return {
    symbol: data.symbol ?? fallbackSymbol,
    price: data.price,
    bid: data.price,
    ask: data.price,
  };
}

async function fetchMetalFromGoldApiNet(
  metalCode: "XAU" | "XAG",
  fallbackSymbol: string
): Promise<MetalQuote> {
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
      `Failed to fetch ${fallbackSymbol}: ${response.status} ${response.statusText}${body ? ` — ${body.slice(0, 120)}` : ""}`
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

async function fetchMetalPair(
  metalCode: "XAU" | "XAG",
  freeUrl: string
): Promise<MetalQuote> {
  if (GOLDAPI_ENABLED) {
    try {
      return await fetchMetalFromGoldApiNet(metalCode, metalCode);
    } catch (error) {
      // Free plan often dies at 100 calls/month (429) — keep the board alive.
      console.warn(
        `[metals] goldapi.net failed for ${metalCode}, falling back to gold-api.com`,
        error instanceof Error ? error.message : error
      );
    }
  }

  return fetchMetalFromFreeApi(freeUrl, metalCode);
}

export async function fetchMetals(): Promise<MetalsApiResponse> {
  const [gold, silver] = await Promise.all([
    fetchMetalPair("XAU", FREE_GOLD_URL),
    fetchMetalPair("XAG", FREE_SILVER_URL),
  ]);

  return {
    gold,
    silver,
    updatedAt: new Date().toISOString(),
  };
}
