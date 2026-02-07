import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { advisorRouter } from "./advisor-router";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard & Overview
  dashboard: router({
    getOverview: protectedProcedure.query(async ({ ctx }) => {
      const userId = ctx.user.id;
      
      // Get current month dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const [expenses, income, investments, savingsGoals] = await Promise.all([
        db.getTotalExpenses(userId, startOfMonth, endOfMonth),
        db.getTotalIncome(userId, startOfMonth, endOfMonth),
        db.getInvestments(userId),
        db.getSavingsGoals(userId)
      ]);
      
      // Calculate portfolio value
      let portfolioValue = "0";
      if (investments.length > 0) {
        portfolioValue = investments.reduce((sum, inv) => {
          const value = parseFloat(inv.quantity) * parseFloat(inv.currentPrice);
          return sum + value;
        }, 0).toString();
      }
      
      // Calculate total savings
      let totalSavings = "0";
      if (savingsGoals.length > 0) {
        totalSavings = savingsGoals.reduce((sum, goal) => {
          return sum + parseFloat(goal.currentAmount);
        }, 0).toString();
      }
      
      return {
        totalExpenses: expenses,
        totalIncome: income,
        portfolioValue,
        totalSavings,
        investmentCount: investments.length,
        goalsCount: savingsGoals.length
      };
    }),
  }),

  // Categories
  categories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCategories(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(["expense", "income"]),
        color: z.string().optional(),
        icon: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createCategory(ctx.user.id, input.name, input.type, input.color, input.icon);
      }),
  }),

  // Transactions
  transactions: router({
    list: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional()
      }))
      .query(async ({ ctx, input }) => {
        return await db.getTransactions(ctx.user.id, input.startDate, input.endDate);
      }),
    
    create: protectedProcedure
      .input(z.object({
        categoryId: z.number(),
        amount: z.string(),
        type: z.enum(["expense", "income"]),
        description: z.string().optional(),
        transactionDate: z.date().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createTransaction(
          ctx.user.id,
          input.categoryId,
          input.amount,
          input.type,
          input.description,
          input.transactionDate
        );
      }),
    
    delete: protectedProcedure
      .input(z.object({
        id: z.number()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteTransaction(ctx.user.id, input.id);
      }),
  }),

  // Investments
  investments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getInvestments(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        symbol: z.string(),
        assetType: z.enum(["stock", "crypto", "commodity", "etf", "mutual_fund", "other"]),
        quantity: z.string(),
        purchasePrice: z.string(),
        currentPrice: z.string(),
        name: z.string(),
        purchaseDate: z.date().optional(),
        notes: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createInvestment(
          ctx.user.id,
          input.symbol,
          input.assetType,
          input.quantity,
          input.purchasePrice,
          input.currentPrice,
          input.name,
          input.purchaseDate,
          input.notes
        );
      }),
    
    updatePrice: protectedProcedure
      .input(z.object({
        investmentId: z.number(),
        currentPrice: z.string()
      }))
      .mutation(async ({ input }) => {
        return await db.updateInvestmentPrice(input.investmentId, input.currentPrice);
      }),
  }),

  // Savings Goals
  savingsGoals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getSavingsGoals(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        targetAmount: z.string(),
        currentAmount: z.string().optional(),
        deadline: z.date().optional(),
        category: z.string().optional(),
        description: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createSavingsGoal(
          ctx.user.id,
          input.name,
          input.targetAmount,
          input.deadline,
          input.category,
          input.description,
          input.currentAmount
        );
      }),
    
    updateAmount: protectedProcedure
      .input(z.object({
        goalId: z.number(),
        currentAmount: z.string()
      }))
      .mutation(async ({ input }) => {
        return await db.updateSavingsGoalAmount(input.goalId, input.currentAmount);
      }),
    
    delete: protectedProcedure
      .input(z.object({
        id: z.number()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteSavingsGoal(ctx.user.id, input.id);
      }),
  }),

  // Budgets
  budgets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getBudgets(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        limitAmount: z.string(),
        period: z.enum(["daily", "weekly", "monthly", "yearly"]),
        categoryId: z.number().optional(),
        startDate: z.date().optional(),
        alertThreshold: z.number().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createBudget(
          ctx.user.id,
          input.name,
          input.limitAmount,
          input.period,
          input.categoryId,
          input.startDate,
          input.alertThreshold
        );
      }),
    
    updateSpent: protectedProcedure
      .input(z.object({
        budgetId: z.number(),
        spent: z.string()
      }))
      .mutation(async ({ input }) => {
        return await db.updateBudgetSpent(input.budgetId, input.spent);
      }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotifications(ctx.user.id);
    }),
    
    markAsRead: protectedProcedure
      .input(z.object({
        notificationId: z.number()
      }))
      .mutation(async ({ input }) => {
        return await db.markNotificationAsRead(input.notificationId);
      }),
  }),

  // Market Data
  marketData: router({
    get: publicProcedure
      .input(z.object({
        symbol: z.string()
      }))
      .query(async ({ input }) => {
        return await db.getMarketData(input.symbol);
      }),
  }),

  // Financial Insights
  insights: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getFinancialInsights(ctx.user.id);
    }),
  }),

  // Financial Advisor
  advisor: advisorRouter,
});

export type AppRouter = typeof appRouter;
