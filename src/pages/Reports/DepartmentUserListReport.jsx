import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  UserCheck,
  Building,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import axiosClient from '../../api/axiosClient';
import adminService from '../../services/adminService';
import geoService from '../../services/geoService';

export default function DepartmentUserListReport() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('id');
  const [sortDirection, setSortDirection] = useState('DESC');

  // Filter dropdown states
  const [selectedDept, setSelectedDept] = useState('0');
  const [selectedDeptType, setSelectedDeptType] = useState('0');
  const [selectedUserType, setSelectedUserType] = useState('0');
  const [selectedDistrict, setSelectedDistrict] = useState('0');

  // Master Lists for Filters
  const [deptList, setDeptList] = useState([]);
  const [deptTypeList, setDeptTypeList] = useState(['ADMIN', 'DOPG', 'OTHER']);
  const [userTypeList, setUserTypeList] = useState(['Administrative', 'Appellate', 'District', 'HOD', 'DEALINGHAND', 'ROLE_Admin']);
  const [districtList, setDistrictList] = useState([]);

  // Fetch Master Departments & Districts on Mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [deptRes, jammuDist, kashmirDist] = await Promise.allSettled([
          adminService.getDepartments(),
          geoService.getDistricts(1),
          geoService.getDistricts(2)
        ]);

        if (deptRes.status === 'fulfilled' && Array.isArray(deptRes.value)) {
          const names = deptRes.value
            .map(d => (typeof d === 'string' ? d : d.name || d.departmentName || d.department_name))
            .filter(Boolean);
          if (names.length > 0) {
            setDeptList(Array.from(new Set(names)).sort());
          }
        }

        let combinedDists = [];
        if (jammuDist.status === 'fulfilled' && Array.isArray(jammuDist.value)) {
          combinedDists.push(...jammuDist.value);
        }
        if (kashmirDist.status === 'fulfilled' && Array.isArray(kashmirDist.value)) {
          combinedDists.push(...kashmirDist.value);
        }

        if (combinedDists.length > 0) {
          const distNames = combinedDists
            .map(d => (typeof d === 'string' ? d : d.name || d.districtName || d.district_name))
            .filter(Boolean);
          setDistrictList(Array.from(new Set(distNames)).sort());
        }
      } catch (err) {
        console.error('Error fetching master lists for DepartmentUserListReport:', err);
      }
    };

    fetchMasterData();
  }, []);

  // Fetch report data from backend
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: (currentPage - 1).toString(),
        size: pageSize.toString(),
        search: searchQuery || '',
        department: selectedDept !== '0' ? selectedDept : '',
        departmentType: selectedDeptType !== '0' ? selectedDeptType : '',
        userType: selectedUserType !== '0' ? selectedUserType : '',
        district: selectedDistrict !== '0' ? selectedDistrict : ''
      });

      const res = await axiosClient.get(`/super-admin/department-users?${params.toString()}`);
      if (res.data) {
        setData(res.data.content || []);
        setTotalRecords(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);

        if (res.data.departments && res.data.departments.length > 0) {
          setDeptList(prev => Array.from(new Set([...prev, ...res.data.departments])).sort());
        }
        if (res.data.departmentTypes && res.data.departmentTypes.length > 0) {
          setDeptTypeList(res.data.departmentTypes);
        }
        if (res.data.userTypes && res.data.userTypes.length > 0) {
          setUserTypeList(res.data.userTypes);
        }
        if (res.data.districts && res.data.districts.length > 0) {
          setDistrictList(prev => Array.from(new Set([...prev, ...res.data.districts])).sort());
        }
      }
    } catch (err) {
      console.error('Error fetching Department User List:', err);
      setError('Failed to load Department User List records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchReportData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, pageSize, searchQuery, selectedDept, selectedDeptType, selectedUserType, selectedDistrict]);

  // Excel Export Function
  const exportToExcel = async () => {
    try {
      // Fetch all records for export (size = 5000)
      const params = new URLSearchParams({
        page: '0',
        size: '5000',
        search: searchQuery || '',
        department: selectedDept !== '0' ? selectedDept : '',
        departmentType: selectedDeptType !== '0' ? selectedDeptType : '',
        userType: selectedUserType !== '0' ? selectedUserType : '',
        district: selectedDistrict !== '0' ? selectedDistrict : ''
      });

      const res = await axiosClient.get(`/super-admin/department-users?${params.toString()}`);
      const exportList = res.data?.content || data;

      const formattedData = exportList.map((row, idx) => ({
        'S. No.': idx + 1,
        'Department': row.department || 'N/A',
        'Type of Department': row.departmentType || 'N/A',
        'District': row.district || 'N/A',
        'Office': row.office || 'N/A',
        'Name & Designation': `${row.name || ''} (${row.designation || 'N/A'})`.trim(),
        'User Type': row.userType || 'N/A',
        'Created By': row.createdBy || 'N/A',
        'Created On': row.createdAt || 'N/A',
        'Mobile No.': row.mobile || 'N/A',
        'Email / Username': row.email || row.username || 'N/A'
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Department User List');
      XLSX.writeFile(workbook, `Department_User_List_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Error exporting Excel:', err);
      alert('Failed to export Excel report.');
    }
  };

  // PDF Export Function
  const exportToPDF = async () => {
    try {
      const params = new URLSearchParams({
        page: '0',
        size: '2000',
        search: searchQuery || '',
        department: selectedDept !== '0' ? selectedDept : '',
        departmentType: selectedDeptType !== '0' ? selectedDeptType : '',
        userType: selectedUserType !== '0' ? selectedUserType : '',
        district: selectedDistrict !== '0' ? selectedDistrict : ''
      });

      const res = await axiosClient.get(`/super-admin/department-users?${params.toString()}`);
      const exportList = res.data?.content || data;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      doc.setFontSize(14);
      doc.text('J&K Samadhan - Department User List Report', 40, 40);
      doc.setFontSize(9);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 55);

      const tableColumn = [
        'S. No.',
        'Department',
        'Type',
        'District',
        'Office',
        'Name & Designation',
        'User Type',
        'Created By',
        'Created On',
        'Mobile',
        'Email / Username'
      ];

      const tableRows = exportList.map((row, idx) => [
        idx + 1,
        row.department || '-',
        row.departmentType || '-',
        row.district || '-',
        row.office || '-',
        `${row.name || ''} (${row.designation || '-'})`.trim(),
        row.userType || '-',
        row.createdBy || '-',
        row.createdAt || '-',
        row.mobile || '-',
        row.email || row.username || '-'
      ]);

      doc.autoTable({
        startY: 70,
        head: [tableColumn],
        body: tableRows,
        styles: { fontSize: 7, cellPadding: 4 },
        headStyles: { fillColor: [30, 31, 49], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        theme: 'grid'
      });

      doc.save(`Department_User_List_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to export PDF report.');
    }
  };

  const handleResetFilters = () => {
    setSelectedDept('0');
    setSelectedDeptType('0');
    setSelectedUserType('0');
    setSelectedDistrict('0');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs animate-fadeIn">
      {/* ── CARD HEADER & ACTION BUTTONS ── */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-wide">
              Department User List
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              View and filter registered department users, nodal officers, and official accounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
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

      {/* ── FILTER DROPDOWNS SECTION ── */}
      <div className="p-4 bg-slate-100/40 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => { setSelectedDept(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-800 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Select Department</option>
              {deptList.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Department Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              Department Type
            </label>
            <select
              value={selectedDeptType}
              onChange={(e) => { setSelectedDeptType(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-800 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Select Type</option>
              {deptTypeList.map((dt, i) => (
                <option key={i} value={dt}>{dt}</option>
              ))}
            </select>
          </div>

          {/* User Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              User Type
            </label>
            <select
              value={selectedUserType}
              onChange={(e) => { setSelectedUserType(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-800 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Select User Type</option>
              {userTypeList.map((ut, i) => (
                <option key={i} value={ut}>{ut}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => { setSelectedDistrict(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-800 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Select District</option>
              {districtList.map((dist, i) => (
                <option key={i} value={dist}>{dist}</option>
              ))}
            </select>
          </div>
        </div>

        {(selectedDept !== '0' || selectedDeptType !== '0' || selectedUserType !== '0' || selectedDistrict !== '0' || searchQuery !== '') && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-lg transition-all border-0 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ── SEARCH & PAGE SIZE CONTROLS ── */}
      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
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
            placeholder="Search users, dept, office..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* ── MAIN TABLE DISPLAY ── */}
      <div className="overflow-x-auto min-h-[350px]">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="font-bold text-slate-500 text-xs">Loading Department User List...</span>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-rose-500 font-bold text-xs">{error}</div>
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold text-xs">
            No Department User records found matching criteria.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1e1f31] text-white font-extrabold text-[11px] uppercase tracking-wider">
                <th className="p-3.5 w-12 text-center border-r border-slate-800">S. No.</th>
                <th className="p-3.5 border-r border-slate-800">Department</th>
                <th className="p-3.5 border-r border-slate-800">Type Of Dept</th>
                <th className="p-3.5 border-r border-slate-800">District</th>
                <th className="p-3.5 border-r border-slate-800">Office</th>
                <th className="p-3.5 border-r border-slate-800">Name & Designation</th>
                <th className="p-3.5 border-r border-slate-800">User Type</th>
                <th className="p-3.5 border-r border-slate-800">Created By</th>
                <th className="p-3.5 border-r border-slate-800">Created On</th>
                <th className="p-3.5 border-r border-slate-800">Mobile No.</th>
                <th className="p-3.5">Email / Username</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300 text-xs">
              {data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 text-center font-bold text-slate-500">
                    {(currentPage - 1) * pageSize + idx + 1}
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {row.department || 'N/A'}
                  </td>
                  <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                    {row.departmentType || 'N/A'}
                  </td>
                  <td className="p-3">
                    {row.district || 'N/A'}
                  </td>
                  <td className="p-3">
                    {row.office || 'N/A'}
                  </td>
                  <td className="p-3 font-bold text-blue-700 dark:text-blue-400">
                    {row.name ? row.name : 'N/A'} {row.designation ? `(${row.designation})` : ''}
                  </td>
                  <td className="p-3 font-semibold text-purple-700 dark:text-purple-400">
                    {row.userType || 'N/A'}
                  </td>
                  <td className="p-3 text-slate-500">
                    {row.createdBy || 'N/A'}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {row.createdAt || 'N/A'}
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                    {row.mobile || 'N/A'}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {row.email || row.username || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── PAGINATION CONTROLS ── */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
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
    </div>
  );
}
