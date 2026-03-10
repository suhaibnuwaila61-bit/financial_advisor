import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Zap, TrendingUp, Brain, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { useLanguage } from "@/contexts/LanguageContext";

type InsightType = "advice" | "spending" | "investment" | "budget";

export default function Advisor() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeInsight, setActiveInsight] = useState<InsightType>("advice");
  const [expandedInsight, setExpandedInsight] = useState<InsightType | null>(null);

  const { data: adviceData, isLoading: adviceLoading } = trpc.advisor.getAdvice.useQuery();
  const { data: spendingData, isLoading: spendingLoading } = trpc.advisor.analyzeSpending.useQuery();
  const { data: investmentData, isLoading: investmentLoading } = trpc.advisor.getInvestmentRecommendations.useQuery();
  const { data: budgetData, isLoading: budgetLoading } = trpc.advisor.analyzeBudget.useQuery();

  const insights = {
    advice: {
      title: "Financial Advice",
      icon: <Brain className="w-6 h-6" />,
      data: adviceData?.advice || "",
      loading: adviceLoading,
      color: "neon-pink"
    },
    spending: {
      title: "Spending Analysis",
      icon: <TrendingUp className="w-6 h-6" />,
      data: spendingData?.analysis || "",
      loading: spendingLoading,
      color: "neon-cyan"
    },
    investment: {
      title: "Investment Recommendations",
      icon: <Zap className="w-6 h-6" />,
      data: investmentData?.recommendations || "",
      loading: investmentLoading,
      color: "neon-purple"
    },
    budget: {
      title: "Budget Analysis",
      icon: <TrendingUp className="w-6 h-6" />,
      data: budgetData?.analysis || "",
      loading: budgetLoading,
      color: "neon-green"
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b-2 border-neon-pink pb-6">
          <h1 className="text-4xl font-bold neon-text-pink mb-2">
            AI FINANCIAL ADVISOR
          </h1>
          <p className="text-neon-cyan text-sm uppercase tracking-widest">
            Personalized insights powered by artificial intelligence
          </p>
        </div>

        {/* Insight Selector */}
        <div className="card-neon p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(Object.keys(insights) as InsightType[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveInsight(key)}
                className={`p-4 border-2 transition-all ${
                  activeInsight === key
                    ? 'btn-neon border-neon-pink'
                    : 'border-neon-cyan/30 text-neon-cyan hover:border-neon-cyan'
                }`}
              >
                <div className="flex items-center gap-2 justify-center mb-2">
                  {insights[key].icon}
                </div>
                <div className="text-sm font-bold uppercase tracking-wider">
                  {insights[key].title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Insight Display */}
        <div className="card-neon p-8 min-h-96">
          {insights[activeInsight].loading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <Loader2 className="w-12 h-12 text-neon-cyan animate-spin" />
              <p className="text-neon-cyan uppercase tracking-widest">
                Analyzing your financial data...
              </p>
            </div>
          ) : insights[activeInsight].data ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold neon-text-pink mb-6">
                {insights[activeInsight].title}
              </h2>
              <div className="prose prose-invert max-w-none">
                <Streamdown>
                  {insights[activeInsight].data}
                </Streamdown>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <Zap className="w-12 h-12 text-neon-cyan opacity-50" />
              <p className="text-neon-cyan/70">
                No data available for this insight yet. Add more transactions to get started.
              </p>
            </div>
          )}
        </div>

        {/* All Insights Grid */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold neon-text-pink">All Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(insights) as InsightType[]).map((key) => (
              <div
                key={key}
                className={`card-neon p-6 cursor-pointer transition-all hover:shadow-lg ${
                  expandedInsight === key ? 'border-neon-pink' : ''
                }`}
                onClick={() => setExpandedInsight(expandedInsight === key ? null : key)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-neon-cyan">{insights[key].icon}</div>
                  <div className="flex-1">
                    <h4 className="text-neon-pink font-bold mb-1">
                      {insights[key].title}
                    </h4>
                    <p className="text-neon-cyan/70 text-sm">
                      {insights[key].loading ? "Loading..." : "Click to expand"}
                    </p>
                  </div>
                </div>

                {expandedInsight === key && (
                  <div className="mt-4 pt-4 border-t border-neon-cyan/20">
                    {insights[key].loading ? (
                      <div className="flex items-center gap-2 text-neon-cyan">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </div>
                    ) : insights[key].data ? (
                      <div className="prose prose-invert max-w-none text-sm">
                        <Streamdown>
                          {insights[key].data}
                        </Streamdown>
                      </div>
                    ) : (
                      <p className="text-neon-cyan/50 text-sm">No data available</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Info Section */}
        <div className="card-neon p-6 border-neon-cyan">
          <div className="flex items-start gap-4">
            <div className="text-neon-cyan text-2xl">🤖</div>
            <div>
              <h4 className="text-neon-pink font-bold mb-2">About AI Insights</h4>
              <p className="text-neon-cyan text-sm mb-3">
                Our AI financial advisor analyzes your transaction history, investment portfolio, and spending patterns to provide personalized recommendations. The insights are generated using advanced language models trained on financial data.
              </p>
              <ul className="text-neon-cyan text-sm space-y-1">
                <li>✓ Personalized to your financial situation</li>
                <li>✓ Updated based on your latest transactions</li>
                <li>✓ Actionable recommendations</li>
                <li>✓ Risk-aware suggestions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="card-neon-pink p-4 border-neon-pink text-sm">
          <p className="text-neon-pink">
            ⚠️ <strong>Disclaimer:</strong> These insights are for informational purposes only and should not be considered professional financial advice. Please consult with a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
