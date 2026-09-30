import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  BarChart3,
  X,
  ExternalLink
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function StatusWiseReport() {
  const navigate = useNavigate();
  
  // Filter mode: 'department' or 'user'
  const [reportMode, setReportMode] = useState('department');

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

  // Modal State for Clicked Status Counts
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
      const params = new URLSearchParams({
        mode: reportMode,
        page: (currentPage - 1).toString(),
        size: pageSize.toString(),
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/status-wise-report?${params.toString()}`);
      if (res.data) {
        setData(res.data.content || []);
        setTotalRecords(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching Status Wise Report:', err);
      setError('Failed to load Status Wise Report records.');
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

  // Fetch Modal Details when count cell is clicked
  const fetchModalDetails = async (paramsObj) => {
    setIsModalLoading(true);
    try {
      const params = new URLSearchParams({
        department: paramsObj.department || '',
        username: paramsObj.username || '',
        status: paramsObj.status || 'all',
        page: (modalCurrentPage - 1).toString(),
        size: modalPageSize.toString(),
        search: modalSearchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/status-wise-report/details?${params.toString()}`);
      if (res.data) {
        setModalGrievances(res.data.content || []);
        setModalTotalRecords(res.data.totalElements || 0);
        setModalTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching status modal details:', err);
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

  const handleCellClick = (item, statusField, statusLabel) => {
    const isDept = reportMode === 'department';
    const deptName = isDept ? item.departmentName : item.departmentName;
    const uname = isDept ? '' : item.username;

    let targetStatus = 'all';
    if (statusField === 'resolved') targetStatus = 'Resolved';
    else if (statusField === 'pending') targetStatus = 'Pending';
    else if (statusField === 'forwarded') targetStatus = 'Forwarded';
    else if (statusField === 'dnp') targetStatus = 'Does Not Pertain';
    else if (statusField === 'remark') targetStatus = 'Remark Added';
    else if (statusField === 'rejected') targetStatus = 'Rejected';
    else if (statusField === 'appealed') targetStatus = 'Appealed';

    const title = `${statusLabel} Grievances - ${isDept ? item.departmentName : item.officerName || item.username}`;
    setModalTitle(title);
    setModalCurrentPage(1);
    setModalSearchQuery('');
    
    const params = { department: deptName, username: uname, status: targetStatus };
    setActiveModalParams(params);
    setShowModal(true);
  };

  // Excel Export
  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams({
        mode: reportMode,
        page: '0',
        size: '5000',
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/super-admin/status-wise-report?${params.toString()}`);
      const exportList = res.data?.content || data;

      let formattedData = [];
      if (reportMode === 'department') {
        formattedData = exportList.map((row, idx) => ({
          'S. No.': idx + 1,
          'Department Name': row.departmentName || 'N/A',
          'Total': row.totalCount || 0,
          'Resolved': row.resolvedCount || 0,
          'Forwarded': row.forwardedCount || 0,
          'Does Not Pertain': row.dnpCount || 0,
          'Pending': row.pendingCount || 0,
          'Rejected': row.rejectedCount || 0,
          'Appealed': row.appealedCount || 0
        }));
      } else {
        formattedData = exportList.map((row, idx) => ({
          'S. No.': idx + 1,
          'Officer Name': row.officerName || 'N/A',
          'Office Name & Designation': row.officeAndDesignation || 'N/A',
          'Department': row.departmentName || 'N/A',
          'User Type': row.userType || 'N/A',
          'User Level': row.userLevel || 'N/A',
          'Total': row.totalCount || 0,
          'Resolved': row.resolvedCount || 0,
          'Pending': row.pendingCount || 0,
          'Forwarded': row.forwardedCount || 0,
          'Does Not Pertain': row.dnpCount || 0,
          'Remark Added': row.remarkCount || 0,
          'Rejected': row.rejectedCount || 0,
          'Appealed': row.appealedCount || 0
        }));
      }

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      const sheetName = reportMode === 'department' ? 'Dept Wise Status' : 'User Wise Status';
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, `${sheetName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Error exporting Excel:', err);
      alert('Failed to export Excel report.');
    }
  };

  // PDF Export
  const exportToPDF = async () => {
    try {
      const params = new URLSearchParams({
        mode: reportMode,
        page: '0',
        size: '2000',
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/super-admin/status-wise-report?${params.toString()}`);
      const exportList = res.data?.content || data;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const reportTitle = reportMode === 'department' ? 'Department Wise Status Report' : 'User Wise Status Report';
      
      doc.setFontSize(14);
      doc.text(`J&K Samadhan - ${reportTitle}`, 40, 40);
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 55);

      let tableColumn = [];
      let tableRows = [];

      if (reportMode === 'department') {
        tableColumn = ['S. No.', 'Department Name', 'Total', 'Resolved', 'Forwarded', 'Does Not Pertain', 'Pending', 'Rejected', 'Appealed'];
        tableRows = exportList.map((row, idx) => [
          idx + 1,
          row.departmentName || 'N/A',
          row.totalCount || 0,
          row.resolvedCount || 0,
          row.forwardedCount || 0,
          row.dnpCount || 0,
          row.pendingCount || 0,
          row.rejectedCount || 0,
          row.appealedCount || 0
        ]);
      } else {
        tableColumn = ['S. No.', 'Officer Name', 'Office & Designation', 'Department', 'User Type', 'User Level', 'Total', 'Resolved', 'Pending', 'Forwarded', 'DNP', 'Remark', 'Rejected', 'Appealed'];
        tableRows = exportList.map((row, idx) => [
          idx + 1,
          row.officerName || 'N/A',
          row.officeAndDesignation || 'N/A',
          row.departmentName || 'N/A',
          row.userType || 'N/A',
          row.userLevel || 'N/A',
          row.totalCount || 0,
          row.resolvedCount || 0,
          row.pendingCount || 0,
          row.forwardedCount || 0,
          row.dnpCount || 0,
          row.remarkCount || 0,
          row.rejectedCount || 0,
          row.appealedCount || 0
        ]);
      }

      doc.autoTable({
        startY: 70,
        head: [tableColumn],
        body: tableRows,
        styles: { fontSize: 7, cellPadding: 4 },
        headStyles: { fillColor: [30, 31, 49], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        theme: 'grid'
      });

      doc.save(`${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to export PDF report.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs animate-fadeIn space-y-4 p-5">
      
      {/* ── TOP TITLE & FILTER BOX CONTAINER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Radio Filter Box (Matches JKSv2 screenshot) */}
        <div className="p-3 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-2xs inline-flex items-center gap-4">
          <span className="font-bold text-slate-700 dark:text-slate-300 text-xs pl-1">Filter</span>
          <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
            <input
              type="radio"
              name="statusReportMode"
              value="user"
              checked={reportMode === 'user'}
              onChange={() => { setReportMode('user'); setCurrentPage(1); }}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>User Wise</span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200 pr-2">
            <input
              type="radio"
              name="statusReportMode"
              value="department"
              checked={reportMode === 'department'}
              onChange={() => { setReportMode('department'); setCurrentPage(1); }}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span>Department Wise</span>
          </label>
        </div>

        {/* Dynamic Center Title */}
        <div className="text-center md:text-left flex-1 md:pl-6">
          <h2 className="text-lg font-extrabold text-blue-600 dark:text-blue-400 tracking-wide">
            {reportMode === 'department' ? 'Department Wise Status Report' : 'User Wise Status Report'}
          </h2>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            onClick={fetchReportData}
            title="Refresh Data"
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all border-0 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportToExcel}
            title="Export Excel"
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm border-0 cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            onClick={exportToPDF}
            title="Export PDF"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 active:bg-black text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm border-0 cursor-pointer transition-all dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & PAGE SIZE CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium text-xs">Show</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-bold text-slate-800 dark:text-slate-200 outline-none text-xs"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-500 font-medium text-xs">entries</span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={reportMode === 'department' ? "Search department..." : "Search officer, office, dept..."}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* ── MAIN TABLE DISPLAY ── */}
      <div className="overflow-x-auto min-h-[350px] border border-slate-200 dark:border-slate-800 rounded-xl">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="font-bold text-slate-500 text-xs">Loading Status Wise Report...</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-500 font-bold text-xs">{error}</div>
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold text-xs">
            No Status Wise records found matching criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#3b82f6] text-white font-extrabold text-[11px] uppercase tracking-wider">
                <th className="p-3 w-12 text-center border-r border-blue-400/30">S. No.</th>
                
                {reportMode === 'department' ? (
                  <>
                    <th className="p-3 border-r border-blue-400/30">Department Name</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Total</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Resolved</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Forwarded</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Does Not Pertain</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Pending</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Rejected</th>
                    <th className="p-3 text-center">Appealed</th>
                  </>
                ) : (
                  <>
                    <th className="p-3 border-r border-blue-400/30">Officer Name</th>
                    <th className="p-3 border-r border-blue-400/30">Office Name & Designation</th>
                    <th className="p-3 border-r border-blue-400/30">Department</th>
                    <th className="p-3 border-r border-blue-400/30">User Type</th>
                    <th className="p-3 border-r border-blue-400/30">User Level</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Total</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Resolved</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Pending</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Forwarded</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Does Not Pertain</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Remark Added</th>
                    <th className="p-3 text-center border-r border-blue-400/30">Rejected</th>
                    <th className="p-3 text-center">Appealed</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300 text-xs">
              {data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 text-center font-bold text-slate-500">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>

                  {reportMode === 'department' ? (
                    <>
                      <td className="p-3 font-bold text-slate-900 dark:text-white uppercase">
                        {row.departmentName || 'N/A'}
                      </td>
                      <td className="p-3 text-center font-extrabold text-blue-600 dark:text-blue-400">
                        <button onClick={() => handleCellClick(row, 'all', 'Total')} className="hover:underline border-0 bg-transparent cursor-pointer font-extrabold text-blue-600 dark:text-blue-400">
                          {row.totalCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        <button onClick={() => handleCellClick(row, 'resolved', 'Resolved')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-emerald-600 dark:text-emerald-400">
                          {row.resolvedCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-blue-600">
                        <button onClick={() => handleCellClick(row, 'forwarded', 'Forwarded')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-blue-600">
                          {row.forwardedCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-purple-600">
                        <button onClick={() => handleCellClick(row, 'dnp', 'Does Not Pertain')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-purple-600">
                          {row.dnpCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-amber-600">
                        <button onClick={() => handleCellClick(row, 'pending', 'Pending')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-amber-600">
                          {row.pendingCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-rose-600">
                        <button onClick={() => handleCellClick(row, 'rejected', 'Rejected')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-rose-600">
                          {row.rejectedCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-indigo-600">
                        <button onClick={() => handleCellClick(row, 'appealed', 'Appealed')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-indigo-600">
                          {row.appealedCount || 0}
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 font-bold text-slate-900 dark:text-white uppercase">
                        {row.officerName || 'N/A'}
                      </td>
                      <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                        {row.officeAndDesignation || 'N/A'}
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200 uppercase">
                        {row.departmentName || 'N/A'}
                      </td>
                      <td className="p-3 font-semibold text-purple-700 dark:text-purple-400">
                        {row.userType || 'N/A'}
                      </td>
                      <td className="p-3">
                        {row.userLevel || 'N/A'}
                      </td>
                      <td className="p-3 text-center font-extrabold text-blue-600 dark:text-blue-400">
                        <button onClick={() => handleCellClick(row, 'all', 'Total')} className="hover:underline border-0 bg-transparent cursor-pointer font-extrabold text-blue-600 dark:text-blue-400">
                          {row.totalCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        <button onClick={() => handleCellClick(row, 'resolved', 'Resolved')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-emerald-600 dark:text-emerald-400">
                          {row.resolvedCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-amber-600">
                        <button onClick={() => handleCellClick(row, 'pending', 'Pending')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-amber-600">
                          {row.pendingCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-blue-600">
                        <button onClick={() => handleCellClick(row, 'forwarded', 'Forwarded')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-blue-600">
                          {row.forwardedCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-purple-600">
                        <button onClick={() => handleCellClick(row, 'dnp', 'Does Not Pertain')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-purple-600">
                          {row.dnpCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-cyan-600">
                        <button onClick={() => handleCellClick(row, 'remark', 'Remark Added')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-cyan-600">
                          {row.remarkCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-rose-600">
                        <button onClick={() => handleCellClick(row, 'rejected', 'Rejected')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-rose-600">
                          {row.rejectedCount || 0}
                        </button>
                      </td>
                      <td className="p-3 text-center font-bold text-indigo-600">
                        <button onClick={() => handleCellClick(row, 'appealed', 'Appealed')} className="hover:underline border-0 bg-transparent cursor-pointer font-bold text-indigo-600">
                          {row.appealedCount || 0}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── PAGINATION CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs font-semibold text-slate-500">
          Showing {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} entries
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <div className="px-3 py-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
            Page {currentPage} of {totalPages || 1}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages || isLoading}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── GRIEVANCES MODAL POPUP FOR CLICKED COUNTS ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-4 bg-[#1e1f31] text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm tracking-wide flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span>{modalTitle}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white border-0 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Filter */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Total Grievances: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{modalTotalRecords}</span>
              </div>

              <div className="relative w-60">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search grievance ID..."
                  value={modalSearchQuery}
                  onChange={(e) => { setModalSearchQuery(e.target.value); setModalCurrentPage(1); }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isModalLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                  <span className="font-bold text-slate-500 text-xs">Fetching grievances...</span>
                </div>
              ) : modalGrievances.length === 0 ? (
                <div className="py-16 text-center text-slate-400 font-bold">
                  No grievances found.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[11px] uppercase">
                      <th className="p-2.5 w-12 text-center">S. No.</th>
                      <th className="p-2.5">Grievance ID</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Submitted By</th>
                      <th className="p-2.5">Submitted Date</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300 text-xs">
                    {modalGrievances.map((g, idx) => (
                      <tr key={g.id || idx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5 text-center font-bold text-slate-500">
                          {(modalCurrentPage - 1) * modalPageSize + idx + 1}
                        </td>
                        <td className="p-2.5 font-bold">
                          <button
                            onClick={() => navigate(`/superadmin/grievance-details/${g.id}`)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline flex items-center gap-1 font-extrabold border-0 bg-transparent cursor-pointer"
                          >
                            <span>{g.uniqId || `GRV-${g.id}`}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                          </button>
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">
                          {g.department || 'N/A'}
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">
                          {g.grievanceCategory || 'N/A'}
                        </td>
                        <td className="p-2.5 font-medium">
                          {g.submittedBy?.name || 'Complainant'}
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-500">
                          {g.createdAt || 'N/A'}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                            {g.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer & Pagination */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Showing {modalTotalRecords === 0 ? 0 : (modalCurrentPage - 1) * modalPageSize + 1} to {Math.min(modalCurrentPage * modalPageSize, modalTotalRecords)} of {modalTotalRecords} entries
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setModalCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={modalCurrentPage === 1 || isModalLoading}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                >
                  Prev
                </button>
                <span className="font-bold px-2 text-xs">
                  {modalCurrentPage} / {modalTotalPages || 1}
                </span>
                <button
                  onClick={() => setModalCurrentPage(prev => Math.min(prev + 1, modalTotalPages))}
                  disabled={modalCurrentPage >= modalTotalPages || isModalLoading}
                  className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
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
