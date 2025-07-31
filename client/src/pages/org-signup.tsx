import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { SchoolIcon, UserPlusIcon, CheckCircleIcon } from "lucide-react";
import { Link, useLocation } from "wouter";

const orgSignupSchema = z.object({
  // Organization details
  orgName: z.string().min(2, "Organization name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  boardType: z.enum(["CBSE", "ICSE", "State Board"]),
  establishedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  website: z.string().url("Valid website URL required").optional().or(z.literal("")),
  principalName: z.string().min(2, "Principal name required"),
  
  // Admin user details
  adminUsername: z.string().min(3, "Username must be at least 3 characters"),
  adminName: z.string().min(2, "Admin name must be at least 2 characters"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters"),
  adminPhone: z.string().min(10, "Valid phone number required"),
  designation: z.string().default("Principal")
});

type OrgSignupForm = z.infer<typeof orgSignupSchema>;

export default function OrgSignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<OrgSignupForm>({
    resolver: zodResolver(orgSignupSchema),
    defaultValues: {
      boardType: "CBSE",
      designation: "Principal",
      orgName: "",
      address: "",
      phone: "",
      email: "",
      establishedYear: undefined,
      website: "",
      principalName: "",
      adminUsername: "",
      adminName: "",
      adminPassword: "",
      adminPhone: ""
    }
  });

  const onSubmit = async (data: OrgSignupForm) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/org/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Signup failed");
      }

      setIsSuccess(true);
      toast({
        title: "Organization Created Successfully!",
        description: "Your school has been registered. You can now login with your credentials.",
      });

      // Redirect to org login after 2 seconds
      setTimeout(() => {
        setLocation("/org/login");
      }, 2000);

    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
          <p className="text-gray-600 mb-4">Your organization has been created successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 pt-8"
        >
          <div className="flex items-center justify-center mb-4">
            <SchoolIcon className="w-12 h-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MARKSHEET PRO
            </h1>
          </div>
          <p className="text-xl text-gray-600">Register Your School</p>
          <p className="text-sm text-gray-500 mt-2">Join thousands of schools managing student records digitally</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center justify-center">
                <UserPlusIcon className="w-6 h-6 mr-2" />
                Organization Registration
              </CardTitle>
              <CardDescription className="text-indigo-100">
                Create your school account and admin user
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Organization Details Section */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">School Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="orgName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Delhi Public School" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="boardType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Board Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select board type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="CBSE">CBSE</SelectItem>
                                <SelectItem value="ICSE">ICSE</SelectItem>
                                <SelectItem value="State Board">State Board</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="principalName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Principal Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Dr. Rajesh Kumar" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91-11-12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Email</FormLabel>
                            <FormControl>
                              <Input placeholder="info@school.edu.in" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="establishedYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Established Year</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1995" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Address *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Sector 45, Gurgaon, Haryana - 122003" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.school.edu.in" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Admin User Section */}
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="adminUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username *</FormLabel>
                            <FormControl>
                              <Input placeholder="principal_dps" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Dr. Rajesh Kumar" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="adminPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91-9876543210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Designation</FormLabel>
                            <FormControl>
                              <Input placeholder="Principal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3"
                    >
                      {isLoading ? "Creating Organization..." : "Register School"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/org/login")}
                      className="flex-1 py-3"
                    >
                      Already have an account? Login
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 pb-8"
        >
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/org/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Login here
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2025 MARKSHEET PRO. Empowering education through digital innovation.
          </p>
        </motion.div>
      </div>
    </div>
  );
}