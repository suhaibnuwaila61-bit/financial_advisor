import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, AlertTriangle, CheckCircle } from "lucide-react";

export default function Budgets() {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: budgets = [], isLoading } = trpc.budgets.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(value));
  };

  const getCategoryName = (categoryId: number | null | undefined) => {
    if (!categoryId) return 'General';
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const calculatePercentage = (spent: string, limit: string) => {
    const s = parseFloat(spent);
    const l = parseFloat(limit);
    return Math.min((s / l) * 100, 100);
  };

  const isOverBudget = (spent: string, limit: string) => {
    return parseFloat(spent) > parseFloat(limit);
  };

  const isAlertThreshold = (spent: string, limit: string, threshold: number) => {
    const percentage = calculatePercentage(spent, limit);
    return percentage >= threshold && !isOverBudget(spent, limit);
  };

  const totalBudgetLimit = budgets.reduce((sum, b) => sum + parseFloat(b.limitAmount), 0);
  const totalBudgetSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0);
  const activeBudgets = budgets.filter(b => b.isActive).length;
  const overBudgetCount = budgets.filter(b => isOverBudget(b.spent, b.limitAmount)).length;

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      default:
        return period;
    }
  };

  const getStatusIcon = (spent: string, limit: string, threshold: number) => {
    if (isOverBudget(spent, limit)) {
      return <AlertTriangle className="w-5 h-5 text-neon-pink" />;
    } else if (isAlertThreshold(spent, limit, threshold)) {
      return <AlertTriangle className="w-5 h-5 text-neon-purple" />;
    } else {
      return <CheckCircle className="w-5 h-5 text-neon-green" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-neon-pink pb-6">
          <h1 className="text-4xl font-bold neon-text-pink mb-2">
            BUDGET CONTROL
          </h1>
          <p className="text-neon-cyan text-sm uppercase tracking-widest">
            Set limits and monitor spending
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card-neon p-6">
            <div className="hud-stat-label">Total Budget</div>
            <div className="hud-stat-value text-neon-cyan">
              {formatCurrency(totalBudgetLimit.toString())}
            </div>
            <div className="mt-4 pt-4 border-t border-neon-cyan/30 text-xs text-neon-cyan/70">
              All budgets combined
            </div>
          </div>

          <div className="card-neon-pink p-6">
            <div className="hud-stat-label text-neon-pink">Total Spent</div>
            <div className="hud-stat-value text-neon-pink">
              {formatCurrency(totalBudgetSpent.toString())}
            </div>
            <div className="mt-4 pt-4 border-t border-neon-pink/30 text-xs text-neon-pink/70">
              {totalBudgetLimit > 0 ? ((totalBudgetSpent / totalBudgetLimit) * 100).toFixed(1) : 0}% of total
            </div>
          </div>

          <div className="card-neon p-6">
            <div className="hud-stat-label">Active Budgets</div>
            <div className="hud-stat-value text-neon-green">
              {activeBudgets}
            </div>
            <div className="mt-4 pt-4 border-t border-neon-green/30 text-xs text-neon-green/70">
              {budgets.length} total budgets
            </div>
          </div>

          <div className={`card-neon p-6 ${overBudgetCount > 0 ? 'border-neon-pink' : 'border-neon-green'}`}>
            <div className={`hud-stat-label ${overBudgetCount > 0 ? 'text-neon-pink' : 'text-neon-green'}`}>
              Over Budget
            </div>
            <div className={`hud-stat-value ${overBudgetCount > 0 ? 'text-neon-pink' : 'text-neon-green'}`}>
              {overBudgetCount}
            </div>
            <div className={`mt-4 pt-4 border-t ${overBudgetCount > 0 ? 'border-neon-pink/30 text-neon-pink/70' : 'border-neon-green/30 text-neon-green/70'} text-xs`}>
              {overBudgetCount === 0 ? 'All on track' : 'Action needed'}
            </div>
          </div>
        </div>

        {/* Add Budget Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-neon-cyan flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Budget
          </button>
        </div>

        {/* Budgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 text-center text-neon-cyan py-8">
              Loading budgets...
            </div>
          ) : budgets.length === 0 ? (
            <div className="col-span-2 card-neon p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-neon-cyan mx-auto mb-4 opacity-50" />
              <p className="text-neon-cyan">No budgets set yet. Create your first budget to start tracking!</p>
            </div>
          ) : (
            budgets.map((budget) => {
              const percentage = calculatePercentage(budget.spent, budget.limitAmount);
              const isOver = isOverBudget(budget.spent, budget.limitAmount);
              const isAlert = isAlertThreshold(budget.spent, budget.limitAmount, budget.alertThreshold);
              const remaining = parseFloat(budget.limitAmount) - parseFloat(budget.spent);

              return (
                <div
                  key={budget.id}
                  className={`card-neon p-6 ${isOver ? 'border-neon-pink' : isAlert ? 'border-neon-purple' : 'border-neon-cyan'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-neon-pink font-bold text-lg mb-1">{budget.name}</h3>
                      <p className="text-neon-cyan/70 text-sm">
                        {getCategoryName(budget.categoryId)} • {getPeriodLabel(budget.period)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusIcon(budget.spent, budget.limitAmount, budget.alertThreshold)}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-neon-cyan text-sm">{formatCurrency(budget.spent)}</span>
                      <span className="text-neon-cyan/70 text-sm">{formatCurrency(budget.limitAmount)}</span>
                    </div>
                    <div className="w-full bg-neon-cyan/20 border border-neon-cyan h-3 relative overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isOver
                            ? 'bg-gradient-to-r from-neon-pink to-neon-pink'
                            : isAlert
                            ? 'bg-gradient-to-r from-neon-purple to-neon-pink'
                            : 'bg-gradient-to-r from-neon-cyan to-neon-green'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className={`text-right mt-2 font-bold text-sm ${
                      isOver ? 'text-neon-pink' : isAlert ? 'text-neon-purple' : 'text-neon-green'
                    }`}>
                      {percentage.toFixed(1)}%
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="space-y-2 text-sm border-t border-neon-cyan/20 pt-4">
                    {isOver ? (
                      <div className="p-3 bg-neon-pink/10 border border-neon-pink/30 rounded">
                        <div className="text-neon-pink font-bold">
                          ⚠ Over by {formatCurrency(Math.abs(remaining).toString())}
                        </div>
                      </div>
                    ) : isAlert ? (
                      <div className="p-3 bg-neon-purple/10 border border-neon-purple/30 rounded">
                        <div className="text-neon-purple font-bold">
                          ⚡ Alert: {budget.alertThreshold}% threshold reached
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-neon-green/10 border border-neon-green/30 rounded">
                        <div className="text-neon-green font-bold">
                          ✓ {formatCurrency(remaining.toString())} remaining
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  {!budget.isActive && (
                    <div className="mt-4 text-center">
                      <span className="inline-block px-3 py-1 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan text-xs font-bold uppercase tracking-wider rounded">
                        Inactive
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Budget Tips */}
        <div className="card-neon p-6 border-neon-cyan">
          <div className="flex items-start gap-4">
            <div className="text-neon-cyan text-2xl">📊</div>
            <div>
              <h4 className="text-neon-pink font-bold mb-2">Budget Best Practices</h4>
              <ul className="text-neon-cyan text-sm space-y-2">
                <li>• Set budgets for each spending category</li>
                <li>• Review budgets weekly to stay on track</li>
                <li>• Adjust alert thresholds based on your needs</li>
                <li>• Use budgets to identify spending patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
