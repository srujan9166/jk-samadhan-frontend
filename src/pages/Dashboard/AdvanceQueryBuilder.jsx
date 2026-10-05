import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Sliders, 
  Filter,
  CheckCircle,
  ExternalLink,
  Layers,
  UserCheck,
  Building,
  Calendar,
  Clock
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function AdvanceQueryBuilder() {
  const navigate = useNavigate();

  // Form Filter State
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubCatL2, setSelectedSubCatL2] = useState('');
  const [selectedSubCatL3, setSelectedSubCatL3] = useState('');
  const [selectedSubCatL4, setSelectedSubCatL4] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [pendingFrom, setPendingFrom] = useState('');
  const [pendingTo, setPendingTo] = useState('');
  const [operator, setOperator] = useState('=');

  // Master Data State
  const [departmentsList, setDepartmentsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // Results State
  const [data, setData] = useState([]);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // User Types Options
  const userTypeOptions = ["Administrative", "Appellate", "District", "HOD", "DEALINGHAND", "ROLE_Admin"];

  // Fetch Master Data for Departments & Categories
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [deptRes, catRes] = await Promise.all([
          axiosClient.get('/api/masters/departments').catch(() => ({ data: [] })),
          axiosClient.get('/api/masters/categories').catch(() => ({ data: [] }))
        ]);
        if (Array.isArray(deptRes.data)) setDepartmentsList(deptRes.data);
        if (Array.isArray(catRes.data)) setCategoriesList(catRes.data);
      } catch (err) {
        console.error('Error fetching master data for Query Builder:', err);
      }
    };
    fetchMasters();
  }, []);

  // Handle Gender Checkbox Toggle
  const handleGenderToggle = (genderVal) => {
    setSelectedGenders((prev) =>
      prev.includes(genderVal) ? prev.filter((g) => g !== genderVal) : [...prev, genderVal]
    );
  };

  // Execute Advance Query
  const handleExecuteQuery = async (pageOverride = 1) => {
    const targetPage = pageOverride;
    setIsLoading(true);
    setError(null);
    setHasExecuted(true);

    try {
      const payload = {
        gender: selectedGenders,
        departments: selectedDepartments,
        category: selectedCategory,
        subCategory: selectedSubCategory,
        subCategoryL2: selectedSubCatL2,
        subCategoryL3: selectedSubCatL3,
        subCategoryL4: selectedSubCatL4,
        status: statusFilter,
        userType: userTypeFilter,
        pendingFrom: pendingFrom ? parseInt(pendingFrom, 10) : null,
        pendingTo: pendingTo ? parseInt(pendingTo, 10) : null,
        operator: operator,
        search: searchQuery,
        page: targetPage - 1,
        size: pageSize
      };

      const res = await axiosClient.post('/api/super-admin/advance-query', payload);
      if (res.data) {
        setData(res.data.content || []);
        setTotalRecords(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
        setCurrentPage(targetPage);
      }
    } catch (err) {
      console.error('Error executing Advance Query:', err);
      setError('Failed to execute query. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset All Filters
  const handleReset = () => {
    setSelectedGenders([]);
    setSelectedDepartments([]);
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedSubCatL2('');
    setSelectedSubCatL3('');
    setSelectedSubCatL4('');
    setStatusFilter('');
    setUserTypeFilter('');
    setPendingFrom('');
    setPendingTo('');
    setOperator('=');
    setSearchQuery('');
    setData([]);
    setHasExecuted(false);
    setTotalRecords(0);
    setTotalPages(0);
    setCurrentPage(1);
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!data || data.length === 0) return;

    const exportRows = data.map((item, index) => ({
      'S. No.': (currentPage - 1) * pageSize + index + 1,
      'Grievance ID': item.uniqid || 'N/A',
      'Department': item.department || 'N/A',
      'Main Category': item.category || 'N/A',
      'Sub Category': item.subCategory || 'N/A',
      'NL 2': item.subCategoryL2 || 'N/A',
      'NL 3': item.subCategoryL3 || 'N/A',
      'NL 4': item.subCategoryL4 || 'N/A',
      'District': item.district || 'N/A',
      'Citizen Gender': item.gender || 'N/A',
      'Submitted By': item.name || 'N/A',
      'Submitted On': item.createddate ? item.createddate.slice(0, 10) : 'N/A',
      'Classification': item.flag || 'Normal',
      'Status': item.status || 'N/A',
      'Pending Days': item.daysdiff !== null ? item.daysdiff : 'N/A',
      'User Type': item.usertype || 'N/A',
      'Updated By': item.updatedBy || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Advance Query Result');
    XLSX.writeFile(workbook, `Advance_Query_Result_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Export PDF
  const handleExportPDF = () => {
    if (!data || data.length === 0) return;

    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text(`J&K Samadhan — Advance Query Builder Result`, 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableHeaders = [[
      'S. No.', 
      'Grievance ID', 
      'Department', 
      'Category', 
      'District', 
      'Submitted By', 
      'Status', 
      'Pending Days'
    ]];

    const tableData = data.map((item, index) => [
      (currentPage - 1) * pageSize + index + 1,
      item.uniqid || 'N/A',
      item.department || 'N/A',
      item.category || 'N/A',
      item.district || 'N/A',
      item.name || 'N/A',
      item.status || 'N/A',
      item.daysdiff !== null ? item.daysdiff : 'N/A'
    ]);

    doc.autoTable({
      head: tableHeaders,
      body: tableData,
      startY: 26,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' }
    });

    doc.save(`Advance_Query_Result_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Advance Query Builder
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Construct dynamic demographic, organizational, and metric queries across grievance records
            </p>
          </div>
        </div>
      </div>

      {/* Query Builder Criteria Form Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Query Parameters</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {/* Column 1: Demographic Information */}
          <div className="space-y-3 bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700 pb-1.5">
              Demographic Information
            </h4>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">
                Citizen Gender
              </label>
              <div className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(g)}
                      onChange={() => handleGenderToggle(g)}
                      className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>{g === 'OTHER' ? 'Transgender' : g.charAt(0) + g.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Organizational / Categories Details */}
          <div className="space-y-3 bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700 pb-1.5">
              Organizational Details
            </h4>
            
            {/* Department */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Department
              </label>
              <select
                value={selectedDepartments[0] || ''}
                onChange={(e) => setSelectedDepartments(e.target.value ? [e.target.value] : [])}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- All Departments --</option>
                {departmentsList.map((d) => (
                  <option key={d.id || d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Main Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Main Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- All Main Categories --</option>
                {categoriesList.map((c) => (
                  <option key={c.id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Sub Category
              </label>
              <input
                type="text"
                placeholder="Enter Sub Category..."
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Column 3: Process Metrics / Conditions */}
          <div className="space-y-3 bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700 pb-1.5">
              Process Metrics / Conditions
            </h4>

            {/* Grievance Status Radio Group */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">
                Grievance Status
              </label>
              <div className="space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                {[
                  { label: 'All Statuses', val: '' },
                  { label: 'Resolved', val: 'Resolved' },
                  { label: 'Pending / Under Process', val: 'Pending' },
                  { label: 'Rejected', val: 'Rejected' },
                  { label: 'Appealed', val: 'Appealed' }
                ].map((st) => (
                  <label key={st.val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="grvstatus"
                      value={st.val}
                      checked={statusFilter === st.val}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>{st.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pending Since / Days */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Pending Since (days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="999"
                  placeholder="e.g. 15"
                  value={pendingFrom}
                  onChange={(e) => setPendingFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {operator === 'BETWEEN' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Pending To (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    placeholder="e.g. 30"
                    value={pendingTo}
                    onChange={(e) => setPendingTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Operator & User Type */}
          <div className="space-y-3 bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide border-b border-slate-200 dark:border-slate-700 pb-1.5">
              Operator & User Type
            </h4>

            {/* Operator Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Select Operator
              </label>
              <select
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="=">Is equal to (=)</option>
                <option value="<">Is less than (&lt;)</option>
                <option value=">">Is greater than (&gt;)</option>
                <option value="BETWEEN">Is between (BETWEEN)</option>
              </select>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                User Type
              </label>
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- All User Types --</option>
                {userTypeOptions.map((ut) => (
                  <option key={ut} value={ut}>{ut}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3">
          <button
            onClick={() => handleExecuteQuery(1)}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Generate Report</span>
          </button>

          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Values</span>
          </button>
        </div>
      </div>

      {/* Query Results Card */}
      {hasExecuted && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4">
          {/* Header & Export Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Query Result: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">({totalRecords})</span>
            </h3>

            <div className="flex items-center gap-3">
              {/* Search Bar inside Results */}
              <div className="relative w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter results..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleExecuteQuery(1);
                  }}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <button
                onClick={handleExportExcel}
                disabled={isLoading || data.length === 0}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handleExportPDF}
                disabled={isLoading || data.length === 0}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-3 text-center">Action</th>
                  <th className="py-3.5 px-3 text-center">S. No.</th>
                  <th className="py-3.5 px-3">Grievance ID</th>
                  <th className="py-3.5 px-3">Department</th>
                  <th className="py-3.5 px-3">Main Category</th>
                  <th className="py-3.5 px-3">Sub Category</th>
                  <th className="py-3.5 px-3">District</th>
                  <th className="py-3.5 px-3">Citizen Gender</th>
                  <th className="py-3.5 px-3">Submitted By</th>
                  <th className="py-3.5 px-3">Submitted On</th>
                  <th className="py-3.5 px-3">Classification</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-center">Pending Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan="13" className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                        <span>Executing Query...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="13" className="py-8 text-center text-rose-500 font-semibold">
                      {error}
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="py-12 text-center text-slate-400">
                      No records match the selected query criteria.
                    </td>
                  </tr>
                ) : (
                  data.map((row, index) => {
                    const serialNo = (currentPage - 1) * pageSize + index + 1;
                    return (
                      <tr key={row.id || index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        {/* Action View Button */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => navigate(`/grievance/${row.id || row.uniqid}`)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">{serialNo}</td>
                        <td className="py-2.5 px-3 font-semibold text-blue-600 dark:text-blue-400 font-mono">{row.uniqid}</td>
                        <td className="py-2.5 px-3">{row.department}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row.category}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{row.subCategory}</td>
                        <td className="py-2.5 px-3">{row.district}</td>
                        <td className="py-2.5 px-3">{row.gender}</td>
                        <td className="py-2.5 px-3">{row.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                          {row.createddate ? row.createddate.slice(0, 10) : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {row.flag}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            LOWER(row.status) === 'resolved' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' 
                              : LOWER(row.status) === 'rejected'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {row.daysdiff !== null ? row.daysdiff : 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!isLoading && data.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <span>
                Showing {Math.min((currentPage - 1) * pageSize + 1, totalRecords)} to{' '}
                {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleExecuteQuery(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-700 dark:text-slate-200">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => handleExecuteQuery(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LOWER(str) {
  return str ? str.toLowerCase() : '';
}
