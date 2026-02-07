import { invokeLLM } from "./_core/llm";
import * as db from "./db";

/**
 * Generate personalized financial advice based on user's transaction history and portfolio
 */
export async function generateFinancialAdvice(userId: number): Promise<string> {
  try {
    // Fetch user's financial data
    const [transactions, investments, budgets, savingsGoals] = await Promise.all([
      db.getTransactions(userId),
      db.getInvestments(userId),
      db.getBudgets(userId),
      db.getSavingsGoals(userId)
    ]);

    // Calculate statistics
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const portfolioValue = investments.reduce((sum, inv) => {
      return sum + (parseFloat(inv.quantity) * parseFloat(inv.currentPrice));
    }, 0);

    const portfolioCost = investments.reduce((sum, inv) => {
      return sum + (parseFloat(inv.quantity) * parseFloat(inv.purchasePrice));
    }, 0);

    const portfolioGainLoss = portfolioValue - portfolioCost;

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    for (const transaction of transactions.filter(t => t.type === 'expense')) {
      const categoryName = `Category ${transaction.categoryId}`;
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + parseFloat(transaction.amount);
    }

    // Create prompt for LLM
    const prompt = `You are a professional financial advisor. Based on the following user financial data, provide personalized financial advice and recommendations.

User Financial Summary:
- Total Monthly Income: $${totalIncome.toFixed(2)}
- Total Monthly Expenses: $${totalExpenses.toFixed(2)}
- Monthly Savings: $${(totalIncome - totalExpenses).toFixed(2)}
- Investment Portfolio Value: $${portfolioValue.toFixed(2)}
- Portfolio Cost Basis: $${portfolioCost.toFixed(2)}
- Portfolio Gain/Loss: $${portfolioGainLoss.toFixed(2)} (${((portfolioGainLoss / portfolioCost) * 100).toFixed(2)}%)
- Number of Investments: ${investments.length}
- Active Budgets: ${budgets.filter(b => b.isActive).length}
- Savings Goals: ${savingsGoals.length}

Expense Breakdown:
${Object.entries(expensesByCategory).map(([cat, amount]) => `- ${cat}: $${amount.toFixed(2)}`).join('\n')}

Investment Breakdown:
${investments.map(inv => `- ${inv.symbol} (${inv.assetType}): ${inv.quantity} units @ $${inv.currentPrice} = $${(parseFloat(inv.quantity) * parseFloat(inv.currentPrice)).toFixed(2)}`).join('\n')}

Please provide:
1. An assessment of their current financial health
2. Key spending patterns and recommendations
3. Portfolio diversification suggestions
4. Specific actionable steps to improve their financial situation
5. Risk assessment based on their portfolio

Keep the advice concise, practical, and personalized to their situation.`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an expert financial advisor providing personalized financial guidance based on user data."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const adviceContent = response.choices[0]?.message?.content;
    const advice = typeof adviceContent === 'string' ? adviceContent : "Unable to generate advice at this time.";

    // Store the insight in database
    await db.createFinancialInsight(
      userId,
      "investment_recommendation",
      advice,
      {
        portfolioValue,
        portfolioGainLoss,
        totalIncome,
        totalExpenses,
        generatedAt: new Date().toISOString()
      }
    );

    return advice;
  } catch (error) {
    console.error("Error generating financial advice:", error);
    throw new Error("Failed to generate financial advice");
  }
}

/**
 * Analyze spending patterns and provide insights
 */
export async function analyzeSpendingPatterns(userId: number): Promise<string> {
  try {
    const transactions = await db.getTransactions(userId);

    if (transactions.length === 0) {
      return "No transaction data available for analysis. Start logging transactions to get spending insights.";
    }

    // Analyze patterns
    const expensesByCategory: Record<string, { count: number; total: number }> = {};
    const dailySpending: Record<string, number> = {};

    for (const transaction of transactions.filter(t => t.type === 'expense')) {
      const categoryId = transaction.categoryId.toString();
      const date = new Date(transaction.transactionDate).toLocaleDateString();

      expensesByCategory[categoryId] = {
        count: (expensesByCategory[categoryId]?.count || 0) + 1,
        total: (expensesByCategory[categoryId]?.total || 0) + parseFloat(transaction.amount)
      };

      dailySpending[date] = (dailySpending[date] || 0) + parseFloat(transaction.amount);
    }

    const avgDailySpend = Object.values(dailySpending).reduce((a, b) => a + b, 0) / Object.keys(dailySpending).length;
    const maxDailySpend = Math.max(...Object.values(dailySpending));
    const minDailySpend = Math.min(...Object.values(dailySpending));

    const prompt = `Analyze the following spending patterns and provide insights:

Spending Statistics:
- Average Daily Spending: $${avgDailySpend.toFixed(2)}
- Maximum Daily Spending: $${maxDailySpend.toFixed(2)}
- Minimum Daily Spending: $${minDailySpend.toFixed(2)}
- Total Transactions: ${transactions.filter(t => t.type === 'expense').length}

Spending by Category:
${Object.entries(expensesByCategory).map(([cat, data]) => `- Category ${cat}: ${data.count} transactions, Total: $${data.total.toFixed(2)}`).join('\n')}

Please provide:
1. Key spending patterns identified
2. Areas of concern or high spending
3. Opportunities to reduce expenses
4. Recommendations for better spending habits`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a financial analyst specializing in spending pattern analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const analysisContent = response.choices[0]?.message?.content;
    const analysis = typeof analysisContent === 'string' ? analysisContent : "Unable to analyze spending patterns.";

    // Store the insight
    await db.createFinancialInsight(
      userId,
      "spending_pattern",
      analysis,
      {
        avgDailySpend,
        maxDailySpend,
        minDailySpend,
        totalTransactions: transactions.length
      }
    );

    return analysis;
  } catch (error) {
    console.error("Error analyzing spending patterns:", error);
    throw new Error("Failed to analyze spending patterns");
  }
}

/**
 * Generate investment recommendations based on portfolio and goals
 */
export async function generateInvestmentRecommendations(userId: number): Promise<string> {
  try {
    const [investments, savingsGoals, transactions] = await Promise.all([
      db.getInvestments(userId),
      db.getSavingsGoals(userId),
      db.getTransactions(userId)
    ]);

    const portfolioValue = investments.reduce((sum, inv) => {
      return sum + (parseFloat(inv.quantity) * parseFloat(inv.currentPrice));
    }, 0);

    const assetAllocation = investments.reduce((acc, inv) => {
      const value = parseFloat(inv.quantity) * parseFloat(inv.currentPrice);
      acc[inv.assetType] = (acc[inv.assetType] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    const monthlyIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const prompt = `Based on the following investment profile, provide personalized investment recommendations:

Current Portfolio:
- Total Value: $${portfolioValue.toFixed(2)}
- Number of Assets: ${investments.length}

Asset Allocation:
${Object.entries(assetAllocation).map(([type, value]) => `- ${type}: $${value.toFixed(2)} (${((value / portfolioValue) * 100).toFixed(1)}%)`).join('\n')}

Monthly Income: $${monthlyIncome.toFixed(2)}

Savings Goals:
${savingsGoals.map(goal => `- ${goal.name}: $${goal.targetAmount} (${goal.status})`).join('\n')}

Please provide:
1. Assessment of current asset allocation
2. Recommendations for rebalancing
3. Suggested investment strategy based on goals
4. Risk management suggestions
5. Specific assets or sectors to consider`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an investment advisor providing personalized investment recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const recommendationsContent = response.choices[0]?.message?.content;
    const recommendations = typeof recommendationsContent === 'string' ? recommendationsContent : "Unable to generate recommendations.";

    // Store the insight
    await db.createFinancialInsight(
      userId,
      "investment_recommendation",
      recommendations,
      {
        portfolioValue,
        assetAllocation,
        numberOfAssets: investments.length
      }
    );

    return recommendations;
  } catch (error) {
    console.error("Error generating investment recommendations:", error);
    throw new Error("Failed to generate investment recommendations");
  }
}

/**
 * Generate budget analysis and recommendations
 */
export async function analyzeBudgetPerformance(userId: number): Promise<string> {
  try {
    const budgets = await db.getBudgets(userId);

    if (budgets.length === 0) {
      return "No budgets set up yet. Create budgets to get performance analysis.";
    }

    const budgetAnalysis = budgets.map(budget => {
      const percentage = (parseFloat(budget.spent) / parseFloat(budget.limitAmount)) * 100;
      const status = percentage > 100 ? 'over' : percentage > budget.alertThreshold ? 'warning' : 'on-track';
      return {
        name: budget.name,
        limit: parseFloat(budget.limitAmount),
        spent: parseFloat(budget.spent),
        percentage: percentage.toFixed(1),
        status,
        period: budget.period
      };
    });

    const overBudgetCount = budgetAnalysis.filter(b => b.status === 'over').length;
    const warningCount = budgetAnalysis.filter(b => b.status === 'warning').length;

    const prompt = `Analyze the following budget performance and provide recommendations:

Budget Performance:
${budgetAnalysis.map(b => `- ${b.name} (${b.period}): $${b.spent.toFixed(2)} of $${b.limit.toFixed(2)} (${b.percentage}%) - ${b.status}`).join('\n')}

Summary:
- Total Budgets: ${budgets.length}
- On Track: ${budgetAnalysis.filter(b => b.status === 'on-track').length}
- Warnings: ${warningCount}
- Over Budget: ${overBudgetCount}

Please provide:
1. Overall budget health assessment
2. Categories that need attention
3. Specific recommendations to stay within budget
4. Strategies to reduce overspending
5. Budget adjustments to consider`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a budget analyst providing actionable budget recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const analysisContent = response.choices[0]?.message?.content;
    const analysis = typeof analysisContent === 'string' ? analysisContent : "Unable to analyze budget performance.";

    // Store the insight
    await db.createFinancialInsight(
      userId,
      "budget_analysis",
      analysis,
      {
        totalBudgets: budgets.length,
        overBudgetCount,
        warningCount
      }
    );

    return analysis;
  } catch (error) {
    console.error("Error analyzing budget performance:", error);
    throw new Error("Failed to analyze budget performance");
  }
}
