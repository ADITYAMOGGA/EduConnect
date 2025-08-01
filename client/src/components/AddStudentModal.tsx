import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

export default function AddStudentModal({ open, onOpenChange, orgId }: AddStudentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    admission_no: "",
    class_level: "",
    section: "",
    roll_no: "",
    father_name: "",
    mother_name: "",
    phone: "",
    address: "",
    date_of_birth: "",
  });

  const createStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const response = await fetch(`/api/org/students?orgId=${orgId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...studentData, orgId }),
      });
      if (!response.ok) throw new Error('Failed to create student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/org/stats'] });
      toast({ title: "Student added successfully!" });
      setFormData({
        name: "",
        admission_no: "",
        class_level: "",
        section: "",
        roll_no: "",
        father_name: "",
        mother_name: "",
        phone: "",
        address: "",
        date_of_birth: "",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.admission_no || !formData.class_level) {
      toast({
        title: "Error",
        description: "Name, admission number, and class are required",
        variant: "destructive",
      });
      return;
    }
    createStudentMutation.mutate(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the student's information to add them to your school.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Student Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admission_no">Admission Number *</Label>
              <Input
                id="admission_no"
                value={formData.admission_no}
                onChange={(e) => updateField("admission_no", e.target.value)}
                placeholder="e.g., 2024001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="class_level">Class *</Label>
              <Select value={formData.class_level} onValueChange={(value) => updateField("class_level", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9">Class 9</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={formData.section} onValueChange={(value) => updateField("section", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="D">Section D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roll_no">Roll Number</Label>
              <Input
                id="roll_no"
                value={formData.roll_no}
                onChange={(e) => updateField("roll_no", e.target.value)}
                placeholder="e.g., 15"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => updateField("date_of_birth", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name</Label>
              <Input
                id="father_name"
                value={formData.father_name}
                onChange={(e) => updateField("father_name", e.target.value)}
                placeholder="Enter father's name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mother_name">Mother's Name</Label>
              <Input
                id="mother_name"
                value={formData.mother_name}
                onChange={(e) => updateField("mother_name", e.target.value)}
                placeholder="Enter mother's name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="e.g., +91 98765 43210"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Enter complete address"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createStudentMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {createStudentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}