import { protectedProcedure, router } from "./_core/trpc";
import * as advisor from "./advisor";

export const advisorRouter = router({
  getAdvice: protectedProcedure.query(async ({ ctx }) => {
    try {
      const advice = await advisor.generateFinancialAdvice(ctx.user.id);
      return { success: true, advice };
    } catch (error) {
      console.error("Error getting financial advice:", error);
      return { success: false, advice: "Unable to generate financial advice at this time." };
    }
  }),

  analyzeSpending: protectedProcedure.query(async ({ ctx }) => {
    try {
      const analysis = await advisor.analyzeSpendingPatterns(ctx.user.id);
      return { success: true, analysis };
    } catch (error) {
      console.error("Error analyzing spending:", error);
      return { success: false, analysis: "Unable to analyze spending patterns at this time." };
    }
  }),

  getInvestmentRecommendations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const recommendations = await advisor.generateInvestmentRecommendations(ctx.user.id);
      return { success: true, recommendations };
    } catch (error) {
      console.error("Error getting investment recommendations:", error);
      return { success: false, recommendations: "Unable to generate investment recommendations at this time." };
    }
  }),

  analyzeBudget: protectedProcedure.query(async ({ ctx }) => {
    try {
      const analysis = await advisor.analyzeBudgetPerformance(ctx.user.id);
      return { success: true, analysis };
    } catch (error) {
      console.error("Error analyzing budget:", error);
      return { success: false, analysis: "Unable to analyze budget performance at this time." };
    }
  }),
});
