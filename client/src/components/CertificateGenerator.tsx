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
            <div ref={certificateRef} className="border-4 border-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-12 bg-white relative min-h-[800px] shadow-2xl" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderImage: 'linear-gradient(45deg, #667eea, #764ba2) 1'
            }}>
              {!selectedStudent || !selectedExam ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <GraduationCap className="w-20 h-20 mx-auto mb-6 opacity-80" />
                    <p className="text-xl">Select a student and exam to preview certificate</p>
                  </div>
                </div>
              ) : studentMarks.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <p className="text-xl">No marks found for this student and exam</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl p-10 shadow-inner relative overflow-hidden">
                  {/* Premium Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 opacity-60"></div>
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500"></div>
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500"></div>
                  
                  <div className="relative z-10">
                    {/* Certificate Header */}
                    <div className="text-center mb-10 border-b-2 border-purple-200 pb-6">
                      {certificateOptions.showLogo && (
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <GraduationCap className="text-white text-3xl" />
                        </div>
                      )}
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent mb-3">
                        {(user as User)?.schoolName || 'Elite Academy'}
                      </h1>
                      <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mb-4 rounded-full"></div>
                      <h2 className="text-2xl font-semibold text-gray-700 mb-2">ACADEMIC EXCELLENCE CERTIFICATE</h2>
                      <p className="text-lg text-gray-600 italic">This is to certify that</p>
                    </div>

                    {/* Student Info */}
                    <div className="text-center mb-8">
                      <div className="border-b-2 border-purple-300 inline-block pb-2 mb-4">
                        <span className="text-3xl font-bold text-purple-800">
                          {selectedStudentData?.name}
                        </span>
                      </div>
                      <p className="text-gray-700 text-lg mb-4">
                        has successfully completed the academic requirements for
                      </p>
                      <p className="text-gray-600">
                        {certificateOptions.showAdmissionNo && (
                          <>Admission No: <span className="font-medium">{selectedStudentData?.admissionNo}</span> | </>
                        )}
                        Class: <span className="font-medium">{selectedStudentData?.class}</span>
                      </p>
                    </div>

                    {/* Premium Marks Table */}
                    {certificateOptions.showSubjectMarks && (
                      <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg border-2 border-purple-200 p-6 mb-8">
                        <h4 className="text-xl font-bold text-center text-purple-800 mb-6">
                          {selectedExamData?.name} - Academic Performance
                        </h4>
                        
                        {/* Tabular Marks Display */}
                        <div className="overflow-hidden rounded-lg shadow-lg">
                          <table className="w-full bg-white">
                            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                              <tr>
                                <th className="px-6 py-4 text-left font-semibold">Subject</th>
                                <th className="px-6 py-4 text-center font-semibold">Marks Obtained</th>
                                <th className="px-6 py-4 text-center font-semibold">Max Marks</th>
                                <th className="px-6 py-4 text-center font-semibold">Percentage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentMarks.map((mark, index) => (
                                <tr key={mark.id} className={`${index % 2 === 0 ? 'bg-purple-50' : 'bg-white'} border-b border-purple-100`}>
                                  <td className="px-6 py-4 font-medium text-gray-900">{mark.subject}</td>
                                  <td className="px-6 py-4 text-center font-bold text-purple-700">{mark.marks}</td>
                                  <td className="px-6 py-4 text-center text-gray-600">{selectedExamData?.maxMarks}</td>
                                  <td className="px-6 py-4 text-center font-medium text-indigo-600">
                                    {((mark.marks / (selectedExamData?.maxMarks || 100)) * 100).toFixed(1)}%
                                  </td>
                                </tr>
                              ))}
                              {/* Total Row */}
                              {certificateOptions.showTotalMarks && (
                                <tr className="bg-gradient-to-r from-purple-100 to-indigo-100 border-t-2 border-purple-300">
                                  <td className="px-6 py-4 font-bold text-purple-900">TOTAL</td>
                                  <td className="px-6 py-4 text-center font-bold text-purple-900 text-lg">{total}</td>
                                  <td className="px-6 py-4 text-center font-bold text-purple-900 text-lg">{selectedExamData?.maxMarks ? selectedExamData.maxMarks * 6 : 600}</td>
                                  <td className="px-6 py-4 text-center font-bold text-purple-900 text-lg">{percentage}%</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Grade Display */}
                        {certificateOptions.showGrade && (
                          <div className="mt-6 text-center">
                            <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full shadow-lg">
                              <span className="text-sm font-medium">Overall Grade</span>
                              <div className="text-3xl font-bold mt-1">{grade}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Certificate Footer */}
                    <div className="text-center space-y-4">
                      <p className="text-lg text-gray-700 italic">
                        In recognition of academic excellence and dedication to learning.
                      </p>
                      <div className="flex justify-between items-end mt-12">
                        <div className="text-center">
                          <div className="w-32 h-px bg-gray-400 mb-2"></div>
                          <p className="text-sm text-gray-600">Principal's Signature</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Date of Issue</p>
                          <p className="font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-center">
                          <div className="w-32 h-px bg-gray-400 mb-2"></div>
                          <p className="text-sm text-gray-600">School Seal</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <GraduationCap className="text-9xl text-gray-800" />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
