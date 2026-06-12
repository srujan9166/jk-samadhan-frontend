import React, { useState } from 'react';
import { X, Search, FileCheck, Clock, UserCheck, CheckCircle2, ShieldAlert, CornerDownRight, ArrowRight } from 'lucide-react';

export default function TrackModal({ isOpen, onClose, initialRefNum = '' }) {
  const [refNum, setRefNum] = useState(initialRefNum);
  const [searchTriggered, setSearchTriggered] = useState(initialRefNum !== '');
  const [grievanceData, setGrievanceData] = useState(null);
  const [error, setError] = useState('');

  // Sample static database for testing
  const mockGrievances = {
    'JK-482019-2026': {
      ref: 'JK-482019-2026',
      name: 'Bashir Ahmad Bhat',
      date: 'May 12, 2026',
      department: 'Jal Shakti (PHE) Department',
      category: 'Water Scarcity',
      subject: 'Frequent drinking water supply shortage in Bemina Ward 5',
      status: 'Resolved',
      statusStep: 4,
      timeline: [
        { title: 'Grievance Submitted', date: 'May 12, 2026 10:15 AM', desc: 'Registered successfully online. Forwarded to Nodal Officer.', completed: true },
        { title: 'Department Review', date: 'May 13, 2026 02:30 PM', desc: 'Assigned to Assistant Executive Engineer (AEE), Sub-division Bemina.', completed: true },
        { title: 'Action Taken', date: 'May 16, 2026 11:00 AM', desc: 'Site inspection completed. Pipeline leakage repaired, normal supply restored.', completed: true },
        { title: 'Resolution & Feedback', date: 'May 18, 2026 04:15 PM', desc: 'Case closed. Satisfaction verified by complainant.', completed: true }
      ]
    },
    'JK-992011-2026': {
      ref: 'JK-992011-2026',
      name: 'Sunita Sharma',
      date: 'June 01, 2026',
      department: 'Power Development Department (PDD)',
      category: 'Faulty Transformer',
      subject: 'Transformer failure in Channi Himmat Colony Sector 3',
      status: 'Under Review',
      statusStep: 2,
      timeline: [
        { title: 'Grievance Submitted', date: 'June 01, 2026 08:30 AM', desc: 'Registered successfully. Sent to PDD Nodal Cell.', completed: true },
        { title: 'Department Review', date: 'June 02, 2026 09:45 AM', desc: 'Acknowledged and assigned to Division Office Jammu for estimation.', completed: true },
        { title: 'Action in Progress', date: '', desc: 'Procurement voucher initiated for replacement transformer unit.', completed: false },
        { title: 'Resolution & Feedback', date: '', desc: 'Awaiting installation and citizen validation.', completed: false }
      ]
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      setRefNum(initialRefNum);
      setSearchTriggered(initialRefNum !== '');
      setGrievanceData(null);
      setError('');
      if (initialRefNum) {
        handleSearch(initialRefNum);
      }
    }
  }, [isOpen, initialRefNum]);

  const handleSearch = (codeToSearch = refNum) => {
    setError('');
    const code = codeToSearch.trim().toUpperCase();
    if (!code) {
      setError('Please enter a reference number');
      setGrievanceData(null);
      return;
    }

    // Standard regex check for formatting (allow some flexibility)
    if (!code.startsWith('JK-')) {
      setError('Reference number must start with "JK-"');
      setGrievanceData(null);
      return;
    }

    setSearchTriggered(true);

    if (mockGrievances[code]) {
      setGrievanceData(mockGrievances[code]);
    } else {
      // Generate dynamic mock case for custom entries
      setGrievanceData({
        ref: code,
        name: 'Citizen User',
        date: 'June 05, 2026',
        department: 'Public Works Department (R&B)',
        category: 'Road Repair',
        subject: 'Pothole repair request on main arterial road',
        status: 'Submitted',
        statusStep: 1,
        timeline: [
          { title: 'Grievance Submitted', date: 'June 05, 2026 11:30 AM', desc: 'Registered online. Forwarded to department Nodal Officer.', completed: true },
          { title: 'Department Review', date: '', desc: 'Awaiting assignment to Field Engineer.', completed: false },
          { title: 'Action Taken', date: '', desc: 'Pending inspection.', completed: false },
          { title: 'Resolution & Feedback', date: '', desc: 'Awaiting solution.', completed: false }
        ]
      });
    }
  };

  const handleDemoSelect = (code) => {
    setRefNum(code);
    handleSearch(code);
  };



  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto motion-modal-overlay ${
      isOpen
        ? 'opacity-100 pointer-events-auto bg-slate-900/60 backdrop-blur-sm visible'
        : 'opacity-0 pointer-events-none bg-transparent backdrop-blur-none invisible'
    }`}>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden motion-modal-content transform flex flex-col max-h-[90vh] ${
        isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
      }`}>
        {/* Header */}
        <div className="bg-gov-blue text-white px-6 py-4 flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gov-saffron via-white to-gov-green"></div>
          <div className="flex items-center gap-3 mt-1">
            <Search className="h-6 w-6 text-gov-saffron" />
            <div>
              <h3 className="font-display font-semibold text-lg">Track Grievance Status</h3>
              <p className="text-xs text-slate-300">View live timeline and action logs of your submitted cases</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Input Box */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Enter Grievance Reference Number</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={refNum}
                  onChange={(e) => setRefNum(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full rounded-lg border border-slate-300 focus:border-gov-blue-medium pl-3 pr-8 py-2.5 text-sm uppercase font-mono outline-none tracking-wider transition-all"
                  placeholder="e.g. JK-482019-2026" 
                />
                {refNum && (
                  <button onClick={() => setRefNum('')} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => handleSearch()}
                className="px-5 py-2.5 bg-gov-blue text-white rounded-lg font-semibold text-sm hover:bg-gov-blue-medium transition-all shadow-sm flex items-center gap-1.5"
              >
                Search
              </button>
            </div>
            {error && <p className="text-xs text-red-500 flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5" /> {error}</p>}
          </div>

          {/* Quick Demos */}
          {!searchTriggered && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Click a Demo Code to Test Tracking</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button 
                  onClick={() => handleDemoSelect('JK-482019-2026')}
                  className="text-left bg-white border border-slate-200 hover:border-gov-blue-medium hover:shadow-sm p-3 rounded-lg text-xs transition-all flex flex-col justify-between"
                >
                  <span className="font-mono font-bold text-gov-blue">JK-482019-2026</span>
                  <span className="text-slate-500 mt-1">Bemina Water Shortage</span>
                  <span className="mt-2 inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">Resolved</span>
                </button>
                <button 
                  onClick={() => handleDemoSelect('JK-992011-2026')}
                  className="text-left bg-white border border-slate-200 hover:border-gov-blue-medium hover:shadow-sm p-3 rounded-lg text-xs transition-all flex flex-col justify-between"
                >
                  <span className="font-mono font-bold text-gov-blue">JK-992011-2026</span>
                  <span className="text-slate-500 mt-1">Channi Himmat Transformer</span>
                  <span className="mt-2 inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">Under Review</span>
                </button>
              </div>
            </div>
          )}

          {/* Grievance Details Output */}
          {searchTriggered && grievanceData && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-start gap-4">
                <div>
                  <h4 className="font-mono font-bold text-base text-gov-blue">{grievanceData.ref}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Submitted on {grievanceData.date} by {grievanceData.name}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  grievanceData.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  grievanceData.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                  {grievanceData.status}
                </span>
              </div>

              {/* Summary Details */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Department: </span>
                  <span className="font-semibold text-slate-700">{grievanceData.department}</span>
                </div>
                <div>
                  <span className="text-slate-400">Category: </span>
                  <span className="font-semibold text-slate-700">{grievanceData.category}</span>
                </div>
                <div>
                  <span className="text-slate-400">Subject: </span>
                  <span className="font-semibold text-slate-700">{grievanceData.subject}</span>
                </div>
              </div>

              {/* Timeline (Stepper) */}
              <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 ml-3">
                {grievanceData.timeline.map((step, idx) => (
                  <div key={idx} className="relative group">
                    {/* Circle Node */}
                    <div className={`absolute -left-[25px] top-1.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
                      step.completed ? 'border-gov-blue-medium bg-gov-blue-medium text-white shadow-sm' : 'border-slate-300 bg-white'
                    }`}>
                      {step.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>

                    {/* Step Content */}
                    <div className="pl-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                        <h5 className={`text-sm font-semibold ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</h5>
                        {step.date && <span className="text-[10px] text-slate-400 font-mono mt-0.5 sm:mt-0">{step.date}</span>}
                      </div>
                      <p className={`text-xs mt-0.5 ${step.completed ? 'text-slate-600' : 'text-slate-400 font-normal'}`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchTriggered && !grievanceData && !error && (
            <div className="text-center py-6 text-slate-500 text-sm">
              No matching records found. Please double check the code.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center text-xs text-slate-500">
          <span>Need help? Call the toll-free helpline: <strong>14430</strong></span>
          <button 
            onClick={() => {
              setSearchTriggered(false);
              setGrievanceData(null);
              setRefNum('');
            }}
            className="text-gov-blue-light hover:text-gov-blue font-semibold flex items-center gap-0.5"
          >
            Clear Search <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
