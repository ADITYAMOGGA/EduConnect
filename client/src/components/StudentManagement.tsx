import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Edit, Trash2, User, UserX, Search, Filter, AlertTriangle } from "lucide-react";
import type { Student } from "@shared/schema";
import AddStudentModal from "./AddStudentModal";
import ImportModal from "./ImportModal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export default function StudentManagement() {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students with optional filters
  const { data: allStudents = [], isLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  // Filter students based on class, section, and search term
  const filteredStudents = allStudents.filter((student: Student) => {
    const matchesClass = selectedClass === "all" || student.class === selectedClass;
    const matchesSection = selectedSection === "all" || student.section === selectedSection;
    const matchesSearch = searchTerm === "" || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toString().includes(searchTerm);
    
    return matchesClass && matchesSection && matchesSearch;
  });

  // Get unique class levels and sections for filters
  const availableClasses = [...new Set(allStudents.map(s => s.class))].sort();
  const availableSections = [...new Set(allStudents.map(s => s.section))].filter(Boolean).sort();

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      await apiRequest('DELETE', `/api/students/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  // Bulk delete students mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (studentIds: string[]) => {
      await Promise.all(studentIds.map(id => apiRequest('DELETE', `/api/students/${id}`)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      setSelectedStudents(new Set());
      setSelectAll(false);
      toast({
        title: "Success",
        description: "Selected students deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to delete selected students",
        variant: "destructive",
      });
    },
  });

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      deleteStudentMutation.mutate(studentToDelete.id);
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedStudents.size > 0) {
      setShowBulkDeleteConfirm(true);
    }
  };

  const confirmBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedStudents));
    setShowBulkDeleteConfirm(false);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingStudent(null);
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
    setSelectAll(newSelected.size === filteredStudents.length && filteredStudents.length > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    } else {
      setSelectedStudents(new Set());
    }
    setSelectAll(checked);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-600">Manage student records and information</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowImportModal(true)} variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Class Filter */}
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

            {/* Section Filter */}
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {availableSections.map(section => (
                  <SelectItem key={section} value={section}>
                    Section {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Results Counter */}
            <div className="flex items-center">
              <Badge variant="secondary">
                {filteredStudents.length} of {allStudents.length} students
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Students ({filteredStudents.length})
            </CardTitle>
            {selectedStudents.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedStudents.size})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading students...</div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-500">
                {allStudents.length === 0 
                  ? "Add your first student to get started"
                  : "No students match your current filters"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-3 font-medium text-gray-900">Student</th>
                    <th className="text-left p-3 font-medium text-gray-900">Class</th>
                    <th className="text-left p-3 font-medium text-gray-900">Section</th>
                    <th className="text-left p-3 font-medium text-gray-900">Roll No.</th>
                    <th className="text-left p-3 font-medium text-gray-900">Admission No.</th>
                    <th className="text-left p-3 font-medium text-gray-900">Contact</th>
                    <th className="text-left p-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedStudents.has(student.id)}
                          onCheckedChange={(checked) => 
                            handleSelectStudent(student.id, checked as boolean)
                          }
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.fatherName || 'Father not specified'}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">Class {student.class}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary">{student.section || 'N/A'}</Badge>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{student.rollNumber || 'N/A'}</td>
                      <td className="p-3 text-sm text-gray-600">{student.admissionNumber}</td>
                      <td className="p-3 text-sm text-gray-600">{student.phone || 'N/A'}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStudent(student)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showAddModal && (
        <AddStudentModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          studentToEdit={editingStudent}
        />
      )}

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          type="students"
        />
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Student"
        description={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteStudent}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showBulkDeleteConfirm}
        onOpenChange={setShowBulkDeleteConfirm}
        title="Delete Multiple Students"
        description={`Are you sure you want to delete ${selectedStudents.size} selected students? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        onConfirm={confirmBulkDelete}
        variant="destructive"
      />
    </div>
  );
}
