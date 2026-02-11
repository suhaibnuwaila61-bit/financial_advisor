import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, X, TrendingUp, TrendingDown, Trash2, RefreshCw, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type AssetType = "stock" | "crypto" | "etf" | "mutual_fund" | "commodity" | "other";

export default function Investments() {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [priceChartDays, setPriceChartDays] = useState(30);

  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    assetType: "stock" as AssetType,
    quantity: "",
    purchasePrice: "",
    currentPrice: ""
  });

  const [transactionData, setTransactionData] = useState({
    symbol: "",
    assetType: "stock" as AssetType,
    transactionType: "buy" as "buy" | "sell",
    quantity: "",
    pricePerUnit: "",
    fees: "0",
    notes: "",
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const { data: investments = [], isLoading, refetch } = trpc.investments.list.useQuery();
  const { data: transactions = [] } = trpc.investments.transactions.list.useQuery(
    selectedInvestment ? { symbol: selectedInvestment.symbol } : { symbol: "" },
    { enabled: !!selectedInvestment }
  );
  const { data: priceHistory = [] } = trpc.investments.priceHistory.useQuery(
    selectedInvestment ? { symbol: selectedInvestment.symbol, days: priceChartDays } : { symbol: "", days: 30 },
    { enabled: !!selectedInvestment }
  );
  const { data: investmentStats } = trpc.investments.stats.useQuery(
    selectedInvestment ? { symbol: selectedInvestment.symbol } : { symbol: "" },
    { enabled: !!selectedInvestment }
  );

  const createInvestment = trpc.investments.create.useMutation();
  const deleteInvestment = trpc.investments.delete.useMutation();
  const refreshPrices = trpc.investments.refreshPrices.useMutation();
  const createTransaction = trpc.investments.transactions.create.useMutation();
  const deleteTransaction = trpc.investments.transactions.delete.useMutation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshPrices = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshPrices.mutateAsync();
      if (result.success) {
        toast.success(result.message);
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to refresh prices");
    } finally {
      setIsRefreshing(false);
    }
  };

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

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionData.symbol || !transactionData.quantity || !transactionData.pricePerUnit) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createTransaction.mutateAsync({
        symbol: transactionData.symbol.toUpperCase(),
        assetType: transactionData.assetType,
        transactionType: transactionData.transactionType,
        quantity: transactionData.quantity,
        pricePerUnit: transactionData.pricePerUnit,
        fees: transactionData.fees || "0",
        notes: transactionData.notes || undefined,
        transactionDate: new Date(transactionData.transactionDate)
      });

      toast.success("Transaction recorded successfully!");
      setTransactionData({
        symbol: "",
        assetType: "stock",
        transactionType: "buy",
        quantity: "",
        pricePerUnit: "",
        fees: "0",
        notes: "",
        transactionDate: new Date().toISOString().split('T')[0]
      });
      setShowTransactionForm(false);
      // Refetch transactions if we have a selected investment
      if (selectedInvestment) {
        // Trigger refetch by updating selected investment
      }
    } catch (error) {
      toast.error("Failed to record transaction");
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await deleteTransaction.mutateAsync({ id: transactionId });
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num || 0);
  };

  // Calculate portfolio metrics
  const portfolioMetrics = investments.reduce((acc, inv) => {
    const currentValue = parseFloat(inv.quantity) * parseFloat(inv.currentPrice);
    const costValue = parseFloat(inv.quantity) * parseFloat(inv.purchasePrice);
    const gainLoss = currentValue - costValue;

    return {
      totalValue: acc.totalValue + currentValue,
      totalCost: acc.totalCost + costValue,
      totalGainLoss: acc.totalGainLoss + gainLoss,
      totalTransactions: acc.totalTransactions + (transactions?.length || 0)
    };
  }, { totalValue: 0, totalCost: 0, totalGainLoss: 0, totalTransactions: 0 });

  // Find best and worst performers
  const performers = investments
    .map(inv => {
      const gainLoss = (parseFloat(inv.currentPrice) - parseFloat(inv.purchasePrice)) / parseFloat(inv.purchasePrice) * 100;
      return { ...inv, gainLoss };
    })
    .sort((a, b) => b.gainLoss - a.gainLoss);

  const bestPerformer = performers[0];
  const worstPerformer = performers[performers.length - 1];

  // Asset allocation data for pie chart
  const assetAllocation = investments.reduce((acc, inv) => {
    const value = parseFloat(inv.quantity) * parseFloat(inv.currentPrice);
    const existing = acc.find(a => a.name === inv.assetType);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ name: inv.assetType, value });
    }
    return acc;
  }, [] as Array<{ name: string; value: number }>);

  const COLORS = ['#00D9FF', '#FF1493', '#00FF00', '#FFD700', '#FF6347', '#9370DB'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-neon-cyan">Investment Portfolio</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTransactionForm(true)}
              className="flex items-center gap-2 bg-neon-cyan text-background px-4 py-2 font-bold hover:bg-neon-pink transition"
            >
              <BarChart3 className="w-4 h-4" />
              Record Trade
            </button>
            <button
              onClick={handleRefreshPrices}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-neon-cyan text-background px-4 py-2 font-bold hover:bg-neon-pink transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-neon-cyan text-background px-4 py-2 font-bold hover:bg-neon-pink transition"
            >
              <Plus className="w-4 h-4" />
              Add Investment
            </button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 border border-neon-cyan/50 p-4">
            <p className="text-neon-cyan/70 text-sm mb-1">Total Value</p>
            <p className="text-2xl font-bold text-neon-cyan">{formatCurrency(portfolioMetrics.totalValue)}</p>
          </div>
          <div className="bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 border border-neon-cyan/50 p-4">
            <p className="text-neon-cyan/70 text-sm mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-neon-cyan">{formatCurrency(portfolioMetrics.totalCost)}</p>
          </div>
          <div className={`bg-gradient-to-br border p-4 ${portfolioMetrics.totalGainLoss >= 0 
            ? 'from-neon-green/20 to-neon-green/5 border-neon-green/50' 
            : 'from-neon-pink/20 to-neon-pink/5 border-neon-pink/50'}`}>
            <p className={`text-sm mb-1 ${portfolioMetrics.totalGainLoss >= 0 ? 'text-neon-green/70' : 'text-neon-pink/70'}`}>Gain/Loss</p>
            <p className={`text-2xl font-bold ${portfolioMetrics.totalGainLoss >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
              {formatCurrency(portfolioMetrics.totalGainLoss)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 border border-neon-cyan/50 p-4">
            <p className="text-neon-cyan/70 text-sm mb-1">Transactions</p>
            <p className="text-2xl font-bold text-neon-cyan">{investments.length}</p>
          </div>
        </div>

        {/* Best/Worst Performers & Asset Allocation */}
        {investments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Best Performer */}
            {bestPerformer && (
              <div className="bg-gradient-to-br from-neon-green/20 to-neon-green/5 border border-neon-green/50 p-4">
                <p className="text-neon-green/70 text-sm mb-2">Best Performer</p>
                <p className="text-xl font-bold text-neon-green mb-1">{bestPerformer.symbol}</p>
                <p className="text-neon-green text-sm">+{bestPerformer.gainLoss.toFixed(2)}%</p>
              </div>
            )}

            {/* Worst Performer */}
            {worstPerformer && (
              <div className="bg-gradient-to-br from-neon-pink/20 to-neon-pink/5 border border-neon-pink/50 p-4">
                <p className="text-neon-pink/70 text-sm mb-2">Worst Performer</p>
                <p className="text-xl font-bold text-neon-pink mb-1">{worstPerformer.symbol}</p>
                <p className="text-neon-pink text-sm">{worstPerformer.gainLoss.toFixed(2)}%</p>
              </div>
            )}

            {/* Asset Allocation */}
            {assetAllocation.length > 0 && (
              <div className="bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 border border-neon-cyan/50 p-4">
                <p className="text-neon-cyan/70 text-sm mb-3">Asset Allocation</p>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Investment Cards */}
        {isLoading ? (
          <div className="text-center py-8 text-neon-cyan">Loading investments...</div>
        ) : investments.length === 0 ? (
          <div className="text-center py-8 text-neon-cyan/50">
            <p>No investments yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investments.map((investment) => {
              const totalValue = parseFloat(investment.quantity) * parseFloat(investment.currentPrice);
              const costValue = parseFloat(investment.quantity) * parseFloat(investment.purchasePrice);
              const gainLoss = totalValue - costValue;
              const gainLossPercent = (gainLoss / costValue) * 100;
              const isProfit = gainLoss >= 0;

              return (
                <div
                  key={investment.id}
                  onClick={() => {
                    setSelectedInvestment(investment);
                    setShowDetailModal(true);
                  }}
                  className="bg-gradient-to-br from-background to-background/50 border border-neon-cyan/30 p-4 cursor-pointer hover:border-neon-cyan transition group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-neon-cyan group-hover:text-neon-pink transition">{investment.symbol}</h3>
                      <p className="text-neon-cyan/50 text-sm">{investment.name}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteInvestment(investment.id);
                      }}
                      className="text-neon-pink hover:text-neon-pink/70 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neon-cyan/70">Quantity:</span>
                      <span className="text-neon-cyan font-mono">{parseFloat(investment.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neon-cyan/70">Purchase Price:</span>
                      <span className="text-neon-cyan font-mono">{formatCurrency(investment.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neon-cyan/70">Current Price:</span>
                      <span className="text-neon-cyan font-mono">{formatCurrency(investment.currentPrice)}</span>
                    </div>
                    <div className="border-t border-neon-cyan/20 pt-3 mt-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-neon-cyan/70">Current Value:</span>
                        <span className="text-neon-cyan font-bold">{formatCurrency(totalValue.toString())}</span>
                      </div>
                      <div className={`flex justify-between items-center ${isProfit ? 'text-neon-green' : 'text-neon-pink'}`}>
                        <span className="flex items-center gap-2">
                          {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          Gain/Loss
                        </span>
                        <span className="font-bold">
                          {formatCurrency(gainLoss.toString())} ({gainLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Investment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-neon-cyan max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-neon-cyan/20">
              <h2 className="text-xl font-bold text-neon-cyan">Add Investment</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-neon-cyan hover:text-neon-pink transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInvestment} className="p-6 space-y-4">
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
                  placeholder="100"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Purchase Price</label>
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
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Current Price</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="175.00"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-neon-cyan text-background font-bold py-2 hover:bg-neon-pink transition mt-6"
              >
                Add Investment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Record Transaction Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-neon-cyan max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-neon-cyan/20">
              <h2 className="text-xl font-bold text-neon-cyan">Record Transaction</h2>
              <button
                onClick={() => setShowTransactionForm(false)}
                className="text-neon-cyan hover:text-neon-pink transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="p-6 space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Transaction Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-neon-cyan cursor-pointer">
                    <input
                      type="radio"
                      name="transactionType"
                      value="buy"
                      checked={transactionData.transactionType === "buy"}
                      onChange={(e) => setTransactionData({ ...transactionData, transactionType: "buy" })}
                    />
                    Buy
                  </label>
                  <label className="flex items-center gap-2 text-neon-cyan cursor-pointer">
                    <input
                      type="radio"
                      name="transactionType"
                      value="sell"
                      checked={transactionData.transactionType === "sell"}
                      onChange={(e) => setTransactionData({ ...transactionData, transactionType: "sell" })}
                    />
                    Sell
                  </label>
                </div>
              </div>

              {/* Symbol */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Symbol</label>
                <input
                  type="text"
                  placeholder="AAPL"
                  value={transactionData.symbol}
                  onChange={(e) => setTransactionData({ ...transactionData, symbol: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Asset Type */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Asset Type</label>
                <select
                  value={transactionData.assetType}
                  onChange={(e) => setTransactionData({ ...transactionData, assetType: e.target.value as AssetType })}
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

              {/* Quantity */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Quantity</label>
                <input
                  type="number"
                  step="0.00000001"
                  placeholder="10"
                  value={transactionData.quantity}
                  onChange={(e) => setTransactionData({ ...transactionData, quantity: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Price Per Unit */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Price Per Unit</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={transactionData.pricePerUnit}
                  onChange={(e) => setTransactionData({ ...transactionData, pricePerUnit: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Fees */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Fees (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={transactionData.fees}
                  onChange={(e) => setTransactionData({ ...transactionData, fees: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={transactionData.transactionDate}
                  onChange={(e) => setTransactionData({ ...transactionData, transactionDate: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-neon-cyan text-sm mb-2 uppercase tracking-wider">Notes (Optional)</label>
                <textarea
                  placeholder="Add any notes..."
                  value={transactionData.notes}
                  onChange={(e) => setTransactionData({ ...transactionData, notes: e.target.value })}
                  className="w-full bg-background border-2 border-neon-cyan text-neon-cyan px-4 py-2 focus:outline-none focus:border-neon-pink"
                  rows={3}
                />
              </div>

              {/* Total */}
              {transactionData.quantity && transactionData.pricePerUnit && (
                <div className="bg-neon-cyan/10 border border-neon-cyan/30 p-3 rounded">
                  <p className="text-neon-cyan/70 text-sm">Total Amount</p>
                  <p className="text-xl font-bold text-neon-cyan">
                    {formatCurrency((parseFloat(transactionData.quantity) * parseFloat(transactionData.pricePerUnit) + parseFloat(transactionData.fees || "0")).toString())}
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-neon-cyan text-background font-bold py-2 hover:bg-neon-pink transition mt-6"
              >
                Record Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Investment Detail Modal */}
      {showDetailModal && selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-neon-cyan max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-neon-cyan/20 sticky top-0 bg-background">
              <h2 className="text-xl font-bold text-neon-cyan">{selectedInvestment.symbol} - {selectedInvestment.name}</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedInvestment(null);
                }}
                className="text-neon-cyan hover:text-neon-pink transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Price History Chart */}
              {priceHistory && priceHistory.length > 0 && (
                <div>
                  <div className="flex gap-2 mb-4">
                    {[7, 30, 90, 365].map(days => (
                      <button
                        key={days}
                        onClick={() => setPriceChartDays(days)}
                        className={`px-3 py-1 text-sm font-bold transition ${
                          priceChartDays === days
                            ? 'bg-neon-cyan text-background'
                            : 'border border-neon-cyan/50 text-neon-cyan hover:border-neon-cyan'
                        }`}
                      >
                        {days === 365 ? '1Y' : `${days}D`}
                      </button>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={(priceHistory as any[]).map(p => ({
                      date: new Date((p as any).recordedAt).toLocaleDateString(),
                      price: parseFloat((p as any).price)
                    })) || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 217, 255, 0.1)" />
                      <XAxis dataKey="date" stroke="#00D9FF" />
                      <YAxis stroke="#00D9FF" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0e27', border: '2px solid #00D9FF' }}
                        formatter={(value) => `$${(value as number).toFixed(2)}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#00D9FF" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Investment Statistics */}
              {investmentStats && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neon-cyan/10 border border-neon-cyan/30 p-4">
                    <p className="text-neon-cyan/70 text-sm mb-1">Average Cost Basis</p>
                    <p className="text-lg font-bold text-neon-cyan">{formatCurrency((investmentStats as any)?.averageCostBasis || "0")}</p>
                  </div>
                  <div className="bg-neon-cyan/10 border border-neon-cyan/30 p-4">
                    <p className="text-neon-cyan/70 text-sm mb-1">Holding Period</p>
                    <p className="text-lg font-bold text-neon-cyan">{(investmentStats as any)?.holdingDays || 0} days</p>
                  </div>
                  <div className="bg-neon-green/10 border border-neon-green/30 p-4">
                    <p className="text-neon-green/70 text-sm mb-1">Realized Gains</p>
                    <p className="text-lg font-bold text-neon-green">{formatCurrency((investmentStats as any)?.realizedGains || "0")}</p>
                  </div>
                  <div className="bg-neon-cyan/10 border border-neon-cyan/30 p-4">
                    <p className="text-neon-cyan/70 text-sm mb-1">Total Transactions</p>
                    <p className="text-lg font-bold text-neon-cyan">{(investmentStats as any)?.transactionCount || 0}</p>
                  </div>
                </div>
              )}

              {/* Transaction History */}
              {transactions && transactions.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-neon-cyan mb-4">Transaction History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-neon-cyan/30">
                          <th className="text-left text-neon-cyan/70 py-2">Date</th>
                          <th className="text-left text-neon-cyan/70 py-2">Type</th>
                          <th className="text-right text-neon-cyan/70 py-2">Qty</th>
                          <th className="text-right text-neon-cyan/70 py-2">Price</th>
                          <th className="text-right text-neon-cyan/70 py-2">Total</th>
                          <th className="text-center text-neon-cyan/70 py-2">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx: any) => (
                          <tr key={tx.id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5">
                            <td className="py-2 text-neon-cyan">{new Date(tx.transactionDate).toLocaleDateString()}</td>
                            <td className={`py-2 font-bold ${tx.transactionType === 'buy' ? 'text-neon-green' : 'text-neon-pink'}`}>
                              {tx.transactionType.toUpperCase()}
                            </td>
                            <td className="py-2 text-right text-neon-cyan">{parseFloat(tx.quantity).toFixed(2)}</td>
                            <td className="py-2 text-right text-neon-cyan">{formatCurrency(tx.pricePerUnit)}</td>
                            <td className="py-2 text-right text-neon-cyan font-bold">{formatCurrency(tx.totalAmount)}</td>
                            <td className="py-2 text-center">
                              <button
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="text-neon-pink hover:text-neon-pink/70 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
