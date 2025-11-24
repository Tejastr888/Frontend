/// <reference types="vite/client" />
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AUTH_SERVICE_URL, registerUser } from "@/api/auth";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { useAuth } from "../store/auth";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().optional(),
  role: z.enum(["USER", "CLUB"]),
});

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const setAuth = useAuth((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // default role USER
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      role: "USER",
    },
  });

  // local selectedRole used for UI; keep in sync with form
  const selectedRole = form.watch("role");

  useEffect(() => {
    // ensure form has role set (in case default changes later)
    if (!form.getValues("role")) form.setValue("role", "USER");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleRoleChange(role: "USER" | "CLUB") {
    form.setValue("role", role, { shouldValidate: true, shouldDirty: true });
  }

  async function onSubmit(values: FormData) {
    try {
      setIsLoading(true);
      const response = await registerUser(values);
      setAuth(response);
      navigate("/");
      toast({
        title: "Success",
        description: "Your account has been created successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description:
          error?.response?.data?.message ||
          "Please try again with different credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container grid h-screen w-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="absolute right-4 top-4 md:right-8 md:top-8">
        <ThemeToggle />
      </div>

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Icons.command className="mr-2 h-6 w-6" /> SportsChaos
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Join our community and discover amazing sports venues near you."
            </p>
            <footer className="text-sm">SportsChaos Team</footer>
          </blockquote>
        </div>
      </div>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your details below to create your account
            </p>
          </div>

          {/* Role Toggle (binds to form.role via handleRoleChange) */}
          <div className="space-y-3">
            <label className="text-sm font-medium">I want to register as</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange("USER")}
                aria-pressed={selectedRole === "USER"}
                className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-left transition-all focus:outline-none ${
                  selectedRole === "USER"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="text-3xl">🏃‍♂️</div>
                <div className="text-center">
                  <div className="font-semibold">User</div>
                  <div className="text-xs text-muted-foreground">
                    Book sports venues
                  </div>
                </div>
                {selectedRole === "USER" && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("CLUB")}
                aria-pressed={selectedRole === "CLUB"}
                className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-left transition-all focus:outline-none ${
                  selectedRole === "CLUB"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="text-3xl">🏢</div>
                <div className="text-center">
                  <div className="font-semibold">Club</div>
                  <div className="text-xs text-muted-foreground">
                    List your venues
                  </div>
                </div>
                {selectedRole === "CLUB" && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            </div>
            {/* validation message for role if any */}
            <div className="h-4">
              {form.formState.errors.role && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <PhoneInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hidden field is not necessary because the FormField for role is handled by the toggle above.
                  But we still include an invisible FormField to keep validation & react-hook-form aware. */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => <input type="hidden" {...field} />}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => {
              window.location.href = `${AUTH_SERVICE_URL}/oauth2/authorization/google`;
            }}
            className="w-full"
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
