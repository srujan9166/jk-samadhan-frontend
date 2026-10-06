import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Plus, 
  X,
  FileDown,
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import axiosClient from '../../api/axiosClient';
import CreateAnnouncementModal from '../../components/modals/CreateAnnouncementModal';

export default function AnnouncementNotificationReport() {
  // Selected View Mode: 'announcementwise' or 'misreportwise'
  const [activeViewMode, setActiveViewMode] = useState('announcementwise');

  // Announcement List State
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // MIS Report State
  const [misData, setMisData] = useState([]);
  const [isMisLoading, setIsMisLoading] = useState(false);
  const [misCurrentPage, setMisCurrentPage] = useState(1);
  const [misPageSize, setMisPageSize] = useState(10);
  const [misTotalRecords, setMisTotalRecords] = useState(0);
  const [misTotalPages, setMisTotalPages] = useState(0);
  const [misSearchQuery, setMisSearchQuery] = useState('');

  // Modal State for Department Announcements
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [selectedDeptName, setSelectedDeptName] = useState('');
  const [deptAnnouncements, setDeptAnnouncements] = useState([]);
  const [isDeptLoading, setIsDeptLoading] = useState(false);

  // Create Announcement Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Toggle status loading IDs map
  const [togglingIds, setTogglingIds] = useState({});

  // Fetch Announcement List
  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: (currentPage - 1).toString(),
        size: pageSize.toString(),
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/announcements/list?${params.toString()}`);
      if (res.data) {
        setAnnouncements(res.data.content || []);
        setTotalRecords(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching Announcement List:', err);
      setError('Failed to load announcements.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeViewMode === 'announcementwise') {
      const delayDebounceFn = setTimeout(() => {
        fetchAnnouncements();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [activeViewMode, currentPage, pageSize, searchQuery]);

  // Fetch MIS Report Data
  const fetchMisReport = async () => {
    setIsMisLoading(true);
    try {
      const params = new URLSearchParams({
        page: (misCurrentPage - 1).toString(),
        size: misPageSize.toString(),
        search: misSearchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/announcements/mis-report?${params.toString()}`);
      if (res.data) {
        setMisData(res.data.content || []);
        setMisTotalRecords(res.data.totalElements || 0);
        setMisTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching Announcement MIS Report:', err);
    } finally {
      setIsMisLoading(false);
    }
  };

  useEffect(() => {
    if (activeViewMode === 'misreportwise') {
      const delayDebounceFn = setTimeout(() => {
        fetchMisReport();
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [activeViewMode, misCurrentPage, misPageSize, misSearchQuery]);

  // Handle Visibility/Active Status Toggle
  const handleToggleStatus = async (item) => {
    if (item.isExpired) return;
    const newActiveState = item.isactive === 1 ? 0 : 1;

    setTogglingIds((prev) => ({ ...prev, [item.id]: true }));
    try {
      await axiosClient.post('/api/super-admin/announcements/toggle-status', {
        id: item.id,
        isactive: newActiveState
      });

      // Optimistically update local state
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, isactive: newActiveState } : a))
      );
    } catch (err) {
      console.error('Failed to toggle announcement status:', err);
      alert('Failed to update announcement status. Please try again.');
    } finally {
      setTogglingIds((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  // Open Department Announcements Modal
  const handleOpenDeptModal = async (departmentName) => {
    setSelectedDeptName(departmentName);
    setShowDeptModal(true);
    setIsDeptLoading(true);

    try {
      const params = new URLSearchParams({ department: departmentName });
      const res = await axiosClient.get(`/api/super-admin/announcements/department-details?${params.toString()}`);
      setDeptAnnouncements(res.data || []);
    } catch (err) {
      console.error('Error loading department announcements:', err);
      setDeptAnnouncements([]);
    } finally {
      setIsDeptLoading(false);
    }
  };

  // Export MIS Report Excel
  const handleExportMisExcel = () => {
    if (!misData || misData.length === 0) return;

    const exportRows = misData.map((item, index) => ({
      'S. No.': (misCurrentPage - 1) * misPageSize + index + 1,
      'Department': item.department || 'N/A',
      'Announcement Count': item.count || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Announcement MIS Report');
    XLSX.writeFile(workbook, `Announcement_MIS_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export MIS Report PDF
  const handleExportMisPDF = () => {
    if (!misData || misData.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`J&K Samadhan — Announcement MIS Report`, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableHeaders = [['S. No.', 'Department', 'Announcement Count']];
    const tableData = misData.map((item, index) => [
      (misCurrentPage - 1) * misPageSize + index + 1,
      item.department || 'N/A',
      item.count || 0
    ]);

    doc.autoTable({
      head: tableHeaders,
      body: tableData,
      startY: 26,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    doc.save(`Announcement_MIS_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Announcement / Notification List
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View, filter, and inspect portal-wide and department announcements
              </p>
            </div>
          </div>

          {/* Action Button: Create Announcement */}
          <div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create Announcement</span>
            </button>
          </div>
        </div>

        {/* Radio Filter Toggle Section */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Filter View:
            </label>
            
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                value="announcementwise"
                checked={activeViewMode === 'announcementwise'}
                onChange={() => setActiveViewMode('announcementwise')}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span>Announcement</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="viewMode"
                value="misreportwise"
                checked={activeViewMode === 'misreportwise'}
                onChange={() => setActiveViewMode('misreportwise')}
                className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span>MIS Report</span>
            </label>
          </div>

          {/* If MIS Report View is selected, show export buttons */}
          {activeViewMode === 'misreportwise' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportMisExcel}
                disabled={isMisLoading || misData.length === 0}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
              <button
                onClick={handleExportMisPDF}
                disabled={isMisLoading || misData.length === 0}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: ANNOUNCEMENT LIST TABLE */}
      {activeViewMode === 'announcementwise' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
          {/* Table Header Controls */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search announcement text, department..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={fetchAnnouncements}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">S.No.</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Office Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Created By</th>
                  <th className="py-3.5 px-4 max-w-xs">Notification</th>
                  <th className="py-3.5 px-4">Created At</th>
                  <th className="py-3.5 px-4">Valid Till</th>
                  <th className="py-3.5 px-4 text-center">Attachment</th>
                  <th className="py-3.5 px-4 text-center">Visibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span>Loading Announcements...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-rose-500 font-semibold">
                      {error}
                    </td>
                  </tr>
                ) : announcements.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-12 text-center text-slate-400">
                      No announcement records found.
                    </td>
                  </tr>
                ) : (
                  announcements.map((row, index) => {
                    const serialNo = (currentPage - 1) * pageSize + index + 1;
                    const isToggling = togglingIds[row.id];

                    return (
                      <tr key={row.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">{serialNo}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{row.department || 'All Departments'}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.officeName || 'N/A'}</td>
                        
                        {/* Type Badge */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.type === 'Important' 
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' 
                              : row.type === 'Notice' 
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' 
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {row.type || 'General'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.nameWithDesignation || row.createdby || 'System'}</td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-800 dark:text-slate-200" title={row.notification}>
                          {row.notification || 'N/A'}
                        </td>
                        
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {formatDateTime(row.createdat)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {formatDateTime(row.validtill)}
                        </td>

                        {/* Attachment Download */}
                        <td className="py-3 px-4 text-center">
                          {row.filepath ? (
                            <a
                              href={`/api/announcements/${row.id}/file`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 inline-flex items-center gap-1 font-semibold text-xs cursor-pointer"
                              title="View / Download Attachment"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">None</span>
                          )}
                        </td>

                        {/* Active Toggle Switch */}
                        <td className="py-3 px-4 text-center">
                          {row.isExpired ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Expired
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(row)}
                              disabled={isToggling}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                row.isactive === 1 ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                  row.isactive === 1 ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Announcement List Footer / Pagination */}
          {!isLoading && announcements.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalRecords)} to{' '}
                {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-700 dark:text-slate-200">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MIS REPORT TABLE */}
      {activeViewMode === 'misreportwise' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search department..."
                value={misSearchQuery}
                onChange={(e) => {
                  setMisSearchQuery(e.target.value);
                  setMisCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={fetchMisReport}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-14 text-center">S.No.</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4 text-center">Announcement Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {isMisLoading ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                        <span>Loading MIS Report...</span>
                      </div>
                    </td>
                  </tr>
                ) : misData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-slate-400">
                      No department announcement counts found.
                    </td>
                  </tr>
                ) : (
                  misData.map((row, index) => {
                    const serialNo = (misCurrentPage - 1) * misPageSize + index + 1;
                    return (
                      <tr key={index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">{serialNo}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{row.department}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenDeptModal(row.department)}
                            className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/50 dark:text-purple-400 transition-colors cursor-pointer"
                          >
                            {row.count}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MIS Report Pagination */}
          {!isMisLoading && misData.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Page {misCurrentPage} of {misTotalPages}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMisCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={misCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setMisCurrentPage((prev) => Math.min(prev + 1, misTotalPages))}
                  disabled={misCurrentPage === misTotalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEPARTMENT ANNOUNCEMENTS MODAL */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn text-left">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Announcements for {selectedDeptName}
                </h3>
              </div>
              <button
                onClick={() => setShowDeptModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3 w-12 text-center">S.No.</th>
                    <th className="py-2.5 px-3">Office Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Created By</th>
                    <th className="py-2.5 px-3 max-w-xs">Notification</th>
                    <th className="py-2.5 px-3">Created At</th>
                    <th className="py-2.5 px-3">Valid Till</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {isDeptLoading ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600 mx-auto" />
                        <span>Loading department announcements...</span>
                      </td>
                    </tr>
                  ) : deptAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No announcements found for this department.
                      </td>
                    </tr>
                  ) : (
                    deptAnnouncements.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3">{item.officeName || 'N/A'}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {item.type || 'General'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{item.nameWithDesignation || item.createdby}</td>
                        <td className="py-2.5 px-3 max-w-xs truncate" title={item.notification}>{item.notification}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{formatDateTime(item.createdat)}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">{formatDateTime(item.validtill)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          fetchAnnouncements();
          if (activeViewMode === 'misreportwise') fetchMisReport();
        }}
      />
    </div>
  );
}

function formatDateTime(dtStr) {
  if (!dtStr) return 'N/A';
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return dtStr;
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  } catch (e) {
    return dtStr;
  }
}
