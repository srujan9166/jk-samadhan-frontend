import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  ThumbsUp, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Megaphone, 
  Sliders, 
  Code, 
  Play, 
  CheckCircle2, 
  UserCheck,
  PlusCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import emblemImg from '../../assets/emblem.png';
import grievanceService from '../../services/grievanceService';

export default function SuperAdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, appealed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'query_builder', 'announcements', 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  
  // SQL Query Console State
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM jks_3nf.grievance_masters LIMIT 10;');
  const [queryResult, setQueryResult] = useState(null);
  const [isQueryExecuting, setIsQueryExecuting] = useState(false);
  
  // Announcement State
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementType, setAnnouncementType] = useState('Alert'); // 'Alert', 'Downtime', 'General'

  // Settings States
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [mappingDept, setMappingDept] = useState('');
  const [mappingCategory, setMappingCategory] = useState('');
  const [mappingOfficer, setMappingOfficer] = useState('');
  const [slaDays, setSlaDays] = useState(15);
  const [slaDept, setSlaDept] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await grievanceService.getGrievances();
      setGrievances(data || []);
      
      const total = data.length;
      const pending = data.filter(g => g.status !== 'Resolved' && g.status !== 'Rejected' && g.status !== 'Does Not Pertain').length;
      const resolved = data.filter(g => g.status === 'Resolved').length;
      const appealed = data.filter(g => g.windowType === 'Raabita' || g.status === 'Appealed' || g.psga === 'Yes').length;

      setStats({
        total,
        pending,
        resolved,
        appealed
      });
    } catch (err) {
      console.error('Error loading SuperAdmin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteQuery = (e) => {
    e.preventDefault();
    setIsQueryExecuting(true);
    setTimeout(() => {
      setQueryResult([
        { id: 100021, uniq_id: 'GRV2026/100021', description: 'Transformer repair delay', status: 'Pending', created_at: '2026-07-16 10:10:15' },
        { id: 100022, uniq_id: 'GRV2026/100022', description: 'Garbage dumping issues', status: 'Resolved', created_at: '2026-07-15 14:20:10' },
        { id: 100023, uniq_id: 'GRV2026/100023', description: 'Road construction quality', status: 'Rejected', created_at: '2026-07-14 09:30:20' }
      ]);
      setIsQueryExecuting(false);
    }, 800);
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    alert(`[${announcementType}] Announcement published: "${announcementText}"`);
    setAnnouncementText('');
  };

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDepartmentName.trim()) return;
    alert(`Department registered: "${newDepartmentName}"`);
    setNewDepartmentName('');
  };

  const handleMapCategory = (e) => {
    e.preventDefault();
    if (!mappingDept || !mappingCategory || !mappingOfficer) return;
    alert(`Mapped Category "${mappingCategory}" of Department "${mappingDept}" to Nodal Officer "${mappingOfficer}"`);
    setMappingDept('');
    setMappingCategory('');
    setMappingOfficer('');
  };

  const handleUpdateSLA = (e) => {
    e.preventDefault();
    if (!slaDept || !slaDays) return;
    alert(`Updated SLA timeline for Department "${slaDept}" to ${slaDays} Days`);
    setSlaDept('');
  };

  // Filter grievances for log table
  const filteredGrievances = grievances.filter(g => {
    const query = searchQuery.toLowerCase();
    const dept = g.department?.name || g.department || '';
    const cat = g.category?.name || g.grievanceCategory || '';
    const desc = g.description || '';
    const id = g.id?.toString() || '';
    return (
      id.includes(query) ||
      dept.toLowerCase().includes(query) ||
      cat.toLowerCase().includes(query) ||
      desc.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans select-none animate-fadeIn text-xs">
      
      {/* ── High-Contrast Government Top Bar Branding ── */}
      <header className="bg-[#164581] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <img src={emblemImg} alt="National Emblem of India" className="h-10 w-auto filter brightness-0 invert" />
          <div className="text-left font-sans">
            <h1 className="text-lg font-black tracking-tight leading-none">JKSamadhan</h1>
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest block mt-1.5 font-sans">
              Welcome, Administrative Officer
            </span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-2 border border-red-300 hover:bg-red-950/20 text-red-100 font-bold rounded-lg text-xs transition-colors cursor-pointer"
        >
          Logout
        </button>
      </header>

      {/* ── Interactive Navigation Tabs ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex px-6 py-1 gap-2 shadow-xs">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`px-4 py-3 font-bold border-b-2 text-xs cursor-pointer transition-all ${activeTab === 'overview' ? 'border-[#164581] text-[#164581] dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          Overview Metrics
        </button>
        <button 
          onClick={() => setActiveTab('query_builder')} 
          className={`px-4 py-3 font-bold border-b-2 text-xs cursor-pointer transition-all ${activeTab === 'query_builder' ? 'border-[#164581] text-[#164581] dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          Query Builder
        </button>
        <button 
          onClick={() => setActiveTab('announcements')} 
          className={`px-4 py-3 font-bold border-b-2 text-xs cursor-pointer transition-all ${activeTab === 'announcements' ? 'border-[#164581] text-[#164581] dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          Announcements Manager
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`px-4 py-3 font-bold border-b-2 text-xs cursor-pointer transition-all ${activeTab === 'settings' ? 'border-[#164581] text-[#164581] dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          System Settings
        </button>
      </div>

      {/* ── Main Dashboard Panel Area ── */}
      <main className="p-6 flex-1 max-w-7xl mx-auto w-full text-left">
        
        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* ── Stat Cards Grid (Themed Colors) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Total Cases - Blue */}
              <div className="bg-[#1e40af] text-white p-5 rounded-xl shadow-sm flex justify-between items-center">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/90">Total Cases</span>
                  <span className="block text-2xl font-black font-mono">{stats.total}</span>
                </div>
                <FileText className="h-9 w-9 opacity-35" />
              </div>
              
              {/* Active / Pending - Orange */}
              <div className="bg-[#b45309] text-white p-5 rounded-xl shadow-sm flex justify-between items-center">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/90">Active / Pending</span>
                  <span className="block text-2xl font-black font-mono">{stats.pending}</span>
                </div>
                <AlertCircle className="h-9 w-9 opacity-35" />
              </div>
              
              {/* Resolved - Green */}
              <div className="bg-[#15803d] text-white p-5 rounded-xl shadow-sm flex justify-between items-center">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/90">Resolved</span>
                  <span className="block text-2xl font-black font-mono">{stats.resolved}</span>
                </div>
                <ThumbsUp className="h-9 w-9 opacity-35" />
              </div>
              
              {/* Appeals / Dismissed - Red */}
              <div className="bg-[#b91c1c] text-white p-5 rounded-xl shadow-sm flex justify-between items-center">
                <div className="space-y-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/90">Appeals / Dismissed</span>
                  <span className="block text-2xl font-black font-mono">{stats.appealed}</span>
                </div>
                <ShieldAlert className="h-9 w-9 opacity-35" />
              </div>
            </div>

            {/* ── Citizens Petitions Log Table ── */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-850 dark:text-slate-205 uppercase tracking-wider">Citizens Petitions Log</h3>
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center">
                    <span className="text-slate-550 dark:text-slate-400 font-bold mr-2">Search:</span>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded px-2.5 py-1 text-xs outline-none focus:border-[#164581] text-slate-850 dark:text-slate-100"
                      placeholder="Filter records..."
                    />
                  </div>
                  <button 
                    onClick={loadData}
                    className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-250 dark:border-slate-700 rounded-lg text-slate-650 dark:text-slate-300 cursor-pointer"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-400 uppercase tracking-widest text-[9px] font-extrabold select-none">
                      <th className="px-6 py-3.5">Grievance ID</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Summary Description</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-center">Action Trigger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">Loading petitions data...</td>
                      </tr>
                    ) : filteredGrievances.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">No records found.</td>
                      </tr>
                    ) : (
                      filteredGrievances.map((g) => (
                        <tr key={g.id} className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-400">JK-{100000 + g.id}</td>
                          <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{g.department?.name || g.department || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{g.category?.name || g.grievanceCategory || 'N/A'}</td>
                          <td className="px-6 py-4 text-slate-550 dark:text-slate-400 max-w-xs truncate">{g.description || 'No description provided'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              g.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900' :
                              g.status === 'Pending' || g.status === 'Registered' ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900' :
                              'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900'
                            }`}>
                              {g.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => navigate(`/grievance/${g.id}`)}
                              className="px-3 py-1 bg-[#164581] hover:opacity-95 text-white rounded text-[10px] font-bold inline-flex items-center gap-1 mx-auto cursor-pointer border-0 shadow-sm"
                            >
                              <span>Review</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SQL QUERY BUILDER */}
        {activeTab === 'query_builder' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-805 dark:text-slate-250 uppercase tracking-wider flex items-center gap-2">
              <Code className="h-5 w-5 text-[#164581] dark:text-indigo-400" />
              SQL Query Builder Console
            </h3>
            <form onSubmit={handleExecuteQuery} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-750 dark:text-slate-300 uppercase">Write PostgreSQL Query</label>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={4}
                  className="w-full font-mono text-xs p-3 border rounded-lg bg-slate-950 text-emerald-400 border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={isQueryExecuting}
                className="px-4 py-2 bg-[#164581] hover:opacity-95 text-white rounded-lg font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                {isQueryExecuting ? 'Executing Query...' : 'Execute Query'}
              </button>
            </form>

            {queryResult && (
              <div className="space-y-2 mt-6">
                <h4 className="font-bold text-slate-750 dark:text-slate-300 uppercase tracking-wider text-[10px]">Query Results ({queryResult.length} rows returned)</h4>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 font-bold">
                        <th className="p-3">id</th>
                        <th className="p-3">uniq_id</th>
                        <th className="p-3">description</th>
                        <th className="p-3">status</th>
                        <th className="p-3">created_at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.map((row) => (
                        <tr key={row.id} className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3">{row.id}</td>
                          <td className="p-3 text-indigo-600 dark:text-indigo-400">{row.uniq_id}</td>
                          <td className="p-3 max-w-xs truncate">{row.description}</td>
                          <td className="p-3 font-bold text-amber-600">{row.status}</td>
                          <td className="p-3 text-slate-500">{row.created_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANNOUNCEMENTS MANAGER */}
        {activeTab === 'announcements' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-805 dark:text-slate-250 uppercase tracking-wider flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-[#164581] dark:text-indigo-400" />
              Publish System Announcements
            </h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-750 dark:text-slate-350 uppercase">Announcement Type</label>
                  <select
                    value={announcementType}
                    onChange={(e) => setAnnouncementType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-slate-150 rounded-lg px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="Alert">Alert Notification</option>
                    <option value="Downtime">Downtime / Maintenance Schedule</option>
                    <option value="General">General Notice</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-750 dark:text-slate-300 uppercase">Alert / downtime Message Content</label>
                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Enter notice content to display on the citizens landing page..."
                  rows={4}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-100 border-slate-300 dark:border-slate-750 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#164581] hover:opacity-95 text-white rounded-lg font-bold text-xs cursor-pointer shadow-sm"
              >
                Broadcast Announcement
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            {/* Control 1: Register New Departments */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-805 dark:text-slate-250 uppercase tracking-wider flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-[#164581] dark:text-indigo-400" />
                Register New Government Department
              </h3>
              <form onSubmit={handleAddDept} className="flex gap-3 max-w-lg">
                <input 
                  type="text" 
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="Enter new Department Name (e.g. Forest Dept)..."
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-750 rounded-lg px-3 py-2 text-xs outline-none"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#164581] hover:opacity-95 text-white rounded-lg font-bold text-xs cursor-pointer"
                >
                  Register
                </button>
              </form>
            </div>

            {/* Control 2: Map Categories to Nodal Officers */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-805 dark:text-slate-250 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#164581] dark:text-indigo-400" />
                Map Categories to Department Nodal Officers
              </h3>
              <form onSubmit={handleMapCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase">Select Department</label>
                  <select 
                    value={mappingDept}
                    onChange={(e) => setMappingDept(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-150 rounded-lg px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="">Choose Department</option>
                    <option value="pwd">Public Works Department</option>
                    <option value="pdd">Power Development Department</option>
                    <option value="health">Health & Medical Education</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase">Grievance Category</label>
                  <input 
                    type="text"
                    value={mappingCategory}
                    onChange={(e) => setMappingCategory(e.target.value)}
                    placeholder="e.g. Transformer Damage"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-150 rounded-lg px-3 py-2.5 text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase">Nodal Officer Username/ID</label>
                  <input 
                    type="text"
                    value={mappingOfficer}
                    onChange={(e) => setMappingOfficer(e.target.value)}
                    placeholder="e.g. nodal_officer_pwd"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-150 rounded-lg px-3 py-2.5 text-xs outline-none"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[#164581] hover:opacity-95 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Save Mapping
                  </button>
                </div>
              </form>
            </div>

            {/* Control 3: Change SLA timelines */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-805 dark:text-slate-250 uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#164581] dark:text-indigo-400" />
                Change Operational SLA Timelines
              </h3>
              <form onSubmit={handleUpdateSLA} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase">Target Department</label>
                  <select 
                    value={slaDept}
                    onChange={(e) => setSlaDept(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-150 rounded-lg px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="">Choose Department</option>
                    <option value="pwd">Public Works Department</option>
                    <option value="pdd">Power Development Department</option>
                    <option value="health">Health & Medical Education</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-extrabold text-slate-700 uppercase">Resolution Timeline Limit (Days)</label>
                  <input 
                    type="number"
                    value={slaDays}
                    onChange={(e) => setSlaDays(parseInt(e.target.value))}
                    min={1}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-150 rounded-lg px-3 py-2.5 text-xs outline-none"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[#164581] hover:opacity-95 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Update SLA limit
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
