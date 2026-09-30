import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const checkRoleMatch = (user, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!user) return false;

  const role = (user.role || '').toUpperCase();
  const email = (user.email || '').toLowerCase();
  const username = (user.username || '').toLowerCase();

  const formattedAllowed = allowedRoles.map((r) => r.toUpperCase());

  // Direct role check
  if (formattedAllowed.includes(role)) return true;
  if (formattedAllowed.includes(`ROLE_${role}`)) return true;

  // Keyword / specialized checks
  if (formattedAllowed.includes('ROLE_SUPERADMIN') || formattedAllowed.includes('SUPERADMIN') || formattedAllowed.includes('ROLE_RAABITA_HEAD') || formattedAllowed.includes('ROLE_RMC_HEAD') || formattedAllowed.includes('ROLE_DEALINGHAND') || formattedAllowed.includes('DEALINGHAND')) {
    if (role === 'ROLE_SUPERADMIN' || role === 'SUPERADMIN' || email.includes('superadmin') || username.includes('superadmin') || role === 'SECRETARY' || role === 'ROLE_SECRETARY' || role === 'ROLE_RAABITA_HEAD' || role === 'RAABITA_HEAD' || role === 'ROLE_RMC_HEAD' || role === 'RMC_HEAD' || role === 'RAABITAHEAD' || role === 'RMCHEAD' || role.includes('RAABITA') || role.includes('RMC') || email.includes('raabita') || username.includes('raabita') || username.includes('rmc') || role.includes('DEALING') || email.includes('dealing') || username.includes('dealing')) {
      return true;
    }
  }

  if (formattedAllowed.includes('ROLE_MONITORING_CELL') || formattedAllowed.includes('MONITORING_CELL')) {
    if (role === 'ROLE_MONITORING_CELL' || role === 'MONITORING_CELL' || email.includes('monitor') || username.includes('monitor')) {
      return true;
    }
  }

  if (formattedAllowed.includes('ROLE_ADMIN') || formattedAllowed.includes('ADMIN')) {
    if (role.includes('ADMIN') || email.includes('admin') || username.includes('admin')) {
      return true;
    }
  }

  if (formattedAllowed.includes('ROLE_DEPT_ADMIN') || formattedAllowed.includes('DEPT_ADMIN') || formattedAllowed.includes('OFFICER')) {
    if (role === 'OFFICER' || role === 'DEPARTMENT' || role === 'ROLE_DEPARTMENT' || role === 'ROLE_DEPARTMENT_NODAL' || role === 'DEPT_ADMIN' || role === 'ROLE_DEPT_ADMIN') {
      return true;
    }
  }

  if (formattedAllowed.includes('ROLE_DM') || formattedAllowed.includes('DM')) {
    if (role === 'DM' || role === 'ROLE_DM' || role === 'ROLE_DISTRICT_MAGISTRATE') {
      return true;
    }
  }

  if (formattedAllowed.includes('ROLE_APPELLATE') || formattedAllowed.includes('APPELLATE')) {
    if (role === 'APPELLATE' || role === 'ROLE_APPELLATE' || role === 'ROLE_APPELLATE_AUTHORITY') {
      return true;
    }
  }

  if (formattedAllowed.includes('ROLE_DEALINGHAND') || formattedAllowed.includes('DEALINGHAND') || formattedAllowed.includes('DEALING_HAND')) {
    if (role === 'DEALINGHAND' || role === 'ROLE_DEALINGHAND' || role === 'DEALING_HAND') {
      return true;
    }
  }

  if (formattedAllowed.includes('ROLE_CITIZEN') || formattedAllowed.includes('CITIZEN')) {
    if (role === 'CITIZEN' || role === 'ROLE_CITIZEN' || !role) {
      return true;
    }
  }

  return false;
};

const ProtectedRoute = ({ allowedRoles }) => {
  const { isLoggedIn, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4 select-none">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-650 dark:text-slate-400 animate-pulse">
            Verifying Authentication...
          </span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!checkRoleMatch(user, allowedRoles)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
