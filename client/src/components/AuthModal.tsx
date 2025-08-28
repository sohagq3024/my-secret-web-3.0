import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema, LoginData, insertUserSchema, InsertUser } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { MembershipModal } from "./MembershipModal";
import { Loader2, User, Lock, Mail, Phone, Calendar, UserPlus, LogIn } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser & { confirmPassword: string }>({
    resolver: zodResolver(insertUserSchema.extend({
      confirmPassword: insertUserSchema.shape.password,
    }).refine(
      (data) => data.password === data.confirmPassword,
      {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      }
    )),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      contactNumber: "",
    },
  });

  const onLoginSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();
      
      login(result.user, result.hasValidMembership);
      
      if (result.user.role === "admin") {
        setLocation("/admin");
      }
      
      onClose();
      toast({
        title: "Welcome back!",
        description: `Login successful, ${result.user.firstName}`,
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: InsertUser & { confirmPassword: string }) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = data;
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const result = await response.json();
      
      login(result.user, false);
      onClose();
      setShowMembership(true);
      
      toast({
        title: "Registration successful!",
        description: "Welcome to My Secret Web",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    onModeChange(mode === "login" ? "register" : "login");
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-sm cyber-border bg-gray-900/95 backdrop-blur-xl border border-green-500/30">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent neon-text">
              {mode === "login" ? (
                <div className="flex items-center justify-center space-x-2">
                  <LogIn className="w-6 h-6 text-green-400" />
                  <span>Welcome Back</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <UserPlus className="w-6 h-6 text-green-400" />
                  <span>Join My Secret Web</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {mode === "login" ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-green-300">Username or Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                          <Input 
                            {...field} 
                            className="cyber-input pl-10"
                            placeholder="Enter your username or email"
                          />
                        </div>
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
                      <FormLabel className="text-green-300">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                          <Input 
                            {...field} 
                            type="password"
                            className="cyber-input pl-10"
                            placeholder="Enter your password"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full cyber-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-green-300">First Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="cyber-input" placeholder="First name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-green-300">Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="cyber-input" placeholder="Last name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-green-300">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                          <Input {...field} className="cyber-input pl-10" placeholder="Choose a username" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-green-300">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                          <Input {...field} type="email" className="cyber-input pl-10" placeholder="your@email.com" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-green-300">Date of Birth</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                            <Input {...field} type="date" className="cyber-input pl-10" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-green-300">Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                            <Input {...field} className="cyber-input pl-10" placeholder="+1234567890" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-green-300">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                          <Input {...field} type="password" className="cyber-input pl-10" placeholder="Create a password" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-green-300">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-green-400" />
                          <Input {...field} type="password" className="cyber-input pl-10" placeholder="Confirm your password" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full cyber-button"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}

          <div className="pt-4 border-t border-green-500/30">
            <p className="text-center text-sm text-green-300">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={switchMode}
                className="text-green-400 hover:text-green-300 font-medium underline transition-colors"
              >
                {mode === "login" ? "Join now" : "Sign in"}
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <MembershipModal 
        isOpen={showMembership}
        onClose={() => setShowMembership(false)}
      />
    </>
  );
}