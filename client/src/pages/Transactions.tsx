import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

type TimeRange = "daily" | "weekly" | "monthly";

export default function Transactions() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "expense" as "income" | "expense",
    categoryId: "1"
  });

  // Get date range based on selected time period
  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "daily":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "weekly":
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return { startDate, endDate: now };
  };

  const dateRange = useMemo(() => getDateRange(), [timeRange]);
  const { data: transactions = [], isLoading } = trpc.transactions.list.useQuery(dateRange);
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const createTransaction = trpc.transactions.create.useMutation();
  const deleteTransaction = trpc.transactions.delete.useMutation();

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || "General";
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await deleteTransaction.mutateAsync({ id: transactionId }, {
        onSuccess: () => {
          // Invalidate cache to trigger real-time update
          trpc.useUtils().transactions.list.invalidate(dateRange);
        }
      });
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const categoryName = getCategoryName(parseInt(formData.categoryId));
      
      await createTransaction.mutateAsync({
        amount: formData.amount,
        description: formData.description,
        type: formData.type,
        categoryId: parseInt(formData.categoryId)
      }, {
        onSuccess: () => {
          // Invalidate cache to trigger real-time update
          trpc.useUtils().transactions.list.invalidate(dateRange);
        }
      });

      // Auto-create savings goal if category is Savings
      if (categoryName.toLowerCase() === "savings") {
        try {
          const savingsGoalMutation = trpc.savingsGoals.create.useMutation();
          await savingsGoalMutation.mutateAsync({
            name: formData.description || "Savings Goal",
            targetAmount: (parseFloat(formData.amount) * 2).toString(),
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          }, {
            onSuccess: () => {
              // Invalidate savings goals cache
              trpc.useUtils().savingsGoals.list.invalidate();
            }
          });
        } catch (e) {
          console.log("Auto-create savings goal skipped");
        }
      }

      toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
      setFormData({ amount: "", description: "", type: "expense", categoryId: "1" });
      setShowAddForm(false);
    } catch (error) {
      toast.error("Failed to add transaction");
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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const expenseTotal = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const incomeTotal = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-neon-pink pb-6">
          <h1 className="text-4xl font-bold neon-text-pink mb-2">
            TRANSACTION LOG
          </h1>
          <p className="text-neon-cyan text-sm uppercase tracking-widest">
            Track all income and expense transactions
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-neon p-6">
            <div className="hud-stat-label text-neon-green">Total Income</div>
            <div className="hud-stat-value text-neon-green">{formatCurrency(incomeTotal.toString())}</div>
          </div>
          <div className="card-neon p-6">
            <div className="hud-stat-label text-neon-pink">Total Expenses</div>
            <div className="hud-stat-value text-neon-pink">{formatCurrency(expenseTotal.toString())}</div>
          </div>
          <div className="card-neon p-6">
            <div className="hud-stat-label text-neon-cyan">Net</div>
            <div className={`hud-stat-value ${(incomeTotal - expenseTotal) >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
              {formatCurrency((incomeTotal - expenseTotal).toString())}
            </div>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="card-neon p-6">
          <div className="flex gap-2 flex-wrap">
            {(['daily', 'weekly', 'monthly'] as TimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 uppercase text-xs font-bold tracking-wider transition-all ${
                  timeRange === range
                    ? 'btn-neon'
                    : 'border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Add Transaction Form */}
        {showAddForm && (
          <div className="card-neon-pink p-6 border-neon-pink">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-neon-pink font-bold uppercase tracking-wider">Add Transaction</h3>
              <button onClick={() => setShowAddForm(false)} className="text-neon-pink hover:text-neon-cyan">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`flex-1 py-2 px-4 uppercase text-sm font-bold transition-all ${
                      formData.type === 'income'
                        ? 'btn-neon-cyan'
                        : 'border border-neon-cyan text-neon-cyan'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`flex-1 py-2 px-4 uppercase text-sm font-bold transition-all ${
                      formData.type === 'expense'
                        ? 'btn-neon'
                        : 'border border-neon-pink text-neon-pink'
                    }`}
                  >
                    Expense
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                >
                  <option value="">-- Select Category --</option>
                  {categories && categories.length > 0 ? (
                    categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))
                  ) : (
                    <option disabled>No categories available</option>
                  )}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  placeholder="What is this for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createTransaction.isPending}
                className="w-full btn-neon-cyan uppercase font-bold py-3"
              >
                {createTransaction.isPending ? 'Adding...' : 'Add Transaction'}
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
            Add New Transaction
          </button>
        )}

        {/* Transactions List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-neon-cyan py-8">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="card-neon p-8 text-center">
              <p className="text-neon-cyan">No transactions yet. Add your first transaction to get started!</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`card-neon p-4 flex items-center justify-between ${
                  transaction.type === 'income' ? 'border-neon-green' : 'border-neon-pink'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`font-bold text-sm uppercase ${
                      transaction.type === 'income' ? 'text-neon-green' : 'text-neon-pink'
                    }`}>
                      {transaction.type === 'income' ? '↓ INCOME' : '↑ EXPENSE'}
                    </span>
                    <span className="text-neon-cyan/70 text-xs">{getCategoryName(transaction.categoryId)}</span>
                  </div>
                  <p className="text-neon-cyan">{transaction.description}</p>
                  <p className="text-neon-cyan/50 text-xs mt-1">{formatDate(transaction.transactionDate)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-right font-bold text-lg ${
                    transaction.type === 'income' ? 'text-neon-green' : 'text-neon-pink'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    disabled={deleteTransaction.isPending}
                    className="text-neon-pink hover:text-neon-cyan transition-colors p-2 hover:bg-neon-pink/10 rounded"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
