import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck2, 
  PieChart, 
  Calendar, 
  ThumbsUp, 
  AlertCircle, 
  FileX, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Database,
  Menu,
  X,
  Bell,
  Play,
  ChevronDown,
  User,
  LogOut,
  ClipboardList
} from 'lucide-react';
import emblemImg from '../assets/emblem.png';

export default function Dashboard({ 
  user, 
  grievances, 
  setGrievances, 
  onLodgeClick, 
  onAppealClick,
  onLogout,
  onLmsClick
}) {
  const [filterType, setFilterType] = useState('All'); // 'All', 'Web', 'Mobile'
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Header Dropdowns
  const [isLmsDropdownOpen, setIsLmsDropdownOpen] = useState(false);
  const [isManualDropdownOpen, setIsManualDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const lmsRef = useRef(null);
  const manualRef = useRef(null);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLmsDropdownOpen && lmsRef.current && !lmsRef.current.contains(event.target)) {
        setIsLmsDropdownOpen(false);
      }
      if (isManualDropdownOpen && manualRef.current && !manualRef.current.contains(event.target)) {
        setIsManualDropdownOpen(false);
      }
      if (isLangDropdownOpen && langRef.current && !langRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
      if (isProfileDropdownOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLmsDropdownOpen, isManualDropdownOpen, isLangDropdownOpen, isProfileDropdownOpen]);

  // Department ID to Name map for display
  const getDeptName = (id) => {
    const depts = {
      pwd: 'Public Works Department (R&B)',
      pdd: 'Power Development Department (PDD)',
      phe: 'Jal Shakti (PHE) Department',
      health: 'Health & Medical Education',
      edu: 'School Education Department',
      revenue: 'Revenue Department',
      municipality: 'Housing & Urban Development',
      food: 'Food, Civil Supplies & Consumer Affairs'
    };
    return depts[id] || id || 'General Administration';
  };

  // Status Colors for Official look
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">Resolved</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">Rejected</span>;
      case 'appealed':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">Appealed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Pending</span>;
    }
  };

  // Load Demo Data for presentation
  const handleLoadDemoData = () => {
    const demoGrievances = [
      {
        refNum: 'JK-283941-2026',
        type: 'grievance',
        department: 'pdd',
        category: 'Faulty Transformer',
        subject: 'Repeated power fluctuations and faulty transformer in Sector 3',
        description: 'The local transformer has caught fire twice and voltage fluctuation is damaging household electronics.',
        date: '18/06/2026',
        status: 'Pending',
        source: 'Web'
      },
      {
        refNum: 'JK-198274-2026',
        type: 'grievance',
        department: 'municipality',
        category: 'Garbage Collection',
        subject: 'Irregular waste disposal and blocked sewers in Ward 9',
        description: 'Waste disposal trucks have not visited Ward 9 in two weeks. Drainage is blocked causing health hazards.',
        date: '12/06/2026',
        status: 'Resolved',
        source: 'Mobile'
      },
      {
        refNum: 'JK-304928-2026',
        type: 'grievance',
        department: 'phe',
        category: 'Water Scarcity',
        subject: 'No drinking water supply for 5 consecutive days',
        description: 'Water pipeline in Anantnag block has ruptured, leading to no clean drinking water availability.',
        date: '05/06/2026',
        status: 'Rejected',
        source: 'Web'
      },
      {
        refNum: 'JK-APL-492019-2026',
        type: 'appeal',
        department: 'edu',
        category: 'School Infrastructure',
        subject: 'Appeal regarding delayed mid-day meal quality inspection',
        description: 'First grievance was marked resolved but the food quality is still subpar. Seeking secondary investigation.',
        date: '22/06/2026',
        status: 'Appealed',
        source: 'Web'
      }
    ];
    setGrievances(demoGrievances);
  };

  // Filter & Search logic
  const filteredGrievances = grievances.filter((item) => {
    const source = item.source || 'Web';
    if (filterType !== 'All' && source.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        item.refNum?.toLowerCase().includes(query) ||
        getDeptName(item.department).toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.subject?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Pagination logic
  const totalItems = filteredGrievances.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedGrievances = filteredGrievances.slice(startIndex, startIndex + pageSize);

  // Calculations for stats
  const totalCount = grievances.length;
  const pendingCount = grievances.filter(g => g.status === 'Pending').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;
  const appealedCount = grievances.filter(g => g.status === 'Appealed' || g.type === 'appeal').length;
  const rejectedCount = grievances.filter(g => g.status === 'Rejected').length;

  const SortIndicator = () => (
    <span className="inline-flex flex-col ml-1.5 opacity-60">
      <span className="text-[6px] leading-none mb-0.5">▲</span>
      <span className="text-[6px] leading-none">▼</span>
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f9] text-slate-800 font-sans">
      
      {/* ── Top Header Redesigned ── */}
      <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 z-45 sticky top-0 shrink-0">
        {/* Left: Brand logos and hamburger toggle */}
        <div className="flex items-center gap-3">
          <img src={emblemImg} className="h-9 w-auto object-contain shrink-0" alt="Emblem" />
          
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-[#164581] leading-none">JK Samadhan</span>
              <span className="bg-[#f06e30] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full scale-90">2.0</span>
            </div>
            <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 leading-none">Government of Jammu & Kashmir</span>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1.5 hidden sm:block"></div>
          
          <div className="flex items-center gap-1.5 z-10 hidden sm:flex">
            <div className="p-0.5 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg text-white">
              <svg viewBox="0 0 100 100" className="w-5 h-5 text-white fill-none stroke-current" strokeWidth="6">
                <circle cx="50" cy="50" r="12" />
                <circle cx="20" cy="40" r="7" />
                <circle cx="45" cy="18" r="7" />
                <circle cx="80" cy="35" r="7" />
                <circle cx="70" cy="75" r="7" />
                <circle cx="30" cy="75" r="7" />
                <line x1="26" y1="42" x2="39" y2="47" />
                <line x1="48" y1="25" x2="50" y2="38" />
                <line x1="73" y1="38" x2="61" y2="46" />
                <line x1="66" y1="70" x2="57" y2="59" />
                <line x1="34" y1="70" x2="43" y2="59" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-extrabold text-xs tracking-tight uppercase leading-none text-[#164581]">JK Raabita</span>
            </div>
          </div>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer ml-1.5 sm:ml-3 border-0 bg-transparent"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Right: Dropdowns and User profile */}
        <div className="flex items-center gap-2">
          {/* LMS Videos */}
          <div className="relative" ref={lmsRef}>
            <button 
              onClick={() => {
                setIsLmsDropdownOpen(!isLmsDropdownOpen);
                setIsManualDropdownOpen(false);
                setIsLangDropdownOpen(false);
                setIsProfileDropdownOpen(false);
              }}
              className="flex items-center gap-1 bg-[#1f2e42] hover:bg-[#182535] text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm select-none border-0"
            >
              <div className="flex items-center justify-center bg-red-600 rounded-full p-0.5 shrink-0">
                <Play className="h-2 w-2 text-white fill-current translate-x-[0.5px]" />
              </div>
              <span>LMS Videos</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>
            {isLmsDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 text-left">
                <button 
                  onClick={() => { setIsLmsDropdownOpen(false); onLmsClick('login'); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0"
                >
                  How to Login
                </button>
                <button 
                  onClick={() => { setIsLmsDropdownOpen(false); onLmsClick('register'); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0"
                >
                  How to Register
                </button>
              </div>
            )}
          </div>

          {/* User Manual */}
          <div className="relative" ref={manualRef}>
            <button 
              onClick={() => {
                setIsManualDropdownOpen(!isManualDropdownOpen);
                setIsLmsDropdownOpen(false);
                setIsLangDropdownOpen(false);
                setIsProfileDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 bg-[#1f2e42] hover:bg-[#182535] text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm select-none border-0"
            >
              <span>User Manual</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>
            {isManualDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1.5 z-50 text-left">
                <button 
                  onClick={() => { alert('Downloading Citizen User Manual PDF (Mock)'); setIsManualDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0"
                >
                  Citizen User Manual
                </button>
                <button 
                  onClick={() => { alert('Downloading Officer User Manual PDF (Mock)'); setIsManualDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0"
                >
                  Officer User Manual
                </button>
              </div>
            )}
          </div>

          {/* Language */}
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => {
                setIsLangDropdownOpen(!isLangDropdownOpen);
                setIsLmsDropdownOpen(false);
                setIsManualDropdownOpen(false);
                setIsProfileDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 bg-[#1f2e42] hover:bg-[#182535] text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm select-none border-0"
            >
              <span>Language</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-200 rounded-md shadow-lg py-1.5 z-50 text-left">
                <button onClick={() => setIsLangDropdownOpen(false)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0">English</button>
                <button onClick={() => setIsLangDropdownOpen(false)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0">Urdu</button>
                <button onClick={() => setIsLangDropdownOpen(false)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0">Hindi</button>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative border-l border-slate-200 pl-2 ml-1" ref={profileRef}>
            <button 
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsLmsDropdownOpen(false);
                setIsManualDropdownOpen(false);
                setIsLangDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 text-xs font-bold py-1 transition-colors cursor-pointer select-none border-0 bg-transparent"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 text-[#164581] flex items-center justify-center font-bold border border-slate-350 shrink-0">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden md:inline max-w-[130px] truncate font-sans text-slate-700">{user?.name || 'sai srujan rallabandi'}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60 text-slate-650" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1.5 z-50 text-left font-sans">
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Logged in as</span>
                  <span className="block text-xs font-bold text-slate-800 truncate">{user?.email || 'sai@samadhan.jk.gov.in'}</span>
                </div>
                <button 
                  onClick={() => { setIsProfileDropdownOpen(false); onLogout(); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-650 hover:bg-red-50 cursor-pointer bg-transparent border-0 flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Outer Body Layout Row ── */}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-[calc(100vh-64px)]">
        
        {/* ── Left Sidebar: Dark Themed navigation ── */}
        <aside className={`bg-[#1f2e42] text-white flex flex-col justify-between shrink-0 select-none transition-all duration-300 z-30 ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden'
        } fixed md:relative h-[calc(100vh-64px)] md:h-auto`}>
          <div className="flex flex-col">
            <nav className="p-4 space-y-1.5">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition-all bg-[#eae8ff] text-[#5b21b6] cursor-pointer border-0"
              >
                <LayoutDashboard className="h-4.5 w-4.5" />
                <span>User Dashboard</span>
              </button>
              <button
                onClick={() => onLodgeClick('grievance')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer bg-transparent border-0"
              >
                <FileText className="h-4.5 w-4.5" />
                <span>Lodge Grievance</span>
              </button>
              <button
                onClick={() => onAppealClick()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer bg-transparent border-0"
              >
                <FileCheck2 className="h-4.5 w-4.5" />
                <span>Lodge Appeal</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 flex items-center justify-center">
            <div className="px-4 py-1.5 bg-slate-900/60 rounded-full text-xs text-slate-300 font-mono">
              ver: v2.7.13
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 flex flex-col p-6 space-y-6 overflow-x-hidden pb-16">
          
          {/* Breadcrumb Header & Notification Bell */}
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              Dashboard <span className="text-slate-350 font-normal">|</span> <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded">User Dashboard</span>
            </h2>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLoadDemoData}
                className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                title="Populate dashboard with sample grievance records"
              >
                <Database className="h-3.5 w-3.5 text-blue-600" />
                <span>Load Demo Data</span>
              </button>

              <div className="relative mr-2">
                <button className="relative p-2 text-slate-550 hover:text-slate-800 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer border-0 bg-transparent">
                  <Bell className="h-5 w-5 fill-none stroke-current" />
                  <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-650 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white leading-none">
                    0
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Total Submitted */}
            <div className="bg-[#1e40af] text-white p-5 rounded-xl shadow-md border border-blue-800/10 flex justify-between items-center relative overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="space-y-1 z-10 text-left">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90">Total Grievances Submitted</span>
                <span className="block text-3xl font-extrabold font-mono">{totalCount}</span>
              </div>
              <PieChart className="h-11 w-11 text-white/20 stroke-[1.5] shrink-0" />
            </div>

            {/* Card 2: Pending with Department */}
            <div className="bg-[#0f766e] text-white p-5 rounded-xl shadow-md border border-teal-800/10 flex justify-between items-center relative overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="space-y-1 z-10 text-left">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90">Pending with Department</span>
                <span className="block text-3xl font-extrabold font-mono">{pendingCount}</span>
              </div>
              <Calendar className="h-11 w-11 text-white/20 stroke-[1.5] shrink-0" />
            </div>

            {/* Card 3: Resolved */}
            <div className="bg-[#15803d] text-white p-5 rounded-xl shadow-md border border-green-800/10 flex justify-between items-center relative overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="space-y-1 z-10 text-left">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90">Resolved</span>
                <span className="block text-3xl font-extrabold font-mono">{resolvedCount}</span>
              </div>
              <ThumbsUp className="h-11 w-11 text-white/20 stroke-[1.5] shrink-0" />
            </div>

            {/* Card 4: Appealed */}
            <div className="bg-[#c2410c] text-white p-5 rounded-xl shadow-md border border-orange-800/10 flex justify-between items-center relative overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="space-y-1 z-10 text-left">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90">Appealed</span>
                <span className="block text-3xl font-extrabold font-mono">{appealedCount}</span>
              </div>
              <AlertCircle className="h-11 w-11 text-white/20 stroke-[1.5] shrink-0" />
            </div>

            {/* Card 5: Rejected */}
            <div className="bg-[#eab308] text-white p-5 rounded-xl shadow-md border border-yellow-800/10 flex justify-between items-center relative overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="space-y-1 z-10 text-left">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90">Rejected</span>
                <span className="block text-3xl font-extrabold font-mono">{rejectedCount}</span>
              </div>
              <ClipboardList className="h-11 w-11 text-white/20 stroke-[1.5] shrink-0" />
            </div>

          </div>

          {/* Grievances List Container */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
            
            {/* List Card Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                List of Grievances
              </h3>
              
              <div className="flex items-center gap-4">
                {/* Center: Filter option as bordered legend box */}
                <fieldset className="border border-indigo-400 rounded-lg px-4 py-1.5 text-xs">
                  <legend className="text-indigo-600 font-bold px-1.5 text-[9px] uppercase tracking-wider">Filter</legend>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
                      <input 
                        type="radio" 
                        name="filterSource"
                        checked={filterType === 'All'}
                        onChange={() => { setFilterType('All'); setCurrentPage(1); }}
                        className="accent-indigo-650 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span>All</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
                      <input 
                        type="radio" 
                        name="filterSource"
                        checked={filterType === 'Web'}
                        onChange={() => { setFilterType('Web'); setCurrentPage(1); }}
                        className="accent-indigo-650 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span>Web</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
                      <input 
                        type="radio" 
                        name="filterSource"
                        checked={filterType === 'Mobile'}
                        onChange={() => { setFilterType('Mobile'); setCurrentPage(1); }}
                        className="accent-indigo-650 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span>Mobile</span>
                    </label>
                  </div>
                </fieldset>

                {/* Right: Export buttons in capsule format */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => alert('Exporting to Excel (Mock)')}
                    className="w-9 h-9 rounded-full bg-[#0f2d59] text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer border-0 shadow-sm"
                    title="Export as XLS"
                  >
                    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current text-white">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity="0.2" />
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 9V3.5L18.5 9H13z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="7" y="18" fontSize="6.5" fontWeight="bold" fill="currentColor" fontFamily="monospace">XLS</text>
                    </svg>
                  </button>
                  <button 
                    onClick={() => alert('Exporting to PDF (Mock)')}
                    className="w-9 h-9 rounded-full bg-[#18181b] text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer border-0 shadow-sm"
                    title="Export as PDF"
                  >
                    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current text-white">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity="0.2" />
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 9V3.5L18.5 9H13z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <text x="7" y="18" fontSize="6.5" fontWeight="bold" fill="currentColor" fontFamily="monospace">PDF</text>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Table Operations: Entries select & Search filter */}
            <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 border-b border-slate-200">
              {/* Page Size select */}
              <div className="flex items-center gap-2 text-xs text-slate-650 font-semibold">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-slate-300 rounded bg-white px-2 py-1 outline-none font-bold cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>

              {/* Table Search Input */}
              <div className="relative w-full sm:w-64 flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-650 select-none">Search:</span>
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-1.5 w-full border border-slate-300 rounded-md text-xs outline-none bg-white focus:border-[#164581] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Grid Border HTML Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 border-collapse">
                <thead>
                  <tr className="bg-[#164581] text-white">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                      S. No. <SortIndicator />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                      Grievance ID <SortIndicator />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                      Department <SortIndicator />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                      Main category <SortIndicator />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                      Date <SortIndicator />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                      Status <SortIndicator />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                      Action <SortIndicator />
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200 text-xs font-medium">
                  {paginatedGrievances.length > 0 ? (
                    paginatedGrievances.map((item, index) => (
                      <tr key={item.refNum} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 border border-slate-200 text-slate-500 font-mono font-bold text-center">
                          {startIndex + index + 1}
                        </td>
                        <td className="px-4 py-3 border border-slate-200 text-[#164581] font-bold font-mono whitespace-nowrap">
                          {item.refNum}
                        </td>
                        <td className="px-4 py-3 border border-slate-200 text-slate-700 max-w-[200px] truncate" title={getDeptName(item.department)}>
                          {getDeptName(item.department)}
                        </td>
                        <td className="px-4 py-3 border border-slate-200 text-slate-700 whitespace-nowrap">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 border border-slate-200 text-slate-600 font-mono">
                          {item.date}
                        </td>
                        <td className="px-4 py-3 border border-slate-200 whitespace-nowrap">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-4 py-3 border border-slate-200 text-center whitespace-nowrap">
                          <button 
                            onClick={() => alert(`Details:\n\nReference: ${item.refNum}\nDepartment: ${getDeptName(item.department)}\nCategory: ${item.category}\nSubject: ${item.subject}\nDescription: ${item.description}\nDate: ${item.date}\nStatus: ${item.status}`)}
                            className="px-2.5 py-1 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded transition-all bg-white cursor-pointer font-bold"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 border border-slate-200 bg-[#f1f5f9] font-medium text-sm">
                        No data available in table
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-550 bg-slate-50/50 font-verdana">
              <div>
                Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} entries
              </div>
              
              {/* Pagination Actions */}
              <div className="flex items-center gap-4 select-none">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-bold bg-transparent border-0 outline-none"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-bold bg-transparent border-0 outline-none"
                >
                  Next
                </button>
              </div>
            </div>

          </div>

        </main>

      </div>

      {/* Copy-Right Footer Block */}
      <footer className="w-full bg-[#e2e8f0] text-slate-500 border-t border-slate-300 py-3.5 text-center text-[11px] font-semibold select-none z-30 shrink-0">
        © Copyright Ministry of Electronics and Information Technology. All Rights Reserved
      </footer>

    </div>
  );
}
