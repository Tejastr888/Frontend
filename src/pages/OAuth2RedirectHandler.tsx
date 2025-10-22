import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      const userId = searchParams.get("userId");
      const email = searchParams.get("email");
      const name = searchParams.get("name");
      const role = searchParams.get("role");

      if (userId && email && name && role) {
        // Set auth state
        setAuth({
          token,
          type: "Bearer",
          userId: Number(userId),
          email,
          name,
          role,
        });

        toast({
          title: "Welcome!",
          description: `Successfully logged in as ${name}`,
        });

        // Redirect based on role
        navigate("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Missing user information from OAuth provider",
        });
        navigate("/login");
      }
    } else if (error) {
      toast({
        variant: "destructive",
        title: "OAuth2 Login Failed",
        description: error,
      });
      navigate("/login");
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate, setAuth, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Icons.spinner className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-lg text-muted-foreground">
          Completing your sign-in...
        </p>
      </div>
    </div>
  );
}
