import { z } from "zod";

// Crypto to CoinGecko ID mapping
const CRYPTO_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  ADA: "cardano",
  DOT: "polkadot",
  MATIC: "matic-network",
  LINK: "chainlink",
  UNI: "uniswap",
  AVAX: "avalanche-2",
  ATOM: "cosmos",
  DOGE: "dogecoin",
  LTC: "litecoin",
  XRP: "ripple",
  BNB: "binancecoin",
  USDT: "tether",
  USDC: "usd-coin",
  DAI: "dai",
  AAVE: "aave",
  SUSHI: "sushi",
  CRV: "curve-dao-token",
};

export interface PriceData {
  symbol: string;
  price: number;
  change24h?: number;
  timestamp: number;
}

/**
 * Fetch cryptocurrency price from CoinGecko API
 * No API key required - completely free
 */
export async function getCryptoPrice(symbol: string): Promise<PriceData> {
  try {
    // Get CoinGecko ID from mapping or use symbol as fallback
    const coinId = CRYPTO_ID_MAP[symbol.toUpperCase()] || symbol.toLowerCase();

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data[coinId]) {
      throw new Error(`Cryptocurrency ${symbol} not found`);
    }

    const priceData = data[coinId];

    return {
      symbol: symbol.toUpperCase(),
      price: priceData.usd,
      change24h: priceData.usd_24h_change,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching crypto price for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch stock price from Yahoo Finance API
 * No API key required - completely free
 */
export async function getStockPrice(symbol: string): Promise<PriceData> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.quoteSummary?.result?.[0]?.price) {
      throw new Error(`Stock ${symbol} not found`);
    }

    const priceData = data.quoteSummary.result[0].price;
    const currentPrice = priceData.regularMarketPrice?.raw || 0;
    const previousClose = priceData.regularMarketPreviousClose?.raw || currentPrice;
    const change24h = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0;

    return {
      symbol: symbol.toUpperCase(),
      price: currentPrice,
      change24h,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch price for any asset (crypto or stock)
 * Tries crypto first, then stock
 */
export async function getAssetPrice(
  symbol: string,
  assetType?: "crypto" | "stock"
): Promise<PriceData> {
  const upperSymbol = symbol.toUpperCase();

  if (assetType === "crypto") {
    return getCryptoPrice(upperSymbol);
  }

  if (assetType === "stock") {
    return getStockPrice(upperSymbol);
  }

  // Try crypto first, then stock
  try {
    return await getCryptoPrice(upperSymbol);
  } catch {
    try {
      return await getStockPrice(upperSymbol);
    } catch (error) {
      console.error(`Could not fetch price for ${symbol}:`, error);
      throw new Error(`Failed to fetch price for ${symbol}`);
    }
  }
}

/**
 * Batch fetch prices for multiple assets
 * Includes rate limiting to avoid API throttling
 */
export async function batchGetPrices(
  assets: Array<{ symbol: string; type?: "crypto" | "stock" }>
): Promise<Map<string, PriceData>> {
  const results = new Map<string, PriceData>();
  const errors: string[] = [];

  // Process with delay to avoid rate limiting
  for (const asset of assets) {
    try {
      const priceData = await getAssetPrice(asset.symbol, asset.type);
      results.set(asset.symbol.toUpperCase(), priceData);
      // 200ms delay between requests
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      errors.push(`${asset.symbol}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  if (errors.length > 0) {
    console.warn("Some price fetches failed:", errors);
  }

  return results;
}

/**
 * Cache market data in database
 * This would be called from db.ts
 */
export interface MarketDataCache {
  symbol: string;
  price: number;
  change24h?: number;
  timestamp: number;
}

/**
 * Format price data for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format percentage change
 */
export function formatPercentage(change: number): string {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}
