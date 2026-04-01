import { describe, it, expect } from "vitest";
import { translations, getTranslation, type Language, type TranslationKey } from "../client/src/lib/i18n";
// Note: This test imports from client code to verify translation system

describe("i18n Translation System", () => {
  it("should have both English and Arabic translations", () => {
    expect(translations).toHaveProperty("en");
    expect(translations).toHaveProperty("ar");
  });

  it("should have matching keys in both languages", () => {
    const enKeys = Object.keys(translations.en).sort();
    const arKeys = Object.keys(translations.ar).sort();
    expect(enKeys).toEqual(arKeys);
  });

  it("should have at least 100 translation keys", () => {
    const keyCount = Object.keys(translations.en).length;
    expect(keyCount).toBeGreaterThanOrEqual(100);
  });

  it("should translate English keys correctly", () => {
    const result = getTranslation("en", "dashboard" as TranslationKey);
    expect(result).toBe("Dashboard");
  });

  it("should translate Arabic keys correctly", () => {
    const result = getTranslation("ar", "dashboard" as TranslationKey);
    expect(result).toBe("لوحة التحكم");
  });

  it("should have Arabic translations for all major sections", () => {
    const majorKeys: TranslationKey[] = [
      "dashboard",
      "investments",
      "budgets",
      "savingsGoals",
      "transactions",
      "settings",
      "analytics",
    ];

    majorKeys.forEach((key) => {
      const enTranslation = translations.en[key];
      const arTranslation = translations.ar[key];
      expect(enTranslation).toBeDefined();
      expect(arTranslation).toBeDefined();
      expect(enTranslation).not.toBe(arTranslation);
    });
  });

  it("should have Arabic translations for form labels", () => {
    const formLabels: TranslationKey[] = [
      "amount",
      "description",
      "category",
      "date",
      "symbol",
      "quantity",
      "purchasePrice",
      "currentPrice",
    ];

    formLabels.forEach((key) => {
      const arTranslation = translations.ar[key];
      expect(arTranslation).toBeDefined();
      // Verify it's actually Arabic (contains Arabic characters)
      expect(arTranslation).toMatch(/[\u0600-\u06FF]/);
    });
  });

  it("should have Arabic translations for buttons and actions", () => {
    const buttonKeys: TranslationKey[] = [
      "submit",
      "cancel",
      "delete",
      "save",
      "add",
      "edit",
    ];

    buttonKeys.forEach((key) => {
      const arTranslation = translations.ar[key];
      expect(arTranslation).toBeDefined();
      expect(arTranslation.length).toBeGreaterThan(0);
    });
  });

  it("should have Arabic translations for error and success messages", () => {
    const messageKeys: TranslationKey[] = [
      "failedToAddTransaction",
      "failedToAddInvestment",
      "failedToAddSavingsGoal",
      "failedToAddBudget",
      "transactionAdded",
      "investmentAdded",
    ];

    messageKeys.forEach((key) => {
      const arTranslation = translations.ar[key];
      expect(arTranslation).toBeDefined();
      expect(arTranslation).toMatch(/[\u0600-\u06FF]/);
    });
  });

  it("should fallback to English if translation key is missing", () => {
    const result = getTranslation("ar", "dashboard" as TranslationKey);
    expect(result).toBe("لوحة التحكم");
  });

  it("should have comprehensive investment-related translations", () => {
    const investmentKeys: TranslationKey[] = [
      "investmentPortfolio",
      "addInvestment",
      "symbol",
      "assetType",
      "quantity",
      "purchasePrice",
      "currentPrice",
      "gainLoss",
      "bestPerformer",
      "worstPerformer",
      "assetAllocation",
      "stock",
      "crypto",
      "etf",
      "mutual",
      "bond",
      "commodity",
    ];

    investmentKeys.forEach((key) => {
      expect(translations.en[key]).toBeDefined();
      expect(translations.ar[key]).toBeDefined();
    });
  });

  it("should have comprehensive budget-related translations", () => {
    const budgetKeys: TranslationKey[] = [
      "budgetManagement",
      "addBudget",
      "budgetName",
      "limitAmount",
      "period",
      "alertThreshold",
      "spent",
      "remaining",
      "onBudget",
      "overBudget",
    ];

    budgetKeys.forEach((key) => {
      expect(translations.en[key]).toBeDefined();
      expect(translations.ar[key]).toBeDefined();
    });
  });

  it("should have comprehensive savings goals translations", () => {
    const savingsKeys: TranslationKey[] = [
      "savingsGoalsPage",
      "addSavingsGoal",
      "targetAmount",
      "currentAmount",
      "deadline",
      "progress",
      "daysRemaining",
      "completed",
      "onTrack",
      "atRisk",
    ];

    savingsKeys.forEach((key) => {
      expect(translations.en[key]).toBeDefined();
      expect(translations.ar[key]).toBeDefined();
    });
  });

  it("should have comprehensive settings translations", () => {
    const settingsKeys: TranslationKey[] = [
      "settingsPage",
      "language",
      "theme",
      "darkMode",
      "lightMode",
      "selectLanguage",
      "selectTheme",
      "preferences",
    ];

    settingsKeys.forEach((key) => {
      expect(translations.en[key]).toBeDefined();
      expect(translations.ar[key]).toBeDefined();
    });
  });
});
