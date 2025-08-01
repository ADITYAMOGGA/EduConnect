import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Student } from "@shared/schema";

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  student: Student | null;
}

export default function EditStudentModal({ open, onOpenChange, orgId, student }: EditStudentModalProps) {
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

  // Populate form when student changes
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || "",
        admission_no: student.admissionNo || "",
        class_level: student.class || "",
        section: "",
        roll_no: "",
        father_name: "",
        mother_name: "",
        phone: "",
        address: "",
        date_of_birth: "",
      });
    } else {
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
    }
  }, [student]);

  const updateStudentMutation = useMutation({
    mutationFn: async (studentData: any) => {
      const response = await fetch(`/api/org/students/${student?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...studentData, orgId }),
      });
      if (!response.ok) throw new Error('Failed to update student');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/org/stats'] });
      toast({ title: "Student updated successfully!" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.admission_no || !formData.class_level) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    updateStudentMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update student information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter student name"
                required
              />
            </div>
            <div>
              <Label htmlFor="admission_no">Admission No *</Label>
              <Input
                id="admission_no"
                value={formData.admission_no}
                onChange={(e) => setFormData({ ...formData, admission_no: e.target.value })}
                placeholder="e.g., 2024001"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class_level">Class *</Label>
              <Select value={formData.class_level} onValueChange={(value) => setFormData({ ...formData, class_level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Class 1</SelectItem>
                  <SelectItem value="2">Class 2</SelectItem>
                  <SelectItem value="3">Class 3</SelectItem>
                  <SelectItem value="4">Class 4</SelectItem>
                  <SelectItem value="5">Class 5</SelectItem>
                  <SelectItem value="6">Class 6</SelectItem>
                  <SelectItem value="7">Class 7</SelectItem>
                  <SelectItem value="8">Class 8</SelectItem>
                  <SelectItem value="9">Class 9</SelectItem>
                  <SelectItem value="10">Class 10</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="section">Section</Label>
              <Select value={formData.section} onValueChange={(value) => setFormData({ ...formData, section: value })}>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="roll_no">Roll Number</Label>
              <Input
                id="roll_no"
                value={formData.roll_no}
                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                placeholder="e.g., 01"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="father_name">Father's Name</Label>
              <Input
                id="father_name"
                value={formData.father_name}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                placeholder="Father's name"
              />
            </div>
            <div>
              <Label htmlFor="mother_name">Mother's Name</Label>
              <Input
                id="mother_name"
                value={formData.mother_name}
                onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
                placeholder="Mother's name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Complete address"
            />
          </div>

          <div>
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateStudentMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {updateStudentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}