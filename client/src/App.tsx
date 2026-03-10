import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Investments from "@/pages/Investments";
import SavingsGoals from "@/pages/SavingsGoals";
import Budgets from "@/pages/Budgets";
import Advisor from "@/pages/Advisor";
import Lendings from "@/pages/Lendings";
import AIChat from "@/pages/AIChat";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Demo from "@/pages/Demo";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/demo"} component={Demo} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/transactions"} component={Transactions} />
      <Route path={"/investments"} component={Investments} />
      <Route path={"/savings-goals"} component={SavingsGoals} />
      <Route path={"/budgets"} component={Budgets} />
      <Route path={"/advisor"} component={Advisor} />
      <Route path={"/lendings"} component={Lendings} />
      <Route path={"/ai-chat"} component={AIChat} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/404"} component={NotFound} />      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { language } = useLanguage();

  useEffect(() => {
    if (language === "ar") {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    } else {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    }
  }, [language]);

  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
