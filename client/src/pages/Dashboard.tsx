import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Target, Wallet, Plus, X, DollarSign, PieChart } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";


export default function Dashboard() {
  const { user } = useAuth();
  const { t, isArabic } = useLanguage();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { data: overview, isLoading } = trpc.dashboard.getOverview.useQuery();
  const [showUnifiedForm, setShowUnifiedForm] = useState(false);
  const [stats, setStats] = useState({
    totalExpenses: "0",
    totalIncome: "0",
    portfolioValue: "0",
    totalSavings: "0"
  });

  const [unifiedForm, setUnifiedForm] = useState({
    type: "expense",
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
  const { data: savingsGoals = [] } = trpc.savingsGoals.list.useQuery();
  const { data: lendings = [] } = trpc.lendings.list.useQuery();
  const { data: investments = [] } = trpc.investments.list.useQuery();
  const updateSavingsGoal = trpc.savingsGoals.updateAmount.useMutation();
  const resetAllData = trpc.system.resetAllData.useMutation();
  
  const [showResetConfirm1, setShowResetConfirm1] = useState(false);
  const [showResetConfirm2, setShowResetConfirm2] = useState(false);

  // Calculate net worth and position
  const totalAssets = parseFloat(stats.totalIncome) + parseFloat(stats.totalSavings) + parseFloat(stats.portfolioValue);
  const totalLiabilities = parseFloat(stats.totalExpenses) + (lendings?.filter(l => l.type === "borrowed").reduce((sum, l) => sum + parseFloat(l.amount), 0) || 0);
  const netWorth = totalAssets - totalLiabilities;
  
  const totalLent = lendings?.filter(l => l.type === "lent").reduce((sum, l) => sum + parseFloat(l.amount), 0) || 0;
  const totalBorrowed = lendings?.filter(l => l.type === "borrowed").reduce((sum, l) => sum + parseFloat(l.amount), 0) || 0;
  const netLendingPosition = totalLent - totalBorrowed;

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
      toast.error(t("pleaseFillAllFields"));
      return;
    }

    try {
      if (unifiedForm.type === "expense" || unifiedForm.type === "income") {
        let categoryId = 1;
        if (unifiedForm.category.startsWith("GOAL:")) {
          const goalId = parseInt(unifiedForm.category.split(":")[1]);
          const goal = savingsGoals.find(g => g.id === goalId);
          if (goal) {
            const newAmount = (parseFloat(goal.currentAmount || "0") + parseFloat(unifiedForm.amount)).toString();
            await updateSavingsGoal.mutateAsync({
              goalId: goalId,
              currentAmount: newAmount
            });
            // Invalidate cache to trigger real-time update
            await utils.dashboard.getOverview.invalidate();
            await utils.savingsGoals.list.invalidate();
            toast.success(t("savingsGoalAdded"));
            return;
          }
        } else {
          categoryId = categories.find(c => c.name === unifiedForm.category)?.id || 1;
        }
        await createTransaction.mutateAsync({
          amount: unifiedForm.amount,
          description: unifiedForm.description,
          categoryId: categoryId,
          type: unifiedForm.type === "income" ? "income" : "expense"
        });
        // Invalidate cache to trigger real-time update
        await utils.dashboard.getOverview.invalidate();
        await utils.transactions.list.invalidate();
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
        // Invalidate cache to trigger real-time update
        await utils.dashboard.getOverview.invalidate();
        await utils.investments.list.invalidate();
        toast.success("Investment added!");
      } else if (unifiedForm.type === "savings") {
        await createSavingsGoal.mutateAsync({
          name: unifiedForm.goalName || "Savings Goal",
          targetAmount: unifiedForm.amount,
          currentAmount: unifiedForm.amount,
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        });
        // Invalidate cache to trigger real-time update
        await utils.dashboard.getOverview.invalidate();
        await utils.savingsGoals.list.invalidate();
        toast.success("Savings goal created!");
      } else if (unifiedForm.type === "budget") {
        await createBudget.mutateAsync({
          name: unifiedForm.budgetName || "Budget",
          limitAmount: unifiedForm.amount,
          period: unifiedForm.period as "daily" | "weekly" | "monthly" | "yearly",
          alertThreshold: 80
        });
        // Invalidate cache to trigger real-time update
        await utils.dashboard.getOverview.invalidate();
        await utils.budgets.list.invalidate();
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
      toast.error("Failed to create entry");
    }
  };

  const handleResetClick = () => {
    setShowResetConfirm1(true);
  };

  const handleResetConfirm = async () => {
    setShowResetConfirm1(false);
    setShowResetConfirm2(true);
  };

  const handleResetFinal = async () => {
    try {
      await resetAllData.mutateAsync();
      // Invalidate all caches after reset
      await utils.dashboard.getOverview.invalidate();
      await utils.transactions.list.invalidate();
      await utils.investments.list.invalidate();
      await utils.savingsGoals.list.invalidate();
      await utils.budgets.list.invalidate();
      await utils.lendings.list.invalidate();
      toast.success("All data has been reset!");
      setShowResetConfirm2(false);
    } catch (error) {
      toast.error("Failed to reset data");
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">{t("financialDashboard")}</h1>
          <button
            onClick={() => setShowUnifiedForm(true)}
            className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t("addEntry")}
          </button>
        </div>

        {/* Net Worth Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold opacity-90">{t("netWorth")}</h2>
              <DollarSign className="w-8 h-8 opacity-30" />
            </div>
            <p className="text-4xl font-bold mb-2">${netWorth.toFixed(2)}</p>
            <p className="text-sm opacity-80">{t("totalAssetsMinusTotalLiabilities")}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold opacity-90">{t("netLendingPosition")}</h2>
              <Wallet className="w-8 h-8 opacity-30" />
            </div>
            <p className={`text-4xl font-bold mb-2 ${netLendingPosition >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              ${netLendingPosition.toFixed(2)}
            </p>
            <p className="text-sm opacity-80">{t("moneyLentMinusMoneyBorrowed")}</p>
          </div>
        </div>

        {/* Financial Position Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{t("totalIncome")}</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">${parseFloat(stats.totalIncome).toFixed(2)}</p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{t("totalExpenses")}</p>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">${parseFloat(stats.totalExpenses).toFixed(2)}</p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{t("portfolioValue")}</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">${parseFloat(stats.portfolioValue).toFixed(2)}</p>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{t("totalSavings")}</p>
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">${parseFloat(stats.totalSavings).toFixed(2)}</p>
          </div>
        </div>

        {/* Assets vs Liabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {t("totalAssets")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("income")}</span>
                <span className="font-semibold">${parseFloat(stats.totalIncome).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("savings")}</span>
                <span className="font-semibold">${parseFloat(stats.totalSavings).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("investments")}</span>
                <span className="font-semibold">${parseFloat(stats.portfolioValue).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-bold">{t("totalAssets")}</span>
                <span className="text-lg font-bold text-green-600">${totalAssets.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {t("totalLiabilities")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("expenses")}</span>
                <span className="font-semibold">${parseFloat(stats.totalExpenses).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("moneyBorrowed")}</span>
                <span className="font-semibold">${totalBorrowed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-bold">{t("totalLiabilities")}</span>
                <span className="text-lg font-bold text-red-600">${totalLiabilities.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lending Summary */}
        {lendings && lendings.length > 0 && (
          <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">Lending & Borrowing Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Lent</p>
                <p className="text-2xl font-bold text-green-600">${totalLent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Borrowed</p>
                <p className="text-2xl font-bold text-red-600">${totalBorrowed.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Net Position</p>
                <p className={`text-2xl font-bold ${netLendingPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netLendingPosition.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Unified Form Modal */}
        {showUnifiedForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg border border-border shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-border flex justify-between items-center p-6">
                <h2 className="text-xl font-bold">Add Transaction / Investment / Goal</h2>
                <button onClick={() => setShowUnifiedForm(false)} className="p-1 hover:bg-muted rounded" title="Close form">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUnifiedSubmit} className="space-y-4 p-6" autoComplete="off">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      value={unifiedForm.type}
                      onChange={(e) => setUnifiedForm({ ...unifiedForm, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="investment">Investment</option>
                      <option value="savings">Savings Goal</option>
                      <option value="budget">Budget</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={unifiedForm.amount}
                      onChange={(e) => setUnifiedForm({ ...unifiedForm, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      autoFocus
                    />
                  </div>

                  {(unifiedForm.type === "income" || unifiedForm.type === "expense") && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={unifiedForm.category}
                        onChange={(e) => setUnifiedForm({ ...unifiedForm, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      >
                        <option value="">Select category...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                        {savingsGoals.map(goal => (
                          <option key={`GOAL:${goal.id}`} value={`GOAL:${goal.id}`}>📊 {goal.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {unifiedForm.type === "investment" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Asset Type</label>
                      <select
                        value={unifiedForm.assetType}
                        onChange={(e) => setUnifiedForm({ ...unifiedForm, assetType: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      >
                        <option value="stock">Stock</option>
                        <option value="crypto">Cryptocurrency</option>
                        <option value="etf">ETF</option>
                        <option value="mutual_fund">Mutual Fund</option>
                        <option value="commodity">Commodity</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  )}

                  {unifiedForm.type === "savings" && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Goal Name</label>
                      <input
                        type="text"
                        value={unifiedForm.goalName}
                        onChange={(e) => setUnifiedForm({ ...unifiedForm, goalName: e.target.value })}
                        placeholder="e.g., Vacation Fund"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                      />
                    </div>
                  )}

                  {unifiedForm.type === "budget" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Budget Name</label>
                        <input
                          type="text"
                          value={unifiedForm.budgetName}
                          onChange={(e) => setUnifiedForm({ ...unifiedForm, budgetName: e.target.value })}
                          placeholder="e.g., Monthly Groceries"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Period</label>
                        <select
                          value={unifiedForm.period}
                          onChange={(e) => setUnifiedForm({ ...unifiedForm, period: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={unifiedForm.description}
                    onChange={(e) => setUnifiedForm({ ...unifiedForm, description: e.target.value })}
                    placeholder="Optional details"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createTransaction.isPending || createInvestment.isPending}
                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {createTransaction.isPending ? "Adding..." : "Add Entry"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUnifiedForm(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-border bg-transparent text-foreground hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button onClick={() => navigate("/transactions")} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-all text-sm font-medium">
              View Transactions
            </button>
            <button onClick={() => navigate("/investments")} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-all text-sm font-medium">
              Manage Investments
            </button>
            <button onClick={() => navigate("/savings-goals")} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-all text-sm font-medium">
              Savings Goals
            </button>
            <button onClick={() => navigate("/budgets")} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-all text-sm font-medium">
              Budgets
            </button>
            <button onClick={() => navigate("/lendings")} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-all text-sm font-medium">
              Lendings
            </button>
            <button onClick={() => navigate("/advisor")} className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-all text-sm font-medium">
              AI Advisor
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-6">
          <h3 className="text-lg font-bold text-red-900 dark:text-red-400 mb-2">⚠️ Danger Zone</h3>
          <p className="text-sm text-red-800 dark:text-red-300 mb-4">
            Permanently delete all your financial data. This action cannot be undone.
          </p>
          <button
            onClick={handleResetClick}
            className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all"
          >
            Reset All Data
          </button>
        </div>

        {/* Reset Confirmation Dialogs */}
        {showResetConfirm1 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground rounded-lg p-6 max-w-sm w-full mx-4 border border-border">
              <h3 className="text-lg font-bold mb-4">Are you sure?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This will permanently delete all your transactions, investments, savings goals, budgets, and lending records.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResetConfirm}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  Continue
                </button>
                <button
                  onClick={() => setShowResetConfirm1(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showResetConfirm2 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card text-card-foreground rounded-lg p-6 max-w-sm w-full mx-4 border border-border">
              <h3 className="text-lg font-bold text-red-600 mb-4">⚠️ FINAL WARNING</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This is your final chance. All data will be permanently deleted and cannot be recovered.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResetFinal}
                  disabled={resetAllData.isPending}
                  className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {resetAllData.isPending ? "Resetting..." : "Delete Everything"}
                </button>
                <button
                  onClick={() => setShowResetConfirm2(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
