import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrgAuth } from "@/hooks/useOrgAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, BookOpen, Edit2, Trash2, Loader2, Search, Filter } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface Subject {
  id: string;
  name: string;
  code: string;
  class_level: string;
  max_marks: number;
  is_optional: boolean;
  description?: string;
  created_at: string;
}

export default function SubjectManagementEnhanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { orgId, isAuthenticated } = useOrgAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    class_level: "all",
    selected_classes: [] as string[],
    max_marks: 100,
    is_optional: false,
    is_required: false,
    description: ""
  });

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/org/subjects", orgId, selectedClass],
    queryFn: async () => {
      const url = selectedClass === "all" 
        ? `/api/org/subjects?orgId=${orgId}`
        : `/api/org/subjects?orgId=${orgId}&class=${selectedClass}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch subjects');
      return response.json();
    },
    enabled: !!orgId && isAuthenticated,
  });

  // Filter subjects based on search and class
  const filteredSubjects = subjects.filter((subject: Subject) => {
    const matchesSearch = searchTerm === "" || 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "all" || subject.class_level === selectedClass;
    
    return matchesSearch && matchesClass;
  });

  // Get unique class levels for filter
  const availableClasses = Array.from(new Set(subjects.map(s => s.class_level))).sort();

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Determine final class_level based on selection
      const finalClassLevel = data.class_level === 'all' ? 'all' : 
                             data.selected_classes.length === 1 ? data.selected_classes[0] :
                             data.selected_classes.length > 1 ? data.selected_classes.join(',') : 'all';
      
      const payload = {
        ...data,
        class_level: finalClassLevel
      };
      const res = await apiRequest("POST", "/api/org/subjects", payload);
      return await res.json();
    },
    onSuccess: (newSubject) => {
      // Optimistically update the cache with the new subject
      queryClient.setQueryData(["/api/org/subjects", orgId, selectedClass], (oldData: Subject[] | undefined) => {
        if (!oldData) return [newSubject];
        return [...oldData, newSubject];
      });
      queryClient.invalidateQueries({ queryKey: ["/api/org/subjects"] });
      handleCloseDialog();
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

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Determine final class_level based on selection
      const finalClassLevel = data.class_level === 'all' ? 'all' : 
                             data.selected_classes.length === 1 ? data.selected_classes[0] :
                             data.selected_classes.length > 1 ? data.selected_classes.join(',') : 'all';
      
      const payload = {
        ...data,
        class_level: finalClassLevel
      };
      const res = await apiRequest("PATCH", `/api/org/subjects/${editingSubject?.id}`, payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/org/subjects"] });
      handleCloseDialog();
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
      await apiRequest("DELETE", `/api/org/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/org/subjects"] });
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
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      class_level: subject.class_level,
      selected_classes: subject.class_level === 'all' ? [] : [subject.class_level],
      max_marks: subject.max_marks,
      is_optional: subject.is_optional,
      is_required: false,
      description: subject.description || ""
    });
    setIsDialogOpen(true);
  };

  const handleDeleteSubject = (subject: Subject) => {
    setSubjectToDelete(subject);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSubject = () => {
    if (subjectToDelete) {
      deleteMutation.mutate(subjectToDelete.id);
      setShowDeleteConfirm(false);
      setSubjectToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSubject(null);
    setFormData({
      name: "",
      code: "",
      class_level: "all",
      selected_classes: [],
      max_marks: 100,
      is_optional: false,
      is_required: false,
      description: ""
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subject Management</h2>
          <p className="text-gray-600">Manage subjects and curriculum</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {availableClasses.map(classLevel => (
                  <SelectItem key={classLevel} value={classLevel}>
                    Class {classLevel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center">
              <Badge variant="secondary">
                {filteredSubjects.length} of {subjects.length} subjects
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subjects ({filteredSubjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading subjects...</span>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Found</h3>
              <p className="text-gray-500">
                {subjects.length === 0 
                  ? "Add your first subject to get started"
                  : "No subjects match your current filters"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subject.name}</p>
                          {subject.description && (
                            <p className="text-sm text-gray-500">{subject.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{subject.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{subject.class_level === 'all' ? 'All Classes' : `Class ${subject.class_level}`}</Badge>
                      </TableCell>
                      <TableCell>{subject.max_marks}</TableCell>
                      <TableCell>
                        <Badge variant={subject.is_optional ? "secondary" : "default"}>
                          {subject.is_optional ? "Optional" : "Mandatory"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSubject(subject)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubject(subject)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Subject Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </DialogTitle>
            <DialogDescription>
              {editingSubject ? "Update subject information" : "Create a new subject for your school"}
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

            {/* Multiple Class Selection for Subjects */}
            <div className="space-y-2">
              <Label>Applicable Classes (Select Multiple)</Label>
              <div className="grid grid-cols-3 gap-2 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="class-all"
                    checked={formData.class_level === 'all'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          class_level: 'all',
                          selected_classes: []
                        });
                      } else {
                        setFormData({
                          ...formData,
                          class_level: '',
                          selected_classes: []
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <Label htmlFor="class-all" className="text-sm font-medium">
                    All Classes
                  </Label>
                </div>
                
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => (
                  <div key={classNum} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`subject-class-${classNum}`}
                      checked={formData.selected_classes.includes(classNum.toString())}
                      disabled={formData.class_level === 'all'}
                      onChange={(e) => {
                        const classStr = classNum.toString();
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            class_level: '',
                            selected_classes: [...formData.selected_classes, classStr]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            selected_classes: formData.selected_classes.filter(c => c !== classStr)
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`subject-class-${classNum}`} className={`text-sm ${formData.class_level === 'all' ? 'text-gray-400' : ''}`}>
                      Class {classNum}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {formData.class_level === 'all' 
                  ? 'Subject will be available for all classes'
                  : `Selected classes: ${formData.selected_classes.length > 0 ? formData.selected_classes.map(c => `Class ${c}`).join(', ') : 'None'}`
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_marks">Max Marks</Label>
              <Input
                id="max_marks"
                type="number"
                value={formData.max_marks}
                onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) || 100 })}
                min="1"
                max="200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description about the subject"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_optional"
                  checked={formData.is_optional}
                  onChange={(e) => setFormData({ ...formData, is_optional: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_optional">Optional Subject</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={formData.is_required}
                  onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_required">Required Subject</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingSubject ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingSubject ? "Update Subject" : "Create Subject"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Subject"
        description={`Are you sure you want to delete "${subjectToDelete?.name}"? This will also remove all associated marks and assignments. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteSubject}
        variant="destructive"
      />
    </div>
  );
}