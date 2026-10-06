import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Single Shell Layout (Mirrors JK Revenue Sidebar.tsx / AuthenticatedLayout)
 * 
 * Provides the unified layout container for all authenticated role branches.
 * All role routes (/superAdmin, /monitoringCell, /rmc, /dm, /dept, /dealingHand, /appellate, /citizen)
 * are nested inside this shell and render their active page through <Outlet />.
 */
export default function DashboardShell({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4 select-none">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400 animate-pulse">
            Loading Authenticated Portal...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div id="samadhan-app-shell" className="min-h-screen flex flex-col w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div id="content" className="flex-1 w-full max-w-full flex flex-col overflow-hidden">
        {children ? children : <Outlet />}
      </div>
    </div>
  );
}
