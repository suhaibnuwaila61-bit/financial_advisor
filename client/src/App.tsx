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
import Demo from "@/pages/Demo";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

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
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
