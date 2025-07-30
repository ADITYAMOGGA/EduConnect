import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Papa from "papaparse";

interface BulkMarksImportProps {
  onClose: () => void;
}

interface MarkRecord {
  studentName: string;
  admissionNo: string;
  examName: string;
  subject: string;
  marks: number;
  maxMarks: number;
}

export function BulkMarksImport({ onClose }: BulkMarksImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<MarkRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (marksData: MarkRecord[]) => {
      const response = await fetch('/api/marks/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: marksData })
      });
      if (!response.ok) throw new Error('Import failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/marks'] });
      toast({
        title: "Success",
        description: `Successfully imported ${preview.length} mark records.`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import marks data.",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      if (selectedFile.name.endsWith('.csv')) {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data as any[];
            const formattedData: MarkRecord[] = parsedData.map((row) => ({
              studentName: row['Student Name'] || row['studentName'] || '',
              admissionNo: row['Admission No'] || row['admissionNo'] || '',
              examName: row['Exam Name'] || row['examName'] || '',
              subject: row['Subject'] || row['subject'] || '',
              marks: parseInt(row['Marks'] || row['marks'] || '0'),
              maxMarks: parseInt(row['Max Marks'] || row['maxMarks'] || '100')
            }));
            setPreview(formattedData.filter(record => record.studentName && record.subject));
            setIsProcessing(false);
          },
          error: () => {
            toast({
              title: "Parse Error",
              description: "Failed to parse CSV file.",
              variant: "destructive",
            });
            setIsProcessing(false);
          }
        });
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (preview.length === 0) {
      toast({
        title: "No Data",
        description: "Please select a valid file with mark records.",
        variant: "destructive",
      });
      return;
    }
    importMutation.mutate(preview);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Marks Import
          </CardTitle>
          <CardDescription>
            Import student marks from CSV or Excel files. Required columns: Student Name, Admission No, Exam Name, Subject, Marks, Max Marks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>

          {file && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </AlertDescription>
            </Alert>
          )}

          {isProcessing && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Processing file...</AlertDescription>
            </Alert>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({preview.length} records)</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                <div className="text-xs font-mono space-y-1">
                  {preview.slice(0, 5).map((record, index) => (
                    <div key={index} className="text-sm">
                      {record.studentName} - {record.subject}: {record.marks}/{record.maxMarks}
                    </div>
                  ))}
                  {preview.length > 5 && (
                    <div className="text-gray-500">... and {preview.length - 5} more</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleImport}
              disabled={preview.length === 0 || importMutation.isPending}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {importMutation.isPending ? "Importing..." : "Import Marks"}
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