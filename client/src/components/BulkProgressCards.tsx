import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import jsPDF from "jspdf";

interface BulkProgressCardsProps {
  onClose: () => void;
}

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
}

interface Exam {
  id: string;
  name: string;
  class: string;
  maxMarks: number;
}

export function BulkProgressCards({ onClose }: BulkProgressCardsProps) {
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const { toast } = useToast();

  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  const generateBulkCards = useMutation({
    mutationFn: async ({ examId, studentClass }: { examId: string; studentClass: string }) => {
      const response = await fetch(`/api/certificates/bulk/${examId}/${studentClass}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Generation failed');
      return response.json();
    },
    onSuccess: (data: any) => {
      // Create a zip file or PDF with all certificates
      downloadBulkPDFs(data.certificates);
      toast({
        title: "Success",
        description: `Generated ${data.certificates.length} progress cards successfully.`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate bulk progress cards.",
        variant: "destructive",
      });
    }
  });

  const downloadBulkPDFs = async (certificates: any[]) => {
    setIsGenerating(true);
    setProgress(0);

    for (let i = 0; i < certificates.length; i++) {
      const cert = certificates[i];
      await generateSinglePDF(cert, i + 1, certificates.length);
      setProgress(((i + 1) / certificates.length) * 100);
    }

    setIsGenerating(false);
    setProgress(0);
  };

  const generateSinglePDF = async (certificate: any, index: number, total: number) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add certificate content
    pdf.setFontSize(20);
    pdf.text('PROGRESS CERTIFICATE', 105, 30, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.text(`Student: ${certificate.studentName}`, 20, 60);
    pdf.text(`Admission No: ${certificate.admissionNo}`, 20, 75);
    pdf.text(`Class: ${certificate.class}`, 20, 90);
    pdf.text(`Exam: ${certificate.examName}`, 20, 105);

    // Add marks table
    let yPos = 130;
    pdf.text('SUBJECT', 20, yPos);
    pdf.text('MARKS', 80, yPos);
    pdf.text('MAX MARKS', 120, yPos);
    pdf.text('GRADE', 160, yPos);

    yPos += 10;
    certificate.marks.forEach((mark: any) => {
      pdf.text(mark.subject, 20, yPos);
      pdf.text(mark.marks.toString(), 80, yPos);
      pdf.text(mark.maxMarks.toString(), 120, yPos);
      pdf.text(mark.grade || 'A', 160, yPos);
      yPos += 8;
    });

    // Add total
    yPos += 10;
    pdf.text(`Total: ${certificate.totalMarks}/${certificate.totalMaxMarks}`, 20, yPos);
    pdf.text(`Percentage: ${certificate.percentage}%`, 20, yPos + 10);

    // Save individual PDF
    pdf.save(`progress-card-${certificate.studentName.replace(/\s+/g, '-')}.pdf`);
    
    // Small delay to prevent browser freezing
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const handleGenerate = () => {
    if (!selectedExam || !selectedClass) {
      toast({
        title: "Selection Required",
        description: "Please select both exam and class.",
        variant: "destructive",
      });
      return;
    }

    generateBulkCards.mutate({
      examId: selectedExam,
      studentClass: selectedClass
    });
  };

  const filteredStudents = students.filter(s => selectedClass ? s.class === selectedClass : true);
  const classes = Array.from(new Set(students.map(s => s.class))).sort();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk Progress Card Generation
          </CardTitle>
          <CardDescription>
            Generate progress cards for all students in a class for a specific exam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-select">Select Exam</Label>
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose exam" />
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

            <div className="space-y-2">
              <Label htmlFor="class-select">Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedClass && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Users className="h-4 w-4" />
                {filteredStudents.length} students in Class {selectedClass}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="space-y-2">
              <Label>Generating Progress Cards...</Label>
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-gray-600">
                {Math.round(progress)}% complete
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={!selectedExam || !selectedClass || generateBulkCards.isPending || isGenerating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {generateBulkCards.isPending || isGenerating ? "Generating..." : "Generate Cards"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}