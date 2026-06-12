import React, { useState, useEffect } from 'react';
import { Menu, X, Play, Accessibility, Sun, Moon, Volume2, ChevronDown } from 'lucide-react';
import emblemImg from '../assets/emblem.png';
import logoImg from '../assets/logo.png';

export default function Navbar({ onLodgeClick, onTrackClick, onAuthClick, onFaqClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [fontSize, setFontSize] = useState('base'); // 'sm', 'base', 'lg'
  const [theme, setTheme] = useState('light');
  const [activeLink, setActiveLink] = useState('Home');

  // Dropdown States
  const [grievanceOpen, setGrievanceOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      // Close all dropdowns on scroll
      setGrievanceOpen(false);
      setSupportOpen(false);
      setLoginOpen(false);
      setIsOpen(false);
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
    const element = document.querySelector(href);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setIsOpen(false);
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
      <div className={`transition-all duration-150 py-2 px-5 sm:px-8 lg:px-10 flex justify-between items-center ${
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
              className={`font-black leading-none tracking-wide ${ scrolled ? 'text-[#0b2240]' : 'text-white' }`}
              style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '13px', letterSpacing: '0.12em' }}
            >
              JK <span style={{ color: '#13b183' }}>Samadhan</span> 2.0
            </span>
            <span
              className={`font-semibold uppercase tracking-widest ${ scrolled ? 'text-slate-400' : 'text-white/55' }`}
              style={{ fontSize: '8px', letterSpacing: '0.22em' }}
            >
              Govt of Jammu &amp; Kashmir
            </span>
          </div>

          {/* Divider */}
          <div className={`hidden lg:block w-px h-10 ${ scrolled ? 'bg-slate-200' : 'bg-white/20' }`} />

          {/* Pill: JK Samadhan + JK Raabita */}
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border ${
            scrolled ? 'bg-slate-50 border-slate-200' : 'bg-white/8 border-white/15 backdrop-blur-sm'
          }`}>
            <img src={logoImg} alt="JK Samadhan" className="w-4 h-4 object-contain" />
            <span className={`text-[9px] font-bold uppercase tracking-widest ${ scrolled ? 'text-[#0b2240]' : 'text-white' }`}>JK Samadhan</span>
            <span className={`w-px h-3.5 ${ scrolled ? 'bg-slate-300' : 'bg-white/25' }`} />
            <svg viewBox="0 0 100 100" className="w-4 h-4">
              <path d="M50 50 C40 30,30 30,30 40 C30 50,40 50,50 50" fill="#ff9933" />
              <path d="M50 50 C60 30,70 30,70 40 C70 50,60 50,50 50" fill="#138808" />
              <circle cx="50" cy="50" r="5" fill="#0b2240" />
            </svg>
            <span className={`text-[9px] font-bold uppercase tracking-widest ${ scrolled ? 'text-[#0b2240]' : 'text-white' }`}>JK Raabita</span>
          </div>

          {/* Divider */}
          <div className={`hidden xl:block w-px h-10 ${ scrolled ? 'bg-slate-200' : 'bg-white/20' }`} />

          {/* Portal subtitle */}
          <div className="hidden xl:flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-widest ${ scrolled ? 'text-slate-700' : 'text-white/90' }`}>Jammu &amp; Kashmir Unified</span>
            <span className={`text-[8.5px] font-semibold uppercase tracking-wider ${ scrolled ? 'text-slate-400' : 'text-white/50' }`}>Grievance Redressal &amp; Monitoring</span>
          </div>

        </div>

        {/* ── RIGHT: Controls ── */}
        <div className="flex items-center gap-2">

          {/* LMS Videos */}
          <button className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-300 cursor-pointer border ${
            scrolled
              ? 'bg-slate-900 hover:bg-slate-700 text-white border-slate-700'
              : 'bg-white/10 hover:bg-white/18 text-white border-white/20 backdrop-blur-sm'
          }`}
            style={{ fontFamily: "'Cinzel', Georgia, serif" }}
          >
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500 group-hover:scale-110 transition-transform">
              <Play className="h-2 w-2 fill-white text-white" />
            </span>
            <span>LMS</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {/* Language */}
          <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold text-white tracking-wider transition-all duration-300 ${
            scrolled ? 'bg-slate-900 border-slate-700' : 'bg-white/10 border-white/20 backdrop-blur-sm'
          }`} style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
            <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <select className="bg-transparent outline-none border-none cursor-pointer text-white text-[10px] font-bold" style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
              <option value="en" className="text-black">EN</option>
              <option value="hi" className="text-black">HI</option>
              <option value="ur" className="text-black">UR</option>
            </select>
          </div>

          {/* Separator */}
          <div className={`hidden sm:block w-px h-6 ${ scrolled ? 'bg-slate-200' : 'bg-white/20' }`} />

          {/* Accessibility */}
          <button
            onClick={() => setFontSize(fontSize === 'base' ? 'lg' : fontSize === 'lg' ? 'sm' : 'base')}
            className={`p-2 rounded-lg border transition-all duration-300 cursor-pointer hover:scale-105 ${
              scrolled ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
            title="Accessibility">
            <Accessibility className="h-3.5 w-3.5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border transition-all duration-300 cursor-pointer hover:scale-105 ${
              scrolled ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
            }`}
            title="Toggle Theme">
            {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
          </button>

          {/* Separator */}
          <div className={`hidden sm:block w-px h-6 ${ scrolled ? 'bg-slate-200' : 'bg-white/20' }`} />

          {/* Screen Reader — Accent pill */}
          <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold tracking-wider text-[10px] transition-all duration-300 cursor-pointer hover:scale-105 ${
            scrolled
              ? 'bg-[#0c408f] hover:bg-[#0a3272] border-[#0c408f] text-white'
              : 'bg-[#13b183]/25 hover:bg-[#13b183]/40 border-[#13b183]/50 text-white backdrop-blur-sm'
          }`} style={{ fontFamily: "'Cinzel', Georgia, serif" }}>
            <Volume2 className={`h-3.5 w-3.5 ${ scrolled ? 'text-amber-300' : 'text-[#13b183]' }`} />
            <span className="hidden sm:inline">Screen Reader</span>
          </button>

        </div>

      </div>

      {/* 2. BOTTOM NAVIGATION ROW */}
      <nav className={`w-full transition-all duration-150 py-3.5 ${
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
                className={`relative py-1 transition-all duration-300 group ${
                  activeLink === name
                    ? (scrolled ? 'text-[#0c408f]' : 'text-white')
                    : (scrolled ? 'text-slate-600 hover:text-[#0c408f]' : 'text-white/75 hover:text-white')
                }`}
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}
              >
                {name}
                <span className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300 ${
                  activeLink === name ? 'w-full' : 'w-0 group-hover:w-full'
                } ${ scrolled ? 'bg-[#0c408f]' : 'bg-white' }`} />
              </a>
            ))}

            {/* Grievance Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setGrievanceOpen(!grievanceOpen); setSupportOpen(false); }}
                className={`flex items-center gap-1 py-1 cursor-pointer transition-all duration-300 group ${
                  scrolled ? 'text-slate-600 hover:text-[#0c408f]' : 'text-white/75 hover:text-white'
                }`}
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}
              >
                <span>Grievance</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${grievanceOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 rounded-xl bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl py-2 z-50 motion-dropdown transform ${
                grievanceOpen
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none invisible'
              }`}>
                <button onClick={() => { setGrievanceOpen(false); onLodgeClick(); }}
                  className="w-full text-left px-5 py-2.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0c408f] cursor-pointer transition-colors"
                  style={{ fontFamily: "'Cinzel', Georgia, serif", letterSpacing: '0.05em' }}
                >Lodge Grievance</button>
                <button onClick={() => { setGrievanceOpen(false); onTrackClick(); }}
                  className="w-full text-left px-5 py-2.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0c408f] cursor-pointer transition-colors"
                  style={{ fontFamily: "'Cinzel', Georgia, serif", letterSpacing: '0.05em' }}
                >Track Status</button>
              </div>
            </div>

            {/* Help & Support Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setSupportOpen(!supportOpen); setGrievanceOpen(false); }}
                className={`flex items-center gap-1 py-1 cursor-pointer transition-all duration-300 group ${
                  scrolled ? 'text-slate-600 hover:text-[#0c408f]' : 'text-white/75 hover:text-white'
                }`}
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}
              >
                <span>Help & Support</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${supportOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 rounded-xl bg-white/95 backdrop-blur-md border border-slate-100 shadow-2xl py-2 z-50 motion-dropdown transform ${
                supportOpen
                  ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto visible'
                  : 'opacity-0 -translate-y-2 scale-95 pointer-events-none invisible'
              }`}>
                <button onClick={() => { setSupportOpen(false); onFaqClick(); }}
                  className="w-full text-left px-5 py-2.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0c408f] cursor-pointer transition-colors"
                  style={{ fontFamily: "'Cinzel', Georgia, serif", letterSpacing: '0.05em' }}
                >Frequently Asked Questions</button>
              </div>
            </div>

          </div>

          {/* Spacer so flex justify-between keeps action buttons right */}
          <div className="hidden lg:block invisible" style={{ fontFamily: "'Cinzel', serif", fontSize: '11px' }}>Home About Contact Us Grievance Help</div>

          {/* Right Action buttons: CPGRAMS, Registration, Login */}
          <div className="hidden sm:flex items-center gap-2">

            {/* CPGRAMS — outlined glass-crimson */}
            <button
              onClick={() => window.open('https://pgportal.gov.in', '_blank')}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-lg border transition-all duration-300 cursor-pointer tracking-widest ${
                scrolled
                  ? 'bg-transparent border-rose-700 text-rose-700 hover:bg-rose-700 hover:text-white'
                  : 'bg-rose-600/20 border-rose-300/60 text-white hover:bg-rose-600/50 backdrop-blur-sm'
              }`}
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              CPGRAMS
            </button>

            {/* Registration — outlined glass-emerald */}
            <button
              onClick={() => onAuthClick('register')}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-lg border transition-all duration-300 cursor-pointer tracking-widest ${
                scrolled
                  ? 'bg-transparent border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                  : 'bg-emerald-500/20 border-emerald-300/60 text-white hover:bg-emerald-500/50 backdrop-blur-sm'
              }`}
              style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            >
              Register
            </button>

            {/* Login Dropdown — filled glass-gold */}
            <div className="relative">
              <button
                onClick={() => { setLoginOpen(!loginOpen); setGrievanceOpen(false); setSupportOpen(false); }}
                className={`px-4 py-1.5 text-[11px] font-bold rounded-lg border flex items-center gap-1 transition-all duration-300 cursor-pointer tracking-widest ${
                  scrolled
                    ? 'bg-[#0c408f] border-[#0c408f] text-white hover:bg-[#0a3272]'
                    : 'bg-white/20 border-white/40 text-white hover:bg-white/35 backdrop-blur-sm'
                }`}
                style={{ fontFamily: "'Cinzel', Georgia, serif" }}
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
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Citizen Login
                </button>
                <button 
                  onClick={() => { setLoginOpen(false); onAuthClick('admin'); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
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
              className="block py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-3 rounded-lg"
            >
              Home
            </a>
            <a 
              href="#about" 
              onClick={(e) => handleNavClick(e, '#about', 'About')}
              className="block py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-3 rounded-lg"
            >
              About
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleNavClick(e, '#contact', 'Contact Us')}
              className="block py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-3 rounded-lg"
            >
              Contact Us
            </a>

            {/* Mobile Dropdowns */}
            <div className="border-t border-slate-150 dark:border-slate-800 pt-2 px-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Grievance Actions</span>
              <button 
                onClick={() => { setIsOpen(false); onLodgeClick(); }}
                className="block w-full text-left py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Lodge Grievance
              </button>
              <button 
                onClick={() => { setIsOpen(false); onTrackClick(); }}
                className="block w-full text-left py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Track Status
              </button>
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-900">
              <button 
                onClick={() => { setIsOpen(false); window.open('https://pgportal.gov.in', '_blank'); }}
                className="w-full py-2 text-center text-[10px] font-bold text-white bg-red-800 rounded shadow-sm"
              >
                CPGRAMS
              </button>
              <button 
                onClick={() => { setIsOpen(false); onAuthClick('register'); }}
                className="w-full py-2 text-center text-[10px] font-bold text-white bg-gov-saffron rounded shadow-sm"
              >
                Register
              </button>
              <button 
                onClick={() => { setIsOpen(false); onAuthClick('login'); }}
                className="w-full py-2 text-center text-[10px] font-bold text-white bg-gov-blue rounded shadow-sm"
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
