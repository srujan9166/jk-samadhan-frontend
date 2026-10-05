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
  Building2,
  MapPin
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function AverageTimeReport() {
  const navigate = useNavigate();

  // Mode: 'department' or 'district'
  const [reportMode, setReportMode] = useState('department');

  // Master Lists for Dropdown Filters
  const [departments, setDepartments] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('0');
  const [selectedDistrict, setSelectedDistrict] = useState('0');

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

  // Modal State for Clicked Row Grievance List
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

  // Fetch Master Data (Departments & Districts)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [deptRes, distRes] = await Promise.all([
          axiosClient.get('/api/geo/departments').catch(() => ({ data: [] })),
          axiosClient.get('/api/geo/districts').catch(() => ({ data: [] }))
        ]);
        setDepartments(deptRes.data || []);
        setDistricts(distRes.data || []);
      } catch (err) {
        console.error('Error fetching master dropdowns:', err);
      }
    };
    fetchMasterData();
  }, []);

  // Fetch Main Report Data
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        mode: reportMode,
        department: selectedDepartment !== '0' ? selectedDepartment : '',
        district: selectedDistrict !== '0' ? selectedDistrict : '',
        page: (currentPage - 1).toString(),
        size: pageSize.toString(),
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/average-time-report?${params.toString()}`);
      if (res.data) {
        setData(res.data.content || []);
        setTotalRecords(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching Average Time Report:', err);
      setError('Failed to load Average Time Taken Report records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReportData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [reportMode, selectedDepartment, selectedDistrict, currentPage, pageSize, searchQuery]);

  // Fetch Modal Details when count is clicked
  const fetchModalDetails = async (paramsObj) => {
    setIsModalLoading(true);
    try {
      const params = new URLSearchParams({
        mode: reportMode,
        name: paramsObj.name || '',
        page: (modalCurrentPage - 1).toString(),
        size: modalPageSize.toString(),
        search: modalSearchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/average-time-report/details?${params.toString()}`);
      if (res.data) {
        setModalGrievances(res.data.content || []);
        setModalTotalRecords(res.data.totalElements || 0);
        setModalTotalPages(res.data.totalPages || 0);
      }
    } catch (err) {
      console.error('Error fetching average time detail grievances:', err);
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

  const handleRowClick = (item) => {
    const title = `Resolved Grievances - ${reportMode === 'district' ? 'District' : 'Department'}: ${item.name}`;
    setModalTitle(title);
    setModalCurrentPage(1);
    setModalSearchQuery('');
    setActiveModalParams({ name: item.name });
    setShowModal(true);
  };

  // Excel Export
  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams({
        mode: reportMode,
        department: selectedDepartment !== '0' ? selectedDepartment : '',
        district: selectedDistrict !== '0' ? selectedDistrict : '',
        page: '0',
        size: '5000',
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/average-time-report?${params.toString()}`);
      const exportData = res.data?.content || data;

      const labelHeader = reportMode === 'district' ? 'District' : 'Department';

      const excelRows = exportData.map((row, idx) => ({
        'S. No.': idx + 1,
        [labelHeader]: row.name || 'NA',
        'Grievance Received': row.totalGrievances || 0,
        'Cumulative Days': row.cumulativeDays || 0,
        'Avg Days (Per Grievances)': row.averageDays || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Average_Time_Taken_Report');
      XLSX.writeFile(workbook, `Average_Time_Report_${reportMode}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  // PDF Export
  const exportToPDF = async () => {
    try {
      const params = new URLSearchParams({
        mode: reportMode,
        department: selectedDepartment !== '0' ? selectedDepartment : '',
        district: selectedDistrict !== '0' ? selectedDistrict : '',
        page: '0',
        size: '5000',
        search: searchQuery || ''
      });

      const res = await axiosClient.get(`/api/super-admin/average-time-report?${params.toString()}`);
      const exportData = res.data?.content || data;

      const doc = new jsPDF('landscape', 'pt', 'a4');

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text(`JK GOVT - Average Time Taken Report (${reportMode.toUpperCase()})`, 40, 40);
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 55);

      const labelHeader = reportMode === 'district' ? 'District' : 'Department';

      const tableColumn = [
        'S. No.',
        labelHeader,
        'Grievance Received',
        'Cumulative Days',
        'Avg Days (Per Grievances)'
      ];

      const tableRows = exportData.map((row, idx) => [
        idx + 1,
        row.name || 'NA',
        row.totalGrievances || 0,
        row.cumulativeDays || 0,
        row.averageDays || 0
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        styles: { fontSize: 8, cellPadding: 5 },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      doc.save(`Average_Time_Report_${reportMode}_${new Date().toISOString().split('T')[0]}.pdf`);
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
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">
                Average Time Taken Report
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Average days taken per grievance across departments and districts.
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

        {/* Mode Toggle Tabs & Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-1">
          {/* Mode Toggle Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setReportMode('department');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
                reportMode === 'department'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Department Wise</span>
            </button>
            <button
              onClick={() => {
                setReportMode('district');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
                reportMode === 'district'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>District Wise</span>
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {reportMode === 'department' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Department:</span>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold focus:outline-none text-xs cursor-pointer max-w-[220px] truncate"
                >
                  <option value="0">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id || d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {reportMode === 'district' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">District:</span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold focus:outline-none text-xs cursor-pointer max-w-[200px] truncate"
                >
                  <option value="0">All Districts</option>
                  {districts.map((d) => (
                    <option key={d.id || d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search by ${reportMode === 'district' ? 'District' : 'Department'}...`}
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
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3 w-16 text-center">S. No.</th>
                <th className="p-3">{reportMode === 'district' ? 'District' : 'Department'}</th>
                <th className="p-3 text-center">Grievance Received</th>
                <th className="p-3 text-center">Cumulative Days</th>
                <th className="p-3 text-center">Avg Days (Per Grievance)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span>Calculating Average Time Taken Report...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    No Average Time Taken Report records found.
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
                        {row.name || 'NA'}
                      </td>

                      {/* Grievance Received (Clickable Count) */}
                      <td className="p-3 text-center">
                        <button
                          disabled={!row.totalGrievances}
                          onClick={() => handleRowClick(row)}
                          className={`font-black px-2.5 py-1 rounded-md transition-colors border-0 cursor-pointer ${
                            row.totalGrievances > 0
                              ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50'
                              : 'text-slate-400'
                          }`}
                        >
                          {row.totalGrievances || 0}
                        </button>
                      </td>

                      {/* Cumulative Days */}
                      <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">
                        {row.cumulativeDays != null ? row.cumulativeDays : 0} days
                      </td>

                      {/* Avg Days */}
                      <td className="p-3 text-center font-black">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-black inline-block ${
                          row.averageDays <= 15
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : row.averageDays <= 30
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          {row.averageDays != null ? row.averageDays : 0} days
                        </span>
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

      {/* Modal for Clicked Row Grievance Details */}
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
                                {g.status || 'Resolved'}
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
