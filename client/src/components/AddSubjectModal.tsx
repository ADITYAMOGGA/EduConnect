import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface AddSubjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

export default function AddSubjectModal({ open, onOpenChange, orgId }: AddSubjectModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    class_level: "",
    max_marks: 100,
    description: "",
    subject_type: "Core",
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (subjectData: any) => {
      const response = await fetch('/api/org/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subjectData, orgId }),
      });
      if (!response.ok) throw new Error('Failed to create subject');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/subjects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/org/stats'] });
      toast({ title: "Subject added successfully!" });
      setFormData({
        name: "",
        code: "",
        class_level: "",
        max_marks: 100,
        description: "",
        subject_type: "Core",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add subject",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.class_level) {
      toast({
        title: "Error",
        description: "Subject name, code, and class are required",
        variant: "destructive",
      });
      return;
    }
    createSubjectMutation.mutate(formData);
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>
            Create a new subject for your school curriculum.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g., Mathematics"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => updateField("code", e.target.value)}
                placeholder="e.g., MATH"
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_marks">Maximum Marks</Label>
              <Input
                id="max_marks"
                type="number"
                value={formData.max_marks}
                onChange={(e) => updateField("max_marks", parseInt(e.target.value) || 100)}
                placeholder="100"
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject_type">Subject Type</Label>
              <Select value={formData.subject_type} onValueChange={(value) => updateField("subject_type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Core">Core Subject</SelectItem>
                  <SelectItem value="Optional">Optional Subject</SelectItem>
                  <SelectItem value="Extra-curricular">Extra-curricular</SelectItem>
                  <SelectItem value="Language">Language</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Brief description of the subject"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createSubjectMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {createSubjectMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Subject"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}