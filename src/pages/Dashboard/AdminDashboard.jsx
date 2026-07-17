import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, CheckCircle2, AlertCircle, RefreshCw, Eye, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import emblemImg from '../../assets/emblem.png';
import grievanceService from '../../services/grievanceService';

export default function AdminDashboard({ user, onLogout }) {
  const [grievances, setGrievances] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, appealed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [actionRemark, setActionRemark] = useState('');
  const [actionStatus, setActionStatus] = useState('Under Review');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await grievanceService.getGrievances();
      setGrievances(data);
      // Compute stats
      const pending = data.filter((g) => g.status !== 'Resolved' && g.status !== 'Rejected').length;
      const resolved = data.filter((g) => g.status === 'Resolved').length;
      const appealed = data.filter((g) => g.windowType === 'Raabita').length;
      setStats({
        total: data.length,
        pending,
        resolved,
        appealed,
      });
    } catch (err) {
      console.error('Error loading administrative data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (grievanceId) => {
    alert(`Status updated successfully for grievance #${grievanceId} to "${actionStatus}" (Mock Action)`);
    setSelectedGrievance(null);
    setActionRemark('');
    loadData();
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 text-slate-800 font-sans select-none animate-fadeIn">
      {/* Admin Subheader Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <img src={emblemImg} alt="Emblem" className="h-10 w-auto" />
          <div className="text-left">
            <h2 className="text-base font-bold text-slate-800 tracking-tight leading-none">Administrative Dashboard</h2>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block mt-1.5">
              Welcome, {user?.name || 'Administrative Officer'}
            </span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-650 font-bold rounded-lg text-xs transition-colors cursor-pointer"
        >
          Logout Session
        </button>
      </header>

      {/* Main Panel Content */}
      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-blue-600 text-white p-5 rounded-xl shadow-sm flex justify-between items-center">
            <div className="text-left space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/95">Total Cases</span>
              <span className="block text-2xl font-black font-mono">{stats.total}</span>
            </div>
            <LayoutDashboard className="h-10 w-10 opacity-30 shrink-0" />
          </div>
          <div className="bg-amber-600 text-white p-5 rounded-xl shadow-sm flex justify-between items-center">
            <div className="text-left space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/95">Active / Pending</span>
              <span className="block text-2xl font-black font-mono">{stats.pending}</span>
            </div>
            <AlertCircle className="h-10 w-10 opacity-30 shrink-0" />
          </div>
          <div className="bg-emerald-600 text-white p-5 rounded-xl shadow-sm flex justify-between items-center">
            <div className="text-left space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/95">Resolved</span>
              <span className="block text-2xl font-black font-mono">{stats.resolved}</span>
            </div>
            <CheckCircle2 className="h-10 w-10 opacity-30 shrink-0" />
          </div>
          <div className="bg-red-600 text-white p-5 rounded-xl shadow-sm flex justify-between items-center">
            <div className="text-left space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-white/95">Appeals Filed</span>
              <span className="block text-2xl font-black font-mono">{stats.appealed}</span>
            </div>
            <ShieldAlert className="h-10 w-10 opacity-30 shrink-0" />
          </div>
        </div>

        {/* Grievances List */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Submitted Citizens Petitions</h3>
            <button 
              onClick={loadData}
              className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-250 rounded-lg text-slate-650 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 uppercase tracking-widest text-[9px] font-extrabold select-none">
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                      Loading grievance repository records...
                    </td>
                  </tr>
                ) : grievances.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                      No citizen grievances recorded.
                    </td>
                  </tr>
                ) : (
                  grievances.map((g) => (
                    <tr key={g.id} className="border-b border-slate-150 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-600">JK-{100000 + g.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{g.department || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-600">{g.grievanceCategory || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-sm truncate">{g.description}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          g.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          g.status === 'Under Review' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {g.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setSelectedGrievance(g)}
                          className="px-3 py-1 bg-gov-blue hover:opacity-90 text-white rounded text-[10px] font-bold flex items-center gap-1 mx-auto cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Modal/Panel for Action taking */}
        {selectedGrievance && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-left flex flex-col">
              <div className="bg-[#164581] text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase">Review Grievance #{100000 + selectedGrievance.id}</h3>
                <button onClick={() => setSelectedGrievance(null)} className="text-white hover:text-slate-200 bg-transparent border-0 cursor-pointer text-sm">✖</button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                <div className="space-y-1">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Description</span>
                  <p className="text-xs text-slate-650 leading-relaxed font-normal bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedGrievance.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Department</span>
                    <span className="font-bold text-slate-700">{selectedGrievance.department || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Category</span>
                    <span className="font-bold text-slate-700">{selectedGrievance.grievanceCategory || 'N/A'}</span>
                  </div>
                </div>

                <hr className="border-slate-150" />

                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-gov-green" />
                    <span>Take Redressal Action</span>
                  </h4>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Set Resolution Status</label>
                    <select 
                      value={actionStatus} 
                      onChange={(e) => setActionStatus(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-350 rounded-lg px-3 py-2 text-xs text-slate-750 outline-none focus:border-[#164581]"
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Official Action Remarks</label>
                    <textarea
                      value={actionRemark}
                      onChange={(e) => setActionRemark(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-355 rounded-lg px-3 py-2 text-xs text-slate-800 h-20 outline-none focus:border-[#164581] resize-none"
                      placeholder="Add official logs or remarks here..."
                    />
                  </div>
                  <button 
                    onClick={() => handleUpdateStatus(selectedGrievance.id)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer border-0 flex items-center justify-center gap-1.5"
                  >
                    <span>Submit Redressal Record</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
