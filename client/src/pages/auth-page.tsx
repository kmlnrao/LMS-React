import { useLocation, Redirect } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Footer } from "@/components/layout/footer";
import suvarnaLogo from "../assets/suvarna_logo.png";

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, loginMutation } = useAuth();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        // Force navigation to dashboard
        window.location.href = "/";
      },
    });
  };

  // Redirect to home if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="container grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-6xl">
          {/* Authentication Form */}
          <div className="flex flex-col justify-center">
            <Card>
              <CardHeader className="flex flex-col items-center space-y-2">
                <div className="w-64 mb-4">
                  <img src={suvarnaLogo} alt="Suvarna Technosoft Pvt Ltd" className="w-full" />
                </div>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Enter your credentials to access the laundry management system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter your username" 
                              autoComplete="username"
                              disabled={loginMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="password" 
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              disabled={loginMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full mt-4"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Log In"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground text-center">
                  New user? Please contact your administrator for access.
                </p>
                <div className="text-xs text-muted-foreground text-center border-t pt-2 mt-1">
                  <p>Sample Login:</p>
                  <p><strong>Username:</strong> admin</p>
                  <p><strong>Password:</strong> admin123</p>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          {/* Hero Section */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Hospital Laundry Management System
              </h1>
              <p className="text-muted-foreground max-w-[600px] text-base sm:text-lg">
                A comprehensive solution for managing hospital laundry operations efficiently and effectively
              </p>
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-start gap-2">
                <div className="rounded-full p-1 border bg-background">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="grid gap-0.5">
                  <h3 className="font-medium">Streamlined Workflow</h3>
                  <p className="text-sm text-muted-foreground">
                    Efficiently manage laundry tasks from collection to delivery
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="rounded-full p-1 border bg-background">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="grid gap-0.5">
                  <h3 className="font-medium">Inventory Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Track linen inventory, equipment usage, and resource allocation
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="rounded-full p-1 border bg-background">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="grid gap-0.5">
                  <h3 className="font-medium">Cost Allocation</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze and allocate costs to departments with detailed reporting
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="rounded-full p-1 border bg-background">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="grid gap-0.5">
                  <h3 className="font-medium">HMS Integration</h3>
                  <p className="text-sm text-muted-foreground">
                    Seamlessly integrates with your existing Hospital Management System
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}