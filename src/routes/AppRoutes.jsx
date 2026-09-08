import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Pages imports
import Landing from '../pages/Landing/Landing';
import Dashboard from '../pages/Dashboard/Dashboard';
import GrievanceDetail from '../pages/Details/GrievanceDetail';
import AppealDetail from '../pages/Details/AppealDetail';
import DealingHandForm from '../pages/Forms/DealingHandForm';
import ProcessGrievance from '../pages/Forms/ProcessGrievance';
import SuperAdminGrievanceDetail from '../pages/Details/SuperAdminGrievanceDetail';

export default function AppRoutes({
  onLodgeClick,
  onAppealClick,
  onLmsClick,
  grievances,
  setGrievances,
  onLogout
}) {
  const { isLoggedIn, user } = useAuth();

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/" 
        element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <Landing />
        } 
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route 
          path="/dashboard" 
          element={
            <Dashboard 
              user={user}
              grievances={grievances}
              setGrievances={setGrievances}
              onLodgeClick={onLodgeClick}
              onAppealClick={onAppealClick}
              onLogout={onLogout}
              onLmsClick={onLmsClick}
            />
          } 
        />
        <Route path="/grievance/:id" element={<GrievanceDetail />} />
        <Route path="/appeal/:id" element={<AppealDetail />} />
        <Route path="/process-grievance/:id" element={<ProcessGrievance />} />
      </Route>

      {/* Super Admin specific routes */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_SuperAdmin']} />}>
        <Route path="/superadmin/grievance-details/:id" element={<SuperAdminGrievanceDetail />} />
      </Route>

      {/* Role-Specific Protected Route: Dealing Hand Form */}
      <Route element={<ProtectedRoute allowedRoles={['DEALINGHAND', 'ROLE_DEALINGHAND', 'DEALING_HAND']} />}>
        <Route path="/dh-lodge" element={<DealingHandForm />} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
