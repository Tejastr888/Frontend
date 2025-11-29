import { useAuth } from "@/store/auth";
import { Outlet } from "react-router-dom";
import { Icons } from "./ui/icons";
import { ProfileMenu } from "./profile-menu";

export default function DashboardLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-4 container mx-auto justify-between">
          <div className="flex items-center gap-2">
            <Icons.command className="h-6 w-6" />
            <h2 className="text-lg font-semibold">SportsChaos</h2>
          </div>

          <div className="flex items-center space-x-2">
            {user && <ProfileMenu />}
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-6">
        <Outlet />
      </main>
    </div>
  );
}
