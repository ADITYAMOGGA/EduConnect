import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Download, Upload, FileText, AlertCircle } from "lucide-react";

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

const sampleCSVData = `name,admission_no,class_level,section,roll_no,father_name,mother_name,phone,address,date_of_birth
Arjun Kumar,2024001,10,A,1,Rajesh Kumar,Sunita Kumar,+91 98765 43210,"123 Main Street, Delhi","2008-05-15"
Priya Sharma,2024002,10,A,2,Suresh Sharma,Meera Sharma,+91 98765 43211,"456 Park Road, Mumbai","2008-03-22"
Rohit Singh,2024003,10,B,1,Vikram Singh,Anjali Singh,+91 98765 43212,"789 Lake View, Bangalore","2008-07-08"`;

export default function CSVImportModal({ open, onOpenChange, orgId }: CSVImportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const importMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/org/students/import', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import students');
      }
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/org/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/org/stats'] });
      toast({ 
        title: "Import successful!", 
        description: `Successfully imported ${result.imported} students. ${result.errors || 0} errors.`
      });
      setFile(null);
      setPreview([]);
      setErrors([]);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Import failed",
        description: error.message || "Failed to import students",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);

    // Parse CSV for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const requiredFields = ['name', 'admission_no', 'class_level'];
      const missingFields = requiredFields.filter(field => !headers.includes(field));
      
      if (missingFields.length > 0) {
        setErrors([`Missing required columns: ${missingFields.join(', ')}`]);
        return;
      }

      const rows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setPreview(rows);
      setErrors([]);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('orgId', orgId);

    importMutation.mutate(formData);
  };

  const downloadSample = () => {
    const blob = new Blob([sampleCSVData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Students from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple students at once.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sample Format */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                CSV Format Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">
                Your CSV file must include these required columns:
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="font-medium text-red-600">name*</span>
                <span className="font-medium text-red-600">admission_no*</span>
                <span className="font-medium text-red-600">class_level*</span>
                <span>section</span>
                <span>roll_no</span>
                <span>father_name</span>
                <span>mother_name</span>
                <span>phone</span>
                <span>address</span>
                <span>date_of_birth</span>
              </div>
              <Button variant="outline" size="sm" onClick={downloadSample}>
                <Download className="w-4 h-4 mr-2" />
                Download Sample CSV
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csvFile">Select CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Preview (First 5 rows)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Name</th>
                        <th className="border border-gray-300 p-2 text-left">Admission No</th>
                        <th className="border border-gray-300 p-2 text-left">Class</th>
                        <th className="border border-gray-300 p-2 text-left">Section</th>
                        <th className="border border-gray-300 p-2 text-left">Father's Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">{row.name}</td>
                          <td className="border border-gray-300 p-2">{row.admission_no}</td>
                          <td className="border border-gray-300 p-2">{row.class_level}</td>
                          <td className="border border-gray-300 p-2">{row.section}</td>
                          <td className="border border-gray-300 p-2">{row.father_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!file || errors.length > 0 || importMutation.isPending}
            className="bg-gradient-to-r from-green-600 to-emerald-600"
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Import Students
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}