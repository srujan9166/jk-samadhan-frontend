import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  MapPin,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Building2,
  X,
  ExternalLink
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

const JK_DISTRICTS_GEO = [
  { name: 'Anantnag', division: 'Kashmir', region: 'South', x: 260, y: 280, r: 24 },
  { name: 'Bandipora', division: 'Kashmir', region: 'North', x: 210, y: 110, r: 22 },
  { name: 'Baramulla', division: 'Kashmir', region: 'North', x: 150, y: 150, r: 28 },
  { name: 'Budgam', division: 'Kashmir', region: 'Central', x: 190, y: 220, r: 22 },
  { name: 'Doda', division: 'Jammu', region: 'Chenab', x: 340, y: 290, r: 26 },
  { name: 'Ganderbal', division: 'Kashmir', region: 'Central', x: 250, y: 160, r: 22 },
  { name: 'Jammu', division: 'Jammu', region: 'Plains', x: 200, y: 390, r: 28 },
  { name: 'Kathua', division: 'Jammu', region: 'Plains', x: 280, y: 410, r: 26 },
  { name: 'Kishtwar', division: 'Jammu', region: 'Chenab', x: 410, y: 230, r: 32 },
  { name: 'Kulgam', division: 'Kashmir', region: 'South', x: 220, y: 290, r: 20 },
  { name: 'Kupwara', division: 'Kashmir', region: 'North', x: 110, y: 100, r: 28 },
  { name: 'Poonch', division: 'Jammu', region: 'Pir Panjal', x: 80, y: 270, r: 24 },
  { name: 'Pulwama', division: 'Kashmir', region: 'South', x: 230, y: 240, r: 20 },
  { name: 'Rajouri', division: 'Jammu', region: 'Pir Panjal', x: 120, y: 330, r: 26 },
  { name: 'Ramban', division: 'Jammu', region: 'Chenab', x: 280, y: 290, r: 22 },
  { name: 'Reasi', division: 'Jammu', region: 'Central', x: 220, y: 330, r: 24 },
  { name: 'Samba', division: 'Jammu', region: 'Plains', x: 240, y: 420, r: 18 },
  { name: 'Shopian', division: 'Kashmir', region: 'South', x: 180, y: 260, r: 18 },
  { name: 'Srinagar', division: 'Kashmir', region: 'Central', x: 225, y: 195, r: 20 },
  { name: 'Udhampur', division: 'Jammu', region: 'Central', x: 270, y: 350, r: 26 }
];

export default function HeatmapReport() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState('0');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusCategory, setStatusCategory] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heatmapData, setHeatmapData] = useState({
    content: [],
    totalGrievances: 0,
    totalPending: 0,
    totalResolved: 0,
    maxDistrictCount: 0,
    totalElements: 0,
    totalPages: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [activeDistrictDetail, setActiveDistrictDetail] = useState(null);
  const [detailGrievances, setDetailGrievances] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchHeatmapData(currentPage);
  }, [dateFrom, dateTo, selectedDepartment, selectedCategory, selectedStatus, statusCategory, selectedOrigin, searchQuery, currentPage]);

  const fetchMasterData = async () => {
    try {
      const [deptRes, catRes] = await Promise.all([
        axiosClient.get('/api/master/departments').catch(() => ({ data: [] })),
        axiosClient.get('/api/master/categories').catch(() => ({ data: [] }))
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (err) {
      console.error('Error loading master data:', err);
    }
  };

  const fetchHeatmapData = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString()
      });

      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (selectedDepartment && selectedDepartment !== '0') params.append('department', selectedDepartment);
      if (selectedCategory && selectedCategory !== '0') params.append('category', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      if (statusCategory) params.append('statusCategory', statusCategory);
      if (selectedOrigin && selectedOrigin !== 'all') params.append('origin', selectedOrigin);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await axiosClient.get(`/api/super-admin/heatmap?${params.toString()}`);
      if (res.data) {
        setHeatmapData(res.data);
      }
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError('Failed to load district heatmap metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const districtMapLookup = useMemo(() => {
    const map = {};
    if (heatmapData?.content) {
      heatmapData.content.forEach((item) => {
        if (item.districtName) {
          map[item.districtName.toLowerCase().trim()] = item;
        }
      });
    }
    return map;
  }, [heatmapData]);

  const getHeatColor = (intensity) => {
    if (intensity === 0 || !intensity) return '#f1f5f9'; // Slate 100
    if (intensity < 0.2) return '#bfdbfe'; // Blue 200
    if (intensity < 0.4) return '#60a5fa'; // Blue 400
    if (intensity < 0.6) return '#fbbf24'; // Amber 400
    if (intensity < 0.8) return '#f97316'; // Orange 500
    return '#ef4444'; // Red 500
  };

  const getHeatBadge = (intensity) => {
    if (intensity === 0 || !intensity) return { label: 'Very Low', bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
    if (intensity < 0.25) return { label: 'Low', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' };
    if (intensity < 0.5) return { label: 'Moderate', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' };
    if (intensity < 0.75) return { label: 'High', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
    return { label: 'Critical Heat', bg: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-pulse' };
  };

  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedDepartment('0');
    setSelectedCategory('0');
    setSelectedStatus('');
    setStatusCategory('');
    setSelectedOrigin('all');
    setSearchQuery('');
    setCurrentPage(0);
  };

  const handleDistrictClick = async (districtName) => {
    setActiveDistrictDetail(districtName);
    setDetailLoading(true);
    setDetailGrievances([]);
    try {
      const res = await axiosClient.get(`/api/super-admin/district-wise-report/details?district=${encodeURIComponent(districtName)}&size=20`);
      if (res.data?.content) {
        setDetailGrievances(res.data.content);
      }
    } catch (err) {
      console.error('Error fetching district detail grievances:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const exportExcel = () => {
    if (!heatmapData?.content || heatmapData.content.length === 0) return;
    const excelData = heatmapData.content.map((item, idx) => ({
      'S.No': idx + 1,
      'District Name': item.districtName || 'N/A',
      'Total Grievances': item.totalGrievances,
      'Pending Grievances': item.pendingGrievances,
      'Resolved Grievances': item.resolvedGrievances,
      'Forwarded Grievances': item.forwardedGrievances,
      'Rejected Grievances': item.rejectedGrievances,
      'Appealed Grievances': item.appealedGrievances,
      'Resolution Rate (%)': item.totalGrievances > 0 ? ((item.resolvedGrievances / item.totalGrievances) * 100).toFixed(1) + '%' : '0%'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'District Heatmap');
    XLSX.writeFile(workbook, `JK_Samadhan_District_Heatmap_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = () => {
    if (!heatmapData?.content || heatmapData.content.length === 0) return;
    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text('J&K Samadhan — District Heatmap & Grievance Pendency Report', 14, 15);
    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ['#', 'District', 'Total', 'Pending', 'Resolved', 'Forwarded', 'Rejected', 'Appealed', 'Res. Rate'];
    const tableRows = heatmapData.content.map((item, idx) => [
      idx + 1,
      item.districtName || 'N/A',
      item.totalGrievances,
      item.pendingGrievances,
      item.resolvedGrievances,
      item.forwardedGrievances,
      item.rejectedGrievances,
      item.appealedGrievances,
      item.totalGrievances > 0 ? ((item.resolvedGrievances / item.totalGrievances) * 100).toFixed(1) + '%' : '0%'
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8 }
    });

    doc.save(`JK_Samadhan_District_Heatmap_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-500/30">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            Geographic Pendency Analysis
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">District Wise Heatmap Report</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Real-time heat density and grievance pendency map across Jammu & Kashmir districts with dynamic metric aggregation and interactive district drill-down.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={exportPDF}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Grievances</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
              {heatmapData.totalGrievances.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Across J&K Districts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Active Pending</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {heatmapData.totalPending.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Requiring Action</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Total Resolved</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {heatmapData.totalResolved.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {heatmapData.totalGrievances > 0
                ? `${((heatmapData.totalResolved / heatmapData.totalGrievances) * 100).toFixed(1)}% Disposed`
                : '0% Disposed'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-red-500 uppercase tracking-wider">Max District Load</p>
            <h3 className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
              {heatmapData.maxDistrictCount.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Highest Volume District</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Heatmap Filters</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Category</label>
            <select
              value={statusCategory}
              onChange={(e) => {
                setStatusCategory(e.target.value);
                setSelectedStatus('');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open Grievances</option>
              <option value="Closed">Closed / Disposed Grievances</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Specific Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Specific Status</option>
              <option value="Pending">Pending</option>
              <option value="Registered">Registered</option>
              <option value="Under Process">Under Process</option>
              <option value="Forwarded">Forwarded</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
              <option value="Appealed">Appealed</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Source / Origin</label>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Sources</option>
              <option value="JKSAMADHAN">J&K Samadhan Portal</option>
              <option value="CPGRAM">CPGRAMS Portal</option>
              <option value="webapp">Web Application</option>
              <option value="mobileapp">Mobile Application</option>
            </select>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Search District</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by district name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Heatmap Visualization Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive District Map Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between relative min-h-[480px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Jammu & Kashmir Interactive District Heatmap
                </h3>
                <p className="text-[11px] text-slate-400">Hover over a district node to view live metrics; click to inspect grievances.</p>
              </div>

              {/* Heatmap Legend */}
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold">
                <span className="text-slate-400">Low</span>
                <span className="w-4 h-4 rounded bg-[#bfdbfe]"></span>
                <span className="w-4 h-4 rounded bg-[#60a5fa]"></span>
                <span className="w-4 h-4 rounded bg-[#fbbf24]"></span>
                <span className="w-4 h-4 rounded bg-[#f97316]"></span>
                <span className="w-4 h-4 rounded bg-[#ef4444]"></span>
                <span className="text-slate-400">High Heat</span>
              </div>
            </div>

            {loading ? (
              <div className="h-[360px] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="relative w-full h-[380px] bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex items-center justify-center p-2">
                <svg viewBox="0 0 480 460" className="w-full h-full max-h-[360px] select-none">
                  {/* Decorative J&K Boundary Contour */}
                  <path
                    d="M 60,250 C 70,120 120,60 220,60 C 340,60 440,160 440,250 C 440,340 320,440 220,440 C 120,440 50,350 60,250 Z"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="dark:stroke-slate-800"
                  />

                  {/* District Map Nodes */}
                  {JK_DISTRICTS_GEO.map((d) => {
                    const match = districtMapLookup[d.name.toLowerCase()];
                    const intensity = match?.heatIntensity || 0;
                    const totalGrievances = match?.totalGrievances || 0;
                    const fillColor = getHeatColor(intensity);
                    const isHovered = hoveredDistrict?.name === d.name;

                    return (
                      <g
                        key={d.name}
                        className="cursor-pointer transition-transform duration-200 hover:scale-110"
                        onMouseEnter={() => setHoveredDistrict({ ...d, match })}
                        onMouseLeave={() => setHoveredDistrict(null)}
                        onClick={() => handleDistrictClick(d.name)}
                      >
                        <circle
                          cx={d.x}
                          cy={d.y}
                          r={d.r}
                          fill={fillColor}
                          stroke={isHovered ? '#1e40af' : '#ffffff'}
                          strokeWidth={isHovered ? '3' : '1.5'}
                          className="shadow-sm opacity-90 hover:opacity-100"
                        />
                        <text
                          x={d.x}
                          y={d.y - 2}
                          textAnchor="middle"
                          fill={intensity > 0.4 ? '#ffffff' : '#1e293b'}
                          fontSize="9"
                          fontWeight="bold"
                          pointerEvents="none"
                        >
                          {d.name}
                        </text>
                        <text
                          x={d.x}
                          y={d.y + 9}
                          textAnchor="middle"
                          fill={intensity > 0.4 ? '#e2e8f0' : '#475569'}
                          fontSize="8"
                          fontWeight="bold"
                          pointerEvents="none"
                        >
                          {totalGrievances}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Hover Tooltip Popup */}
                {hoveredDistrict && (
                  <div className="absolute top-4 right-4 bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs w-56 animate-fadeIn z-20">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="font-extrabold text-blue-400">{hoveredDistrict.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                        {hoveredDistrict.division} Div
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Grievances:</span>
                        <span className="font-bold">{hoveredDistrict.match?.totalGrievances || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-400">Pending:</span>
                        <span className="font-bold">{hoveredDistrict.match?.pendingGrievances || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-400">Resolved:</span>
                        <span className="font-bold">{hoveredDistrict.match?.resolvedGrievances || 0}</span>
                      </div>
                    </div>

                    <p className="text-[9px] text-blue-300 mt-2 text-right">Click circle to view records →</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* District Heat Ranking List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              District Heat Intensity Rankings
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">Ranked by total grievance volume and workload density.</p>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {heatmapData.content.map((item, idx) => {
                const badge = getHeatBadge(item.heatIntensity);
                const percent = (item.heatIntensity * 100).toFixed(0);

                return (
                  <div
                    key={item.districtName}
                    onClick={() => handleDistrictClick(item.districtName)}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">{item.districtName}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>Total: <strong>{item.totalGrievances}</strong></span>
                          <span>•</span>
                          <span className="text-amber-600 font-bold">Pending: {item.pendingGrievances}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">Resolved: {item.resolvedGrievances}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}>
                        {percent}% Heat
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* District Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Detailed District Statistics</h3>
            <p className="text-xs text-slate-400">Complete summary breakdown per district</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {heatmapData.content.length} Districts Displayed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">District</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-right text-amber-600">Pending</th>
                <th className="p-3 text-right text-emerald-600">Resolved</th>
                <th className="p-3 text-right text-blue-600">Forwarded</th>
                <th className="p-3 text-right text-red-600">Rejected</th>
                <th className="p-3 text-right text-purple-600">Appealed</th>
                <th className="p-3 text-center">Heat Bar</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {heatmapData.content.map((item, idx) => {
                const intensity = item.heatIntensity || 0;
                const percent = (intensity * 100).toFixed(0);

                return (
                  <tr key={item.districtName} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-800 dark:text-white">{item.districtName}</td>
                    <td className="p-3 text-right font-black text-slate-800 dark:text-white">{item.totalGrievances}</td>
                    <td className="p-3 text-right font-bold text-amber-600">{item.pendingGrievances}</td>
                    <td className="p-3 text-right font-bold text-emerald-600">{item.resolvedGrievances}</td>
                    <td className="p-3 text-right font-bold text-blue-600">{item.forwardedGrievances}</td>
                    <td className="p-3 text-right font-bold text-red-600">{item.rejectedGrievances}</td>
                    <td className="p-3 text-right font-bold text-purple-600">{item.appealedGrievances}</td>
                    <td className="p-3">
                      <div className="w-24 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mx-auto">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: getHeatColor(intensity)
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDistrictClick(item.districtName)}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg text-[10px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* District Detail Modal */}
      {activeDistrictDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Grievance Details — District {activeDistrictDetail}
                </h3>
                <p className="text-xs text-slate-400">List of registered grievances from District {activeDistrictDetail}</p>
              </div>
              <button
                onClick={() => setActiveDistrictDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 text-xs">
              {detailLoading ? (
                <div className="py-12 flex justify-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : detailGrievances.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No grievances found for District {activeDistrictDetail}.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5">Grievance ID</th>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Department</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {detailGrievances.map((g) => (
                      <tr key={g.id || g.grievanceId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-2.5 font-bold text-blue-600">{g.id || g.grievanceId}</td>
                        <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">{g.subject || g.grievanceText || 'N/A'}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{g.department || 'N/A'}</td>
                        <td className="p-2.5 font-bold">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {g.status || 'Registered'}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400">{g.createdDate || g.createdAt || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
