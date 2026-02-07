import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, X, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { toast } from "sonner";

type AssetType = "stock" | "crypto" | "etf" | "mutual_fund" | "commodity" | "other";

export default function Investments() {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    assetType: "stock" as AssetType,
    quantity: "",
    purchasePrice: "",
    currentPrice: ""
  });

  const { data: investments = [], isLoading, refetch } = trpc.investments.list.useQuery();
  const createInvestment = trpc.investments.create.useMutation();
  const deleteInvestment = trpc.investments.delete.useMutation();

  const handleDeleteInvestment = async (investmentId: number) => {
    if (!confirm("Are you sure you want to delete this investment?")) {
      return;
    }

    try {
      await deleteInvestment.mutateAsync({ id: investmentId });
      toast.success("Investment deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete investment");
    }
  };

  const handleAddInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.symbol || !formData.quantity || !formData.purchasePrice || !formData.currentPrice) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createInvestment.mutateAsync({
        symbol: formData.symbol.toUpperCase(),
        name: formData.name || formData.symbol,
        assetType: formData.assetType,
        quantity: formData.quantity,
        purchasePrice: formData.purchasePrice,
        currentPrice: formData.currentPrice
      });

      toast.success("Investment added successfully!");
      setFormData({
        symbol: "",
        name: "",
        assetType: "stock",
        quantity: "",
        purchasePrice: "",
        currentPrice: ""
      });
      setShowAddForm(false);
      refetch();
    } catch (error) {
      toast.error("Failed to add investment");
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(parseFloat(value) || 0);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-neon-pink pb-6">
          <h1 className="text-4xl font-bold neon-text-pink mb-2">
            INVESTMENT PORTFOLIO
          </h1>
          <p className="text-neon-cyan text-sm uppercase tracking-widest">
            Manage your stocks, crypto, and other assets
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card-neon p-6">
            <div className="hud-stat-label">Total Value</div>
            <div className="hud-stat-value text-neon-cyan">{formatCurrency(totalPortfolioValue.toString())}</div>
          </div>
          <div className="card-neon p-6">
            <div className="hud-stat-label">Total Cost</div>
            <div className="hud-stat-value text-neon-cyan/70">{formatCurrency(totalCostBasis.toString())}</div>
          </div>
          <div className={`card-neon p-6 ${totalGainLoss >= 0 ? 'border-neon-green' : 'border-neon-pink'}`}>
            <div className={`hud-stat-label ${totalGainLoss >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
              Gain/Loss
            </div>
            <div className={`hud-stat-value ${totalGainLoss >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
              {formatCurrency(totalGainLoss.toString())}
            </div>
          </div>
          <div className={`card-neon p-6 ${totalGainLossPercent >= 0 ? 'border-neon-green' : 'border-neon-pink'}`}>
            <div className={`hud-stat-label ${totalGainLossPercent >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
              Return %
            </div>
            <div className={`hud-stat-value ${totalGainLossPercent >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
              {totalGainLossPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Add Investment Form */}
        {showAddForm && (
          <div className="card-neon-pink p-6 border-neon-pink">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-neon-pink font-bold uppercase tracking-wider">Add Investment</h3>
              <button onClick={() => setShowAddForm(false)} className="text-neon-pink hover:text-neon-cyan">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInvestment} className="space-y-4">
              {/* Asset Type */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Asset Type</label>
                <select
                  value={formData.assetType}
                  onChange={(e) => setFormData({ ...formData, assetType: e.target.value as AssetType })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2"
                >
                  <option value="stock">Stock</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="etf">ETF</option>
                  <option value="mutual_fund">Mutual Fund</option>
                  <option value="other">Other</option>
                  <option value="commodity">Commodity</option>
                </select>
              </div>

              {/* Symbol */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Symbol (AAPL, BTC, etc)</label>
                <input
                  type="text"
                  placeholder="AAPL"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Apple Inc."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  step="0.00000001"
                  placeholder="10"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Purchase Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Current Price */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Current Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="180.00"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createInvestment.isPending}
                className="w-full btn-neon-cyan uppercase font-bold py-3"
              >
                {createInvestment.isPending ? 'Adding...' : 'Add Investment'}
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
            Add New Investment
          </button>
        )}

        {/* Investments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-2 text-center text-neon-cyan py-8">Loading investments...</div>
          ) : investments.length === 0 ? (
            <div className="col-span-2 card-neon p-8 text-center">
              <TrendingUp className="w-12 h-12 text-neon-cyan mx-auto mb-4 opacity-50" />
              <p className="text-neon-cyan">No investments yet. Add your first investment to get started!</p>
            </div>
          ) : (
            investments.map((investment) => {
              const currentValue = calculateTotalValue(investment.quantity, investment.currentPrice);
              const costBasis = calculateTotalCost(investment.quantity, investment.purchasePrice);
              const gainLoss = calculateGainLoss(investment.quantity, investment.purchasePrice, investment.currentPrice);
              const gainLossPercent = calculateGainLossPercent(investment.purchasePrice, investment.currentPrice);

              return (
                <div
                  key={investment.id}
                  className={`card-neon p-6 ${gainLoss >= 0 ? 'border-neon-green' : 'border-neon-pink'}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-neon-pink font-bold text-lg">{investment.symbol}</h3>
                      <p className="text-neon-cyan/70 text-sm">{investment.name || investment.assetType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neon-cyan/70 text-xs uppercase px-2 py-1 border border-neon-cyan/30 rounded">
                        {investment.assetType}
                      </span>
                      <button
                        onClick={() => handleDeleteInvestment(investment.id)}
                        disabled={deleteInvestment.isPending}
                        className="text-neon-pink hover:text-neon-cyan transition-colors p-2"
                        title="Delete investment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 pb-4 border-b border-neon-cyan/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-neon-cyan/70">Quantity:</span>
                      <span className="text-neon-cyan font-bold">{parseFloat(investment.quantity).toFixed(8)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neon-cyan/70">Purchase Price:</span>
                      <span className="text-neon-cyan">{formatCurrency(investment.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neon-cyan/70">Current Price:</span>
                      <span className="text-neon-cyan font-bold">{formatCurrency(investment.currentPrice)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neon-cyan/70">Current Value:</span>
                      <span className="text-neon-cyan font-bold">{formatCurrency(currentValue.toString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neon-cyan/70">Cost Basis:</span>
                      <span className="text-neon-cyan/70">{formatCurrency(costBasis.toString())}</span>
                    </div>
                    <div className={`flex justify-between font-bold ${gainLoss >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
                      <span>Gain/Loss:</span>
                      <span className="flex items-center gap-1">
                        {gainLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss.toString())} ({gainLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
