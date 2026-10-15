import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Sun,
  Moon,
  KeyRound,
  Play,
  FileText
} from 'lucide-react';
import emblemImg from '../../assets/emblem.png';

/**
 * Common Reusable DashboardHeader Component
 * 
 * Used uniformly across all authenticated roles.
 * Displays emblem, portal title, role badge, theme toggle, and profile dropdown.
 */
export default function DashboardHeader({
  user,
  role,
  roleTitle,
  onLogout,
  onToggleSidebar,
  sidebarCollapsed,
  onOpenChangePassword,
  onLmsClick,
  className = ''
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLmsOpen, setIsLmsOpen] = useState(false);
  const profileRef = useRef(null);
  const lmsRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (lmsRef.current && !lmsRef.current.contains(e.target)) {
        setIsLmsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const userName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || 'Authenticated Officer';
  const userEmail = user?.email || user?.mobile || user?.username || '';
  const userDistrict = user?.district || 'Jammu & Kashmir';

  return (
    <header className={`h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between px-4 z-40 sticky top-0 shrink-0 select-none ${className}`}>
      {/* Left: Brand + Emblem + Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer border-0 bg-transparent transition-colors"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <img src={emblemImg} className="h-9 w-auto object-contain shrink-0" alt="Emblem of J&K" />

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-[#164581] dark:text-blue-400 leading-none">
              J&K Samadhan
            </span>
            <span className="bg-[#f06e30] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full scale-90">
              3.0
            </span>
          </div>
          <span className="text-[7.5px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5 leading-none">
            Government of Jammu & Kashmir
          </span>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1.5 hidden sm:block"></div>

        {/* Role Title Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {roleTitle || role || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-2">
        {/* LMS Videos Guide (if handler provided) */}
        {onLmsClick && (
          <div className="relative" ref={lmsRef}>
            <button
              type="button"
              onClick={() => setIsLmsOpen(!isLmsOpen)}
              className="flex items-center gap-1.5 bg-[#1f2e42] hover:bg-[#182535] text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors shadow-2xs border-0"
            >
              <div className="flex items-center justify-center bg-red-600 rounded-full p-0.5 shrink-0">
                <Play className="h-2 w-2 text-white fill-current translate-x-[0.5px]" />
              </div>
              <span className="hidden md:inline">Tutorials</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>

            {isLmsOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 text-left">
                <button
                  type="button"
                  onClick={() => { setIsLmsOpen(false); onLmsClick('login'); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-transparent border-0"
                >
                  How to Lodge Grievance
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLmsOpen(false); onLmsClick('register'); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-transparent border-0"
                >
                  How to Track Status
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Profile Dropdown */}
        <div className="relative border-l border-slate-200 dark:border-slate-800 pl-2 ml-1" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold py-1 transition-colors cursor-pointer border-0 bg-transparent"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-[#164581] dark:text-blue-300 flex items-center justify-center font-bold border border-blue-200 dark:border-blue-800 shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-extrabold max-w-[140px] truncate leading-tight">
                {userName}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold truncate leading-none">
                {userDistrict}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 opacity-60 text-slate-500" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-left">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  Signed In As ({role})
                </span>
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                  {userEmail || userName}
                </span>
              </div>

              {onOpenChangePassword && (
                <button
                  type="button"
                  onClick={() => { setIsProfileOpen(false); onOpenChangePassword(); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer bg-transparent border-0 flex items-center gap-2"
                >
                  <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                  <span>Change Password</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => { setIsProfileOpen(false); onLogout(); }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer bg-transparent border-0 flex items-center gap-2 mt-1 border-t border-slate-100 dark:border-slate-800"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
