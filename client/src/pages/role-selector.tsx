import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Building2, BookOpen, GraduationCap, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function RoleSelector() {
  const [, navigate] = useLocation();

  const roles = [
    {
      id: "admin",
      title: "Platform Admin",
      description: "Manage all organizations and system-wide operations",
      icon: Shield,
      color: "from-red-600 to-pink-600",
      bgColor: "from-red-50 to-pink-50",
      path: "/admin/login",
      features: ["Create & manage schools", "Monitor platform activity", "User management"]
    },
    {
      id: "org",
      title: "School Admin",
      description: "Complete school management and academic operations",
      icon: Building2,
      color: "from-blue-600 to-purple-600",
      bgColor: "from-blue-50 to-purple-50",
      path: "/org/login",
      features: ["Manage students & teachers", "Academic planning", "Progress reports"]
    },
    {
      id: "teacher",
      title: "Teacher",
      description: "Subject-level access for marks entry and student progress",
      icon: BookOpen,
      color: "from-green-600 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      path: "/teacher/login",
      features: ["View assigned students", "Enter subject marks", "Performance tracking"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 -left-20 w-40 h-40 bg-blue-300/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-60 h-60 bg-indigo-300/20 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mr-4 shadow-lg">
              <GraduationCap className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MARKSHEET PRO
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-xl">Multi-Organization School Management System</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Choose Your Access Level
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Select your role to access the appropriate dashboard with tailored features for your responsibilities
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role, index) => {
            const IconComponent = role.icon;
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className={`bg-gradient-to-br ${role.bgColor} dark:from-slate-800 dark:to-slate-700 border-slate-200/50 dark:border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 h-full`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${role.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="text-white text-2xl" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {role.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 text-base">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {role.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 bg-gradient-to-r ${role.color} rounded-full`} />
                          <span className="text-slate-700 dark:text-slate-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => navigate(role.path)}
                      className={`w-full bg-gradient-to-r ${role.color} hover:opacity-90 text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
                    >
                      Login as {role.title}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-slate-500 dark:text-slate-400">
            Built for Indian education system • CBSE/ICSE compatible • Secure & scalable
          </p>
        </motion.div>
      </div>
    </div>
  );
}