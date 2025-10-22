import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { Moon, Sun, LogOut } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Icons } from "./ui/icons";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="flex h-16 items-center px-4 container mx-auto">
          <div className="flex items-center gap-2">
            <Icons.command className="h-6 w-6" />
            <h2 className="text-lg font-semibold">SportsChaos</h2>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              <span className="hidden sm:inline">Welcome, </span>
              <span className="font-medium">{user?.name}</span>
              <span className="ml-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                {user?.role}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-6">
        <Outlet />
      </main>
    </div>
  );
}
