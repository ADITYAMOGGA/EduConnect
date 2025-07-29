import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Eye, EyeOff, Loader2, UserPlus, LogIn, Sparkles, Star } from "lucide-react";
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

  // Complex particle system
  const particles = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"
      initial={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: 0,
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: Math.random() * 5 + 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2,
      }}
    />
  ));

  // Floating sparkles
  const sparkles = Array.from({ length: 15 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute"
      initial={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        rotate: [0, 360],
      }}
      transition={{
        duration: Math.random() * 8 + 12,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <Sparkles className="h-3 w-3 text-cyan-400/80" />
    </motion.div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Complex animated background system */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Morphing background blobs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 0.8, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            borderRadius: ["50%", "30%", "50%", "40%", "50%"],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 0.9, 1.4, 1],
            rotate: [360, 180, 0],
            x: [0, -80, 60, 0],
            y: [0, 80, -40, 0],
            borderRadius: ["50%", "60%", "30%", "50%"],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 0.7, 1.1, 1],
            rotate: [0, -90, -180, -270, -360],
            x: [-50, 50, -30, 30, -50],
            y: [-30, 30, -50, 50, -30],
            borderRadius: ["50%", "40%", "60%", "30%", "50%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Particle system */}
        {particles}
        
        {/* Floating sparkles */}
        {sparkles}

        {/* Animated grid */}
        <motion.div 
          className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:60px_60px]"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Enhanced hero section with complex animations */}
        <motion.div 
          className="text-center lg:text-left space-y-8"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="space-y-6">
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.h1 
                className="text-5xl lg:text-6xl font-bold text-white relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.span
                  animate={{
                    textShadow: [
                      "0 0 0px rgba(99,102,241,0)",
                      "0 0 20px rgba(99,102,241,0.3)",
                      "0 0 0px rgba(99,102,241,0)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  MARKSEET
                </motion.span>
                <motion.span 
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                > PRO</motion.span>
              </motion.h1>

              {/* Floating elements around title */}
              <motion.div
                className="absolute -top-4 -right-4"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 15, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Star className="h-6 w-6 text-cyan-400" />
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-2"
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -20, 20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
              </motion.div>
            </motion.div>
            
            <motion.p 
              className="text-xl text-gray-300 max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Modern school management system with smart features and beautiful design
            </motion.p>
          </div>

          {/* Enhanced feature list with complex animations */}
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {[
              "Student Management",
              "Exam & Marks System", 
              "Digital Certificates",
              "Analytics Dashboard"
            ].map((feature, index) => (
              <motion.div
                key={feature}
                className="flex items-center space-x-3 group cursor-pointer"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.15 }}
                whileHover={{ scale: 1.05, x: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      "0 0 0px rgba(99,102,241,0)",
                      "0 0 15px rgba(99,102,241,0.6)",
                      "0 0 0px rgba(99,102,241,0)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5,
                  }}
                />
                <motion.span 
                  className="text-gray-300 group-hover:text-cyan-400 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  {feature}
                </motion.span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced auth form with complex animations */}
        <motion.div 
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, x: 100, rotateY: -15 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ 
              y: -8, 
              rotateX: 2,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
            }}
            transition={{ duration: 0.4 }}
            className="perspective-1000"
          >
            <Card className="bg-gray-900/80 backdrop-blur-xl border-0 shadow-xl relative overflow-hidden">
              {/* Animated border effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500 rounded-lg"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "300% 300%",
                  padding: "2px",
                }}
              >
                <div className="w-full h-full bg-gray-900/80 backdrop-blur-xl rounded-lg" />
              </motion.div>

              <div className="relative z-10">
                <CardHeader className="text-center space-y-4">
                  <motion.div
                    className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center relative"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      boxShadow: "0 0 30px rgba(99,102,241,0.4)",
                    }}
                  >
                    <GraduationCap className="h-8 w-8 text-white" />
                    
                    {/* Pulsing ring effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                  
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <CardTitle className="text-2xl font-bold text-white">Welcome</CardTitle>
                      <CardDescription className="text-gray-300">
                        Sign in to your account
                      </CardDescription>
                    </motion.div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TabsList className="grid w-full grid-cols-2 bg-gray-800 p-1">
                        <TabsTrigger 
                          value="login" 
                          className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-white text-gray-300 transition-all duration-300"
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
                          className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-white text-gray-300 transition-all duration-300"
                        >
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Register
                          </motion.span>
                        </TabsTrigger>
                      </TabsList>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      <TabsContent value="login" className="mt-6">
                        <motion.form 
                          onSubmit={handleLogin}
                          className="space-y-4"
                          initial={{ opacity: 0, y: 30, rotateX: -5 }}
                          animate={{ opacity: 1, y: 0, rotateX: 0 }}
                          exit={{ opacity: 0, y: -30, rotateX: 5 }}
                          transition={{ duration: 0.4 }}
                        >
                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label htmlFor="username" className="text-gray-300">Username</Label>
                            <motion.div
                              whileFocus={{ scale: 1.02, rotateX: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id="username"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                                className="h-11 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500 transition-all duration-300"
                                placeholder="Enter username"
                                required
                              />
                            </motion.div>
                          </motion.div>

                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label htmlFor="password" className="text-gray-300">Password</Label>
                            <div className="relative">
                              <motion.div
                                whileFocus={{ scale: 1.02, rotateX: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  value={loginForm.password}
                                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                  className="h-11 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500 pr-10 transition-all duration-300"
                                  placeholder="Enter password"
                                  required
                                />
                              </motion.div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-gray-200"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.2 }}
                            className="pt-2"
                          >
                            <Button 
                              type="submit" 
                              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium relative overflow-hidden"
                              disabled={loginMutation.isPending}
                            >
                              {/* Animated background effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                animate={{
                                  x: ["-100%", "100%"],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />
                              
                              <div className="relative z-10 flex items-center justify-center">
                                {loginMutation.isPending ? (
                                  <motion.div
                                    className="flex items-center"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  >
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Signing in...
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    className="flex items-center"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <LogIn className="h-4 w-4 mr-2" />
                                    Sign In
                                  </motion.div>
                                )}
                              </div>
                            </Button>
                          </motion.div>
                        </motion.form>
                      </TabsContent>

                      <TabsContent value="register" className="mt-6">
                        <motion.form 
                          onSubmit={handleRegister}
                          className="space-y-4"
                          initial={{ opacity: 0, y: 30, rotateX: -5 }}
                          animate={{ opacity: 1, y: 0, rotateX: 0 }}
                          exit={{ opacity: 0, y: -30, rotateX: 5 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <motion.div 
                              className="space-y-2"
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                              <Input
                                id="firstName"
                                value={registerForm.firstName}
                                onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                                className="h-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                                placeholder="First name"
                                required
                              />
                            </motion.div>
                            <motion.div 
                              className="space-y-2"
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                              <Input
                                id="lastName"
                                value={registerForm.lastName}
                                onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                                className="h-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                                placeholder="Last name"
                                required
                              />
                            </motion.div>
                          </div>

                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label htmlFor="regUsername" className="text-gray-300">Username</Label>
                            <Input
                              id="regUsername"
                              value={registerForm.username}
                              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                              className="h-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                              placeholder="Choose username"
                              required
                            />
                          </motion.div>

                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label htmlFor="email" className="text-gray-300">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={registerForm.email}
                              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                              className="h-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                              placeholder="your.email@school.edu"
                              required
                            />
                          </motion.div>

                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label htmlFor="schoolName" className="text-gray-300">School Name</Label>
                            <Input
                              id="schoolName"
                              value={registerForm.schoolName}
                              onChange={(e) => setRegisterForm({ ...registerForm, schoolName: e.target.value })}
                              className="h-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500"
                              placeholder="Your school name"
                              required
                            />
                          </motion.div>

                          <motion.div 
                            className="space-y-2"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label htmlFor="regPassword" className="text-gray-300">Password</Label>
                            <div className="relative">
                              <Input
                                id="regPassword"
                                type={showRegPassword ? "text" : "password"}
                                value={registerForm.password}
                                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                className="h-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-cyan-500 pr-10"
                                placeholder="Create password"
                                required
                              />
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-400 hover:text-gray-200"
                                  onClick={() => setShowRegPassword(!showRegPassword)}
                                >
                                  {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.2 }}
                            className="pt-2"
                          >
                            <Button 
                              type="submit" 
                              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium relative overflow-hidden"
                              disabled={registerMutation.isPending}
                            >
                              {/* Animated background effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                animate={{
                                  x: ["-100%", "100%"],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                              />
                              
                              <div className="relative z-10 flex items-center justify-center">
                                {registerMutation.isPending ? (
                                  <motion.div
                                    className="flex items-center"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  >
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creating...
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    className="flex items-center"
                                    whileHover={{ scale: 1.05 }}
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Create Account
                                  </motion.div>
                                )}
                              </div>
                            </Button>
                          </motion.div>
                        </motion.form>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}