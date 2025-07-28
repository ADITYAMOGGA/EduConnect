import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { GraduationCap, Bell, User, LogOut } from "lucide-react";
import StudentManagement from "@/components/StudentManagement";
import MarksEntry from "@/components/MarksEntry";
import CertificateGenerator from "@/components/CertificateGenerator";
import Settings from "@/components/Settings";

type TabType = 'students' | 'marks' | 'certificates' | 'settings';

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('students');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="text-white text-2xl" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'students', label: 'Students', icon: 'fas fa-users' },
    { id: 'marks', label: 'Marks Entry', icon: 'fas fa-clipboard-list' },
    { id: 'certificates', label: 'Certificates', icon: 'fas fa-certificate' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentManagement />;
      case 'marks':
        return <MarksEntry />;
      case 'certificates':
        return <CertificateGenerator />;
      case 'settings':
        return <Settings />;
      default:
        return <StudentManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and School Name */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  MARKSEET PRO
                </h1>
                <p className="text-sm text-gray-500">School Management System</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="text-gray-600 text-sm" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
                <button 
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-gray-500 hover:text-red-600 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`border-b-2 py-4 px-1 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}
