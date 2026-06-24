import React, { useState, useEffect, useRef } from 'react';
import { PlaySquare, Accessibility, Sun, Moon, Volume2, ChevronDown, Globe, Menu, X, MapPin, FileText, UserPlus, LogIn } from 'lucide-react';
import emblemImg from '../assets/emblem.png';
import logoImg from '../assets/logo.png';

export default function Navbar({ onLodgeClick, onAppealClick, onTrackClick, onAuthClick, onFaqClick, onLmsClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('base'); // 'sm', 'base', 'lg'

  // Dropdown States
  const [grievanceOpen, setGrievanceOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [lmsOpen, setLmsOpen] = useState(false);

  // Refs for outside click detection
  const grievanceRef = useRef(null);
  const supportRef = useRef(null);
  const loginRef = useRef(null);
  const lmsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (grievanceOpen && grievanceRef.current && !grievanceRef.current.contains(event.target)) {
        setGrievanceOpen(false);
      }
      if (supportOpen && supportRef.current && !supportRef.current.contains(event.target)) {
        setSupportOpen(false);
      }
      if (loginOpen && loginRef.current && !loginRef.current.contains(event.target)) {
        setLoginOpen(false);
      }
      if (lmsOpen && lmsRef.current && !lmsRef.current.contains(event.target)) {
        setLmsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [grievanceOpen, supportOpen, loginOpen, lmsOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleScrollToSection = (id, e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="w-full select-none font-sans z-50 relative bg-white">
      
      {/* ── Top Bar: Government Info & Utilities ── */}
      <div className="w-full bg-[#164581] text-white px-4 py-2 flex justify-between items-center text-[14px] font-verdana">
        {/* Left: Location Pin + Government of Jammu & Kashmir */}
        <div className="flex items-center gap-1.5 text-white/90">
          <MapPin className="h-3.5 w-3.5 text-[#ff9933] fill-none" />
          <span className="font-medium">Government of Jammu &amp; Kashmir</span>
        </div>

        {/* Right: LMS Videos, Language, Screen Reader */}
        <div className="hidden md:flex items-center gap-5">
          <div className="relative" ref={lmsRef}>
            <button 
              className="flex items-center gap-1.5 text-white/90 hover:text-white bg-transparent border-0 cursor-pointer text-[14px] font-medium py-0.5"
              onClick={() => setLmsOpen(!lmsOpen)}
            >
              <PlaySquare className="h-3.5 w-3.5 text-white/80" />
              <span>LMS Videos</span>
              <ChevronDown className="h-3 w-3 opacity-60 text-white" />
            </button>
            {lmsOpen && (
              <div className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-[4px] shadow-lg py-1 z-50 text-left">
                <button 
                  onClick={() => { setLmsOpen(false); onLmsClick('login'); }}
                  className="w-full text-left px-4 py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#164581] cursor-pointer bg-transparent border-0"
                >
                  How to Login
                </button>
                <button 
                  onClick={() => { setLmsOpen(false); onLmsClick('register'); }}
                  className="w-full text-left px-4 py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#164581] cursor-pointer bg-transparent border-0"
                >
                  How to Register
                </button>
              </div>
            )}
          </div>
          
          <button className="flex items-center gap-1.5 text-white/90 hover:text-white bg-transparent border-0 cursor-pointer text-[14px] font-medium py-0.5">
            <Globe className="h-3.5 w-3.5 text-white/80" />
            <span>Language</span>
            <ChevronDown className="h-3 w-3 opacity-60 text-white" />
          </button>

          <button className="flex items-center gap-1.5 text-white/90 hover:text-white bg-transparent border-0 cursor-pointer text-[14px] font-medium py-0.5">
            <Volume2 className="h-3.5 w-3.5 text-[#10b981]" />
            <span>Screen Reader</span>
          </button>
        </div>
      </div>

      {/* ── Main Middle Row: Logo & Quick Registration/Login Badges ── */}
      <div className="w-full px-6 py-4 flex justify-between items-center border-b border-slate-100 bg-white">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          {/* Emblem Image Logo */}
          <img 
            src={emblemImg} 
            alt="Government Emblem" 
            className="h-12 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-[19px] font-black text-[#164581] tracking-tight leading-none font-display">
                JK Samadhan
              </span>
              <span className="bg-[#f06e30] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-widest leading-none">
                2.0
              </span>
            </div>
            <span className="text-[14px] font-medium text-slate-500 mt-1.5 leading-normal">
              Jammu &amp; Kashmir Unified Grievance Redressal &amp; Monitoring
            </span>
          </div>
        </div>

        {/* Buttons (CPGrams, Register, Login) */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => window.open('https://pgportal.gov.in', '_blank')}
            className="h-9 px-4 border border-slate-350 hover:border-slate-400 text-slate-700 hover:bg-slate-50 text-[14px] font-medium rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4 text-slate-500" />
            <span>CPGrams</span>
          </button>

          <button 
            onClick={() => onAuthClick('register')}
            className="h-9 px-4 bg-[#f06e30] hover:bg-[#d8581b] text-white text-[14px] font-medium rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register</span>
          </button>

          <div className="relative" ref={loginRef}>
            <button 
              onClick={() => setLoginOpen(!loginOpen)}
              className="h-9 px-4 bg-[#164581] hover:bg-[#07172b] text-white text-[14px] font-medium rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer border-0 shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>Login</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>
            {loginOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-[4px] shadow-lg py-1 z-50 text-left">
                <button 
                  onClick={() => { setLoginOpen(false); onAuthClick('login'); }}
                  className="w-full text-left px-4 py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#164581] cursor-pointer bg-transparent border-0"
                >
                  Citizen Login
                </button>
                <button 
                  onClick={() => { setLoginOpen(false); onAuthClick('admin'); }}
                  className="w-full text-left px-4 py-2 text-[14px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#164581] cursor-pointer bg-transparent border-0"
                >
                  Official Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-1.5 bg-white border border-slate-200 rounded-[4px] text-slate-700 hover:bg-slate-50 cursor-pointer border-0"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Bottom Row: Navigation links & orange stripe bottom border ── */}
      <nav 
        className={`w-full py-2.5 px-0 transition-all duration-200 bg-[#164581] border-b-[3px] border-[#ff9933] font-verdana ${
          scrolled 
            ? 'fixed top-0 left-0 right-0 z-50 shadow-md' 
            : 'relative'
        }`}
      >
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <a 
              href="#home" 
              onClick={(e) => handleScrollToSection('home', e)}
              className="text-white hover:text-[#ff9933] text-[14px] font-medium px-3 py-1.5 transition-colors text-decoration-none"
            >
              Home
            </a>
            <a 
              href="#about" 
              onClick={(e) => handleScrollToSection('about', e)}
              className="text-white hover:text-[#ff9933] text-[14px] font-medium px-3 py-1.5 transition-colors text-decoration-none"
            >
              About
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleScrollToSection('contact', e)}
              className="text-white hover:text-[#ff9933] text-[14px] font-medium px-3 py-1.5 transition-colors text-decoration-none"
            >
              Contact Us
            </a>

            {/* Grievance action dropdown */}
            <div className="relative" ref={grievanceRef}>
              <button 
                onClick={() => setGrievanceOpen(!grievanceOpen)}
                className="flex items-center gap-1 text-white hover:text-[#ff9933] text-[14px] font-medium px-3 py-1.5 cursor-pointer bg-transparent border-0"
              >
                <span>Grievance</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${grievanceOpen ? 'rotate-180' : ''}`} />
              </button>
              {grievanceOpen && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-[4px] shadow-lg py-1.5 z-50 text-left">
                  <button 
                    onClick={() => { setGrievanceOpen(false); onLodgeClick(); }}
                    className="w-full text-left px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#164581] cursor-pointer bg-transparent border-0"
                  >
                    Lodge Grievance
                  </button>
                  <button 
                    onClick={() => { setGrievanceOpen(false); onAppealClick(); }}
                    className="w-full text-left px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#164581] cursor-pointer bg-transparent border-0"
                  >
                    Lodge Appeal
                  </button>
                  <button 
                    onClick={() => { setGrievanceOpen(false); onTrackClick(''); }}
                    className="w-full text-left px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#164581] cursor-pointer bg-transparent border-0"
                  >
                    Track Status
                  </button>
                </div>
              )}
            </div>

            {/* Help & Support Dropdown */}
            <div className="relative" ref={supportRef}>
              <button 
                onClick={() => setSupportOpen(!supportOpen)}
                className="flex items-center gap-1 text-white hover:text-[#ff9933] text-[14px] font-medium px-3 py-1.5 cursor-pointer bg-transparent border-0"
              >
                <span>Help &amp; Support</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${supportOpen ? 'rotate-180' : ''}`} />
              </button>
              {supportOpen && (
                <div className="absolute left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-[4px] shadow-lg py-1.5 z-50 text-left">
                  <button 
                    onClick={() => { setSupportOpen(false); onFaqClick(); }}
                    className="w-full text-left px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#164581] cursor-pointer bg-transparent border-0"
                  >
                    Frequently Asked Questions
                  </button>
                  <a 
                    href="mailto:help@samadhan.jk.gov.in"
                    className="block text-left px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#164581] text-decoration-none"
                  >
                    Contact Support
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-[#164581] border-t border-slate-700 p-3 shadow-lg flex flex-col md:hidden z-50 text-left">
            <a 
              href="#home" 
              onClick={(e) => handleScrollToSection('home', e)}
              className="py-2 px-3 text-[14px] font-medium text-white hover:bg-slate-800 hover:text-[#ff9933] rounded-[4px] text-decoration-none"
            >
              Home
            </a>
            <a 
              href="#about" 
              onClick={(e) => handleScrollToSection('about', e)}
              className="py-2 px-3 text-[14px] font-medium text-white hover:bg-slate-800 hover:text-[#ff9933] rounded-[4px] text-decoration-none"
            >
              About
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleScrollToSection('contact', e)}
              className="py-2 px-3 text-[14px] font-medium text-white hover:bg-slate-800 hover:text-[#ff9933] rounded-[4px] text-decoration-none"
            >
              Contact Us
            </a>

            {/* Mobile LMS Videos Section */}
            <div className="border-t border-slate-700 my-2 pt-2 px-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LMS Training Videos</span>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onLmsClick('login'); }}
                className="w-full text-left py-1.5 text-[13px] font-medium text-white hover:text-[#ff9933] bg-transparent border-0 cursor-pointer"
              >
                How to Login
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onLmsClick('register'); }}
                className="w-full text-left py-1.5 text-[13px] font-medium text-white hover:text-[#ff9933] bg-transparent border-0 cursor-pointer"
              >
                How to Register
              </button>
            </div>

            {/* Mobile Actions separator */}
            <div className="border-t border-slate-700 my-2 pt-2 px-3 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Actions</span>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onLodgeClick(); }}
                className="w-full text-left py-1.5 text-[13px] font-medium text-white hover:text-[#ff9933] bg-transparent border-0"
              >
                Lodge Grievance
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onAppealClick(); }}
                className="w-full text-left py-1.5 text-[13px] font-medium text-white hover:text-[#ff9933] bg-transparent border-0"
              >
                Lodge Appeal
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onTrackClick(''); }}
                className="w-full text-left py-1.5 text-[13px] font-medium text-white hover:text-[#ff9933] bg-transparent border-0"
              >
                Track Status
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); window.open('https://pgportal.gov.in', '_blank'); }}
                className="w-full text-left py-1.5 text-[13px] font-medium text-white hover:text-[#ff9933] bg-transparent border-0"
              >
                CPGrams Portal
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onAuthClick('register'); }}
                className="w-full text-left py-1.5 text-[13px] font-medium text-[#ff9933] bg-transparent border-0"
              >
                Register Account
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onAuthClick('login'); }}
                className="w-full text-left py-1.5 text-[13px] font-medium text-sky-400 bg-transparent border-0"
              >
                Citizen Login
              </button>
            </div>
          </div>
        )}
      </nav>

    </header>
  );
}
