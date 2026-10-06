import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../config/dashboardConfig';
import SuperAdminDashboard from './SuperAdminDashboard';
import CitizenDashboard from './CitizenDashboard';
import DeptDashboard from './DeptDashboard';
import AppellateDashboard from './AppellateDashboard';

/**
 * Common Authenticated Dashboard Component
 * 
 * Flow:
 * Login -> Authenticated User -> Load User Context -> Single /dashboard -> Role-driven Renderer
 * 
 * Serves Super Admin, RMC Head & Users, DM, Monitoring Cell, Dealing Hand,
 * Department Officers, Appellate Authority, and Citizens from the same route.
 */
export default function Dashboard(props) {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4 select-none">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
            Loading Authenticated Dashboard...
          </span>
        </div>
      </div>
    );
  }

  const role = normalizeRole(user);

  // Administrative, Oversight, District, and Operations Roles
  // SuperAdmin, Monitoring Cell, RMC, DM, and Dealing Hand utilize the unified extensible dashboard
  if (
    role === 'SUPERADMIN' ||
    role === 'MONITORING_CELL' ||
    role === 'RMC' ||
    role === 'DM' ||
    role === 'DEALING_HAND'
  ) {
    return (
      <SuperAdminDashboard 
        user={user} 
        onLogout={logout} 
        normalizedRole={role}
        {...props} 
      />
    );
  }

  // Department Nodal / Officer Workflow
  if (role === 'DEPARTMENT') {
    return (
      <DeptDashboard 
        user={user} 
        onLogout={logout} 
        {...props} 
      />
    );
  }

  // Appellate Authority Workflow
  if (role === 'APPELLATE') {
    return (
      <AppellateDashboard 
        user={user} 
        onLogout={logout} 
        {...props} 
      />
    );
  }

  // Citizen Role: Integrated into the common dashboard architecture
  return (
    <CitizenDashboard 
      user={user} 
      onLogout={logout} 
      {...props} 
    />
  );
}
