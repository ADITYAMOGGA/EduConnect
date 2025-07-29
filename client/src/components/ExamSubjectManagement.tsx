import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen, Edit2, Trash2, Loader2, GraduationCap } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Exam {
  id: string;
  name: string;
  class: string;
  maxMarks: number;
  userId: string;
  createdAt: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  userId: string;
  examId?: string | null;
  createdAt: string;
}

export default function ExamSubjectManagement() {
  const { toast } = useToast();
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isBulkSubjectDialogOpen, setIsBulkSubjectDialogOpen] = useState(false);
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({
    name: "",
    code: "",
    examId: "",
  });
  const [bulkSubjects, setBulkSubjects] = useState("");
  const [examFormData, setExamFormData] = useState({
    name: "",
    class: "",
    maxMarks: 100,
  });

  // Fetch exams
  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  // Fetch all subjects
  const { data: allSubjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  // Filter subjects by selected exam (for display purposes, we'll filter in the frontend)
  const examSubjects = selectedExam 
    ? allSubjects.filter(subject => {
        // Since examId might not exist in DB yet, we'll use a naming convention
        // Subjects created for specific exams will have exam name in their code
        const examData = exams.find(e => e.id === selectedExam);
        return examData && subject.code.includes(examData.name);
      })
    : [];

  // Create/Update Exam Mutation
  const createExamMutation = useMutation({
    mutationFn: async (data: { name: string; class: string; maxMarks: number }) => {
      if (editingExam) {
        const res = await apiRequest("PATCH", `/api/exams/${editingExam.id}`, data);
        return await res.json();
      } else {
        const res = await apiRequest("POST", "/api/exams", data);
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      setIsExamDialogOpen(false);
      setExamFormData({ name: "", class: "", maxMarks: 100 });
      setEditingExam(null);
      toast({
        title: editingExam ? "Exam updated" : "Exam created",
        description: `Exam has been ${editingExam ? 'updated' : 'created'} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive",
      });
    },
  });

  const createSubjectMutation = useMutation({
    mutationFn: async (data: { name: string; code: string; examId?: string }) => {
      if (editingSubject) {
        const res = await apiRequest("PATCH", `/api/subjects/${editingSubject.id}`, data);
        return await res.json();
      } else {
        // For new subjects, encode exam info in the subject code
        const examData = exams.find(e => e.id === data.examId);
        const enhancedCode = examData ? `${examData.name}-${data.code}` : data.code;
        
        const res = await apiRequest("POST", "/api/subjects", {
          name: data.name,
          code: enhancedCode,
        });
        return await res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsSubjectDialogOpen(false);
      setSubjectFormData({ name: "", code: "", examId: "" });
      setEditingSubject(null);
      toast({
        title: editingSubject ? "Subject updated" : "Subject created",
        description: `Subject has been ${editingSubject ? 'updated' : 'added to the exam'} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive",
      });
    },
  });

  // Bulk Create Subjects Mutation
  const bulkCreateSubjectsMutation = useMutation({
    mutationFn: async (data: { subjects: Array<{ name: string; code: string }> }) => {
      const res = await apiRequest("POST", "/api/subjects/bulk", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsBulkSubjectDialogOpen(false);
      setBulkSubjects("");
      toast({
        title: "Success",
        description: "Subjects created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",  
        description: error.message || "Failed to create subjects",
        variant: "destructive",
      });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({
        title: "Subject deleted",
        description: "Subject has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      });
    },
  });

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examFormData.name.trim() || !examFormData.class.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createExamMutation.mutate(examFormData);
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectFormData.name.trim() || !subjectFormData.code.trim() || !selectedExam) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select an exam",
        variant: "destructive",
      });
      return;
    }

    createSubjectMutation.mutate({
      name: subjectFormData.name,
      code: subjectFormData.code,
      examId: selectedExam,
    });
  };

  const handleBulkSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkSubjects.trim() || !selectedExam) {
      toast({
        title: "Error",
        description: "Please enter subjects and select an exam",
        variant: "destructive",
      });
      return;
    }

    // Parse bulk subjects - each line should be "Name,Code" or just "Name"
    const subjectLines = bulkSubjects.trim().split('\n').filter(line => line.trim());
    const examData = exams.find(e => e.id === selectedExam);
    const examPrefix = examData ? `${examData.name}-` : '';
    
    const subjects = subjectLines.map((line, index) => {
      const parts = line.trim().split(',');
      const name = parts[0]?.trim();
      const code = parts[1]?.trim() || `${name.toUpperCase().slice(0, 3)}${index + 1}`;
      
      return {
        name: name,
        code: `${examPrefix}${code}`
      };
    });

    bulkCreateSubjectsMutation.mutate({ subjects });
  };

  const openCreateSubjectDialog = () => {
    if (!selectedExam) {
      toast({
        title: "Select an exam first",
        description: "Please select an exam to add subjects to.",
        variant: "destructive",
      });
      return;
    }
    setSubjectFormData({ name: "", code: "", examId: selectedExam });
    setIsSubjectDialogOpen(true);
  };

  const openBulkCreateDialog = () => {
    if (!selectedExam) {
      toast({
        title: "Select an exam first",
        description: "Please select an exam to add subjects to.",
        variant: "destructive",
      });
      return;
    }
    setBulkSubjects("");
    setIsBulkSubjectDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Exam-Specific Subjects
          </h2>
          <p className="text-gray-600 mt-2">Manage subjects for different examinations</p>
        </div>
      </div>

      {/* Exam Selection and Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Examination Management
          </CardTitle>
          <CardDescription>
            Select an existing exam or create a new one to manage subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="exam-select">Select Examination</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger id="exam-select">
                  <SelectValue placeholder="Choose an exam..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} - Class {exam.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setIsExamDialogOpen(true)}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </Button>
            <Button
              onClick={openCreateSubjectDialog}
              disabled={!selectedExam}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
            <Button
              onClick={openBulkCreateDialog}
              disabled={!selectedExam}
              variant="outline"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Bulk Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subject List */}
      <AnimatePresence mode="wait">
        {!selectedExam ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="text-center p-12 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <BookOpen className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Select an Exam</h3>
              <p className="text-slate-500">Choose an examination above to view and manage its subjects</p>
            </Card>
          </motion.div>
        ) : examSubjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="text-center p-12 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Subjects Added</h3>
              <p className="text-slate-500 mb-6">Add subjects for this examination to organize the curriculum</p>
              <Button 
                onClick={openCreateSubjectDialog}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Subject
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Subjects ({examSubjects.length})
                </CardTitle>
                <CardDescription>
                  Subjects for {exams.find(e => e.id === selectedExam)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {examSubjects.map((subject, index) => (
                        <motion.tr
                          key={subject.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="border-b"
                        >
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {subject.code}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(subject.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSubjectMutation.mutate(subject.id)}
                              disabled={deleteSubjectMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deleteSubjectMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Exam Dialog */}
      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Create New Exam
            </DialogTitle>
            <DialogDescription>
              Add a new examination to manage subjects for
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExamSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exam-name">Exam Name</Label>
              <Input
                id="exam-name"
                value={examFormData.name}
                onChange={(e) => setExamFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Mid Term Examination"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-class">Class</Label>
              <Select
                value={examFormData.class}
                onValueChange={(value) => setExamFormData(prev => ({ ...prev, class: value }))}
              >
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
              <Label htmlFor="max-marks">Maximum Marks</Label>
              <Input
                id="max-marks"
                type="number"
                value={examFormData.maxMarks}
                onChange={(e) => setExamFormData(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 100 }))}
                placeholder="100"
                min="1"
                max="1000"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExamDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createExamMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {createExamMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Exam
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Subject Dialog */}
      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Add New Subject
            </DialogTitle>
            <DialogDescription>
              Add a subject for {exams.find(e => e.id === selectedExam)?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                placeholder="e.g., Mathematics"
                value={subjectFormData.name}
                onChange={(e) => setSubjectFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Subject Code</Label>
              <Input
                id="code"
                placeholder="e.g., MATH"
                value={subjectFormData.code}
                onChange={(e) => setSubjectFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createSubjectMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {createSubjectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Subjects Dialog */}
      <Dialog open={isBulkSubjectDialogOpen} onOpenChange={setIsBulkSubjectDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Bulk Add Subjects
            </DialogTitle>
            <DialogDescription>
              Add multiple subjects for {exams.find(e => e.id === selectedExam)?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBulkSubjectSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk-subjects">Subjects (one per line)</Label>
              <Textarea
                id="bulk-subjects"
                placeholder={`Enter subjects like this:
Mathematics,MATH01
Science,SCI01
Social Studies,SS01
English
Hindi`}
                value={bulkSubjects}
                onChange={(e) => setBulkSubjects(e.target.value)}
                rows={8}
                className="resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: "Subject Name,Code" or just "Subject Name" (code will be auto-generated)
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsBulkSubjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={bulkCreateSubjectsMutation.isPending}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {bulkCreateSubjectsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add All Subjects
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}