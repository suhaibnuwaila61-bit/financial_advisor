import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { BarChart3 } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

type DateRange = "week" | "month" | "year";

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#6366f1", // Indigo
  "#ef4444", // Red
];

export default function Analytics() {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState<DateRange>("month");
  
  const { data: transactions = [] } = trpc.transactions.list.useQuery({});
  const { data: investments = [] } = trpc.investments.list.useQuery();
  const categories: any[] = [];

  const getDateRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const start = new Date();
    
    if (dateRange === "week") {
      start.setDate(now.getDate() - 7);
    } else if (dateRange === "month") {
      start.setDate(now.getDate() - 30);
    } else {
      start.setDate(now.getDate() - 365);
    }
    
    return { start, end: now };
  };

  const { start, end }: { start: Date; end: Date } = getDateRange();
  
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.transactionDate);
    return date >= start && date <= end;
  });

  const getExpenseTrends = () => {
    const grouped: Record<string, number> = {};
    
    filteredTransactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        const date = new Date(t.transactionDate).toLocaleDateString();
        grouped[date] = (grouped[date] || 0) + parseFloat(t.amount);
      });
    
    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getIncomeVsExpenses = () => {
    const grouped: Record<string, { income: number; expenses: number }> = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.transactionDate).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = { income: 0, expenses: 0 };
      }
      
      if (t.type === "income") {
        grouped[date].income += parseFloat(t.amount);
      } else if (t.type === "expense") {
        grouped[date].expenses += parseFloat(t.amount);
      }
    });
    
    return Object.entries(grouped)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getExpensesByCategory = () => {
    const grouped: Record<number, number> = {};
    
    filteredTransactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        grouped[t.categoryId] = (grouped[t.categoryId] || 0) + parseFloat(t.amount);
      });
    
    return Object.entries(grouped)
      .map(([categoryId, amount]) => ({
        name: `Category ${categoryId}`,
        value: amount
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getPortfolioBreakdown = () => {
    return investments.map(inv => ({
      name: inv.symbol,
      value: parseFloat(inv.quantity) * parseFloat(inv.currentPrice),
      type: inv.assetType
    }));
  };

  const getInvestmentPerformance = () => {
    return investments.map(inv => {
      const costBasis = parseFloat(inv.quantity) * parseFloat(inv.purchasePrice);
      const currentValue = parseFloat(inv.quantity) * parseFloat(inv.currentPrice);
      
      return {
        name: inv.symbol,
        costBasis,
        currentValue,
        gain: currentValue - costBasis,
        gainPercent: costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0
      };
    });
  };

  const expenseTrends = getExpenseTrends();
  const incomeVsExpenses = getIncomeVsExpenses();
  const expensesByCategory = getExpensesByCategory();
  const portfolioBreakdown = getPortfolioBreakdown();
  const investmentPerformance = getInvestmentPerformance();

  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const portfolioValue = portfolioBreakdown.reduce((sum, inv) => sum + inv.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-blue-500 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-blue-400 mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              ANALYTICS & INSIGHTS
            </h1>
            <p className="text-blue-300/70 text-sm uppercase tracking-widest">
              Visualize your financial data and trends
            </p>
          </div>
          
          {/* Date Filters */}
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as DateRange[]).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium uppercase text-xs transition-all ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6">
            <div className="text-blue-300/70 text-sm uppercase tracking-wider mb-2">Total Expenses</div>
            <div className="text-3xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
            <div className="text-blue-300/50 text-xs mt-2">
              {dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'Last 365 days'}
            </div>
          </div>
          
          <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6">
            <div className="text-blue-300/70 text-sm uppercase tracking-wider mb-2">Total Income</div>
            <div className="text-3xl font-bold text-green-400">{formatCurrency(totalIncome)}</div>
            <div className="text-blue-300/50 text-xs mt-2">
              {dateRange === 'week' ? 'Last 7 days' : dateRange === 'month' ? 'Last 30 days' : 'Last 365 days'}
            </div>
          </div>
          
          <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6">
            <div className="text-blue-300/70 text-sm uppercase tracking-wider mb-2">Portfolio Value</div>
            <div className="text-3xl font-bold text-blue-400">{formatCurrency(portfolioValue)}</div>
            <div className="text-blue-300/50 text-xs mt-2">{investments.length} investments</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-6">
          {/* Expense Trends */}
          {expenseTrends.length > 0 ? (
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Expense Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={expenseTrends}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6 h-80 flex items-center justify-center">
              <p className="text-blue-300/50">No expense data available for this period</p>
            </div>
          )}

          {/* Income vs Expenses */}
          {incomeVsExpenses.length > 0 ? (
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Income vs Expenses</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incomeVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6 h-80 flex items-center justify-center">
              <p className="text-blue-300/50">No transaction data available for this period</p>
            </div>
          )}

          {/* Expense Breakdown & Portfolio Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {expensesByCategory.length > 0 ? (
              <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6">
                <h2 className="text-xl font-bold text-blue-400 mb-4">Expense Breakdown</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6 h-80 flex items-center justify-center">
                <p className="text-blue-300/50">No expense data available</p>
              </div>
            )}

            {portfolioBreakdown.length > 0 ? (
              <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6">
                <h2 className="text-xl font-bold text-blue-400 mb-4">Portfolio Allocation</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolioBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6 h-80 flex items-center justify-center">
                <p className="text-blue-300/50">No investment data available</p>
              </div>
            )}
          </div>

          {/* Investment Performance */}
          {investmentPerformance.length > 0 ? (
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Investment Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={investmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="costBasis" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="currentValue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6 h-80 flex items-center justify-center">
              <p className="text-blue-300/50">No investment data available</p>
            </div>
          )}

          {/* Investment Summary Table */}
          {investmentPerformance.length > 0 && (
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-6 overflow-x-auto">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Investment Summary</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-500">
                    <th className="text-left py-3 px-4 text-blue-300">Asset</th>
                    <th className="text-right py-3 px-4 text-blue-300">Cost Basis</th>
                    <th className="text-right py-3 px-4 text-blue-300">Current Value</th>
                    <th className="text-right py-3 px-4 text-blue-300">Gain/Loss</th>
                    <th className="text-right py-3 px-4 text-blue-300">Return %</th>
                  </tr>
                </thead>
                <tbody>
                  {investmentPerformance.map((inv) => (
                    <tr key={inv.name} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="py-3 px-4 text-blue-300">{inv.name}</td>
                      <td className="text-right py-3 px-4 text-blue-300">{formatCurrency(inv.costBasis)}</td>
                      <td className="text-right py-3 px-4 text-blue-300">{formatCurrency(inv.currentValue)}</td>
                      <td className={`text-right py-3 px-4 font-bold ${inv.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(inv.gain)}
                      </td>
                      <td className={`text-right py-3 px-4 font-bold ${inv.gainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {inv.gainPercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
