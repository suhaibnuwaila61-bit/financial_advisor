import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  json,
  datetime
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories for organizing expenses and income
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["expense", "income"]).notNull(),
  color: varchar("color", { length: 7 }).default("#FF1493").notNull(), // Neon pink default
  icon: varchar("icon", { length: 50 }).default("tag").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Transactions for expense and income tracking
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["expense", "income"]).notNull(),
  description: text("description"),
  transactionDate: datetime("transactionDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Investment assets (stocks, crypto, etc.)
 */
export const investments = mysqlTable("investments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(), // e.g., AAPL, BTC, ETH
  assetType: mysqlEnum("assetType", ["stock", "crypto", "commodity", "etf", "mutual_fund", "other"]).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  purchasePrice: decimal("purchasePrice", { precision: 12, scale: 2 }).notNull(),
  currentPrice: decimal("currentPrice", { precision: 12, scale: 2 }).notNull(),
  purchaseDate: datetime("purchaseDate").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  notes: text("notes"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = typeof investments.$inferInsert;

/**
 * Savings goals with progress tracking
 */
export const savingsGoals = mysqlTable("savingsGoals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  targetAmount: decimal("targetAmount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("currentAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  deadline: datetime("deadline"),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = typeof savingsGoals.$inferInsert;

/**
 * Budget limits by category and time period
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId"),
  name: varchar("name", { length: 255 }).notNull(),
  limitAmount: decimal("limitAmount", { precision: 12, scale: 2 }).notNull(),
  period: mysqlEnum("period", ["daily", "weekly", "monthly", "yearly"]).default("monthly").notNull(),
  spent: decimal("spent", { precision: 12, scale: 2 }).default("0").notNull(),
  startDate: datetime("startDate").notNull(),
  endDate: datetime("endDate"),
  alertThreshold: int("alertThreshold").default(80).notNull(), // Alert at 80% by default
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Notifications for budget alerts, goal achievements, portfolio changes
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["budget_alert", "goal_achieved", "portfolio_change", "market_alert", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: int("relatedId"), // ID of related budget, goal, or investment
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Market data cache for stocks and crypto
 */
export const marketData = mysqlTable("marketData", {
  id: int("id").autoincrement().primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(),
  assetType: mysqlEnum("assetType", ["stock", "crypto"]).notNull(),
  currentPrice: decimal("currentPrice", { precision: 12, scale: 2 }).notNull(),
  priceChange: decimal("priceChange", { precision: 10, scale: 2 }),
  priceChangePercent: decimal("priceChangePercent", { precision: 8, scale: 4 }),
  marketCap: decimal("marketCap", { precision: 18, scale: 0 }),
  volume: decimal("volume", { precision: 18, scale: 0 }),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = typeof marketData.$inferInsert;

/**
 * Financial insights and recommendations cache
 */
export const financialInsights = mysqlTable("financialInsights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  insightType: mysqlEnum("insightType", ["spending_pattern", "investment_recommendation", "savings_tip", "budget_analysis"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"), // Store additional data like category breakdowns, trends, etc.
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinancialInsight = typeof financialInsights.$inferSelect;
export type InsertFinancialInsight = typeof financialInsights.$inferInsert;

export const lendings = mysqlTable("lendings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["lent", "borrowed"]).notNull(),
  personName: varchar("personName", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "partial", "repaid"]).default("pending").notNull(),
  amountRepaid: decimal("amountRepaid", { precision: 12, scale: 2 }).default("0").notNull(),
  dueDate: datetime("dueDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lending = typeof lendings.$inferSelect;
export type InsertLending = typeof lendings.$inferInsert;

/**
 * Investment transactions (buy/sell records)
 */
export const investmentTransactions = mysqlTable("investment_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  investmentId: int("investmentId"),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  assetType: mysqlEnum("assetType", ["stock", "crypto", "commodity", "etf", "mutual_fund", "other"]).notNull(),
  transactionType: mysqlEnum("transactionType", ["buy", "sell"]).notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 8 }).notNull(),
  pricePerUnit: decimal("pricePerUnit", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("totalAmount", { precision: 18, scale: 2 }).notNull(),
  fees: decimal("fees", { precision: 12, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  transactionDate: datetime("transactionDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvestmentTransaction = typeof investmentTransactions.$inferSelect;
export type InsertInvestmentTransaction = typeof investmentTransactions.$inferInsert;

/**
 * Investment price history for tracking price changes
 */
export const investmentPriceHistory = mysqlTable("investment_price_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  recordedAt: datetime("recordedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvestmentPriceHistory = typeof investmentPriceHistory.$inferSelect;
export type InsertInvestmentPriceHistory = typeof investmentPriceHistory.$inferInsert;


/**
 * Investment dividends and income tracking
 */
export const investmentDividends = mysqlTable("investment_dividends", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  dividendAmount: decimal("dividendAmount", { precision: 12, scale: 2 }).notNull(),
  dividendDate: datetime("dividendDate").notNull(),
  dividendYield: decimal("dividendYield", { precision: 8, scale: 4 }), // Percentage
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvestmentDividend = typeof investmentDividends.$inferSelect;
export type InsertInvestmentDividend = typeof investmentDividends.$inferInsert;
