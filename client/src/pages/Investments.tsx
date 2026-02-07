import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Zap } from "lucide-react";

export default function Investments() {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: investments = [], isLoading } = trpc.investments.list.useQuery();

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(value));
  };

  const calculateGainLoss = (quantity: string, purchasePrice: string, currentPrice: string) => {
    const q = parseFloat(quantity);
    const pp = parseFloat(purchasePrice);
    const cp = parseFloat(currentPrice);
    return (q * cp) - (q * pp);
  };

  const calculateGainLossPercent = (purchasePrice: string, currentPrice: string) => {
    const pp = parseFloat(purchasePrice);
    const cp = parseFloat(currentPrice);
    return ((cp - pp) / pp) * 100;
  };

  const calculateTotalValue = (quantity: string, currentPrice: string) => {
    return parseFloat(quantity) * parseFloat(currentPrice);
  };

  const calculateTotalCost = (quantity: string, purchasePrice: string) => {
    return parseFloat(quantity) * parseFloat(purchasePrice);
  };

  const totalPortfolioValue = investments.reduce((sum, inv) => {
    return sum + calculateTotalValue(inv.quantity, inv.currentPrice);
  }, 0);

  const totalCostBasis = investments.reduce((sum, inv) => {
    return sum + calculateTotalCost(inv.quantity, inv.purchasePrice);
  }, 0);

  const totalGainLoss = totalPortfolioValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'stock':
        return 'bg-neon-blue';
      case 'crypto':
        return 'bg-neon-purple';
      case 'etf':
        return 'bg-neon-green';
      default:
        return 'bg-neon-cyan';
    }
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return '📈';
      case 'crypto':
        return '₿';
      case 'etf':
        return '🎯';
      default:
        return '💰';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-neon-pink pb-6">
          <h1 className="text-4xl font-bold neon-text-pink mb-2">
            INVESTMENT PORTFOLIO
          </h1>
          <p className="text-neon-cyan text-sm uppercase tracking-widest">
            Manage your assets and track performance
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-neon p-6">
            <div className="hud-stat-label">Total Portfolio Value</div>
            <div className="hud-stat-value text-neon-cyan">
              {formatCurrency(totalPortfolioValue.toString())}
            </div>
            <div className="mt-4 pt-4 border-t border-neon-cyan/30 text-xs text-neon-cyan/70">
              {investments.length} assets
            </div>
          </div>

          <div className="card-neon-pink p-6">
            <div className="hud-stat-label text-neon-pink">Total Cost Basis</div>
            <div className="hud-stat-value text-neon-pink">
              {formatCurrency(totalCostBasis.toString())}
            </div>
            <div className="mt-4 pt-4 border-t border-neon-pink/30 text-xs text-neon-pink/70">
              Initial investment
            </div>
          </div>

          <div className={`card-neon p-6 ${totalGainLoss >= 0 ? 'border-neon-green' : 'border-neon-pink'}`}>
            <div className={`hud-stat-label ${totalGainLoss >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
              Total Gain/Loss
            </div>
            <div className={`hud-stat-value ${totalGainLoss >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
              {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss.toString())}
            </div>
            <div className={`mt-4 pt-4 border-t ${totalGainLoss >= 0 ? 'border-neon-green/30 text-neon-green/70' : 'border-neon-pink/30 text-neon-pink/70'} text-xs`}>
              {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Add Investment Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-neon-cyan flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Investment
          </button>
        </div>

        {/* Holdings Table */}
        <div className="card-neon overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b-2 border-neon-pink">
                <tr>
                  <th className="px-6 py-4 text-left text-neon-pink uppercase text-xs font-bold tracking-wider">Symbol</th>
                  <th className="px-6 py-4 text-left text-neon-pink uppercase text-xs font-bold tracking-wider">Type</th>
                  <th className="px-6 py-4 text-center text-neon-pink uppercase text-xs font-bold tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-right text-neon-pink uppercase text-xs font-bold tracking-wider">Purchase Price</th>
                  <th className="px-6 py-4 text-right text-neon-pink uppercase text-xs font-bold tracking-wider">Current Price</th>
                  <th className="px-6 py-4 text-right text-neon-pink uppercase text-xs font-bold tracking-wider">Total Value</th>
                  <th className="px-6 py-4 text-right text-neon-pink uppercase text-xs font-bold tracking-wider">Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-neon-cyan">
                      Loading investments...
                    </td>
                  </tr>
                ) : investments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-neon-cyan/50">
                      No investments yet. Add your first investment to get started!
                    </td>
                  </tr>
                ) : (
                  investments.map((inv, idx) => {
                    const gainLoss = calculateGainLoss(inv.quantity, inv.purchasePrice, inv.currentPrice);
                    const gainLossPercent = calculateGainLossPercent(inv.purchasePrice, inv.currentPrice);
                    const totalValue = calculateTotalValue(inv.quantity, inv.currentPrice);

                    return (
                      <tr
                        key={inv.id}
                        className={`border-t border-neon-cyan/20 hover:bg-neon-cyan/5 transition-colors ${
                          idx % 2 === 0 ? 'bg-transparent' : 'bg-neon-pink/5'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getAssetTypeIcon(inv.assetType)}</span>
                            <div>
                              <div className="font-bold text-neon-cyan">{inv.symbol}</div>
                              <div className="text-xs text-neon-cyan/50">{inv.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-black ${getAssetTypeColor(inv.assetType)}`}>
                            {inv.assetType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-neon-cyan">
                          {parseFloat(inv.quantity).toFixed(8)}
                        </td>
                        <td className="px-6 py-4 text-right text-neon-cyan">
                          {formatCurrency(inv.purchasePrice)}
                        </td>
                        <td className="px-6 py-4 text-right text-neon-cyan">
                          {formatCurrency(inv.currentPrice)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-neon-pink">
                          {formatCurrency(totalValue.toString())}
                        </td>
                        <td className={`px-6 py-4 text-right font-bold flex items-center justify-end gap-2 ${
                          gainLoss >= 0 ? 'text-neon-green' : 'text-neon-pink'
                        }`}>
                          <span>{gainLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}</span>
                          <span>{gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss.toString())} ({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Market Data Info */}
        <div className="card-neon p-6 border-neon-cyan">
          <div className="flex items-start gap-4">
            <div className="text-neon-cyan text-2xl">⚡</div>
            <div>
              <h4 className="text-neon-pink font-bold mb-2">Real-Time Market Data</h4>
              <p className="text-neon-cyan text-sm">
                Your portfolio values are updated in real-time with live market data for stocks and cryptocurrencies. Check back regularly to see your gains and losses update automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
