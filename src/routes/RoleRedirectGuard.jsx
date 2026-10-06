import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleBaseUrl, ROLE_DASHBOARDS } from '../config/dashboardConfig';

export { ROLE_DASHBOARDS };

export const getRoleRedirectPath = (user) => {
  if (!user) return '/';
  // Redirect to role-prefixed base URL (e.g. /superAdmin, /dept, /citizen) like JK Revenue
  return getRoleBaseUrl(user);
};

export function RoleRedirectGuard({ children }) {
  const { isLoggedIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Store last visited path in sessionStorage when navigating
  useEffect(() => {
    if (isLoggedIn && user && location.pathname !== '/' && !['/login', '/register', '/unauthorized'].includes(location.pathname)) {
      sessionStorage.setItem('samadhan_lastVisitedPath', location.pathname);
    }
  }, [location.pathname, isLoggedIn, user]);

  useEffect(() => {
    if (isLoading) return;

    if (isLoggedIn && user && (location.pathname === '/' || location.pathname === '/login')) {
      const storedLast = sessionStorage.getItem('samadhan_lastVisitedPath');
      let lastPath = storedLast;
      if (
        !lastPath ||
        lastPath === '/unauthorized' || 
        lastPath === '/login' || 
        lastPath === '/' || 
        lastPath === '/dashboard' ||
        lastPath.startsWith('/super-admin') ||
        lastPath.startsWith('/monitoring-cell') ||
        lastPath.startsWith('/department') ||
        lastPath.startsWith('/dealing-hand')
      ) {
        sessionStorage.removeItem('samadhan_lastVisitedPath');
        lastPath = null;
      }
      const defaultDashboard = getRoleRedirectPath(user);
      const redirectTo = (lastPath && lastPath !== '/') ? lastPath : defaultDashboard;
      navigate(redirectTo, { replace: true });
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
