import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ROLE_REDIRECT_MAP = {
  ROLE_SUPERADMIN: '/super-admin',
  SUPERADMIN: '/super-admin',
  ROLE_RAABITA_HEAD: '/super-admin',
  RAABITA_HEAD: '/super-admin',
  ROLE_RMC_HEAD: '/super-admin',
  RMC_HEAD: '/super-admin',
  ROLE_RMC_USER: '/super-admin',
  RMC_USER: '/super-admin',
  ROLE_RMC: '/super-admin',
  RMC: '/super-admin',
  RAABITA: '/super-admin',
  ROLE_DEALINGHAND: '/super-admin',
  DEALINGHAND: '/super-admin',
  DEALING_HAND: '/super-admin',
  ROLE_MONITORING_CELL: '/monitoring-cell',
  MONITORING_CELL: '/monitoring-cell',
  ROLE_DEPT_ADMIN: '/department',
  DEPT_ADMIN: '/department',
  ROLE_DEPARTMENT: '/department',
  DEPARTMENT: '/department',
  OFFICER: '/department',
  ROLE_DM: '/dm',
  DM: '/dm',
  ROLE_APPELLATE: '/appellate',
  APPELLATE: '/appellate',
  ROLE_CITIZEN: '/citizen',
  CITIZEN: '/citizen',
};

export const getRoleRedirectPath = (user) => {
  if (!user) return '/';
  
  const role = (user.role || '').toUpperCase();
  const email = (user.email || '').toLowerCase();
  const username = (user.username || '').toLowerCase();

  // Explicit Citizen / Standard User check FIRST
  if (
    role === 'CITIZEN' || 
    role === 'ROLE_CITIZEN' || 
    role === 'USER' || 
    role === 'ROLE_USER' || 
    role === 'CITIZEN_USER' || 
    role === 'ROLE_CITIZEN_USER' || 
    role === 'PUBLIC' || 
    role === 'ROLE_PUBLIC' || 
    role.includes('CITIZEN') ||
    role.includes('USER') ||
    !role
  ) {
    return '/citizen';
  }

  // Role resolution hierarchy for official roles
  if (role === 'ROLE_SUPERADMIN' || role === 'SUPERADMIN' || email.includes('superadmin') || username.includes('superadmin') || role === 'SECRETARY' || role === 'ROLE_SECRETARY' || role === 'ROLE_RAABITA_HEAD' || role === 'RAABITA_HEAD' || role === 'ROLE_RMC_HEAD' || role === 'RMC_HEAD' || role === 'RAABITAHEAD' || role === 'RMCHEAD' || role.includes('RAABITA') || role.includes('RMC') || email.includes('raabita') || username.includes('raabita') || username.includes('rmc') || role.includes('DEALING') || email.includes('dealing') || username.includes('dealing')) {
    return '/super-admin';
  }
  if (role === 'ROLE_MONITORING_CELL' || role === 'MONITORING_CELL' || email.includes('monitor') || username.includes('monitor')) {
    return '/monitoring-cell';
  }
  if (role.includes('ADMIN') || email.includes('admin') || username.includes('admin')) {
    return '/department';
  }
  if (role === 'APPELLATE' || role === 'ROLE_APPELLATE' || role === 'ROLE_APPELLATE_AUTHORITY') {
    return '/appellate';
  }
  if (role === 'DM' || role === 'ROLE_DM' || role === 'ROLE_DISTRICT_MAGISTRATE') {
    return '/dm';
  }
  if (role === 'OFFICER' || role === 'DEPARTMENT' || role === 'ROLE_DEPARTMENT' || role === 'ROLE_DEPARTMENT_NODAL') {
    return '/department';
  }
  if (role === 'DEALINGHAND' || role === 'ROLE_DEALINGHAND' || role === 'DEALING_HAND') {
    return '/dealing-hand';
  }

  return '/citizen';
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
      if (lastPath === '/unauthorized' || lastPath === '/login' || lastPath === '/') {
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
