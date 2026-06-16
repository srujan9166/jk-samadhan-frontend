import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Play, Accessibility, Sun, Moon, Volume2, ChevronDown } from 'lucide-react';
import emblemImg from '../assets/emblem.png';
import logoImg from '../assets/logo.png';

export default function Navbar({ onLodgeClick, onAppealClick, onTrackClick, onAuthClick, onFaqClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [fontSize, setFontSize] = useState('base'); // 'sm', 'base', 'lg'
  const [theme, setTheme] = useState('light');
  const [activeLink, setActiveLink] = useState('Home');

  // Dropdown States
  const [grievanceOpen, setGrievanceOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [prefOpen, setPrefOpen] = useState(false);

  // Refs for outside click detection
  const grievanceRef = useRef(null);
  const supportRef = useRef(null);
  const loginRef = useRef(null);
  const prefRef = useRef(null);

  // Click outside listener
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
      if (prefOpen && prefRef.current && !prefRef.current.contains(event.target)) {
        setPrefOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [grievanceOpen, supportOpen, loginOpen, prefOpen]);

  useEffect(() => {
    let lastState = false;
    const handleScroll = () => {
      const sy = window.scrollY;
      let isScrolled = lastState;
      if (sy > 60) {
        isScrolled = true;
      } else if (sy < 15) {
        isScrolled = false;
      }
      
      if (isScrolled !== lastState) {
        lastState = isScrolled;
        setScrolled(isScrolled);
      }
      
      // Conditionally close dropdowns only if they are open
      setGrievanceOpen(prev => prev ? false : prev);
      setSupportOpen(prev => prev ? false : prev);
      setLoginOpen(prev => prev ? false : prev);
      setIsOpen(prev => prev ? false : prev);
      setPrefOpen(prev => prev ? false : prev);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update DOM font-size based on state
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (fontSize === 'sm') {
      htmlElement.style.fontSize = '14px';
    } else if (fontSize === 'base') {
      htmlElement.style.fontSize = '16px';
    } else if (fontSize === 'lg') {
      htmlElement.style.fontSize = '18px';
    }
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  const handleNavClick = (e, href, name) => {
    e.preventDefault();
    setActiveLink(name);
    
    // Close all dropdowns
    setGrievanceOpen(false);
    setSupportOpen(false);
    setLoginOpen(false);
    setPrefOpen(false);
    setIsOpen(false);

    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className={`absolute top-0 left-0 w-full z-45 select-none`}>

      {/* ── Tricolor top accent stripe ── */}
      <div className="w-full flex" style={{ height: '3px' }}>
        <div className="flex-1" style={{ background: 'linear-gradient(90deg, #FF9933, #ffb347)' }} />
        <div className="flex-1 bg-white/90" />
        <div className="flex-1" style={{ background: 'linear-gradient(90deg, #138808, #22c55e)' }} />
      </div>

      {/* 1. TOP UTILITY ROW */}
      <div className={`relative z-20 transition-all duration-150 py-2 px-5 sm:px-8 lg:px-10 flex justify-between items-center ${
        scrolled
          ? 'bg-white/98 dark:bg-slate-950 backdrop-blur-xl'
          : 'bg-black/30 backdrop-blur-xl'
      }`}>
        
        {/* ── LEFT: Emblem + Branding ── */}
        <div className="flex items-center gap-3">

          {/* Glowing Emblem */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-12 h-12 rounded-full bg-amber-400/20 blur-md animate-pulse" style={{ animationDuration: '3s' }} />
            <img
              src={emblemImg}
              alt="National Emblem of India"
              className="relative w-9 h-11 object-contain drop-shadow-lg"
            />
          </div>

          {/* Divider */}
          <div className={`hidden sm:block w-px h-10 ${ scrolled ? 'bg-slate-200' : 'bg-white/20' }`} />

          {/* Portal Title Block */}
          <div className="hidden sm:flex flex-col justify-center">
            <span
              className={`font-bold leading-none uppercase ${ scrolled ? 'text-[#0b2240] dark:text-white' : 'text-white' }`}
              style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '13px', letterSpacing: '0.14em' }}
            >
              JK <span style={{ color: '#ff9933' }}>Samadhan</span> <span className="text-slate-400 dark:text-slate-500 font-semibold text-[11px] font-sans">2.0</span>
            </span>
            <span
              className={`font-sans font-semibold uppercase tracking-[0.2em] ${ scrolled ? 'text-slate-400' : 'text-white/55' }`}
              style={{ fontSize: '8px' }}
            >
              Govt of Jammu &amp; Kashmir
            </span>
          </div>

          {/* Divider */}
          <div className={`hidden lg:block w-px h-10 ${ scrolled ? 'bg-slate-200' : 'bg-white/20' }`} />

          {/* Pill: JK Samadhan + JK Raabita */}
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            scrolled ? 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800' : 'bg-white/8 border-white/15 backdrop-blur-sm'
          }`}>
            <img src={logoImg} alt="JK Samadhan" className="w-4 h-4 object-contain" />
            <span className={`text-[9.5px] font-bold uppercase tracking-[0.16em] ${ scrolled ? 'text-[#0b2240] dark:text-white' : 'text-white' }`} style={{ fontFamily: "'Cinzel', Georgia, serif" }}>JK Samadhan</span>
            <span className={`w-px h-3.5 ${ scrolled ? 'bg-slate-300 dark:bg-slate-800' : 'bg-white/25' }`} />
            <svg viewBox="0 0 100 100" className="w-4 h-4">
              <path d="M50 50 C40 30,30 30,30 40 C30 50,40 50,50 50" fill="#ff9933" />
              <path d="M50 50 C60 30,70 30,70 40 C70 50,60 50,50 50" fill="#138808" />
              <circle cx="50" cy="50" r="5" fill="#0b2240" />
            </svg>
            <span className={`text-[9.5px] font-bold uppercase tracking-[0.16em] ${ scrolled ? 'text-[#0b2240] dark:text-white' : 'text-white' }`} style={{ fontFamily: "'Cinzel', Georgia, serif" }}>JK Raabita</span>
          </div>

          {/* Divider */}
          <div className={`hidden xl:block w-px h-10 ${ scrolled ? 'bg-slate-200' : 'bg-white/20' }`} />

          {/* Portal subtitle */}
          <div className="hidden xl:flex flex-col">
            <span className={`text-[9.5px] font-bold uppercase tracking-[0.18em] ${ scrolled ? 'text-slate-800 dark:text-white/90' : 'text-white/90' }`} style={{ fontFamily: "'Cinzel', Georgia, serif" }}>Jammu &amp; Kashmir Unified</span>
            <span className={`font-sans text-[8px] font-semibold uppercase tracking-[0.14em] ${ scrolled ? 'text-slate-400 dark:text-white/50' : 'text-white/55' }`}>Grievance Redressal &amp; Monitoring</span>
          </div>

        </div>

        {/* ── RIGHT: Controls ── */}
        <div className="flex items-center gap-2">

          {/* Unified Preference & Accessibility Option */}
          <div className="relative" ref={prefRef}>
            <button
              onClick={() => {
                setPrefOpen(!prefOpen);
                setGrievanceOpen(false);
                setSupportOpen(false);
                setLoginOpen(false);
              }}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-sans font-bold tracking-wider transition-all duration-300 cursor-pointer border ${
                scrolled
                  ? 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
                  : 'bg-white/10 hover:bg-white/18 text-white border-white/20 backdrop-blur-sm'
              } ${prefOpen ? 'ring-2 ring-emerald-500/50' : ''}`}
            >
              <Accessibility className="h-3.5 w-3.5 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span>Accessibility &amp; Tools</span>
              <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-300 ${prefOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Card */}
            <div className={`absolute right-0 top-full mt-2 w-72 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 shadow-2xl z-50 p-4 transition-all duration-300 transform ${
              prefOpen
                ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
                : 'opacity-0 -translate-y-2 scale-95 pointer-events-none invisible'
            }`}>
              <div className="flex flex-col gap-4">
                
                {/* Title */}
                <div className="font-sans text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-900 pb-2">
                  Preferences &amp; Tools
                </div>

                {/* Grid of options */}
                <div className="flex flex-col gap-3">
                  
                  {/* LMS & Language */}
                  <div className="flex items-center gap-2">
                    
                    {/* LMS Button */}
                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-sans font-bold tracking-wider transition-all duration-200 cursor-pointer border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <span className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-red-500">
                        <Play className="h-1.5 w-1.5 fill-white text-white" />
                      </span>
                      <span>LMS</span>
                    </button>

                    {/* Language Dropdown */}
                    <div className="flex-1 flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px] font-sans font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                      <svg className="w-3.5 h-3.5 opacity-70 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      <select className="bg-transparent outline-none border-none cursor-pointer text-slate-700 dark:text-slate-300 text-[10px] font-sans font-bold">
                        <option value="en" className="text-black dark:text-white dark:bg-slate-800">EN</option>
                        <option value="hi" className="text-black dark:text-white dark:bg-slate-800">HI</option>
                        <option value="ur" className="text-black dark:text-white dark:bg-slate-800">UR</option>
                      </select>
                    </div>

                  </div>

                  {/* Size Changer & Theme Changer */}
                  <div className="flex items-center gap-2">
                    
                    {/* Size Increaser (Accessibility) */}
                    <button
                      onClick={() => setFontSize(fontSize === 'base' ? 'lg' : fontSize === 'lg' ? 'sm' : 'base')}
                      className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 cursor-pointer hover:scale-105 flex justify-center items-center gap-1.5"
                      title="Change Text Size">
                      <Accessibility className="h-3.5 w-3.5" />
                      <span className="font-sans text-[10px] font-black">
                        {fontSize === 'sm' ? 'A-' : fontSize === 'base' ? 'A' : 'A+'}
                      </span>
                    </button>

                    {/* Theme Changer */}
                    <button
                      onClick={toggleTheme}
                      className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 cursor-pointer hover:scale-105 flex justify-center items-center gap-1.5"
                      title="Toggle Theme">
                      {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
                      <span className="font-sans text-[10px] font-bold uppercase tracking-wider">
                        {theme === 'light' ? 'Dark' : 'Light'}
                      </span>
                    </button>

                  </div>

                  {/* Screen Reader Row */}
                  <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-transparent font-sans font-bold tracking-wider text-[10px] transition-all duration-200 cursor-pointer hover:scale-[1.02] bg-[#13b183] hover:bg-[#109a72] text-white">
                    <Volume2 className="h-3.5 w-3.5 text-white" />
                    <span>Audio Reader</span>
                  </button>

                </div>

              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 2. BOTTOM NAVIGATION ROW */}
      <nav className={`relative z-10 w-full transition-all duration-150 py-3.5 ${
        scrolled
          ? 'bg-white dark:bg-slate-950'
          : 'bg-transparent'
      }`}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Navigation Links — CENTERED absolutely, capped so it never overlaps action buttons */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-6" style={{ maxWidth: 'calc(100% - 380px)' }}>

            {[['#home','Home'],['#about','About'],['#contact','Contact Us']].map(([href,name]) => (
              <a
                key={name}
                href={href}
                onClick={(e) => handleNavClick(e, href, name)}
                className={`relative py-1 transition-all duration-300 group font-display text-[11px] font-bold tracking-widest uppercase ${
                  activeLink === name
                    ? (scrolled ? 'text-[#0c408f] dark:text-[#ff9933]' : 'text-[#ff9933]')
                    : (scrolled ? 'text-slate-600 hover:text-[#0c408f] dark:text-slate-300 dark:hover:text-white' : 'text-white/75 hover:text-white')
                }`}
              >
                {name}
                <span className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300 ${
                  activeLink === name ? 'w-full' : 'w-0 group-hover:w-full'
                } ${ scrolled ? 'bg-[#0c408f] dark:bg-[#ff9933]' : 'bg-[#ff9933]' }`} />
              </a>
            ))}

            {/* Grievance Dropdown */}
            <div className="relative" ref={grievanceRef}>
              <button
                onClick={() => {
                  setGrievanceOpen(!grievanceOpen);
                  setSupportOpen(false);
                  setLoginOpen(false);
                  setPrefOpen(false);
                }}
                className={`flex items-center gap-1 py-1 cursor-pointer transition-all duration-300 group font-display text-[11px] font-bold tracking-widest uppercase ${
                  scrolled ? 'text-slate-600 hover:text-[#0c408f] dark:text-slate-300 dark:hover:text-white' : 'text-white/75 hover:text-white'
                }`}
              >
                <span>Grievance</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${grievanceOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-2xl py-2 z-50 motion-dropdown transform ${
                grievanceOpen
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none invisible'
              }`}>
                <button onClick={() => { setGrievanceOpen(false); onLodgeClick(); }}
                  className="w-full text-left px-5 py-2.5 text-[11px] font-sans font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0c408f] dark:hover:text-[#ff9933] cursor-pointer transition-colors"
                >Lodge Grievance</button>
                <button onClick={() => { setGrievanceOpen(false); onAppealClick(); }}
                  className="w-full text-left px-5 py-2.5 text-[11px] font-sans font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0c408f] dark:hover:text-[#ff9933] cursor-pointer transition-colors"
                >Lodge Appeal</button>
                <button onClick={() => { setGrievanceOpen(false); onTrackClick(); }}
                  className="w-full text-left px-5 py-2.5 text-[11px] font-sans font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0c408f] dark:hover:text-[#ff9933] cursor-pointer transition-colors"
                >Track Status</button>
              </div>
            </div>

            {/* Help & Support Dropdown */}
            <div className="relative" ref={supportRef}>
              <button
                onClick={() => {
                  setSupportOpen(!supportOpen);
                  setGrievanceOpen(false);
                  setLoginOpen(false);
                  setPrefOpen(false);
                }}
                className={`flex items-center gap-1 py-1 cursor-pointer transition-all duration-300 group font-display text-[11px] font-bold tracking-widest uppercase ${
                  scrolled ? 'text-slate-600 hover:text-[#0c408f] dark:text-slate-300 dark:hover:text-white' : 'text-white/75 hover:text-white'
                }`}
              >
                <span>Help & Support</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${supportOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800 shadow-2xl py-2 z-50 motion-dropdown transform ${
                supportOpen
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none invisible'
              }`}>
                <button onClick={() => { setSupportOpen(false); onFaqClick(); }}
                  className="w-full text-left px-5 py-2.5 text-[11px] font-sans font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0c408f] dark:hover:text-[#ff9933] cursor-pointer transition-colors"
                >Frequently Asked Questions</button>
              </div>
            </div>

          </div>

          {/* Spacer so flex justify-between keeps action buttons right */}
          <div className="hidden lg:block invisible font-display text-[11px] uppercase tracking-widest">Home About Contact Us Grievance Help</div>

          {/* Right Action buttons: Pill-style container containing CPGRAMS, Register, Login */}
          <div className={`hidden sm:flex items-center gap-1.5 p-1 rounded-full border transition-all duration-300 ${
            scrolled
              ? 'bg-slate-100/85 border-slate-200/60 dark:bg-slate-900/85 dark:border-slate-800/60'
              : 'bg-white/10 border-white/20 backdrop-blur-md'
          }`}>

            {/* CPGRAMS button */}
            <button
              onClick={() => window.open('https://pgportal.gov.in', '_blank')}
              className={`px-4 py-1.5 text-[11px] font-sans font-bold rounded-full transition-all duration-200 cursor-pointer tracking-wider ${
                scrolled
                  ? 'text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  : 'text-white/85 hover:text-white hover:bg-white/15'
              }`}
            >
              CPGRAMS
            </button>

            {/* Registration button */}
            <button
              onClick={() => onAuthClick('register')}
              className={`px-4 py-1.5 text-[11px] font-sans font-bold rounded-full transition-all duration-200 cursor-pointer tracking-wider ${
                scrolled
                  ? 'text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                  : 'text-white/85 hover:text-white hover:bg-white/15'
              }`}
            >
              Register
            </button>

            {/* Login Dropdown button */}
            <div className="relative" ref={loginRef}>
              <button
                onClick={() => {
                  setLoginOpen(!loginOpen);
                  setGrievanceOpen(false);
                  setSupportOpen(false);
                  setPrefOpen(false);
                }}
                className={`px-4 py-1.5 text-[11px] font-sans font-bold rounded-full flex items-center gap-1 transition-all duration-300 cursor-pointer tracking-wider shadow-sm ${
                  scrolled
                    ? 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100'
                    : 'bg-white text-slate-950 hover:bg-white/90 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800'
                }`}
              >
                <span>Login</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${loginOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg py-1 z-50 text-left motion-dropdown-right transform ${
                loginOpen
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none invisible'
              }`}>
                <button 
                  onClick={() => { setLoginOpen(false); onAuthClick('login'); }}
                  className="w-full text-left px-4 py-2 text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Citizen Login
                </button>
                <button 
                  onClick={() => { setLoginOpen(false); onAuthClick('admin'); }}
                  className="w-full text-left px-4 py-2 text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Administrative Login
                </button>
              </div>
            </div>
          </div>

          {/* Mobile hamburger menu */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-all ${ scrolled ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900' : 'text-white hover:bg-white/15' }`}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 mt-3 px-4 py-4 space-y-3 animate-fadeIn text-left">
            <a 
              href="#home" 
              onClick={(e) => handleNavClick(e, '#home', 'Home')}
              className="block py-2 text-sm font-sans font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-3 rounded-lg"
            >
              Home
            </a>
            <a 
              href="#about" 
              onClick={(e) => handleNavClick(e, '#about', 'About')}
              className="block py-2 text-sm font-sans font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-3 rounded-lg"
            >
              About
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleNavClick(e, '#contact', 'Contact Us')}
              className="block py-2 text-sm font-sans font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-3 rounded-lg"
            >
              Contact Us
            </a>

            {/* Mobile Dropdowns */}
            <div className="border-t border-slate-150 dark:border-slate-800 pt-2 px-3 space-y-1">
              <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Grievance Actions</span>
              <button 
                onClick={() => { setIsOpen(false); onLodgeClick(); }}
                className="block w-full text-left py-1.5 text-xs font-sans font-semibold text-slate-700 dark:text-slate-300"
              >
                Lodge Grievance
              </button>
              <button 
                onClick={() => { setIsOpen(false); onAppealClick(); }}
                className="block w-full text-left py-1.5 text-xs font-sans font-semibold text-slate-700 dark:text-slate-300"
              >
                Lodge Appeal
              </button>
              <button 
                onClick={() => { setIsOpen(false); onTrackClick(); }}
                className="block w-full text-left py-1.5 text-xs font-sans font-semibold text-slate-700 dark:text-slate-300"
              >
                Track Status
              </button>
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-900">
              <button 
                onClick={() => { setIsOpen(false); window.open('https://pgportal.gov.in', '_blank'); }}
                className="w-full py-2 text-center text-[10px] font-sans font-bold text-white bg-red-800 rounded shadow-sm"
              >
                CPGRAMS
              </button>
              <button 
                onClick={() => { setIsOpen(false); onAuthClick('register'); }}
                className="w-full py-2 text-center text-[10px] font-sans font-bold text-white bg-gov-saffron rounded shadow-sm"
              >
                Register
              </button>
              <button 
                onClick={() => { setIsOpen(false); onAuthClick('login'); }}
                className="w-full py-2 text-center text-[10px] font-sans font-bold text-white bg-gov-blue rounded shadow-sm"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
