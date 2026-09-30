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
  AlertTriangle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import grievanceService from '../../services/grievanceService';

export default function PendencyReport() {
  const navigate = useNavigate();
  
  // Filter mode: 'userwise' or 'deptwise'
  const [reportMode, setReportMode] = useState('userwise');

  // Main Report State
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Clicked Pending Grievance Counts
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalGrievances, setModalGrievances] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(10);
  const [modalTotalRecords, setModalTotalRecords] = useState(0);
  const [modalTotalPages, setModalTotalPages] = useState(0);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [activeModalParams, setActiveModalParams] = useState(null);

  // Fetch Report Data
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        mode: reportMode,
        page: currentPage - 1,
        size: pageSize,
        search: searchQuery || ''
      };

      const res = await grievanceService.getPendencyReport(params);
      if (res) {
        setData(res.content || []);
        setTotalRecords(res.totalElements || 0);
        setTotalPages(res.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching Pendency Report:', err);
      setError('Failed to load Pendency Report records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReportData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [reportMode, currentPage, pageSize, searchQuery]);

  // Handle Radio Mode Toggle
  const handleModeChange = (newMode) => {
    setReportMode(newMode);
    setCurrentPage(1);
  };

  // Fetch Modal Details when pending count cell is clicked
  const fetchModalDetails = async (paramsObj) => {
    setIsModalLoading(true);
    try {
      const params = {
        department: paramsObj.department || '',
        username: paramsObj.username || '',
        status: 'Pending',
        page: modalCurrentPage - 1,
        size: modalPageSize,
        search: modalSearchQuery || ''
      };

      const res = await grievanceService.getPendencyGrievanceDetails(params);
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

  useEffect(() => {
    if (showModal && activeModalParams) {
      const delayDebounceFn = setTimeout(() => {
        fetchModalDetails(activeModalParams);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [modalCurrentPage, modalPageSize, modalSearchQuery, activeModalParams, showModal]);

  const handleCellClick = (row) => {
    const params = {
      department: reportMode === 'deptwise' ? row.departmentName : row.departmentName,
      username: reportMode === 'userwise' ? row.username : ''
    };

    const titleTarget = reportMode === 'userwise' 
      ? `User: ${row.officerName || row.username}` 
      : `Department: ${row.departmentName}`;

    setModalTitle(`Pending Grievances (${titleTarget})`);
    setActiveModalParams(params);
    setModalCurrentPage(1);
    setModalSearchQuery('');
    setShowModal(true);
  };

  // Export handlers
  const exportToExcel = () => {
    const exportData = data.map((item, idx) => {
      if (reportMode === 'userwise') {
        return {
          'S. No.': (currentPage - 1) * pageSize + idx + 1,
          'User Name': item.officerName || 'N/A',
          'Office & Designation': item.officeAndDesignation || 'N/A',
          'Department': item.departmentName || 'N/A',
          'User Level': item.userType || item.userLevel || 'N/A',
          'Pending Grievance Count': item.pendingCount || 0
        };
      } else {
        return {
          'S. No.': (currentPage - 1) * pageSize + idx + 1,
          'Department Name': item.departmentName || 'Unassigned',
          'Pending Grievance Count': item.pendingCount || 0
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    const sheetName = reportMode === 'userwise' ? 'User_Wise_Pendency' : 'Dept_Wise_Pendency';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${sheetName}_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const isUser = reportMode === 'userwise';

    doc.setFontSize(14);
    doc.text(isUser ? 'User Wise Pendency Report' : 'Department Wise Pendency Report', 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    let tableColumn = [];
    let tableRows = [];

    if (isUser) {
      tableColumn = ['S. No.', 'User Name', 'Office & Designation', 'Department', 'User Level', 'Pending Count'];
      tableRows = data.map((item, idx) => [
        (currentPage - 1) * pageSize + idx + 1,
        item.officerName || 'N/A',
        item.officeAndDesignation || 'N/A',
        item.departmentName || 'N/A',
        item.userType || item.userLevel || 'N/A',
        item.pendingCount || 0
      ]);
    } else {
      tableColumn = ['S. No.', 'Department Name', 'Pending Grievance Count'];
      tableRows = data.map((item, idx) => [
        (currentPage - 1) * pageSize + idx + 1,
        item.departmentName || 'Unassigned',
        item.pendingCount || 0
      ]);
    }

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 138] }
    });

    const fileName = isUser ? 'User_Wise_Pendency_Report.pdf' : 'Dept_Wise_Pendency_Report.pdf';
    doc.save(fileName);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {reportMode === 'userwise' ? 'User Wise Pendency Report' : 'Department Wise Pendency Report'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Consolidated breakdown of pending grievances assigned across official accounts and departments.
            </p>
          </div>

          {/* Radio Button Toggle: User Wise vs Dept Wise */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start md:self-auto">
            <label 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                reportMode === 'userwise'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <input 
                type="radio" 
                name="pendencyReportMode" 
                value="userwise" 
                checked={reportMode === 'userwise'} 
                onChange={() => handleModeChange('userwise')} 
                className="hidden" 
              />
              <UserCheck className="w-4 h-4" />
              <span>User Wise</span>
            </label>

            <label 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                reportMode === 'deptwise'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <input 
                type="radio" 
                name="pendencyReportMode" 
                value="deptwise" 
                checked={reportMode === 'deptwise'} 
                onChange={() => handleModeChange('deptwise')} 
                className="hidden" 
              />
              <Building2 className="w-4 h-4" />
              <span>Department Wise</span>
            </label>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={reportMode === 'userwise' ? "Search officer, dept, designation..." : "Search department..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={fetchReportData}
              disabled={isLoading}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Entries Dropdown */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={exportToExcel}
                disabled={data.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>

              <button
                onClick={exportToPDF}
                disabled={data.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Fetching Pendency Report records...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500">
            <p className="text-xs font-semibold">{error}</p>
            <button 
              onClick={fetchReportData} 
              className="mt-3 px-4 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-400 stroke-1" />
            <p className="text-sm font-semibold">No Pendency Records Found</p>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or mode toggle.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5 w-16 text-center">S. No.</th>
                  {reportMode === 'userwise' ? (
                    <>
                      <th className="p-3.5">User Name</th>
                      <th className="p-3.5">Office Name & Designation</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">User Level</th>
                    </>
                  ) : (
                    <th className="p-3.5">Department Name</th>
                  )}
                  <th className="p-3.5 text-center">Pending Grievance Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {data.map((row, idx) => {
                  const serialNo = (currentPage - 1) * pageSize + idx + 1;
                  const pCount = row.pendingCount || 0;

                  return (
                    <tr 
                      key={row.id || idx} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 text-center font-medium text-slate-500">{serialNo}</td>
                      {reportMode === 'userwise' ? (
                        <>
                          <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-100">
                            {row.officerName || row.username || 'N/A'}
                          </td>
                          <td className="p-3.5 text-slate-600 dark:text-slate-400">
                            {row.officeAndDesignation || 'N/A'}
                          </td>
                          <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                            {row.departmentName || 'N/A'}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium text-[11px]">
                              {row.userType || row.userLevel || 'Officer'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-100">
                          {row.departmentName || 'Unassigned Department'}
                        </td>
                      )}
                      
                      {/* Clickable Pending Count Badge */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleCellClick(row)}
                          disabled={pCount === 0}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            pCount > 0
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 cursor-pointer shadow-xs'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-default'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>{pCount}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {!isLoading && data.length > 0 && (
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
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-xs">
                {currentPage} / {totalPages || 1}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Details of Clicked Pending Grievances */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden text-left">
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">{modalTitle}</h3>
                  <p className="text-xs text-slate-500">List of pending grievances matching selected entity.</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Controls */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search grievance ID or complainant..."
                  value={modalSearchQuery}
                  onChange={(e) => {
                    setModalSearchQuery(e.target.value);
                    setModalCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Total Pending: <span className="font-bold text-amber-600">{modalTotalRecords}</span>
              </div>
            </div>

            {/* Modal Content Table */}
            <div className="flex-1 overflow-y-auto p-4">
              {isModalLoading ? (
                <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-xs">Loading grievance details...</p>
                </div>
              ) : modalGrievances.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <AlertTriangle className="w-8 h-8 mx-auto text-slate-400 stroke-1" />
                  <p className="text-sm font-semibold">No Pending Grievances Found</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3 w-12 text-center">S. No.</th>
                        <th className="p-3">Grievance ID</th>
                        <th className="p-3">Complainant</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Submitted Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {modalGrievances.map((g, idx) => (
                        <tr key={g.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                          <td className="p-3 text-center font-medium text-slate-400">
                            {(modalCurrentPage - 1) * modalPageSize + idx + 1}
                          </td>
                          <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{g.uniqId || g.id}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{g.submittedBy?.name || 'N/A'}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{g.grievanceCategory || 'N/A'}</td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{g.department || 'N/A'}</td>
                          <td className="p-3 text-slate-500">{g.createdAt || 'N/A'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              {g.status || 'Pending'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                setShowModal(false);
                                navigate(`/grievance/${g.id}`);
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                              title="View Details"
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
            </div>

            {/* Modal Footer Pagination */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 text-xs">
              <div className="text-slate-500">
                Page <span className="font-semibold">{modalCurrentPage}</span> of{' '}
                <span className="font-semibold">{modalTotalPages || 1}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={modalCurrentPage === 1}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setModalCurrentPage((prev) => Math.min(prev + 1, modalTotalPages))}
                  disabled={modalCurrentPage >= modalTotalPages}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
