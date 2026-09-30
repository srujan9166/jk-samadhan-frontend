import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileSpreadsheet, FileText, X, RefreshCw, ChevronLeft, ChevronRight, Eye, ClipboardList } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function DealingHandGrievancesReport() {
  // Main Report State
  const [dhList, setDhList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal State for Click on Total
  const [selectedUser, setSelectedUser] = useState(null); // { fullName, email, username }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalGrievances, setModalGrievances] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalEntriesPerPage, setModalEntriesPerPage] = useState(10);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalTotalElements, setModalTotalElements] = useState(0);
  const [modalTotalPages, setModalTotalPages] = useState(0);

  // Fetch Main Dealing Hand Report Data
  const fetchDHReport = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get('/api/super-admin/dealing-hand-grievances', {
        params: {
          page: currentPage - 1,
          size: entriesPerPage,
          search: searchQuery,
        },
      });
      if (response.data && response.data.content) {
        setDhList(response.data.content);
        setTotalElements(response.data.totalElements || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setDhList([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching Dealing Hand report:', err);
      setDhList([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchDHReport();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, entriesPerPage, searchQuery]);

  // Fetch Modal Grievance Details when a user's Total is clicked
  const fetchUserGrievancesModal = async (userObj) => {
    setIsModalLoading(true);
    try {
      const usernameParam = userObj.email || userObj.username || String(userObj.userId);
      const response = await axiosClient.get('/api/super-admin/dealing-hand-grievances/user-details', {
        params: {
          username: usernameParam,
          page: modalCurrentPage - 1,
          size: modalEntriesPerPage,
          search: modalSearchQuery,
        },
      });
      if (response.data && response.data.content) {
        setModalGrievances(response.data.content);
        setModalTotalElements(response.data.totalElements || 0);
        setModalTotalPages(response.data.totalPages || 0);
      } else {
        setModalGrievances([]);
        setModalTotalElements(0);
        setModalTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching modal grievance details:', err);
      setModalGrievances([]);
      setModalTotalElements(0);
      setModalTotalPages(0);
    } finally {
      setIsModalLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && selectedUser) {
      const delayDebounceFn = setTimeout(() => {
        fetchUserGrievancesModal(selectedUser);
      }, 300);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [isModalOpen, selectedUser, modalCurrentPage, modalEntriesPerPage, modalSearchQuery]);

  const handleOpenModal = (userObj) => {
    setSelectedUser(userObj);
    setModalCurrentPage(1);
    setModalSearchQuery('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setModalGrievances([]);
  };

  // Main Report Exports
  const handleMainExportExcel = () => {
    if (!dhList.length) return;
    const headers = ["S. No.", "Username", "Email", "Designation", "Contact Number", "Total"];
    const rows = dhList.map((item, idx) => [
      (currentPage - 1) * entriesPerPage + idx + 1,
      item.fullName || item.username,
      item.email || item.username,
      item.designation || 'Dealing Hand User',
      item.mobile || 'N/A',
      item.totalGrievances || 0
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DealingHandReport");
    XLSX.writeFile(workbook, `Dealing_Hand_Grievances_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleMainExportPDF = () => {
    if (!dhList.length) return;
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text("Dealing Hand Grievances Report - J&K Samadhan 3.0", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 22);

    const headers = [["S. No.", "Username", "Email", "Designation", "Contact Number", "Total"]];
    const rows = dhList.map((item, idx) => [
      (currentPage - 1) * entriesPerPage + idx + 1,
      item.fullName || item.username,
      item.email || item.username,
      item.designation || 'Dealing Hand User',
      item.mobile || 'N/A',
      item.totalGrievances || 0
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`Dealing_Hand_Grievances_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Modal Table Exports
  const handleModalExportExcel = () => {
    if (!modalGrievances.length) return;
    const headers = ["S. No.", "Grievance ID", "Department", "Category", "Submitted By", "Date", "Status"];
    const rows = modalGrievances.map((g, idx) => [
      (modalCurrentPage - 1) * modalEntriesPerPage + idx + 1,
      g.uniqId || `GRV2026/${g.id}`,
      g.department || 'N/A',
      g.grievanceCategory || 'N/A',
      g.citizenName || (g.submittedBy ? g.submittedBy.name : 'N/A'),
      g.createdAt || 'N/A',
      g.status || 'Pending'
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UserGrievances");
    XLSX.writeFile(workbook, `Dealing_Hand_${selectedUser?.username || 'User'}_Grievances.xlsx`);
  };

  const handleModalExportPDF = () => {
    if (!modalGrievances.length) return;
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text(`Grievances List - ${selectedUser?.fullName || selectedUser?.username}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 22);

    const headers = [["S. No.", "Grievance ID", "Department", "Category", "Submitted By", "Date", "Status"]];
    const rows = modalGrievances.map((g, idx) => [
      (modalCurrentPage - 1) * modalEntriesPerPage + idx + 1,
      g.uniqId || `GRV2026/${g.id}`,
      g.department || 'N/A',
      g.grievanceCategory || 'N/A',
      g.citizenName || (g.submittedBy ? g.submittedBy.name : 'N/A'),
      g.createdAt || 'N/A',
      g.status || 'Pending'
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`Dealing_Hand_${selectedUser?.username || 'User'}_Grievances.pdf`);
  };

  return (
    <div className="space-y-5 font-sans text-left animate-fadeIn">
      {/* ── MAIN REPORT CARD ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        
        {/* Card Header & Export Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wide flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" />
              <span>Dealing Hand Grievances Report</span>
            </h3>
          </div>

          {/* Round Export Buttons (Excel & PDF) */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleMainExportExcel}
              title="Download Excel Report"
              className="w-8 h-8 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white flex items-center justify-center border-0 cursor-pointer shadow-xs hover:scale-105 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            </button>
            <button
              type="button"
              onClick={handleMainExportPDF}
              title="Download PDF Report"
              className="w-8 h-8 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white flex items-center justify-center border-0 cursor-pointer shadow-xs hover:scale-105 transition-all"
            >
              <FileText className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>

        {/* Entries & Search Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-2.5 py-1 font-bold text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="font-semibold text-slate-600 dark:text-slate-400">entries</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Search:</span>
            <div className="relative w-56">
              <input
                type="text"
                placeholder=""
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md py-1 pl-2.5 pr-8 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-600 text-white font-extrabold uppercase tracking-wider text-[11px] select-none border-b border-blue-700">
                <th className="p-3 text-center">S. No.</th>
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Contact Number</th>
                <th className="p-3 text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-bold">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                      <span>Loading Dealing Hand Grievances Report...</span>
                    </div>
                  </td>
                </tr>
              ) : dhList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 font-bold">
                    No Dealing Hand records found.
                  </td>
                </tr>
              ) : (
                dhList.map((item, idx) => (
                  <tr
                    key={item.userId || idx}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-400">
                      {(currentPage - 1) * entriesPerPage + idx + 1}
                    </td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {item.fullName || item.username}
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                      {item.email || item.username}
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                      {item.designation || 'Dealing Hand User'}
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                      {item.mobile || 'N/A'}
                    </td>
                    <td className="p-3 text-center font-extrabold">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 font-extrabold underline rounded cursor-pointer transition-colors border-0"
                      >
                        {item.totalGrievances || 0}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-2">
          <div className="text-slate-500 font-medium">
            Showing {totalElements > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to {Math.min(currentPage * entriesPerPage, totalElements)} of {totalElements} entries
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded font-bold border transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── CLICK ON TOTAL: GRIEVANCE LIST MODAL / POPUP ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-base">
                  Grievance List — <span className="text-blue-600">{selectedUser?.fullName || selectedUser?.username}</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Email: {selectedUser?.email || selectedUser?.username} | Designation: {selectedUser?.designation || 'Dealing Hand'}
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 flex items-center justify-center border-0 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Controls */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Show</span>
                  <select
                    value={modalEntriesPerPage}
                    onChange={(e) => {
                      setModalEntriesPerPage(Number(e.target.value));
                      setModalCurrentPage(1);
                    }}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 font-bold text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">entries</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleModalExportExcel}
                      title="Export Excel"
                      className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center border-0 cursor-pointer hover:bg-slate-800"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                    <button
                      type="button"
                      onClick={handleModalExportPDF}
                      title="Export PDF"
                      className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center border-0 cursor-pointer hover:bg-slate-800"
                    >
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Search:</span>
                    <input
                      type="text"
                      placeholder=""
                      value={modalSearchQuery}
                      onChange={(e) => {
                        setModalSearchQuery(e.target.value);
                        setModalCurrentPage(1);
                      }}
                      className="w-48 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md py-1 px-2 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Grievances Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-600 text-white font-extrabold uppercase tracking-wider text-[10px] select-none border-b border-blue-700">
                      <th className="p-3 text-center">S. No.</th>
                      <th className="p-3">Grievance ID</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Submitted By</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isModalLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400 font-bold">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                            <span>Loading grievances...</span>
                          </div>
                        </td>
                      </tr>
                    ) : modalGrievances.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400 font-bold">
                          No grievances found for this user.
                        </td>
                      </tr>
                    ) : (
                      modalGrievances.map((g, idx) => (
                        <tr
                          key={g.id || idx}
                          className="hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          <td className="p-3 text-center font-bold text-slate-600 dark:text-slate-400">
                            {(modalCurrentPage - 1) * modalEntriesPerPage + idx + 1}
                          </td>
                          <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                            <Link
                              to={`/superadmin/grievance-details/${g.id}`}
                              onClick={handleCloseModal}
                              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer no-underline block"
                            >
                              {g.uniqId || `GRV2026/${g.id}`}
                            </Link>
                          </td>
                          <td className="p-3 font-medium text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                            {g.department || 'N/A'}
                          </td>
                          <td className="p-3 font-medium text-slate-700 dark:text-slate-300 max-w-[220px] truncate">
                            {g.grievanceCategory || 'N/A'}
                          </td>
                          <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                            {g.citizenName || (g.submittedBy ? g.submittedBy.name : 'N/A')}
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[10px]">
                            {g.createdAt || 'N/A'}
                          </td>
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              g.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                              g.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {g.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium">
                Showing {modalTotalElements > 0 ? (modalCurrentPage - 1) * modalEntriesPerPage + 1 : 0} to {Math.min(modalCurrentPage * modalEntriesPerPage, modalTotalElements)} of {modalTotalElements} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={modalCurrentPage <= 1 || isModalLoading}
                  onClick={() => setModalCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(modalTotalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setModalCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded font-bold border cursor-pointer ${
                        modalCurrentPage === pageNum
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={modalCurrentPage >= modalTotalPages || isModalLoading}
                  onClick={() => setModalCurrentPage((p) => Math.min(p + 1, modalTotalPages))}
                  className="px-3 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
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
