import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Target, Calendar, TrendingUp } from "lucide-react";

export default function SavingsGoals() {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: goals = [], isLoading } = trpc.savingsGoals.list.useQuery();

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(value));
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'No deadline';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const calculateProgress = (current: string, target: string) => {
    const c = parseFloat(current);
    const t = parseFloat(target);
    return Math.min((c / t) * 100, 100);
  };

  const calculateDaysRemaining = (deadline: Date | string | null | undefined) => {
    if (!deadline) return null;
    const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const today = new Date();
    const diff = d.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const totalSavingsTarget = goals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount), 0);
  const totalSavingsAchieved = goals.reduce((sum, goal) => sum + parseFloat(goal.currentAmount), 0);
  const completedGoals = goals.filter(g => g.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-neon-green border-neon-green';
      case 'active':
        return 'text-neon-cyan border-neon-cyan';
      case 'abandoned':
        return 'text-neon-pink border-neon-pink';
      default:
        return 'text-neon-cyan border-neon-cyan';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-neon-pink pb-6">
          <h1 className="text-4xl font-bold neon-text-pink mb-2">
            SAVINGS GOALS
          </h1>
          <p className="text-neon-cyan text-sm uppercase tracking-widest">
            Set targets and track your progress
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card-neon p-6">
            <div className="hud-stat-label">Total Target</div>
            <div className="hud-stat-value text-neon-cyan">
              {formatCurrency(totalSavingsTarget.toString())}
            </div>
            <div className="mt-4 pt-4 border-t border-neon-cyan/30 text-xs text-neon-cyan/70">
              All goals combined
            </div>
          </div>

          <div className="card-neon-pink p-6">
            <div className="hud-stat-label text-neon-pink">Achieved</div>
            <div className="hud-stat-value text-neon-pink">
              {formatCurrency(totalSavingsAchieved.toString())}
            </div>
            <div className="mt-4 pt-4 border-t border-neon-pink/30 text-xs text-neon-pink/70">
              {totalSavingsTarget > 0 ? ((totalSavingsAchieved / totalSavingsTarget) * 100).toFixed(1) : 0}% complete
            </div>
          </div>

          <div className="card-neon p-6">
            <div className="hud-stat-label">Remaining</div>
            <div className="hud-stat-value text-neon-cyan">
              {formatCurrency((totalSavingsTarget - totalSavingsAchieved).toString())}
            </div>
            <div className="mt-4 pt-4 border-t border-neon-cyan/30 text-xs text-neon-cyan/70">
              To reach all targets
            </div>
          </div>

          <div className="card-neon p-6">
            <div className="hud-stat-label">Completed</div>
            <div className="hud-stat-value text-neon-green">
              {completedGoals}
            </div>
            <div className="mt-4 pt-4 border-t border-neon-green/30 text-xs text-neon-green/70">
              {goals.length} total goals
            </div>
          </div>
        </div>

        {/* Add Goal Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-neon-cyan flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Savings Goal
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 text-center text-neon-cyan py-8">
              Loading savings goals...
            </div>
          ) : goals.length === 0 ? (
            <div className="col-span-2 card-neon p-8 text-center">
              <Target className="w-12 h-12 text-neon-cyan mx-auto mb-4 opacity-50" />
              <p className="text-neon-cyan">No savings goals yet. Create your first goal to get started!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              const daysRemaining = calculateDaysRemaining(goal.deadline);

              return (
                <div
                  key={goal.id}
                  className={`card-neon p-6 ${goal.status === 'completed' ? 'border-neon-green' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-neon-pink font-bold text-lg mb-1">{goal.name}</h3>
                      {goal.category && (
                        <p className="text-neon-cyan/70 text-sm">{goal.category}</p>
                      )}
                    </div>
                    <span className={`inline-block px-3 py-1 border-2 text-xs font-bold uppercase tracking-wider ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>

                  {goal.description && (
                    <p className="text-neon-cyan text-sm mb-4">{goal.description}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-neon-cyan text-sm">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-neon-cyan/70 text-sm">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="w-full bg-neon-cyan/20 border border-neon-cyan h-3 relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-right mt-2 text-neon-pink font-bold text-sm">
                      {progress.toFixed(1)}%
                    </div>
                  </div>

                  {/* Deadline Info */}
                  {goal.deadline && (
                    <div className="flex items-center gap-2 text-neon-cyan text-sm border-t border-neon-cyan/20 pt-4">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(goal.deadline)}</span>
                      {daysRemaining !== null && (
                        <span className={daysRemaining > 0 ? 'text-neon-green' : 'text-neon-pink'}>
                          ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Deadline passed'})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Amount Needed */}
                  {parseFloat(goal.currentAmount) < parseFloat(goal.targetAmount) && (
                    <div className="mt-4 p-3 bg-neon-pink/10 border border-neon-pink/30 rounded">
                      <div className="text-neon-pink text-sm font-bold">
                        Need: {formatCurrency((parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount)).toString())}
                      </div>
                    </div>
                  )}

                  {/* Completed Badge */}
                  {goal.status === 'completed' && (
                    <div className="mt-4 p-3 bg-neon-green/10 border border-neon-green/30 rounded text-center">
                      <div className="text-neon-green text-sm font-bold">✓ Goal Achieved!</div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Tips Section */}
        <div className="card-neon p-6 border-neon-cyan">
          <div className="flex items-start gap-4">
            <div className="text-neon-cyan text-2xl">💡</div>
            <div>
              <h4 className="text-neon-pink font-bold mb-2">Savings Tips</h4>
              <ul className="text-neon-cyan text-sm space-y-2">
                <li>• Set realistic deadlines to stay motivated</li>
                <li>• Break large goals into smaller milestones</li>
                <li>• Review and adjust your goals quarterly</li>
                <li>• Celebrate when you reach each milestone</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
