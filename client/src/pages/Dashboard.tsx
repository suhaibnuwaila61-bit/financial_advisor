import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Target, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: overview, isLoading } = trpc.dashboard.getOverview.useQuery();
  const [stats, setStats] = useState({
    totalExpenses: "0",
    totalIncome: "0",
    portfolioValue: "0",
    totalSavings: "0"
  });

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
        <div className="border-b-2 border-neon-pink pb-6">
          <h1 className="text-4xl font-bold neon-text-pink mb-2">
            FINANCIAL NEXUS
          </h1>
          <p className="text-neon-cyan text-sm uppercase tracking-widest">
            Welcome, {user?.name || "Agent"}
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Income */}
          <div className="card-neon group hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="hud-stat-label">Monthly Income</div>
                <div className="hud-stat-value text-neon-green">
                  {isLoading ? "..." : formatCurrency(stats.totalIncome)}
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-neon-green opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4 pt-4 border-t border-neon-cyan/30">
              <p className="text-xs text-neon-cyan/70">Current month</p>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="card-neon-pink group hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="hud-stat-label text-neon-pink">Monthly Expenses</div>
                <div className="hud-stat-value text-neon-pink">
                  {isLoading ? "..." : formatCurrency(stats.totalExpenses)}
                </div>
              </div>
              <TrendingDown className="w-8 h-8 text-neon-pink opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4 pt-4 border-t border-neon-pink/30">
              <p className="text-xs text-neon-pink/70">Current month</p>
            </div>
          </div>

          {/* Portfolio Value */}
          <div className="card-neon group hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="hud-stat-label">Portfolio Value</div>
                <div className="hud-stat-value text-neon-cyan">
                  {isLoading ? "..." : formatCurrency(stats.portfolioValue)}
                </div>
              </div>
              <Wallet className="w-8 h-8 text-neon-cyan opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4 pt-4 border-t border-neon-cyan/30">
              <p className="text-xs text-neon-cyan/70">{overview?.investmentCount || 0} assets</p>
            </div>
          </div>

          {/* Savings Goals */}
          <div className="card-neon group hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="hud-stat-label">Total Savings</div>
                <div className="hud-stat-value text-neon-purple">
                  {isLoading ? "..." : formatCurrency(stats.totalSavings)}
                </div>
              </div>
              <Target className="w-8 h-8 text-neon-purple opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4 pt-4 border-t border-neon-purple/30">
              <p className="text-xs text-neon-purple/70">{overview?.goalsCount || 0} goals</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-neon p-6">
            <h3 className="text-neon-pink mb-4 uppercase tracking-wider font-bold">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/transactions')} className="w-full btn-neon text-sm">
                + Add Transaction
              </button>
              <button onClick={() => navigate('/investments')} className="w-full btn-neon-cyan text-sm">
                + Add Investment
              </button>
              <button onClick={() => navigate('/savings-goals')} className="w-full btn-neon text-sm">
                + New Savings Goal
              </button>
            </div>
          </div>

          <div className="card-neon-pink p-6">
            <h3 className="text-neon-pink mb-4 uppercase tracking-wider font-bold">System Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neon-cyan">Database</span>
                <span className="text-neon-green">● ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neon-cyan">Market Data</span>
                <span className="text-neon-green">● SYNCED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neon-cyan">Notifications</span>
                <span className="text-neon-green">● ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="card-neon p-6 border-neon-cyan">
          <div className="flex items-start gap-4">
            <div className="text-neon-cyan text-2xl">⚡</div>
            <div>
              <h4 className="text-neon-pink font-bold mb-2">Welcome to Financial Nexus</h4>
              <p className="text-neon-cyan text-sm">
                Your personal financial command center. Track expenses, manage investments, and achieve your financial goals with AI-powered insights and real-time market data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
