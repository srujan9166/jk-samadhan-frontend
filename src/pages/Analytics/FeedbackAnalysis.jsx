import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Star, 
  ThumbsUp, 
  PhoneCall, 
  BarChart3, 
  PieChart as PieIcon, 
  Filter, 
  X, 
  ExternalLink,
  Award,
  TrendingUp,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import grievanceService from '../../services/grievanceService';
import axiosClient from '../../api/axiosClient';

export default function FeedbackAnalysis() {
  const navigate = useNavigate();

  // Section toggle: 'feedback' or 'mis'
  const [activeSection, setActiveSection] = useState('feedback');

  // Master Data options for filters
  const [departmentList, setDepartmentList] = useState([]);
  const [districtList, setDistrictList] = useState([]);

  // Filter States
  const [selectedDept, setSelectedDept] = useState('0');
  const [selectedDistrict, setSelectedDistrict] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState('0');
  const [selectedGender, setSelectedGender] = useState('0');
  const [selectedSatisfaction, setSelectedSatisfaction] = useState('0');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Summary KPI & Chart Data
  const [summary, setSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  // Table Data State (Feedback List)
  const [feedbackList, setFeedbackList] = useState([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // MIS Report Data State
  const [misList, setMisList] = useState([]);
  const [isMisLoading, setIsMisLoading] = useState(false);

  // Modal State for Viewing Single Feedback Detail
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Fetch Master Data (Departments & Districts)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [deptRes, distRes] = await Promise.all([
          axiosClient.get('/api/master/departments').catch(() => ({ data: [] })),
          axiosClient.get('/api/master/districts').catch(() => ({ data: [] }))
        ]);
        if (Array.isArray(deptRes.data)) setDepartmentList(deptRes.data);
        if (Array.isArray(distRes.data)) setDistrictList(distRes.data);
      } catch (err) {
        console.error('Error fetching master data:', err);
      }
    };
    fetchMasterData();
  }, []);

  // Fetch Summary Data
  const fetchSummary = async () => {
    setIsSummaryLoading(true);
    try {
      const params = {
        department: selectedDept !== '0' ? selectedDept : '',
        district: selectedDistrict !== '0' ? selectedDistrict : '',
        category: selectedCategory !== '0' ? selectedCategory : '',
        gender: selectedGender !== '0' ? selectedGender : '',
        satisfaction: selectedSatisfaction !== '0' ? selectedSatisfaction : '',
        dateFrom,
        dateTo
      };
      const res = await grievanceService.getFeedbackSummary(params);
      if (res) setSummary(res);
    } catch (err) {
      console.error('Error fetching Feedback Summary:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Fetch Feedback List Data
  const fetchFeedbackList = async () => {
    setIsListLoading(true);
    try {
      const params = {
        department: selectedDept !== '0' ? selectedDept : '',
        district: selectedDistrict !== '0' ? selectedDistrict : '',
        category: selectedCategory !== '0' ? selectedCategory : '',
        gender: selectedGender !== '0' ? selectedGender : '',
        satisfaction: selectedSatisfaction !== '0' ? selectedSatisfaction : '',
        dateFrom,
        dateTo,
        search: searchQuery || '',
        page: currentPage - 1,
        size: pageSize
      };
      const res = await grievanceService.getFeedbackList(params);
      if (res) {
        setFeedbackList(res.content || []);
        setTotalRecords(res.totalElements || 0);
        setTotalPages(res.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching Feedback List:', err);
    } finally {
      setIsListLoading(false);
    }
  };

  // Fetch MIS Report Data
  const fetchMisReport = async () => {
    setIsMisLoading(true);
    try {
      const params = {
        department: selectedDept !== '0' ? selectedDept : '',
        district: selectedDistrict !== '0' ? selectedDistrict : '',
        dateFrom,
        dateTo
      };
      const res = await grievanceService.getFeedbackMisReport(params);
      if (Array.isArray(res)) setMisList(res);
    } catch (err) {
      console.error('Error fetching MIS report:', err);
    } finally {
      setIsMisLoading(false);
    }
  };

  // Trigger Data Fetching on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSummary();
      if (activeSection === 'feedback') {
        fetchFeedbackList();
      } else {
        fetchMisReport();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedDept, selectedDistrict, selectedCategory, selectedGender, selectedSatisfaction, dateFrom, dateTo, searchQuery, currentPage, pageSize, activeSection]);

  const handleResetFilters = () => {
    setSelectedDept('0');
    setSelectedDistrict('0');
    setSelectedCategory('0');
    setSelectedGender('0');
    setSelectedSatisfaction('0');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Export Feedback Table to Excel
  const exportFeedbackExcel = () => {
    const exportData = feedbackList.map((item, idx) => ({
      'S. No.': (currentPage - 1) * pageSize + idx + 1,
      'Grievance ID': item.uniqId || 'N/A',
      'Complainant Name': item.complainantName || 'N/A',
      'Mobile': item.complainantMobile || 'N/A',
      'Department': item.department || 'N/A',
      'Category': item.category || 'N/A',
      'District': item.district || 'N/A',
      'Disposal Experience': item.overallExperience || 'N/A',
      'Solution Satisfied': item.satisfied || 'N/A',
      'Call Received': item.callReceived || 'N/A',
      'Time Satisfaction': item.timeSatisfaction || 'N/A',
      'Submitted Date': item.createdAt || 'N/A',
      'Comments': item.description || item.poorReason || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Feedback_Data');
    XLSX.writeFile(workbook, `Feedback_Analysis_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export Feedback Table to PDF
  const exportFeedbackPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Feedback Analysis Report', 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const headers = [['S. No.', 'Grievance ID', 'Complainant', 'Department', 'Experience', 'Satisfied', 'Call Received', 'Date']];
    const rows = feedbackList.map((item, idx) => [
      (currentPage - 1) * pageSize + idx + 1,
      item.uniqId || 'N/A',
      item.complainantName || 'N/A',
      item.department || 'N/A',
      item.overallExperience || 'N/A',
      item.satisfied || 'N/A',
      item.callReceived || 'N/A',
      item.createdAt || 'N/A'
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138] }
    });

    doc.save('Feedback_Analysis_Report.pdf');
  };

  // Export MIS Table to Excel
  const exportMisExcel = () => {
    const exportData = misList.map((item, idx) => ({
      'S. No.': idx + 1,
      'Department Name': item.department,
      'Total Feedback': item.totalGrievances,
      'Satisfied Yes (%)': item.satisfiedYesPercent,
      'Satisfied No (%)': item.satisfiedNoPercent,
      'Call Received Yes (%)': item.callReceivedYesPercent,
      'Call Received No (%)': item.callReceivedNoPercent,
      'Experience Excellent (%)': item.experienceExcellentPercent,
      'Experience Good (%)': item.experienceGoodPercent,
      'Experience Average (%)': item.experienceAveragePercent,
      'Experience Poor (%)': item.experiencePoorPercent
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'MIS_Feedback_Report');
    XLSX.writeFile(workbook, `Feedback_MIS_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header & Radio Section Toggle */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Feedback Analysis
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Comprehensive citizen feedback metrics, rating distributions, and department MIS reporting.
            </p>
          </div>

          {/* Radio Button Toggle: Feedback Analysis vs MIS Report */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start md:self-auto">
            <label 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeSection === 'feedback'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <input 
                type="radio" 
                name="mainFeedbackReportType" 
                value="feedback" 
                checked={activeSection === 'feedback'} 
                onChange={() => setActiveSection('feedback')} 
                className="hidden" 
              />
              <BarChart3 className="w-4 h-4" />
              <span>Feedback Analysis Section</span>
            </label>

            <label 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                activeSection === 'mis'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <input 
                type="radio" 
                name="mainFeedbackReportType" 
                value="mis" 
                checked={activeSection === 'mis'} 
                onChange={() => setActiveSection('mis')} 
                className="hidden" 
              />
              <FileSpreadsheet className="w-4 h-4" />
              <span>MIS REPORT</span>
            </label>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="0">All Departments</option>
              {departmentList.map((d) => (
                <option key={d.id || d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="0">All Districts</option>
              {districtList.map((d) => (
                <option key={d.id || d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Gender</label>
            <select
              value={selectedGender}
              onChange={(e) => { setSelectedGender(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="0">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="TRANSGENDER">Transgender</option>
            </select>
          </div>

          {/* Disposal Satisfaction Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Satisfaction Level</label>
            <select
              value={selectedSatisfaction}
              onChange={(e) => { setSelectedSatisfaction(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="0">All Satisfaction</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Reset Filters */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Feedback */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Feedbacks</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
              {isSummaryLoading ? '...' : summary?.totalFeedbacks || 0}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-2xl">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Satisfied Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Solution Satisfied</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {isSummaryLoading ? '...' : `${summary?.satisfiedYesPercent || 0}%`}
              </h3>
              <span className="text-[11px] font-bold text-slate-400">({summary?.satisfiedYesCount || 0} Yes)</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>

        {/* Call Received Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Dept Contacted</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {isSummaryLoading ? '...' : `${summary?.callReceivedYesPercent || 0}%`}
              </h3>
              <span className="text-[11px] font-bold text-slate-400">({summary?.callReceivedYesCount || 0} Yes)</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-2xl">
            <PhoneCall className="w-6 h-6" />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg Experience Score</p>
            <div className="flex items-center gap-1.5 mt-1">
              <h3 className="text-2xl font-black text-amber-500">
                {isSummaryLoading ? '...' : (summary?.avgRating || 0).toFixed(1)}
              </h3>
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Section Content */}
      {activeSection === 'feedback' ? (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Chart 1: Solution Satisfied */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-500" />
                Satisfied with Solution
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-600">Yes</span>
                    <span>{summary?.satisfiedYesPercent || 0}% ({summary?.satisfiedYesCount || 0})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${summary?.satisfiedYesPercent || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-rose-600">No</span>
                    <span>{summary?.satisfiedNoPercent || 0}% ({summary?.satisfiedNoCount || 0})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${summary?.satisfiedNoPercent || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Call Received */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-indigo-500" />
                Department Contact Received
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-indigo-600">Call / Message Received</span>
                    <span>{summary?.callReceivedYesPercent || 0}% ({summary?.callReceivedYesCount || 0})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${summary?.callReceivedYesPercent || 0}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">No Contact</span>
                    <span>{summary?.callReceivedNoPercent || 0}% ({summary?.callReceivedNoCount || 0})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${summary?.callReceivedNoPercent || 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: Experience Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Disposal Experience
              </h4>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between font-semibold">
                  <span className="text-emerald-600">Excellent</span>
                  <span>{summary?.experienceExcellentCount || 0} ({summary?.experienceExcellentPercent || 0}%)</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-blue-600">Good</span>
                  <span>{summary?.experienceGoodCount || 0} ({summary?.experienceGoodPercent || 0}%)</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-amber-600">Average</span>
                  <span>{summary?.experienceAverageCount || 0} ({summary?.experienceAveragePercent || 0}%)</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-rose-600">Poor</span>
                  <span>{summary?.experiencePoorCount || 0} ({summary?.experiencePoorPercent || 0}%)</span>
                </div>
              </div>
            </div>

            {/* Chart 4: Recommendation */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Recommend Portal
              </h4>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between font-semibold">
                  <span className="text-emerald-600">Yes Definitely</span>
                  <span>{summary?.reuseYesDefinitelyCount || 0}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-blue-600">Maybe (Less Time)</span>
                  <span>{summary?.reuseMaybeLessTimeCount || 0}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Maybe (Process Change)</span>
                  <span>{summary?.reuseProcessChangeCount || 0}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-rose-600">No Never</span>
                  <span>{summary?.reuseNoNeverCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Controls Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search grievance ID, citizen, comments..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>entries</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportFeedbackExcel}
                    disabled={feedbackList.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={exportFeedbackPDF}
                    disabled={feedbackList.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            {isListLoading ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-xs">Loading feedback records...</p>
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-400 stroke-1" />
                <p className="text-sm font-semibold">No Feedback Records Found</p>
                <p className="text-xs text-slate-400">Try adjusting your filters or date range.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3.5 w-14 text-center">S. No.</th>
                      <th className="p-3.5">Grievance ID</th>
                      <th className="p-3.5">Complainant</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Experience</th>
                      <th className="p-3.5 text-center">Satisfied</th>
                      <th className="p-3.5 text-center">Call Received</th>
                      <th className="p-3.5">Submitted Date</th>
                      <th className="p-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {feedbackList.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 text-center font-medium text-slate-400">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="p-3.5 font-semibold text-blue-600 dark:text-blue-400">{item.uniqId}</td>
                        <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">{item.complainantName || 'N/A'}</td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-400">{item.department || 'N/A'}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.overallExperience === 'Excellent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                            item.overallExperience === 'Good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400' :
                            item.overallExperience === 'Average' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}>
                            {item.overallExperience || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold">
                          <span className={item.satisfied === 'Yes' ? 'text-emerald-600' : 'text-rose-500'}>
                            {item.satisfied || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold">
                          <span className={item.callReceived === 'Yes' ? 'text-indigo-600' : 'text-slate-400'}>
                            {item.callReceived || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{item.createdAt || 'N/A'}</td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedFeedback(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                            title="View Feedback Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!isListLoading && feedbackList.length > 0 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div>
                  Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(currentPage * pageSize, totalRecords)}</span> of{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{totalRecords}</span> entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold">
                    {currentPage} / {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* MIS Report View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Department-Wise Feedback MIS Report</h3>
            <button
              onClick={exportMisExcel}
              disabled={misList.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export MIS Excel</span>
            </button>
          </div>

          {isMisLoading ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs">Loading MIS Report...</p>
            </div>
          ) : misList.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No MIS Report data found.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 w-12 text-center">S. No.</th>
                    <th className="p-3">Department Name</th>
                    <th className="p-3 text-center">Total Feedbacks</th>
                    <th className="p-3 text-center text-emerald-600">Satisfied (%)</th>
                    <th className="p-3 text-center text-rose-500">Dissatisfied (%)</th>
                    <th className="p-3 text-center text-indigo-600">Call Recv (%)</th>
                    <th className="p-3 text-center">Excellent (%)</th>
                    <th className="p-3 text-center">Good (%)</th>
                    <th className="p-3 text-center">Average (%)</th>
                    <th className="p-3 text-center text-rose-500">Poor (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {misList.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="p-3 text-center font-medium text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{m.department}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{m.totalGrievances}</td>
                      <td className="p-3 text-center font-bold text-emerald-600">{m.satisfiedYesPercent}%</td>
                      <td className="p-3 text-center font-bold text-rose-500">{m.satisfiedNoPercent}%</td>
                      <td className="p-3 text-center font-bold text-indigo-600">{m.callReceivedYesPercent}%</td>
                      <td className="p-3 text-center">{m.experienceExcellentPercent}%</td>
                      <td className="p-3 text-center">{m.experienceGoodPercent}%</td>
                      <td className="p-3 text-center">{m.experienceAveragePercent}%</td>
                      <td className="p-3 text-center text-rose-500 font-bold">{m.experiencePoorPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Single Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-800 dark:text-white">Feedback Details #{selectedFeedback.uniqId}</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 py-1.5">
                <span className="text-slate-400 font-medium">Complainant:</span>
                <span className="font-bold">{selectedFeedback.complainantName || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 py-1.5">
                <span className="text-slate-400 font-medium">Department:</span>
                <span className="font-semibold">{selectedFeedback.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 py-1.5">
                <span className="text-slate-400 font-medium">Overall Experience:</span>
                <span className="font-bold text-emerald-600">{selectedFeedback.overallExperience || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 py-1.5">
                <span className="text-slate-400 font-medium">Satisfied with Solution:</span>
                <span className="font-bold">{selectedFeedback.satisfied || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 py-1.5">
                <span className="text-slate-400 font-medium">Call/Message Received:</span>
                <span className="font-bold">{selectedFeedback.callReceived || 'N/A'}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 font-medium block mb-1">Feedback Comments:</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 italic">
                  "{selectedFeedback.description || selectedFeedback.poorReason || 'No comments provided.'}"
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  const gId = selectedFeedback.grievanceId;
                  setSelectedFeedback(null);
                  if (gId) navigate(`/grievance/${gId}`);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <span>View Full Grievance</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
