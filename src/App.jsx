import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/layout/Navbar';
import FAQ from './components/modals/FAQ';
import VideoModal from './components/modals/VideoModal';
import AuthModal from './components/modals/AuthModal';
import GrievanceModal from './components/modals/GrievanceModal';
import TrackModal from './components/modals/TrackModal';

import './App.css';

// Inner component that has access to auth context
function AppContent() {
  const { isLoggedIn, user, logout, isLoading } = useAuth();
  
  // Modals state (retained from original App.jsx)
  const [isGrievanceOpen, setIsGrievanceOpen] = React.useState(false);
  const [grievanceModalMode, setGrievanceModalMode] = React.useState('grievance');
  const [isTrackOpen, setIsTrackOpen] = React.useState(false);
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [isFaqOpen, setIsFaqOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState('login');
  const [trackRefCode, setTrackRefCode] = React.useState('');
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);
  const [videoType, setVideoType] = React.useState('login');
  const [grievances, setGrievances] = React.useState([]);

  const handleLodgeGrievance = (mode = 'grievance') => {
    setGrievanceModalMode(mode);
    setIsGrievanceOpen(true);
  };

  const handleTrackStatus = (refNum = '') => {
    setTrackRefCode(refNum);
    setIsTrackOpen(true);
  };

  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleOpenVideo = (type) => {
    setVideoType(type);
    setIsVideoOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    setIsAuthOpen(false);
  };

  const handleGrievanceSubmit = (newGrievance) => {
    setGrievances((prev) => [newGrievance, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4 select-none">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-650 dark:text-slate-400 animate-pulse">Initializing Portal Session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Sticky Header shown when not logged in */}
      {!isLoggedIn && (
        <Navbar
          onLodgeClick={() => handleLodgeGrievance('grievance')}
          onAppealClick={() => handleLodgeGrievance('appeal')}
          onTrackClick={() => handleTrackStatus('')}
          onAuthClick={handleOpenAuth}
          onFaqClick={() => setIsFaqOpen(true)}
          onLmsClick={handleOpenVideo}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={logout}
        />
      )}

      {/* Main Content Area using dynamic AppRoutes */}
      <main className="flex-1 flex flex-col">
        <AppRoutes
          onLodgeClick={() => handleLodgeGrievance('grievance')}
          onAppealClick={() => handleLodgeGrievance('appeal')}
          onLmsClick={handleOpenVideo}
          grievances={grievances}
          setGrievances={setGrievances}
        />
      </main>

      {/* Interactive Modals */}
      <GrievanceModal
        isOpen={isGrievanceOpen}
        onClose={() => setIsGrievanceOpen(false)}
        mode={grievanceModalMode}
        onLoginRedirect={() => {
          setIsGrievanceOpen(false);
          handleOpenAuth('login');
        }}
        onRegisterRedirect={() => {
          setIsGrievanceOpen(false);
          handleOpenAuth('register');
        }}
        isLoggedIn={isLoggedIn}
        user={user}
        onGrievanceSubmit={handleGrievanceSubmit}
      />

      <TrackModal
        isOpen={isTrackOpen}
        onClose={() => {
          setIsTrackOpen(false);
          setTrackRefCode('');
        }}
        initialRefNum={trackRefCode}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />

      <FAQ
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
      />

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoType={videoType}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
