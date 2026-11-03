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
  X, 
  Eye, 
  ThumbsUp, 
  PhoneCall, 
  Star, 
  Award,
  TrendingUp,
  AlertCircle,
  BarChart3
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

export default function FeedbackAnalysis() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canonicalRole = normalizeRole(user);
  const isDepartmentNodal = canonicalRole === 'DEPARTMENT' || (user?.department && !['SUPERADMIN', 'MONITORING_CELL', 'RMC', 'DM'].includes(canonicalRole));
  const userDept = user?.department || user?.departmentName || '';

  // Top Section Toggle: 'feedback' (Feedback Analysis Section) vs 'mis' (MIS REPORT)
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
    q3: 'donut',
    q4: 'donut',
    q5: 'donut'
  });
  const [displayModes, setDisplayModes] = useState({
    q1: 'both',
    q2: 'both',
    q3: 'both',
    q4: 'both',
    q5: 'both'
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

  // MIS REPORT INDIVIDUAL State (MIS Section)
  const [misIndvData, setMisIndvData] = useState([]);
  const [isMisIndvLoading, setIsMisIndvLoading] = useState(false);
  const [misIndvPage, setMisIndvPage] = useState(1);
  const [misIndvSize, setMisIndvSize] = useState(10);
  const [misIndvTotalRecords, setMisIndvTotalRecords] = useState(0);
  const [misIndvTotalPages, setMisIndvTotalPages] = useState(0);
  const [misIndvSearch, setMisIndvSearch] = useState('');

  // MIS REPORT DEPARTMENT WISE State (MIS Section)
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
        grievanceService.getLegacyFeedbackDeptMIS({ department: '', page: 0, size: 100 }).catch(() => null)
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

  // Fetch Legacy MIS REPORT INDIVIDUAL
  const fetchLegacyMisIndividual = async () => {
    setIsMisIndvLoading(true);
    try {
      const params = {
        department: selectedDept !== '0' ? selectedDept : '',
        search: misIndvSearch || '',
        page: misIndvPage - 1,
        size: misIndvSize
      };
      const res = await grievanceService.getLegacyFeedbackIndividual(params);
      if (res) {
        setMisIndvData(res.content || []);
        setMisIndvTotalRecords(res.totalElements || 0);
        setMisIndvTotalPages(res.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching Legacy MIS Individual report:', err);
    } finally {
      setIsMisIndvLoading(false);
    }
  };

  // Fetch Legacy MIS REPORT DEPARTMENT WISE
  const fetchLegacyMisDept = async () => {
    setIsMisDeptLoading(true);
    try {
      const params = {
        department: selectedDept !== '0' ? selectedDept : '',
        search: misDeptSearch || '',
        page: misDeptPage - 1,
        size: misDeptSize
      };
      const res = await grievanceService.getLegacyFeedbackDeptMIS(params);
      if (res) {
        setMisDeptData(res.content || []);
        setMisDeptTotalRecords(res.totalElements || 0);
        setMisDeptTotalPages(res.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching Legacy MIS Department report:', err);
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

  // Reactive Effect for Legacy MIS Section
  useEffect(() => {
    if (activeSection === 'mis') {
      const timer = setTimeout(() => {
        fetchLegacyMisIndividual();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeSection, selectedDept, misIndvSearch, misIndvPage, misIndvSize]);

  useEffect(() => {
    if (activeSection === 'mis') {
      const timer = setTimeout(() => {
        fetchLegacyMisDept();
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

  // 5 Legacy Charts Data
  // Chart 1: Solution Satisfied
  const chartSolutionData = [
    { label: 'Yes', value: summary?.satisfiedYesCount || 0, color: '#10b981' },
    { label: 'No', value: summary?.satisfiedNoCount || 0, color: '#ef4444' }
  ];

  // Chart 2: Call Received
  const chartCallData = [
    { label: 'Yes', value: summary?.callReceivedYesCount || 0, color: '#0ea5e9' },
    { label: 'No', value: summary?.callReceivedNoCount || 0, color: '#f43f5e' }
  ];

  // Chart 3: Overall Experience (Rating 1)
  const chartExpData = [
    { label: '6-10', value: summary?.rating1_6_10Count || 0, color: '#3b82f6' },
    { label: '1-5', value: summary?.rating1_1_5Count || 0, color: '#f59e0b' }
  ];

  // Chart 4: Lodging Process (Rating 2)
  const chartLodgingData = [
    { label: '6-10', value: summary?.rating2_6_10Count || 0, color: '#06b6d4' },
    { label: '1-5', value: summary?.rating2_1_5Count || 0, color: '#8b5cf6' }
  ];

  // Chart 5: Portal Recommendation
  const chartRecommendData = [
    { label: 'Yes Definitely', value: summary?.recommendYesCount || 0, color: '#10b981' },
    { label: 'Maybe, If It Takes Less Time', value: summary?.recommendMaybeTimeCount || 0, color: '#3b82f6' },
    { label: 'No, Never', value: summary?.recommendNoCount || 0, color: '#ef4444' },
    { label: 'Maybe, If The Process Changed', value: summary?.recommendMaybeProcessCount || 0, color: '#f59e0b' }
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
      'Solution Satisfied': item.satisfied || 'N/A',
      'Call Received': item.callReceived || 'N/A',
      'Overall Experience': item.rating1 || item.overallExperience || 'N/A',
      'Lodging Process': item.rating2 || 'N/A',
      'Recommendation': item.reusePortal || 'N/A'
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

    const headers = [['S. No.', 'Grievance ID', 'Department', 'Category', 'Feedback Date', 'Gender', 'Satisfied', 'Call Received', 'Rating 1', 'Rating 2']];
    const rows = feedbackList.map((item, idx) => [
      (currentPage - 1) * pageSize + idx + 1,
      item.uniqId || 'N/A',
      item.department || 'N/A',
      item.category || 'N/A',
      item.createdAt || 'N/A',
      item.gender || 'N/A',
      item.satisfied || 'N/A',
      item.callReceived || 'N/A',
      item.rating1 || 'N/A',
      item.rating2 || 'N/A'
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

  // Export Legacy MIS Individual (Excel)
  const exportLegacyMisIndvExcel = () => {
    const exportData = misIndvData.map((item, idx) => ({
      'S. No.': (misIndvPage - 1) * misIndvSize + idx + 1,
      'Name of the Department': item.departmentName || 'N/A',
      'Grievance ID': item.grievanceId || 'N/A',
      'Name of Complainant': item.complainantName || 'N/A',
      'Contact No. of the Complainant': item.contactNo || 'N/A',
      'Grievance closed by': item.closedBy || 'N/A',
      'Satisfied Yes': item.satisfiedYes || 'No',
      'Satisfied No': item.satisfiedNo || 'No',
      'Call Received Yes': item.callReceivedYes || 'No',
      'Call Received No': item.callReceivedNo || 'No',
      'Experience 1-5': item.rating1_1_5 || 'No',
      'Experience 6-10': item.rating1_6_10 || 'No',
      'Lodging 1-5': item.rating2_1_5 || 'No',
      'Lodging 6-10': item.rating2_6_10 || 'No',
      'Recommend Yes Definitely': item.recommendYes || 'No',
      'Recommend Maybe Less Time': item.recommendMaybeTime || 'No',
      'Recommend No Never': item.recommendNo || 'No',
      'Recommend Maybe Process Changed': item.recommendMaybeProcess || 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Legacy_MIS_Individual');
    XLSX.writeFile(wb, `Legacy_MIS_Individual_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export Legacy MIS Individual (PDF)
  const exportLegacyMisIndvPDF = () => {
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
        { content: 'Satisfied?', colSpan: 2 },
        { content: 'Call Received?', colSpan: 2 },
        { content: 'Overall Experience', colSpan: 2 },
        { content: 'Lodging Process', colSpan: 2 },
        { content: 'Recommend Portal?', colSpan: 4 }
      ],
      [
        'Yes', 'No',
        'Yes', 'No',
        '1-5', '6-10',
        '1-5', '6-10',
        'Yes Def', 'Maybe Time', 'No Never', 'Maybe Proc'
      ]
    ];

    const rows = misIndvData.map((item, idx) => [
      (misIndvPage - 1) * misIndvSize + idx + 1,
      item.departmentName || 'N/A',
      item.grievanceId || 'N/A',
      item.complainantName || 'N/A',
      item.contactNo || 'N/A',
      item.closedBy || 'N/A',
      item.satisfiedYes || 'No',
      item.satisfiedNo || 'No',
      item.callReceivedYes || 'No',
      item.callReceivedNo || 'No',
      item.rating1_1_5 || 'No',
      item.rating1_6_10 || 'No',
      item.rating2_1_5 || 'No',
      item.rating2_6_10 || 'No',
      item.recommendYes || 'No',
      item.recommendMaybeTime || 'No',
      item.recommendNo || 'No',
      item.recommendMaybeProcess || 'No'
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 7 }
    });

    doc.save(`MIS_Report_Individual_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export Legacy MIS Department Wise (Excel)
  const exportLegacyMisDeptExcel = () => {
    const exportData = misDeptData.map((item, idx) => ({
      'S. No.': (misDeptPage - 1) * misDeptSize + idx + 1,
      'Name of the Department': item.departmentName || 'N/A',
      'No. of Grievances with Feedback': item.totalFeedbackCount || 0,
      'Satisfied Yes (%)': (item.satisfiedYesPct || 0).toFixed(2),
      'Satisfied No (%)': (item.satisfiedNoPct || 0).toFixed(2),
      'Call Received Yes (%)': (item.callReceivedYesPct || 0).toFixed(2),
      'Call Received No (%)': (item.callReceivedNoPct || 0).toFixed(2),
      'Experience 1-5 (%)': (item.rating1_1_5Pct || 0).toFixed(2),
      'Experience 6-10 (%)': (item.rating1_6_10Pct || 0).toFixed(2),
      'Lodging 1-5 (%)': (item.rating2_1_5Pct || 0).toFixed(2),
      'Lodging 6-10 (%)': (item.rating2_6_10Pct || 0).toFixed(2),
      'Recommend Yes Definitely (%)': (item.recommendYesPct || 0).toFixed(2),
      'Recommend Maybe Less Time (%)': (item.recommendMaybeTimePct || 0).toFixed(2),
      'Recommend No Never (%)': (item.recommendNoPct || 0).toFixed(2),
      'Recommend Maybe Process Changed (%)': (item.recommendMaybeProcessPct || 0).toFixed(2)
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Legacy_MIS_Dept_Wise');
    XLSX.writeFile(wb, `Legacy_MIS_Dept_Wise_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export Legacy MIS Department Wise (PDF)
  const exportLegacyMisDeptPDF = () => {
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
        { content: 'Satisfied?', colSpan: 2 },
        { content: 'Call Received?', colSpan: 2 },
        { content: 'Overall Experience', colSpan: 2 },
        { content: 'Lodging Process', colSpan: 2 },
        { content: 'Recommend Portal?', colSpan: 4 }
      ],
      [
        'Yes (%)', 'No (%)',
        'Yes (%)', 'No (%)',
        '1-5 (%)', '6-10 (%)',
        '1-5 (%)', '6-10 (%)',
        'Yes Def(%)', 'Maybe Time(%)', 'No Never(%)', 'Maybe Proc(%)'
      ]
    ];

    const rows = misDeptData.map((item, idx) => [
      (misDeptPage - 1) * misDeptSize + idx + 1,
      item.departmentName || 'N/A',
      item.totalFeedbackCount || 0,
      `${(item.satisfiedYesPct || 0).toFixed(1)}%`,
      `${(item.satisfiedNoPct || 0).toFixed(1)}%`,
      `${(item.callReceivedYesPct || 0).toFixed(1)}%`,
      `${(item.callReceivedNoPct || 0).toFixed(1)}%`,
      `${(item.rating1_1_5Pct || 0).toFixed(1)}%`,
      `${(item.rating1_6_10Pct || 0).toFixed(1)}%`,
      `${(item.rating2_1_5Pct || 0).toFixed(1)}%`,
      `${(item.rating2_6_10Pct || 0).toFixed(1)}%`,
      `${(item.recommendYesPct || 0).toFixed(1)}%`,
      `${(item.recommendMaybeTimePct || 0).toFixed(1)}%`,
      `${(item.recommendNoPct || 0).toFixed(1)}%`,
      `${(item.recommendMaybeProcessPct || 0).toFixed(1)}%`
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 7 }
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
        
        {/* Radio Button Toggle: Feedback Analysis Section vs MIS REPORT */}
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
              <span>MIS REPORT</span>
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
                  <option value="Yes">Satisfied (Yes)</option>
                  <option value="No">Not Satisfied (No)</option>
                  <option value="1-5">Experience: 1-5</option>
                  <option value="6-10">Experience: 6-10</option>
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
          /* MIS REPORT FILTERS: Strictly List of Departments + Reset button matching legacy JKSv2 */
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
          MODE 1: FEEDBACK ANALYSIS SECTION
          Improved Charts Grid + Department Comparison Horizontal Bar Chart
          ==================================================
      */}
      {activeSection === 'feedback' && (
        <div className="space-y-6 animate-fadeIn">
          {/* 5 Legacy Charts Grid with Card View Switcher */}
          {isSummaryLoading ? (
            <div className="h-64 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-xs text-slate-400">Loading Feedback Analytics...</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Chart 1: Solution Satisfied */}
                <ChartCard
                  title="Solution Satisfaction"
                  subtitle="Were you satisfied with solution?"
                  total={(summary?.satisfiedYesCount || 0) + (summary?.satisfiedNoCount || 0)}
                  activeFilter={['Yes', 'No'].includes(selectedSatisfaction) ? selectedSatisfaction : null}
                  onClearFilter={() => setSelectedSatisfaction('0')}
                  chartType={chartTypes.q1}
                  onToggleChartType={(type) => toggleChartType('q1', type)}
                  displayMode={displayModes.q1}
                  onToggleDisplayMode={() => toggleDisplayMode('q1')}
                >
                  {chartTypes.q1 === 'donut' ? (
                    <DonutChart
                      data={chartSolutionData}
                      activeFilter={selectedSatisfaction}
                      onSliceClick={handleSliceClick}
                      displayMode={displayModes.q1}
                      size={170}
                    />
                  ) : (
                    <BarChart
                      data={chartSolutionData}
                      activeFilter={selectedSatisfaction}
                      onBarClick={handleSliceClick}
                      displayMode={displayModes.q1}
                    />
                  )}
                </ChartCard>

                {/* Chart 2: Call Received */}
                <ChartCard
                  title="Call / Message Received"
                  subtitle="Received call or SMS from dept?"
                  total={(summary?.callReceivedYesCount || 0) + (summary?.callReceivedNoCount || 0)}
                  activeFilter={['Yes', 'No'].includes(selectedSatisfaction) ? selectedSatisfaction : null}
                  onClearFilter={() => setSelectedSatisfaction('0')}
                  chartType={chartTypes.q2}
                  onToggleChartType={(type) => toggleChartType('q2', type)}
                  displayMode={displayModes.q2}
                  onToggleDisplayMode={() => toggleDisplayMode('q2')}
                >
                  {chartTypes.q2 === 'donut' ? (
                    <DonutChart
                      data={chartCallData}
                      activeFilter={selectedSatisfaction}
                      onSliceClick={handleSliceClick}
                      displayMode={displayModes.q2}
                      size={170}
                    />
                  ) : (
                    <BarChart
                      data={chartCallData}
                      activeFilter={selectedSatisfaction}
                      onBarClick={handleSliceClick}
                      displayMode={displayModes.q2}
                    />
                  )}
                </ChartCard>

                {/* Chart 3: Overall Experience */}
                <ChartCard
                  title="Overall Experience"
                  subtitle="Rating score (1-5 vs 6-10)"
                  total={(summary?.rating1_1_5Count || 0) + (summary?.rating1_6_10Count || 0)}
                  activeFilter={['1-5', '6-10'].includes(selectedSatisfaction) ? selectedSatisfaction : null}
                  onClearFilter={() => setSelectedSatisfaction('0')}
                  chartType={chartTypes.q3}
                  onToggleChartType={(type) => toggleChartType('q3', type)}
                  displayMode={displayModes.q3}
                  onToggleDisplayMode={() => toggleDisplayMode('q3')}
                >
                  {chartTypes.q3 === 'donut' ? (
                    <DonutChart
                      data={chartExpData}
                      activeFilter={selectedSatisfaction}
                      onSliceClick={handleSliceClick}
                      displayMode={displayModes.q3}
                      size={170}
                    />
                  ) : (
                    <BarChart
                      data={chartExpData}
                      activeFilter={selectedSatisfaction}
                      onBarClick={handleSliceClick}
                      displayMode={displayModes.q3}
                    />
                  )}
                </ChartCard>

                {/* Chart 4: Grievance Lodging Process */}
                <ChartCard
                  title="Lodging Process"
                  subtitle="Ease of lodging grievance"
                  total={(summary?.rating2_1_5Count || 0) + (summary?.rating2_6_10Count || 0)}
                  activeFilter={['1-5', '6-10'].includes(selectedSatisfaction) ? selectedSatisfaction : null}
                  onClearFilter={() => setSelectedSatisfaction('0')}
                  chartType={chartTypes.q4}
                  onToggleChartType={(type) => toggleChartType('q4', type)}
                  displayMode={displayModes.q4}
                  onToggleDisplayMode={() => toggleDisplayMode('q4')}
                >
                  {chartTypes.q4 === 'donut' ? (
                    <DonutChart
                      data={chartLodgingData}
                      activeFilter={selectedSatisfaction}
                      onSliceClick={handleSliceClick}
                      displayMode={displayModes.q4}
                      size={170}
                    />
                  ) : (
                    <BarChart
                      data={chartLodgingData}
                      activeFilter={selectedSatisfaction}
                      onBarClick={handleSliceClick}
                      displayMode={displayModes.q4}
                    />
                  )}
                </ChartCard>
              </div>

              {/* Chart 5: Portal Recommendation - Wide Featured Card */}
              <div className="max-w-2xl mx-auto">
                <ChartCard
                  title="Would you recommend this portal for Grievance lodging to others too?"
                  subtitle="Citizen willingness to recommend the portal across 4 response categories"
                  total={(summary?.recommendYesCount || 0) + (summary?.recommendMaybeTimeCount || 0) + (summary?.recommendNoCount || 0) + (summary?.recommendMaybeProcessCount || 0)}
                  activeFilter={selectedSatisfaction !== '0' && selectedSatisfaction !== 'Yes' && selectedSatisfaction !== 'No' && selectedSatisfaction !== '1-5' && selectedSatisfaction !== '6-10' ? selectedSatisfaction : null}
                  onClearFilter={() => setSelectedSatisfaction('0')}
                  chartType={chartTypes.q5}
                  onToggleChartType={(type) => toggleChartType('q5', type)}
                  displayMode={displayModes.q5}
                  onToggleDisplayMode={() => toggleDisplayMode('q5')}
                >
                  {chartTypes.q5 === 'donut' ? (
                    <DonutChart
                      data={chartRecommendData}
                      activeFilter={selectedSatisfaction}
                      onSliceClick={handleSliceClick}
                      displayMode={displayModes.q5}
                      size={190}
                    />
                  ) : (
                    <BarChart
                      data={chartRecommendData}
                      activeFilter={selectedSatisfaction}
                      onBarClick={handleSliceClick}
                      displayMode={displayModes.q5}
                    />
                  )}
                </ChartCard>
              </div>

              {/* NEW SECTION: Meaningful Department-Wise Comparison Bar Chart */}
              <DepartmentComparisonBarChart
                departmentData={deptComparisonList}
                mode="legacy"
                selectedDept={selectedDept}
                onSelectDept={(deptName) => {
                  setSelectedDept(deptName);
                  setCurrentPage(1);
                }}
              />
            </div>
          )}

          {/* Table: Feedback Analysis Section (#feedBackTbl) */}
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
                              title="View Feedback Details"
                              className="p-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer border-0"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => navigate(`/super-admin/grievance-details?id=${row.grievanceId || row.uniqId}`)}
                              title="View Grievance"
                              className="p-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer border-0"
                            >
                              <ExternalLinkIcon className="w-3.5 h-3.5" />
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
          MODE 2: MIS REPORT (Dual 2-Tier Tables: Individual & Dept Wise)
          Matching Screenshot 2, 4, 5
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
                  onClick={exportLegacyMisIndvExcel}
                  title="Export to Excel"
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer border-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button
                  onClick={exportLegacyMisIndvPDF}
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
                    <th colSpan={2} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Overall, were you satisfied with the solution provided by department officials?
                    </th>
                    <th colSpan={2} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Have you received any call or message from Department?
                    </th>
                    <th colSpan={2} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Overall, Experience of Grievance Disposal?
                    </th>
                    <th colSpan={2} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Grievance Lodging Process
                    </th>
                    <th colSpan={4} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Would you recommend this portal for Grievance lodging to others too?
                    </th>
                  </tr>
                  {/* Tier 2 Sub-columns */}
                  <tr className="bg-blue-600/90 text-center text-[9px]">
                    <th className="p-2 border border-blue-400/40">Yes (%)</th>
                    <th className="p-2 border border-blue-400/40">No (%)</th>
                    <th className="p-2 border border-blue-400/40">Yes (%)</th>
                    <th className="p-2 border border-blue-400/40">No (%)</th>
                    <th className="p-2 border border-blue-400/40">1-5 (%)</th>
                    <th className="p-2 border border-blue-400/40">6-10 (%)</th>
                    <th className="p-2 border border-blue-400/40">1-5 (%)</th>
                    <th className="p-2 border border-blue-400/40">6-10 (%)</th>
                    <th className="p-2 border border-blue-400/40">Yes Definitely</th>
                    <th className="p-2 border border-blue-400/40">Maybe, If It Takes Less Time</th>
                    <th className="p-2 border border-blue-400/40">No, Never</th>
                    <th className="p-2 border border-blue-400/40">Maybe, If The Process Changed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-[11px]">
                  {isMisIndvLoading ? (
                    <tr>
                      <td colSpan={18} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading MIS Report Individual...
                      </td>
                    </tr>
                  ) : misIndvData.length === 0 ? (
                    <tr>
                      <td colSpan={18} className="p-8 text-center text-slate-400">
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

                        {/* Satisfied Yes/No */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.satisfiedYes || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.satisfiedNo || 'No'}</td>

                        {/* Call Received Yes/No */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.callReceivedYes || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.callReceivedNo || 'No'}</td>

                        {/* Rating 1 1-5 / 6-10 */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.rating1_1_5 || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.rating1_6_10 || 'No'}</td>

                        {/* Rating 2 1-5 / 6-10 */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.rating2_1_5 || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.rating2_6_10 || 'No'}</td>

                        {/* Recommend 4 categories */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.recommendYes || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.recommendMaybeTime || 'No'}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{row.recommendNo || 'No'}</td>
                        <td className="p-2 text-center font-semibold">{row.recommendMaybeProcess || 'No'}</td>
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
                  onClick={exportLegacyMisDeptExcel}
                  title="Export to Excel"
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer border-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button
                  onClick={exportLegacyMisDeptPDF}
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
                    <th colSpan={2} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Overall, were you satisfied with the solution provided by department officials?
                    </th>
                    <th colSpan={2} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Have you received any call or message from Department?
                    </th>
                    <th colSpan={2} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Overall, Experience of Grievance Disposal?
                    </th>
                    <th colSpan={2} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Grievance Lodging Process
                    </th>
                    <th colSpan={4} className="p-2 text-center border border-blue-400/40 bg-blue-700/60">
                      Would you recommend this portal for Grievance lodging to others too?
                    </th>
                  </tr>
                  {/* Tier 2 Sub-columns */}
                  <tr className="bg-blue-600/90 text-center text-[9px]">
                    <th className="p-2 border border-blue-400/40">Yes (%)</th>
                    <th className="p-2 border border-blue-400/40">No (%)</th>
                    <th className="p-2 border border-blue-400/40">Yes (%)</th>
                    <th className="p-2 border border-blue-400/40">No (%)</th>
                    <th className="p-2 border border-blue-400/40">1-5 (%)</th>
                    <th className="p-2 border border-blue-400/40">6-10 (%)</th>
                    <th className="p-2 border border-blue-400/40">1-5 (%)</th>
                    <th className="p-2 border border-blue-400/40">6-10 (%)</th>
                    <th className="p-2 border border-blue-400/40">Yes Definitely</th>
                    <th className="p-2 border border-blue-400/40">Maybe, If It Takes Less Time</th>
                    <th className="p-2 border border-blue-400/40">No, Never</th>
                    <th className="p-2 border border-blue-400/40">Maybe, If The Process Changed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900 text-[11px]">
                  {isMisDeptLoading ? (
                    <tr>
                      <td colSpan={15} className="p-8 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                        Loading MIS Report Department Wise...
                      </td>
                    </tr>
                  ) : misDeptData.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="p-8 text-center text-slate-400">
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

                        {/* Satisfied Yes/No */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.satisfiedYesPct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.satisfiedNoPct || 0).toFixed(1)}%</td>

                        {/* Call Received Yes/No */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.callReceivedYesPct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.callReceivedNoPct || 0).toFixed(1)}%</td>

                        {/* Rating 1 1-5 / 6-10 */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.rating1_1_5Pct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.rating1_6_10Pct || 0).toFixed(1)}%</td>

                        {/* Rating 2 1-5 / 6-10 */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.rating2_1_5Pct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.rating2_6_10Pct || 0).toFixed(1)}%</td>

                        {/* Recommend 4 categories */}
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.recommendYesPct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.recommendMaybeTimePct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800 font-semibold">{(row.recommendNoPct || 0).toFixed(1)}%</td>
                        <td className="p-2 text-center font-semibold">{(row.recommendMaybeProcessPct || 0).toFixed(1)}%</td>
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

      {/* SINGLE FEEDBACK VIEW MODAL */}
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

              {/* Feedback responses */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-2 rounded-md border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Satisfied with solution provided:</span>
                  <span className="font-bold text-blue-600">{selectedFeedback.satisfied || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Received any call or message:</span>
                  <span className="font-bold text-blue-600">{selectedFeedback.callReceived || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Overall Experience (Rating 1):</span>
                  <span className="font-bold text-blue-600">{selectedFeedback.rating1 || selectedFeedback.overallExperience || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Grievance Lodging Process (Rating 2):</span>
                  <span className="font-bold text-blue-600">{selectedFeedback.rating2 || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-md border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Would recommend portal:</span>
                  <span className="font-bold text-blue-600">{selectedFeedback.reusePortal || 'N/A'}</span>
                </div>
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

// Icon helper
function ExternalLinkIcon(props) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
