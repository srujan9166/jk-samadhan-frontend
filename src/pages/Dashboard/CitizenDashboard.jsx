import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../../config';
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck2, 
  PieChart, 
  Calendar, 
  ThumbsUp, 
  AlertCircle, 
  FileX, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Database,
  Menu,
  X,
  Bell,
  Play,
  ChevronDown,
  User,
  LogOut,
  ClipboardList,
  Mic,
  MapPin
} from 'lucide-react';
import emblemImg from '../../assets/emblem.png';
import GISMapModal from '../../components/modals/GISMapModal';

export default function CitizenDashboard({ 
  user, 
  grievances, 
  setGrievances, 
  onLodgeClick, 
  onAppealClick,
  onLogout,
  onLmsClick
}) {
  const [filterType, setFilterType] = useState('All'); // 'All', 'Web', 'Mobile'
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Header Dropdowns
  const [isLmsDropdownOpen, setIsLmsDropdownOpen] = useState(false);
  const [isManualDropdownOpen, setIsManualDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const lmsRef = useRef(null);
  const manualRef = useRef(null);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  // Inline Form States
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'lodge_grievance', 'lodge_appeal'
  const [isGrievanceAgreed, setIsGrievanceAgreed] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [windowType, setWindowType] = useState('Samadhan');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pertainDivision, setPertainDivision] = useState('');
  const [pertainDistrict, setPertainDistrict] = useState('');
  const [municipalityOrBlock, setMunicipalityOrBlock] = useState('');
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [psgAct, setPsgAct] = useState(false); // PSGA toggle
  const [grievanceLocation, setGrievanceLocation] = useState('');
  const [isGISMapOpen, setIsGISMapOpen] = useState(false);
  
  const handleLocationSelected = (loc) => {
    setGrievanceLocation(`${loc.latitude}, ${loc.longitude}`);
    if (loc.district) {
      setPertainDistrict(loc.district);
    }
  };

  // Department definitions
  const departments = [
    { id: 'ari', name: 'ARI & TRAININGS DEPARTMENT' },
    { id: 'pwd', name: 'Public Works Department (R&B)' },
    { id: 'pdd', name: 'Power Development Department (PDD)' },
    { id: 'phe', name: 'Jal Shakti (PHE) Department' },
    { id: 'health', name: 'Health & Medical Education' },
    { id: 'edu', name: 'School Education Department' },
    { id: 'revenue', name: 'Revenue Department' },
    { id: 'municipality', name: 'Housing & Urban Development' },
    { id: 'food', name: 'Food, Civil Supplies & Consumer Affairs' }
  ];

  // Category definitions
  const categories = {
    ari: ['Training Process', 'Rule Interpretation', 'Service Rules', 'Other ARI Issues'],
    pwd: ['Road Repair', 'Bridge Construction', 'Building Maintenance', 'Other PWD Issues'],
    pdd: ['Power Outage', 'Faulty Transformer', 'Billing Grievance', 'New Connection Delay'],
    phe: ['Water Scarcity', 'Contaminated Water', 'Pipeline Leakage', 'Billing Issue'],
    health: ['Hospital Facilities', 'Staff Behaviour', 'Medicine Availability', 'Scheme Enrollment'],
    edu: ['School Infrastructure', 'Teacher Availability', 'Mid-Day Meal Quality', 'Scholarships'],
    revenue: ['Land Records', 'Demarcation Delay', 'Certificate Issuance', 'Staff Misconduct'],
    municipality: ['Garbage Collection', 'Street Light Malfunction', 'Drainage Blockage', 'Stray Animal Menace'],
    food: ['Ration Card Issue', 'Ration Quality', 'Dealer Misbehaviour', 'Black Marketing']
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isLmsDropdownOpen && lmsRef.current && !lmsRef.current.contains(event.target)) {
        setIsLmsDropdownOpen(false);
      }
      if (isManualDropdownOpen && manualRef.current && !manualRef.current.contains(event.target)) {
        setIsManualDropdownOpen(false);
      }
      if (isLangDropdownOpen && langRef.current && !langRef.current.contains(event.target)) {
        setIsLangDropdownOpen(false);
      }
      if (isProfileDropdownOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLmsDropdownOpen, isManualDropdownOpen, isLangDropdownOpen, isProfileDropdownOpen]);

  // Fetch Grievances from Backend
  useEffect(() => {
    const fetchGrievances = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/grievances`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map((g) => ({
            refNum: `JK-${100000 + g.id}-${new Date().getFullYear()}`,
            type: g.windowType === 'Raabita' ? 'appeal' : 'grievance',
            department: g.department,
            category: g.grievanceCategory,
            subject: g.description ? g.description.substring(0, 45) + '...' : 'Grievance',
            description: g.description,
            date: new Date().toLocaleDateString('en-GB'),
            status: 'Pending',
            source: g.windowType || 'Web'
          }));
          setGrievances(mapped);
        } else if (res.status === 403) {
          console.warn('Session expired or invalid token. Please log in again.');
        } else {
          console.error('Failed to fetch grievances. Status:', res.status);
        }
      } catch (err) {
        console.error("Failed to fetch grievances:", err);
      }
    };

    fetchGrievances();
  }, [user, setGrievances]);

  // Speech to Text trigger
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Geolocating trigger
  const markLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          alert(`Location marked successfully!\nLatitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`);
          setGrievanceLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        (error) => {
          alert("Could not retrieve geolocation. Simulating location pin instead.");
          setGrievanceLocation("34.0837, 74.7973"); // Srinagar coordinates
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Submit Grievance to Backend
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!windowType) {
      alert("Please select a window (Samadhan or Raabita).");
      return;
    }
    if (!selectedDept) {
      alert("Please select a department.");
      return;
    }
    if (!selectedCategory) {
      alert("Please select a category.");
      return;
    }
    if (!pertainDivision) {
      alert("Please select division.");
      return;
    }
    if (!pertainDistrict) {
      alert("Please select pertain district.");
      return;
    }
    if (!municipalityOrBlock) {
      alert("Please select whether under Municipality or Block.");
      return;
    }
    if (!description.trim()) {
      alert("Please enter description.");
      return;
    }
    if (psgAct === null) {
      alert("Please select whether it resides under Public Service Guarantee Act.");
      return;
    }

    const payload = {
      name: user ? (user.name || `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim()) : 'sai srujan rallabandi',
      mobile: user?.mobile || '9339399397',
      email: user?.email || 'NA',
      gender: user?.gender || 'MALE',
      dateOfBirth: user?.dateOfBirth || '2003-10-02',
      address: user?.address || 'khammam',
      pincode: user?.pincode || '507001',
      state: user?.state || 'TELANGANA',
      district: user?.district || 'KHAMMAM',
      windowType: windowType,
      department: selectedDept,
      grievanceCategory: selectedCategory,
      pertainDivision: pertainDivision,
      pertainDistrict: pertainDistrict,
      description: description,
      fileName: docFile ? docFile.name : null,
      filePath: docFile ? 'uploads/' + docFile.name : null,
      secondfileName: mediaFile ? mediaFile.name : null,
      secondfilePath: mediaFile ? 'uploads/' + mediaFile.name : null
    };

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/grievances/grievanceSubmit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedGrievance = await res.json();
        alert("Grievance submitted successfully!");

        const newGrievance = {
          refNum: `JK-${100000 + savedGrievance.id}-${new Date().getFullYear()}`,
          type: windowType === 'Raabita' ? 'appeal' : 'grievance',
          department: selectedDept,
          category: selectedCategory,
          subject: description.substring(0, 45) + '...',
          description: description,
          date: new Date().toLocaleDateString('en-GB'),
          status: 'Pending',
          source: windowType
        };

        setGrievances((prev) => [newGrievance, ...prev]);
        setActiveView('dashboard');

        // Reset
        setWindowType('Samadhan');
        setSelectedDept('');
        setSelectedCategory('');
        setPertainDivision('');
        setPertainDistrict('');
        setMunicipalityOrBlock('');
        setDescription('');
        setDocFile(null);
        setMediaFile(null);
        setPsgAct(null);
        setGrievanceLocation('');
      } else {
        const errMsg = await res.text();
        alert("Failed to submit grievance: " + errMsg);
      }
    } catch (err) {
      console.error("Submit grievance error:", err);
      alert("Failed to submit grievance due to connection error.");
    }
  };

  // Department ID to Name map for display
  const getDeptName = (id) => {
    const depts = {};
    departments.forEach(d => {
      depts[d.id] = d.name;
    });
    return depts[id] || id || 'General Administration';
  };

  // Status Colors for Official look
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">Resolved</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">Rejected</span>;
      case 'appealed':
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">Appealed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Pending</span>;
    }
  };

  // Load Demo Data for presentation
  const handleLoadDemoData = () => {
    const demoGrievances = [
      {
        refNum: 'JK-283941-2026',
        type: 'grievance',
        department: 'pdd',
        category: 'Faulty Transformer',
        subject: 'Repeated power fluctuations and faulty transformer in Sector 3',
        description: 'The local transformer has caught fire twice and voltage fluctuation is damaging household electronics.',
        date: '18/06/2026',
        status: 'Pending',
        source: 'Web'
      },
      {
        refNum: 'JK-198274-2026',
        type: 'grievance',
        department: 'municipality',
        category: 'Garbage Collection',
        subject: 'Irregular waste disposal and blocked sewers in Ward 9',
        description: 'Waste disposal trucks have not visited Ward 9 in two weeks. Drainage is blocked causing health hazards.',
        date: '12/06/2026',
        status: 'Resolved',
        source: 'Mobile'
      },
      {
        refNum: 'JK-304928-2026',
        type: 'grievance',
        department: 'phe',
        category: 'Water Scarcity',
        subject: 'No drinking water supply for 5 consecutive days',
        description: 'Water pipeline in Anantnag block has ruptured, leading to no clean drinking water availability.',
        date: '05/06/2026',
        status: 'Rejected',
        source: 'Web'
      },
      {
        refNum: 'JK-APL-492019-2026',
        type: 'appeal',
        department: 'edu',
        category: 'School Infrastructure',
        subject: 'Appeal regarding delayed mid-day meal quality inspection',
        description: 'First grievance was marked resolved but the food quality is still subpar. Seeking secondary investigation.',
        date: '22/06/2026',
        status: 'Appealed',
        source: 'Web'
      }
    ];
    setGrievances(demoGrievances);
  };

  // Filter & Search logic
  const filteredGrievances = grievances.filter((item) => {
    const source = item.source || 'Web';
    if (filterType !== 'All' && source.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        item.refNum?.toLowerCase().includes(query) ||
        getDeptName(item.department).toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.subject?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Pagination logic
  const totalItems = filteredGrievances.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedGrievances = filteredGrievances.slice(startIndex, startIndex + pageSize);

  // Calculations for stats
  const totalCount = grievances.length;
  const pendingCount = grievances.filter(g => g.status === 'Pending').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;
  const appealedCount = grievances.filter(g => g.status === 'Appealed' || g.type === 'appeal').length;
  const rejectedCount = grievances.filter(g => g.status === 'Rejected').length;

  const SortIndicator = () => (
    <span className="inline-flex flex-col ml-1.5 opacity-60">
      <span className="text-[6px] leading-none mb-0.5">▲</span>
      <span className="text-[6px] leading-none">▼</span>
    </span>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f9] text-slate-800 font-sans">
      
      {/* ── Top Header Redesigned ── */}
      <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 z-45 sticky top-0 shrink-0">
        {/* Left: Brand logos and hamburger toggle */}
        <div className="flex items-center gap-3">
          <img src={emblemImg} className="h-9 w-auto object-contain shrink-0" alt="Emblem" />
          
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-[#164581] leading-none">JK Samadhan</span>
              <span className="bg-[#f06e30] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full scale-90">2.0</span>
            </div>
            <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 leading-none">Government of Jammu & Kashmir</span>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1.5 hidden sm:block"></div>
          
          <div className="flex items-center gap-1.5 z-10 hidden sm:flex">
            <div className="p-0.5 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-lg text-white">
              <svg viewBox="0 0 100 100" className="w-5 h-5 text-white fill-none stroke-current" strokeWidth="6">
                <circle cx="50" cy="50" r="12" />
                <circle cx="20" cy="40" r="7" />
                <circle cx="45" cy="18" r="7" />
                <circle cx="80" cy="35" r="7" />
                <circle cx="70" cy="75" r="7" />
                <circle cx="30" cy="75" r="7" />
                <line x1="26" y1="42" x2="39" y2="47" />
                <line x1="48" y1="25" x2="50" y2="38" />
                <line x1="73" y1="38" x2="61" y2="46" />
                <line x1="66" y1="70" x2="57" y2="59" />
                <line x1="34" y1="70" x2="43" y2="59" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-extrabold text-xs tracking-tight uppercase leading-none text-[#164581]">JK Raabita</span>
            </div>
          </div>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer ml-1.5 sm:ml-3 border-0 bg-transparent"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Right: Dropdowns and User profile */}
        <div className="flex items-center gap-2">
          {/* LMS Videos */}
          <div className="relative" ref={lmsRef}>
            <button 
              onClick={() => {
                setIsLmsDropdownOpen(!isLmsDropdownOpen);
                setIsManualDropdownOpen(false);
                setIsLangDropdownOpen(false);
                setIsProfileDropdownOpen(false);
              }}
              className="flex items-center gap-1 bg-[#1f2e42] hover:bg-[#182535] text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm select-none border-0"
            >
              <div className="flex items-center justify-center bg-red-600 rounded-full p-0.5 shrink-0">
                <Play className="h-2 w-2 text-white fill-current translate-x-[0.5px]" />
              </div>
              <span>LMS Videos</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>
            {isLmsDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-50 text-left">
                <button 
                  onClick={() => { setIsLmsDropdownOpen(false); onLmsClick('login'); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0"
                >
                  How to Login
                </button>
                <button 
                  onClick={() => { setIsLmsDropdownOpen(false); onLmsClick('register'); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0"
                >
                  How to Register
                </button>
              </div>
            )}
          </div>

          {/* User Manual */}
          <div className="relative" ref={manualRef}>
            <button 
              onClick={() => {
                setIsManualDropdownOpen(!isManualDropdownOpen);
                setIsLmsDropdownOpen(false);
                setIsLangDropdownOpen(false);
                setIsProfileDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 bg-[#1f2e42] hover:bg-[#182535] text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm select-none border-0"
            >
              <span>User Manual</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>
            {isManualDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1.5 z-50 text-left">
                <button 
                  onClick={() => { alert('Downloading Citizen User Manual PDF (Mock)'); setIsManualDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0"
                >
                  Citizen User Manual
                </button>
                <button 
                  onClick={() => { alert('Downloading Officer User Manual PDF (Mock)'); setIsManualDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0"
                >
                  Officer User Manual
                </button>
              </div>
            )}
          </div>

          {/* Language */}
          <div className="relative" ref={langRef}>
            <button 
              onClick={() => {
                setIsLangDropdownOpen(!isLangDropdownOpen);
                setIsLmsDropdownOpen(false);
                setIsManualDropdownOpen(false);
                setIsProfileDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 bg-[#1f2e42] hover:bg-[#182535] text-white text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors shadow-sm select-none border-0"
            >
              <span>Language</span>
              <ChevronDown className="h-3 w-3 opacity-80" />
            </button>
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white border border-slate-200 rounded-md shadow-lg py-1.5 z-50 text-left">
                <button onClick={() => setIsLangDropdownOpen(false)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0">English</button>
                <button onClick={() => setIsLangDropdownOpen(false)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0">Urdu</button>
                <button onClick={() => setIsLangDropdownOpen(false)} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-transparent border-0">Hindi</button>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative border-l border-slate-200 pl-2 ml-1" ref={profileRef}>
            <button 
              onClick={() => {
                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                setIsLmsDropdownOpen(false);
                setIsManualDropdownOpen(false);
                setIsLangDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 text-xs font-bold py-1 transition-colors cursor-pointer select-none border-0 bg-transparent"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 text-[#164581] flex items-center justify-center font-bold border border-slate-350 shrink-0">
                <User className="h-4 w-4" />
              </div>
              <span className="hidden md:inline max-w-[130px] truncate font-sans text-slate-700">{user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : 'sai srujan rallabandi'}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60 text-slate-650" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-md shadow-lg py-1.5 z-50 text-left font-sans">
                <div className="px-4 py-2 border-b border-slate-100">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Logged in as</span>
                  <span className="block text-xs font-bold text-slate-800 truncate">{user?.email || 'sai@samadhan.jk.gov.in'}</span>
                </div>
                <button 
                  onClick={() => { setIsProfileDropdownOpen(false); onLogout(); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-650 hover:bg-red-50 cursor-pointer bg-transparent border-0 flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Outer Body Layout Row ── */}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-[calc(100vh-64px)]">
        
        {/* ── Left Sidebar: Dark Themed navigation ── */}
        <aside className={`bg-[#1f2e42] text-white flex flex-col justify-between shrink-0 select-none transition-all duration-300 z-30 ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden'
        } fixed md:relative h-[calc(100vh-64px)] md:h-auto`}>
          <div className="flex flex-col">
            {activeView === 'dashboard' ? (
              <nav className="p-4 space-y-1.5">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold transition-all bg-[#eae8ff] text-[#5b21b6] cursor-pointer border-0"
                >
                  <LayoutDashboard className="h-4.5 w-4.5" />
                  <span>User Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('lodge_grievance');
                    setIsGrievanceAgreed(false);
                    setHasAgreed(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer bg-transparent border-0"
                >
                  <FileText className="h-4.5 w-4.5" />
                  <span>Lodge Grievance</span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('lodge_appeal');
                    setIsGrievanceAgreed(false);
                    setHasAgreed(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer bg-transparent border-0"
                >
                  <FileCheck2 className="h-4.5 w-4.5" />
                  <span>Lodge Appeal</span>
                </button>
              </nav>
            ) : (
              <div className="p-4">
                <button
                  onClick={() => {
                    if (isGrievanceAgreed) {
                      setIsGrievanceAgreed(false);
                    } else {
                      setActiveView('dashboard');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-1.5 bg-[#0f172a] hover:bg-slate-900 text-white rounded-full text-xs font-bold transition-all border-0 cursor-pointer shadow-md inline-flex"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 flex items-center justify-center">
            <div className="px-4 py-1.5 bg-slate-900/60 rounded-full text-xs text-slate-300 font-mono">
              ver: v2.7.13
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <main className="flex-1 flex flex-col p-6 space-y-6 overflow-x-hidden pb-16">
          
          {/* Breadcrumb Header & Notification Bell */}
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              {activeView === 'dashboard' ? (
                <>
                  Dashboard <span className="text-slate-350 font-normal">|</span> <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded">User Dashboard</span>
                </>
              ) : (
                <>
                  Lodge Relevance <span className="text-slate-350 font-normal">|</span> <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded">
                    {activeView === 'lodge_appeal' ? 'Lodge Appeal' : 'Lodge Grievance'}
                  </span>
                </>
              )}
            </h2>
            
            <div className="flex items-center gap-3">
              {activeView === 'dashboard' && (
                <button 
                  onClick={handleLoadDemoData}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Populate dashboard with sample grievance records"
                >
                  <Database className="h-3.5 w-3.5 text-blue-600" />
                  <span>Load Demo Data</span>
                </button>
              )}

              <div className="relative mr-2">
                <button className="relative p-2 text-slate-550 hover:text-slate-800 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer border-0 bg-transparent">
                  <Bell className="h-5 w-5 fill-none stroke-current" />
                  <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-red-650 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white leading-none">
                    0
                  </span>
                </button>
              </div>
            </div>
          </div>

          {activeView === 'dashboard' ? (
            <>
              {/* Stats Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Card 1: Total Submitted */}
                <div className="bg-[#1e40af] text-white p-5 rounded-xl shadow-md border border-blue-800/10 flex justify-between items-center relative overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="space-y-1 z-10 text-left">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90">Total Grievances Submitted</span>
                    <span className="block text-3xl font-extrabold font-mono">{totalCount}</span>
                  </div>
                  <PieChart className="h-11 w-11 text-white/20 stroke-[1.5] shrink-0" />
                </div>

                {/* Card 2: Pending with Department */}
                <div className="bg-[#0f766e] text-white p-5 rounded-xl shadow-md border border-teal-800/10 flex justify-between items-center relative overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="space-y-1 z-10 text-left">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90">Pending with Department</span>
                    <span className="block text-3xl font-extrabold font-mono">{pendingCount}</span>
                  </div>
                  <Calendar className="h-11 w-11 text-white/20 stroke-[1.5] shrink-0" />
                </div>

                {/* Card 3: Resolved */}
                <div className="bg-[#15803d] text-white p-5 rounded-xl shadow-md border border-green-800/10 flex justify-between items-center relative overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="space-y-1 z-10 text-left">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90">Resolved</span>
                    <span className="block text-3xl font-extrabold font-mono">{resolvedCount}</span>
                  </div>
                  <ThumbsUp className="h-11 w-11 text-white/20 stroke-[1.5] shrink-0" />
                </div>

                {/* Card 4: Appealed */}
                <div className="bg-[#c2410c] text-white p-5 rounded-xl shadow-md border border-orange-800/10 flex justify-between items-center relative overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="space-y-1 z-10 text-left">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90">Appealed</span>
                    <span className="block text-3xl font-extrabold font-mono">{appealedCount}</span>
                  </div>
                  <AlertCircle className="h-11 w-11 text-white/20 stroke-[1.5] shrink-0" />
                </div>

                {/* Card 5: Rejected */}
                <div className="bg-[#eab308] text-white p-5 rounded-xl shadow-md border border-yellow-800/10 flex justify-between items-center relative overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="space-y-1 z-10 text-left">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90">Rejected</span>
                    <span className="block text-3xl font-extrabold font-mono">{rejectedCount}</span>
                  </div>
                  <ClipboardList className="h-11 w-11 text-white/20 stroke-[1.5] shrink-0" />
                </div>

              </div>

              {/* Grievances List Container */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
                
                {/* List Card Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                    List of Grievances
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    {/* Center: Filter option as bordered legend box */}
                    <fieldset className="border border-indigo-400 rounded-lg px-4 py-1.5 text-xs">
                      <legend className="text-indigo-600 font-bold px-1.5 text-[9px] uppercase tracking-wider">Filter</legend>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
                          <input 
                            type="radio" 
                            name="filterSource"
                            checked={filterType === 'All'}
                            onChange={() => { setFilterType('All'); setCurrentPage(1); }}
                            className="accent-indigo-650 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>All</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
                          <input 
                            type="radio" 
                            name="filterSource"
                            checked={filterType === 'Web'}
                            onChange={() => { setFilterType('Web'); setCurrentPage(1); }}
                            className="accent-indigo-650 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Web</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-700 select-none">
                          <input 
                            type="radio" 
                            name="filterSource"
                            checked={filterType === 'Mobile'}
                            onChange={() => { setFilterType('Mobile'); setCurrentPage(1); }}
                            className="accent-indigo-650 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Mobile</span>
                        </label>
                      </div>
                    </fieldset>

                    {/* Right: Export buttons in capsule format */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert('Exporting to Excel (Mock)')}
                        className="w-9 h-9 rounded-full bg-[#0f2d59] text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer border-0 shadow-sm"
                        title="Export as XLS"
                      >
                        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current text-white">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity="0.2" />
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 9V3.5L18.5 9H13z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <text x="7" y="18" fontSize="6.5" fontWeight="bold" fill="currentColor" fontFamily="monospace">XLS</text>
                        </svg>
                      </button>
                      <button 
                        onClick={() => alert('Exporting to PDF (Mock)')}
                        className="w-9 h-9 rounded-full bg-[#18181b] text-white flex items-center justify-center hover:opacity-90 transition-all cursor-pointer border-0 shadow-sm"
                        title="Export as PDF"
                      >
                        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current text-white">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" opacity="0.2" />
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 9V3.5L18.5 9H13z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <text x="7" y="18" fontSize="6.5" fontWeight="bold" fill="currentColor" fontFamily="monospace">PDF</text>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Operations: Entries select & Search filter */}
                <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 border-b border-slate-200">
                  {/* Page Size select */}
                  <div className="flex items-center gap-2 text-xs text-slate-650 font-semibold">
                    <span>Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                      className="border border-slate-300 rounded bg-white px-2 py-1 outline-none font-bold cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>

                  {/* Table Search Input */}
                  <div className="relative w-full sm:w-64 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-650 select-none">Search:</span>
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-1.5 w-full border border-slate-300 rounded-md text-xs outline-none bg-white focus:border-[#164581] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid Border HTML Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-[#164581] text-white">
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                          S. No. <SortIndicator />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                          Grievance ID <SortIndicator />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                          Department <SortIndicator />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                          Main category <SortIndicator />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                          Date <SortIndicator />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                          Status <SortIndicator />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border border-slate-300 whitespace-nowrap select-none">
                          Action <SortIndicator />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200 text-xs font-medium">
                      {paginatedGrievances.length > 0 ? (
                        paginatedGrievances.map((item, index) => (
                          <tr key={item.refNum} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 border border-slate-200 text-slate-500 font-mono font-bold text-center">
                              {startIndex + index + 1}
                            </td>
                            <td className="px-4 py-3 border border-slate-200 text-[#164581] font-bold font-mono whitespace-nowrap">
                              {item.refNum}
                            </td>
                            <td className="px-4 py-3 border border-slate-200 text-slate-700 max-w-[200px] truncate" title={getDeptName(item.department)}>
                              {getDeptName(item.department)}
                            </td>
                            <td className="px-4 py-3 border border-slate-200 text-slate-700 whitespace-nowrap">
                              {item.category}
                            </td>
                            <td className="px-4 py-3 border border-slate-200 text-slate-600 font-mono">
                              {item.date}
                            </td>
                            <td className="px-4 py-3 border border-slate-200 whitespace-nowrap">
                              {getStatusBadge(item.status)}
                            </td>
                            <td className="px-4 py-3 border border-slate-200 text-center whitespace-nowrap">
                              <button 
                                onClick={() => alert(`Details:\n\nReference: ${item.refNum}\nDepartment: ${getDeptName(item.department)}\nCategory: ${item.category}\nSubject: ${item.subject}\nDescription: ${item.description}\nDate: ${item.date}\nStatus: ${item.status}`)}
                                className="px-2.5 py-1 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded transition-all bg-white cursor-pointer font-bold"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-500 border border-slate-200 bg-[#f1f5f9] font-medium text-sm">
                            No data available in table
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Footer */}
                <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-550 bg-slate-50/50 font-verdana">
                  <div>
                    Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} entries
                  </div>
                  
                  {/* Pagination Actions */}
                  <div className="flex items-center gap-4 select-none">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-bold bg-transparent border-0 outline-none"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-bold bg-transparent border-0 outline-none"
                    >
                      Next
                    </button>
                  </div>
                </div>

              </div>
            </>
          ) : !isGrievanceAgreed ? (
            /* Checklist/Agreement Screen before opening form */
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-left w-full max-w-5xl">
                <h3 className="text-sm font-bold text-indigo-700 mb-4 select-none">
                  List of subjects/topics which can not be treated as grievance.
                </h3>
                <ol className="list-decimal pl-5 text-[13px] text-slate-600 font-semibold space-y-2 select-none">
                  <li>RTI Matters</li>
                  <li>Court related / Subjudice matters</li>
                  <li>Religious matters</li>
                  <li>Suggestions</li>
                  <li>Grievances of Government employees concerning their service matters including disciplinary proceedings etc.</li>
                </ol>

                <div className="mt-8 flex items-start gap-2.5">
                  <input 
                    type="checkbox" 
                    id="agreeCheck" 
                    checked={hasAgreed} 
                    onChange={(e) => setHasAgreed(e.target.checked)}
                    className="w-4.5 h-4.5 rounded border-slate-350 text-[#1d4ed8] focus:ring-indigo-150 cursor-pointer mt-0.5 animate-pulse"
                  />
                  <label htmlFor="agreeCheck" className="text-xs font-bold text-slate-650 leading-relaxed cursor-pointer select-none">
                    I agree that my grievance does not fall in any of the above listed categories.
                  </label>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setIsGrievanceAgreed(true)}
                    disabled={!hasAgreed}
                    className="px-7 py-2.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all border-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Lodge Relevance Form */
            <div className="space-y-6">
              <form onSubmit={handleFormSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 text-left space-y-6">
                
                {/* 1. Complain/Grievance Submitted by Section */}
                <div>
                  <h3 className="text-sm font-bold text-[#164581] mb-3 uppercase tracking-wide">
                    Complain/Grievance Submitted by:
                  </h3>
                  <div className="border border-slate-200 rounded overflow-hidden divide-y divide-slate-200 text-xs">
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Name:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800 uppercase">{user ? (user.name || `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim()) : 'sai srujan rallabandi'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Mobile No.:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800">{user?.mobile || '9339399397'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Email Id:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800">{user?.email || 'NA'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Gender:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800 uppercase">{user?.gender || 'MALE'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Date of Birth:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800">{user?.dateOfBirth || '2003-10-02'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Address:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800 uppercase">{user?.address || 'khammam'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Pincode:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800">{user?.pincode || '507001'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">State:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800 uppercase">{user?.state || 'TELANGANA'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">District:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800 uppercase">{user?.district || 'KHAMMAM'}</div>
                    </div>
                  </div>
                </div>

                {/* 2. Choose Your Window */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px]">Choose Your Window: *</span>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
                      <input
                        type="radio"
                        name="windowType"
                        value="Samadhan"
                        checked={windowType === 'Samadhan'}
                        onChange={(e) => setWindowType(e.target.value)}
                        className="accent-[#164581] h-4 w-4 cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-[#f06e30] rounded-full scale-90 border border-white inline-block"></span>
                        Samadhan
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
                      <input
                        type="radio"
                        name="windowType"
                        value="Raabita"
                        checked={windowType === 'Raabita'}
                        onChange={(e) => setWindowType(e.target.value)}
                        className="accent-[#164581] h-4 w-4 cursor-pointer"
                      />
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-[#164581] rounded-full scale-90 border border-white inline-block"></span>
                        Raabita
                      </span>
                    </label>
                  </div>
                </div>

                {/* 3. Department */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px]">Department: *</span>
                  <select
                    value={selectedDept}
                    onChange={(e) => { setSelectedDept(e.target.value); setSelectedCategory(''); }}
                    className="flex-1 max-w-md border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] cursor-pointer"
                  >
                    <option value="">--Select Department--</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Main Category of Grievance */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px]">Main Category of Grievance: *</span>
                  <select
                    value={selectedCategory}
                    disabled={!selectedDept}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 max-w-md border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                  >
                    <option value="">--Select category--</option>
                    {selectedDept && categories[selectedDept]?.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* 5. Pertain Division */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px]">Pertain Division: *</span>
                  <select
                    value={pertainDivision}
                    onChange={(e) => { setPertainDivision(e.target.value); setPertainDistrict(''); }}
                    className="flex-1 max-w-md border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="Jammu">Jammu</option>
                    <option value="Kashmir">Kashmir</option>
                  </select>
                </div>

                {/* 6. Pertain District */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px]">Pertain District: *</span>
                  <select
                    value={pertainDistrict}
                    disabled={!pertainDivision}
                    onChange={(e) => setPertainDistrict(e.target.value)}
                    className="flex-1 max-w-md border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                  >
                    <option value="">Select District</option>
                    {pertainDivision === 'Jammu' && ['Jammu', 'Samba', 'Kathua', 'Udhampur', 'Reasi', 'Ramban', 'Doda', 'Kishtwar', 'Poonch', 'Rajouri'].map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                    {pertainDivision === 'Kashmir' && ['Srinagar', 'Budgam', 'Pulwama', 'Anantnag', 'Baramulla', 'Kupwara', 'Shopian', 'Kulgam', 'Ganderbal', 'Bandipora'].map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>

                {/* 7. Whether under Municipality or Block */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px]">Whether under Municipality or Block? *</span>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
                      <input
                        type="radio"
                        name="municipalityOrBlock"
                        value="Municipality"
                        checked={municipalityOrBlock === 'Municipality'}
                        onChange={(e) => setMunicipalityOrBlock(e.target.value)}
                        className="accent-[#164581] h-4 w-4 cursor-pointer"
                      />
                      <span>Municipality</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
                      <input
                        type="radio"
                        name="municipalityOrBlock"
                        value="Block"
                        checked={municipalityOrBlock === 'Block'}
                        onChange={(e) => setMunicipalityOrBlock(e.target.value)}
                        className="accent-[#164581] h-4 w-4 cursor-pointer"
                      />
                      <span>Block</span>
                    </label>
                  </div>
                </div>

                {/* Shaded gray section enclosing Description, speech-to-text, and uploads */}
                <div className="bg-[#f1f5f9] border border-slate-200 rounded-lg p-5 space-y-5 text-xs">
                  
                  {/* Description text area */}
                  <div className="flex items-start gap-4">
                    <span className="font-bold text-slate-700 min-w-[130px] pt-2">Description: *</span>
                    <div className="flex-1 flex gap-3 items-center">
                      <div className="flex-1">
                        <textarea
                          value={description}
                          onChange={(e) => {
                            if (e.target.value.length <= 2000) {
                              setDescription(e.target.value);
                            }
                          }}
                          placeholder="Description"
                          className="w-full min-h-[120px] border border-slate-350 rounded bg-white p-3 outline-none font-medium text-slate-800 focus:border-[#164581]"
                        />
                        <div className="text-[10px] font-bold text-red-650 mt-1 space-y-0.5">
                          <div>Remaining word's {2000 - description.length}.</div>
                          <div>Special characters are not allowed.</div>
                        </div>
                      </div>
                      
                      {/* Voice Microphone trigger */}
                      <button
                        type="button"
                        onClick={startSpeechRecognition}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-0 shadow cursor-pointer transition-all ${
                          isListening 
                            ? 'bg-red-600 text-white animate-pulse' 
                            : 'bg-[#5b21b6] hover:bg-[#4c1d95] text-white'
                        }`}
                        title="Speech to Text"
                      >
                        <Mic className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Upload Document File */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="font-bold text-slate-700 min-w-[130px]">Upload Document File:</span>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 max-w-sm">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                          onChange={(e) => setDocFile(e.target.files[0])}
                          className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border file:border-slate-300 file:text-xs file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-50 file:cursor-pointer"
                        />
                        <div className="text-[10px] font-bold text-red-650 mt-1">
                          JPG, JPEG, PNG, PDF, DOC (MAX 2MB)
                        </div>
                      </div>
                      
                      {/* Location marker trigger */}
                      <button
                        type="button"
                        onClick={() => setIsGISMapOpen(true)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded shadow flex items-center gap-1.5 border-0 cursor-pointer self-start sm:self-center transition-colors"
                      >
                        <MapPin className="h-4 w-4" />
                        <span>{grievanceLocation ? 'Location Marked' : 'Mark Your Grievance Location'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload Audio/Video File */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="font-bold text-slate-700 min-w-[130px]">Upload Audio/Video File:</span>
                    <div className="flex-1 max-w-sm">
                      <input
                        type="file"
                        accept="audio/*,video/*"
                        onChange={(e) => setMediaFile(e.target.files[0])}
                        className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border file:border-slate-300 file:text-xs file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-50 file:cursor-pointer"
                      />
                      <div className="text-[10px] font-bold text-red-650 mt-1">
                        Audio, Video Only (40 MB)
                      </div>
                    </div>
                  </div>

                  {/* Does it reside under the Public Service Guarantee Act? */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="font-bold text-slate-700 min-w-[130px]">Does it reside under the Public Service Guarantee Act? *</span>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
                        <input
                          type="radio"
                          name="psgAct"
                          value="Yes"
                          checked={psgAct === true}
                          onChange={() => setPsgAct(true)}
                          className="accent-[#164581] h-4 w-4 cursor-pointer"
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
                        <input
                          type="radio"
                          name="psgAct"
                          value="No"
                          checked={psgAct === false}
                          onChange={() => setPsgAct(false)}
                          className="accent-[#164581] h-4 w-4 cursor-pointer"
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                </div>

                {/* Form submit button centered */}
                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md hover:shadow-lg cursor-pointer transition-all border-0 hover:scale-[1.02]"
                  >
                    Submit Grievance
                  </button>
                </div>

              </form>
            </div>
          )}

        </main>

      </div>

      <GISMapModal
        isOpen={isGISMapOpen}
        onClose={() => setIsGISMapOpen(false)}
        onLocationSelect={handleLocationSelected}
        currentDistrictName={pertainDistrict}
      />

      {/* Copy-Right Footer Block */}
      <footer className="w-full bg-[#e2e8f0] text-slate-500 border-t border-slate-300 py-3.5 text-center text-[11px] font-semibold select-none z-30 shrink-0">
        © Copyright Ministry of Electronics and Information Technology. All Rights Reserved
      </footer>

    </div>
  );
}
