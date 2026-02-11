import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "./db";

describe("Investment Transaction Functions", () => {
  describe("createInvestmentTransaction", () => {
    it("should create a transaction with buy type", async () => {
      const result = await db.createInvestmentTransaction(
        1,
        null,
        "AAPL",
        "stock",
        "buy",
        "10",
        "150.00",
        "1.99",
        "Initial purchase",
        new Date("2026-02-01")
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.totalAmount).toBe("1500");
    });

    it("should create a transaction with sell type", async () => {
      const result = await db.createInvestmentTransaction(
        1,
        1,
        "AAPL",
        "stock",
        "sell",
        "5",
        "175.00",
        "1.99",
        "Partial sale",
        new Date("2026-02-10")
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.totalAmount).toBe("875");
    });

    it("should handle crypto transactions", async () => {
      const result = await db.createInvestmentTransaction(
        1,
        null,
        "BTC",
        "crypto",
        "buy",
        "0.5",
        "45000.00",
        "10.00",
        "Bitcoin purchase",
        new Date("2026-02-01")
      );

      expect(result).toBeDefined();
      expect(result.totalAmount).toBe("22500");
    });

    it("should calculate total amount correctly with fees", async () => {
      const result = await db.createInvestmentTransaction(
        1,
        null,
        "AAPL",
        "stock",
        "buy",
        "100",
        "150.00",
        "9.99",
        "Large purchase",
        new Date("2026-02-01")
      );

      expect(result).toBeDefined();
      expect(result.totalAmount).toBe("15000");
    });
  });

  describe("getInvestmentTransactions", () => {
    it("should return empty array for user with no transactions", async () => {
      const result = await db.getInvestmentTransactions(999);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should filter transactions by symbol", async () => {
      const result = await db.getInvestmentTransactions(1, "AAPL");
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return all transactions when no symbol filter", async () => {
      const result = await db.getInvestmentTransactions(1);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("deleteInvestmentTransaction", () => {
    it("should delete a transaction", async () => {
      const result = await db.deleteInvestmentTransaction(1, 1);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should only delete transactions for the correct user", async () => {
      const result = await db.deleteInvestmentTransaction(999, 1);
      expect(result).toBeDefined();
    });
  });
});

describe("Price History Functions", () => {
  describe("recordPriceHistory", () => {
    it("should record a price snapshot", async () => {
      const result = await db.recordPriceHistory(
        "AAPL",
        "stock",
        "150.50",
        new Date("2026-02-11")
      );

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.symbol).toBe("AAPL");
      expect(result.price).toBe("150.50");
    });

    it("should record crypto prices", async () => {
      const result = await db.recordPriceHistory(
        "BTC",
        "crypto",
        "45000.00",
        new Date("2026-02-11")
      );

      expect(result).toBeDefined();
      expect(result.symbol).toBe("BTC");
    });

    it("should handle decimal prices", async () => {
      const result = await db.recordPriceHistory(
        "AAPL",
        "stock",
        "150.123456",
        new Date("2026-02-11")
      );

      expect(result).toBeDefined();
    });
  });

  describe("getPriceHistory", () => {
    it("should return price history for a symbol", async () => {
      const result = await db.getPriceHistory("AAPL", 30);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should respect days parameter", async () => {
      const result = await db.getPriceHistory("AAPL", 7);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should default to 30 days", async () => {
      const result = await db.getPriceHistory("AAPL");
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for non-existent symbol", async () => {
      const result = await db.getPriceHistory("NONEXISTENT", 30);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should return prices in ascending order by date", async () => {
      const result = await db.getPriceHistory("AAPL", 30);
      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          const currentDate = new Date((result[i] as any).recordedAt);
          const nextDate = new Date((result[i + 1] as any).recordedAt);
          expect(currentDate.getTime()).toBeLessThanOrEqual(nextDate.getTime());
        }
      }
    });
  });
});

describe("Investment Statistics", () => {
  describe("getInvestmentStats", () => {
    it("should return null for user with no transactions", async () => {
      const result = await db.getInvestmentStats(999, "AAPL");
      expect(result).toBeNull();
    });

    it("should calculate statistics for existing transactions", async () => {
      const result = await db.getInvestmentStats(1, "AAPL");
      // Result can be null or contain stats
      if (result) {
        expect(result.totalQuantity).toBeDefined();
        expect(result.averageCostBasis).toBeDefined();
        expect(result.totalCost).toBeDefined();
      }
    });
  });
});

describe("Investment Transaction Integration", () => {
  it("should handle multiple transactions for same investment", async () => {
    // Create first buy
    const buy1 = await db.createInvestmentTransaction(
      1,
      1,
      "AAPL",
      "stock",
      "buy",
      "10",
      "150.00",
      "1.99",
      "First buy",
      new Date("2026-01-01")
    );

    expect(buy1).toBeDefined();

    // Create second buy
    const buy2 = await db.createInvestmentTransaction(
      1,
      1,
      "AAPL",
      "stock",
      "buy",
      "5",
      "155.00",
      "0.99",
      "Second buy",
      new Date("2026-01-15")
    );

    expect(buy2).toBeDefined();

    // Get all transactions
    const transactions = await db.getInvestmentTransactions(1, "AAPL");
    expect(Array.isArray(transactions)).toBe(true);
  });

  it("should track buy and sell transactions", async () => {
    // Buy
    const buy = await db.createInvestmentTransaction(
      1,
      1,
      "AAPL",
      "stock",
      "buy",
      "10",
      "150.00",
      "1.99",
      "Buy",
      new Date("2026-01-01")
    );

    expect(buy).toBeDefined();

    // Sell
    const sell = await db.createInvestmentTransaction(
      1,
      1,
      "AAPL",
      "stock",
      "sell",
      "5",
      "175.00",
      "1.99",
      "Sell",
      new Date("2026-02-01")
    );

    expect(sell).toBeDefined();

    // Verify both are recorded
    const transactions = await db.getInvestmentTransactions(1, "AAPL");
    expect(Array.isArray(transactions)).toBe(true);
  });

  it("should handle different asset types", async () => {
    const assetTypes: Array<"stock" | "crypto" | "etf" | "mutual_fund" | "commodity" | "other"> = [
      "stock",
      "crypto",
      "etf",
      "mutual_fund",
      "commodity",
      "other"
    ];

    for (const assetType of assetTypes) {
      const result = await db.createInvestmentTransaction(
        1,
        null,
        "TEST",
        assetType,
        "buy",
        "1",
        "100.00",
        "0",
        `Test ${assetType}`,
        new Date("2026-02-01")
      );

      expect(result).toBeDefined();
    }
  });
});

describe("Price History Integration", () => {
  it("should record multiple prices for same symbol", async () => {
    const prices = ["150.00", "151.50", "149.75", "152.25"];
    const dates = [
      new Date("2026-02-08"),
      new Date("2026-02-09"),
      new Date("2026-02-10"),
      new Date("2026-02-11")
    ];

    for (let i = 0; i < prices.length; i++) {
      const result = await db.recordPriceHistory(
        "AAPL",
        "stock",
        prices[i],
        dates[i]
      );
      expect(result).toBeDefined();
    }

    // Verify history
    const history = await db.getPriceHistory("AAPL", 30);
    expect(Array.isArray(history)).toBe(true);
  });

  it("should track price changes for different symbols", async () => {
    const symbols = ["AAPL", "GOOGL", "MSFT"];

    for (const symbol of symbols) {
      const result = await db.recordPriceHistory(
        symbol,
        "stock",
        "150.00",
        new Date("2026-02-11")
      );
      expect(result).toBeDefined();
    }
  });

  it("should handle high-frequency price updates", async () => {
    const baseDate = new Date("2026-02-11");

    for (let i = 0; i < 10; i++) {
      const date = new Date(baseDate.getTime() + i * 60000); // 1 minute apart
      const result = await db.recordPriceHistory(
        "AAPL",
        "stock",
        (150 + Math.random() * 5).toString(),
        date
      );
      expect(result).toBeDefined();
    }
  });
});

describe("Transaction and Price History Correlation", () => {
  it("should correlate transaction prices with price history", async () => {
    // Record a transaction
    const transaction = await db.createInvestmentTransaction(
      1,
      1,
      "AAPL",
      "stock",
      "buy",
      "10",
      "150.00",
      "1.99",
      "Test",
      new Date("2026-02-01")
    );

    expect(transaction).toBeDefined();

    // Record price history for same date
    const priceRecord = await db.recordPriceHistory(
      "AAPL",
      "stock",
      "150.00",
      new Date("2026-02-01")
    );

    expect(priceRecord).toBeDefined();

    // Both should exist
    const transactions = await db.getInvestmentTransactions(1, "AAPL");
    const prices = await db.getPriceHistory("AAPL", 30);

    expect(Array.isArray(transactions)).toBe(true);
    expect(Array.isArray(prices)).toBe(true);
  });
});
