import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Clock, 
  X, 
  ExternalLink, 
  UserCheck, 
  Building2, 
  AlertTriangle,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import grievanceService from '../../services/grievanceService';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../config/dashboardConfig';

export default function AgeAnalysisReport({ initialPendingOnly = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canonicalRole = normalizeRole(user);
  const isDepartmentNodal = canonicalRole === 'DEPARTMENT' || (user?.department && !['SUPERADMIN', 'MONITORING_CELL', 'RMC', 'DM'].includes(canonicalRole));
  const userDept = user?.department || user?.departmentName || '';

  // Mode: 'userwise' (Stage / Assignment Residence Time) vs 'deptwise' (Lifecycle Time)
  const [reportMode, setReportMode] = useState('userwise');
  // Pending filter: true for Pending only, false for All Grievances
  const [pendingOnly, setPendingOnly] = useState(initialPendingOnly);

  // Main Report State
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Summary Totals
  const [summaries, setSummaries] = useState({
    d1: 0,
    d2: 0,
    d3: 0,
    d4: 0,
    d5: 0,
    total: 0
  });

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Dropdown Master Data & Filters
  const [departmentList, setDepartmentList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [selectedDept, setSelectedDept] = useState(() => (isDepartmentNodal && userDept) ? userDept : '');

  useEffect(() => {
    if (isDepartmentNodal && userDept && selectedDept !== userDept) {
      setSelectedDept(userDept);
    }
  }, [isDepartmentNodal, userDept]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Modal State for Clicked Bucket Details
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalGrievances, setModalGrievances] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(10);
  const [modalTotalRecords, setModalTotalRecords] = useState(0);
  const [modalTotalPages, setModalTotalPages] = useState(0);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [debouncedModalSearch, setDebouncedModalSearch] = useState('');
  const [activeModalParams, setActiveModalParams] = useState(null);

  // Debounce main search query only (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Debounce modal search query only (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedModalSearch(modalSearchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [modalSearchQuery]);

  // Sync prop changes if parent switches between Age Analysis Report & Age Wise Pendency Report
  useEffect(() => {
    if (pendingOnly !== initialPendingOnly) {
      setPendingOnly(initialPendingOnly);
      setCurrentPage(1);
    }
  }, [initialPendingOnly]);

  // Load Department & District Master Data
  useEffect(() => {
    let isMounted = true;
    const loadMasterData = async () => {
      try {
        const [deptRes, distRes] = await Promise.all([
          axiosClient.get('/api/masters/departments').catch(() => ({ data: [] })),
          axiosClient.get('/api/masters/districts').catch(() => ({ data: [] }))
        ]);
        if (isMounted) {
          if (Array.isArray(deptRes.data)) setDepartmentList(deptRes.data);
          if (Array.isArray(distRes.data)) setDistrictList(distRes.data);
        }
      } catch (err) {
        console.error('Failed to load master data:', err);
      }
    };
    loadMasterData();
    return () => { isMounted = false; };
  }, []);

  // Fetch Report Data from backend
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        mode: reportMode,
        pendingOnly: pendingOnly,
        department: selectedDept || '',
        district: selectedDistrict || '',
        page: currentPage - 1,
        size: pageSize,
        search: debouncedSearch || ''
      };

      const res = await grievanceService.getAgeAnalysisReport(params);
      if (res) {
        setData(res.content || []);
        setTotalRecords(res.totalElements || 0);
        setTotalPages(res.totalPages || 0);
        setSummaries({
          d1: res.summaryD1 || 0,
          d2: res.summaryD2 || 0,
          d3: res.summaryD3 || 0,
          d4: res.summaryD4 || 0,
          d5: res.summaryD5 || 0,
          total: res.summaryTotal || 0
        });
      }
    } catch (err) {
      console.error('Error fetching Age Analysis Report:', err);
      setError('Failed to load Age Analysis Report records.');
    } finally {
      setIsLoading(false);
    }
  };

  // Immediate fetch on mount, mode change, pagination, or filter changes (no lag)
  useEffect(() => {
    fetchReportData();
  }, [reportMode, pendingOnly, currentPage, pageSize, debouncedSearch, selectedDept, selectedDistrict]);

  // Handle Radio Mode Toggle
  const handleModeChange = (newMode) => {
    setReportMode(newMode);
    setCurrentPage(1);
  };

  // Fetch Modal Details when count cell is clicked
  const fetchModalDetails = async (paramsObj) => {
    setIsModalLoading(true);
    try {
      const params = {
        mode: reportMode,
        pendingOnly: pendingOnly,
        username: paramsObj.username || '',
        department: paramsObj.department || '',
        district: selectedDistrict || '',
        bucket: paramsObj.bucket || 'all',
        page: modalCurrentPage - 1,
        size: modalPageSize,
        search: debouncedModalSearch || ''
      };

      const res = await grievanceService.getAgeAnalysisDetails(params);
      if (res) {
        setModalGrievances(res.content || []);
        setModalTotalRecords(res.totalElements || 0);
        setModalTotalPages(res.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching modal grievance details:', err);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Immediate fetch for clicked modal details
  useEffect(() => {
    if (showModal && activeModalParams) {
      fetchModalDetails(activeModalParams);
    }
  }, [modalCurrentPage, modalPageSize, debouncedModalSearch, activeModalParams, showModal]);

  const handleCellClick = (row, bucketKey, bucketLabel) => {
    const count = bucketKey === 'total' ? row.totalCount : row[bucketKey];
    if (!count || count === 0) return;

    const params = {
      department: row.departmentName || '',
      username: reportMode === 'userwise' ? row.username : '',
      bucket: bucketKey
    };

    const targetName = reportMode === 'userwise' 
      ? `${row.officerName || row.username} (${row.officeAndDesignation || 'Officer'})`
      : `${row.departmentName || 'Department'}`;

    setModalTitle(`${bucketLabel} — ${targetName}`);
    setActiveModalParams(params);
    setModalCurrentPage(1);
    setModalSearchQuery('');
    setShowModal(true);
  };

  // Excel Export
  const exportToExcel = () => {
    const exportData = data.map((item, idx) => {
      if (reportMode === 'userwise') {
        return {
          'S. No.': (currentPage - 1) * pageSize + idx + 1,
          'Officer Name': item.officerName || 'N/A',
          'Office & Designation': item.officeAndDesignation || 'N/A',
          'Department': item.departmentName || 'N/A',
          'District': item.districtName || 'N/A',
          'User Type': item.userType || 'N/A',
          'User Level': item.userLevel || 'N/A',
          '0 - 7 Days': item.d1 || 0,
          '7 - 15 Days': item.d2 || 0,
          '15 - 28 Days': item.d3 || 0,
          '28 - 60 Days': item.d4 || 0,
          'Above 60 Days': item.d5 || 0,
          'Total Grievances': item.totalCount || 0
        };
      } else {
        return {
          'S. No.': (currentPage - 1) * pageSize + idx + 1,
          'Department Name': item.departmentName || 'Unassigned',
          '0 - 7 Days': item.d1 || 0,
          '7 - 15 Days': item.d2 || 0,
          '15 - 28 Days': item.d3 || 0,
          '28 - 60 Days': item.d4 || 0,
          'Above 60 Days': item.d5 || 0,
          'Total Grievances': item.totalCount || 0
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    const sheetName = reportMode === 'userwise' ? 'User_Wise_Age' : 'Dept_Wise_Age';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const prefix = pendingOnly ? 'Age_Wise_Pendency' : 'Age_Analysis';
    XLSX.writeFile(workbook, `${prefix}_${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const isUser = reportMode === 'userwise';
    const reportHeading = pendingOnly 
      ? (isUser ? 'User Wise Pending Age Analysis Report' : 'Department Wise Pending Age Analysis Report')
      : (isUser ? 'User Wise Age Analysis Report' : 'Department Wise Age Analysis Report');

    doc.setFontSize(14);
    doc.text(reportHeading, 14, 15);
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Scope: ${pendingOnly ? 'Pending Grievances' : 'All Grievances'}`, 14, 21);

    let tableColumn = [];
    let tableRows = [];

    if (isUser) {
      tableColumn = ['S.No', 'Officer Name', 'Office & Designation', 'Department', 'District', '0-7d', '7-15d', '15-28d', '28-60d', '>60d', 'Total'];
      tableRows = data.map((item, idx) => [
        (currentPage - 1) * pageSize + idx + 1,
        item.officerName || 'N/A',
        item.officeAndDesignation || 'N/A',
        item.departmentName || 'N/A',
        item.districtName || 'N/A',
        item.d1 || 0,
        item.d2 || 0,
        item.d3 || 0,
        item.d4 || 0,
        item.d5 || 0,
        item.totalCount || 0
      ]);
    } else {
      tableColumn = ['S.No', 'Department Name', '0 - 7 Days', '7 - 15 Days', '15 - 28 Days', '28 - 60 Days', 'Above 60 Days', 'Total'];
      tableRows = data.map((item, idx) => [
        (currentPage - 1) * pageSize + idx + 1,
        item.departmentName || 'Unassigned',
        item.d1 || 0,
        item.d2 || 0,
        item.d3 || 0,
        item.d4 || 0,
        item.d5 || 0,
        item.totalCount || 0
      ]);
    }

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 26,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [40, 41, 61], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    const prefix = pendingOnly ? 'Age_Wise_Pendency' : 'Age_Analysis';
    doc.save(`${prefix}_${reportMode}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export Modal Grievances to Excel
  const exportModalToExcel = () => {
    if (!modalGrievances.length) return;
    const exportData = modalGrievances.map((g, idx) => ({
      'S. No.': (modalCurrentPage - 1) * modalPageSize + idx + 1,
      'Grievance ID': g.uniqId || 'N/A',
      'Citizen Name': g.citizenName || (g.submittedBy && g.submittedBy.name) || 'N/A',
      'Department': g.department || 'N/A',
      'Category': g.grievanceCategory || 'N/A',
      'District': g.district || 'N/A',
      'Lodged Date': g.createdAt || 'N/A',
      'Status': g.status || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Grievances');
    XLSX.writeFile(workbook, `Age_Analysis_Drilldown_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
    if (s.includes('resolved') || s.includes('closed')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">Resolved</span>;
    }
    if (s.includes('rejected')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">Rejected</span>;
    }
    if (s.includes('forward')) {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">Forwarded</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">{st || 'Pending'}</span>;
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      
      {/* ────────────────────────────────────────────────────────
          HEADER & PERSPECTIVE SELECTION BAR
          ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {pendingOnly ? 'Age Wise Pendency Report' : 'Age Analysis Report'}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                pendingOnly 
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                  : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300/40'
              }`}>
                {pendingOnly ? 'Unresolved Grievances Only' : 'All Redressal Stages'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {reportMode === 'userwise'
                ? 'User-Wise Age represents Stage / Assignment Aging (elapsed time since grievance assignment to officer).'
                : 'Department-Wise Age represents Lifecycle Aging (elapsed time since citizen initially lodged the grievance).'}
            </p>
          </div>

          {/* Action & Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border shadow-xs cursor-pointer ${
                showFilterDrawer || selectedDept || selectedDistrict
                  ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {(selectedDept || selectedDistrict) ? '• Active' : ''}</span>
            </button>

            <button
              onClick={exportToExcel}
              disabled={isLoading || data.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="Download Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>

            <button
              onClick={exportToPDF}
              disabled={isLoading || data.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title="Download PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={fetchReportData}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Perspective Radios & Scope Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">View Mode:</span>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="ageAnalysisReportMode"
                value="userwise"
                checked={reportMode === 'userwise'}
                onChange={() => handleModeChange('userwise')}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className={reportMode === 'userwise' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                User Wise (Assignment Residence)
              </span>
            </label>

            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="ageAnalysisReportMode"
                value="deptwise"
                checked={reportMode === 'deptwise'}
                onChange={() => handleModeChange('deptwise')}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className={reportMode === 'deptwise' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                Overall Department Wise (Lifecycle Aging)
              </span>
            </label>
          </div>

          {/* Quick Scope Switch: All vs Pending Only */}
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => { setPendingOnly(false); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                !pendingOnly 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Actions
            </button>
            <button
              onClick={() => { setPendingOnly(true); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                pendingOnly 
                  ? 'bg-amber-500 text-white font-bold shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pending Only
            </button>
          </div>
        </div>

        {/* Filter Drawer / Accordion Bar */}
        {showFilterDrawer && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center gap-3 animate-fadeIn">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                Department Filter
              </label>
              <select
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Departments</option>
                {departmentList.map((d) => (
                  <option key={d.id || d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                District Filter
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Districts</option>
                {districtList.map((d) => (
                  <option key={d.id || d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="self-end flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  setSelectedDept('');
                  setSelectedDistrict('');
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────
          SUMMARY CARDS
          ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: '0 - 7 Days', count: summaries.d1, bg: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40' },
          { label: '7 - 15 Days', count: summaries.d2, bg: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40' },
          { label: '15 - 28 Days', count: summaries.d3, bg: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40' },
          { label: '28 - 60 Days', count: summaries.d4, bg: 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 border-orange-200/60 dark:border-orange-800/40' },
          { label: 'Above 60 Days', count: summaries.d5, bg: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40' },
          { label: 'Total Volume', count: summaries.total, bg: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40' }
        ].map((card, idx) => (
          <div key={idx} className={`p-3.5 rounded-xl border ${card.bg} flex flex-col justify-between`}>
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">{card.label}</span>
            <span className="text-xl font-extrabold mt-1">{card.count.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* ────────────────────────────────────────────────────────
          MAIN TABULAR GRID
          ──────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Table Top Controls (Search & Size) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={reportMode === 'userwise' ? "Search officer, office, dept, district..." : "Search department..."}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-3 w-12 text-center">S.No</th>
                {reportMode === 'userwise' ? (
                  <>
                    <th className="py-3 px-3">Officer Name</th>
                    <th className="py-3 px-3">Office Name & Designation</th>
                    <th className="py-3 px-3">Department</th>
                    <th className="py-3 px-3">District</th>
                    <th className="py-3 px-3">User Type</th>
                    <th className="py-3 px-3">User Level</th>
                  </>
                ) : (
                  <th className="py-3 px-4">Department Name</th>
                )}
                <th className="py-3 px-3 text-center bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">0 - 7 Days</th>
                <th className="py-3 px-3 text-center bg-blue-50/50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300">7 - 15 Days</th>
                <th className="py-3 px-3 text-center bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">15 - 28 Days</th>
                <th className="py-3 px-3 text-center bg-orange-50/50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300">28 - 60 Days</th>
                <th className="py-3 px-3 text-center bg-rose-50/50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300">Above 60 Days</th>
                <th className="py-3 px-3 text-center bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-300 font-extrabold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={reportMode === 'userwise' ? 13 : 8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                      <span className="text-xs font-semibold">Loading Age Analysis records...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={reportMode === 'userwise' ? 13 : 8} className="py-10 text-center text-rose-500">
                    <p className="font-semibold">{error}</p>
                    <button onClick={fetchReportData} className="mt-2 text-xs text-indigo-600 underline cursor-pointer">Retry</button>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={reportMode === 'userwise' ? 13 : 8} className="py-12 text-center text-slate-400">
                    <p className="font-semibold">No records found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const serial = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr 
                      key={row.id || row.departmentName || index} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">{serial}</td>
                      {reportMode === 'userwise' ? (
                        <>
                          <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                            {row.officerName || 'N/A'}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                            {row.officeAndDesignation || 'N/A'}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                            {row.departmentName || 'N/A'}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                            {row.districtName || 'N/A'}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {row.userType || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {row.userLevel || 'N/A'}
                          </td>
                        </>
                      ) : (
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {row.departmentName || 'Unassigned'}
                        </td>
                      )}

                      {/* Interactive Count Cells with Drill-Down */}
                      {[
                        { key: 'd1', label: '0 - 7 Days', color: 'hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400' },
                        { key: 'd2', label: '7 - 15 Days', color: 'hover:bg-blue-100 text-blue-700 dark:text-blue-400' },
                        { key: 'd3', label: '15 - 28 Days', color: 'hover:bg-amber-100 text-amber-700 dark:text-amber-400' },
                        { key: 'd4', label: '28 - 60 Days', color: 'hover:bg-orange-100 text-orange-700 dark:text-orange-400' },
                        { key: 'd5', label: 'Above 60 Days', color: 'hover:bg-rose-100 text-rose-700 dark:text-rose-400' },
                        { key: 'total', label: 'Total Grievances', color: 'hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 font-extrabold' }
                      ].map((b) => {
                        const val = b.key === 'total' ? row.totalCount : row[b.key];
                        const isClickable = val > 0;
                        return (
                          <td key={b.key} className="py-3 px-3 text-center">
                            {isClickable ? (
                              <button
                                onClick={() => handleCellClick(row, b.key, b.label)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all underline decoration-dotted cursor-pointer ${b.color}`}
                                title={`Click to drill-down into ${val} grievances (${b.label})`}
                              >
                                {val}
                              </button>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-600 font-mono">0</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Aggregated Totals Footer */}
            {data.length > 0 && !isLoading && (
              <tfoot>
                <tr className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-800 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                  <td colSpan={reportMode === 'userwise' ? 7 : 2} className="py-3 px-4 text-right tracking-wider uppercase text-[11px]">
                    Dataset Summary Totals:
                  </td>
                  <td className="py-3 px-3 text-center text-emerald-700 dark:text-emerald-400">{summaries.d1.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-blue-700 dark:text-blue-400">{summaries.d2.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-amber-700 dark:text-amber-400">{summaries.d3.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-orange-700 dark:text-orange-400">{summaries.d4.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-rose-700 dark:text-rose-400">{summaries.d5.toLocaleString()}</td>
                  <td className="py-3 px-3 text-center text-indigo-700 dark:text-indigo-400 text-sm font-black">{summaries.total.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords.toLocaleString()} entries
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 py-1 font-semibold text-slate-800 dark:text-slate-200">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────
          DRILL-DOWN MODAL
          ──────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Age Drill-Down Grievance Records
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {modalTitle} • Total: <span className="font-bold text-indigo-600 dark:text-indigo-400">{modalTotalRecords}</span> grievances
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportModalToExcel}
                  disabled={isModalLoading || modalGrievances.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer disabled:opacity-50"
                  title="Export matching grievances to Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Search Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by ID, description, citizen..."
                  value={modalSearchQuery}
                  onChange={(e) => { setModalSearchQuery(e.target.value); setModalCurrentPage(1); }}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <span className="text-[11px] text-slate-400">
                Page {modalCurrentPage} of {modalTotalPages || 1}
              </span>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-12">S.No</th>
                    <th className="py-2.5 px-3">Grievance ID</th>
                    <th className="py-2.5 px-3">Citizen Name</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Lodged Date</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isModalLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                          <span className="text-xs">Loading grievance records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : modalGrievances.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        No grievances found for this bucket criteria.
                      </td>
                    </tr>
                  ) : (
                    modalGrievances.map((g, idx) => {
                      const sNo = (modalCurrentPage - 1) * modalPageSize + idx + 1;
                      return (
                        <tr key={g.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{sNo}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {g.uniqId || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                            {g.citizenName || (g.submittedBy && g.submittedBy.name) || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            {g.department || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 truncate max-w-[150px]">
                            {g.grievanceCategory || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {g.district || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                            {g.createdAt || 'N/A'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {getStatusBadge(g.status)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                setShowModal(false);
                                navigate(`/superadmin/grievance-details/${g.id || g.uniqId}`);
                              }}
                              className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                              title="View Full Grievance Detail"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Pagination Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {modalTotalRecords === 0 ? 0 : (modalCurrentPage - 1) * modalPageSize + 1} to{' '}
                {Math.min(modalCurrentPage * modalPageSize, modalTotalRecords)} of {modalTotalRecords.toLocaleString()}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setModalCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={modalCurrentPage <= 1 || isModalLoading}
                  className="p-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-semibold text-slate-800 dark:text-slate-200">
                  {modalCurrentPage} / {modalTotalPages || 1}
                </span>
                <button
                  onClick={() => setModalCurrentPage((p) => Math.min(p + 1, modalTotalPages))}
                  disabled={modalCurrentPage >= modalTotalPages || isModalLoading}
                  className="p-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
