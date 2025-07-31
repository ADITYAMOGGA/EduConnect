import React, { useState, useCallback, useMemo } from "react";
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

  // Optimized bulk import - batch processing for better performance
  const importMutation = useMutation({
    mutationFn: async (marksData: ParsedMarkRow[]) => {
      const validData = marksData.filter(row => row.valid);
      const totalRows = validData.length;
      
      if (totalRows === 0) {
        throw new Error('No valid data to import');
      }

      const batchSize = 5; // Process 5 students at a time for better performance
      const batches = [];
      
      for (let i = 0; i < validData.length; i += batchSize) {
        batches.push(validData.slice(i, i + batchSize));
      }

      const results: ImportResult['details'] = [];
      let processed = 0;
      
      setImportProgress(0);

      for (const batch of batches) {
        // Process batch in parallel
        const batchPromises = batch.map(async (row) => {
          try {
            const importPromises = [];
            
            for (const [subject, marks] of Object.entries(row.marks)) {
              if (marks > 0) { // Only import non-zero marks
                importPromises.push(
                  apiRequest('POST', '/api/marks/bulk-import-single', {
                    examId,
                    studentName: row.name,
                    subject,
                    marks,
                    maxMarks: 100
                  })
                );
              }
            }
            
            await Promise.all(importPromises);
            
            return {
              student: row.name,
              status: 'success' as const
            };
          } catch (error) {
            return {
              student: row.name,
              status: 'error' as const,
              message: error instanceof Error ? error.message : 'Import failed'
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        processed += batch.length;
        
        // Update progress smoothly
        setImportProgress((processed / totalRows) * 100);
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
        }, 1500);
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

  const parseCSVData = useCallback((csvText: string) => {
    try {
      setIsProcessing(true);
      
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
    } catch (error) {
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV data",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSVData(text);
    };
    reader.readAsText(selectedFile);
  }, [parseCSVData]);

  const handleTextParse = useCallback(() => {
    if (!textInput.trim()) {
      toast({
        title: "No Data",
        description: "Please enter CSV data to parse.",
        variant: "destructive",
      });
      return;
    }
    
    parseCSVData(textInput);
  }, [textInput, parseCSVData, toast]);

  const handleImport = useCallback(() => {
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
  }, [parsedData, importMutation, toast]);

  const exampleCSV = `name,Science,Social Studies,Mathematics
Nikhil Varma,0,0,85
Bhavani Devi,92,0,0
Teja Reddy,0,0,0`;

  const validCount = useMemo(() => parsedData.filter(r => r.valid).length, [parsedData]);
  const invalidCount = useMemo(() => parsedData.filter(r => !r.valid).length, [parsedData]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <Card className="border-0 h-full">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
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
                className="text-white hover:bg-white/20 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <AnimatePresence mode="wait">
              {!importMutation.isPending && !importResult ? (
                <div key="input" className="space-y-6">
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
                        <pre className="bg-slate-100 p-3 rounded-lg text-sm overflow-x-auto border">
{exampleCSV}
                        </pre>
                        <p className="text-sm text-slate-600">
                          • First column must be "name" • Use 0 for subjects not taken • Marks should be between 0-100
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Input Area */}
                  {importMode === 'text' ? (
                    <div className="space-y-3">
                      <Label htmlFor="csv-input">CSV Data</Label>
                      <textarea
                        id="csv-input"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={exampleCSV}
                        className="w-full h-32 p-3 border rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <div className="space-y-3">
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
                            {validCount} Valid
                          </Badge>
                          <Badge variant="destructive">
                            {invalidCount} Invalid
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto border rounded-lg">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th className="text-left p-3 border-b font-medium">Status</th>
                              <th className="text-left p-3 border-b font-medium">Student</th>
                              <th className="text-left p-3 border-b font-medium">Subjects & Marks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedData.map((row, index) => (
                              <tr key={index} className="border-b hover:bg-slate-50">
                                <td className="p-3">
                                  {row.valid ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                  )}
                                </td>
                                <td className="p-3 font-medium">{row.name}</td>
                                <td className="p-3">
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

                      <div className="flex gap-3">
                        <Button
                          onClick={handleImport}
                          disabled={validCount === 0}
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Import {validCount} Valid Records
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
                </div>
              ) : importMutation.isPending ? (
                <div key="importing" className="space-y-6 text-center py-12">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Importing Marks...</h3>
                    <p className="text-slate-600">Processing your data, please wait</p>
                  </div>
                  
                  <div className="space-y-3 max-w-md mx-auto">
                    <Progress value={importProgress} className="h-3" />
                    <p className="text-sm text-slate-500">{Math.round(importProgress)}% complete</p>
                  </div>
                </div>
              ) : importResult ? (
                <div key="result" className="space-y-6 text-center py-12">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold">Import Completed!</h3>
                    <div className="flex justify-center gap-4">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {importResult.success} Successful
                      </Badge>
                      {importResult.failed > 0 && (
                        <Badge variant="destructive">
                          {importResult.failed} Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {importResult.details.some(d => d.status === 'error') && (
                    <div className="max-h-40 overflow-y-auto border rounded-lg p-4 bg-red-50">
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
                  
                  <Button onClick={onClose} className="min-w-32">
                    Close
                  </Button>
                </div>
              ) : null}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}