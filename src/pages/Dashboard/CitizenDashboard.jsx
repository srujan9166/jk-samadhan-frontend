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
import logoImg from '../../assets/logo.png';
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

  useEffect(() => {
    document.title = "JK Samadhan 3.0 - Citizen Dashboard";
  }, []);

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
  const [dbSubCategories, setDbSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [pertainDivision, setPertainDivision] = useState('');
  const [pertainDistrict, setPertainDistrict] = useState('');
  const [dbBlocks, setDbBlocks] = useState([]);
  const [dbPanchayats, setDbPanchayats] = useState([]);
  const [dbMunicipalities, setDbMunicipalities] = useState([]);
  const [dbWards, setDbWards] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedPanchayat, setSelectedPanchayat] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [municipalityOrBlock, setMunicipalityOrBlock] = useState('');
  const [description, setDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [psgAct, setPsgAct] = useState(false); // PSGA toggle
  const [grievanceLocation, setGrievanceLocation] = useState('');
  const [isGISMapOpen, setIsGISMapOpen] = useState(false);

  // Lodge Appeal States
  const [selectedGrievanceId, setSelectedGrievanceId] = useState('');
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [appealDescription, setAppealDescription] = useState('');
  const [appealFile, setAppealFile] = useState(null);
  const [submittedGrievanceDetails, setSubmittedGrievanceDetails] = useState(null);

  const handleLocationSelected = (loc) => {
    setGrievanceLocation(`${loc.latitude}, ${loc.longitude}`);
    if (loc.district) {
      setPertainDistrict(loc.district);
    }
  };

  // Department, Category, Division, District states from DB
  const [dbDepartments, setDbDepartments] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbDivisions, setDbDivisions] = useState([]);
  const [dbDistricts, setDbDistricts] = useState([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState('');

  // Fetch departments and divisions on mount
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const deptRes = await fetch(`${API_BASE_URL}/api/masters/departments`);
        if (deptRes.ok) {
          const depts = await deptRes.json();
          setDbDepartments(depts);
        }
        const divRes = await fetch(`${API_BASE_URL}/api/geo/divisions`);
        if (divRes.ok) {
          const divs = await divRes.json();
          setDbDivisions(divs);
        }
      } catch (error) {
        console.error('Error fetching departments or divisions:', error);
      }
    };
    fetchMasters();
  }, []);

  // Fetch categories when selectedDept changes
  useEffect(() => {
    const fetchCategories = async () => {
      if (!selectedDept) {
        setDbCategories([]);
        return;
      }
      try {
        const catRes = await fetch(`${API_BASE_URL}/api/masters/categories?deptId=${selectedDept}`);
        if (catRes.ok) {
          const cats = await catRes.json();
          setDbCategories(cats);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [selectedDept]);

  // Fetch subcategories when selectedCategory changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setDbSubCategories([]);
        setSelectedSubCategory('');
        return;
      }
      const selectedCatObj = dbCategories.find(c => c.name === selectedCategory);
      const categoryId = selectedCatObj ? selectedCatObj.id : null;
      if (!categoryId) {
        setDbSubCategories([]);
        setSelectedSubCategory('');
        return;
      }
      try {
        const subRes = await fetch(`${API_BASE_URL}/api/masters/subcategories?categoryId=${categoryId}`);
        if (subRes.ok) {
          const subs = await subRes.json();
          setDbSubCategories(subs);
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };
    fetchSubCategories();
  }, [selectedCategory, dbCategories]);

  // Fetch districts when selectedDivisionId changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedDivisionId) {
        setDbDistricts([]);
        return;
      }
      try {
        const distRes = await fetch(`${API_BASE_URL}/api/geo/divisions/${selectedDivisionId}/districts`);
        if (distRes.ok) {
          const dists = await distRes.json();
          setDbDistricts(dists);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, [selectedDivisionId]);

  // Fetch blocks and municipalities when pertainDistrict changes
  useEffect(() => {
    const fetchBlocksAndMunicipalities = async () => {
      if (!pertainDistrict) {
        setDbBlocks([]);
        setDbMunicipalities([]);
        setSelectedBlockId('');
        setSelectedMunicipalityId('');
        setSelectedBlock('');
        setSelectedMunicipality('');
        return;
      }
      const selectedDistObj = dbDistricts.find(d => d.name === pertainDistrict);
      const districtId = selectedDistObj ? selectedDistObj.id : null;
      if (!districtId) {
        setDbBlocks([]);
        setDbMunicipalities([]);
        setSelectedBlockId('');
        setSelectedMunicipalityId('');
        setSelectedBlock('');
        setSelectedMunicipality('');
        return;
      }
      try {
        const blockRes = await fetch(`${API_BASE_URL}/api/geo/districts/${districtId}/blocks`);
        if (blockRes.ok) {
          const blocks = await blockRes.json();
          setDbBlocks(blocks);
        }
        const muniRes = await fetch(`${API_BASE_URL}/api/geo/districts/${districtId}/municipalities`);
        if (muniRes.ok) {
          const munis = await muniRes.json();
          setDbMunicipalities(munis);
        }
      } catch (error) {
        console.error('Error fetching blocks or municipalities:', error);
      }
    };
    fetchBlocksAndMunicipalities();
  }, [pertainDistrict, dbDistricts]);

  // Fetch panchayats when selectedBlockId changes
  useEffect(() => {
    const fetchPanchayats = async () => {
      if (!selectedBlockId) {
        setDbPanchayats([]);
        setSelectedPanchayat('');
        return;
      }
      try {
        const panRes = await fetch(`${API_BASE_URL}/api/geo/blocks/${selectedBlockId}/panchayats`);
        if (panRes.ok) {
          const pans = await panRes.json();
          setDbPanchayats(pans);
        }
      } catch (error) {
        console.error('Error fetching panchayats:', error);
      }
    };
    fetchPanchayats();
  }, [selectedBlockId]);

  // Fetch wards when selectedMunicipalityId changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedMunicipalityId) {
        setDbWards([]);
        setSelectedWard('');
        return;
      }
      try {
        const wardRes = await fetch(`${API_BASE_URL}/api/geo/municipalities/${selectedMunicipalityId}/wards`);
        if (wardRes.ok) {
          const wrds = await wardRes.json();
          setDbWards(wrds);
        }
      } catch (error) {
        console.error('Error fetching wards:', error);
      }
    };
    fetchWards();
  }, [selectedMunicipalityId]);

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
            id: g.id,
            uniqId: g.uniqId || `JK-${100000 + g.id}-${new Date().getFullYear()}`,
            refNum: g.uniqId || `JK-${100000 + g.id}-${new Date().getFullYear()}`,
            type: g.windowType === 'Raabita' ? 'appeal' : 'grievance',
            department: g.department,
            category: g.grievanceCategory,
            subject: g.description ? g.description.substring(0, 45) + '...' : 'Grievance',
            description: g.description,
            date: g.createdAt ? new Date(g.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
            status: g.status || 'Pending',
            source: g.windowType || 'Web',
            citizenName: g.citizenName,
            citizenPhone: g.citizenPhone,
            submittedBy: g.submittedBy
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

  // Lodge Appeal Handlers
  const handleGrievanceSelect = (gId) => {
    setSelectedGrievanceId(gId);
    if (!gId) {
      setSelectedGrievance(null);
      return;
    }
    const found = grievances.find(g => (g.id && g.id.toString() === gId.toString()) || g.refNum === gId || g.uniqId === gId);
    setSelectedGrievance(found || null);
  };

  const handleDescriptionChange = (val) => {
    if (val.length <= 3000) {
      setAppealDescription(val);
    }
  };

  const handleAppealFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setAppealFile(e.target.files[0]);
    } else {
      setAppealFile(null);
    }
  };

  const handleAppealSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrievanceId) {
      alert("Please select a Grievance ID.");
      return;
    }
    if (!appealDescription.trim()) {
      alert("Please enter the details of the appeal.");
      return;
    }

    const payload = {
      grievanceId: parseInt(selectedGrievanceId),
      description: appealDescription,
      fileName: appealFile ? appealFile.name : null,
      filePath: appealFile ? 'uploads/' + appealFile.name : null
    };

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/appeals/appealSubmit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Appeal submitted successfully!");

        // Update status of the appealed grievance in the parent list
        if (setGrievances) {
          setGrievances(prev => prev.map(g => {
            if (g.id.toString() === selectedGrievanceId.toString()) {
              return { ...g, status: 'Appealed' };
            }
            return g;
          }));
        }

        // Reset states
        setSelectedGrievanceId('');
        setSelectedGrievance(null);
        setAppealDescription('');
        setAppealFile(null);

        // Redirect back to dashboard
        setActiveView('dashboard');
      } else {
        const errorData = await res.json();
        alert("Failed to submit appeal: " + (errorData.error || res.statusText));
      }
    } catch (err) {
      console.error("Error submitting appeal:", err);
      alert("Failed to submit appeal. Please try again.");
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
    if (municipalityOrBlock === 'Block' && !selectedBlock) {
      alert("Please select block.");
      return;
    }
    if (municipalityOrBlock === 'Municipality' && !selectedMunicipality) {
      alert("Please select municipality.");
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
      mobile: user?.phone || user?.mobile || '9339399397',
      email: user?.email || 'NA',
      gender: user?.gender || 'MALE',
      dateOfBirth: user?.dateOfBirth || '2003-10-02',
      address: user?.address || 'NA',
      pincode: user?.pincode || 'NA',
      state: user?.state || 'Other',
      district: user?.district || 'Other',
      windowType: windowType,
      department: selectedDept,
      grievanceCategory: selectedCategory,
      subCategory: selectedSubCategory,
      pertainDivision: pertainDivision,
      pertainDistrict: pertainDistrict,
      municipalityOrBlock: municipalityOrBlock,
      blockName: municipalityOrBlock === 'Block' ? selectedBlock : '',
      panchayatName: municipalityOrBlock === 'Block' ? selectedPanchayat : '',
      municipalityName: municipalityOrBlock === 'Municipality' ? selectedMunicipality : '',
      wardName: municipalityOrBlock === 'Municipality' ? selectedWard : '',
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

        const deptObj = dbDepartments.find(d => String(d.id) === String(selectedDept));
        const deptName = deptObj ? deptObj.name : 'PUBLIC GRIEVANCES DEPARTMENT';

        const newGrievance = {
          id: savedGrievance.id,
          uniqId: savedGrievance.uniqId || `JK-${100000 + savedGrievance.id}-${new Date().getFullYear()}`,
          refNum: savedGrievance.uniqId || `JK-${100000 + savedGrievance.id}-${new Date().getFullYear()}`,
          type: windowType === 'Raabita' ? 'appeal' : 'grievance',
          department: deptName,
          category: selectedCategory,
          subject: description.substring(0, 45) + '...',
          description: description,
          date: savedGrievance.createdAt ? new Date(savedGrievance.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
          status: savedGrievance.status || 'Pending',
          source: windowType,
          citizenName: payload.name,
          citizenPhone: payload.mobile,
          submittedBy: {
            id: user?.id,
            name: payload.name,
            mobile: payload.mobile,
            email: payload.email,
            gender: payload.gender
          }
        };

        setGrievances((prev) => [newGrievance, ...prev]);

        setSubmittedGrievanceDetails({
          uniqId: newGrievance.refNum,
          date: newGrievance.date,
          name: payload.name,
          department: deptName
        });

        // Reset
        setWindowType('Samadhan');
        setSelectedDept('');
        setSelectedCategory('');
        setSelectedSubCategory('');
        setPertainDivision('');
        setPertainDistrict('');
        setMunicipalityOrBlock('');
        setSelectedBlock('');
        setSelectedPanchayat('');
        setSelectedMunicipality('');
        setSelectedWard('');
        setSelectedBlockId('');
        setSelectedMunicipalityId('');
        setDescription('');
        setDocFile(null);
        setMediaFile(null);
        setPsgAct(null);
        setGrievanceLocation('');

        setActiveView('acknowledgment');
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
    dbDepartments.forEach(d => {
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
        id: 1,
        uniqId: 'JK-283941-2026',
        refNum: 'JK-283941-2026',
        type: 'grievance',
        department: 'Power Development Department (PDD)',
        category: 'Faulty Transformer',
        subject: 'Repeated power fluctuations and faulty transformer in Sector 3',
        description: 'The local transformer has caught fire twice and voltage fluctuation is damaging household electronics.',
        date: '18/06/2026',
        status: 'Pending',
        source: 'Web',
        citizenName: user?.name || 'SAI SRUJAN RALLABANDI',
        citizenPhone: user?.phone || '9339399397'
      },
      {
        id: 2,
        uniqId: 'JK-198274-2026',
        refNum: 'JK-198274-2026',
        type: 'grievance',
        department: 'Housing & Urban Development Department',
        category: 'Garbage Collection',
        subject: 'Irregular waste disposal and blocked sewers in Ward 9',
        description: 'Waste disposal trucks have not visited Ward 9 in two weeks. Drainage is blocked causing health hazards.',
        date: '12/06/2026',
        status: 'Resolved',
        source: 'Mobile',
        citizenName: user?.name || 'SAI SRUJAN RALLABANDI',
        citizenPhone: user?.phone || '9339399397'
      },
      {
        id: 3,
        uniqId: 'JK-304928-2026',
        refNum: 'JK-304928-2026',
        type: 'grievance',
        department: 'Jal Shakti (PHE) Department',
        category: 'Water Scarcity',
        subject: 'No drinking water supply for 5 consecutive days',
        description: 'Water pipeline in Anantnag block has ruptured, leading to no clean drinking water availability.',
        date: '05/06/2026',
        status: 'Rejected',
        source: 'Web',
        citizenName: user?.name || 'SAI SRUJAN RALLABANDI',
        citizenPhone: user?.phone || '9339399397'
      },
      {
        id: 4,
        uniqId: 'JK-APL-492019-2026',
        refNum: 'JK-APL-492019-2026',
        type: 'appeal',
        department: 'School Education Department',
        category: 'School Infrastructure',
        subject: 'Appeal regarding delayed mid-day meal quality inspection',
        description: 'First grievance was marked resolved but the food quality is still subpar. Seeking secondary investigation.',
        date: '22/06/2026',
        status: 'Appealed',
        source: 'Web',
        citizenName: user?.name || 'SAI SRUJAN RALLABANDI',
        citizenPhone: user?.phone || '9339399397'
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
              <span className="bg-[#f06e30] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full scale-90">3.0</span>
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
        <aside className={`bg-[#1f2e42] text-white flex flex-col justify-between shrink-0 select-none transition-all duration-300 z-30 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden'
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
                    {activeView === 'acknowledgment' ? 'Acknowledgment' : activeView === 'lodge_appeal' ? 'Lodge Appeal' : 'Lodge Grievance'}
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
          ) : activeView === 'acknowledgment' ? (
            /* Acknowledgment Slip Screen */
            <div className="flex flex-col items-center justify-start min-h-[calc(100vh-150px)] p-4 md:p-8 bg-slate-100/50 rounded-2xl border border-slate-200">

              {/* Slip Document */}
              <div className="bg-white shadow-xl max-w-3xl w-full p-8 md:p-12 border border-slate-300 font-serif text-slate-800 relative leading-relaxed text-left print:shadow-none print:border-none print:p-0">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-400 pb-4 mb-6">
                  <img src={emblemImg} className="h-16 md:h-20 w-auto object-contain" alt="Emblem" />
                  <div className="text-center flex-1 mx-4 space-y-1">
                    <h1 className="text-sm md:text-lg font-bold uppercase font-sans text-slate-900 tracking-wide">Government of Jammu and Kashmir</h1>
                    <h2 className="text-xs md:text-base font-bold uppercase font-sans text-slate-800">Department of Public Grievances</h2>
                    <p className="text-[9px] md:text-[10px] text-slate-650 font-sans">
                      web portal: <span className="underline text-blue-600 font-mono">samadhan.jk.gov.in</span> email: <span className="underline text-blue-600 font-mono">jk-grievance@jk.gov.in</span>
                    </p>
                  </div>
                  <img src={logoImg} className="h-16 md:h-20 w-auto object-contain" alt="JK Samadhan 3.0" />
                </div>

                {/* Subject Line */}
                <div className="mb-6">
                  <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Subject: Acknowledgment of Grievance Registration - {submittedGrievanceDetails?.uniqId}
                  </h3>
                </div>

                {/* Letter Body */}
                <div className="space-y-4 text-[11px] md:text-xs font-medium text-slate-800">
                  <p>Sir / Madam <span className="font-bold uppercase text-slate-950">{submittedGrievanceDetails?.name}</span>,</p>

                  <p>
                    Your grievance has been registered on <strong className="text-slate-950">JK Samadhan Portal</strong> with Grievance ID <strong className="font-sans font-black text-slate-950">{submittedGrievanceDetails?.uniqId}</strong> on <strong className="font-sans text-slate-950">{submittedGrievanceDetails?.date}</strong>. Your grievance has been forwarded to the <strong className="text-slate-950 uppercase">{submittedGrievanceDetails?.department}</strong> for redressal / appropriate action.
                  </p>

                  <p>
                    You can track the progress of your grievance online by visiting the Jammu and Kashmir Government Grievance Portal - JK Samadhan ( <span className="underline text-blue-700 font-bold font-mono">https://samadhan.jk.gov.in/trackApp</span> ) by entering your <strong className="text-slate-950">Grievance ID and Phone No</strong> (provided in your application).
                  </p>
                </div>

                {/* Signature Block */}
                <div className="mt-12 flex flex-col items-end text-[10px] md:text-[11px] font-sans text-slate-800 text-right space-y-1">
                  <p className="italic mb-4">Yours Sincerely,</p>
                  <p className="font-bold text-slate-900">Department of Public Grievances</p>
                  <p>Civil Secretariat, Jammu</p>
                  <p>Church Lane, Sonwar, Srinagar</p>
                  <p className="text-[9px] text-slate-650 mt-1">Tele Nos.: 0191-2560265, 2560110, 2566182 (Jammu)</p>
                  <p className="text-[9px] text-slate-650">0194-2483236, 2502910, 2502911 (Srinagar)</p>
                  <p className="text-[9px] text-slate-650">Toll Free No: 1905 (J&K)</p>
                </div>

                {/* Warning Footer */}
                <div className="mt-12 text-center border-t border-slate-200 pt-4">
                  <p className="text-[9px] md:text-[10px] font-bold text-red-600 tracking-wider">
                    This is an automated, system-generated acknowledgement slip.
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-[#164581] hover:bg-[#0f305c] text-white text-xs font-black uppercase tracking-wider rounded shadow transition-all cursor-pointer flex items-center gap-1.5 border-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Slip</span>
                </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded shadow transition-all cursor-pointer border-0"
                >
                  Go to Dashboard
                </button>
              </div>

            </div>
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
          ) : activeView === 'lodge_appeal' ? (
            /* Lodge Appeal Form */
            <div className="space-y-6">
              <form onSubmit={handleAppealSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 text-left space-y-6">

                {/* Lodge Appeal Header */}
                <div>
                  <h3 className="text-sm font-bold text-[#164581] mb-3 uppercase tracking-wide">
                    Lodge Appeal
                  </h3>
                  <hr className="border-slate-200 mb-4" />
                </div>

                {/* Grievance ID Select */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px]">Grievance ID: *</span>
                  <select
                    value={selectedGrievanceId}
                    onChange={(e) => handleGrievanceSelect(e.target.value)}
                    className="flex-1 max-w-md border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] cursor-pointer"
                  >
                    <option value="">Select</option>
                    {grievances.map(g => (
                      <option key={g.id || g.refNum} value={g.id || g.refNum}>{g.uniqId || g.refNum}</option>
                    ))}
                  </select>
                </div>

                {/* Grievance Details Section */}
                <div>
                  <h3 className="text-sm font-bold text-[#164581] mb-3 uppercase tracking-wide">
                    Grievance Details
                  </h3>
                  <div className="border border-slate-200 rounded overflow-hidden divide-y divide-slate-200 text-xs">
                    {/* Row 1 */}
                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
                      <div className="flex-1 flex">
                        <div className="w-1/3 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Name:</div>
                        <div className="w-2/3 px-4 py-2.5 font-medium text-slate-800 uppercase">
                          {selectedGrievance ? (selectedGrievance.citizenName || user?.name) : ''}
                        </div>
                      </div>
                      <div className="flex-1 flex">
                        <div className="w-1/3 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Mobile No.:</div>
                        <div className="w-2/3 px-4 py-2.5 font-medium text-slate-800">
                          {selectedGrievance ? (selectedGrievance.citizenPhone || user?.phone) : ''}
                        </div>
                      </div>
                    </div>
                    {/* Row 2 */}
                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
                      <div className="flex-1 flex">
                        <div className="w-1/3 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Email Id:</div>
                        <div className="w-2/3 px-4 py-2.5 font-medium text-slate-800">
                          {selectedGrievance ? (selectedGrievance.submittedBy?.email || user?.email) : ''}
                        </div>
                      </div>
                      <div className="flex-1 flex">
                        <div className="w-1/3 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Address:</div>
                        <div className="w-2/3 px-4 py-2.5 font-medium text-slate-800 uppercase">
                          {user?.address || 'NA'}
                        </div>
                      </div>
                    </div>
                    {/* Row 3 */}
                    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
                      <div className="flex-1 flex">
                        <div className="w-1/3 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Department:</div>
                        <div className="w-2/3 px-4 py-2.5 font-medium text-slate-800 uppercase">
                          {selectedGrievance ? selectedGrievance.department : ''}
                        </div>
                      </div>
                      <div className="flex-1 flex">
                        <div className="w-1/3 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Category:</div>
                        <div className="w-2/3 px-4 py-2.5 font-medium text-slate-800 uppercase">
                          {selectedGrievance ? selectedGrievance.grievanceCategory : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Textarea */}
                <div className="flex flex-col sm:flex-row gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px] pt-2">Details: *</span>
                  <div className="flex-1 max-w-xl space-y-1">
                    <textarea
                      value={appealDescription}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      placeholder="Details of appeal."
                      rows={5}
                      className="w-full border border-slate-350 rounded px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] resize-y"
                    ></textarea>
                    <div className="flex justify-between font-bold text-red-650 scale-95 origin-left">
                      <span>Remaining word's {3000 - appealDescription.length}.</span>
                      <span>Special characters are not allowed.</span>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="flex flex-col sm:flex-row gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px] pt-1.5">File Upload:</span>
                  <div className="flex-1 max-w-xl space-y-1">
                    <input
                      type="file"
                      onChange={handleAppealFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="w-full border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] cursor-pointer"
                    />
                    <div className="font-bold text-red-650 scale-95 origin-left">
                      JPEG,JPG,PNG,PDF only (5MB)
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-[#164581] hover:bg-[#0f305c] text-white text-xs font-black uppercase tracking-wider rounded-full shadow-md hover:shadow-lg transition-all border-0 cursor-pointer"
                  >
                    Submit Appeal
                  </button>
                </div>

              </form>
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
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800">{user?.phone || user?.mobile || '9339399397'}</div>
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
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800 uppercase">{user?.address || 'NA'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">Pincode:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800">{user?.pincode || 'NA'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">State:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800 uppercase">{user?.state || 'Other'}</div>
                    </div>
                    <div className="flex">
                      <div className="w-1/4 bg-[#f8fafc] px-4 py-2.5 font-bold text-slate-700 border-r border-slate-200 flex items-center">District:</div>
                      <div className="w-3/4 px-4 py-2.5 font-medium text-slate-800 uppercase">{user?.district || 'Other'}</div>
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
                    {dbDepartments.map(dept => (
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
                    {dbCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* 4.5 Next level Category of Grievance */}
                {dbSubCategories.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                    <span className="font-bold text-slate-700 min-w-[150px]">Next level Category of Grievance:</span>
                    <select
                      value={selectedSubCategory}
                      onChange={(e) => setSelectedSubCategory(e.target.value)}
                      className="flex-1 max-w-md border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] cursor-pointer"
                    >
                      <option value="">Select</option>
                      {dbSubCategories.map(sub => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 5. Pertain Division */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px]">Pertain Division: *</span>
                  <select
                    value={selectedDivisionId}
                    onChange={(e) => {
                      const divId = e.target.value;
                      setSelectedDivisionId(divId);
                      const selectedDivObj = dbDivisions.find(d => String(d.id) === String(divId));
                      setPertainDivision(selectedDivObj ? selectedDivObj.name : '');
                      setPertainDistrict('');
                    }}
                    className="flex-1 max-w-md border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] cursor-pointer"
                  >
                    <option value="">Select Division</option>
                    {dbDivisions.map(div => (
                      <option key={div.id} value={div.id}>{div.name}</option>
                    ))}
                  </select>
                </div>

                {/* 6. Pertain District */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700 min-w-[150px]">Pertain District: *</span>
                  <select
                    value={pertainDistrict}
                    disabled={!selectedDivisionId}
                    onChange={(e) => setPertainDistrict(e.target.value)}
                    className="flex-1 max-w-md border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                  >
                    <option value="">Select District</option>
                    {dbDistricts.map(dist => (
                      <option key={dist.id} value={dist.name}>{dist.name}</option>
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

                {/* Municipality & Ward Section */}
                {municipalityOrBlock === 'Municipality' && (
                  <div className="flex flex-col sm:flex-row gap-4 text-xs">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <span className="font-bold text-slate-700">Municipality *</span>
                      <select
                        value={selectedMunicipality}
                        onChange={(e) => {
                          const name = e.target.value;
                          setSelectedMunicipality(name);
                          const obj = dbMunicipalities.find(m => m.name === name);
                          setSelectedMunicipalityId(obj ? obj.id : '');
                          setSelectedWard('');
                        }}
                        className="w-full border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] cursor-pointer"
                      >
                        <option value="">Select Municipality</option>
                        {dbMunicipalities.map(muni => (
                          <option key={muni.id} value={muni.name}>{muni.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5">
                      <span className="font-bold text-slate-700">Ward</span>
                      <select
                        value={selectedWard}
                        disabled={!selectedMunicipalityId}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="w-full border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                      >
                        <option value="">Select Ward</option>
                        {dbWards.map(ward => (
                          <option key={ward.id} value={ward.name}>{ward.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Block & Panchayat Section */}
                {municipalityOrBlock === 'Block' && (
                  <div className="flex flex-col sm:flex-row gap-4 text-xs">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <span className="font-bold text-slate-700">Block *</span>
                      <select
                        value={selectedBlock}
                        onChange={(e) => {
                          const name = e.target.value;
                          setSelectedBlock(name);
                          const obj = dbBlocks.find(b => b.name === name);
                          setSelectedBlockId(obj ? obj.id : '');
                          setSelectedPanchayat('');
                        }}
                        className="w-full border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] cursor-pointer"
                      >
                        <option value="">Select Block</option>
                        {dbBlocks.map(block => (
                          <option key={block.id} value={block.name}>{block.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5">
                      <span className="font-bold text-slate-700">Panchayat</span>
                      <select
                        value={selectedPanchayat}
                        disabled={!selectedBlockId}
                        onChange={(e) => setSelectedPanchayat(e.target.value)}
                        className="w-full border border-slate-350 rounded bg-white px-3 py-2 outline-none font-medium text-slate-800 focus:border-[#164581] disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                      >
                        <option value="">Select Panchayat</option>
                        {dbPanchayats.map(pan => (
                          <option key={pan.id} value={pan.name}>{pan.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

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
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-0 shadow cursor-pointer transition-all ${isListening
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
