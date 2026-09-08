import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Filter, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  X,
  Plus
} from 'lucide-react';
import geoService from '../../services/geoService';
import axiosClient from '../../api/axiosClient';

export default function CitizenRegistrationReport() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filteredRecords, setFilteredRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState('created_date');
  const [sortDirection, setSortDirection] = useState('DESC');

  // Filter Box states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [genderOrMode, setGenderOrMode] = useState(''); // Male, Female, Transgender, web, mobile
  const [selectedState, setSelectedState] = useState('0');
  const [selectedDistrict, setSelectedDistrict] = useState('0');
  const [areaType, setAreaType] = useState(''); // 'municipality' or 'block'
  const [selectedMunicipality, setSelectedMunicipality] = useState('0');
  const [selectedWard, setSelectedWard] = useState('0');
  const [selectedBlock, setSelectedBlock] = useState('0');
  const [selectedPanchayat, setSelectedPanchayat] = useState('0');

  // Master lists
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wards, setWards] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [panchayats, setPanchayats] = useState([]);

  // Sub-reports
  const [divData, setDivData] = useState([]);
  const [isDivLoading, setIsDivLoading] = useState(false);
  const [distData, setDistData] = useState([]);
  const [isDistLoading, setIsDistLoading] = useState(false);

  // Modal State for Grievances
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [modalGrievances, setModalGrievances] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  // Fetch initial master data
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        // Fetch from both Jammu (1) and Kashmir (2) divisions
        const jammu = await geoService.getDistricts(1);
        const kashmir = await geoService.getDistricts(2);
        setDistricts([...jammu, ...kashmir]);
      } catch (err) {
        console.error('Error fetching districts:', err);
      }
    };
    fetchDistricts();
    fetchDivisionWiseReport();
    fetchDistrictWiseReport();
  }, []);

  // Fetch blocks or municipalities when district changes
  useEffect(() => {
    if (selectedDistrict !== '0') {
      const distId = selectedDistrict;
      geoService.getBlocks(distId).then(setBlocks).catch(console.error);
      geoService.getMunicipalities(distId).then(setMunicipalities).catch(console.error);
      setSelectedBlock('0');
      setSelectedPanchayat('0');
      setSelectedMunicipality('0');
      setSelectedWard('0');
    } else {
      setBlocks([]);
      setMunicipalities([]);
    }
  }, [selectedDistrict]);

  // Fetch panchayats when block changes
  useEffect(() => {
    if (selectedBlock !== '0') {
      geoService.getPanchayats(selectedBlock).then(setPanchayats).catch(console.error);
      setSelectedPanchayat('0');
    } else {
      setPanchayats([]);
    }
  }, [selectedBlock]);

  // Fetch wards when municipality changes
  useEffect(() => {
    if (selectedMunicipality !== '0') {
      geoService.getWards(selectedMunicipality).then(setWards).catch(console.error);
      setSelectedWard('0');
    } else {
      setWards([]);
    }
  }, [selectedMunicipality]);

  // Fetch main table data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        start: (currentPage - 1) * pageSize,
        length: pageSize,
        search: { value: searchQuery },
        order: [{ column: 0, dir: sortDirection.toLowerCase() }],
        columns: [{ data: sortColumn }],
        districtFilterVal: selectedDistrict !== '0' ? districts.find(d => d.id === parseInt(selectedDistrict))?.name : '',
        fdFilterVal: dateFrom,
        tdFilterVal: dateTo,
        filterValue: genderOrMode,
        blockId: selectedBlock !== '0' ? selectedBlock : null,
        panchayatId: selectedPanchayat !== '0' ? selectedPanchayat : null,
        municipalityId: selectedMunicipality !== '0' ? selectedMunicipality : null,
        wardId: selectedWard !== '0' ? selectedWard : null
      };

      const response = await axiosClient.post('/api/super-admin/getCitizenList', payload);
      setData(response.data.data || []);
      setTotalRecords(response.data.recordsTotal || 0);
      setFilteredRecords(response.data.recordsFiltered || 0);
    } catch (err) {
      console.error(err);
      setError('Unable to load report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, sortColumn, sortDirection, searchQuery]);

  // Fetch sub reports
  const fetchDivisionWiseReport = async () => {
    setIsDivLoading(true);
    try {
      const res = await axiosClient.post('/api/super-admin/loadMisCitizen', {});
      setDivData(res.data.data || []);
    } catch (err) {
      console.error('Error fetching division-wise report:', err);
    } finally {
      setIsDivLoading(false);
    }
  };

  const fetchDistrictWiseReport = async () => {
    setIsDistLoading(true);
    try {
      const res = await axiosClient.post('/api/super-admin/loadMisDistrict', {
        start: 0,
        length: 50,
        search: '',
        state: '0',
        district: '0'
      });
      setDistData(res.data.data || []);
    } catch (err) {
      console.error('Error fetching district-wise report:', err);
    } finally {
      setIsDistLoading(false);
    }
  };

  // Open modal showing citizen grievances
  const handleOpenGrievances = async (mobile, name) => {
    if (!mobile) return;
    setIsModalLoading(true);
    setShowGrievanceModal(true);
    setModalTitle(`Grievance/s Registered by ${name || 'Citizen'} (${mobile})`);
    try {
      // Query citizen grievances via mobile filter
      const res = await axiosClient.get(`/api/super-admin/grievances?search=${mobile}&size=50`);
      setModalGrievances(res.data.data || []);
    } catch (err) {
      console.error('Error loading grievances for citizen:', err);
      setModalGrievances([]);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Excel / CSV Export
  const handleExportCSV = (reportData, filename) => {
    if (!reportData || reportData.length === 0) {
      alert('No data available to export.');
      return;
    }
    const headers = ["S.No", "Name", "State/UT", "District", "Created On", "Gender", "Mobile", "Municipality", "Ward", "Block", "Panchayat", "Registration Mode", "Grievances Lodged"];
    const rows = reportData.map((row, index) => [
      index + 1,
      `"${row.name || ''}"`,
      `"${row.region || ''}"`,
      `"${row.district || ''}"`,
      row.created_date || row.created_at || '',
      row.gender || '',
      row.mobile || '',
      `"${row.municipality || 'NA'}"`,
      `"${row.ward || 'NA'}"`,
      `"${row.block || 'NA'}"`,
      `"${row.panchayat || 'NA'}"`,
      row.mode || '',
      row.grievanceFiled || 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // HTML Print / PDF export
  const handleExportPDF = (reportData, filename) => {
    if (!reportData || reportData.length === 0) {
      alert('No data available to export.');
      return;
    }
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; font-size: 11px; }
            h2 { text-align: center; color: #1e3a8a; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
          </style>
        </head>
        <body>
          <h2>${filename}</h2>
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>State/UT</th>
                <th>District</th>
                <th>Created On</th>
                <th>Gender</th>
                <th>Mobile</th>
                <th>Mode</th>
                <th>Grievances Lodged</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map((row, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${row.name || ''}</td>
                  <td>${row.region || ''}</td>
                  <td>${row.district || ''}</td>
                  <td>${row.created_date || ''}</td>
                  <td>${row.gender || ''}</td>
                  <td>${row.mobile || ''}</td>
                  <td>${row.mode || ''}</td>
                  <td>${row.grievanceFiled || 0}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const totalPages = Math.ceil(filteredRecords / pageSize);

  return (
    <div className="space-y-6 text-xs text-left animate-fadeIn">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Citizen Registration</h2>
      </div>

      {/* Main Report Layout */}
      <div className="flex gap-6 items-start relative">
        {/* Main content table card */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Citizen Registration Report</h3>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchData}
                title="Reload" 
                className="w-8 h-8 rounded-full border-0 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                title="Filter" 
                className={`w-8 h-8 rounded-full border-0 flex items-center justify-center cursor-pointer transition-colors shadow-xs ${
                  isFilterOpen ? 'bg-blue-600 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleExportCSV(data, 'Citizen_Registration_Report')}
                title="Download Excel" 
                className="w-8 h-8 rounded-full border-0 bg-violet-600 hover:bg-violet-750 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleExportPDF(data, 'Citizen_Registration_Report')}
                title="Download PDF" 
                className="w-8 h-8 rounded-full border-0 bg-slate-950 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table Controls (Show Entries + Search) */}
          <div className="flex justify-between items-center text-slate-650 dark:text-slate-350">
            <div className="flex items-center gap-1.5 font-bold">
              <span>Show</span>
              <select 
                value={pageSize} 
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1.5 text-[10px] font-bold text-slate-700 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-48 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px]"
              />
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-slate-500 font-bold">Loading report data...</span>
              </div>
            ) : error ? (
              <div className="p-12 text-center text-rose-500 font-bold space-y-2">
                <span>{error}</span>
                <button 
                  onClick={fetchData} 
                  className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold border-0 cursor-pointer block mx-auto text-[10px]"
                >
                  Retry
                </button>
              </div>
            ) : data.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-bold">
                No records found.
              </div>
            ) : (
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white font-extrabold uppercase">
                    <th className="p-3 text-center border-r border-blue-500 w-12">S.No.</th>
                    <th onClick={() => { setSortColumn('name'); setSortDirection(sortDirection === 'DESC' ? 'ASC' : 'DESC'); }} className="p-3 text-left border-r border-blue-500 cursor-pointer hover:bg-blue-700">Name</th>
                    <th className="p-3 text-left border-r border-blue-500">State/UT</th>
                    <th onClick={() => { setSortColumn('district'); setSortDirection(sortDirection === 'DESC' ? 'ASC' : 'DESC'); }} className="p-3 text-left border-r border-blue-500 cursor-pointer hover:bg-blue-700">District</th>
                    <th onClick={() => { setSortColumn('created_date'); setSortDirection(sortDirection === 'DESC' ? 'ASC' : 'DESC'); }} className="p-3 text-left border-r border-blue-500 cursor-pointer hover:bg-blue-700">Created On</th>
                    <th className="p-3 text-left border-r border-blue-500">Gender</th>
                    <th className="p-3 text-left border-r border-blue-500">Mobile</th>
                    <th className="p-3 text-left border-r border-blue-500">Municipality</th>
                    <th className="p-3 text-left border-r border-blue-500">Ward</th>
                    <th className="p-3 text-left border-r border-blue-500">Block</th>
                    <th className="p-3 text-left border-r border-blue-500">Panchayat</th>
                    <th className="p-3 text-left border-r border-blue-500">Registration Mode</th>
                    <th onClick={() => { setSortColumn('grievanceFiled'); setSortDirection(sortDirection === 'DESC' ? 'ASC' : 'DESC'); }} className="p-3 text-center cursor-pointer hover:bg-blue-700">No. of Grievance Lodged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200">
                      <td className="p-3 text-center border-r border-slate-150 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-950/40 text-slate-500">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-semibold">{row.name || 'NA'}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-medium">{row.region}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-medium">{row.district}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-mono text-slate-500">
                        {row.created_date ? new Date(row.created_date).toLocaleString('en-GB').split(',').join('') : 'NA'}
                      </td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-medium">{row.gender}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-mono text-slate-500">{row.mobile || 'NA'}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800">{row.municipality || 'NA'}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800">{row.ward || 'NA'}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800">{row.block || 'NA'}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800">{row.panchayat || 'NA'}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400">{row.mode}</td>
                      <td className="p-3 text-center font-extrabold text-blue-600">
                        {row.grievanceFiled > 0 ? (
                          <button 
                            onClick={() => handleOpenGrievances(row.username, row.name)}
                            className="bg-transparent border-0 text-blue-600 hover:text-blue-800 hover:underline font-extrabold cursor-pointer text-[10px]"
                          >
                            {row.grievanceFiled}
                          </button>
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer: Show count + Pagination */}
          <div className="flex justify-between items-center text-slate-500 font-bold pt-3">
            <div>
              Showing {filteredRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRecords)} of {filteredRecords.toLocaleString()} entries
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-white"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  let pageNum = idx + 1;
                  if (currentPage > 3 && totalPages > 5) {
                    pageNum = currentPage - 3 + idx;
                    if (pageNum + (4 - idx) > totalPages) {
                      pageNum = totalPages - 4 + idx;
                    }
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 border-blue-600 text-white' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-1 text-slate-400">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                        currentPage === totalPages
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-700 dark:text-white'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 dark:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic collapsible filter side drawer */}
        {isFilterOpen && (
          <div className="w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-4 animate-slideIn">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">Filter</h4>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="border-0 bg-transparent text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Date Filters */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">From / on</label>
                <input 
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">To</label>
                <input 
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px]"
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Mode / Gender options */}
            <div className="space-y-2">
              {[
                { label: 'Web', value: 'web' },
                { label: 'Mobile', value: 'mobile' },
                { label: 'Female', value: 'Female' },
                { label: 'Male', value: 'Male' },
                { label: 'Transgender', value: 'Transgender' }
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-slate-650 dark:text-slate-350 font-medium cursor-pointer">
                  <input 
                    type="radio" 
                    name="filter-type"
                    checked={genderOrMode === opt.value}
                    onChange={() => setGenderOrMode(opt.value)}
                    className="accent-blue-600 w-3 h-3"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
              {genderOrMode && (
                <button 
                  onClick={() => setGenderOrMode('')}
                  className="text-[9px] text-blue-600 font-extrabold bg-transparent border-0 cursor-pointer hover:underline p-0 block mt-1"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* State & District Selectors */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">State</label>
                <select 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-medium"
                >
                  <option value="0">Select State</option>
                  <option value="JAMMU AND KASHMIR">JAMMU AND KASHMIR</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">District</label>
                <select 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-medium"
                >
                  <option value="0">Select District</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedDistrict !== '0' && (
              <>
                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Block / Municipality Selection */}
                <div className="space-y-3">
                  <span className="text-slate-500 font-extrabold block">Select Municipality / Block</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350 cursor-pointer">
                      <input 
                        type="radio" 
                        name="area-type"
                        checked={areaType === 'municipality'}
                        onChange={() => setAreaType('municipality')}
                        className="accent-blue-600 w-3 h-3"
                      />
                      <span>Municipality</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350 cursor-pointer">
                      <input 
                        type="radio" 
                        name="area-type"
                        checked={areaType === 'block'}
                        onChange={() => setAreaType('block')}
                        className="accent-blue-600 w-3 h-3"
                      />
                      <span>Block</span>
                    </label>
                  </div>

                  {/* Municipality & Ward Dropdowns */}
                  {areaType === 'municipality' && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold block">Select Municipality</label>
                        <select 
                          value={selectedMunicipality} 
                          onChange={(e) => setSelectedMunicipality(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-medium"
                        >
                          <option value="0">Select Municipality</option>
                          {municipalities.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold block">Select Ward</label>
                        <select 
                          value={selectedWard} 
                          onChange={(e) => setSelectedWard(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-medium"
                        >
                          <option value="0">Select Ward</option>
                          {wards.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Block & Panchayat Dropdowns */}
                  {areaType === 'block' && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold block">Select Block</label>
                        <select 
                          value={selectedBlock} 
                          onChange={(e) => setSelectedBlock(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-medium"
                        >
                          <option value="0">Select Block</option>
                          {blocks.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-bold block">Select Panchayat</label>
                        <select 
                          value={selectedPanchayat} 
                          onChange={(e) => setSelectedPanchayat(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-[10px] font-medium"
                        >
                          <option value="0">Select Panchayat</option>
                          {panchayats.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setGenderOrMode('');
                  setSelectedState('0');
                  setSelectedDistrict('0');
                  setAreaType('');
                  setSelectedMunicipality('0');
                  setSelectedWard('0');
                  setSelectedBlock('0');
                  setSelectedPanchayat('0');
                  setCurrentPage(1);
                  setTimeout(fetchData, 50);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold border-0 cursor-pointer transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => {
                  setCurrentPage(1);
                  fetchData();
                }}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold border-0 cursor-pointer transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sub reports layout (Division Wise + District Wise) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Division Wise report card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">Division Wise-Citizen Registration Report</h4>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleExportCSV(divData, 'Division_Wise_Report')}
                className="w-7 h-7 rounded-full border-0 bg-violet-600 hover:bg-violet-750 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleExportPDF(divData, 'Division_Wise_Report')}
                className="w-7 h-7 rounded-full border-0 bg-slate-950 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
            {isDivLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : divData.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-bold">No records found.</div>
            ) : (
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white font-extrabold uppercase">
                    <th className="p-3 text-center border-r border-blue-500 w-12">S.No.</th>
                    <th className="p-3 text-left border-r border-blue-500">Total Citizens Registered</th>
                    <th className="p-3 text-left border-r border-blue-500">Jammu Division</th>
                    <th className="p-3 text-left">Kashmir Division</th>
                  </tr>
                </thead>
                <tbody>
                  {divData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200">
                      <td className="p-3 text-center border-r border-slate-150 dark:border-slate-800 font-bold text-slate-500 bg-slate-50 dark:bg-slate-950/40">{idx + 1}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-extrabold text-blue-600 text-xs">{(row.totalRegistration || 0).toLocaleString()}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-bold">{(row.jammudivision || 0).toLocaleString()}</td>
                      <td className="p-3 font-bold">{(row.kashmirdivision || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* District Wise report card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-slate-800 dark:text-white text-xs">District Wise Citizen - Registration Report</h4>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handleExportCSV(distData, 'District_Wise_Report')}
                className="w-7 h-7 rounded-full border-0 bg-violet-600 hover:bg-violet-750 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleExportPDF(distData, 'District_Wise_Report')}
                className="w-7 h-7 rounded-full border-0 bg-slate-950 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl max-h-[300px] overflow-y-auto">
            {isDistLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : distData.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-bold">No records found.</div>
            ) : (
              <table className="w-full text-[10px] border-collapse">
                <thead>
                  <tr className="bg-blue-600 text-white font-extrabold uppercase sticky top-0 z-10">
                    <th className="p-3 text-center border-r border-blue-500 w-12">S.No.</th>
                    <th className="p-3 text-left border-r border-blue-500">Name of the District</th>
                    <th className="p-3 text-left border-r border-blue-500">State</th>
                    <th className="p-3 text-left">Total Citizens Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {distData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200">
                      <td className="p-3 text-center border-r border-slate-150 dark:border-slate-800 font-bold text-slate-500 bg-slate-50 dark:bg-slate-950/40">{idx + 1}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-bold">{row.district}</td>
                      <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-medium text-slate-550">{row.region}</td>
                      <td className="p-3 font-extrabold text-blue-600">{(row.totalregistration || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Grievances Lodged Modal */}
      {showGrievanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-xs">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col max-h-[90vh] animate-slideIn">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">{modalTitle}</h3>
              <button 
                onClick={() => setShowGrievanceModal(false)}
                className="w-8 h-8 rounded-full border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[250px]">
              {isModalLoading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="font-bold text-slate-500">Loading citizen grievances...</span>
                </div>
              ) : modalGrievances.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-bold">
                  No grievances found for this citizen.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-blue-600 text-white font-extrabold uppercase">
                        <th className="p-3 text-center border-r border-blue-500 w-12">S.No</th>
                        <th className="p-3 text-left border-r border-blue-500">Grievance ID</th>
                        <th className="p-3 text-left border-r border-blue-500">Department</th>
                        <th className="p-3 text-left border-r border-blue-500">Category</th>
                        <th className="p-3 text-left border-r border-blue-500">Description</th>
                        <th className="p-3 text-left border-r border-blue-500">Created Date</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {modalGrievances.map((g, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200">
                          <td className="p-3 text-center border-r border-slate-150 dark:border-slate-800 font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-extrabold">{g.uniqId || g.id}</td>
                          <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-semibold">{g.department || 'NA'}</td>
                          <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-medium">{g.grievanceCategory || 'NA'}</td>
                          <td className="p-3 border-r border-slate-150 dark:border-slate-800 max-w-xs truncate">{g.description || 'NA'}</td>
                          <td className="p-3 border-r border-slate-150 dark:border-slate-800 font-mono text-slate-500">
                            {g.createdAt ? new Date(g.createdAt).toLocaleString('en-GB') : 'NA'}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[9px] ${
                              g.status === 'Resolved' 
                                ? 'bg-green-100 text-green-700' 
                                : g.status === 'Pending' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {g.status || 'Received'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setShowGrievanceModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-350 text-slate-705 border-0 font-extrabold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
