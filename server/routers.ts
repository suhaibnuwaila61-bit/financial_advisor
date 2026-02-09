import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "../shared/const";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { advisorRouter } from "./advisor-router";
import * as chat from "./chat";

export const appRouter = router({
  systemCore: systemRouter,
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
        date: z.date().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createTransaction(ctx.user.id, input.categoryId, input.amount, input.type, input.description, input.date);
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
        name: z.string(),
        assetType: z.enum(["stock", "crypto", "etf", "mutual_fund", "commodity", "other"]),
        quantity: z.string(),
        purchasePrice: z.string(),
        currentPrice: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createInvestment(
          ctx.user.id,
          input.symbol,
          input.name,
          input.assetType,
          input.quantity,
          input.purchasePrice,
          input.currentPrice
        );
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteInvestment(ctx.user.id, input.id);
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
        deadline: z.date()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createSavingsGoal(
          ctx.user.id,
          input.name,
          input.targetAmount,
          input.deadline,
          undefined,
          undefined,
          input.currentAmount || "0"
        );
      }),

    updateAmount: protectedProcedure
      .input(z.object({
        goalId: z.number(),
        currentAmount: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
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
        alertThreshold: z.number().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createBudget(
          ctx.user.id,
          input.name,
          input.limitAmount,
          input.period,
          input.categoryId,
          undefined,
          input.alertThreshold || 80
        );
      }),

    delete: protectedProcedure
      .input(z.object({
        id: z.number()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteBudget(ctx.user.id, input.id);
      }),
  }),

  // Advisor
  advisor: advisorRouter,

  // Lendings
  lendings: router({
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["lent", "borrowed"]),
        personName: z.string(),
        amount: z.string(),
        description: z.string().optional(),
        dueDate: z.date().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createLending(ctx.user.id, input.type, input.personName, input.amount, input.description, input.dueDate);
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getLendings(ctx.user.id);
    }),
    
    updateRepayment: protectedProcedure
      .input(z.object({
        lendingId: z.number(),
        amountRepaid: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.updateLendingRepayment(ctx.user.id, input.lendingId, input.amountRepaid);
      }),
    
    delete: protectedProcedure
      .input(z.object({
        id: z.number()
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.deleteLending(ctx.user.id, input.id);
      }),
  }),

  // AI Chat
  chat: router({
    processTransaction: protectedProcedure
      .input(z.object({
        description: z.string(),
        imageBase64: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Parse transaction from description and image
          const parseResult = await chat.parseTransactionFromDescription(input.description, input.imageBase64);
          
          if (!parseResult.transactionData) {
            return {
              message: parseResult.message,
              transactionCreated: false
            };
          }
          
          // Create the transaction
          const createResult = await chat.createTransactionFromParsedData(ctx.user.id, parseResult.transactionData);
          
          return {
            message: createResult.message,
            transactionCreated: createResult.success
          };
        } catch (error) {
          console.error("Error processing transaction:", error);
          return {
            message: "Sorry, I encountered an error processing your request. Please try again.",
            transactionCreated: false
          };
        }
      }),
  }),
  
  // System & Reset
  system: router({
    resetAllData: protectedProcedure
      .mutation(async ({ ctx }) => {
        const userId = ctx.user.id;
        try {
          // Delete all user data
          await Promise.all([
            db.deleteAllTransactions(userId),
            db.deleteAllInvestments(userId),
            db.deleteAllSavingsGoals(userId),
            db.deleteAllBudgets(userId),
            db.deleteAllNotifications(userId)
          ]);
          return { success: true, message: "All data has been reset" };
        } catch (error) {
          console.error("Reset failed:", error);
          throw error;
        }
      }),
  }),
});
export type AppRouter = typeof appRouter;
