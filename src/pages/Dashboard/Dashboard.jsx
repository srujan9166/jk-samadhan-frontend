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

  const role = (user?.role || '').toUpperCase();
  const email = (user?.email || '').toLowerCase();
  const username = (user?.username || '').toLowerCase();

  const isSuperAdmin = role === 'ROLE_SuperAdmin' || email.includes('superadmin') || username.includes('superadmin') || role === 'SECRETARY' || role === 'ROLE_SECRETARY';
  const isAdmin = role.includes('ADMIN') || email.includes('admin') || username.includes('admin');

  if (isSuperAdmin) {
    return <SuperAdminDashboard user={user} onLogout={logout} {...props} />;
  }

  if (isAdmin) {
    if (user?.department && user.department.trim() !== '') {
      return <DeptDashboard user={user} onLogout={logout} {...props} />;
    }
    return <AdminDashboard user={user} onLogout={logout} {...props} />;
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
