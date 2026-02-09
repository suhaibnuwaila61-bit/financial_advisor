import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { ArrowRight, TrendingUp, Target, Wallet, BarChart3, Zap, MessageSquare, Upload, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Demo() {
  const [, navigate] = useLocation();
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  const features = [
    {
      id: "dashboard",
      icon: "📊",
      title: "Financial Dashboard",
      description: "Real-time overview of your net worth, assets, and liabilities",
      details: "View comprehensive financial summaries including total income, expenses, savings, and investment portfolio values all in one place."
    },
    {
      id: "transactions",
      icon: "💳",
      title: "Transaction Management",
      description: "Track income, expenses, and categorize every transaction",
      details: "Add transactions with detailed categorization, dates, and descriptions. View transaction history with filtering and search capabilities."
    },
    {
      id: "ai-chat",
      icon: "🤖",
      title: "AI Financial Assistant",
      description: "Chat with AI about your finances, upload receipts, get automatic categorization",
      details: "Send photos of receipts or describe transactions naturally. The AI understands complex financial conversations and automatically creates entries."
    },
    {
      id: "savings",
      icon: "🎯",
      title: "Savings Goals",
      description: "Set financial targets and track progress toward your goals",
      details: "Create multiple savings goals with target amounts and deadlines. Monitor progress and get motivated with visual tracking."
    },
    {
      id: "investments",
      icon: "📈",
      title: "Investment Portfolio",
      description: "Manage stocks, crypto, and other investments",
      details: "Track investment performance, add new investments, and monitor your portfolio value in real-time."
    },
    {
      id: "budgets",
      icon: "💰",
      title: "Budget Planning",
      description: "Set spending limits and monitor category budgets",
      details: "Create budgets for different spending categories and track how much you've spent against your limits."
    },
    {
      id: "lending",
      icon: "🤝",
      title: "Lending & Borrowing",
      description: "Track money you've lent to others or borrowed",
      details: "Keep track of loans and borrowed money with details about amounts, dates, and status."
    },
    {
      id: "advisor",
      icon: "💡",
      title: "Financial Advisor",
      description: "Get personalized financial insights and recommendations",
      details: "Receive AI-powered financial advice based on your spending patterns and financial goals."
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="border-b border-neon-pink/30 backdrop-blur-sm sticky top-0 z-50">
          <div className="container py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="text-2xl">⚡</div>
              <h1 className="text-xl font-bold neon-text-pink">FINANCIAL NEXUS</h1>
            </div>
            <div className="flex gap-4">
              <a href={getLoginUrl()} className="btn-neon-cyan px-6 py-2 text-sm">
                Sign In
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="neon-text-pink">EXPLORE</span>
                <br />
                <span className="neon-text">POWERFUL FEATURES</span>
              </h2>
              <p className="text-lg text-neon-cyan/80 leading-relaxed">
                Discover how Financial Nexus helps you take complete control of your finances with AI-powered insights, real-time tracking, and intelligent automation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href={getLoginUrl()}
                className="btn-neon flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                Try It Now
                <ArrowRight className="w-5 h-5" />
              </a>
              <button className="btn-neon-cyan flex items-center justify-center gap-2 text-lg px-8 py-4">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container py-20 border-t border-neon-pink/30">
          <h3 className="text-4xl font-bold neon-text-pink mb-12 text-center">
            CORE FEATURES
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="card-neon p-6 cursor-pointer hover:shadow-lg transition-all duration-300 group"
                onClick={() => setExpandedFeature(expandedFeature === feature.id ? null : feature.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <ChevronDown
                    className={`w-5 h-5 text-neon-cyan transition-transform ${
                      expandedFeature === feature.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
                <h4 className="text-neon-pink font-bold mb-2 text-lg">{feature.title}</h4>
                <p className="text-neon-cyan/80 text-sm mb-4">{feature.description}</p>

                {expandedFeature === feature.id && (
                  <div className="pt-4 border-t border-neon-cyan/20 mt-4">
                    <p className="text-neon-cyan/70 text-sm leading-relaxed">{feature.details}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* AI Chat Highlight */}
        <section className="container py-20 border-t border-neon-pink/30">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-4xl font-bold neon-text-pink">
                Meet Your AI Financial Assistant
              </h3>
              <p className="text-neon-cyan/80 text-lg leading-relaxed">
                Our AI assistant understands natural language and can help you manage your finances conversationally. Simply tell it about your financial situation, upload receipt photos, and it handles the rest.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <MessageSquare className="w-6 h-6 text-neon-green flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-neon-pink mb-1">Natural Conversations</h4>
                    <p className="text-neon-cyan/70 text-sm">Talk about your savings goals, investments, and expenses naturally</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Upload className="w-6 h-6 text-neon-green flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-neon-pink mb-1">Receipt Upload</h4>
                    <p className="text-neon-cyan/70 text-sm">Send photos of receipts and the AI automatically categorizes transactions</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-neon-green flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-neon-pink mb-1">Auto-Creation</h4>
                    <p className="text-neon-cyan/70 text-sm">Transactions are automatically created based on your descriptions</p>
                  </div>
                </div>
              </div>

              <a
                href={getLoginUrl()}
                className="btn-neon inline-flex items-center gap-2 text-lg px-8 py-4 mt-4"
              >
                Try AI Assistant
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>

            <div className="card-neon p-8 space-y-4">
              <div className="bg-neon-cyan/10 rounded-lg p-4 border border-neon-cyan/20">
                <p className="text-neon-cyan text-sm mb-2">💬 You:</p>
                <p className="text-foreground">"I earned $5000 this month and want to save $1000 for vacation"</p>
              </div>

              <div className="bg-neon-pink/10 rounded-lg p-4 border border-neon-pink/20">
                <p className="text-neon-pink text-sm mb-2">🤖 AI:</p>
                <p className="text-foreground text-sm">Great! I've recorded your $5000 income. I'm creating a savings goal for your vacation with a $1000 target. Would you like me to set a deadline for this goal?</p>
              </div>

              <div className="bg-neon-cyan/10 rounded-lg p-4 border border-neon-cyan/20">
                <p className="text-neon-cyan text-sm mb-2">📸 You:</p>
                <p className="text-foreground text-sm">[Uploads receipt image]</p>
                <p className="text-foreground text-sm">This is my grocery shopping receipt</p>
              </div>

              <div className="bg-neon-pink/10 rounded-lg p-4 border border-neon-pink/20">
                <p className="text-neon-pink text-sm mb-2">🤖 AI:</p>
                <p className="text-foreground text-sm">✅ I've categorized this as a grocery expense for $125.50 and added it to your transactions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="container py-20 border-t border-neon-pink/30">
          <h3 className="text-4xl font-bold neon-text-pink mb-12 text-center">
            COMPREHENSIVE DASHBOARD
          </h3>

          <div className="card-neon p-8 space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-neon-cyan/10 rounded-lg p-6 border border-neon-cyan/20">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-neon-green" />
                  <span className="text-neon-cyan text-sm font-bold">NET WORTH</span>
                </div>
                <div className="text-3xl font-bold text-neon-pink">$47,250</div>
                <div className="text-neon-cyan/70 text-xs mt-2">+5.2% this month</div>
              </div>

              <div className="bg-neon-pink/10 rounded-lg p-6 border border-neon-pink/20">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-5 h-5 text-neon-green" />
                  <span className="text-neon-pink text-sm font-bold">TOTAL INCOME</span>
                </div>
                <div className="text-3xl font-bold text-neon-green">$10,000</div>
                <div className="text-neon-cyan/70 text-xs mt-2">This month</div>
              </div>

              <div className="bg-neon-green/10 rounded-lg p-6 border border-neon-green/20">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet className="w-5 h-5 text-neon-pink" />
                  <span className="text-neon-green text-sm font-bold">EXPENSES</span>
                </div>
                <div className="text-3xl font-bold text-neon-cyan">$3,200</div>
                <div className="text-neon-cyan/70 text-xs mt-2">This month</div>
              </div>

              <div className="bg-neon-purple/10 rounded-lg p-6 border border-neon-purple/20">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-5 h-5 text-neon-cyan" />
                  <span className="text-neon-purple text-sm font-bold">SAVINGS</span>
                </div>
                <div className="text-3xl font-bold text-neon-purple">$12,500</div>
                <div className="text-neon-cyan/70 text-xs mt-2">Accumulated</div>
              </div>
            </div>

            {/* Asset Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-neon-cyan/20">
              <div>
                <h4 className="text-neon-pink font-bold mb-4">TOTAL ASSETS</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neon-cyan/70">Income</span>
                    <span className="text-neon-green font-bold">$10,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neon-cyan/70">Savings</span>
                    <span className="text-neon-green font-bold">$12,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neon-cyan/70">Investments</span>
                    <span className="text-neon-green font-bold">$24,750</span>
                  </div>
                  <div className="border-t border-neon-cyan/20 pt-3 flex justify-between items-center">
                    <span className="text-neon-pink font-bold">Total</span>
                    <span className="text-neon-pink font-bold text-lg">$47,250</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-neon-pink font-bold mb-4">TOTAL LIABILITIES</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neon-cyan/70">Expenses</span>
                    <span className="text-neon-cyan font-bold">$3,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neon-cyan/70">Money Borrowed</span>
                    <span className="text-neon-cyan font-bold">$0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neon-cyan/70">Loans</span>
                    <span className="text-neon-cyan font-bold">$0</span>
                  </div>
                  <div className="border-t border-neon-cyan/20 pt-3 flex justify-between items-center">
                    <span className="text-neon-pink font-bold">Total</span>
                    <span className="text-neon-pink font-bold text-lg">$3,200</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="container py-20 border-t border-neon-pink/30">
          <div className="card-neon p-12 text-center space-y-6">
            <h3 className="text-4xl font-bold neon-text-pink">
              Ready to Transform Your Finances?
            </h3>
            <p className="text-neon-cyan/80 text-lg max-w-2xl mx-auto">
              Join thousands of users managing their finances with Financial Nexus. Start tracking, analyzing, and optimizing your financial life today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href={getLoginUrl()}
                className="btn-neon flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </a>
              <button
                onClick={() => navigate("/")}
                className="btn-neon-cyan flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                Back to Home
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-neon-pink/30 py-8 mt-auto">
          <div className="container flex items-center justify-between text-neon-cyan/50 text-sm">
            <div>© 2026 Financial Nexus. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-neon-cyan transition-colors">Privacy</a>
              <a href="#" className="hover:text-neon-cyan transition-colors">Terms</a>
              <a href="#" className="hover:text-neon-cyan transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
