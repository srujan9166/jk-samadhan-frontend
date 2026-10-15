import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleBaseUrl, ROLE_DASHBOARDS } from '../config/dashboardConfig';

export { ROLE_DASHBOARDS };

export const getRoleRedirectPath = (user) => {
  return '/dashboard';
};

export function RoleRedirectGuard({ children }) {
  const { isLoggedIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    // Authenticated users on landing/login page always land on /dashboard
    if (isLoggedIn && user && (location.pathname === '/' || location.pathname === '/login')) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, user, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4 select-none">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400 animate-pulse">
            Verifying Portal Session...
          </span>
        </div>
      </div>
    );
  }

  if (isLoggedIn && (location.pathname === '/' || location.pathname === '/login')) {
    return null;
  }

  return <>{children}</>;
}
