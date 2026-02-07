import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { ArrowRight, TrendingUp, Zap, Target, Wallet } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-neon-cyan mb-4 glow-animate">⚡</div>
          <p className="text-neon-cyan uppercase tracking-widest">Initializing Financial Nexus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden scan-effect">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="border-b-2 border-neon-pink/30 backdrop-blur-sm">
          <div className="container py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚡</div>
              <h1 className="text-2xl font-bold neon-text-pink">FINANCIAL NEXUS</h1>
            </div>
            {isAuthenticated && user ? (
              <Button
                onClick={() => navigate("/dashboard")}
                className="btn-neon-cyan"
              >
                Go to Dashboard
              </Button>
            ) : (
              <a href={getLoginUrl()} className="btn-neon-cyan">
                Sign In
              </a>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 container py-20 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            <div>
              <h2 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="neon-text-pink">COMMAND</span>
                <br />
                <span className="neon-text">YOUR WEALTH</span>
              </h2>
              <p className="text-lg text-neon-cyan/80 leading-relaxed max-w-lg">
                Take control of your financial future with AI-powered insights, real-time market data, and comprehensive portfolio management. Your personal financial command center awaits.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href={getLoginUrl()}
                className="btn-neon flex items-center justify-center gap-2 text-lg px-8 py-4"
              >
                Start Now
                <ArrowRight className="w-5 h-5" />
              </a>
              <button className="btn-neon-cyan flex items-center justify-center gap-2 text-lg px-8 py-4">
                Learn More
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 border-t border-neon-cyan/20">
              <p className="text-neon-cyan/70 text-sm uppercase tracking-widest mb-4">Trusted by financial enthusiasts</p>
              <div className="flex gap-6 text-neon-cyan/50">
                <div>🔒 Bank-Level Security</div>
                <div>📊 Real-Time Data</div>
                <div>🤖 AI Insights</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="flex-1 relative h-96 lg:h-full min-h-96">
            {/* Floating Cards */}
            <div className="absolute inset-0 perspective">
              {/* Card 1 */}
              <div className="absolute top-0 right-0 w-64 card-neon p-6 transform hover:scale-105 transition-transform duration-300 shadow-2xl"
                style={{
                  animation: 'float 6s ease-in-out infinite',
                }}>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-neon-green" />
                  <span className="text-neon-green font-bold">Portfolio</span>
                </div>
                <div className="text-3xl font-bold text-neon-pink mb-2">$47,250</div>
                <div className="text-neon-cyan text-sm">+12.5% this month</div>
              </div>

              {/* Card 2 */}
              <div className="absolute top-32 left-0 w-64 card-neon-pink p-6 transform hover:scale-105 transition-transform duration-300 shadow-2xl"
                style={{
                  animation: 'float 8s ease-in-out infinite 1s',
                }}>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-neon-purple" />
                  <span className="text-neon-pink font-bold">Goals</span>
                </div>
                <div className="text-3xl font-bold text-neon-cyan mb-2">$12,500</div>
                <div className="text-neon-pink text-sm">Savings accumulated</div>
              </div>

              {/* Card 3 */}
              <div className="absolute bottom-0 right-12 w-64 card-neon p-6 transform hover:scale-105 transition-transform duration-300 shadow-2xl"
                style={{
                  animation: 'float 7s ease-in-out infinite 2s',
                }}>
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="w-6 h-6 text-neon-cyan" />
                  <span className="text-neon-cyan font-bold">Budget</span>
                </div>
                <div className="text-3xl font-bold text-neon-green mb-2">$3,200</div>
                <div className="text-neon-cyan text-sm">Spent this month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t-2 border-neon-pink/30 py-20">
          <div className="container">
            <h3 className="text-4xl font-bold neon-text-pink mb-12 text-center">
              ADVANCED FEATURES
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "📊",
                  title: "Expense Tracking",
                  description: "Track daily, weekly, and monthly expenses with detailed categorization"
                },
                {
                  icon: "💼",
                  title: "Portfolio Management",
                  description: "Manage stocks, crypto, and other assets with real-time valuations"
                },
                {
                  icon: "🎯",
                  title: "Savings Goals",
                  description: "Set targets and visualize your progress toward financial milestones"
                },
                {
                  icon: "🤖",
                  title: "AI Advisor",
                  description: "Get personalized financial insights and investment recommendations"
                },
                {
                  icon: "📈",
                  title: "Market Data",
                  description: "Real-time stock prices and cryptocurrency rates"
                },
                {
                  icon: "🔔",
                  title: "Smart Alerts",
                  description: "Notifications for budget limits and portfolio changes"
                },
                {
                  icon: "💰",
                  title: "Budget Tools",
                  description: "Set spending limits and monitor category budgets"
                },
                {
                  icon: "📉",
                  title: "Analytics",
                  description: "Visualize trends and analyze your financial patterns"
                }
              ].map((feature, idx) => (
                <div key={idx} className="card-neon p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h4 className="text-neon-pink font-bold mb-2">{feature.title}</h4>
                  <p className="text-neon-cyan/80 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t-2 border-neon-pink/30 py-16">
          <div className="container text-center space-y-6">
            <h3 className="text-3xl font-bold neon-text-pink">Ready to Take Control?</h3>
            <p className="text-neon-cyan/80 max-w-2xl mx-auto">
              Join thousands of users who are managing their finances with Financial Nexus. Start your journey today.
            </p>
            <a
              href={getLoginUrl()}
              className="btn-neon-cyan inline-flex items-center gap-2 text-lg px-8 py-4"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>

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

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
