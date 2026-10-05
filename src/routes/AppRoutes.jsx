import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { RoleRedirectGuard } from './RoleRedirectGuard';
import { useAuth } from '../context/AuthContext';

// Pages imports
import Landing from '../pages/Landing/Landing';
import Dashboard from '../pages/Dashboard/Dashboard';
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

      {/* Generic /dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard {...commonDashboardProps} />
          </ProtectedRoute>
        } 
      />

      {/* Super Admin, RMC Head & Dealing Hand Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_SUPERADMIN', 'SUPERADMIN', 'SECRETARY', 'ROLE_RAABITA_HEAD', 'RAABITA_HEAD', 'ROLE_RMC_HEAD', 'RMC_HEAD', 'DEALINGHAND', 'ROLE_DEALINGHAND', 'DEALING_HAND', 'ROLE_DEALING_HAND', 'DEALINGHANDHEAD', 'DEALING_HAND_HEAD', 'ROLE_DEALINGHAND_HEAD', 'ROLE_DM', 'DM', 'ROLE_DEPT_ADMIN', 'DEPT_ADMIN', 'OFFICER', 'DEPARTMENT']} />}>
        <Route 
          path="/super-admin" 
          element={<Dashboard {...commonDashboardProps} />} 
        />
      </Route>

      {/* Monitoring Cell Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_MONITORING_CELL', 'MONITORING_CELL']} />}>
        <Route 
          path="/monitoring-cell" 
          element={<Dashboard {...commonDashboardProps} />} 
        />
      </Route>

      {/* Department Admin & Officer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_DEPT_ADMIN', 'DEPT_ADMIN', 'OFFICER', 'DEPARTMENT', 'ROLE_DEPARTMENT', 'ADMIN']} />}>
        <Route 
          path="/department" 
          element={<Dashboard {...commonDashboardProps} />} 
        />
      </Route>

      {/* District Magistrate (DM) Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_DM', 'DM', 'ROLE_DISTRICT_MAGISTRATE']} />}>
        <Route 
          path="/dm" 
          element={<Dashboard {...commonDashboardProps} />} 
        />
      </Route>

      {/* Appellate Authority Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_APPELLATE', 'APPELLATE', 'ROLE_APPELLATE_AUTHORITY']} />}>
        <Route 
          path="/appellate" 
          element={<Dashboard {...commonDashboardProps} />} 
        />
      </Route>

      {/* Dealing Hand Routes */}
      <Route element={<ProtectedRoute allowedRoles={['DEALINGHAND', 'ROLE_DEALINGHAND', 'DEALING_HAND']} />}>
        <Route 
          path="/dealing-hand" 
          element={<Dashboard {...commonDashboardProps} />} 
        />
        <Route path="/dh-lodge" element={<DealingHandForm />} />
        <Route path="/dealing-hand/lodge" element={<DealingHandForm />} />
      </Route>

      {/* Citizen Routes */}
      <Route element={<ProtectedRoute allowedRoles={['CITIZEN', 'ROLE_CITIZEN', 'CITIZEN_USER', 'ROLE_CITIZEN_USER', 'USER', 'ROLE_USER', 'PUBLIC', 'ROLE_PUBLIC']} />}>
        <Route 
          path="/citizen" 
          element={<Dashboard {...commonDashboardProps} />} 
        />
      </Route>

      {/* Common Details & Form Routes (Authorized for Logged-In Users) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/grievance/:id" element={<GrievanceDetail />} />
        <Route path="/superadmin/grievance-details/:id" element={<SuperAdminGrievanceDetail />} />
        <Route path="/appeal/:id" element={<AppealDetail />} />
        <Route path="/process-grievance/:id" element={<ProcessGrievance />} />
      </Route>

      {/* Unauthorized Access Fallback */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
