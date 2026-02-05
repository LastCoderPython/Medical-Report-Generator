"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  BarChart3, TrendingUp, Users, FileText, Activity, 
  Calendar, Clock, PieChart as PieChartIcon 
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface Stats {
  totalReports: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
  totalPatients: number;
  reportsByType: { name: string; value: number; color: string }[];
  reportsByDay: { date: string; count: number }[];
  reportsByAge: { range: string; count: number }[];
  avgReportsPerDay: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalReports: 0,
    reportsThisWeek: 0,
    reportsThisMonth: 0,
    totalPatients: 0,
    reportsByType: [],
    reportsByDay: [],
    reportsByAge: [],
    avgReportsPerDay: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Get all reports
      const { data: allReports, count: totalReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact' });

      if (!allReports) return;

      // Calculate date ranges
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Reports this week
      const reportsThisWeek = allReports.filter(
        r => new Date(r.created_at) >= weekAgo
      ).length;

      // Reports this month
      const reportsThisMonth = allReports.filter(
        r => new Date(r.created_at) >= monthAgo
      ).length;

      // Unique patients
      const uniquePatients = new Set(
        allReports.map(r => `${r.patient_name}-${r.patient_mrn || 'unknown'}`)
      ).size;

      // Reports by type
      const typeCount: { [key: string]: number } = {};
      allReports.forEach(r => {
        typeCount[r.report_type] = (typeCount[r.report_type] || 0) + 1;
      });

      const reportsByType = Object.entries(typeCount).map(([name, value], idx) => ({
        name,
        value,
        color: COLORS[idx % COLORS.length]
      }));

      // Reports by day (last 30 days)
      const dayCount: { [key: string]: number } = {};
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        dayCount[dateStr] = 0;
      }

      allReports.forEach(r => {
        const dateStr = r.created_at.split('T')[0];
        if (dayCount[dateStr] !== undefined) {
          dayCount[dateStr]++;
        }
      });

      const reportsByDay = Object.entries(dayCount).map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      }));

      // Reports by age group
      const ageGroups = {
        '0-18': 0,
        '19-35': 0,
        '36-50': 0,
        '51-65': 0,
        '66+': 0,
        'Unknown': 0
      };

      allReports.forEach(r => {
        const age = r.patient_age;
        if (!age) {
          ageGroups['Unknown']++;
        } else if (age <= 18) {
          ageGroups['0-18']++;
        } else if (age <= 35) {
          ageGroups['19-35']++;
        } else if (age <= 50) {
          ageGroups['36-50']++;
        } else if (age <= 65) {
          ageGroups['51-65']++;
        } else {
          ageGroups['66+']++;
        }
      });

      const reportsByAge = Object.entries(ageGroups).map(([range, count]) => ({
        range,
        count
      }));

      // Average reports per day
      const avgReportsPerDay = (reportsThisMonth / 30).toFixed(1);

      setStats({
        totalReports: totalReports || 0,
        reportsThisWeek,
        reportsThisMonth,
        totalPatients: uniquePatients,
        reportsByType,
        reportsByDay,
        reportsByAge,
        avgReportsPerDay: parseFloat(avgReportsPerDay),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Analytics Dashboard
        </h2>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Reports */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-10 h-10 text-blue-600" />
            <span className="text-4xl font-bold text-blue-900">
              {stats.totalReports}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-blue-800">Total Reports</h3>
          <p className="text-xs text-blue-600 mt-1">All time</p>
        </div>

        {/* This Month */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 text-green-600" />
            <span className="text-4xl font-bold text-green-900">
              {stats.reportsThisMonth}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-green-800">This Month</h3>
          <p className="text-xs text-green-600 mt-1">Last 30 days</p>
        </div>

        {/* Unique Patients */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-purple-600" />
            <span className="text-4xl font-bold text-purple-900">
              {stats.totalPatients}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-purple-800">Unique Patients</h3>
          <p className="text-xs text-purple-600 mt-1">In database</p>
        </div>

        {/* Avg Per Day */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-10 h-10 text-orange-600" />
            <span className="text-4xl font-bold text-orange-900">
              {stats.avgReportsPerDay}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-orange-800">Avg Per Day</h3>
          <p className="text-xs text-orange-600 mt-1">This month</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Over Time - Line Chart */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Reports Over Time (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.reportsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Reports by Type - Pie Chart */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-green-600" />
            Reports by Specialty
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.reportsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(1) : '0'}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                >

                {stats.reportsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reports by Age Group - Bar Chart */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Patient Age Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.reportsByAge}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
