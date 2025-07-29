import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Users, TrendingUp, Sparkles, Shield, Award, Zap, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Enhanced Hero Section */}
          <motion.div 
            className="text-white space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent mb-4">
                  MARKSEET PRO
                </h1>
                <motion.div
                  className="flex items-center space-x-2 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                  <span className="text-lg font-semibold text-yellow-400">Premium Edition</span>
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-xl text-purple-100 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Advanced School Management System with AI-Powered Analytics and Digital Transformation Tools
              </motion.p>
            </div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {[
                { icon: Users, title: "Smart Student Management", desc: "AI-powered student profiling and tracking", color: "from-blue-500 to-cyan-500" },
                { icon: BookOpen, title: "Advanced Exam System", desc: "Dynamic exam creation and management", color: "from-purple-500 to-pink-500" },
                { icon: TrendingUp, title: "Analytics Dashboard", desc: "Real-time performance insights", color: "from-emerald-500 to-teal-500" },
                { icon: Award, title: "Premium Certificates", desc: "Professional digital credentials", color: "from-orange-500 to-red-500" },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <motion.div 
                    className={`p-3 rounded-lg bg-gradient-to-br ${feature.color}`}
                    whileHover={{ rotate: 5 }}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-purple-200">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Premium Features Badge */}
            <motion.div
              className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <Shield className="h-8 w-8 text-yellow-400" />
              <div>
                <h4 className="font-bold text-yellow-400">Enterprise Security</h4>
                <p className="text-sm text-yellow-200">Bank-level encryption and data protection</p>
              </div>
              <Zap className="h-6 w-6 text-yellow-400 ml-auto" />
            </motion.div>
          </motion.div>

          {/* Enhanced Auth Form */}
          <motion.div 
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
              whileHover={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <Card className="bg-transparent border-none relative z-10">
                <CardHeader className="text-center pb-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-white text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-purple-100 mt-2">
                    Access your premium school management suite
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1">
                      <TabsTrigger 
                        value="login" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-white/70 font-medium transition-all duration-300"
                      >
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger 
                        value="register" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/70 font-medium transition-all duration-300"
                      >
                        Register
                      </TabsTrigger>
                    </TabsList>
                  
                    <AnimatePresence mode="wait">
                      <TabsContent value="login" className="mt-6">
                        <motion.form 
                          onSubmit={handleLogin} 
                          className="space-y-5"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div className="space-y-2">
                            <Label htmlFor="username" className="text-white font-medium">Username</Label>
                            <motion.div
                              whileFocus={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id="username"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 h-12 rounded-lg backdrop-blur-sm focus:bg-white/10 focus:border-purple-400 transition-all duration-300"
                                placeholder="Enter your username"
                                required
                              />
                            </motion.div>
                          </motion.div>
                          <motion.div className="space-y-2">
                            <Label htmlFor="password" className="text-white font-medium">Password</Label>
                            <motion.div
                              className="relative"
                              whileFocus={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 h-12 rounded-lg backdrop-blur-sm focus:bg-white/10 focus:border-purple-400 transition-all duration-300 pr-12"
                                placeholder="Enter your password"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </motion.div>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              type="submit" 
                              className="w-full h-12 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                              disabled={loginMutation.isPending}
                            >
                              {loginMutation.isPending ? (
                                <motion.div
                                  className="flex items-center"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Sparkles className="h-5 w-5 mr-2" />
                                </motion.div>
                              ) : (
                                <Zap className="h-5 w-5 mr-2" />
                              )}
                              {loginMutation.isPending ? "Signing in..." : "Sign In"}
                            </Button>
                          </motion.div>
                        </motion.form>
                      </TabsContent>
                  
                      <TabsContent value="register" className="mt-6">
                        <motion.form 
                          onSubmit={handleRegister} 
                          className="space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <motion.div className="space-y-2">
                              <Label htmlFor="firstName" className="text-white font-medium">First Name</Label>
                              <Input
                                id="firstName"
                                value={registerForm.firstName}
                                onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 h-10 rounded-lg backdrop-blur-sm focus:bg-white/10 focus:border-blue-400 transition-all duration-300"
                                placeholder="First name"
                              />
                            </motion.div>
                            <motion.div className="space-y-2">
                              <Label htmlFor="lastName" className="text-white font-medium">Last Name</Label>
                              <Input
                                id="lastName"
                                value={registerForm.lastName}
                                onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 h-10 rounded-lg backdrop-blur-sm focus:bg-white/10 focus:border-blue-400 transition-all duration-300"
                                placeholder="Last name"
                              />
                            </motion.div>
                          </div>
                          <motion.div className="space-y-2">
                            <Label htmlFor="email" className="text-white font-medium">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={registerForm.email}
                              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 h-10 rounded-lg backdrop-blur-sm focus:bg-white/10 focus:border-blue-400 transition-all duration-300"
                              placeholder="Email address"
                            />
                          </motion.div>
                          <motion.div className="space-y-2">
                            <Label htmlFor="schoolName" className="text-white font-medium">School Name</Label>
                            <Input
                              id="schoolName"
                              value={registerForm.schoolName}
                              onChange={(e) => setRegisterForm({ ...registerForm, schoolName: e.target.value })}
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 h-10 rounded-lg backdrop-blur-sm focus:bg-white/10 focus:border-blue-400 transition-all duration-300"
                              placeholder="Your school name"
                            />
                          </motion.div>
                          <motion.div className="space-y-2">
                            <Label htmlFor="regUsername" className="text-white font-medium">Username</Label>
                            <Input
                              id="regUsername"
                              value={registerForm.username}
                              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 h-10 rounded-lg backdrop-blur-sm focus:bg-white/10 focus:border-blue-400 transition-all duration-300"
                              placeholder="Choose a username"
                              required
                            />
                          </motion.div>
                          <motion.div className="space-y-2">
                            <Label htmlFor="regPassword" className="text-white font-medium">Password</Label>
                            <motion.div
                              className="relative"
                              whileFocus={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id="regPassword"
                                type={showRegPassword ? "text" : "password"}
                                value={registerForm.password}
                                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 h-10 rounded-lg backdrop-blur-sm focus:bg-white/10 focus:border-blue-400 transition-all duration-300 pr-12"
                                placeholder="Create a password"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                              >
                                {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </motion.div>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              type="submit" 
                              className="w-full h-12 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                              disabled={registerMutation.isPending}
                            >
                              {registerMutation.isPending ? (
                                <motion.div
                                  className="flex items-center"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Sparkles className="h-5 w-5 mr-2" />
                                </motion.div>
                              ) : (
                                <Award className="h-5 w-5 mr-2" />
                              )}
                              {registerMutation.isPending ? "Creating account..." : "Create Account"}
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