import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Log from "@/pages/log";
import Cards from "@/pages/cards";
import Settings from "@/pages/settings";
import FloatingNav from "@/components/floating-nav";

function Router() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, hsl(207, 100%, 50%) 0%, transparent 50%), 
              radial-gradient(circle at 75% 75%, hsl(207, 100%, 54%) 0%, transparent 50%)
            `
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pb-24">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/log" component={Log} />
          <Route path="/cards" component={Cards} />
          <Route path="/settings" component={Settings} />
        </Switch>
      </div>

      {/* Floating Navigation */}
      <FloatingNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
