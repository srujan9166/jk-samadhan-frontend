import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ThumbsUp, 
  AlertCircle, 
  RefreshCw, 
  MapPin,
  TrendingUp
} from 'lucide-react';
import emblemImg from '../../assets/emblem.png';
import grievanceService from '../../services/grievanceService';

export default function DMDashboard({ user, onLogout }) {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, efficiency: '0%' });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await grievanceService.getGrievances();
      // Filter by DM district if user has district specified, otherwise show all
      const userDistrict = user?.district || 'Srinagar';
      const districtCases = data.filter(g => 
        g.district?.toLowerCase() === userDistrict.toLowerCase() ||
        g.pertainDistrict?.toLowerCase() === userDistrict.toLowerCase()
      );
      
      const casesToCalc = districtCases.length > 0 ? districtCases : data;
      setGrievances(casesToCalc);
      
      const total = casesToCalc.length;
      const pending = casesToCalc.filter(g => g.status === 'Pending' || g.status === 'Under Review').length;
      const resolved = casesToCalc.filter(g => g.status === 'Resolved').length;
      const efficiency = total > 0 ? `${Math.round((resolved / total) * 100)}%` : '100%';

      setStats({ total, pending, resolved, efficiency });
    } catch (err) {
      console.error('Error loading DM dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const filtered = grievances.filter(g => {
    const query = searchQuery.toLowerCase();
    return (
      g.id?.toString().includes(query) ||
      g.department?.toLowerCase().includes(query) ||
      g.grievanceCategory?.toLowerCase().includes(query) ||
      g.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans select-none animate-fadeIn text-xs">
      
      {/* Dashboard Subheader */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <img src={emblemImg} alt="Emblem" className="h-10 w-auto" />
          <div className="text-left font-sans">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">District Magistrate Dashboard</h2>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block mt-1.5 font-sans">
              District: {user?.district || 'Srinagar'} | Welcome, {user?.name || 'District Magistrate'}
            </span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-2 border border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-955/20 text-red-655 dark:text-red-400 font-bold rounded-lg text-xs transition-colors cursor-pointer"
        >
          Logout Session
        </button>
      </header>

      {/* Main Grid */}
      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full text-left">
        
        {/* Metric widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1e40af] text-white p-5 rounded-xl shadow-xs flex justify-between items-center">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/90">District Grievances</span>
              <span className="block text-2xl font-black font-mono">{stats.total}</span>
            </div>
            <MapPin className="h-9 w-9 opacity-35" />
          </div>
          <div className="bg-[#b45309] text-white p-5 rounded-xl shadow-xs flex justify-between items-center">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/90">Pending Cases</span>
              <span className="block text-2xl font-black font-mono">{stats.pending}</span>
            </div>
            <AlertCircle className="h-9 w-9 opacity-35" />
          </div>
          <div className="bg-[#15803d] text-white p-5 rounded-xl shadow-xs flex justify-between items-center">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/90">Resolved Cases</span>
              <span className="block text-2xl font-black font-mono">{stats.resolved}</span>
            </div>
            <ThumbsUp className="h-9 w-9 opacity-35" />
          </div>
          <div className="bg-[#0d9488] text-white p-5 rounded-xl shadow-xs flex justify-between items-center">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/90">Resolution Rate</span>
              <span className="block text-2xl font-black font-mono">{stats.efficiency}</span>
            </div>
            <TrendingUp className="h-9 w-9 opacity-35" />
          </div>
        </div>

        {/* DataTable Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-205 uppercase tracking-wider">District Grievance Log</h3>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <span className="text-slate-550 dark:text-slate-400 font-bold mr-2">Search:</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded px-2.5 py-1 text-xs outline-none focus:border-indigo-650 text-slate-850 dark:text-slate-100"
                  placeholder="Filter cases..."
                />
              </div>
              <button 
                onClick={loadData}
                className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-250 dark:border-slate-700 rounded-lg text-slate-655 dark:text-slate-300 cursor-pointer"
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
                  <th className="px-6 py-3.5">Complainant</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">GIS Coordinate</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">Loading district data...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">No grievances filed in this district.</td>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <tr key={g.id} className="border-b border-slate-150 dark:border-slate-855 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-600 dark:text-slate-400">JK-{100000 + g.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{g.submittedBy?.name || 'Citizen'}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{g.department || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{g.grievanceCategory || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          g.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900' :
                          g.status === 'Pending' ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900' :
                          'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900'
                        }`}>
                          {g.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {g.latitude && g.longitude ? `${g.latitude}, ${g.longitude}` : '34.0837, 74.7973'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
