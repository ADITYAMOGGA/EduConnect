import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Eye, Download, CloudUpload, GraduationCap } from "lucide-react";
import type { Student, Exam, Mark, User, Subject } from "@shared/schema";
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
  const [openStudentSelect, setOpenStudentSelect] = useState(false);
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

  // Fetch subjects
  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

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
    if (!selectedExamData || subjects.length === 0) return "0.0";
    const maxTotal = selectedExamData.maxMarks * subjects.length; // Dynamic subject count
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
        scale: 2, // Reduced scale for better PDF compatibility
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: false,
        removeContainer: true,
        width: certificateRef.current.scrollWidth,
        height: certificateRef.current.scrollHeight,
      });

      // Create PDF in A4 landscape format
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      const imgData = canvas.toDataURL('image/png', 0.95);
      
      // Get page dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions in mm (1 px = 0.264583 mm at 96 DPI)
      const imgWidthMM = canvas.width * 0.264583;
      const imgHeightMM = canvas.height * 0.264583;
      
      // Calculate scale to fit the image within the page margins
      const margin = 10; // 10mm margin on all sides
      const availableWidth = pdfWidth - (margin * 2);
      const availableHeight = pdfHeight - (margin * 2);
      
      const scaleX = availableWidth / imgWidthMM;
      const scaleY = availableHeight / imgHeightMM;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      // Final image dimensions
      const finalWidth = imgWidthMM * scale;
      const finalHeight = imgHeightMM * scale;
      
      // Center the image on the page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
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
              <Popover open={openStudentSelect} onOpenChange={setOpenStudentSelect}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openStudentSelect}
                    className="w-full justify-between h-10 px-3"
                  >
                    {selectedStudent
                      ? students.find((student) => student.id === selectedStudent)?.name + 
                        " - Class " + students.find((student) => student.id === selectedStudent)?.class
                      : "Choose student..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search students..." />
                    <CommandEmpty>No student found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                      {students.map((student) => (
                        <CommandItem
                          key={student.id}
                          value={`${student.name} Class ${student.class} ${student.admissionNo}`}
                          onSelect={() => {
                            setSelectedStudent(student.id);
                            setOpenStudentSelect(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedStudent === student.id ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {student.name} - Class {student.class}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
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
            <div className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg">
              <div ref={certificateRef} className="bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-lg" style={{ width: '297mm', height: '210mm', minWidth: '800px' }}>
              {!selectedStudent || !selectedExam ? (
                <div className="flex items-center justify-center h-full min-h-[500px]">
                  <div className="text-center text-gray-500">
                    <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a student and exam to preview certificate</p>
                  </div>
                </div>
              ) : studentMarks.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[500px]">
                  <div className="text-center text-gray-500">
                    <p className="text-lg">No marks found for this student and exam</p>
                  </div>
                </div>
              ) : (
                <div className="p-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 h-full w-full flex flex-col justify-center">
                  {/* Elegant Colorful Border */}
                  <div className="border-4 border-double border-gradient-to-r from-purple-400 to-blue-400 p-8 relative bg-white/90 backdrop-blur-sm shadow-xl rounded-lg">
                    {/* Certificate Header */}
                    <div className="text-center mb-8">
                      {certificateOptions.showLogo && (
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <GraduationCap className="text-white text-3xl" />
                        </div>
                      )}
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 tracking-wide">
                        {(user as User)?.schoolName || (user as User)?.firstName + "'s School" || 'Academy of Excellence'}
                      </h1>
                      <div className="w-32 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto mb-4 rounded-full"></div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">CERTIFICATE OF ACADEMIC ACHIEVEMENT</h2>
                      <p className="text-blue-600 text-base font-medium">Academic Year {new Date().getFullYear()}</p>
                    </div>

                    {/* Certificate Body */}
                    <div className="text-center mb-6">
                      <p className="text-xl text-blue-700 mb-4 font-medium">This is to certify that</p>
                      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg mb-4">
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                          {selectedStudentData?.name}
                        </h3>
                      </div>
                      <div className="text-gray-700 mb-6 space-y-1">
                        {certificateOptions.showAdmissionNo && (
                          <p className="text-lg">Admission No: <span className="font-bold text-purple-600">{selectedStudentData?.admissionNo}</span></p>
                        )}
                        <p className="text-lg">Class: <span className="font-bold text-blue-600">{selectedStudentData?.class}</span></p>
                      </div>
                      <p className="text-xl text-gray-700 mb-6 font-medium">
                        has successfully completed the examination requirements for
                      </p>
                      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-lg inline-block">
                        <h4 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {selectedExamData?.name}
                        </h4>
                      </div>
                    </div>

                    {/* Colorful Marks Table */}
                    {certificateOptions.showSubjectMarks && (
                      <div className="mb-8">
                        <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg shadow-lg">
                          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
                            <thead className="bg-gradient-to-r from-purple-500 to-blue-500">
                              <tr>
                                <th className="text-left py-4 px-6 font-bold text-white">Subject</th>
                                <th className="text-center py-4 px-6 font-bold text-white">Marks</th>
                                <th className="text-center py-4 px-6 font-bold text-white">Max</th>
                                <th className="text-center py-4 px-6 font-bold text-white">%</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentMarks.map((mark, index) => (
                                <tr key={mark.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-purple-25' : 'bg-blue-25'} hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50`}>
                                  <td className="py-3 px-6 text-gray-800 font-medium">{mark.subject}</td>
                                  <td className="py-3 px-6 text-center font-bold text-purple-600">{mark.marks}</td>
                                  <td className="py-3 px-6 text-center text-gray-600">{selectedExamData?.maxMarks}</td>
                                  <td className="py-3 px-6 text-center font-semibold text-blue-600">
                                    {((mark.marks / (selectedExamData?.maxMarks || 100)) * 100).toFixed(0)}%
                                  </td>
                                </tr>
                              ))}
                              {certificateOptions.showTotalMarks && (
                                <tr className="bg-gradient-to-r from-purple-100 to-blue-100 border-t-2 border-purple-300 font-bold">
                                  <td className="py-4 px-6 text-purple-800 text-lg">TOTAL</td>
                                  <td className="py-4 px-6 text-center text-purple-800 text-lg">{total}</td>
                                  <td className="py-4 px-6 text-center text-purple-800 text-lg">{selectedExamData?.maxMarks ? selectedExamData.maxMarks * subjects.length : subjects.length * 100}</td>
                                  <td className="py-4 px-6 text-center text-purple-800 text-lg">{percentage}%</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Grade Display */}
                        {certificateOptions.showGrade && (
                          <div className="mt-6 text-center">
                            <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 px-8 py-4 rounded-full shadow-lg">
                              <span className="text-sm text-white block font-medium">Overall Grade</span>
                              <span className="text-3xl font-bold text-white">{grade}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recognition Text */}
                    <div className="text-center mb-8">
                      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg inline-block">
                        <p className="text-xl text-gray-700 italic font-medium">
                          in recognition of dedicated effort and academic achievement
                        </p>
                      </div>
                    </div>

                    {/* Signature Section */}
                    <div className="flex justify-between items-end mt-12">
                      <div className="text-center">
                        <div className="w-32 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mb-2 rounded-full"></div>
                        <p className="text-sm text-purple-600 uppercase tracking-wide font-semibold">Principal</p>
                      </div>
                      <div className="text-center bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
                        <p className="text-sm text-blue-600 uppercase tracking-wide mb-1 font-semibold">Date</p>
                        <p className="text-base font-bold text-purple-700">{new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mb-2 rounded-full"></div>
                        <p className="text-sm text-blue-600 uppercase tracking-wide font-semibold">School Seal</p>
                      </div>
                    </div>

                    {/* Corner Decorative Elements */}
                    <div className="absolute top-3 left-3 w-10 h-10 border-l-4 border-t-4 border-purple-400 rounded-tl-lg"></div>
                    <div className="absolute top-3 right-3 w-10 h-10 border-r-4 border-t-4 border-blue-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-3 left-3 w-10 h-10 border-l-4 border-b-4 border-blue-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-3 right-3 w-10 h-10 border-r-4 border-b-4 border-purple-400 rounded-br-lg"></div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
