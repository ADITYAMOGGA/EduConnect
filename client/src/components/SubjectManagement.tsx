import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Edit2, Trash2, Loader2, ListPlus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Subject {
  id: string;
  name: string;
  code: string;
  userId: string;
  createdAt: string;
}

export default function SubjectManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });
  const [bulkSubjects, setBulkSubjects] = useState("");
  const [bulkSubjectsList, setBulkSubjectsList] = useState<Array<{name: string, code: string}>>([]);

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; code: string }) => {
      const res = await apiRequest("POST", "/api/subjects", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsDialogOpen(false);
      setFormData({ name: "", code: "" });
      toast({
        title: "Subject created",
        description: "New subject has been added successfully.",
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

  const bulkCreateMutation = useMutation({
    mutationFn: async (subjects: Array<{ name: string; code: string }>) => {
      const res = await apiRequest("POST", "/api/subjects/bulk", { subjects });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsBulkDialogOpen(false);
      setBulkSubjects("");
      setBulkSubjectsList([]);
      toast({
        title: "Subjects created",
        description: data.message || "Subjects have been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subjects",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; code: string }) => {
      const res = await apiRequest("PATCH", `/api/subjects/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      setIsDialogOpen(false);
      setEditingSubject(null);
      setFormData({ name: "", code: "" });
      toast({
        title: "Subject updated",
        description: "Subject has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update subject",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const parseBulkSubjects = (text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed: Array<{name: string, code: string}> = [];
    
    lines.forEach((line, index) => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        parsed.push({
          name: parts[0],
          code: parts[1]
        });
      }
    });
    
    return parsed;
  };

  const handleBulkTextChange = (text: string) => {
    setBulkSubjects(text);
    setBulkSubjectsList(parseBulkSubjects(text));
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkSubjectsList.length > 0) {
      bulkCreateMutation.mutate(bulkSubjectsList);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, code: subject.code });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingSubject(null);
    setFormData({ name: "", code: "" });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center p-8"
      >
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading subjects...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Subject Management</h2>
          <p className="text-slate-600">Add and manage subjects for your school</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <ListPlus className="h-4 w-4 mr-2" />
                Bulk Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ListPlus className="h-5 w-5 text-primary" />
                  Bulk Add Subjects
                </DialogTitle>
                <DialogDescription>
                  Add multiple subjects at once. Enter each subject on a new line with format: Subject Name, Code
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-subjects">Subjects (one per line)</Label>
                  <Textarea 
                    id="bulk-subjects"
                    placeholder="Mathematics, MATH01&#10;English, ENG01&#10;Science, SCI01&#10;Social Studies, SS01"
                    value={bulkSubjects}
                    onChange={(e) => handleBulkTextChange(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Format: Subject Name, Subject Code (one per line)
                  </p>
                </div>
                
                {bulkSubjectsList.length > 0 && (
                  <div className="space-y-2">
                    <Label>Preview ({bulkSubjectsList.length} subjects)</Label>
                    <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                      {bulkSubjectsList.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-muted/50 rounded px-2 py-1">
                          <span>{subject.name}</span>
                          <Badge variant="secondary">{subject.code}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <DialogFooter>
                  <Button type="submit" disabled={bulkCreateMutation.isPending || bulkSubjectsList.length === 0}>
                    {bulkCreateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create {bulkSubjectsList.length} Subjects
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </DialogTitle>
              <DialogDescription>
                {editingSubject ? "Update the subject details below." : "Create a new subject for your curriculum."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., MATH"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {editingSubject ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {subjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="text-center p-12 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <BookOpen className="h-16 w-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Subjects Added</h3>
              <p className="text-slate-500 mb-6">Start by adding subjects to organize your curriculum</p>
              <Button 
                onClick={openCreateDialog}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Subject
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
                  Subjects ({subjects.length})
                </CardTitle>
                <CardDescription>
                  Manage your school's curriculum subjects
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
                      {subjects.map((subject, index) => (
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
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(subject)}
                              className="hover:bg-blue-100 hover:text-blue-700"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(subject.id)}
                              disabled={deleteMutation.isPending}
                              className="hover:bg-red-100 hover:text-red-700"
                            >
                              {deleteMutation.isPending ? (
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
    </motion.div>
  );
}