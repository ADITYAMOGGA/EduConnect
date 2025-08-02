import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Eye, EyeOff, Loader2, ArrowLeft, BookOpen } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function TeacherLogin() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const loginMutation = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      apiRequest("/api/teacher/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data: any) => {
      toast({ title: "Login successful", description: `Welcome ${data.teacher.name}!` });
      navigate("/teacher-dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-green-900 dark:to-teal-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-20 w-40 h-40 bg-green-300/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-60 h-60 bg-emerald-300/20 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10 grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Teacher Branding */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left space-y-6"
        >
          <div className="flex items-center justify-center lg:justify-start">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <BookOpen className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                TEACHER PORTAL
              </h1>
              <p className="text-slate-600 dark:text-slate-300">Subject Management Access</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
              Teaching Dashboard
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              Access your assigned subjects and students. Enter marks, view performance reports, and manage your teaching responsibilities efficiently.
            </p>
          </div>

          {/* Teacher Features */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Subject-Level Access</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">View assigned students & enter marks</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full lg:w-auto border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        {/* Right side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="border-green-200/50 dark:border-green-800/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Teacher Login
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Access your teaching dashboard and subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 dark:text-slate-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="teacher_username"
                    required
                    className="border-green-200 focus:border-green-400 dark:border-green-800 dark:focus:border-green-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                      className="border-green-200 focus:border-green-400 dark:border-green-800 dark:focus:border-green-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Access Teaching Dashboard"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}