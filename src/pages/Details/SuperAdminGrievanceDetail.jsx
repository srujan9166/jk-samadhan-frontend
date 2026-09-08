import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Paperclip, Clock, ShieldAlert, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';
import grievanceService from '../../services/grievanceService';
import emblemImg from '../../assets/emblem.png';

export default function SuperAdminGrievanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [grievance, setGrievance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAttachmentsDrawer, setShowAttachmentsDrawer] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setErrorMsg('');
      try {
        const data = await grievanceService.getGrievanceById(id);
        if (data) {
          setGrievance(data);
        } else {
          setErrorMsg('Grievance not found.');
        }
      } catch (err) {
        console.error('Error fetching grievance details:', err);
        if (err.response && err.response.status === 403) {
          setErrorMsg('Access Denied: You are not authorized to view this grievance.');
        } else {
          setErrorMsg('Unable to load grievance details. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleDownloadPDF = () => {
    // Generate PDF fallback/action
    window.print();
  };

  const handleViewFeedback = () => {
    alert("Feedback details for this grievance are not available yet.");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="w-12 h-12 border-4 border-blue-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 mt-4 font-bold animate-pulse">Loading grievance details...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 font-sans text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">{errorMsg}</h3>
        <p className="text-xs text-slate-450 mt-2 max-w-sm">Please verify the URL or ensure you have administrative permissions.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer border-0 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!grievance) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 font-sans text-center">
        <h3 className="text-lg font-bold text-slate-800">Grievance not found.</h3>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer border-0"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const hasAttachments = grievance.fileName || grievance.secondFileName || grievance.ackSlipName;

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans p-6 animate-fadeIn relative overflow-x-hidden">
      
      {/* Top Title Bar with Actions */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-lg text-slate-600 dark:text-slate-350 transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-left">
            <h1 className="text-xl font-black text-slate-905 text-slate-900 dark:text-white tracking-tight leading-none">
              Grievance Details
            </h1>
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mt-1.5 font-sans">
              Super Admin Management Module
            </span>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer border-0 shadow-sm flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
          <button
            onClick={handleViewFeedback}
            className="px-4 py-2 bg-purple-650 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer border-0 shadow-sm"
          >
            View Feedback
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Details Panel */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md overflow-hidden relative">
          
          {/* View Attachments Vertical Tab on the Right */}
          <div className="absolute right-0 top-1/3 z-30 translate-x-[45px] hover:translate-x-0 transition-transform duration-300">
            <button
              onClick={() => setShowAttachmentsDrawer(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-4 rounded-l-xl cursor-pointer shadow-lg border-0 flex items-center gap-1.5 -rotate-90 origin-right translate-y-[-50%]"
            >
              <Paperclip className="h-3.5 w-3.5 rotate-90" />
              View Attachments
            </button>
          </div>

          {/* Letterhead Header Section */}
          <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase leading-none font-display">
              Department of Public Grievances
            </h2>
            <p className="text-[10px] text-slate-500 mt-1.5 font-mono">
              website: <span className="underline">samadhan.jk.gov.in</span> | Email: <span className="underline">jk-grievance@jk.gov.in</span>
            </p>
          </div>

          {/* Purple Acknowledgement Banner */}
          <div className="bg-[#6b38fb] py-2.5 text-center text-white font-black text-xs uppercase tracking-widest leading-none">
            Acknowledgement - Online Grievance
          </div>

          {/* Grievance Details Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs select-text">
              <tbody>
                {/* Section Title Header */}
                <tr className="bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
                  <td colSpan={4} className="p-3 font-extrabold text-[#5046e5] dark:text-[#818cf8] uppercase tracking-wider text-[10px]">
                    Grievance Details
                  </td>
                </tr>

                {/* Row 1 */}
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="w-1/4 p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Grievance ID</td>
                  <td className="w-1/4 p-3 font-mono font-bold text-slate-850 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{grievance.uniqId || `GRV2026/${grievance.id}`}</td>
                  <td className="w-1/4 p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Grievance Date</td>
                  <td className="w-1/4 p-3 font-mono text-slate-755 text-slate-700 dark:text-slate-300">{grievance.createdAt ? new Date(grievance.createdAt).toLocaleString('en-GB') : 'N/A'}</td>
                </tr>

                {/* Row 2 */}
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Applicant Name</td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{grievance.citizenName || 'N/A'}</td>
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Mobile No.</td>
                  <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{grievance.citizenPhone || 'N/A'}</td>
                </tr>

                {/* Row 3 */}
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Department:</td>
                  <td className="p-3 font-bold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{grievance.department || 'N/A'}</td>
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Category</td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{grievance.grievanceCategory || 'N/A'}</td>
                </tr>

                {/* Row 4 */}
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Next Level Category:</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{grievance.subCategory || 'NA'}</td>
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Next Level Category:</td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{grievance.subCategoryL2 || '-'}</td>
                </tr>

                {/* Row 5 */}
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Pertain Division</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{grievance.division || 'N/A'}</td>
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Pertain District</td>
                  <td className="p-3 font-semibold text-slate-705 text-slate-700 dark:text-slate-300">{grievance.district || 'N/A'}</td>
                </tr>

                {/* Row 6 */}
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Municipality / Block</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{grievance.municipality || grievance.block || 'N/A'}</td>
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Ward / Panchayat</td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{grievance.ward || grievance.panchayat || 'N/A'}</td>
                </tr>

                {/* Row 7 */}
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Email ID</td>
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{grievance.emailId || 'N/A'}</td>
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Address</td>
                  <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={grievance.address}>{grievance.address || 'N/A'}</td>
                </tr>

                {/* Row 8 */}
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Latitude</td>
                  <td className="p-3 font-mono border-r border-slate-200 dark:border-slate-800">{grievance.latitude || 'N/A'}</td>
                  <td className="p-3 bg-slate-50/50 dark:bg-slate-850/50 font-bold text-slate-500 border-r border-slate-200 dark:border-slate-800">Longitude</td>
                  <td className="p-3 font-mono">{grievance.longitude || 'N/A'}</td>
                </tr>

                {/* Description sections */}
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td colSpan={4} className="p-4 bg-white dark:bg-slate-900">
                    <div className="font-extrabold text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-wide text-[10px]">
                      Grievance Description:
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 break-words whitespace-pre-wrap">
                      {grievance.description}
                    </div>
                  </td>
                </tr>

                {/* Appeal Description Section */}
                <tr>
                  <td colSpan={4} className="p-4 bg-white dark:bg-slate-900">
                    <div className="font-extrabold text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-wide text-[10px]">
                      Appeal Description:
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/30 p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 break-words whitespace-pre-wrap">
                      {grievance.appealDescription || 'No appeal filed yet for this grievance.'}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Grievance History section */}
        <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-md overflow-hidden mt-2">
          <div className="bg-slate-800 text-white px-5 py-3.5 flex items-center gap-2 border-b border-slate-700 shadow-sm">
            <Clock className="h-4 w-4 text-blue-400" />
            <h3 className="font-extrabold text-[11px] uppercase tracking-widest text-slate-100">Grievance History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs select-text">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider">
                  <th className="p-3 text-center border-r border-slate-200 dark:border-slate-800">S.No</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Grievance ID</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Action By</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Date / Time of Action</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Action Taken</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Remarks</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Privilege Assign</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Department</th>
                  <th className="p-3 border-r border-slate-200 dark:border-slate-800">Status</th>
                  <th className="p-3">Action Taken Time(days)</th>
                </tr>
              </thead>
              <tbody>
                {grievance.history && grievance.history.length > 0 ? (
                  grievance.history.map((h, idx) => (
                    <tr 
                      key={h.id || idx} 
                      className="border-b border-slate-150 dark:border-slate-855 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                    >
                      <td className="p-3 text-center font-bold border-r border-slate-200 dark:border-slate-800">{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-205 border-r border-slate-200 dark:border-slate-800">{h.uniqId}</td>
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold">{h.actionBy}</td>
                      <td className="p-3 font-mono text-[10px] border-r border-slate-200 dark:border-slate-800">{h.dateTimeOfAction ? new Date(h.dateTimeOfAction).toLocaleString('en-GB') : 'N/A'}</td>
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800">{h.actionTaken}</td>
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800 whitespace-pre-wrap max-w-[240px] leading-relaxed break-words">{h.remarks || '-'}</td>
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800">{h.privilegeAssign || 'Normal'}</td>
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-semibold">{h.department}</td>
                      <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${
                          h.status === 'Resolved' || h.status === 'Closed'
                            ? 'bg-green-105 bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300' 
                            : h.status === 'Pending' || h.status === 'Registered'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300' 
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-center">{h.actionTakenTimeDays}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-slate-400 font-medium font-mono">No actions registered in timeline history.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-out Overlay Drawer for Attachments */}
      {showAttachmentsDrawer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
          {/* Click outside to close */}
          <div className="flex-1 cursor-pointer" onClick={() => setShowAttachmentsDrawer(false)}></div>
          
          <div className="w-80 bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col p-6 animate-slideIn">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-blue-500" />
                <span>Supporting Files</span>
              </h3>
              <button 
                onClick={() => setShowAttachmentsDrawer(false)}
                className="text-slate-400 hover:text-slate-650 bg-transparent border-0 cursor-pointer font-bold text-base"
              >
                ✖
              </button>
            </div>

            <div className="flex-1 space-y-4 text-left overflow-y-auto">
              {hasAttachments ? (
                <>
                  {grievance.fileName && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-2">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Citizen File 1</span>
                      <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate" title={grievance.fileName}>
                        {grievance.fileName}
                      </p>
                      {grievance.filePath && (
                        <a 
                          href={`/${grievance.filePath}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-extrabold hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> View Uploaded File
                        </a>
                      )}
                    </div>
                  )}

                  {grievance.secondFileName && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-2">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Citizen File 2</span>
                      <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate" title={grievance.secondFileName}>
                        {grievance.secondFileName}
                      </p>
                      {grievance.secondFilePath && (
                        <a 
                          href={`/${grievance.secondFilePath}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-extrabold hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> View Uploaded Media
                        </a>
                      )}
                    </div>
                  )}

                  {grievance.ackSlipName && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-lg border border-slate-100 dark:border-slate-800/80 space-y-2">
                      <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Acknowledgement Slip</span>
                      <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate" title={grievance.ackSlipName}>
                        {grievance.ackSlipName}
                      </p>
                      {grievance.ackSlipPath && (
                        <a 
                          href={`/${grievance.ackSlipPath}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-extrabold hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Download Slip
                        </a>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-center gap-2">
                  <HelpCircle className="h-8 w-8 text-slate-300" />
                  <p className="text-[11px] font-bold">No documents or media uploaded for this grievance.</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowAttachmentsDrawer(false)}
              className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer border-0"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
