import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Eye, EyeOff, Loader2, UserPlus, LogIn } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    schoolName: "",
  });

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center p-4">
      {/* Simple animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200/30 dark:bg-indigo-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-200/30 dark:bg-cyan-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Simple hero section */}
        <motion.div 
          className="text-center lg:text-left space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="space-y-4">
            <motion.h1 
              className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              MARKSEET
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent"> PRO</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Modern school management system with smart features and beautiful design
            </motion.p>
          </div>

          {/* Simple feature list */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {[
              "Student Management",
              "Exam & Marks System", 
              "Digital Certificates",
              "Analytics Dashboard"
            ].map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                <span className="text-gray-700 dark:text-gray-200">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right side - Clean auth form */}
        <motion.div 
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-0 shadow-xl dark:shadow-2xl">
              <CardHeader className="text-center space-y-4">
                <motion.div
                  className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                >
                  <GraduationCap className="h-8 w-8 text-white" />
                </motion.div>
                
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Welcome</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300">
                    Sign in to your account
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-slate-700">
                    <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 text-gray-700 dark:text-gray-200">
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger value="register" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 text-gray-700 dark:text-gray-200">
                      Register
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <TabsContent value="login" className="mt-6" key="login">
                      <motion.form 
                        onSubmit={handleLogin}
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-gray-700 dark:text-gray-200">Username</Label>
                          <Input
                            id="username"
                            value={loginForm.username}
                            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                            className="h-11 border-gray-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                            placeholder="Enter username"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                              className="h-11 border-gray-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 pr-10"
                              placeholder="Enter password"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <LogIn className="h-4 w-4 mr-2" />
                            )}
                            {loginMutation.isPending ? "Signing in..." : "Sign In"}
                          </Button>
                        </motion.div>
                      </motion.form>
                    </TabsContent>

                    <TabsContent value="register" className="mt-6" key="register">
                      <motion.form 
                        onSubmit={handleRegister}
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                            <Input
                              id="firstName"
                              value={registerForm.firstName}
                              onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                              className="h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="First name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                            <Input
                              id="lastName"
                              value={registerForm.lastName}
                              onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                              className="h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                              placeholder="Last name"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="regUsername" className="text-gray-700">Username</Label>
                          <Input
                            id="regUsername"
                            value={registerForm.username}
                            onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                            className="h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Choose username"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-gray-700">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                            className="h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="your.email@school.edu"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="schoolName" className="text-gray-700">School Name</Label>
                          <Input
                            id="schoolName"
                            value={registerForm.schoolName}
                            onChange={(e) => setRegisterForm({ ...registerForm, schoolName: e.target.value })}
                            className="h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Your school name"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="regPassword" className="text-gray-700">Password</Label>
                          <div className="relative">
                            <Input
                              id="regPassword"
                              type={showRegPassword ? "text" : "password"}
                              value={registerForm.password}
                              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                              className="h-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 pr-10"
                              placeholder="Create password"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                            >
                              {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <UserPlus className="h-4 w-4 mr-2" />
                            )}
                            {registerMutation.isPending ? "Creating..." : "Create Account"}
                          </Button>
                        </motion.div>
                      </motion.form>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}