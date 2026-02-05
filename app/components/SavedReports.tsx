"use client";

import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, User, Eye, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { supabase, Report } from '../lib/supabase';

interface SavedReportsProps {
  onViewReport: (report: Report) => void;
  refreshTrigger?: number;
}

export function SavedReports({ onViewReport, refreshTrigger }: SavedReportsProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [refreshTrigger]);

  useEffect(() => {
    filterReports();
  }, [searchTerm, reports]);

  const fetchReports = async () => {
    setError(null);
    setLoading(true);
    
    try {
      // Try to fetch with only basic columns first
      const { data, error: fetchError } = await supabase
        .from('reports')
        .select('id, created_at, patient_name, patient_mrn, patient_age, patient_gender, report_type, report_content, diagnosis, exam_date')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw new Error(fetchError.message || 'Failed to fetch reports');
      }

      setReports((data || []).map((report: any) => ({
      ...report,
      specialty: report.specialty || '',
      icd10_codes: report.icd10_codes || []
    })));

    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    if (!searchTerm.trim()) {
      setFilteredReports(reports);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = reports.filter(report => 
      report.patient_name?.toLowerCase().includes(term) ||
      report.patient_mrn?.toLowerCase().includes(term) ||
      report.diagnosis?.toLowerCase().includes(term)
    );
    setFilteredReports(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setReports(reports.filter(r => r.id !== id));
    } catch (error: any) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report: ' + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-800">Saved Reports</h3>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
            {reports.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-200">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Error loading reports</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
                <button
                  onClick={fetchReports}
                  className="mt-2 text-xs text-red-700 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient name, MRN, or diagnosis..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Reports List */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading reports...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No reports found matching your search' : 'No saved reports yet'}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-gradient-to-r from-green-50 to-white rounded-lg border border-green-200 hover:border-green-400 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <h4 className="font-semibold text-gray-800">
                          {report.patient_name || 'Unknown Patient'}
                        </h4>
                        {report.patient_mrn && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            MRN: {report.patient_mrn}
                          </span>
                        )}
                      </div>
                      
                      {report.diagnosis && (
                        <p className="text-sm text-gray-600 mb-1">
                          {report.diagnosis}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(report.created_at)}
                        </div>
                        {report.patient_age && (
                          <span>Age: {report.patient_age}</span>
                        )}
                        {report.patient_gender && (
                          <span>{report.patient_gender}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onViewReport(report)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                        title="View Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
