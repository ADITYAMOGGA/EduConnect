import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Code, Github, Mail, ExternalLink, Users, Heart, Star } from "lucide-react";

export default function Support() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const developers = [
    {
      name: "NAVANEETH REDDY",
      role: "Full Stack Developer",
      icon: <Code className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "ADITYA PUPPALA", 
      role: "Full Stack Developer",
      icon: <Users className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "REPLIT",
      role: "Platform & Infrastructure",
      icon: <Star className="w-6 h-6" />,
      color: "from-orange-500 to-red-500"
    }
  ];

  const handleContactClick = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const handleGithubClick = () => {
    window.open('https://github.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div 
          className="text-center mb-12"
          variants={itemVariants}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Support & Development Team
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the talented developers behind MARKSEET PRO - your comprehensive school management solution
          </p>
        </motion.div>

        {/* Developers Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-12"
          variants={itemVariants}
        >
          {developers.map((dev, index) => (
            <motion.div
              key={dev.name}
              className="group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${dev.color} flex items-center justify-center text-white mb-4 group-hover:rotate-12 transition-transform duration-300`}>
                    {dev.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                    {dev.name}
                  </CardTitle>
                  <p className="text-gray-600 font-medium">{dev.role}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex justify-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContactClick('contact@example.com')}
                      className="hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGithubClick}
                      className="hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* About Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-gray-800 flex items-center justify-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                About MARKSEET PRO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
                  MARKSEET PRO is a comprehensive school management system designed to streamline academic operations, 
                  student record management, and certificate generation. Built with modern web technologies and a focus 
                  on user experience, it empowers educational institutions to manage their academic processes efficiently.
                </p>
              </div>
              
              <Separator />

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Student Management & Records
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Dynamic Subject Management
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Marks Entry & Tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Digital Certificate Generation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Bulk Data Import/Export
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Technology Stack</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      React 18 + TypeScript
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Express.js + Node.js
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Supabase Database
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Tailwind CSS + Framer Motion
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Deployed on Replit
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Support Section */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 shadow-xl">
            <CardContent className="text-center py-8">
              <h3 className="text-2xl font-bold mb-4">Need Help or Support?</h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Our development team is here to help! Whether you have questions, need technical support, 
                or want to report an issue, don't hesitate to reach out.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => handleContactClick('support@markseetpro.com')}
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
                <Button
                  onClick={handleGithubClick}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600 font-semibold"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub Issues
                </Button>
                <Button
                  onClick={() => window.open('https://replit.com', '_blank')}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600 font-semibold"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Powered by Replit
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-12 pb-8"
          variants={itemVariants}
        >
          <p className="text-gray-600">
            Made with <Heart className="w-4 h-4 inline text-red-500 mx-1" /> by the MARKSEET PRO team
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © 2025 MARKSEET PRO. Built for educational excellence.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}