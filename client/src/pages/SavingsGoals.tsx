import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, X, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function SavingsGoals() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    deadline: ""
  });

  const { data: goals = [], isLoading } = trpc.savingsGoals.list.useQuery();
  const createGoal = trpc.savingsGoals.create.useMutation();
  const deleteGoal = trpc.savingsGoals.delete.useMutation();

  const handleDeleteGoal = async (goalId: number) => {
    if (!confirm("Are you sure you want to delete this savings goal?")) {
      return;
    }

    try {
      await deleteGoal.mutateAsync({ id: goalId });
      // Invalidate cache to trigger real-time update
      await utils.savingsGoals.list.invalidate();
      toast.success("Savings goal deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete savings goal");
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createGoal.mutateAsync({
        name: formData.name,
        targetAmount: formData.targetAmount,
        currentAmount: formData.currentAmount || "0",
        deadline: new Date(formData.deadline)
      });
      // Invalidate cache to trigger real-time update
      await utils.savingsGoals.list.invalidate();

      toast.success("Savings goal created successfully!");
      setFormData({ name: "", targetAmount: "", currentAmount: "0", deadline: "" });
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to create savings goal");
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(value) || 0);
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getProgressPercent = (current: string, target: string) => {
    const c = parseFloat(current) || 0;
    const t = parseFloat(target) || 1;
    return Math.min((c / t) * 100, 100);
  };

  const getDaysRemaining = (deadline: Date | string) => {
    const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
    const today = new Date();
    const diff = d.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const totalSavingsTarget = goals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount), 0);
  const totalSaved = goals.reduce((sum, goal) => sum + parseFloat(goal.currentAmount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-neon-pink pb-6">
          <div>
            <h1 className="text-4xl font-bold neon-text-pink mb-2">
              SAVINGS GOALS
            </h1>
            <p className="text-neon-cyan text-sm uppercase tracking-widest">
              Set and track your financial targets
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-neon p-6">
            <div className="hud-stat-label">Total Target</div>
            <div className="hud-stat-value text-neon-cyan">{formatCurrency(totalSavingsTarget.toString())}</div>
          </div>
          <div className="card-neon p-6">
            <div className="hud-stat-label">Total Saved</div>
            <div className="hud-stat-value text-neon-green">{formatCurrency(totalSaved.toString())}</div>
          </div>
          <div className="card-neon p-6">
            <div className="hud-stat-label">Active Goals</div>
            <div className="hud-stat-value text-neon-pink">{goals.length}</div>
          </div>
        </div>

        {/* Add Goal Form */}
        {showAddForm && (
          <div className="card-neon-pink p-6 border-neon-pink">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-neon-pink font-bold uppercase tracking-wider">Create New Goal</h3>
              <button onClick={() => setShowAddForm(false)} className="text-neon-pink hover:text-neon-cyan">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              {/* Goal Name */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g., Vacation Fund, Emergency Fund"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Target Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="5000.00"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Current Amount */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Current Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Target Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createGoal.isPending}
                className="w-full btn-neon-cyan uppercase font-bold py-3"
              >
                {createGoal.isPending ? 'Creating...' : 'Create Goal'}
              </button>
            </form>
          </div>
        )}

        {/* Add Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-neon-cyan flex items-center gap-2 w-full justify-center py-3"
          >
            <Plus className="w-5 h-5" />
            Create New Goal
          </button>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-neon-cyan py-8">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="card-neon p-8 text-center">
              <Target className="w-12 h-12 text-neon-cyan mx-auto mb-4 opacity-50" />
              <p className="text-neon-cyan">No savings goals yet. Create your first goal to get started!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = getProgressPercent(goal.currentAmount, goal.targetAmount);
              const daysLeft = goal.deadline ? getDaysRemaining(goal.deadline) : null;
              const isCompleted = parseFloat(goal.currentAmount) >= parseFloat(goal.targetAmount);

              return (
                <div
                  key={goal.id}
                  className={`card-neon p-6 ${isCompleted ? 'border-neon-green' : 'border-neon-cyan'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-neon-pink font-bold text-lg">{goal.name}</h3>
                      <p className="text-neon-cyan/70 text-sm">
                        Target: {goal.deadline ? formatDate(goal.deadline) : 'No deadline'} ({daysLeft && daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {isCompleted && (
                        <span className="text-neon-green text-xs uppercase px-3 py-1 border border-neon-green rounded font-bold">
                          ✓ Completed
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        disabled={deleteGoal.isPending}
                        className="text-neon-pink hover:text-neon-cyan p-2"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neon-cyan">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-neon-cyan/70">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="w-full bg-background border-2 border-neon-cyan/30 h-3 relative overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-neon-green' : 'bg-neon-pink'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-neon-cyan/70 mt-1">
                      {progress.toFixed(1)}% complete
                    </div>
                  </div>

                  {/* Amount Needed */}
                  {!isCompleted && (
                    <div className="text-sm text-neon-cyan/70">
                      Amount needed: <span className="text-neon-pink font-bold">
                        {formatCurrency((parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount)).toString())}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
