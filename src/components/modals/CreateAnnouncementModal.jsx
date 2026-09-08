import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function CreateAnnouncementModal({ isOpen, onClose, onSuccess }) {
  const [to, setTo] = useState('ALL (Registered Citizens & Departments)');
  const [validTill, setValidTill] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get current datetime string for min attribute in datetime-local (yyyy-MM-ddTHH:mm)
  const getCurrentMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (isOpen) {
      // Load departments for the recipient dropdown
      axiosClient.get('/api/masters/departments')
        .then((res) => {
          if (Array.isArray(res.data)) {
            setDepartments(res.data);
          }
        })
        .catch(() => {
          // ignore or fallback
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!['.pdf', '.jpg', '.jpeg', '.png'].includes(ext)) {
        setError('Only JPEG, JPG, PNG, and PDF files are allowed.');
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must not exceed 10 MB.');
        setSelectedFile(null);
        e.target.value = '';
        return;
      }
      setError('');
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!to || !to.trim()) {
      setError('Please select a recipient (To).');
      return;
    }

    if (!announcement || !announcement.trim()) {
      setError('Please enter announcement text.');
      return;
    }

    if (validTill) {
      const validDate = new Date(validTill);
      if (validDate < new Date()) {
        setError('Valid Till date cannot be in the past.');
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('announcement', announcement);
      if (validTill) {
        formData.append('validTill', validTill);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await axiosClient.post('/api/super-admin/announcements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Announcement created successfully.');
      setTimeout(() => {
        // Reset form
        setTo('ALL (Registered Citizens & Departments)');
        setValidTill('');
        setAnnouncement('');
        setSelectedFile(null);
        setSuccess('');
        setError('');
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      const apiErr = err.response?.data?.error || err.response?.data?.message || 'Failed to create announcement. Please try again.';
      setError(apiErr);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden text-left flex flex-col font-sans">
        
        {/* Modal Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-extrabold text-base tracking-wide text-[#8C39F9]">Create Announcement</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer p-1 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Success Banner */}
          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-bold rounded-lg animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs text-red-800 dark:text-red-300 font-bold rounded-lg animate-fadeIn">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. To */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              To
            </label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#8C39F9]"
            >
              <option value="ALL (Registered Citizens & Departments)">ALL (Registered Citizens & Departments)</option>
              <option value="PUBLIC">Public (Citizens)</option>
              <option value="ALL DEPARTMENTS">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id || dept.name} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Announcement Valid Till */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Announcement Valid Till
            </label>
            <input
              type="datetime-local"
              value={validTill}
              min={getCurrentMinDateTime()}
              onChange={(e) => setValidTill(e.target.value)}
              disabled={loading}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#8C39F9]"
            />
          </div>

          {/* 3. Attach Document if any */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Attach Document if any
            </label>
            <input
              type="file"
              accept="application/pdf, image/jpeg, image/jpg, image/png"
              onChange={handleFileChange}
              disabled={loading}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
            />
            <span className="block text-red-500 font-bold text-[11px] mt-1">JPEG/JPG/PNG/PDF</span>
          </div>

          {/* 4. Announcement */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Announcement
            </label>
            <textarea
              rows={3}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Type an announcement"
              disabled={loading}
              className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#8C39F9]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#8C39F9] hover:bg-[#7a2ce0] text-white font-extrabold rounded-lg text-xs border-0 cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Announcement</span>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-[#212529] hover:bg-[#1a1e21] text-white font-extrabold rounded-lg text-xs border-0 cursor-pointer transition-all"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
