import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  MapPin,
  X,
  ExternalLink
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function DistrictWiseReport() {
  const navigate = useNavigate();

  // Selected Origin Tab: 'JKSAMADHAN' or 'CPGRAMS'
  const [activeOrigin, setActiveOrigin] = useState('JKSAMADHAN');

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

  // Fetch Main Report Data
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        origin: activeOrigin,
        page: (currentPage - 1).toString(),
        size: pageSize.toString(),
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/district-wise-report?${params.toString()}`);
      if (res.data) {
        setData(res.data.content || []);
        setTotalRecords(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching District Wise Report:', err);
      setError('Failed to load District Wise Report records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReportData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [activeOrigin, currentPage, pageSize, searchQuery]);

  // Fetch Modal Details when count cell is clicked
  const fetchModalDetails = async (paramsObj) => {
    setIsModalLoading(true);
    try {
      const params = new URLSearchParams({
        district: paramsObj.district || '',
        origin: activeOrigin,
        status: paramsObj.status || 'all',
        page: (modalCurrentPage - 1).toString(),
        size: modalPageSize.toString(),
        search: modalSearchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/district-wise-report/details?${params.toString()}`);
      if (res.data) {
        setModalGrievances(res.data.content || []);
        setModalTotalRecords(res.data.totalElements || 0);
        setModalTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching district grievance details:', err);
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
    let targetStatus = 'all';
    if (statusField === 'resolved') targetStatus = 'Resolved';
    else if (statusField === 'pending') targetStatus = 'Pending';
    else if (statusField === 'forwarded') targetStatus = 'Forwarded';
    else if (statusField === 'dnp') targetStatus = 'Does Not Pertain';
    else if (statusField === 'remark') targetStatus = 'Remark Added';
    else if (statusField === 'rejected') targetStatus = 'Rejected';
    else if (statusField === 'appealed') targetStatus = 'Appealed';

    const title = `${statusLabel} Grievances - District: ${item.district}`;
    setModalTitle(title);
    setModalCurrentPage(1);
    setModalSearchQuery('');
    
    const params = { district: item.district, status: targetStatus };
    setActiveModalParams(params);
    setShowModal(true);
  };

  // Excel Export
  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams({
        origin: activeOrigin,
        page: '0',
        size: '5000',
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/district-wise-report?${params.toString()}`);
      const exportData = res.data?.content || data;

      const excelRows = exportData.map((row, idx) => ({
        'Sr No': idx + 1,
        'District': row.district || 'NA',
        'Total till date': row.totalCount || 0,
        'Resolved': row.resolvedCount || 0,
        'Pending': row.pendingCount || 0,
        'Forwarded': row.forwardedCount || 0,
        'Does Not Pertain': row.dnpCount || 0,
        'Remark Added': row.remarkCount || 0,
        'Rejected': row.rejectedCount || 0,
        'Appealed': row.appealedCount || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'District_Wise_Report');
      XLSX.writeFile(workbook, `District_Wise_Report_${activeOrigin}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  // PDF Export
  const exportToPDF = async () => {
    try {
      const params = new URLSearchParams({
        origin: activeOrigin,
        page: '0',
        size: '5000',
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/district-wise-report?${params.toString()}`);
      const exportData = res.data?.content || data;

      const doc = new jsPDF('landscape', 'pt', 'a4');

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(`JK GOVT - District Wise Report (${activeOrigin})`, 40, 40);
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 55);

      const tableColumn = [
        'Sr No',
        'District',
        'Total till date',
        'Resolved',
        'Pending',
        'Forwarded',
        'Does Not Pertain',
        'Remark Added',
        'Rejected',
        'Appealed'
      ];

      const tableRows = exportData.map((row, idx) => [
        idx + 1,
        row.district || 'NA',
        row.totalCount || 0,
        row.resolvedCount || 0,
        row.pendingCount || 0,
        row.forwardedCount || 0,
        row.dnpCount || 0,
        row.remarkCount || 0,
        row.rejectedCount || 0,
        row.appealedCount || 0
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        styles: { fontSize: 8, cellPadding: 5 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      doc.save(`District_Wise_Report_${activeOrigin}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
    }
  };

  return (
    <div className="space-y-6 text-xs text-left">
      {/* Report Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                District Wise Report
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Comprehensive status distribution and grievance metrics categorized by district.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchReportData}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={exportToExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              onClick={exportToPDF}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Origin Toggle Tabs (JKSAMADHAN vs CPGRAMS) */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              setActiveOrigin('JKSAMADHAN');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl font-bold transition-all text-xs cursor-pointer ${
              activeOrigin === 'JKSAMADHAN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            JKSAMADHAN
          </button>
          <button
            onClick={() => {
              setActiveOrigin('CPGRAMS');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl font-bold transition-all text-xs cursor-pointer ${
              activeOrigin === 'CPGRAMS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            CPGRAMS
          </button>
        </div>

        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by District..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-slate-500 text-xs font-medium">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold focus:outline-none text-xs cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 w-14 text-center">Sr No</th>
                <th className="p-3">District</th>
                <th className="p-3 text-center">Total till date</th>
                <th className="p-3 text-center">Resolved</th>
                <th className="p-3 text-center">Pending</th>
                <th className="p-3 text-center">Forwarded</th>
                <th className="p-3 text-center">Does Not Pertain</th>
                <th className="p-3 text-center">Remark Added</th>
                <th className="p-3 text-center">Rejected</th>
                <th className="p-3 text-center">Appealed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Loading District Wise Report data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500 font-medium">
                    No District Wise Report records found.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const srNo = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-slate-700 dark:text-slate-300 font-medium"
                    >
                      <td className="p-3 text-center font-bold text-slate-400">{srNo}</td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">
                        {row.district || 'NA'}
                      </td>

                      {/* Total till date */}
                      <td className="p-3 text-center">
                        <button
                          disabled={!row.totalCount}
                          onClick={() => handleCellClick(row, 'total', 'Total')}
                          className={`font-black px-2.5 py-1 rounded-md transition-colors border-0 cursor-pointer ${
                            row.totalCount > 0
                              ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.totalCount || 0}
                        </button>
                      </td>

                      {/* Resolved */}
                      <td className="p-3 text-center">
                        <button
                          disabled={!row.resolvedCount}
                          onClick={() => handleCellClick(row, 'resolved', 'Resolved')}
                          className={`font-black px-2.5 py-1 rounded-md transition-colors border-0 cursor-pointer ${
                            row.resolvedCount > 0
                              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.resolvedCount || 0}
                        </button>
                      </td>

                      {/* Pending */}
                      <td className="p-3 text-center">
                        <button
                          disabled={!row.pendingCount}
                          onClick={() => handleCellClick(row, 'pending', 'Pending')}
                          className={`font-black px-2.5 py-1 rounded-md transition-colors border-0 cursor-pointer ${
                            row.pendingCount > 0
                              ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.pendingCount || 0}
                        </button>
                      </td>

                      {/* Forwarded */}
                      <td className="p-3 text-center">
                        <button
                          disabled={!row.forwardedCount}
                          onClick={() => handleCellClick(row, 'forwarded', 'Forwarded')}
                          className={`font-black px-2.5 py-1 rounded-md transition-colors border-0 cursor-pointer ${
                            row.forwardedCount > 0
                              ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.forwardedCount || 0}
                        </button>
                      </td>

                      {/* Does Not Pertain */}
                      <td className="p-3 text-center">
                        <button
                          disabled={!row.dnpCount}
                          onClick={() => handleCellClick(row, 'dnp', 'Does Not Pertain')}
                          className={`font-black px-2.5 py-1 rounded-md transition-colors border-0 cursor-pointer ${
                            row.dnpCount > 0
                              ? 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.dnpCount || 0}
                        </button>
                      </td>

                      {/* Remark Added */}
                      <td className="p-3 text-center">
                        <button
                          disabled={!row.remarkCount}
                          onClick={() => handleCellClick(row, 'remark', 'Remark Added')}
                          className={`font-black px-2.5 py-1 rounded-md transition-colors border-0 cursor-pointer ${
                            row.remarkCount > 0
                              ? 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.remarkCount || 0}
                        </button>
                      </td>

                      {/* Rejected */}
                      <td className="p-3 text-center">
                        <button
                          disabled={!row.rejectedCount}
                          onClick={() => handleCellClick(row, 'rejected', 'Rejected')}
                          className={`font-black px-2.5 py-1 rounded-md transition-colors border-0 cursor-pointer ${
                            row.rejectedCount > 0
                              ? 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.rejectedCount || 0}
                        </button>
                      </td>

                      {/* Appealed */}
                      <td className="p-3 text-center">
                        <button
                          disabled={!row.appealedCount}
                          onClick={() => handleCellClick(row, 'appealed', 'Appealed')}
                          className={`font-black px-2.5 py-1 rounded-md transition-colors border-0 cursor-pointer ${
                            row.appealedCount > 0
                              ? 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.appealedCount || 0}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalRecords > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-slate-500">
            <div>
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalRecords)} to{' '}
              {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Clicked Status Grievance List */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[85vh] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                {modalTitle}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter modal list..."
                    value={modalSearchQuery}
                    onChange={(e) => {
                      setModalSearchQuery(e.target.value);
                      setModalCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                  <span className="text-slate-500 font-medium">Rows:</span>
                  <select
                    value={modalPageSize}
                    onChange={(e) => {
                      setModalPageSize(Number(e.target.value));
                      setModalCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              {/* Modal Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-xs">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3">Grievance ID</th>
                      <th className="p-3">Complainant</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {isModalLoading ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                            <span>Loading grievances...</span>
                          </div>
                        </td>
                      </tr>
                    ) : modalGrievances.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                          No matching grievances found.
                        </td>
                      </tr>
                    ) : (
                      modalGrievances.map((g, idx) => {
                        const mSrNo = (modalCurrentPage - 1) * modalPageSize + idx + 1;
                        return (
                          <tr key={g.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-3 text-center text-slate-400 font-bold">{mSrNo}</td>
                            <td className="p-3 font-extrabold text-blue-600 dark:text-blue-400">
                              {g.uniqId || g.id}
                            </td>
                            <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                              {g.citizenName || 'CITIZEN'}
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">
                              {g.grievanceCategory || 'General'}
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">
                              {g.department || 'General Administration'}
                            </td>
                            <td className="p-3 font-bold">
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                                {g.status || 'Registered'}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => navigate(`/dashboard/grievance/${g.id}`)}
                                className="p-1 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-md hover:bg-blue-100 transition-colors border-0 cursor-pointer inline-flex items-center gap-1"
                                title="View Grievance Details"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Pagination */}
              {!isModalLoading && modalTotalRecords > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <div>
                    Showing {Math.min((modalCurrentPage - 1) * modalPageSize + 1, modalTotalRecords)} to{' '}
                    {Math.min(modalCurrentPage * modalPageSize, modalTotalRecords)} of {modalTotalRecords} records
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={modalCurrentPage === 1}
                      onClick={() => setModalCurrentPage((prev) => Math.max(prev - 1, 1))}
                      className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold px-2">
                      Page {modalCurrentPage} of {modalTotalPages || 1}
                    </span>
                    <button
                      disabled={modalCurrentPage >= modalTotalPages}
                      onClick={() => setModalCurrentPage((prev) => Math.min(prev + 1, modalTotalPages))}
                      className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
