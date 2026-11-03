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
  X, 
  ExternalLink,
  Eye, 
  Award,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import grievanceService from '../../services/grievanceService';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../config/dashboardConfig';
import { 
  DonutChart, 
  BarChart, 
  ChartCard, 
  DepartmentComparisonBarChart 
} from '../../components/charts';

export default function NewFeedbackAnalysis() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canonicalRole = normalizeRole(user);
  const isDepartmentNodal = canonicalRole === 'DEPARTMENT' || (user?.department && !['SUPERADMIN', 'MONITORING_CELL', 'RMC', 'DM'].includes(canonicalRole));
  const userDept = user?.department || user?.departmentName || '';

  // Top Section Toggle: 'feedback' (Feedback Analysis Section) vs 'mis' (NEW MIS REPORT)
  const [activeSection, setActiveSection] = useState('feedback');

  // Master Data Options
  const [departmentList, setDepartmentList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  // Shared / Feedback Filters
  const [selectedDept, setSelectedDept] = useState(() => (isDepartmentNodal && userDept) ? userDept : '0');

  useEffect(() => {
    if (isDepartmentNodal && userDept && selectedDept !== userDept) {
      setSelectedDept(userDept);
    }
  }, [isDepartmentNodal, userDept]);
  const [selectedDistrict, setSelectedDistrict] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState('0');
  const [selectedGender, setSelectedGender] = useState('0');
  const [selectedSatisfaction, setSelectedSatisfaction] = useState('0');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Summary KPI & Chart Data (Feedback Section)
  const [summary, setSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  // Department Comparison Data (For Bar Chart Comparison)
  const [deptComparisonList, setDeptComparisonList] = useState([]);

  // Chart View Options (donut vs bar, both vs percent vs count)
  const [chartTypes, setChartTypes] = useState({
    q1: 'donut',
    q2: 'donut',
    q3: 'donut'
  });
  const [displayModes, setDisplayModes] = useState({
    q1: 'both',
    q2: 'both',
    q3: 'both'
  });

  const toggleChartType = (key, type) => {
    setChartTypes((prev) => ({ ...prev, [key]: type }));
  };

  const toggleDisplayMode = (key) => {
    setDisplayModes((prev) => ({
      ...prev,
      [key]: prev[key] === 'percent' ? 'count' : 'percent'
    }));
  };

  // Table 1 Data: Individual Feedback Records (Feedback Section)
  const [feedbackList, setFeedbackList] = useState([]);
  const [isListLoading, setIsListLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // MIS REPORT INDIVIDUAL State (NEW MIS Section)
  const [misIndvData, setMisIndvData] = useState([]);
  const [isMisIndvLoading, setIsMisIndvLoading] = useState(false);
  const [misIndvPage, setMisIndvPage] = useState(1);
  const [misIndvSize, setMisIndvSize] = useState(10);
  const [misIndvTotalRecords, setMisIndvTotalRecords] = useState(0);
  const [misIndvTotalPages, setMisIndvTotalPages] = useState(0);
  const [misIndvSearch, setMisIndvSearch] = useState('');

  // MIS REPORT DEPARTMENT WISE State (NEW MIS Section)
  const [misDeptData, setMisDeptData] = useState([]);
  const [isMisDeptLoading, setIsMisDeptLoading] = useState(false);
  const [misDeptPage, setMisDeptPage] = useState(1);
  const [misDeptSize, setMisDeptSize] = useState(10);
  const [misDeptTotalRecords, setMisDeptTotalRecords] = useState(0);
  const [misDeptTotalPages, setMisDeptTotalPages] = useState(0);
  const [misDeptSearch, setMisDeptSearch] = useState('');

  // Modal State for Viewing Single Feedback Form Preview
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  // Fetch Master Data (Departments, Districts, Categories)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [deptRes, distRes, catRes] = await Promise.all([
          axiosClient.get('/api/master/departments').catch(() => ({ data: [] })),
          axiosClient.get('/api/master/districts').catch(() => ({ data: [] })),
          axiosClient.get('/api/master/categories').catch(() => ({ data: [] }))
        ]);
        if (Array.isArray(deptRes.data)) setDepartmentList(deptRes.data);
        if (Array.isArray(distRes.data)) setDistrictList(distRes.data);
        if (Array.isArray(catRes.data)) setCategoryList(catRes.data);
      } catch (err) {
        console.error('Error fetching master data:', err);
      }
    };
    fetchMasterData();
  }, []);

  // Fetch Summary Data & Department Comparison List
  const fetchSummaryAndComparison = async () => {
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

      const [summaryRes, deptRes] = await Promise.all([
        grievanceService.getFeedbackSummary(params),
        grievanceService.getNewFeedbackDeptMIS({ department: '', page: 0, size: 100 }).catch(() => null)
      ]);

      if (summaryRes) setSummary(summaryRes);
      if (deptRes && deptRes.content) setDeptComparisonList(deptRes.content);
    } catch (err) {
      console.error('Error fetching Feedback Summary / Comparison:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Fetch Feedback Records List (Feedback Section)
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

  // Fetch NEW MIS REPORT INDIVIDUAL
  const fetchMisIndividual = async () => {
    setIsMisIndvLoading(true);
    try {
      const params = {
        department: selectedDept !== '0' ? selectedDept : '',
        search: misIndvSearch || '',
        page: misIndvPage - 1,
        size: misIndvSize
      };
      const res = await grievanceService.getNewFeedbackIndividual(params);
      if (res) {
        setMisIndvData(res.content || []);
        setMisIndvTotalRecords(res.totalElements || 0);
        setMisIndvTotalPages(res.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching MIS Individual report:', err);
    } finally {
      setIsMisIndvLoading(false);
    }
  };

  // Fetch NEW MIS REPORT DEPARTMENT WISE
  const fetchMisDept = async () => {
    setIsMisDeptLoading(true);
    try {
      const params = {
        department: selectedDept !== '0' ? selectedDept : '',
        search: misDeptSearch || '',
        page: misDeptPage - 1,
        size: misDeptSize
      };
      const res = await grievanceService.getNewFeedbackDeptMIS(params);
      if (res) {
        setMisDeptData(res.content || []);
        setMisDeptTotalRecords(res.totalElements || 0);
        setMisDeptTotalPages(res.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching MIS Department report:', err);
    } finally {
      setIsMisDeptLoading(false);
    }
  };

  // Reactive Effect for Feedback Analysis Section
  useEffect(() => {
    if (activeSection === 'feedback') {
      const timer = setTimeout(() => {
        fetchSummaryAndComparison();
        fetchFeedbackList();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeSection, selectedDept, selectedDistrict, selectedCategory, selectedGender, selectedSatisfaction, dateFrom, dateTo, searchQuery, currentPage, pageSize]);

  // Reactive Effect for MIS Section
  useEffect(() => {
    if (activeSection === 'mis') {
      const timer = setTimeout(() => {
        fetchMisIndividual();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeSection, selectedDept, misIndvSearch, misIndvPage, misIndvSize]);

  useEffect(() => {
    if (activeSection === 'mis') {
      const timer = setTimeout(() => {
        fetchMisDept();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeSection, selectedDept, misDeptSearch, misDeptPage, misDeptSize]);

  const handleResetFilters = () => {
    setSelectedDept('0');
    setSelectedDistrict('0');
    setSelectedCategory('0');
    setSelectedGender('0');
    setSelectedSatisfaction('0');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setMisIndvSearch('');
    setMisDeptSearch('');
    setCurrentPage(1);
    setMisIndvPage(1);
    setMisDeptPage(1);
  };

  // Modern Chart 1: Overall Experience Data
  const chart1Data = [
    { label: 'Excellent', value: summary?.experienceExcellentCount || 0, color: '#38bdf8' },
    { label: 'Good', value: summary?.experienceGoodCount || 0, color: '#2563eb' },
    { label: 'Average', value: summary?.experienceAverageCount || 0, color: '#f59e0b' },
    { label: 'Poor', value: summary?.experiencePoorCount || 0, color: '#ef4444' }
  ];

  // Modern Chart 2: Time Satisfaction Data
  const chart2Data = [
    { label: 'Very Satisfied', value: summary?.timeVerySatisfiedCount || 0, color: '#10b981' },
    { label: 'Satisfied', value: summary?.timeSatisfiedCount || 0, color: '#3b82f6' },
    { label: 'Dissatisfied', value: summary?.timeDissatisfiedCount || 0, color: '#ef4444' }
  ];

  // Modern Chart 3: Reuse Portal Data
  const chart3Data = [
    { label: 'Yes', value: summary?.reuseYesDefinitelyCount || 0, color: '#10b981' },
    { label: 'Maybe', value: (summary?.reuseMaybeLessTimeCount || 0) + (summary?.reuseProcessChangeCount || 0), color: '#f59e0b' },
    { label: 'No', value: summary?.reuseNoNeverCount || 0, color: '#ef4444' }
  ];

  // Handle Chart Slice Click Drill-Down
  const handleSliceClick = (label) => {
    if (selectedSatisfaction === label) {
      setSelectedSatisfaction('0');
    } else {
      setSelectedSatisfaction(label);
    }
    setCurrentPage(1);
  };

  // ==========================================
  // EXPORTS
  // ==========================================

  // Export Feedback Records Table (Excel)
  const exportFeedbackExcel = () => {
    const exportData = feedbackList.map((item, idx) => ({
      'S. No.': (currentPage - 1) * pageSize + idx + 1,
      'Grievance ID': item.uniqId || 'N/A',
      'Department': item.department || 'N/A',
      'Main Category': item.category || 'N/A',
      'Feedback Date': item.createdAt || 'N/A',
      'Gender': item.gender || 'N/A',
      'Overall Experience': item.overallExperience || 'N/A',
      'Time Satisfaction': item.timeSatisfaction || 'N/A',
      'Prefer to Reuse': item.reusePortal || 'N/A',
      'Comments/Reason': item.poorReason || item.description || ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Feedback_Records');
    XLSX.writeFile(wb, `Feedback_Records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export Feedback Records Table (PDF)
  const exportFeedbackPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text('Feedback Analysis Section - Records', 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    const headers = [['S. No.', 'Grievance ID', 'Department', 'Category', 'Feedback Date', 'Gender', 'Experience', 'Time Satisfaction', 'Reuse']];
    const rows = feedbackList.map((item, idx) => [
      (currentPage - 1) * pageSize + idx + 1,
      item.uniqId || 'N/A',
      item.department || 'N/A',
      item.category || 'N/A',
      item.createdAt || 'N/A',
      item.gender || 'N/A',
      item.overallExperience || 'N/A',
      item.timeSatisfaction || 'N/A',
      item.reusePortal || 'N/A'
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 }
    });

    doc.save(`Feedback_Records_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export NEW MIS Individual (Excel)
  const exportMisIndvExcel = () => {
    const exportData = misIndvData.map((item, idx) => ({
      'S. No.': (misIndvPage - 1) * misIndvSize + idx + 1,
      'Name of the Department': item.departmentName || 'N/A',
      'Grievance ID': item.grievanceId || 'N/A',
      'Name of Complainant': item.complainantName || 'N/A',
      'Contact No. of the Complainant': item.contactNo || 'N/A',
      'Grievance closed by': item.closedBy || 'N/A',
      'Excellent': item.excellent || 'No',
      'Good': item.good || 'No',
      'Average': item.average || 'No',
      'Poor': item.poor || 'No',
      'Very Satisfied': item.verySatisfied || 'No',
      'Satisfied': item.satisfied || 'No',
      'Dissatisfied': item.dissatisfied || 'No',
      'Reuse Yes': item.yes || 'No',
      'Reuse Maybe': item.maybe || 'No',
      'Reuse No': item.no || 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MIS_Report_Individual');
    XLSX.writeFile(wb, `MIS_Report_Individual_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export NEW MIS Individual (PDF)
  const exportMisIndvPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    doc.setFontSize(14);
    doc.text('MIS REPORT INDIVIDUAL', 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    const headers = [
      [
        { content: 'S. No.', rowSpan: 2 },
        { content: 'Name of the Department', rowSpan: 2 },
        { content: 'Grievance ID', rowSpan: 2 },
        { content: 'Name of Complainant', rowSpan: 2 },
        { content: 'Contact No.', rowSpan: 2 },
        { content: 'Grievance closed by', rowSpan: 2 },
        { content: 'Overall Experience of Grievance Disposal?', colSpan: 4 },
        { content: 'How satisfied are you with time taken?', colSpan: 3 },
        { content: 'Will you prefer to use portal again?', colSpan: 3 }
      ],
      [
        'Excellent', 'Good', 'Average', 'Poor',
        'Very Satisfied', 'Satisfied', 'Dissatisfied',
        'Yes', 'Maybe', 'No'
      ]
    ];

    const rows = misIndvData.map((item, idx) => [
      (misIndvPage - 1) * misIndvSize + idx + 1,
      item.departmentName || 'N/A',
      item.grievanceId || 'N/A',
      item.complainantName || 'N/A',
      item.contactNo || 'N/A',
      item.closedBy || 'N/A',
      item.excellent || 'No',
      item.good || 'No',
      item.average || 'No',
      item.poor || 'No',
      item.verySatisfied || 'No',
      item.satisfied || 'No',
      item.dissatisfied || 'No',
      item.yes || 'No',
      item.maybe || 'No',
      item.no || 'No'
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 }
    });

    doc.save(`MIS_Report_Individual_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export NEW MIS Dept Wise (Excel)
  const exportMisDeptExcel = () => {
    const exportData = misDeptData.map((item, idx) => ({
      'S. No.': (misDeptPage - 1) * misDeptSize + idx + 1,
      'Name of the Department': item.departmentName || 'N/A',
      'No. of Grievances with Feedback': item.totalFeedbackCount || 0,
      'Excellent (%)': (item.excellentPct || 0).toFixed(2),
      'Good (%)': (item.goodPct || 0).toFixed(2),
      'Average (%)': (item.averagePct || 0).toFixed(2),
      'Poor (%)': (item.poorPct || 0).toFixed(2),
      'Very Satisfied (%)': (item.verySatisfiedPct || 0).toFixed(2),
      'Satisfied (%)': (item.satisfiedPct || 0).toFixed(2),
      'Dissatisfied (%)': (item.dissatisfiedPct || 0).toFixed(2),
      'Reuse Yes (%)': (item.yesPct || 0).toFixed(2),
      'Reuse Maybe (%)': (item.maybePct || 0).toFixed(2),
      'Reuse No (%)': (item.noPct || 0).toFixed(2)
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MIS_Report_Dept_Wise');
    XLSX.writeFile(wb, `MIS_Report_Dept_Wise_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export NEW MIS Dept Wise (PDF)
  const exportMisDeptPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a3' });
    doc.setFontSize(14);
    doc.text('MIS REPORT DEPARTMENT WISE', 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    const headers = [
      [
        { content: 'S. No.', rowSpan: 2 },
        { content: 'Name of the Department', rowSpan: 2 },
        { content: 'Total Feedback', rowSpan: 2 },
        { content: 'Overall Experience of Grievance Disposal?', colSpan: 4 },
        { content: 'How satisfied are you with time taken?', colSpan: 3 },
        { content: 'Will you prefer to use portal again?', colSpan: 3 }
      ],
      [
        'Excellent(%)', 'Good(%)', 'Average(%)', 'Poor(%)',
        'Very Satisfied(%)', 'Satisfied(%)', 'Dissatisfied(%)',
        'Yes(%)', 'Maybe(%)', 'No(%)'
      ]
    ];

    const rows = misDeptData.map((item, idx) => [
      (misDeptPage - 1) * misDeptSize + idx + 1,
      item.departmentName || 'N/A',
      item.totalFeedbackCount || 0,
      `${(item.excellentPct || 0).toFixed(1)}%`,
      `${(item.goodPct || 0).toFixed(1)}%`,
      `${(item.averagePct || 0).toFixed(1)}%`,
      `${(item.poorPct || 0).toFixed(1)}%`,
      `${(item.verySatisfiedPct || 0).toFixed(1)}%`,
      `${(item.satisfiedPct || 0).toFixed(1)}%`,
      `${(item.dissatisfiedPct || 0).toFixed(1)}%`,
      `${(item.yesPct || 0).toFixed(1)}%`,
      `${(item.maybePct || 0).toFixed(1)}%`,
      `${(item.noPct || 0).toFixed(1)}%`
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 }
    });

    doc.save(`MIS_Report_Dept_Wise_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight">
            <span>Dashboard</span>
            <span className="text-slate-400 font-light text-lg">|</span>
            <span className="text-[#3b82f6] text-lg font-bold">Feedback Analysis</span>
          </h2>
        </div>
      </div>

      {/* FILTER & TOGGLE SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
        
        {/* Radio Button Toggle: Feedback Analysis Section vs NEW MIS REPORT */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="inline-flex items-center gap-6">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="mainReportType"
                value="feedback"
                checked={activeSection === 'feedback'}
                onChange={() => setActiveSection('feedback')}
                className="w-4 h-4 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Feedback Analysis Section</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="mainReportType"
                value="mis"
                checked={activeSection === 'mis'}
                onChange={() => setActiveSection('mis')}
                className="w-4 h-4 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>NEW MIS REPORT</span>
            </label>
          </div>
        </div>

        {/* SECTION 1 FILTERS: Full 7 filters when 'feedback' is active */}
        {activeSection === 'feedback' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Department */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  List of Departments:
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Select</option>
                  {departmentList.map((d) => (
                    <option key={d.departmentId || d.id} value={d.departmentName || d.name}>
                      {d.departmentName || d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Select</option>
                  {categoryList.map((c) => (
                    <option key={c.categoryId || c.id} value={c.categoryName || c.name}>
                      {c.categoryName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => { setSelectedGender(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Select</option>
                  <option value="MALE">MALE</option>
                  <option value="FEMALE">FEMALE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              {/* From Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  From/on
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  District:
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Select</option>
                  {districtList.map((dist) => (
                    <option key={dist.districtId || dist.id} value={dist.districtName || dist.name}>
                      {dist.districtName || dist.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Satisfaction & Reset */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
              <div className="w-full sm:w-64">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Disposal Satisfaction:
                </label>
                <select
                  value={selectedSatisfaction}
                  onChange={(e) => { setSelectedSatisfaction(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Select</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* NEW MIS REPORT FILTERS: Strictly List of Departments + Reset button */
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 max-w-lg">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                List of Departments:
              </label>
              <select
                value={selectedDept}
                onChange={(e) => { setSelectedDept(e.target.value); setMisIndvPage(1); setMisDeptPage(1); }}
                className="w-full text-xs h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">Select</option>
                {departmentList.map((d) => (
                  <option key={d.departmentId || d.id} value={d.departmentName || d.name}>
                    {d.departmentName || d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 
          ==================================================
          MODE 1: FEEDBACK ANALYSIS SECTION (3 EXPERIENTIAL CHARTS + DEPT COMPARISON + OPERATIONAL TABLE)
          ==================================================
      */}
      {activeSection === 'feedback' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 3 Modern Charts Grid */}
          {isSummaryLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-xs text-slate-400">Loading Feedback Analytics...</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Chart 1: Overall Experience */}
                <ChartCard
                  title="Overall Experience"
                  subtitle="Experience of Grievance Disposal"
                  total={(summary?.experienceExcellentCount || 0) + (summary?.experienceGoodCount || 0) + (summary?.experienceAverageCount || 0) + (summary?.experiencePoorCount || 0)}
                  activeFilter={['Excellent', 'Good', 'Average', 'Poor'].includes(selectedSatisfaction) ? selectedSatisfaction : null}
                  onClearFilter={() => setSelectedSatisfaction('0')}
                  chartType={chartTypes.q1}
                  onToggleChartType={(type) => toggleChartType('q1', type)}
                  displayMode={displayModes.q1}
                  onToggleDisplayMode={() => toggleDisplayMode('q1')}
                >
                  {chartTypes.q1 === 'donut' ? (
                    <DonutChart
                      data={chart1Data}
                      activeFilter={selectedSatisfaction}
                      onSliceClick={handleSliceClick}
                      displayMode={displayModes.q1}
                      size={180}
                    />
                  ) : (
                    <BarChart
                      data={chart1Data}
                      activeFilter={selectedSatisfaction}
                      onBarClick={handleSliceClick}
                      displayMode={displayModes.q1}
                    />
                  )}
                </ChartCard>

                {/* Chart 2: Time Satisfaction */}
                <ChartCard
                  title="Time Satisfaction"
                  subtitle="Satisfaction with disposal time"
                  total={(summary?.timeVerySatisfiedCount || 0) + (summary?.timeSatisfiedCount || 0) + (summary?.timeDissatisfiedCount || 0)}
                  activeFilter={['Very Satisfied', 'Satisfied', 'Dissatisfied'].includes(selectedSatisfaction) ? selectedSatisfaction : null}
                  onClearFilter={() => setSelectedSatisfaction('0')}
                  chartType={chartTypes.q2}
                  onToggleChartType={(type) => toggleChartType('q2', type)}
                  displayMode={displayModes.q2}
                  onToggleDisplayMode={() => toggleDisplayMode('q2')}
                >
                  {chartTypes.q2 === 'donut' ? (
                    <DonutChart
                      data={chart2Data}
                      activeFilter={selectedSatisfaction}
                      onSliceClick={handleSliceClick}
                      displayMode={displayModes.q2}
                      size={180}
                    />
                  ) : (
                    <BarChart
                      data={chart2Data}
                      activeFilter={selectedSatisfaction}
                      onBarClick={handleSliceClick}
                      displayMode={displayModes.q2}
                    />
                  )}
                </ChartCard>

                {/* Chart 3: Reuse Portal */}
                <ChartCard
                  title="Portal Reusability"
                  subtitle="Prefer to use JK Samadhan again"
                  total={(summary?.reuseYesDefinitelyCount || 0) + (summary?.reuseMaybeLessTimeCount || 0) + (summary?.reuseProcessChangeCount || 0) + (summary?.reuseNoNeverCount || 0)}
                  activeFilter={['Yes', 'Maybe', 'No'].includes(selectedSatisfaction) ? selectedSatisfaction : null}
                  onClearFilter={() => setSelectedSatisfaction('0')}
                  chartType={chartTypes.q3}
                  onToggleChartType={(type) => toggleChartType('q3', type)}
                  displayMode={displayModes.q3}
                  onToggleDisplayMode={() => toggleDisplayMode('q3')}
                >
                  {chartTypes.q3 === 'donut' ? (
                    <DonutChart
                      data={chart3Data}
                      activeFilter={selectedSatisfaction}
                      onSliceClick={handleSliceClick}
                      displayMode={displayModes.q3}
                      size={180}
                    />
                  ) : (
                    <BarChart
                      data={chart3Data}
                      activeFilter={selectedSatisfaction}
                      onBarClick={handleSliceClick}
                      displayMode={displayModes.q3}
                    />
                  )}
                </ChartCard>
              </div>

              {/* NEW SECTION: Meaningful Department-Wise Comparison Bar Chart */}
              <DepartmentComparisonBarChart
                departmentData={deptComparisonList}
                mode="modern"
                selectedDept={selectedDept}
                onSelectDept={(deptName) => {
                  setSelectedDept(deptName);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          {/* Table: Feedback Analysis Section (#NewfeedBackTbl) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide m-0">
                Feedback Analysis Section
              </h5>

              {/* Export Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={exportFeedbackExcel}
                  title="Export to Excel"
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer border-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button
                  onClick={exportFeedbackPDF}
                  title="Export to PDF"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-black text-white transition-colors cursor-pointer border-0"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search & Page Length Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="h-8 pl-8 pr-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-[#3b82f6] text-white font-bold uppercase text-[11px] tracking-wider select-none">
                  <tr>
                    <th className="p-3 text-center border-r border-blue-400/30 w-14">S. No.</th>
                    <th className="p-3 border-r border-blue-400/30">Grievance ID</th>
                    <th className="p-3 border-r border-blue-400/30">Department</th>
                    <th className="p-3 border-r border-blue-400/30">Main Category</th>
                    <th className="p-3 border-r border-blue-400/30">Feedback</th>
                    <th className="p-3 border-r border-blue-400/30">Gender</th>
                    <th className="p-3 text-center w-24">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {isListLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading feedback records...
                      </td>
                    </tr>
                  ) : feedbackList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No feedback records found.
                      </td>
                    </tr>
                  ) : (
                    feedbackList.map((row, idx) => (
                      <tr key={row.feedbackId || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 text-center font-semibold text-slate-500">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>
                        <td className="p-3 font-bold text-blue-600 dark:text-blue-400">
                          {row.uniqId || 'N/A'}
                        </td>
                        <td className="p-3 font-medium uppercase text-slate-700 dark:text-slate-300">
                          {row.department || 'N/A'}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 uppercase">
                          {row.category || 'N/A'}
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {row.createdAt || 'N/A'}
                        </td>
                        <td className="p-3 font-semibold uppercase text-slate-600 dark:text-slate-400">
                          {row.gender || 'N/A'}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedFeedback(row)}
                              title="View Citizen Feedback & Comments"
                              className="p-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer border-0"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/super-admin/grievance-details?id=${row.grievanceId || row.uniqId}`)}
                              title="View Grievance"
                              className="p-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer border-0"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2">
              <span>
                Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-1 font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-md">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
          ==================================================
          MODE 2: NEW MIS REPORT (Dual 2-Tier Tables: Individual & Dept Wise)
          ==================================================
      */}
      {activeSection === 'mis' && (
        <div className="space-y-6 animate-fadeIn">

          {/* TABLE 1: MIS REPORT INDIVIDUAL */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide m-0">
                MIS REPORT INDIVIDUAL
              </h5>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportMisIndvExcel}
                  title="Export to Excel"
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer border-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button
                  onClick={exportMisIndvPDF}
                  title="Export to PDF"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-black text-white transition-colors cursor-pointer border-0"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={misIndvSize}
                  onChange={(e) => { setMisIndvSize(Number(e.target.value)); setMisIndvPage(1); }}
                  className="h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={misIndvSearch}
                  onChange={(e) => { setMisIndvSearch(e.target.value); setMisIndvPage(1); }}
                  className="h-8 pl-8 pr-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* 2-Tier Table 1: Individual */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                <thead className="bg-[#3b82f6] text-white font-bold uppercase text-[10px] tracking-wider select-none">
                  {/* Tier 1 Header */}
                  <tr>
                    <th rowSpan={2} className="p-2.5 text-center border border-blue-400/40 w-12 align-middle">
                      S. No.
                    </th>
                    <th rowSpan={2} className="p-2.5 border border-blue-400/40 min-w-[150px] align-middle">
                      Name of the Department
                    </th>
                    <th rowSpan={2} className="p-2.5 border border-blue-400/40 min-w-[130px] align-middle">
                      Grievance ID
                    </th>
                    <th rowSpan={2} className="p-2.5 border border-blue-400/40 min-w-[130px] align-middle">
                      Name of Complainant
                    </th>
                    <th rowSpan={2} className="p-2.5 border border-blue-400/40 min-w-[110px] align-middle">
                      Contact No. of the Complainant
                    </th>
                    <th rowSpan={2} className="p-2.5 border border-blue-400/40 min-w-[160px] align-middle">
                      Grievance closed by (Name/Office Name of User)
                    </th>
                    <th colSpan={4} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Overall Experience of Grievance Disposal?
                    </th>
                    <th colSpan={3} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      How satisfied are you with the time taken for disposal of your grievance?
                    </th>
                    <th colSpan={3} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Will you prefer to use JK Samadhan again for submitting grievances in future?
                    </th>
                  </tr>
                  {/* Tier 2 Sub-columns */}
                  <tr className="bg-blue-600/90 text-center text-[9px]">
                    <th className="p-2 border border-blue-400/40">Excellent(%)</th>
                    <th className="p-2 border border-blue-400/40">Good(%)</th>
                    <th className="p-2 border border-blue-400/40">Average(%)</th>
                    <th className="p-2 border border-blue-400/40">Poor(%)</th>
                    <th className="p-2 border border-blue-400/40">Very Satisfied(%)</th>
                    <th className="p-2 border border-blue-400/40">Satisfied(%)</th>
                    <th className="p-2 border border-blue-400/40">Dissatisfied(%)</th>
                    <th className="p-2 border border-blue-400/40">Yes(%)</th>
                    <th className="p-2 border border-blue-400/40">Maybe(%)</th>
                    <th className="p-2 border border-blue-400/40">No(%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-[11px]">
                  {isMisIndvLoading ? (
                    <tr>
                      <td colSpan={16} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading MIS Report Individual...
                      </td>
                    </tr>
                  ) : misIndvData.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="p-8 text-center text-slate-400">
                        No records found for the selected department.
                      </td>
                    </tr>
                  ) : (
                    misIndvData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-2 text-center font-semibold text-slate-500 border-r border-slate-100 dark:border-slate-800">
                          {(misIndvPage - 1) * misIndvSize + idx + 1}
                        </td>
                        <td className="p-2 font-medium uppercase text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                          {row.departmentName || 'N/A'}
                        </td>
                        <td className="p-2 font-bold text-blue-600 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800">
                          {row.grievanceId || 'N/A'}
                        </td>
                        <td className="p-2 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                          {row.complainantName || 'N/A'}
                        </td>
                        <td className="p-2 text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800">
                          {row.contactNo || 'N/A'}
                        </td>
                        <td className="p-2 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 text-[10px]">
                          {row.closedBy || 'N/A'}
                        </td>

                        {/* Experience 4 columns */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.excellent || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.good || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.average || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.poor || 'No'}</td>

                        {/* Time Satisfaction 3 columns */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.verySatisfied || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.satisfied || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.dissatisfied || 'No'}</td>

                        {/* Reuse 3 columns */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.yes || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.maybe || 'No'}</td>
                        <td className="p-2 text-center font-semibold">{row.no || 'No'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Table 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2">
              <span>
                Showing {misIndvTotalRecords === 0 ? 0 : (misIndvPage - 1) * misIndvSize + 1} to{' '}
                {Math.min(misIndvPage * misIndvSize, misIndvTotalRecords)} of {misIndvTotalRecords} entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={misIndvPage <= 1}
                  onClick={() => setMisIndvPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-1 font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-md">
                  {misIndvPage}
                </span>
                <button
                  disabled={misIndvPage >= misIndvTotalPages}
                  onClick={() => setMisIndvPage((p) => Math.min(misIndvTotalPages, p + 1))}
                  className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* TABLE 2: MIS REPORT DEPARTMENT WISE */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-5 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide m-0">
                MIS REPORT DEPARTMENT WISE
              </h5>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportMisDeptExcel}
                  title="Export to Excel"
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer border-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button
                  onClick={exportMisDeptPDF}
                  title="Export to PDF"
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-black text-white transition-colors cursor-pointer border-0"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={misDeptSize}
                  onChange={(e) => { setMisDeptSize(Number(e.target.value)); setMisDeptPage(1); }}
                  className="h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={misDeptSearch}
                  onChange={(e) => { setMisDeptSearch(e.target.value); setMisDeptPage(1); }}
                  className="h-8 pl-8 pr-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* 2-Tier Table 2: Department Wise */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                <thead className="bg-[#3b82f6] text-white font-bold uppercase text-[10px] tracking-wider select-none">
                  {/* Tier 1 Header */}
                  <tr>
                    <th rowSpan={2} className="p-2.5 text-center border border-blue-400/40 w-12 align-middle">
                      S. No.
                    </th>
                    <th rowSpan={2} className="p-2.5 border border-blue-400/40 min-w-[200px] align-middle">
                      Name of the Department
                    </th>
                    <th rowSpan={2} className="p-2.5 text-center border border-blue-400/40 min-w-[130px] align-middle">
                      No. of Grievances on which Feedback has been Received
                    </th>
                    <th colSpan={4} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Overall Experience of Grievance Disposal?
                    </th>
                    <th colSpan={3} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      How satisfied are you with the time taken for disposal of your grievance?
                    </th>
                    <th colSpan={3} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Will you prefer to use JK Samadhan again for submitting grievances in future?
                    </th>
                  </tr>
                  {/* Tier 2 Sub-columns */}
                  <tr className="bg-blue-600/90 text-center text-[9px]">
                    <th className="p-2 border border-blue-400/40">Excellent(%)</th>
                    <th className="p-2 border border-blue-400/40">Good(%)</th>
                    <th className="p-2 border border-blue-400/40">Average(%)</th>
                    <th className="p-2 border border-blue-400/40">Poor(%)</th>
                    <th className="p-2 border border-blue-400/40">Very Satisfied(%)</th>
                    <th className="p-2 border border-blue-400/40">Satisfied(%)</th>
                    <th className="p-2 border border-blue-400/40">Dissatisfied(%)</th>
                    <th className="p-2 border border-blue-400/40">Yes(%)</th>
                    <th className="p-2 border border-blue-400/40">Maybe(%)</th>
                    <th className="p-2 border border-blue-400/40">No(%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-[11px]">
                  {isMisDeptLoading ? (
                    <tr>
                      <td colSpan={13} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading MIS Report Department Wise...
                      </td>
                    </tr>
                  ) : misDeptData.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="p-8 text-center text-slate-400">
                        No department summary data found.
                      </td>
                    </tr>
                  ) : (
                    misDeptData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-2 text-center font-semibold text-slate-500 border-r border-slate-100 dark:border-slate-800">
                          {(misDeptPage - 1) * misDeptSize + idx + 1}
                        </td>
                        <td className="p-2 font-medium uppercase text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                          {row.departmentName || 'N/A'}
                        </td>
                        <td className="p-2 text-center font-bold text-slate-800 dark:text-slate-100 border-r border-slate-100 dark:border-slate-800">
                          {row.totalFeedbackCount || 0}
                        </td>

                        {/* Experience 4 columns */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.excellentPct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.goodPct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.averagePct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.poorPct || 0).toFixed(1)}%</td>

                        {/* Time Satisfaction 3 columns */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.verySatisfiedPct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.satisfiedPct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.dissatisfiedPct || 0).toFixed(1)}%</td>

                        {/* Reuse 3 columns */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.yesPct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.maybePct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center font-semibold">{(row.noPct || 0).toFixed(1)}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Table 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2">
              <span>
                Showing {misDeptTotalRecords === 0 ? 0 : (misDeptPage - 1) * misDeptSize + 1} to{' '}
                {Math.min(misDeptPage * misDeptSize, misDeptTotalRecords)} of {misDeptTotalRecords} entries
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={misDeptPage <= 1}
                  onClick={() => setMisDeptPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-1 font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-md">
                  {misDeptPage}
                </span>
                <button
                  disabled={misDeptPage >= misDeptTotalPages}
                  onClick={() => setMisDeptPage((p) => Math.min(misDeptTotalPages, p + 1))}
                  className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE FEEDBACK VIEW MODAL (Including Citizen's Poor Reason / Comment) */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Citizen Feedback Details
                </h4>
                <p className="text-[11px] text-blue-600 font-semibold">
                  {selectedFeedback.uniqId || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 border-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFeedback.department || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedFeedback.category || 'N/A'}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedFeedback.createdAt || 'N/A'}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedFeedback.gender || 'N/A'}</span>
                </div>
              </div>

              {/* Experiential Responses */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-2 rounded-md border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Overall Experience of Grievance Disposal:</span>
                  <span className="font-bold text-blue-600">{selectedFeedback.overallExperience || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Satisfaction with Disposal Time:</span>
                  <span className="font-bold text-blue-600">{selectedFeedback.timeSatisfaction || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Will prefer to use portal again in future:</span>
                  <span className="font-bold text-blue-600">{selectedFeedback.reusePortal || 'N/A'}</span>
                </div>

                {/* Citizen's Poor Reason / Feedback Comment */}
                {(selectedFeedback.poorReason || selectedFeedback.description) && (
                  <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 mt-2">
                    <span className="text-amber-800 dark:text-amber-300 font-bold block text-[11px] mb-1">
                      Citizen's Specific Feedback / Reason:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 text-xs italic m-0">
                      "{selectedFeedback.poorReason || selectedFeedback.description}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border-0 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
