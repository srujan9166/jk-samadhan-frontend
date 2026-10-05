import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleRedirectPath } from '../routes/RoleRedirectGuard';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout, checkSession } = useAuth();

  useEffect(() => {
    sessionStorage.removeItem('samadhan_lastVisitedPath');
  }, []);

  const handleReturnHome = async () => {
    sessionStorage.removeItem('samadhan_lastVisitedPath');
    if (checkSession) {
      await checkSession();
    }
    const destination = getRoleRedirectPath(user);
    navigate(destination, { replace: true });
  };

  const handleLogoutClick = () => {
    sessionStorage.removeItem('samadhan_lastVisitedPath');
    if (logout) logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xl">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">
          Access Restricted
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
          You do not have the required role permissions to access this page or resource on J&K Samadhan.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleReturnHome}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-indigo-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to My Authorized Dashboard
          </button>

          <button
            onClick={handleLogoutClick}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            Sign Out / Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
