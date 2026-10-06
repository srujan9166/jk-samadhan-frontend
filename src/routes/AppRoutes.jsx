import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { RoleRedirectGuard } from './RoleRedirectGuard';
import { useAuth } from '../context/AuthContext';

// Pages imports
import Landing from '../pages/Landing/Landing';
import Dashboard from '../pages/Dashboard/Dashboard';
import DashboardShell from '../components/layout/DashboardShell';
import GrievanceDetail from '../pages/Details/GrievanceDetail';
import AppealDetail from '../pages/Details/AppealDetail';
import DealingHandForm from '../pages/Forms/DealingHandForm';
import ProcessGrievance from '../pages/Forms/ProcessGrievance';
import SuperAdminGrievanceDetail from '../pages/Details/SuperAdminGrievanceDetail';
import Unauthorized from '../pages/Unauthorized';

export default function AppRoutes({
  onLodgeClick,
  onAppealClick,
  onLmsClick,
  grievances,
  setGrievances,
  onLogout
}) {
  const { user } = useAuth();

  const commonDashboardProps = {
    user,
    grievances,
    setGrievances,
    onLodgeClick,
    onAppealClick,
    onLogout,
    onLmsClick
  };

  return (
    <Routes>
      {/* Public Route protected by RoleRedirectGuard */}
      <Route 
        path="/" 
        element={
          <RoleRedirectGuard>
            <Landing />
          </RoleRedirectGuard>
        } 
      />

      {/* Single Layout Shell (Matching JK Revenue <Route element={<Sidebar />}>) */}
      <Route element={<DashboardShell />}>
        {/* Role-Prefixed Routes like JK Revenue (mounting unified Dashboard component) */}
        <Route element={<ProtectedRoute allowedRoles={['SUPERADMIN']} />}>
          <Route path="/superAdmin" element={<Dashboard {...commonDashboardProps} />} />
          <Route path="/superAdmin/*" element={<Dashboard {...commonDashboardProps} />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['MONITORING_CELL']} />}>
          <Route path="/monitoringCell" element={<Dashboard {...commonDashboardProps} />} />
          <Route path="/monitoringCell/*" element={<Dashboard {...commonDashboardProps} />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['RMC']} />}>
          <Route path="/rmc" element={<Dashboard {...commonDashboardProps} />} />
          <Route path="/rmc/*" element={<Dashboard {...commonDashboardProps} />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['DM']} />}>
          <Route path="/dm" element={<Dashboard {...commonDashboardProps} />} />
          <Route path="/dm/*" element={<Dashboard {...commonDashboardProps} />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['DEPARTMENT']} />}>
          <Route path="/dept" element={<Dashboard {...commonDashboardProps} />} />
          <Route path="/dept/*" element={<Dashboard {...commonDashboardProps} />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['DEALING_HAND']} />}>
          <Route path="/dealingHand" element={<Dashboard {...commonDashboardProps} />} />
          <Route path="/dealingHand/*" element={<Dashboard {...commonDashboardProps} />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['APPELLATE']} />}>
          <Route path="/appellate" element={<Dashboard {...commonDashboardProps} />} />
          <Route path="/appellate/*" element={<Dashboard {...commonDashboardProps} />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} />}>
          <Route path="/citizen" element={<Dashboard {...commonDashboardProps} />} />
          <Route path="/citizen/*" element={<Dashboard {...commonDashboardProps} />} />
        </Route>

        {/* Primary /dashboard route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard {...commonDashboardProps} />
            </ProtectedRoute>
          } 
        />

        {/* Legacy route aliases redirect to canonical role paths */}
        <Route path="/super-admin/*" element={<Navigate to="/superAdmin" replace />} />
        <Route path="/monitoring-cell/*" element={<Navigate to="/monitoringCell" replace />} />
        <Route path="/department/*" element={<Navigate to="/dept" replace />} />
        <Route path="/dealing-hand/*" element={<Navigate to="/dealingHand" replace />} />

        {/* Dealing Hand Direct Form Routes */}
        <Route element={<ProtectedRoute allowedRoles={['DEALINGHAND', 'ROLE_DEALINGHAND', 'DEALING_HAND', 'DEALINGHANDHEAD', 'ROLE_DEALINGHAND_HEAD']} />}>
          <Route path="/dh-lodge" element={<DealingHandForm />} />
          <Route path="/dealing-hand/lodge" element={<DealingHandForm />} />
        </Route>

        {/* Common Details & Form Routes (Authorized for Logged-In Users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/grievance/:id" element={<GrievanceDetail />} />
          <Route path="/superadmin/grievance-details/:id" element={<SuperAdminGrievanceDetail />} />
          <Route path="/appeal/:id" element={<AppealDetail />} />
          <Route path="/process-grievance/:id" element={<ProcessGrievance />} />
        </Route>
      </Route>

      {/* Unauthorized Access Fallback */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
