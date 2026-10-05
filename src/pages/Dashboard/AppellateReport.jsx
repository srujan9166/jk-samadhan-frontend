import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  ShieldCheck,
  X,
  ExternalLink,
  Calendar,
  Filter
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function AppellateReport() {
  const navigate = useNavigate();

  // Filters State
  const [departmentType, setDepartmentType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Main Report State
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal State for Clicked Appeal Counts
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

  // Fetch Main Appellate Report Data
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        departmentType: departmentType || '',
        fromDate: fromDate || '',
        toDate: toDate || '',
        page: (currentPage - 1).toString(),
        size: pageSize.toString(),
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/appellate-report?${params.toString()}`);
      if (res.data) {
        setData(res.data.content || []);
        setTotalRecords(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching Appellate Report:', err);
      setError('Failed to load Appellate Report records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReportData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [departmentType, fromDate, toDate, currentPage, pageSize, searchQuery]);

  // Reset pagination on filter change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setDepartmentType('');
    setFromDate('');
    setToDate('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Fetch Modal Details when count cell is clicked
  const fetchModalDetails = async (paramsObj) => {
    setIsModalLoading(true);
    try {
      const params = new URLSearchParams({
        department: paramsObj.department || '',
        type: paramsObj.type || 'total',
        fromDate: fromDate || '',
        toDate: toDate || '',
        page: (modalCurrentPage - 1).toString(),
        size: modalPageSize.toString(),
        search: modalSearchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/appellate-report/details?${params.toString()}`);
      if (res.data) {
        setModalGrievances(res.data.content || []);
        setModalTotalRecords(res.data.totalElements || 0);
        setModalTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching Appeal Details:', err);
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
  }, [showModal, activeModalParams, modalCurrentPage, modalPageSize, modalSearchQuery]);

  const handleOpenModal = (department, type, count) => {
    if (!count || count === 0) return;
    const typeLabel = type === 'total' ? 'Total Appeals' : type === 'resolved' ? 'Resolved Appeals' : 'Pending Appeals';
    setModalTitle(`${typeLabel} — ${department}`);
    setActiveModalParams({ department, type });
    setModalCurrentPage(1);
    setModalSearchQuery('');
    setShowModal(true);
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!data || data.length === 0) return;

    const exportRows = data.map((item, index) => ({
      'S. No.': (currentPage - 1) * pageSize + index + 1,
      'Appellate Name': item.name || 'N/A',
      'Office & Designation': item.office || 'N/A',
      'Department': item.department || 'N/A',
      'Total Appeals': item.totalAppeals || 0,
      'Appeals Resolved': item.resolved || 0,
      'Appeals Pending': item.pending || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Appellate Report');
    XLSX.writeFile(workbook, `Appellate_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export PDF
  const handleExportPDF = () => {
    if (!data || data.length === 0) return;

    const doc = new jsPDF('landscape');

    doc.setFontSize(14);
    doc.text(`J&K Samadhan — Appellate Report`, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableHeaders = [[
      'S. No.', 
      'Appellate Name', 
      'Office & Designation', 
      'Department', 
      'Total Appeals', 
      'Appeals Resolved', 
      'Appeals Pending'
    ]];

    const tableData = data.map((item, index) => [
      (currentPage - 1) * pageSize + index + 1,
      item.name || 'N/A',
      item.office || 'N/A',
      item.department || 'N/A',
      item.totalAppeals || 0,
      item.resolved || 0,
      item.pending || 0
    ]);

    doc.autoTable({
      head: tableHeaders,
      body: tableData,
      startY: 26,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`Appellate_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Appellate Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Department-wise summary of appeals assigned to Appellate Authorities
              </p>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={isLoading || data.length === 0}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              title="Download Excel Report"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isLoading || data.length === 0}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              title="Download PDF Report"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          {/* Department Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Department Type
            </label>
            <select
              value={departmentType}
              onChange={(e) => handleFilterChange(setDepartmentType, e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- All Types --</option>
              <option value="ADMIN">ADMIN</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFilterChange(setFromDate, e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => handleFilterChange(setToDate, e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search appellate/department..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <div>
            <button
              onClick={handleClearFilters}
              className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-14 text-center">S. No.</th>
                <th className="py-3.5 px-4">Appellate Name</th>
                <th className="py-3.5 px-4">Office & Designation</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-center">Total Appeals</th>
                <th className="py-3.5 px-4 text-center">Appeals Resolved</th>
                <th className="py-3.5 px-4 text-center">Appeals Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Loading Appellate Report records...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-rose-500 font-semibold">
                    {error}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No Appellate Report records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const serialNo = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr 
                      key={row.id || index}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">{serialNo}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {row.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {row.office || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {row.department || 'N/A'}
                      </td>
                      
                      {/* Total Appeals */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenModal(row.department, 'total', row.totalAppeals)}
                          disabled={!row.totalAppeals || row.totalAppeals === 0}
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            row.totalAppeals > 0
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 cursor-pointer'
                              : 'text-slate-400 cursor-default'
                          }`}
                        >
                          {row.totalAppeals || 0}
                        </button>
                      </td>

                      {/* Resolved */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenModal(row.department, 'resolved', row.resolved)}
                          disabled={!row.resolved || row.resolved === 0}
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            row.resolved > 0
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 cursor-pointer'
                              : 'text-slate-400 cursor-default'
                          }`}
                        >
                          {row.resolved || 0}
                        </button>
                      </td>

                      {/* Pending */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenModal(row.department, 'pending', row.pending)}
                          disabled={!row.pending || row.pending === 0}
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            row.pending > 0
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-400 cursor-pointer'
                              : 'text-slate-400 cursor-default'
                          }`}
                        >
                          {row.pending || 0}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination Controls */}
        {!isLoading && data.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalRecords)} to{' '}
                {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
              </span>
              <div className="flex items-center gap-1.5">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-700 dark:text-slate-200">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drill-down Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn text-left">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {modalTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  Click on any Grievance ID to open full grievance details
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls Bar */}
            <div className="p-4 bg-slate-50/30 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search grievance ID or applicant..."
                  value={modalSearchQuery}
                  onChange={(e) => {
                    setModalSearchQuery(e.target.value);
                    setModalCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Total Records: <strong>{modalTotalRecords}</strong>
              </div>
            </div>

            {/* Modal Table Body */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3 w-12 text-center">S. No.</th>
                    <th className="py-2.5 px-3">Grievance ID</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Submitted By</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {isModalLoading ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span>Loading details...</span>
                        </div>
                      </td>
                    </tr>
                  ) : modalGrievances.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No appeal records found.
                      </td>
                    </tr>
                  ) : (
                    modalGrievances.map((g, idx) => {
                      const sNo = (modalCurrentPage - 1) * modalPageSize + idx + 1;
                      return (
                        <tr key={g.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">{sNo}</td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => {
                                setShowModal(false);
                                navigate(`/grievance/${g.id || g.uniqId}`);
                              }}
                              className="font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{g.grievanceId || g.uniqId}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{g.category || 'N/A'}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{g.submittedBy || 'N/A'}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              LOWER(g.status || '') === 'resolved' || LOWER(g.status || '') === 'disposed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                            }`}>
                              {g.status || 'Appealed'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{g.createdDate ? g.createdDate.slice(0, 10) : 'N/A'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer / Pagination */}
            {modalTotalPages > 1 && (
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Page {modalCurrentPage} of {modalTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModalCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={modalCurrentPage === 1}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setModalCurrentPage((prev) => Math.min(prev + 1, modalTotalPages))}
                    disabled={modalCurrentPage === modalTotalPages}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LOWER(str) {
  return str ? str.toLowerCase() : '';
}
