import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  PieChart,
  Calendar,
  Copy,
  Flag,
  ThumbsUp,
  AlertCircle,
  Presentation,
  Search,
  FileSpreadsheet,
  FileText,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import grievanceService from '../../services/grievanceService';

export default function JkIgramsDashboardView({ user }) {
  const navigate = useNavigate();

  // Summary KPI State
  const [summary, setSummary] = useState({
    totalGrievanceReceived: 14327,
    pendingWithDepartment: 14324,
    forwarded: 3,
    remarkAdded: 0,
    resolved: 0,
    rejected: 0,
    doesNotPertain: 0
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  // Table Data State
  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState('DESC');

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Load KPI Summary
  const fetchSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const data = await grievanceService.getJkigramsSummary();
      if (data) {
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to load JK-IGRAMS summary:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  // Load Grievance List
  const fetchGrievances = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: page - 1,
        size,
        search: debouncedSearch,
        status: statusFilter,
        sortBy,
        sortDirection
      };
      const res = await grievanceService.getJkigramsGrievances(params);
      if (res && res.content) {
        setGrievances(res.content);
        setTotalElements(res.totalElements || 0);
        setTotalPages(res.totalPages || 1);
      } else {
        setGrievances([]);
        setTotalElements(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load JK-IGRAMS grievances:', err);
      setError('Unable to load JK-IGRAMS data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, size, debouncedSearch, statusFilter, sortBy, sortDirection]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchGrievances();
  }, [fetchGrievances]);

  // Handle Sort Change
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortDirection('ASC');
    }
  };

  // Status Filter on KPI click
  const handleKpiFilter = (statusVal) => {
    setStatusFilter(statusFilter === statusVal ? '' : statusVal);
    setPage(1);
  };

  // Excel Export
  const handleExportExcel = () => {
    if (!grievances || grievances.length === 0) return;
    const exportData = grievances.map((g, idx) => ({
      'S. No.': (page - 1) * size + idx + 1,
      'Reference ID': g.referenceId,
      'Category': g.category,
      'Submitted On': g.submittedOn,
      'Applicant Name': g.applicantName,
      'Applicant Gender': g.applicantGender,
      'Applicant Email': g.applicantEmail,
      'Mobile No': g.mobileNo,
      'Constituency': g.constituency,
      'CPGRAMS Reg No': g.cpgramsRegNo || 'NA',
      'Pending With': g.pendingWith,
      'JKIGRAMS Status': g.jkigramsStatus,
      'JKSamadhan Status': g.jksamadhanStatus
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'JK-IGRAMS');
    XLSX.writeFile(wb, `JK-IGRAMS_Grievances_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // PDF Export
  const handleExportPDF = () => {
    if (!grievances || grievances.length === 0) return;
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text('JK-IGRAMS Grievance Report', 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const headers = [
      ['S.No', 'Ref ID', 'Category', 'Submitted On', 'Applicant', 'Gender', 'Mobile', 'Constituency', 'Pending With', 'JKIGRAMS Status', 'Status']
    ];

    const data = grievances.map((g, idx) => [
      (page - 1) * size + idx + 1,
      g.referenceId,
      g.category,
      g.submittedOn,
      g.applicantName,
      g.applicantGender,
      g.mobileNo,
      g.constituency,
      g.pendingWith,
      g.jkigramsStatus,
      g.jksamadhanStatus
    ]);

    doc.autoTable({
      head: headers,
      body: data,
      startY: 26,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175] }
    });

    doc.save(`JK-IGRAMS_Grievance_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Badge Renderer for J&K Samadhan Status
  const renderStatusBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'resolved' || s === 'closed' || s === 'case closed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300">
          ✓ Resolved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/50 dark:text-rose-300">
          ✕ Rejected
        </span>
      );
    }
    if (s === 'forwarded') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-950/50 dark:text-teal-300">
          Forwarded
        </span>
      );
    }
    if (s.includes('does not pertain') || s === 'dnptooffice') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-950/50 dark:text-purple-300">
          Does not pertain
        </span>
      );
    }
    // Default Pending
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-400 text-slate-950 shadow-2xs">
        <AlertTriangle className="w-3 h-3 text-slate-950 shrink-0" />
        {status || 'Pending'}
      </span>
    );
  };

  const startEntry = totalElements === 0 ? 0 : (page - 1) * size + 1;
  const endEntry = Math.min(page * size, totalElements);

  return (
    <div className="space-y-6">
      {/* ── 1. Top Section Heading Pill ── */}
      <div className="bg-[#b39ddb] dark:bg-[#5e35b1] text-slate-900 dark:text-white py-2.5 px-4 rounded-xl text-center shadow-2xs font-extrabold text-sm tracking-wide">
        JK-IGRAMS
      </div>

      {/* ── 2. KPI Summary Cards Grid (7 Cards matching reference layout) ── */}
      <div className="space-y-3">
        {/* Row 1: Top 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Grievance Received */}
          <div
            onClick={() => handleKpiFilter('')}
            className={`p-4 rounded-2xl text-white transition-all cursor-pointer shadow-sm hover:shadow-md ${
              statusFilter === '' ? 'ring-3 ring-blue-300 dark:ring-blue-700' : ''
            }`}
            style={{ backgroundColor: '#1877f2' }}
          >
            <p className="text-xs font-semibold text-blue-100 mb-1">Total Grievance Received</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black">
                {isSummaryLoading ? '...' : summary.totalGrievanceReceived?.toLocaleString() || '14,327'}
              </h3>
              <div className="p-2 bg-white/20 rounded-xl">
                <PieChart className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Card 2: Pending with Department */}
          <div
            onClick={() => handleKpiFilter('Pending')}
            className={`p-4 rounded-2xl text-white transition-all cursor-pointer shadow-sm hover:shadow-md ${
              statusFilter === 'Pending' ? 'ring-3 ring-teal-300 dark:ring-teal-700' : ''
            }`}
            style={{ backgroundColor: '#008b8b' }}
          >
            <p className="text-xs font-semibold text-teal-100 mb-1">Pending with Department</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black">
                {isSummaryLoading ? '...' : summary.pendingWithDepartment?.toLocaleString() || '14,314'}
              </h3>
              <div className="p-2 bg-white/20 rounded-xl">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Card 3: Forwarded */}
          <div
            onClick={() => handleKpiFilter('Forwarded')}
            className={`p-4 rounded-2xl text-white transition-all cursor-pointer shadow-sm hover:shadow-md ${
              statusFilter === 'Forwarded' ? 'ring-3 ring-lime-300 dark:ring-lime-700' : ''
            }`}
            style={{ backgroundColor: '#65a30d' }}
          >
            <p className="text-xs font-semibold text-lime-100 mb-1">Forwarded</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black">
                {isSummaryLoading ? '...' : summary.forwarded?.toLocaleString() || '3'}
              </h3>
              <div className="p-2 bg-white/20 rounded-xl">
                <Copy className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Card 4: Remark Added */}
          <div
            onClick={() => handleKpiFilter('Remark Added')}
            className={`p-4 rounded-2xl text-white transition-all cursor-pointer shadow-sm hover:shadow-md ${
              statusFilter === 'Remark Added' ? 'ring-3 ring-orange-300 dark:ring-orange-700' : ''
            }`}
            style={{ backgroundColor: '#f97316' }}
          >
            <p className="text-xs font-semibold text-orange-100 mb-1">Remark Added</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black">
                {isSummaryLoading ? '...' : summary.remarkAdded?.toLocaleString() || '0'}
              </h3>
              <div className="p-2 bg-white/20 rounded-xl">
                <Flag className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Bottom 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 5: Resolved */}
          <div
            onClick={() => handleKpiFilter('Resolved')}
            className={`p-4 rounded-2xl text-white transition-all cursor-pointer shadow-sm hover:shadow-md ${
              statusFilter === 'Resolved' ? 'ring-3 ring-amber-300 dark:ring-amber-700' : ''
            }`}
            style={{ backgroundColor: '#eab308' }}
          >
            <p className="text-xs font-semibold text-amber-100 mb-1">Resolved</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black">
                {isSummaryLoading ? '...' : summary.resolved?.toLocaleString() || '0'}
              </h3>
              <div className="p-2 bg-white/20 rounded-xl">
                <ThumbsUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Card 6: Rejected */}
          <div
            onClick={() => handleKpiFilter('Rejected')}
            className={`p-4 rounded-2xl text-white transition-all cursor-pointer shadow-sm hover:shadow-md ${
              statusFilter === 'Rejected' ? 'ring-3 ring-purple-300 dark:ring-purple-700' : ''
            }`}
            style={{ backgroundColor: '#8b5cf6' }}
          >
            <p className="text-xs font-semibold text-purple-100 mb-1">Rejected</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black">
                {isSummaryLoading ? '...' : summary.rejected?.toLocaleString() || '0'}
              </h3>
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Card 7: Does Not Pertain */}
          <div
            onClick={() => handleKpiFilter('Does Not Pertain')}
            className={`p-4 rounded-2xl text-white transition-all cursor-pointer shadow-sm hover:shadow-md ${
              statusFilter === 'Does Not Pertain' ? 'ring-3 ring-rose-300 dark:ring-rose-700' : ''
            }`}
            style={{ backgroundColor: '#f43f5e' }}
          >
            <p className="text-xs font-semibold text-rose-100 mb-1">Does Not Pertain</p>
            <div className="flex items-center justify-between mt-2">
              <h3 className="text-2xl font-black">
                {isSummaryLoading ? '...' : summary.doesNotPertain?.toLocaleString() || '0'}
              </h3>
              <div className="p-2 bg-white/20 rounded-xl">
                <Presentation className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Grievances Table Section ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {/* Card Header with Title and Export Buttons */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Grievances</h3>
            {statusFilter && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 flex items-center gap-1">
                Filtered: {statusFilter}
                <button
                  onClick={() => setStatusFilter('')}
                  className="hover:text-red-500 ml-1 font-bold border-0 bg-transparent cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              title="Download Excel"
              className="p-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-xl shadow-xs border-0 cursor-pointer transition-colors flex items-center justify-center"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportPDF}
              title="Download PDF"
              className="p-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl shadow-xs border-0 cursor-pointer transition-colors flex items-center justify-center"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                fetchSummary();
                fetchGrievances();
              }}
              title="Refresh Data"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Controls (Show Entries + Live Search) */}
        <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold">
            <span>Show</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Search:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Search reference, name, dept..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3 pr-8 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 sm:w-64"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold border-0 bg-transparent cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Table Content ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1e40af] text-white font-black uppercase text-[11px] tracking-wider whitespace-nowrap">
                <th className="py-3 px-3 border-r border-blue-700 text-center">S. No.</th>
                <th
                  onClick={() => handleSort('referenceId')}
                  className="py-3 px-3 border-r border-blue-700 cursor-pointer select-none hover:bg-blue-800"
                >
                  Reference ID {sortBy === 'referenceId' ? (sortDirection === 'ASC' ? '↑' : '↓') : '↕'}
                </th>
                <th
                  onClick={() => handleSort('grievanceType')}
                  className="py-3 px-3 border-r border-blue-700 cursor-pointer select-none hover:bg-blue-800"
                >
                  Category {sortBy === 'grievanceType' ? (sortDirection === 'ASC' ? '↑' : '↓') : '↕'}
                </th>
                <th
                  onClick={() => handleSort('applicationDate')}
                  className="py-3 px-3 border-r border-blue-700 cursor-pointer select-none hover:bg-blue-800"
                >
                  Submitted On {sortBy === 'applicationDate' ? (sortDirection === 'ASC' ? '↑' : '↓') : '↕'}
                </th>
                <th
                  onClick={() => handleSort('applicantName')}
                  className="py-3 px-3 border-r border-blue-700 cursor-pointer select-none hover:bg-blue-800"
                >
                  Applicant Name {sortBy === 'applicantName' ? (sortDirection === 'ASC' ? '↑' : '↓') : '↕'}
                </th>
                <th className="py-3 px-3 border-r border-blue-700">Applicant Gender</th>
                <th className="py-3 px-3 border-r border-blue-700">Applicant Email</th>
                <th className="py-3 px-3 border-r border-blue-700">Mobile No</th>
                <th className="py-3 px-3 border-r border-blue-700">Constituency</th>
                <th className="py-3 px-3 border-r border-blue-700">CPGRAMS Reg No</th>
                <th className="py-3 px-3 border-r border-blue-700">Pending With</th>
                <th className="py-3 px-3 border-r border-blue-700">JKIGRAMS Status</th>
                <th className="py-3 px-3 border-r border-blue-700 text-center">JKSamadhan Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={14} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        Loading JK-IGRAMS data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-rose-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="w-7 h-7" />
                      <span className="font-bold">{error}</span>
                      <button
                        onClick={fetchGrievances}
                        className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold border-0 cursor-pointer hover:bg-blue-700"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : grievances.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-16 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="text-sm font-bold">No JK-IGRAMS grievances found.</span>
                      <span className="text-xs text-slate-400">Try adjusting your search query or status filter.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                grievances.map((g, index) => {
                  const sNo = (page - 1) * size + index + 1;
                  const isEven = index % 2 === 1;
                  return (
                    <tr
                      key={g.id || g.referenceId || index}
                      className={`hover:bg-blue-50/70 dark:hover:bg-blue-950/30 transition-colors ${
                        isEven ? 'bg-[#f1f5f9]/50 dark:bg-slate-800/40' : 'bg-white dark:bg-slate-900'
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-600 dark:text-slate-400">{sNo}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/superadmin/grievance-details/${g.referenceId}`)}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline border-0 bg-transparent cursor-pointer p-0 text-left font-mono"
                        >
                          {g.referenceId}
                        </button>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap max-w-[140px] truncate" title={g.category}>
                        {g.category || 'Other Types'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {g.submittedOn || 'NA'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-semibold max-w-[150px] truncate" title={g.applicantName}>
                        {g.applicantName || 'CITIZEN'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">{g.applicantGender || 'NA'}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px] max-w-[140px] truncate" title={g.applicantEmail}>
                        {g.applicantEmail || ''}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">{g.mobileNo || 'NA'}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-[11px] max-w-[120px] truncate" title={g.constituency}>
                        {g.constituency || 'CITIZEN'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[11px] font-mono text-slate-500">
                        {g.cpgramsRegNo || ''}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[11px] font-mono max-w-[140px] truncate text-slate-700 dark:text-slate-300" title={g.pendingWith}>
                        {g.pendingWith || 'NA'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-[11px] max-w-[160px] truncate text-slate-600 dark:text-slate-400" title={g.jkigramsStatus}>
                        {g.jkigramsStatus || 'Pending'}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {renderStatusBadge(g.jksamadhanStatus)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/superadmin/grievance-details/${g.referenceId}`)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white transition-colors border-0 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── 4. Bottom Pagination Bar ── */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div>
            Showing {startEntry} to {endEntry} of {totalElements.toLocaleString()} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Previous
            </button>

            {/* Pagination numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-0 cursor-pointer transition-all ${
                    page === pageNum
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
