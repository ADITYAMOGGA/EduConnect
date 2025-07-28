import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye, Download, CloudUpload, GraduationCap } from "lucide-react";
import type { Student, Exam, Mark, User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateOptions {
  showPhoto: boolean;
  showAdmissionNo: boolean;
  showLogo: boolean;
  showSubjectMarks: boolean;
  showTotalMarks: boolean;
  showGrade: boolean;
}

export default function CertificateGenerator() {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [certificateOptions, setCertificateOptions] = useState<CertificateOptions>({
    showPhoto: true,
    showAdmissionNo: true,
    showLogo: true,
    showSubjectMarks: true,
    showTotalMarks: true,
    showGrade: true,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  // Fetch exams
  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  // Fetch marks for selected student and exam
  const { data: studentMarks = [] } = useQuery<Mark[]>({
    queryKey: ['/api/marks', selectedStudent, selectedExam],
    enabled: !!selectedStudent && !!selectedExam,
  });

  const selectedStudentData = students.find((s) => s.id === selectedStudent);
  const selectedExamData = exams.find((e) => e.id === selectedExam);

  const calculateTotal = () => {
    return studentMarks.reduce((sum, mark) => sum + mark.marks, 0);
  };

  const calculatePercentage = (total: number) => {
    if (!selectedExamData) return "0.0";
    const maxTotal = selectedExamData.maxMarks * 6; // 6 subjects
    return ((total / maxTotal) * 100).toFixed(1);
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !selectedStudentData || !selectedExamData) {
      toast({
        title: "Error",
        description: "Please select both student and exam before generating PDF",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your certificate...",
      });

      // Create canvas from the certificate element
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions to fit the page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image on the page
      const x = 10; // 10mm margin
      const y = (pdfHeight - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Download the PDF
      const fileName = `${selectedStudentData.name}_${selectedExamData.name}_Certificate.pdf`;
      pdf.save(fileName);

      toast({
        title: "Success",
        description: "Certificate PDF has been downloaded successfully!",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const total = calculateTotal();
  const percentage = parseFloat(calculatePercentage(total));
  const grade = getGrade(percentage);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Certificate Generator</h2>
        <p className="text-gray-600">Create and customize progress certificates</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Certificate Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Certificate Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
              <Select onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student: Student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - Class {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exam Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Exam</label>
              <Select onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose exam..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam: Exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Certificate Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Include in Certificate</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showPhoto"
                    checked={certificateOptions.showPhoto}
                    onCheckedChange={(checked) => 
                      setCertificateOptions(prev => ({ ...prev, showPhoto: !!checked }))
                    }
                  />
                  <label htmlFor="showPhoto" className="text-sm text-gray-700">Student Photo</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showAdmissionNo"
                    checked={certificateOptions.showAdmissionNo}
                    onCheckedChange={(checked) => 
                      setCertificateOptions(prev => ({ ...prev, showAdmissionNo: !!checked }))
                    }
                  />
                  <label htmlFor="showAdmissionNo" className="text-sm text-gray-700">Admission Number</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showLogo"
                    checked={certificateOptions.showLogo}
                    onCheckedChange={(checked) => 
                      setCertificateOptions(prev => ({ ...prev, showLogo: !!checked }))
                    }
                  />
                  <label htmlFor="showLogo" className="text-sm text-gray-700">School Logo</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showSubjectMarks"
                    checked={certificateOptions.showSubjectMarks}
                    onCheckedChange={(checked) => 
                      setCertificateOptions(prev => ({ ...prev, showSubjectMarks: !!checked }))
                    }
                  />
                  <label htmlFor="showSubjectMarks" className="text-sm text-gray-700">Subject-wise Marks</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showTotalMarks"
                    checked={certificateOptions.showTotalMarks}
                    onCheckedChange={(checked) => 
                      setCertificateOptions(prev => ({ ...prev, showTotalMarks: !!checked }))
                    }
                  />
                  <label htmlFor="showTotalMarks" className="text-sm text-gray-700">Total Marks & Percentage</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showGrade"
                    checked={certificateOptions.showGrade}
                    onCheckedChange={(checked) => 
                      setCertificateOptions(prev => ({ ...prev, showGrade: !!checked }))
                    }
                  />
                  <label htmlFor="showGrade" className="text-sm text-gray-700">Grade</label>
                </div>
              </div>
            </div>

            {/* School Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors duration-200">
                <CloudUpload className="text-gray-400 text-2xl mb-2 mx-auto" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              className="w-full bg-primary-500 hover:bg-primary-600"
              disabled={!selectedStudent || !selectedExam}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Certificate
            </Button>
          </CardContent>
        </Card>

        {/* Certificate Preview */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Live Preview</CardTitle>
              <Button 
                onClick={handleDownloadPDF}
                className="bg-success-500 hover:bg-success-600"
                disabled={!selectedStudent || !selectedExam || studentMarks.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Certificate Preview Area */}
            <div ref={certificateRef} className="border border-gray-200 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-indigo-50 relative min-h-[600px]">
              {!selectedStudent || !selectedExam ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select a student and exam to preview certificate</p>
                  </div>
                </div>
              ) : studentMarks.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <p>No marks found for this student and exam</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Certificate Header */}
                  <div className="text-center mb-8">
                    {certificateOptions.showLogo && (
                      <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="text-white text-2xl" />
                      </div>
                    )}
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                      {(user as User)?.schoolName || 'MARKSEET PRO'}
                    </h2>
                    <p className="text-gray-600">Academic Progress Certificate</p>
                  </div>

                  {/* Certificate Content */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">This is to certify that</h3>
                      <div className="border-b-2 border-primary-500 inline-block pb-2 mb-4">
                        <span className="text-2xl font-bold text-primary-600">
                          {selectedStudentData?.name}
                        </span>
                      </div>
                      <p className="text-gray-600">
                        {certificateOptions.showAdmissionNo && (
                          <>Admission No: <span className="font-medium">{selectedStudentData?.admissionNo}</span> | </>
                        )}
                        Class: <span className="font-medium">{selectedStudentData?.class}</span>
                      </p>
                    </div>

                    {/* Marks Table */}
                    {certificateOptions.showSubjectMarks && (
                      <div className="bg-white rounded-lg shadow-sm p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          {selectedExamData?.name} Results
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {studentMarks.map((mark) => (
                            <div key={mark.id} className="flex justify-between">
                              <span>{mark.subject}:</span>
                              <span className="font-medium">{mark.marks}/{selectedExamData?.maxMarks}</span>
                            </div>
                          ))}
                        </div>
                        {certificateOptions.showTotalMarks && (
                          <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-semibold">
                            <span>Total: {total}/{selectedExamData?.maxMarks ? selectedExamData.maxMarks * 6 : 600}</span>
                            <span>Percentage: {percentage}%</span>
                            {certificateOptions.showGrade && (
                              <span className="text-success-600">Grade: {grade}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-center text-sm text-gray-600">
                      <p>Date of Issue: <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
                    </div>
                  </div>

                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <GraduationCap className="text-9xl text-gray-800" />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
