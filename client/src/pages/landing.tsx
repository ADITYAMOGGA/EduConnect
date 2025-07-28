import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
      <div className="max-w-md w-full">
        {/* School Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tejaswi High School</h1>
          <p className="text-gray-600">Progress Card & Certificate Portal</p>
        </div>

        {/* Welcome Card */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome</h2>
              <p className="text-gray-600">Sign in to access the school portal</p>
            </div>

            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-all duration-200 transform hover:scale-[1.02]"
            >
              Sign In with Replit
            </Button>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Secure authentication powered by Replit
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
