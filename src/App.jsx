import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import StepsToLodge from './components/StepsToLodge';
import MobileShowcase from './components/MobileShowcase';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

// Modals
import GrievanceModal from './components/GrievanceModal';
import TrackModal from './components/TrackModal';
import AuthModal from './components/AuthModal';

import './App.css';

function App() {
  const [isGrievanceOpen, setIsGrievanceOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [trackRefCode, setTrackRefCode] = useState('');

  const handleLodgeGrievance = () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Sticky Header */}
      <Navbar 
        onLodgeClick={handleLodgeGrievance} 
        onTrackClick={() => handleTrackStatus('')}
        onAuthClick={handleOpenAuth}
        onFaqClick={() => setIsFaqOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">

        {/* Hero Section – fullscreen, Navbar overlays on top */}
        <Hero />

        {/* Mobile App Section – Phone mockup with video background */}
        <MobileShowcase />

        {/* About Us Section */}
        <AboutUs />

        {/* Steps To Lodge Section – Onboarding wavy sine timeline */}
        <StepsToLodge />

      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals */}
      <GrievanceModal 
        isOpen={isGrievanceOpen} 
        onClose={() => setIsGrievanceOpen(false)} 
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
      />

      <FAQ 
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
      />
    </div>
  );
}

export default App;
