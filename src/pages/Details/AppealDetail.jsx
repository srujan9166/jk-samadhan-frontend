import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  History,
  CornerUpRight,
  Bookmark
} from 'lucide-react';
import grievanceService from '../../services/grievanceService';
import emblemImg from '../../assets/emblem.png';

export default function AppealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appeal, setAppeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const data = await grievanceService.getGrievanceById(id);
        if (data) {
          setAppeal(data);
        } else {
          setAppeal({
            id,
            uniqId: `APL2026/${100000 + parseInt(id)}`,
            prevRefNum: 'JK-2384918-2026',
            description: 'My original grievance regarding dirty drinking water was marked resolved by the local municipal team. However, the water coming out of our taps is still muddy and smells bad. Seeking escalation.',
            status: 'Appealed',
            origin: 'RAABITA',
            psga: 'No',
            submittedBy: {
              name: 'Srujan Rallabandi',
              mobile: '9876543210',
              email: 'srujan@example.com',
              address: 'House No 12, Sector C, Srinagar'
            },
            district: { name: 'Srinagar' },
            category: { name: 'Contaminated Water' },
            department: { name: 'Jal Shakti (PHE) Department' },
            createdAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Failed to load appeal details:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="w-10 h-10 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-450 mt-4 font-bold">Loading Appeal Detail Record...</p>
      </div>
    );
  }

  if (!appeal) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 font-sans">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-sm font-bold text-slate-750 dark:text-slate-200 mt-3">Appeal Record Not Found</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 px-4 py-2 bg-indigo-650 text-white rounded-lg text-xs font-bold cursor-pointer">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const timeline = [
    { id: 1, action: 'Appeal Filed', remark: 'Appealed against closing resolution. Reason: Issue persists.', updatedBy: 'Srujan Rallabandi (Petitioner)', timestamp: appeal.createdAt },
  ];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans select-none animate-fadeIn text-xs">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors cursor-pointer border-0 bg-transparent"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img src={emblemImg} alt="Emblem" className="h-10 w-auto" />
          <div className="text-left font-sans">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              Appeal Details - {appeal.uniqId || `APL-${appeal.id}`}
            </h2>
            <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-widest block mt-1.5">
              Associated Grievance: {appeal.prevRefNum || 'N/A'}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate(`/process-grievance/${appeal.id}`)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-650 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer border-0 inline-flex items-center gap-2 shadow-sm"
        >
          <CornerUpRight className="h-3.5 w-3.5" />
          Take Appellate Action
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-250 uppercase border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Bookmark className="h-4.5 w-4.5 text-indigo-500" />
              Appeal Explanation
            </h3>
            <p className="text-slate-650 dark:text-slate-300 leading-relaxed text-xs">
              {appeal.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-450">Department</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{appeal.department?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-450">Category</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{appeal.category?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-450">District / Location</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {appeal.district?.name || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-450">Original Case Reference</span>
                <span className="font-bold text-indigo-650 dark:text-indigo-400">{appeal.prevRefNum || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm text-center">
            <div className="flex justify-center text-indigo-650 mb-3">
              <Clock className="h-10 w-10 text-indigo-500" />
            </div>
            <h4 className="text-[10px] uppercase font-black text-slate-450 tracking-wider">Appeal Status</h4>
            <span className="block text-lg font-black text-slate-800 dark:text-slate-100 mt-1">{appeal.status}</span>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
              <div className="bg-amber-500 h-full w-1/4 rounded-full"></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-250 uppercase border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-indigo-500" />
              Timeline / Actions
            </h3>
            
            <div className="relative border-l-2 border-indigo-100 dark:border-indigo-950/60 pl-4 ml-2 space-y-6">
              {timeline.map((log) => (
                <div key={log.id} className="relative">
                  <span className="absolute -left-[23px] top-1 bg-white dark:bg-slate-900 border-2 border-indigo-600 rounded-full h-3 w-3"></span>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{log.action}</span>
                    <span className="text-slate-450">{new Date(log.timestamp).toLocaleDateString('en-GB')}</span>
                  </div>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1">{log.remark}</p>
                  <span className="block text-[9px] text-slate-450 font-bold mt-1">By: {log.updatedBy}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
