import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Shield, 
  Award, 
  Zap, 
  Eye, 
  EyeOff,
  Rocket,
  Star,
  Globe,
  Code,
  Cpu,
  Brain,
  Lock,
  CheckCircle
} from "lucide-react";
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

  const floatingParticles = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60"
      initial={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }}
      transition={{
        duration: Math.random() * 10 + 20,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear",
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Primary animated blobs */}
        <motion.div
          className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-emerald-500/25 to-teal-500/25 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, -180, -360],
            x: [-100, 100, -100],
            y: [50, -50, 50],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating particles */}
        {floatingParticles}
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen">
          {/* Hero Section - Completely Redesigned */}
          <motion.div 
            className="text-white space-y-10"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {/* Main Title with Animation */}
            <div className="space-y-6">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
              >
                <h1 className="text-7xl xl:text-8xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 leading-tight">
                  MARKSEET
                </h1>
                <motion.div 
                  className="flex items-center space-x-3 mb-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <div className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full">
                    <span className="text-sm font-bold text-white">PRO</span>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Rocket className="h-8 w-8 text-cyan-400" />
                  </motion.div>
                  <span className="text-xl font-bold text-cyan-400">Next-Gen Platform</span>
                </motion.div>
              </motion.div>
              
              <motion.p 
                className="text-2xl text-slate-200 leading-relaxed font-light"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                Revolutionary AI-Powered School Management System with 
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold"> Advanced Analytics</span> and 
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold"> Smart Automation</span>
              </motion.p>
            </div>

            {/* Feature Grid - Modern Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
            >
              {[
                { 
                  icon: Brain, 
                  title: "AI Analytics", 
                  desc: "Smart insights & predictions", 
                  gradient: "from-cyan-500 to-blue-600",
                  bgGradient: "from-cyan-500/20 to-blue-500/20"
                },
                { 
                  icon: Rocket, 
                  title: "Performance Boost", 
                  desc: "10x faster operations", 
                  gradient: "from-purple-500 to-pink-600",
                  bgGradient: "from-purple-500/20 to-pink-500/20"
                },
                { 
                  icon: Shield, 
                  title: "Bank-Level Security", 
                  desc: "Military-grade encryption", 
                  gradient: "from-emerald-500 to-teal-600",
                  bgGradient: "from-emerald-500/20 to-teal-500/20"
                },
                { 
                  icon: Globe, 
                  title: "Global Access", 
                  desc: "Cloud-based anywhere", 
                  gradient: "from-orange-500 to-red-600",
                  bgGradient: "from-orange-500/20 to-red-500/20"
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className={`group relative p-6 rounded-2xl bg-gradient-to-br ${feature.bgGradient} backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-500`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{feature.title}</h3>
                      <p className="text-slate-300">{feature.desc}</p>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                </motion.div>
              ))}
            </motion.div>

            {/* Stats Section */}
            <motion.div
              className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.8 }}
            >
              {[
                { number: "99.9%", label: "Uptime" },
                { number: "10k+", label: "Schools" },
                { number: "1M+", label: "Students" },
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.8 + index * 0.1, type: "spring", stiffness: 150 }}
                >
                  <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Auth Form - Completely New Design */}
          <motion.div 
            className="w-full max-w-lg mx-auto"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <motion.div
              className="relative backdrop-blur-2xl bg-white/10 border border-white/30 rounded-3xl shadow-2xl overflow-hidden"
              whileHover={{ boxShadow: "0 35px 60px -12px rgba(0, 0, 0, 0.4)" }}
              transition={{ duration: 0.4 }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
              
              {/* Animated border */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: "linear-gradient(45deg, #06b6d4, #3b82f6, #8b5cf6, #ec4899, #06b6d4)",
                  backgroundSize: "300% 300%",
                }}
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="absolute inset-[2px] rounded-3xl bg-slate-950/90 backdrop-blur-2xl" />
              </motion.div>

              <Card className="bg-transparent border-none relative z-10">
                <CardHeader className="text-center pb-6 pt-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <GraduationCap className="h-10 w-10 text-white" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-white text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-slate-300 mt-3 text-lg">
                    Access your premium education management suite
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-2 px-8 pb-8">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-1 mb-8">
                      <TabsTrigger 
                        value="login" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-slate-400 font-bold transition-all duration-300 rounded-lg py-3"
                      >
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Sign In
                        </motion.span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="register" 
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white text-slate-400 font-bold transition-all duration-300 rounded-lg py-3"
                      >
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Register
                        </motion.span>
                      </TabsTrigger>
                    </TabsList>
                  
                    <AnimatePresence mode="wait">
                      <TabsContent value="login" className="mt-0">
                        <motion.form 
                          onSubmit={handleLogin} 
                          className="space-y-6"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ duration: 0.4 }}
                        >
                          <motion.div className="space-y-3">
                            <Label htmlFor="username" className="text-white font-semibold text-lg">Username</Label>
                            <motion.div
                              whileFocus={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                              className="relative"
                            >
                              <Input
                                id="username"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-14 rounded-xl backdrop-blur-sm focus:bg-slate-700/50 focus:border-cyan-400 transition-all duration-300 text-lg pl-4"
                                placeholder="Enter your username"
                                required
                              />
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </motion.div>
                          </motion.div>
                          
                          <motion.div className="space-y-3">
                            <Label htmlFor="password" className="text-white font-semibold text-lg">Password</Label>
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
                                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-14 rounded-xl backdrop-blur-sm focus:bg-slate-700/50 focus:border-cyan-400 transition-all duration-300 text-lg pl-4 pr-14"
                                placeholder="Enter your password"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </motion.div>
                              </Button>
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </motion.div>
                          </motion.div>
                          
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="pt-4"
                          >
                            <Button 
                              type="submit" 
                              className="w-full h-14 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 text-lg relative overflow-hidden"
                              disabled={loginMutation.isPending}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                              {loginMutation.isPending ? (
                                <motion.div
                                  className="flex items-center"
                                  animate={{ scale: [1, 1.1, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <Sparkles className="h-6 w-6 mr-2" />
                                  Signing in...
                                </motion.div>
                              ) : (
                                <div className="flex items-center">
                                  <Zap className="h-6 w-6 mr-2" />
                                  Sign In to Dashboard
                                </div>
                              )}
                            </Button>
                          </motion.div>
                        </motion.form>
                      </TabsContent>
                  
                      <TabsContent value="register" className="mt-0">
                        <motion.form 
                          onSubmit={handleRegister} 
                          className="space-y-5"
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <motion.div className="space-y-2">
                              <Label htmlFor="firstName" className="text-white font-semibold">First Name</Label>
                              <Input
                                id="firstName"
                                value={registerForm.firstName}
                                onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12 rounded-xl backdrop-blur-sm focus:bg-slate-700/50 focus:border-purple-400 transition-all duration-300"
                                placeholder="First name"
                                required
                              />
                            </motion.div>
                            <motion.div className="space-y-2">
                              <Label htmlFor="lastName" className="text-white font-semibold">Last Name</Label>
                              <Input
                                id="lastName"
                                value={registerForm.lastName}
                                onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12 rounded-xl backdrop-blur-sm focus:bg-slate-700/50 focus:border-purple-400 transition-all duration-300"
                                placeholder="Last name"
                                required
                              />
                            </motion.div>
                          </div>
                          
                          <motion.div className="space-y-2">
                            <Label htmlFor="regUsername" className="text-white font-semibold">Username</Label>
                            <Input
                              id="regUsername"
                              value={registerForm.username}
                              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12 rounded-xl backdrop-blur-sm focus:bg-slate-700/50 focus:border-purple-400 transition-all duration-300"
                              placeholder="Choose a username"
                              required
                            />
                          </motion.div>
                          
                          <motion.div className="space-y-2">
                            <Label htmlFor="email" className="text-white font-semibold">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={registerForm.email}
                              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12 rounded-xl backdrop-blur-sm focus:bg-slate-700/50 focus:border-purple-400 transition-all duration-300"
                              placeholder="your.email@school.edu"
                              required
                            />
                          </motion.div>
                          
                          <motion.div className="space-y-2">
                            <Label htmlFor="schoolName" className="text-white font-semibold">School Name</Label>
                            <Input
                              id="schoolName"
                              value={registerForm.schoolName}
                              onChange={(e) => setRegisterForm({ ...registerForm, schoolName: e.target.value })}
                              className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12 rounded-xl backdrop-blur-sm focus:bg-slate-700/50 focus:border-purple-400 transition-all duration-300"
                              placeholder="Your school name"
                              required
                            />
                          </motion.div>
                          
                          <motion.div className="space-y-2">
                            <Label htmlFor="regPassword" className="text-white font-semibold">Password</Label>
                            <motion.div className="relative">
                              <Input
                                id="regPassword"
                                type={showRegPassword ? "text" : "password"}
                                value={registerForm.password}
                                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                className="bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 h-12 rounded-xl backdrop-blur-sm focus:bg-slate-700/50 focus:border-purple-400 transition-all duration-300 pr-12"
                                placeholder="Create a strong password"
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                              >
                                {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </motion.div>
                          </motion.div>
                          
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="pt-2"
                          >
                            <Button 
                              type="submit" 
                              className="w-full h-12 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden"
                              disabled={registerMutation.isPending}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                              {registerMutation.isPending ? (
                                <motion.div
                                  className="flex items-center"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Star className="h-5 w-5 mr-2" />
                                  Creating Account...
                                </motion.div>
                              ) : (
                                <div className="flex items-center">
                                  <Rocket className="h-5 w-5 mr-2" />
                                  Create Account
                                </div>
                              )}
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