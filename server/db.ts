import { eq, and, gte, lte, sum, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  categories,
  transactions,
  investments,
  savingsGoals,
  budgets,
  notifications,
  marketData,
  financialInsights
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Category helpers
export async function initializeDefaultCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const defaultCategories: Array<{ name: string; type: "income" | "expense" }> = [
    { name: "Salary", type: "income" },
    { name: "Bonus", type: "income" },
    { name: "Investment Income", type: "income" },
    { name: "Food & Dining", type: "expense" },
    { name: "Transportation", type: "expense" },
    { name: "Utilities", type: "expense" },
    { name: "Entertainment", type: "expense" },
    { name: "Shopping", type: "expense" },
    { name: "Healthcare", type: "expense" },
    { name: "Savings", type: "expense" },
    { name: "Investment", type: "expense" },
    { name: "Other", type: "expense" }
  ];
  
  const result = [];
  for (const cat of defaultCategories) {
    try {
      const res = await db.insert(categories).values({
        userId,
        name: cat.name,
        type: cat.type,
        color: "#FF1493",
        icon: "tag"
      });
      if (res) result.push(res);
    } catch (e) {
      // Ignore duplicate errors
    }
  }
  
  return result;
}

export async function getCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const userCategories = await db.select().from(categories).where(eq(categories.userId, userId));
  
  // If no categories exist, initialize defaults
  if (userCategories.length === 0) {
    await initializeDefaultCategories(userId);
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }
  
  return userCategories;
}

export async function createCategory(userId: number, name: string, type: "expense" | "income", color?: string, icon?: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(categories).values({
    userId,
    name,
    type,
    color: color || "#FF1493",
    icon: icon || "tag"
  });
  
  return result;
}

// Transaction helpers
export async function getTransactions(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(transactions.userId, userId)];
  if (startDate) conditions.push(gte(transactions.transactionDate, startDate));
  if (endDate) conditions.push(lte(transactions.transactionDate, endDate));
  
  return await db.select().from(transactions)
    .where(and(...conditions))
    .orderBy(desc(transactions.transactionDate));
}

export async function createTransaction(userId: number, categoryId: number, amount: string, type: "expense" | "income", description?: string, transactionDate?: Date) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.insert(transactions).values({
    userId,
    categoryId,
    amount,
    type,
    description,
    transactionDate: transactionDate || new Date()
  });
}

export async function deleteTransaction(userId: number, transactionId: number) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.delete(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));
}

export async function getTotalExpenses(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return "0";
  
  const conditions = [
    eq(transactions.userId, userId),
    eq(transactions.type, "expense")
  ];
  if (startDate) conditions.push(gte(transactions.transactionDate, startDate));
  if (endDate) conditions.push(lte(transactions.transactionDate, endDate));
  
  const result = await db.select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(and(...conditions));
  
  return result[0]?.total || "0";
}

export async function getTotalIncome(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return "0";
  
  const conditions = [
    eq(transactions.userId, userId),
    eq(transactions.type, "income")
  ];
  if (startDate) conditions.push(gte(transactions.transactionDate, startDate));
  if (endDate) conditions.push(lte(transactions.transactionDate, endDate));
  
  const result = await db.select({ total: sum(transactions.amount) })
    .from(transactions)
    .where(and(...conditions));
  
  return result[0]?.total || "0";
}

// Investment helpers
export async function getInvestments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(investments).where(eq(investments.userId, userId));
}

export async function createInvestment(userId: number, symbol: string, assetType: string, quantity: string, purchasePrice: string, currentPrice: string, name: string, purchaseDate?: Date, notes?: string) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.insert(investments).values({
    userId,
    symbol,
    assetType: assetType as any,
    quantity,
    purchasePrice,
    currentPrice,
    name,
    purchaseDate: purchaseDate || new Date(),
    notes
  });
}

export async function updateInvestmentPrice(investmentId: number, currentPrice: string) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.update(investments)
    .set({ currentPrice })
    .where(eq(investments.id, investmentId));
}

export async function deleteInvestment(userId: number, investmentId: number) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.delete(investments)
    .where(and(eq(investments.id, investmentId), eq(investments.userId, userId)));
}

// Savings goals helpers
export async function getSavingsGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId));
}

export async function createSavingsGoal(userId: number, name: string, targetAmount: string, deadline?: Date, category?: string, description?: string, currentAmount?: string) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.insert(savingsGoals).values({
    userId,
    name,
    targetAmount,
    currentAmount: currentAmount || "0",
    deadline,
    category,
    description
  });
}

export async function updateSavingsGoalAmount(goalId: number, currentAmount: string) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.update(savingsGoals)
    .set({ currentAmount })
    .where(eq(savingsGoals.id, goalId));
}

export async function deleteSavingsGoal(userId: number, goalId: number) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.delete(savingsGoals)
    .where(and(eq(savingsGoals.id, goalId), eq(savingsGoals.userId, userId)));
}

// Budget helpers
export async function getBudgets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(budgets).where(eq(budgets.userId, userId));
}

export async function createBudget(userId: number, name: string, limitAmount: string, period: "daily" | "weekly" | "monthly" | "yearly", categoryId?: number, startDate?: Date, alertThreshold?: number) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.insert(budgets).values({
    userId,
    name,
    limitAmount,
    period,
    categoryId,
    startDate: startDate || new Date(),
    alertThreshold: alertThreshold || 80
  });
}

export async function updateBudgetSpent(budgetId: number, spent: string) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.update(budgets)
    .set({ spent })
    .where(eq(budgets.id, budgetId));
}

// Notification helpers
export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function createNotification(userId: number, type: "budget_alert" | "goal_achieved" | "portfolio_change" | "market_alert" | "system", title: string, message: string, relatedId?: number) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.insert(notifications).values({
    userId,
    type,
    title,
    message,
    relatedId
  });
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}

// Market data helpers
export async function getMarketData(symbol: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(marketData).where(eq(marketData.symbol, symbol)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertMarketData(symbol: string, assetType: "stock" | "crypto", currentPrice: string, priceChange?: string, priceChangePercent?: string, marketCap?: string, volume?: string) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await getMarketData(symbol);
  
  if (existing) {
    return await db.update(marketData)
      .set({ currentPrice, priceChange, priceChangePercent, marketCap, volume })
      .where(eq(marketData.symbol, symbol));
  } else {
    return await db.insert(marketData).values({
      symbol,
      assetType,
      currentPrice,
      priceChange,
      priceChangePercent,
      marketCap,
      volume
    });
  }
}

// Financial insights helpers
export async function getFinancialInsights(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(financialInsights)
    .where(eq(financialInsights.userId, userId))
    .orderBy(desc(financialInsights.generatedAt));
}

export async function createFinancialInsight(userId: number, insightType: "spending_pattern" | "investment_recommendation" | "savings_tip" | "budget_analysis", content: string, metadata?: any) {
  const db = await getDb();
  if (!db) return null;
  
  return await db.insert(financialInsights).values({
    userId,
    insightType,
    content,
    metadata
  });
}
