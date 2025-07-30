import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Eye, EyeOff, Loader2, UserPlus, LogIn, Users, Award, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { FeatureCarousel } from '@/components/FeatureCarousel';

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

      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <GraduationCap className="text-white text-4xl" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              MARKSHEET PRO
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
              Complete School Management System with AI-Powered Analytics
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Feature Carousel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Powerful Features
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Everything you need to manage your school efficiently
              </p>
            </div>
            
            <FeatureCarousel />

            {/* Quick Feature Highlights */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Student Management</p>
              </div>
              
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">AI Assistant</p>
              </div>
              
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Certificates</p>
              </div>
            </div>
          </motion.div>

          {/* Right side - Auth form */}
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
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <GraduationCap className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Welcome Back
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      Sign in to your school management account
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      <TabsTrigger 
                        value="login" 
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger 
                        value="register"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 rounded-lg transition-all duration-200"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Register
                      </TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      <TabsContent value="login" className="space-y-4 mt-0">
                        <motion.form
                          key="login"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          onSubmit={handleLogin}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
                            <Input
                              id="username"
                              type="text"
                              placeholder="Enter your username"
                              value={loginForm.username}
                              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                              className="h-11 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                className="h-11 pr-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
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

                      <TabsContent value="register" className="space-y-4 mt-0">
                        <motion.form
                          key="register"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          onSubmit={handleRegister}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">First Name</Label>
                              <Input
                                id="firstName"
                                type="text"
                                placeholder="First name"
                                value={registerForm.firstName}
                                onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                                className="h-11 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                              <Input
                                id="lastName"
                                type="text"
                                placeholder="Last name"
                                value={registerForm.lastName}
                                onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                                className="h-11 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="schoolName" className="text-gray-700 dark:text-gray-300">School Name</Label>
                            <Input
                              id="schoolName"
                              type="text"
                              placeholder="Your school name"
                              value={registerForm.schoolName}
                              onChange={(e) => setRegisterForm({ ...registerForm, schoolName: e.target.value })}
                              className="h-11 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="your@email.com"
                              value={registerForm.email}
                              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                              className="h-11 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="regUsername" className="text-gray-700 dark:text-gray-300">Username</Label>
                            <Input
                              id="regUsername"
                              type="text"
                              placeholder="Choose a username"
                              value={registerForm.username}
                              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                              className="h-11 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="regPassword" className="text-gray-700 dark:text-gray-300">Password</Label>
                            <div className="relative">
                              <Input
                                id="regPassword"
                                type={showRegPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={registerForm.password}
                                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                className="h-11 pr-10 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                              >
                                {showRegPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
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
    </div>
  );
}