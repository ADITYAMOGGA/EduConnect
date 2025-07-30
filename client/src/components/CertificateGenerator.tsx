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
  showAdmissionNo: boolean;
  showLogo: boolean;
  showSubjectMarks: boolean;
  showTotalMarks: boolean;
  showGrade: boolean;
  showPercentage: boolean;
  logoUrl?: string;
}

export default function CertificateGenerator() {
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [openStudentSelect, setOpenStudentSelect] = useState(false);
  const [certificateOptions, setCertificateOptions] = useState<CertificateOptions>({
    showAdmissionNo: true,
    showLogo: true,
    showSubjectMarks: true,
    showTotalMarks: true,
    showGrade: true,
    showPercentage: true,
    logoUrl: '',
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
    if (studentMarks.length === 0) return "0.0";
    // Calculate max total from actual marks data which includes per-subject max marks
    const maxTotal = studentMarks.reduce((sum, mark) => sum + mark.maxMarks, 0);
    if (maxTotal === 0) return "0.0";
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

      // Create high-quality canvas from the certificate element
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: false,
        removeContainer: true,
        width: certificateRef.current.scrollWidth,
        height: certificateRef.current.scrollHeight,
      });

      // Create PDF in landscape for better certificate layout
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
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
      const fileName = `${selectedStudentData.name}_${selectedExamData.name}_ProgressCard.pdf`;
      pdf.save(fileName);

      toast({
        title: "Success",
        description: "Progress Card PDF has been downloaded successfully!",
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
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Progress Card Generator</h2>
        <p className="text-gray-600">Create and customize progress cards for your students</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Certificate Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Card Options</CardTitle>
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

            {/* Progress Card Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Include in Progress Card</label>
              <div className="space-y-2">
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
                
                <div className="space-y-2">
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
                  {certificateOptions.showLogo && (
                    <div className="ml-6">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setCertificateOptions(prev => ({ 
                                ...prev, 
                                logoUrl: event.target?.result as string 
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                    </div>
                  )}
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
                  <label htmlFor="showTotalMarks" className="text-sm text-gray-700">Total Marks</label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showPercentage"
                    checked={certificateOptions.showPercentage}
                    onCheckedChange={(checked) => 
                      setCertificateOptions(prev => ({ ...prev, showPercentage: !!checked }))
                    }
                  />
                  <label htmlFor="showPercentage" className="text-sm text-gray-700">Percentage (%)</label>
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
              Preview Progress Card
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
            <div className="border border-gray-200 rounded-lg">
              <div ref={certificateRef} className="bg-white shadow-lg mx-auto" style={{ width: '100%', maxWidth: '800px', aspectRatio: '297/210', transform: 'scale(0.8)', transformOrigin: 'top center' }}>
              {!selectedStudent || !selectedExam ? (
                <div className="flex items-center justify-center h-full min-h-[500px]">
                  <div className="text-center text-gray-500">
                    <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a student and exam to preview progress card</p>
                  </div>
                </div>
              ) : studentMarks.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[500px]">
                  <div className="text-center text-gray-500">
                    <p className="text-lg">No marks found for this student and exam</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white h-full w-full p-6" style={{ minHeight: '800px' }}>
                  {/* Professional Certificate Layout matching reference design */}
                  <div className="border-4 border-orange-400 rounded-lg h-full p-6 relative bg-gradient-to-br from-orange-50 to-white">
                    {/* Header Section */}
                    <div className="text-center mb-6">
                      {/* School Logo */}
                      {certificateOptions.showLogo && (
                        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                          {certificateOptions.logoUrl ? (
                            <img 
                              src={certificateOptions.logoUrl} 
                              alt="School Logo" 
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                              School Logo
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* School Name */}
                      <h1 className="text-xl font-bold text-black mb-2">
                        {(user as any)?.schoolName || "National Public High School"}
                      </h1>
                      
                      {/* School Address */}
                      <p className="text-xs text-gray-600 mb-4">
                        123, Gandhi Marg, Hyderabad, Telangana - 500001
                      </p>
                      
                      {/* Green Divider Line */}
                      <div className="w-full h-1 bg-green-600 mb-6"></div>
                    </div>

                    {/* Student Information Section */}
                    <div className="bg-blue-100 p-4 rounded mb-6">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div>
                          <span className="font-semibold text-black">Name: </span>
                          <span className="text-black">{selectedStudentData?.name}</span>
                        </div>
                        {certificateOptions.showAdmissionNo && (
                          <div>
                            <span className="font-semibold text-black">Admission No: </span>
                            <span className="text-black">{selectedStudentData?.admissionNo}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-black">Class: </span>
                          <span className="text-black">{selectedStudentData?.class}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-black">Academic Year: </span>
                          <span className="text-black">{selectedExamData?.name || "2024-2025"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Marks Table - Professional Design */}
                    {certificateOptions.showSubjectMarks && (
                      <div className="mb-6">
                        <table className="w-full border-collapse border-2 border-black">
                          <thead>
                            <tr className="bg-yellow-400">
                              <th className="border border-black p-2 text-left font-bold text-black text-sm">Subject</th>
                              <th className="border border-black p-2 text-center font-bold text-black text-sm">Marks Obtained</th>
                              <th className="border border-black p-2 text-center font-bold text-black text-sm">Maximum Marks</th>
                              <th className="border border-black p-2 text-center font-bold text-black text-sm">Grade</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentMarks.map((mark, index) => {
                              const subject = subjects.find(s => s.id === mark.subject);
                              const percentage = (mark.marks / mark.maxMarks) * 100;
                              const markGrade = getGrade(percentage);
                              return (
                                <tr key={mark.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                  <td className="border border-black p-2 text-black text-sm">
                                    {subject?.name || mark.subject || "Unknown Subject"}
                                  </td>
                                  <td className="border border-black p-2 text-center text-black text-sm">
                                    {mark.marks}
                                  </td>
                                  <td className="border border-black p-2 text-center text-black text-sm">
                                    {mark.maxMarks}
                                  </td>
                                  <td className="border border-black p-2 text-center font-semibold text-black text-sm">
                                    {markGrade}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Results Summary */}
                    <div className="flex justify-end mb-8">
                      <div className="text-right">
                        {(() => {
                          const total = calculateTotal();
                          const percentage = parseFloat(calculatePercentage(total));
                          const overallGrade = getGrade(percentage);
                          const result = percentage >= 40 ? "Passed" : "Failed";
                          
                          return (
                            <div>
                              <div className="text-sm text-black mb-1">
                                <span className="font-semibold">Overall Grade: </span>
                                <span className="font-bold text-lg">{overallGrade}</span>
                              </div>
                              <div className="text-sm text-black">
                                <span className="font-semibold">Result: </span>
                                <span className="font-bold">{result}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Signature Section */}
                    <div className="flex justify-between mt-auto pt-8">
                      <div className="text-center">
                        <div className="w-32 border-b border-black mb-1"></div>
                        <p className="text-sm font-medium text-black">Class Teacher</p>
                      </div>
                      <div className="text-center">
                        <div className="w-32 border-b border-black mb-1"></div>
                        <p className="text-sm font-medium text-black">Principal</p>
                      </div>
                    </div>
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
