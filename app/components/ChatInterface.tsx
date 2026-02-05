"use client";

import { useState } from 'react';
import { useTambo, useTamboThreadInput } from '@tambo-ai/react';
import { ReportDisplay } from './ReportDisplay';
import { ReportTemplates } from './ReportTemplates';
import { SavedReports } from './SavedReports';
import { ImageUpload } from './ImageUpload';
import { SpecialtySelector } from './SpecialtySelector';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { Send, Loader2, FileText, Sparkles, BarChart3 } from 'lucide-react';
import { Report, ReportTemplate } from '../lib/supabase';

export function ChatInterface() {
  const { thread } = useTambo();
const { value, setValue, isPending, submit } = useTamboThreadInput();

const safeSubmit = () => {
  try {
    submit();
  } catch (error) {
    console.error('Tambo input error:', error);
  }
};

  const [selectedSpecialty, setSelectedSpecialty] = useState('Ophthalmology');
  const [currentReportSpecialty, setCurrentReportSpecialty] = useState('Ophthalmology');
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [refreshReports, setRefreshReports] = useState(0);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<'generator' | 'analytics'>('generator');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isPending) return;
    
    // Store current specialty for this report
    setCurrentReportSpecialty(selectedSpecialty);
    
    // Store the original value
    const originalValue = value;
    
    // Add specialty context to prompt
    const enhancedPrompt = `[${selectedSpecialty} Report]\n\n${originalValue}`;
    
    // Clear input first
    setValue('');
    
    // Submit with enhanced prompt
    setTimeout(() => {
      setValue(enhancedPrompt);
      setTimeout(() => {
        submit();
      }, 50);
    }, 50);
  };

  const handleTemplateSelect = (template: ReportTemplate) => {
    setValue(template.template_content);
    setSelectedSpecialty(template.specialty);
    setActiveTab('generator'); // Switch to generator tab
  };

  const handleViewReport = (report: Report) => {
    setViewingReport(report);
    setActiveTab('generator'); // Switch to generator tab
  };

  const handleReportSaved = () => {
    setRefreshReports(prev => prev + 1);
  };

  const messages = thread?.messages || [];

  const getMessageText = (content: any): string => {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && 'text' in item) return item.text;
          return '';
        })
        .join('\n');
    }
    if (content && typeof content === 'object' && 'text' in content) {
      return content.text;
    }
    return String(content);
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Tab Navigation */}
      <div className="bg-white border-b-2 border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex gap-2">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'generator'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-5 h-5" />
            Report Generator
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics Dashboard
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'generator' ? (
        /* GENERATOR TAB */
        <>
          {/* Sidebar with Templates and Saved Reports */}
          <div className="flex-1 flex gap-6 p-6 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 overflow-y-auto">
            {/* Left Sidebar */}
            <div className="w-80 flex-shrink-0 space-y-4">
              <ReportTemplates onSelectTemplate={handleTemplateSelect} />
              <SavedReports 
                onViewReport={handleViewReport} 
                refreshTrigger={refreshReports}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-5xl">
              {messages.length === 0 && !viewingReport ? (
                <div className="space-y-6">
                  {/* Welcome Section */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                      Medical Report Generator
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                      AI-powered medical documentation system
                    </p>
                  </div>

                  {/* Specialty Selector */}
                  <SpecialtySelector 
                    selectedSpecialty={selectedSpecialty}
                    onSpecialtyChange={setSelectedSpecialty}
                  />

                  {/* Image Upload */}
                  <ImageUpload onImagesChange={setAttachedImages} />

                  {/* Quick Start Examples */}
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Quick Start Examples</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setSelectedSpecialty('Ophthalmology');
                          setValue("Generate a complete ophthalmology report for a 58-year-old female with newly diagnosed age-related macular degeneration");
                        }}
                        className="text-left p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Sparkles className="w-5 h-5 text-blue-500" />
                          <span className="font-semibold text-gray-800">AMD Case</span>
                        </div>
                        <p className="text-sm text-gray-600">Complete ophthalmology report</p>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSpecialty('Cardiology');
                          setValue("Create cardiology report for 65-year-old male presenting with chest pain, elevated troponin, and ECG changes");
                        }}
                        className="text-left p-4 bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-200 hover:border-red-400 hover:shadow-md transition group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Sparkles className="w-5 h-5 text-red-500" />
                          <span className="font-semibold text-gray-800">Chest Pain</span>
                        </div>
                        <p className="text-sm text-gray-600">Cardiology evaluation</p>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Viewing Saved Report */}
                  {viewingReport && (
                    <div className="bg-white rounded-xl border-2 border-green-300 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {viewingReport.patient_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {viewingReport.specialty} • Saved: {new Date(viewingReport.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => setViewingReport(null)}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                        >
                          Close
                        </button>
                      </div>
                      <ReportDisplay 
                        message={{ content: viewingReport.report_content }}
                        specialty={viewingReport.specialty}
                        onSave={handleReportSaved}
                      />
                    </div>
                  )}

                  {/* Generated Reports */}
                  {messages.map((message: any, idx: number) => {
                    const textContent = getMessageText(message.content);
                    
                    return (
                      <div key={idx} className={`${
                        message.role === 'user' 
                          ? 'ml-auto max-w-2xl' 
                          : 'mr-auto w-full'
                      }`}>
                        <div className={`${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
                            : 'bg-white border border-gray-200 shadow-md'
                        } p-5 rounded-2xl`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === 'user' 
                                ? 'bg-white/20' 
                                : 'bg-gradient-to-br from-blue-500 to-purple-600'
                            }`}>
                              <span className="text-sm font-bold text-white">
                                {message.role === 'user' ? 'You' : 'AI'}
                              </span>
                            </div>
                            <span className={`font-semibold text-sm ${
                              message.role === 'user' ? 'text-white' : 'text-gray-700'
                            }`}>
                              {message.role === 'user' ? 'Your Input' : 'Generated Report'}
                            </span>
                          </div>
                          
                          {message.role === 'user' ? (
                            <div className="text-white whitespace-pre-wrap">
                              {textContent.replace(/^\[.*?\]\n\n/, '')}
                            </div>
                          ) : (
                            <ReportDisplay 
                              message={{ content: textContent }}
                              specialty={currentReportSpecialty}
                              onSave={handleReportSaved}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {isPending && (
                    <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-md">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      <div>
                        <p className="text-gray-800 font-medium">Generating {selectedSpecialty} report...</p>
                        <p className="text-sm text-gray-500">AI is analyzing clinical findings</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="bg-white border-t-2 border-gray-200 p-6 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={isPending}
                  placeholder={`Describe ${selectedSpecialty.toLowerCase()} findings...`}
                  className="flex-1 p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 placeholder-gray-400 transition"
                />
                <button 
                  type="submit"
                  disabled={isPending || !value.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                {selectedSpecialty} Report • Press Enter to generate • All data saved securely
              </p>
            </div>
          </form>
        </>
      ) : (
        /* ANALYTICS TAB */
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 p-6">
          <AnalyticsDashboard />
        </div>
      )}
    </div>
  );
}
