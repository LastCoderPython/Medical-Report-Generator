"use client";

import ReactMarkdown from 'react-markdown';
import { Download, Copy, Check, FileDown, Printer, Save, X, Loader2, FileText } from 'lucide-react';
import { useState } from 'react';
import { generatePDF } from '../lib/pdfExport';
import { supabase } from '../lib/supabase';
import { exportToPDF, exportToDocx, printReport, sanitizeFileName, ExportData } from '../lib/exportUtils';

interface ReportDisplayProps {
  message: {
    content: string;
  };
  specialty?: string;
  onSave?: () => void;
}

export function ReportDisplay({ message, specialty, onSave }: ReportDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const textContent = message.content;

  // Extract patient name from content if available
  const extractPatientName = (): string => {
    const match = textContent.match(/(?:Patient Name|Full Patient Name|Full Name):\s*([^\n]+)/i);
    return match ? match[1].trim() : 'Unknown Patient';
  };

  // Extract specialty from content or props
  const extractSpecialty = (): string => {
    if (specialty) {
      return specialty;
    }
    const bracketMatch = textContent.match(/\[(.*?)\s+Report\]/i);
    if (bracketMatch) {
      return bracketMatch[1].trim();
    }
    const specialtyMatch = textContent.match(/Specialty:\s*([^\n]+)/i);
    if (specialtyMatch) {
      return specialtyMatch[1].trim();
    }
    return 'General';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadText = () => {
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const fileName = `${sanitizeFileName(extractPatientName())}_report_${Date.now()}.pdf`;
      await exportToPDF('report-content', fileName);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    try {
      const exportData: ExportData = {
        patientName: extractPatientName(),
        specialty: extractSpecialty(),
        content: textContent,
        date: new Date().toLocaleDateString(),
      };
      const fileName = `${sanitizeFileName(extractPatientName())}_report_${Date.now()}.docx`;
      await exportToDocx(exportData, fileName);
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      alert('Failed to export DOCX');
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  };

  const handlePrint = () => {
    try {
      printReport('report-content');
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error printing:', error);
      alert('Failed to print report');
    }
  };

  const handleSaveReport = async () => {
    if (!patientName.trim()) {
      alert('Please enter patient name');
      return;
    }

    setSaving(true);
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching user:', userError);
        throw userError;
      }
      if (!user) {
        alert('You must be logged in to save reports');
        return;
      }

      // Optional: fetch user's organization from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // Ignore "row not found", log others
        console.error('Error fetching profile:', profileError);
      }

      // Extract patient information from report
      const mrnMatch = textContent.match(/MRN[:\s]+([A-Z0-9]+)/i);
      const ageMatch = textContent.match(/Age:\s*(\d+)/i);
      const genderMatch = textContent.match(/Gender:\s*(\w+)/i);
      const diagnosisMatch = textContent.match(/Primary Diagnosis:\s*([^\n]+)/i);
      const dateMatch = textContent.match(/Date of Examination:\s*([^\n]+)/i);

      const patientMRN = mrnMatch ? mrnMatch[1] : null;
      const patientAge = ageMatch ? parseInt(ageMatch[1]) : null;
      const patientGender = genderMatch ? genderMatch[1] : null;
      const diagnosis = diagnosisMatch ? diagnosisMatch[1].trim() : null;
      const examDate = dateMatch ? dateMatch[1].trim() : null;

      // Extract ICD-10 codes
      const icd10Matches = textContent.match(/ICD-10:\s*([A-Z0-9.]+)/gi);
      const icd10Codes = icd10Matches ? icd10Matches.map(m => m.replace('ICD-10:', '').trim()) : null;

      const reportSpecialty = extractSpecialty();
      console.log('Saving report with specialty:', reportSpecialty);

      const { data, error } = await supabase
        .from('reports')
        .insert({
          patient_name: patientName,
          patient_mrn: patientMRN,
          patient_age: patientAge,
          patient_gender: patientGender,
          specialty: reportSpecialty,
          report_type: reportSpecialty,
          report_content: textContent,
          diagnosis: diagnosis,
          icd10_codes: icd10Codes,
          exam_date: examDate,
          // RLS-related fields
          user_id: user.id,                               // text column, UUID string is fine
          organization_id: profile?.organization_id ?? null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving report:', error);
        throw error;
      }

      console.log('Report saved successfully:', data);

      setSaved(true);
      setShowSaveDialog(false);
      setTimeout(() => setSaved(false), 3000);

      if (onSave) onSave();
    } catch (error: any) {
      console.error('Error saving report:', error);
      alert(`Failed to save report: ${error.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4 no-print">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </button>

          {showExportMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border-2 border-gray-200 py-2 z-10">
              <button
                onClick={handleExportPDF}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 text-gray-700 transition text-sm"
              >
                <FileText className="w-4 h-4 text-red-600" />
                <div>
                  <div className="font-medium">PDF</div>
                  <div className="text-xs text-gray-500">Portable</div>
                </div>
              </button>
              <button
                onClick={handleExportDocx}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 text-gray-700 transition text-sm"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-medium">DOCX</div>
                  <div className="text-xs text-gray-500">Editable</div>
                </div>
              </button>
              <button
                onClick={handleDownloadText}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 text-gray-700 transition text-sm"
              >
                <FileDown className="w-4 h-4 text-gray-600" />
                <div>
                  <div className="font-medium">TXT</div>
                  <div className="text-xs text-gray-500">Plain text</div>
                </div>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>

        <button
          onClick={() => setShowSaveDialog(true)}
          disabled={saving || saved}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save to Database
            </>
          )}
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Save Report to Database</h3>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && patientName.trim()) {
                      handleSaveReport();
                    }
                  }}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Specialty:</strong> {extractSpecialty()}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReport}
                  disabled={!patientName.trim() || saving}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div id="report-content" className="prose prose-sm max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-3 pb-2 border-b-2 border-blue-500">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-gray-800 mt-5 mb-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 mb-3 leading-relaxed">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="ml-4 text-gray-700">
                {children}
              </li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-900">
                {children}
              </strong>
            ),
          }}
        >
          {textContent}
        </ReactMarkdown>
      </div>

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
}
