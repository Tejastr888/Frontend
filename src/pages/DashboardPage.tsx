import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/store/auth";
import { Moon, Sun } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="flex h-16 items-center px-4 container">
          <h2 className="text-lg font-semibold">SportsChaos</h2>
          <div className="ml-auto flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button onClick={() => logout()}>Logout</Button>
          </div>
        </div>
      </nav>
      <main className="container py-6">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-2">
          You are logged in as {user?.role}
        </p>
      </main>
    </div>
  );
}
