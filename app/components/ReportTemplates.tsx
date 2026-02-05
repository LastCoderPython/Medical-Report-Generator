"use client";

import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, ReportTemplate } from '../lib/supabase';

interface ReportTemplatesProps {
  onSelectTemplate: (template: ReportTemplate) => void;
}

export function ReportTemplates({ onSelectTemplate }: ReportTemplatesProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('is_active', true)
        .order('specialty', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const specialties = ['All', ...Array.from(new Set(templates.map(t => t.specialty)))];

  const filteredTemplates = selectedSpecialty === 'All' 
    ? templates 
    : templates.filter(t => t.specialty === selectedSpecialty);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Report Templates</h3>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
            {filteredTemplates.length}
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
          {/* Specialty Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Specialty
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading templates...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No templates found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="text-left p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                      {template.name}
                    </h4>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {template.specialty}
                    </span>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
