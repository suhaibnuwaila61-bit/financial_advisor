import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Target, Wallet, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: overview, isLoading } = trpc.dashboard.getOverview.useQuery();
  const [showUnifiedForm, setShowUnifiedForm] = useState(false);
  const [stats, setStats] = useState({
    totalExpenses: "0",
    totalIncome: "0",
    portfolioValue: "0",
    totalSavings: "0"
  });

  const [unifiedForm, setUnifiedForm] = useState({
    type: "expense", // expense, income, investment, savings, budget
    amount: "",
    description: "",
    category: "",
    assetType: "",
    goalName: "",
    budgetName: "",
    period: "monthly"
  });

  const createTransaction = trpc.transactions.create.useMutation();
  const createInvestment = trpc.investments.create.useMutation();
  const createSavingsGoal = trpc.savingsGoals.create.useMutation();
  const createBudget = trpc.budgets.create.useMutation();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  useEffect(() => {
    if (overview) {
      setStats({
        totalExpenses: overview.totalExpenses,
        totalIncome: overview.totalIncome,
        portfolioValue: overview.portfolioValue,
        totalSavings: overview.totalSavings
      });
    }
  }, [overview]);

  const handleUnifiedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unifiedForm.amount) {
      toast.error("Please enter an amount");
      return;
    }

    try {
      if (unifiedForm.type === "expense" || unifiedForm.type === "income") {
        const categoryId = categories.find(c => c.name === unifiedForm.category)?.id;
        await createTransaction.mutateAsync({
          amount: unifiedForm.amount,
          description: unifiedForm.description,
          categoryId: categoryId || 1,
          type: unifiedForm.type === "income" ? "income" : "expense"
        });
        toast.success(`${unifiedForm.type === "income" ? "Income" : "Expense"} added!`);
      } else if (unifiedForm.type === "investment") {
        const assetType = (unifiedForm.assetType || "stock") as "stock" | "crypto" | "commodity" | "etf" | "mutual_fund" | "other";
        await createInvestment.mutateAsync({
          symbol: unifiedForm.description || "INV",
          name: unifiedForm.description || "Investment",
          assetType: assetType,
          quantity: "1",
          purchasePrice: unifiedForm.amount,
          currentPrice: unifiedForm.amount
        });
        toast.success("Investment added!");
      } else if (unifiedForm.type === "savings") {
        await createSavingsGoal.mutateAsync({
          name: unifiedForm.goalName || "Savings Goal",
          targetAmount: unifiedForm.amount,
          currentAmount: unifiedForm.amount,
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        });
        toast.success("Savings goal created!");
      } else if (unifiedForm.type === "budget") {
        await createBudget.mutateAsync({
          name: unifiedForm.budgetName || "Budget",
          limitAmount: unifiedForm.amount,
          period: unifiedForm.period as any,
          categoryId: unifiedForm.category ? parseInt(unifiedForm.category) : undefined,
          alertThreshold: 80
        });
        toast.success("Budget created!");
      }

      setUnifiedForm({
        type: "expense",
        amount: "",
        description: "",
        category: "",
        assetType: "",
        goalName: "",
        budgetName: "",
        period: "monthly"
      });
      setShowUnifiedForm(false);
    } catch (error) {
      toast.error("Failed to add entry");
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-wide">
            Welcome back, {user?.name || "User"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-label">Monthly Income</div>
                <div className="stat-value text-green-600 dark:text-green-400">
                  {formatCurrency(stats.totalIncome)}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 opacity-20" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-label">Monthly Expenses</div>
                <div className="stat-value text-red-600 dark:text-red-400">
                  {formatCurrency(stats.totalExpenses)}
                </div>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400 opacity-20" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-label">Portfolio Value</div>
                <div className="stat-value text-blue-600 dark:text-blue-400">
                  {formatCurrency(stats.portfolioValue)}
                </div>
              </div>
              <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400 opacity-20" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-label">Total Savings</div>
                <div className="stat-value text-purple-600 dark:text-purple-400">
                  {formatCurrency(stats.totalSavings)}
                </div>
              </div>
              <Target className="w-8 h-8 text-purple-600 dark:text-purple-400 opacity-20" />
            </div>
          </div>
        </div>

        {/* Unified Input Form */}
        {showUnifiedForm ? (
          <div className="bg-card text-card-foreground rounded-lg border-2 border-primary shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="section-heading">Add New Entry</h2>
              <button
                onClick={() => setShowUnifiedForm(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUnifiedSubmit} className="space-y-4">
              {/* Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Entry Type
                    </label>
                    <select
                      value={unifiedForm.type}
                      onChange={(e) => setUnifiedForm({ ...unifiedForm, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="investment">Investment</option>
                  <option value="savings">Savings Goal</option>
                  <option value="budget">Budget</option>
                </select>
              </div>

              {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={unifiedForm.amount}
                      onChange={(e) => setUnifiedForm({ ...unifiedForm, amount: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
              </div>

              {/* Conditional Fields */}
              {(unifiedForm.type === "expense" || unifiedForm.type === "income") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Category
                    </label>
                    <select
                      value={unifiedForm.category}
                      onChange={(e) => setUnifiedForm({ ...unifiedForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="What is this for?"
                      value={unifiedForm.description}
                      onChange={(e) => setUnifiedForm({ ...unifiedForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {unifiedForm.type === "investment" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Asset Type
                    </label>
                    <select
                      value={unifiedForm.assetType}
                      onChange={(e) => setUnifiedForm({ ...unifiedForm, assetType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    >
                      <option value="stock">Stock</option>
                      <option value="crypto">Crypto</option>
                      <option value="etf">ETF</option>
                      <option value="commodity">Commodity</option>
                      <option value="mutual_fund">Mutual Fund</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Investment Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Apple Stock, Bitcoin"
                      value={unifiedForm.description}
                      onChange={(e) => setUnifiedForm({ ...unifiedForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {unifiedForm.type === "savings" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Vacation Fund, Emergency Fund"
                    value={unifiedForm.goalName}
                    onChange={(e) => setUnifiedForm({ ...unifiedForm, goalName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                  />
                </div>
              )}

              {unifiedForm.type === "budget" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Budget Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Food Budget, Entertainment"
                      value={unifiedForm.budgetName}
                      onChange={(e) => setUnifiedForm({ ...unifiedForm, budgetName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Period
                    </label>
                    <select
                      value={unifiedForm.period}
                      onChange={(e) => setUnifiedForm({ ...unifiedForm, period: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createTransaction.isPending || createInvestment.isPending}
                className="w-full px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
              >
                {createTransaction.isPending ? "Adding..." : "Add Entry"}
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setShowUnifiedForm(true)}
            className="w-full px-4 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Transaction / Investment / Goal
          </button>
        )}

        {/* Quick Actions */}
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
          <h2 className="section-heading mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/transactions")}
              className="px-4 py-3 rounded-lg border border-border bg-transparent text-foreground hover:bg-muted transition-all"
            >
              View Transactions
            </button>
            <button
              onClick={() => navigate("/investments")}
              className="px-4 py-3 rounded-lg border border-border bg-transparent text-foreground hover:bg-muted transition-all"
            >
              Manage Investments
            </button>
            <button
              onClick={() => navigate("/savings-goals")}
              className="px-4 py-3 rounded-lg border border-border bg-transparent text-foreground hover:bg-muted transition-all"
            >
              Savings Goals
            </button>
            <button
              onClick={() => navigate("/budgets")}
              className="px-4 py-3 rounded-lg border border-border bg-transparent text-foreground hover:bg-muted transition-all"
            >
              Budgets
            </button>
            <button
              onClick={() => navigate("/advisor")}
              className="px-4 py-3 rounded-lg border border-border bg-transparent text-foreground hover:bg-muted transition-all"
            >
              AI Advisor
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-foreground mb-2">💡 Getting Started</h3>
          <p className="text-sm text-muted-foreground">
            Use the unified form above to add transactions, investments, savings goals, and budgets. All entries are automatically categorized and tracked across your dashboard.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
