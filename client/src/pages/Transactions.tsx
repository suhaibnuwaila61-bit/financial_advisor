import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Plus, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TimeRange = "daily" | "weekly" | "monthly";

export default function Transactions() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

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

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || "Unknown";
  };

  const getCategoryColor = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.color || "#FF1493";
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(value));
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredTransactions = transactions.filter(t =>
    (t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    getCategoryName(t.categoryId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expenseTotal = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const incomeTotal = filteredTransactions
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

        {/* Controls */}
        <div className="card-neon p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as TimeRange[]).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 uppercase text-xs font-bold tracking-wider transition-all ${
                    timeRange === range
                      ? 'btn-neon'
                      : 'border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-neon-cyan flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-neon-cyan" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-neon w-full pl-10"
              />
            </div>
            <button className="btn-neon flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-neon p-4">
            <div className="hud-stat-label">Total Income</div>
            <div className="hud-stat-value text-neon-green">
              {formatCurrency(incomeTotal.toString())}
            </div>
          </div>
          <div className="card-neon-pink p-4">
            <div className="hud-stat-label text-neon-pink">Total Expenses</div>
            <div className="hud-stat-value text-neon-pink">
              {formatCurrency(expenseTotal.toString())}
            </div>
          </div>
          <div className="card-neon p-4">
            <div className="hud-stat-label">Net</div>
            <div className={`hud-stat-value ${incomeTotal - expenseTotal >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
              {formatCurrency((incomeTotal - expenseTotal).toString())}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card-neon overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-neon-pink">
                <tr>
                  <th className="px-6 py-4 text-left text-neon-pink uppercase text-xs font-bold tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-neon-pink uppercase text-xs font-bold tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-neon-pink uppercase text-xs font-bold tracking-wider">Description</th>
                  <th className="px-6 py-4 text-right text-neon-pink uppercase text-xs font-bold tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-center text-neon-pink uppercase text-xs font-bold tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neon-cyan">
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neon-cyan/50">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction, idx) => (
                    <tr
                      key={transaction.id}
                      className={`border-t border-neon-cyan/20 hover:bg-neon-cyan/5 transition-colors ${
                        idx % 2 === 0 ? 'bg-transparent' : 'bg-neon-pink/5'
                      }`}
                    >
                      <td className="px-6 py-4 text-neon-cyan text-sm">
                        {formatDate(transaction.transactionDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-black"
                          style={{ backgroundColor: getCategoryColor(transaction.categoryId) }}
                        >
                          {getCategoryName(transaction.categoryId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neon-cyan text-sm">
                        {transaction.description || '-'}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${
                        transaction.type === 'income' ? 'text-neon-green' : 'text-neon-pink'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-bold uppercase ${
                          transaction.type === 'income'
                            ? 'text-neon-green border border-neon-green'
                            : 'text-neon-pink border border-neon-pink'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end">
          <button className="btn-neon-cyan flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
