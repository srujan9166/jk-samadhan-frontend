import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { normalizeRole } from '../../config/dashboardConfig';
import SuperAdminDashboard from './SuperAdminDashboard';
import CitizenDashboard from './CitizenDashboard';
import DeptDashboard from './DeptDashboard';
import AppellateDashboard from './AppellateDashboard';
import DealingHandDashboard from './DealingHandDashboard';

/**
 * Common Authenticated Dashboard Component / DashboardRenderer
 * 
 * Flow:
 * Login -> Authenticated User -> Load User Context -> Single /dashboard -> Role-driven Renderer
 * 
 * Dynamically mounts and renders dashboard components strictly according to the newly
 * authenticated user's normalized role.
 */
export function DashboardRenderer(props) {
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
  // Strict session key isolation: ensures clean unmount/remount across users & roles
  const userKey = `${user?.id || user?.username || user?.email || 'anon'}_${role}`;

  // Dealing Hand Workflow
  if (role === 'DEALING_HAND') {
    return (
      <DealingHandDashboard
        key={userKey}
        user={user}
        onLogout={logout}
        normalizedRole={role}
        {...props}
      />
    );
  }

  // Administrative, Oversight, District, Department Nodal, and Operations Roles
  // SuperAdmin, Monitoring Cell, RMC, DM, and Department Nodal utilize the unified common authenticated shell
  if (
    role === 'SUPERADMIN' ||
    role === 'MONITORING_CELL' ||
    role === 'RMC' ||
    role === 'DM' ||
    role === 'DEPARTMENT'
  ) {
    return (
      <SuperAdminDashboard 
        key={userKey}
        user={user} 
        onLogout={logout} 
        normalizedRole={role}
        initialView={props.initialView}
        {...props} 
      />
    );
  }

  // Appellate Authority Workflow
  if (role === 'APPELLATE') {
    return (
      <AppellateDashboard 
        key={userKey}
        user={user} 
        onLogout={logout} 
        normalizedRole={role}
        {...props} 
      />
    );
  }

  // Citizen Role: Integrated into the common dashboard architecture
  return (
    <CitizenDashboard 
      key={userKey}
      user={user} 
      onLogout={logout} 
      normalizedRole={role}
      {...props} 
    />
  );
}

export default DashboardRenderer;
