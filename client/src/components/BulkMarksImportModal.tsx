import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Upload, FileSpreadsheet, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";

interface BulkMarksImportModalProps {
  examId: string;
  examName: string;
  studentClass: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedMarkRow {
  name: string;
  marks: { [subject: string]: number };
  valid: boolean;
  errors: string[];
}

interface ImportResult {
  success: number;
  failed: number;
  details: {
    student: string;
    status: 'success' | 'error';
    message?: string;
  }[];
}

export function BulkMarksImportModal({ examId, examName, studentClass, onClose, onSuccess }: BulkMarksImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [parsedData, setParsedData] = useState<ParsedMarkRow[]>([]);
  const [importMode, setImportMode] = useState<'file' | 'text'>('text');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (marksData: ParsedMarkRow[]) => {
      const validData = marksData.filter(row => row.valid);
      const totalRows = validData.length;
      let processed = 0;
      
      const results: ImportResult['details'] = [];
      setImportProgress(0);
      
      for (const row of validData) {
        try {
          for (const [subject, marks] of Object.entries(row.marks)) {
            if (marks > 0) { // Only import non-zero marks
              await apiRequest('POST', '/api/marks/bulk-import-single', {
                examId,
                studentName: row.name,
                subject,
                marks,
                maxMarks: 100
              });
            }
          }
          
          results.push({
            student: row.name,
            status: 'success'
          });
        } catch (error) {
          results.push({
            student: row.name,
            status: 'error',
            message: error instanceof Error ? error.message : 'Import failed'
          });
        }
        
        processed++;
        setImportProgress((processed / totalRows) * 100);
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return {
        success: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length,
        details: results
      };
    },
    onSuccess: (result) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ['/api/marks', examId] });
      
      if (result.success > 0) {
        toast({
          title: "Import Completed",
          description: `Successfully imported marks for ${result.success} students${result.failed > 0 ? `, ${result.failed} failed` : ''}.`,
        });
      }
      
      if (result.failed === 0) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import marks data.",
        variant: "destructive",
      });
      setImportProgress(0);
    }
  });

  const parseCSVData = (csvText: string) => {
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      if (headers[0].toLowerCase() !== 'name') {
        throw new Error('First column must be "name"');
      }
      
      const subjects = headers.slice(1);
      const parsed: ParsedMarkRow[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) {
          continue; // Skip malformed rows
        }
        
        const row: ParsedMarkRow = {
          name: values[0],
          marks: {},
          valid: true,
          errors: []
        };
        
        if (!row.name) {
          row.valid = false;
          row.errors.push('Student name is required');
        }
        
        for (let j = 1; j < values.length; j++) {
          const markValue = parseFloat(values[j]);
          if (isNaN(markValue) || markValue < 0 || markValue > 100) {
            row.marks[subjects[j - 1]] = 0;
            if (values[j] !== '0' && values[j] !== '') {
              row.errors.push(`Invalid mark for ${subjects[j - 1]}: ${values[j]}`);
            }
          } else {
            row.marks[subjects[j - 1]] = markValue;
          }
        }
        
        parsed.push(row);
      }
      
      setParsedData(parsed);
      setIsProcessing(false);
    } catch (error) {
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV data",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSVData(text);
    };
    reader.readAsText(selectedFile);
  };

  const handleTextParse = () => {
    if (!textInput.trim()) {
      toast({
        title: "No Data",
        description: "Please enter CSV data to parse.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => parseCSVData(textInput), 100);
  };

  const handleImport = () => {
    const validData = parsedData.filter(row => row.valid);
    if (validData.length === 0) {
      toast({
        title: "No Valid Data",
        description: "Please fix errors before importing.",
        variant: "destructive",
      });
      return;
    }
    
    importMutation.mutate(parsedData);
  };

  const exampleCSV = `name,Science,Social Studies,Mathematics
Nikhil Varma,0,0,85
Bhavani Devi,92,0,0
Teja Reddy,0,0,0`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <Card className="border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Bulk Marks Import
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Import marks for {examName} - Class {studentClass}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {!importMutation.isPending && !importResult ? (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Input Mode Selector */}
                  <div className="flex gap-2">
                    <Button
                      variant={importMode === 'text' ? 'default' : 'outline'}
                      onClick={() => setImportMode('text')}
                      className="flex-1"
                    >
                      Text Input
                    </Button>
                    <Button
                      variant={importMode === 'file' ? 'default' : 'outline'}
                      onClick={() => setImportMode('file')}
                      className="flex-1"
                    >
                      File Upload
                    </Button>
                  </div>

                  {/* Example Format */}
                  <Alert>
                    <FileSpreadsheet className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <strong>Required Format:</strong>
                        <pre className="bg-slate-100 p-2 rounded text-sm overflow-x-auto">
{exampleCSV}
                        </pre>
                        <p className="text-sm text-slate-600">
                          • First column must be "name"
                          • Use 0 for subjects not taken
                          • Marks should be between 0-100
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Input Area */}
                  {importMode === 'text' ? (
                    <div className="space-y-2">
                      <Label htmlFor="csv-input">CSV Data</Label>
                      <textarea
                        id="csv-input"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={exampleCSV}
                        className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                      />
                      <Button
                        onClick={handleTextParse}
                        disabled={!textInput.trim() || isProcessing}
                        className="w-full"
                      >
                        {isProcessing ? "Parsing..." : "Parse Data"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="file-upload">Select CSV File</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Parsed Data Preview */}
                  {parsedData.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">Preview ({parsedData.length} rows)</h4>
                        <div className="flex gap-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {parsedData.filter(r => r.valid).length} Valid
                          </Badge>
                          <Badge variant="destructive">
                            {parsedData.filter(r => !r.valid).length} Invalid
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto border rounded">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th className="text-left p-2 border-b">Status</th>
                              <th className="text-left p-2 border-b">Student</th>
                              <th className="text-left p-2 border-b">Subjects & Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.map((row, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-2">
                                  {row.valid ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                  )}
                                </td>
                                <td className="p-2 font-medium">{row.name}</td>
                                <td className="p-2">
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(row.marks).map(([subject, marks]) => (
                                      <Badge 
                                        key={subject} 
                                        variant={marks > 0 ? "default" : "outline"}
                                        className="text-xs"
                                      >
                                        {subject}: {marks}
                                      </Badge>
                                    ))}
                                  </div>
                                  {row.errors.length > 0 && (
                                    <div className="text-xs text-red-600 mt-1">
                                      {row.errors.join(', ')}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleImport}
                          disabled={parsedData.filter(r => r.valid).length === 0}
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Import {parsedData.filter(r => r.valid).length} Valid Records
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setParsedData([])}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : importMutation.isPending ? (
                <motion.div
                  key="importing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 text-center py-8"
                >
                  <div className="space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <FileSpreadsheet className="h-12 w-12 mx-auto text-blue-600" />
                    </motion.div>
                    <h3 className="text-lg font-semibold">Importing Marks...</h3>
                    <p className="text-slate-600">Please wait while we process your data</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={importProgress} className="w-full" />
                    <p className="text-sm text-slate-500">{Math.round(importProgress)}% complete</p>
                  </div>
                </motion.div>
              ) : importResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 text-center py-8"
                >
                  <div className="space-y-4">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                    <h3 className="text-lg font-semibold">Import Completed!</h3>
                    <div className="flex justify-center gap-4">
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">
                        {importResult.success} Successful
                      </Badge>
                      {importResult.failed > 0 && (
                        <Badge variant="destructive" className="text-sm">
                          {importResult.failed} Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {importResult.details.some(d => d.status === 'error') && (
                    <div className="max-h-40 overflow-y-auto border rounded p-4 bg-red-50">
                      <h4 className="font-semibold text-red-800 mb-2">Failed Imports:</h4>
                      {importResult.details
                        .filter(d => d.status === 'error')
                        .map((detail, index) => (
                          <div key={index} className="text-sm text-red-700">
                            {detail.student}: {detail.message}
                          </div>
                        ))
                      }
                    </div>
                  )}
                  
                  <Button onClick={onClose} className="w-full">
                    Close
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}