import React from 'react';
import { useAuth } from '../../context/AuthContext';
import CitizenDashboard from './CitizenDashboard';
import DealingHandDashboard from './DealingHandDashboard';
import DeptDashboard from './DeptDashboard';
import DMDashboard from './DMDashboard';
import AppellateDashboard from './AppellateDashboard';
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';

export default function Dashboard(props) {
  const { user, logout } = useAuth();

  const role = user?.role?.toUpperCase() || '';

  // Role routing checks matching standard legacy user privileges
  if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
    return <AdminDashboard user={user} onLogout={logout} {...props} />;
  }

  if (role === 'SUPERADMIN' || role === 'ROLE_SUPERADMIN' || role === 'SECRETARY' || role === 'ROLE_SECRETARY') {
    return <SuperAdminDashboard user={user} onLogout={logout} {...props} />;
  }

  if (role === 'APPELLATE' || role === 'ROLE_APPELLATE' || role === 'ROLE_APPELLATE_AUTHORITY') {
    return <AppellateDashboard user={user} onLogout={logout} {...props} />;
  }

  if (role === 'DM' || role === 'ROLE_DM' || role === 'ROLE_DISTRICT_MAGISTRATE') {
    return <DMDashboard user={user} onLogout={logout} {...props} />;
  }

  if (role === 'OFFICER' || role === 'DEPARTMENT' || role === 'ROLE_DEPARTMENT' || role === 'ROLE_DEPARTMENT_NODAL') {
    return <DeptDashboard user={user} onLogout={logout} {...props} />;
  }

  if (role === 'DEALINGHAND' || role === 'ROLE_DEALINGHAND' || role === 'DEALING_HAND') {
    return <DealingHandDashboard user={user} onLogout={logout} {...props} />;
  }

  // Fallback to Citizen view for standard individuals
  return (
    <CitizenDashboard 
      user={user} 
      onLogout={logout} 
      {...props} 
    />
  );
}
