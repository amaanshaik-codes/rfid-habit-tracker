import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", icon: "fas fa-home", label: "Home" },
  { path: "/dashboard", icon: "fas fa-chart-bar", label: "Dashboard" },
  { path: "/log", icon: "fas fa-list", label: "Log" },
  { path: "/cards", icon: "fas fa-credit-card", label: "Cards" },
  { path: "/settings", icon: "fas fa-cog", label: "Settings" },
];

export default function FloatingNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-strong rounded-2xl px-6 py-3">
        <div className="flex items-center space-x-8">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={`p-0 h-auto w-auto hover:bg-transparent ${
                  isActive ? "text-ios-blue" : "text-white/70 hover:text-white"
                }`}
                onClick={() => setLocation(item.path)}
              >
                <i className={`${item.icon} text-lg`}></i>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
