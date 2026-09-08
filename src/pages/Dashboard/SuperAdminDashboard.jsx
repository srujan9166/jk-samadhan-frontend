import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as ChartTooltip, PieChart as ChartPieChart, Pie, Cell, Legend, BarChart as ChartBarChart, Bar } from 'recharts';
import {
  Menu,
  ChevronDown,
  ChevronRight,
  PlaySquare,
  PieChart,
  Calendar,
  ThumbsUp,
  AlertCircle,
  FileText,
  Presentation,
  ClipboardList,
  Flag,
  RefreshCw,
  Filter,
  FileSpreadsheet,
  Search,
  Plus,
  Bell,
  User,
  LogOut,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  Sliders,
  Users,
  Building,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  Copy,
  LayoutDashboard,
  Network,
  Database,
  MessageSquare,
  Flame,
  Map,
  Clock,
  UserCheck,
  Download,
  Minimize2,
  Maximize2,
  KeyRound,
  EyeOff,
  X
} from 'lucide-react';
import grievanceService from '../../services/grievanceService';
import adminService from '../../services/adminService';
import axiosClient from '../../api/axiosClient';
import emblemImg from '../../assets/emblem.png';
import logoImg from '../../assets/logo.png';
import CitizenRegistrationReport from './CitizenRegistrationReport';
import JkIgramsDashboardView from './JkIgramsDashboardView';
import CreateAnnouncementModal from '../../components/modals/CreateAnnouncementModal';

const SUPPORTED_ROLES_MAP = {
  'ROLE_SuperAdmin': 'Super Admin',
  'ROLE_Secretary': 'Secretary',
  'ROLE_DM': 'DM',
  'ROLE_DealingHand': 'Dealing Hand'
};

export default function SuperAdminDashboard({ user, onLogout }) {
  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('Home'); // 'Home', 'JK-IGRAMS', 'CPGRAMS', 'HLG Mulaqaat'

  // Server-side paging, sorting, and filtering state
  const [sortColumn, setSortColumn] = useState('id');
  const [sortDirection, setSortDirection] = useState('DESC');
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summaryStats, setSummaryStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [homeDistrictFilter, setHomeDistrictFilter] = useState('');
  const [homeCategoryFilter, setHomeCategoryFilter] = useState('');
  const [homeDateFromFilter, setHomeDateFromFilter] = useState('');
  const [homeDateToFilter, setHomeDateToFilter] = useState('');
  const [homeOriginFilter, setHomeOriginFilter] = useState('');
  const [homeFinalStatusFilter, setHomeFinalStatusFilter] = useState('');
  const [homeKeyFlagFilter, setHomeKeyFlagFilter] = useState('');
  const [homeModeFilter, setHomeModeFilter] = useState('');
  const [homeRadioFilter, setHomeRadioFilter] = useState('all');
  const [showHomeFilterDrawer, setShowHomeFilterDrawer] = useState(false);
  const [homeCategoriesList, setHomeCategoriesList] = useState([]);

  // Asynchronous Complete Excel Export State
  const [exportJobId, setExportJobId] = useState(null);
  const [exportStatus, setExportStatus] = useState('IDLE'); // 'IDLE', 'STARTING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'
  const [exportProgress, setExportProgress] = useState(0);
  const [exportTotalRecords, setExportTotalRecords] = useState(0);
  const [exportProcessedRecords, setExportProcessedRecords] = useState(0);
  const [exportErrorMessage, setExportErrorMessage] = useState('');
  const [showExportBanner, setShowExportBanner] = useState(false);
  const [isExportMinimized, setIsExportMinimized] = useState(false);
  const [activeExportFormat, setActiveExportFormat] = useState('Excel');
  
  // Account Settings - Change Password State
  const [cpCurrentPassword, setCpCurrentPassword] = useState('');
  const [cpNewPassword, setCpNewPassword] = useState('');
  const [cpConfirmPassword, setCpConfirmPassword] = useState('');
  const [cpShowCurrent, setCpShowCurrent] = useState(false);
  const [cpShowNew, setCpShowNew] = useState(false);
  const [cpShowConfirm, setCpShowConfirm] = useState(false);
  const [cpError, setCpError] = useState('');
  const [cpSuccess, setCpSuccess] = useState('');
  const [cpLoading, setCpLoading] = useState(false);

  // Announcement Modal State
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);

  const exportPollTimerRef = useRef(null);

  const handleAccountChangePassword = async (e) => {
    e.preventDefault();
    setCpError('');
    setCpSuccess('');

    if (!cpCurrentPassword.trim()) {
      setCpError('Please enter your current password.');
      return;
    }
    if (!cpNewPassword.trim()) {
      setCpError('Please enter a new password.');
      return;
    }
    if (!cpConfirmPassword.trim()) {
      setCpError('Please confirm your new password.');
      return;
    }
    if (cpNewPassword !== cpConfirmPassword) {
      setCpError('New password and confirm password do not match.');
      return;
    }
    if (cpNewPassword === cpCurrentPassword) {
      setCpError('New password must be different from current password.');
      return;
    }
    if (cpNewPassword.length < 8) {
      setCpError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(cpNewPassword) || !/[a-z]/.test(cpNewPassword) || !/[0-9]/.test(cpNewPassword) || !/[^A-Za-z0-9]/.test(cpNewPassword)) {
      setCpError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    }

    setCpLoading(true);
    try {
      const response = await axiosClient.post('/api/auth/change-password', {
        currentPassword: cpCurrentPassword,
        newPassword: cpNewPassword,
        confirmPassword: cpConfirmPassword,
      });

      setCpSuccess(response.data?.message || 'Password changed successfully! Logging out...');
      setTimeout(() => {
        if (onLogout) {
          onLogout();
        } else {
          window.location.href = '/';
        }
      }, 2000);
    } catch (err) {
      const apiError = err.response?.data?.error || err.response?.data?.message || 'Failed to change password. Please verify your current password.';
      setCpError(apiError);
    } finally {
      setCpLoading(false);
    }
  };

  // Clean up any export poll timers on unmount
  useEffect(() => {
    return () => {
      if (exportPollTimerRef.current) {
        clearInterval(exportPollTimerRef.current);
        exportPollTimerRef.current = null;
      }
    };
  }, []);

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mappingMenuOpen, setMappingMenuOpen] = useState(true);
  const [misMenuOpen, setMisMenuOpen] = useState(true);
  const [sidebarActiveItem, setSidebarActiveItem] = useState('Super Admin Dashboard');

  // User Profile states
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [profileSubTab, setProfileSubTab] = useState('Overview'); // 'Overview', 'ChangePassword'
  const [mobileOTP, setMobileOTP] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState('');

  // Active Modals
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [viewingGrievance, setViewingGrievance] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showDeptMappingModal, setShowDeptMappingModal] = useState(false);
  const [showCreateNodalModal, setShowCreateNodalModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [openActionDropdownId, setOpenActionDropdownId] = useState(null);

  // Form states
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementType, setAnnouncementType] = useState('General');
  const [actionRemark, setActionRemark] = useState('');
  const [actionStatus, setActionStatus] = useState('In Progress');

  // Create User Form State (reference screenshot layout)
  const [createUserForm, setCreateUserForm] = useState({
    userType: '',
    firstName: '',
    middleName: '',
    lastName: '',
    mobile: '',
    email: '',
    officeName: '',
    designation: '',
    password: ''
  });

  // Nodal creation states
  const [designations, setDesignations] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [existingNodal, setExistingNodal] = useState(null);
  const [isCheckingNodal, setIsCheckingNodal] = useState(false);
  const [deptUsers, setDeptUsers] = useState([]);
  const [selectedUserAction, setSelectedUserAction] = useState('0');

  // Appeal Dashboard States
  const [appeals, setAppeals] = useState([]);
  const [appealSummary, setAppealSummary] = useState(null);
  const [appealCurrentPage, setAppealCurrentPage] = useState(1);
  const [appealEntriesPerPage, setAppealEntriesPerPage] = useState(10);
  const [appealSearchQuery, setAppealSearchQuery] = useState('');
  const [appealTotalElements, setAppealTotalElements] = useState(0);
  const [appealTotalPages, setAppealTotalPages] = useState(0);
  const [appealSortColumn, setAppealSortColumn] = useState('id');
  const [appealSortDirection, setAppealSortDirection] = useState('DESC');
  const [isAppealLoading, setIsAppealLoading] = useState(true);

  // Appeal MIS Report States
  const [appealMisData, setAppealMisData] = useState([]);
  const [appealMisCurrentPage, setAppealMisCurrentPage] = useState(1);
  const [appealMisEntriesPerPage, setAppealMisEntriesPerPage] = useState(10);
  const [appealMisSearchQuery, setAppealMisSearchQuery] = useState('');
  const [appealMisTotalElements, setAppealMisTotalElements] = useState(0);
  const [appealMisTotalPages, setAppealMisTotalPages] = useState(0);
  const [appealMisDeptFilter, setAppealMisDeptFilter] = useState('0');
  const [isAppealMisLoading, setIsAppealMisLoading] = useState(false);

  // Analytical Dashboard Filter & Data States
  const [analDept, setAnalDept] = useState('');
  const [analCat, setAnalCat] = useState('');
  const [analSubCat, setAnalSubCat] = useState('');
  const [analSubCatL2, setAnalSubCatL2] = useState('');
  const [analSubCatL3, setAnalSubCatL3] = useState('');
  const [analSubCatL4, setAnalSubCatL4] = useState('');
  const [analStatus, setAnalStatus] = useState('');
  const [analSubStatus, setAnalSubStatus] = useState('');
  const [analWindow, setAnalWindow] = useState('');
  const [analFromDate, setAnalFromDate] = useState('');
  const [analToDate, setAnalToDate] = useState('');
  const [analOperand, setAnalOperand] = useState('');
  const [analOperator, setAnalOperator] = useState('');
  const [analAdminType, setAnalAdminType] = useState('');
  const [analAiTracking, setAnalAiTracking] = useState('');
  const [analAiClassification, setAnalAiClassification] = useState('');
  const [analMode, setAnalMode] = useState('');
  const [analDistrict, setAnalDistrict] = useState('');
  const [analDistrictsList, setAnalDistrictsList] = useState([]);
  const [analRadioFilter, setAnalRadioFilter] = useState('all');
  const [showAnalFilterDrawer, setShowAnalFilterDrawer] = useState(false);

  const [analCategoriesList, setAnalCategoriesList] = useState([]);
  const [analSubCategoriesList, setAnalSubCategoriesList] = useState([]);

  const [analGrievances, setAnalGrievances] = useState([]);
  const [analSummary, setAnalSummary] = useState(null);
  const [analCurrentPage, setAnalCurrentPage] = useState(1);
  const [analEntriesPerPage, setAnalEntriesPerPage] = useState(10);
  const [analSearchQuery, setAnalSearchQuery] = useState('');
  const [analTotalElements, setAnalTotalElements] = useState(0);
  const [analTotalPages, setAnalTotalPages] = useState(0);
  const [analSortColumn, setAnalSortColumn] = useState('id');
  const [analSortDirection, setAnalSortDirection] = useState('DESC');
  const [isAnalLoading, setIsAnalLoading] = useState(true);
  const [isAnalSummaryLoading, setIsAnalSummaryLoading] = useState(true);

  const [nodalForm, setNodalForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    mobile: '',
    email: '',
    departmentType: 'OTHER',
    departmentName: '',
    userType: '',
    officeName: '',
    designationName: '',
    password: ''
  });

  const [roles, setRoles] = useState([]);
  const [roleDesignations, setRoleDesignations] = useState([]);
  const [officeDesignationForm, setOfficeDesignationForm] = useState({
    roleId: '',
    designationId: ''
  });
  const [editMappingId, setEditMappingId] = useState(null);

  // Designation master states
  const [designationSubTab, setDesignationSubTab] = useState('mappings'); // 'mappings' or 'designations'
  const [newDesignationName, setNewDesignationName] = useState('');
  const [editDesignationId, setEditDesignationId] = useState(null);
  const [designationSearchQuery, setDesignationSearchQuery] = useState('');
  const [designationEntriesToShow, setDesignationEntriesToShow] = useState(10);
  const [designationCurrentPage, setDesignationCurrentPage] = useState(1);

  // Table search and pagination state for mapping
  const [mappingSearchQuery, setMappingSearchQuery] = useState('');
  const [mappingEntriesToShow, setMappingEntriesToShow] = useState(10);
  const [mappingCurrentPage, setMappingCurrentPage] = useState(1);

  // Dashboard Stats State from Backend
  const [stats, setStats] = useState({
    totalG: '0',
    web: '0',
    App: '0',
    pending: '0',
    resolved: '0',
    rejected: '0',
    totalClosed: '0',
    appealReceviedCount: '0',
    forwarded: '0',
    dNpCount: '0',
    cpgramClosed: '0',
    fwdToCPGRAM: '0',
    totalCPGRAM: '0',
    priorityFlagCount: '0',
    loggedInUserFullName: '',
    userDepartment: ''
  });

  // Department Mapping Form State
  const [mappingData, setMappingData] = useState({
    depts: [],
    cat: [],
    allData: [],
    nodalD: []
  });
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCat, setSelectedCat] = useState('0');
  const [newCatName, setNewCatName] = useState('');
  const [reminderDays, setReminderDays] = useState('7');
  const [subCat, setSubCat] = useState('0');
  const [newSubCatName, setNewSubCatName] = useState('');
  const [subCatL2, setSubCatL2] = useState('0');
  const [newSubCatL2Name, setNewSubCatL2Name] = useState('');
  const [subCatL3, setSubCatL3] = useState('0');
  const [newSubCatL3Name, setNewSubCatL3Name] = useState('');
  const [subCatL4, setSubCatL4] = useState('0');
  const [newSubCatL4Name, setNewSubCatL4Name] = useState('');
  const [sessionName, setSessionName] = useState('');

  // Department Mapping Custom Page State
  const [departments, setDepartments] = useState([]);
  const [isDeptLoading, setIsDeptLoading] = useState(false);
  const [deptType, setDeptType] = useState('');
  const [deptNameSelect, setDeptNameSelect] = useState('');
  const [customDeptName, setCustomDeptName] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [designation, setDesignation] = useState('');

  // Table state inside Department Mapping
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [filterDeptTypeTable, setFilterDeptTypeTable] = useState('');
  const [tableEntriesPerPage, setTableEntriesPerPage] = useState(10);
  const [tableCurrentPage, setTableCurrentPage] = useState(1);

  // Edit Department Modal State
  const [editDeptModal, setEditDeptModal] = useState({
    isOpen: false,
    id: null,
    name: '',
    type: ''
  });

  // User details
  const adminName = stats.loggedInUserFullName || user?.name || user?.username || 'Super Admin';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: entriesPerPage,
        search: searchQuery,
        sortBy: sortColumn,
        sortDirection: sortDirection,
        status: statusFilter,
        department: deptFilter,
        district: homeDistrictFilter,
        category: homeCategoryFilter,
        dateFrom: homeDateFromFilter,
        dateTo: homeDateToFilter,
        origin: homeOriginFilter,
        finalStatus: homeFinalStatusFilter,
        keyFlag: homeKeyFlagFilter
      };

      const res = await grievanceService.getSuperAdminGrievances(params);
      if (res && res.content) {
        const formatted = res.content.map((g, idx) => ({
          id: g.id,
          grievanceId: g.uniqId || `GRV2026/${g.id}`,
          docUploaded: g.documents || g.documentUploaded || (g.attachments && g.attachments.length > 0) ? 'Yes' : 'No',
          mode: (() => {
            const wt = (g.windowType || '').toUpperCase();
            if (wt === 'JKSAMADHAN' || wt === 'WEB' || wt === 'ONLINE') return 'web';
            if (wt === 'RAABITA' || wt === 'MOBILE' || wt === 'APP' || wt === 'OFFLINE') return 'mobile';
            return g.windowType || 'web';
          })(),
          privilege: 'Normal',
          mobile: g.citizenPhone || g.mobile || 'N/A',
          lastActionDate: g.updatedAt || g.createdAt || 'N/A',
          department: g.department || 'N/A',
          category: g.grievanceCategory || 'N/A',
          subCategory: g.subCategory || 'N/A',
          subCategoryLevel2: '-',
          subCategoryLevel3: '-',
          subCategoryLevel4: '-',
          submittedBy: g.citizenName || 'N/A',
          receivedFrom: 'NA',
          date: g.createdAt || 'N/A',
          status: g.status || 'Pending',
          aiClassification: 'N/A',
          aiTracking: 'N/A'
        }));
        setGrievances(formatted);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages);
      } else {
        setGrievances([]);
        setTotalElements(0);
        setTotalPages(0);
      }

      // Fetch dynamic stats from dashboard summary aggregation REST API
      const statsData = await grievanceService.getSuperAdminDashboardSummary();
      if (statsData) {
        setSummaryStats(statsData);
        setStats({
          totalG: String(statsData.totalGrievances),
          web: String(statsData.web),
          App: String(statsData.app),
          pending: String(statsData.pending),
          resolved: String(statsData.resolved),
          rejected: String(statsData.rejected),
          totalClosed: String(statsData.resolved + statsData.rejected),
          appealReceviedCount: String(statsData.appealReceivedCount),
          forwarded: String(statsData.forwarded),
          dNpCount: String(statsData.dnpCount),
          cpgramClosed: String(statsData.cpgramClosed),
          fwdToCPGRAM: String(statsData.fwdToCPGRAM),
          totalCPGRAM: String(statsData.totalCPGRAM),
          priorityFlagCount: String(statsData.escalated),
          loggedInUserFullName: user?.name || user?.username || 'Super Admin',
          userDepartment: 'All Departments'
        });
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHomeDeptChange = async (deptName) => {
    setDeptFilter(deptName);
    setHomeCategoryFilter('');
    setHomeCategoriesList([]);

    if (deptName) {
      const matchedDept = departments.find(d => d.name === deptName);
      if (matchedDept) {
        try {
          const res = await axiosClient.get(`/api/masters/categories?deptId=${matchedDept.id}`);
          setHomeCategoriesList(res.data || []);
        } catch (err) {
          console.error("Error fetching home categories:", err);
        }
      }
    }
  };

  const handleHomeReload = async () => {
    if (isLoading) return;
    await loadData();
  };

  const handleHomeExportExcel = async () => {
    if (exportStatus === 'PROCESSING' || exportStatus === 'STARTING') {
      setShowExportBanner(true);
      setIsExportMinimized(false);
      return;
    }

    // Clear any previous polling timer
    if (exportPollTimerRef.current) {
      clearInterval(exportPollTimerRef.current);
      exportPollTimerRef.current = null;
    }

    try {
      setActiveExportFormat('Excel');
      setExportStatus('STARTING');
      setShowExportBanner(true);
      setIsExportMinimized(false);
      setExportProgress(0);
      setExportProcessedRecords(0);
      setExportTotalRecords(0);
      setExportErrorMessage('');

      // Initiate asynchronous export without any dashboard filters
      const startRes = await grievanceService.startSuperAdminExcelExport();
      const jobId = startRes.jobId;
      setExportJobId(jobId);
      setExportStatus('PROCESSING');

      // Begin live polling status every 1.5 seconds
      exportPollTimerRef.current = setInterval(async () => {
        try {
          const statusRes = await grievanceService.getSuperAdminExcelExportStatus(jobId);

          if (statusRes.status === 'CANCELLED') {
            if (exportPollTimerRef.current) {
              clearInterval(exportPollTimerRef.current);
              exportPollTimerRef.current = null;
            }
            setExportStatus('CANCELLED');
            setExportErrorMessage(statusRes.message || 'Export job was cancelled.');
            return;
          }

          setExportProgress(statusRes.progress || 0);
          setExportTotalRecords(statusRes.totalRecords || 0);
          setExportProcessedRecords(statusRes.processedRecords || 0);

          if (statusRes.status === 'COMPLETED') {
            if (exportPollTimerRef.current) {
              clearInterval(exportPollTimerRef.current);
              exportPollTimerRef.current = null;
            }
            setExportStatus('COMPLETED');
            setExportProgress(100);

            // Automatically trigger download
            try {
              await grievanceService.downloadSuperAdminExcelFile(jobId);
            } catch (dlErr) {
              console.error("Auto-download failed:", dlErr);
            }

            // Auto-hide banner after 8 seconds
            setTimeout(() => {
              setShowExportBanner(false);
              setExportStatus('IDLE');
              setExportJobId(null);
            }, 8000);

          } else if (statusRes.status === 'FAILED') {
            if (exportPollTimerRef.current) {
              clearInterval(exportPollTimerRef.current);
              exportPollTimerRef.current = null;
            }
            setExportStatus('FAILED');
            setExportErrorMessage(statusRes.message || 'Export job failed');
          }
        } catch (pollErr) {
          console.error("Export poll error:", pollErr);
        }
      }, 1500);

    } catch (err) {
      console.error("Failed to start export:", err);
      setExportStatus('FAILED');
      setExportErrorMessage(err.response?.data?.message || err.message || 'Failed to start export job');
    }
  };

  const handleCancelExport = async () => {
    if (exportPollTimerRef.current) {
      clearInterval(exportPollTimerRef.current);
      exportPollTimerRef.current = null;
    }

    const currentJobId = exportJobId;
    const isPdf = activeExportFormat === 'PDF';
    setExportStatus('CANCELLED');
    setExportErrorMessage('Export cancelled by user.');

    if (currentJobId) {
      try {
        if (isPdf) {
          await grievanceService.cancelSuperAdminPdfExport(currentJobId);
        } else {
          await grievanceService.cancelSuperAdminExcelExport(currentJobId);
        }
      } catch (err) {
        console.error("Failed to notify backend of cancellation:", err);
      }
    }

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setShowExportBanner(false);
      setExportStatus('IDLE');
      setExportJobId(null);
    }, 4000);
  };

  const handleHomeExportPDF = async () => {
    if (exportStatus === 'PROCESSING' || exportStatus === 'STARTING') {
      setShowExportBanner(true);
      setIsExportMinimized(false);
      return;
    }

    if (exportPollTimerRef.current) {
      clearInterval(exportPollTimerRef.current);
      exportPollTimerRef.current = null;
    }

    try {
      setActiveExportFormat('PDF');
      setExportStatus('STARTING');
      setShowExportBanner(true);
      setIsExportMinimized(false);
      setExportProgress(0);
      setExportProcessedRecords(0);
      setExportTotalRecords(0);
      setExportErrorMessage('');

      // Initiate asynchronous PDF export without any dashboard filters
      const startRes = await grievanceService.startSuperAdminPdfExport();
      const jobId = startRes.jobId;
      setExportJobId(jobId);
      setExportStatus('PROCESSING');

      // Begin live polling status every 1.5 seconds
      exportPollTimerRef.current = setInterval(async () => {
        try {
          const statusRes = await grievanceService.getSuperAdminPdfExportStatus(jobId);

          if (statusRes.status === 'CANCELLED') {
            if (exportPollTimerRef.current) {
              clearInterval(exportPollTimerRef.current);
              exportPollTimerRef.current = null;
            }
            setExportStatus('CANCELLED');
            setExportErrorMessage(statusRes.message || 'PDF export job was cancelled.');
            return;
          }

          setExportProgress(statusRes.progress || 0);
          setExportTotalRecords(statusRes.totalRecords || 0);
          setExportProcessedRecords(statusRes.processedRecords || 0);

          if (statusRes.status === 'COMPLETED') {
            if (exportPollTimerRef.current) {
              clearInterval(exportPollTimerRef.current);
              exportPollTimerRef.current = null;
            }
            setExportStatus('COMPLETED');
            setExportProgress(100);

            // Automatically trigger download
            try {
              await grievanceService.downloadSuperAdminPdfFile(jobId);
            } catch (dlErr) {
              console.error("Auto-download failed:", dlErr);
            }

            // Auto-hide banner after 8 seconds
            setTimeout(() => {
              setShowExportBanner(false);
              setExportStatus('IDLE');
              setExportJobId(null);
            }, 8000);

          } else if (statusRes.status === 'FAILED') {
            if (exportPollTimerRef.current) {
              clearInterval(exportPollTimerRef.current);
              exportPollTimerRef.current = null;
            }
            setExportStatus('FAILED');
            setExportErrorMessage(statusRes.message || 'PDF export job failed');
          }
        } catch (pollErr) {
          console.error("PDF export poll error:", pollErr);
        }
      }, 1500);

    } catch (err) {
      console.error("Failed to start PDF export:", err);
      setExportStatus('FAILED');
      setExportErrorMessage(err.response?.data?.message || err.message || 'Failed to start PDF export job');
    }
  };

  const resetHomeFilters = () => {
    setStatusFilter('');
    setDeptFilter('');
    setHomeDistrictFilter('');
    setHomeCategoryFilter('');
    setHomeDateFromFilter('');
    setHomeDateToFilter('');
    setHomeOriginFilter('');
    setHomeFinalStatusFilter('');
    setHomeKeyFlagFilter('');
    setHomeModeFilter('');
    setHomeRadioFilter('all');
    setHomeCategoriesList([]);
    setSearchQuery('');
    setCurrentPage(1);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadData();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [
    currentPage,
    entriesPerPage,
    searchQuery,
    sortColumn,
    sortDirection,
    statusFilter,
    deptFilter,
    homeDistrictFilter,
    homeCategoryFilter,
    homeDateFromFilter,
    homeDateToFilter,
    homeOriginFilter,
    homeFinalStatusFilter,
    homeKeyFlagFilter
  ]);

  // Appeal Dashboard fetching functions & hooks
  const fetchAppealDashboardSummary = async () => {
    try {
      const data = await grievanceService.getAppealDashboardSummary();
      setAppealSummary(data);
    } catch (err) {
      console.error('Error fetching appeal summary:', err);
    }
  };

  const fetchAppealDashboardList = async () => {
    setIsAppealLoading(true);
    try {
      const params = {
        page: appealCurrentPage - 1,
        size: appealEntriesPerPage,
        search: appealSearchQuery,
        sortBy: appealSortColumn,
        sortDirection: appealSortDirection
      };
      const res = await grievanceService.getAppealDashboardList(params);
      if (res && res.content) {
        setAppeals(res.content);
        setAppealTotalElements(res.totalElements);
        setAppealTotalPages(res.totalPages);
      } else {
        setAppeals([]);
        setAppealTotalElements(0);
        setAppealTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching appeal list:', err);
    } finally {
      setIsAppealLoading(false);
    }
  };

  const handleAppealSort = (columnName) => {
    let dbCol = columnName;
    if (columnName === 'department') {
      dbCol = 'grievance.category.department.name';
    } else if (columnName === 'submittedBy.officeName') {
      dbCol = 'submittedBy.officeName';
    } else if (columnName === 'grievance.uniqId') {
      dbCol = 'grievance.uniqId';
    }

    if (appealSortColumn === dbCol) {
      setAppealSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setAppealSortColumn(dbCol);
      setAppealSortDirection('DESC');
    }
    setAppealCurrentPage(1);
  };

  // Analytical Dashboard API calls & helper methods
  const fetchAnalSummary = async () => {
    setIsAnalSummaryLoading(true);
    try {
      const params = {
        search: analSearchQuery,
        department: analDept,
        district: analDistrict,
        category: analCat,
        subCategory: analSubCat,
        subCatL2: analSubCatL2,
        subCatL3: analSubCatL3,
        subCatL4: analSubCatL4,
        status: analStatus,
        finalStatus: analSubStatus,
        origin: analWindow,
        dateFrom: analFromDate,
        dateTo: analToDate,
        keyFlag: analAdminType
      };
      const summary = await grievanceService.getAnalyticsSummary(params);
      setAnalSummary(summary);
    } catch (err) {
      console.error("Error fetching analytics summary:", err);
    } finally {
      setIsAnalSummaryLoading(false);
    }
  };

  const fetchAnalGrievances = async () => {
    setIsAnalLoading(true);
    try {
      const params = {
        page: analCurrentPage - 1,
        size: analEntriesPerPage,
        search: analSearchQuery,
        sortBy: analSortColumn,
        sortDirection: analSortDirection,
        department: analDept,
        district: analDistrict,
        category: analCat,
        subCategory: analSubCat,
        subCatL2: analSubCatL2,
        subCatL3: analSubCatL3,
        subCatL4: analSubCatL4,
        status: analStatus,
        finalStatus: analSubStatus,
        origin: analWindow,
        dateFrom: analFromDate,
        dateTo: analToDate,
        keyFlag: analAdminType
      };
      const response = await grievanceService.getSuperAdminGrievances(params);
      if (response) {
        setAnalGrievances(response.content || []);
        setAnalTotalElements(response.totalElements || 0);
        setAnalTotalPages(response.totalPages || 0);
      }
    } catch (err) {
      console.error("Error fetching analytical grievances:", err);
    } finally {
      setIsAnalLoading(false);
    }
  };

  const handleAnalDeptChange = async (deptName) => {
    setAnalDept(deptName);
    setAnalCat('');
    setAnalSubCat('');
    setAnalCategoriesList([]);
    setAnalSubCategoriesList([]);

    if (deptName) {
      const matchedDept = departments.find(d => d.name === deptName);
      if (matchedDept) {
        try {
          const res = await axiosClient.get(`/api/masters/categories?deptId=${matchedDept.id}`);
          setAnalCategoriesList(res.data || []);
        } catch (err) {
          console.error("Error fetching categories:", err);
        }
      }
    }
  };

  const handleAnalCatChange = async (catName) => {
    setAnalCat(catName);
    setAnalSubCat('');
    setAnalSubCategoriesList([]);

    if (catName) {
      const matchedCat = analCategoriesList.find(c => c.name === catName);
      if (matchedCat) {
        try {
          const res = await axiosClient.get(`/api/masters/subcategories?categoryId=${matchedCat.id}`);
          setAnalSubCategoriesList(res.data || []);
        } catch (err) {
          console.error("Error fetching subcategories:", err);
        }
      }
    }
  };

  const handleAnalSort = (dbCol) => {
    if (analSortColumn === dbCol) {
      setAnalSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setAnalSortColumn(dbCol);
      setAnalSortDirection('DESC');
    }
    setAnalCurrentPage(1);
  };

  const handleAnalExportCSV = () => {
    if (!analGrievances.length) return;
    const headers = [
      "S.No.", "Grievance ID", "Department", "Category",
      "Sub Category", "Sub Category L2", "Sub Category L3", "Sub Category L4",
      "Submitted By", "Submitted On", "Window", "Division", "District", "Status"
    ];
    const rows = analGrievances.map((g, index) => [
      index + 1,
      g.uniqId || g.id,
      `"${g.department || ''}"`,
      `"${g.grievanceCategory || ''}"`,
      `"${g.subCategory || 'NA'}"`,
      `"${g.subCategoryL2 || 'NA'}"`,
      `"${g.subCategoryL3 || 'NA'}"`,
      `"${g.subCategoryL4 || 'NA'}"`,
      `"${g.citizenName || ''}"`,
      g.createdAt || '',
      g.origin || '',
      g.division || 'NA',
      g.district || 'NA',
      g.status || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Analytical_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAnalExportExcel = () => {
    if (!analGrievances.length) return;
    const headers = [
      "S.No.", "Grievance ID", "Department", "Category",
      "Sub Category", "Sub Category L2", "Sub Category L3", "Sub Category L4",
      "Submitted By", "Submitted On", "Window", "Division", "District", "Status"
    ];
    const rows = analGrievances.map((g, index) => [
      index + 1,
      g.uniqId || g.id,
      g.department || '',
      g.grievanceCategory || '',
      g.subCategory || 'NA',
      g.subCategoryL2 || 'NA',
      g.subCategoryL3 || 'NA',
      g.subCategoryL4 || 'NA',
      g.citizenName || '',
      g.createdAt || '',
      g.origin || '',
      g.division || 'NA',
      g.district || 'NA',
      g.status || ''
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grievances");
    XLSX.writeFile(workbook, `Analytical_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleAnalExportPDF = () => {
    if (!analGrievances.length) return;
    const doc = new jsPDF('landscape');

    doc.setFontSize(16);
    doc.text("J&K Samadhan 3.0 - Analytical Dashboard Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 22);

    const headers = [
      ["S.No.", "Grievance ID", "Department", "Category", "Submitted By", "Submitted On", "Window", "Division", "District", "Status"]
    ];
    const rows = analGrievances.map((g, index) => [
      index + 1,
      g.uniqId || g.id,
      g.department || '',
      g.grievanceCategory || '',
      g.citizenName || '',
      g.createdAt ? g.createdAt.slice(0, 10) : '',
      g.origin || '',
      g.division || 'NA',
      g.district || 'NA',
      g.status || ''
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [107, 56, 251] },
    });

    doc.save(`Analytical_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const fetchDistrictsList = async () => {
    try {
      const res = await axiosClient.get('/api/masters/districts');
      setAnalDistrictsList(res.data || []);
    } catch (err) {
      console.error("Error fetching districts:", err);
    }
  };

  const handleAnalReload = async () => {
    if (isAnalLoading || isAnalSummaryLoading) return;
    setIsAnalLoading(true);
    setIsAnalSummaryLoading(true);
    try {
      await Promise.all([
        fetchAnalSummary(),
        fetchAnalGrievances()
      ]);
    } catch (err) {
      console.error("Error reloading analytical dashboard:", err);
    } finally {
      setIsAnalLoading(false);
      setIsAnalSummaryLoading(false);
    }
  };

  const resetAnalFilters = () => {
    setAnalDept('');
    setAnalCat('');
    setAnalSubCat('');
    setAnalSubCatL2('');
    setAnalSubCatL3('');
    setAnalSubCatL4('');
    setAnalStatus('');
    setAnalSubStatus('');
    setAnalWindow('');
    setAnalFromDate('');
    setAnalToDate('');
    setAnalOperand('');
    setAnalOperator('');
    setAnalAdminType('');
    setAnalAiTracking('');
    setAnalAiClassification('');
    setAnalMode('');
    setAnalDistrict('');
    setAnalRadioFilter('all');
    setAnalCategoriesList([]);
    setAnalSubCategoriesList([]);
    setAnalSearchQuery('');
    setAnalCurrentPage(1);
  };

  useEffect(() => {
    if (sidebarActiveItem === 'Analytical Dashboard' || sidebarActiveItem === 'Super Admin Dashboard') {
      if (departments.length === 0) {
        fetchDepartmentsList();
      }
      if (analDistrictsList.length === 0) {
        fetchDistrictsList();
      }
    }
  }, [sidebarActiveItem, departments.length, analDistrictsList.length]);

  useEffect(() => {
    if (sidebarActiveItem === 'Analytical Dashboard') {
      const delayDebounceFn = setTimeout(() => {
        fetchAnalSummary();
        fetchAnalGrievances();
      }, 400);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [
    sidebarActiveItem,
    analCurrentPage,
    analEntriesPerPage,
    analSearchQuery,
    analSortColumn,
    analSortDirection,
    analDept,
    analDistrict,
    analCat,
    analSubCat,
    analSubCatL2,
    analSubCatL3,
    analSubCatL4,
    analStatus,
    analSubStatus,
    analWindow,
    analFromDate,
    analToDate,
    analOperand,
    analOperator,
    analAdminType,
    analAiTracking,
    analAiClassification,
    analMode
  ]);

  useEffect(() => {
    document.title = "JK Samadhan 3.0 - Super Admin Dashboard";
  }, []);

  useEffect(() => {
    if (sidebarActiveItem === 'Appeal Dashboard') {
      const delayDebounceFn = setTimeout(() => {
        fetchAppealDashboardList();
      }, 400);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [sidebarActiveItem, appealCurrentPage, appealEntriesPerPage, appealSearchQuery, appealSortColumn, appealSortDirection]);

  useEffect(() => {
    if (sidebarActiveItem === 'Appeal Dashboard') {
      fetchAppealDashboardSummary();
    }
  }, [sidebarActiveItem]);

  const fetchAppealMisReport = async () => {
    setIsAppealMisLoading(true);
    try {
      const params = {
        page: appealMisCurrentPage - 1,
        size: appealMisEntriesPerPage,
        search: appealMisSearchQuery,
        deptId: appealMisDeptFilter !== '0' ? parseInt(appealMisDeptFilter) : null
      };
      const res = await grievanceService.getAppealMisReport(params);
      if (res && res.content) {
        setAppealMisData(res.content);
        setAppealMisTotalElements(res.totalElements);
        setAppealMisTotalPages(res.totalPages);
      } else {
        setAppealMisData([]);
        setAppealMisTotalElements(0);
        setAppealMisTotalPages(0);
      }
    } catch (err) {
      console.error('Error fetching appeal MIS report:', err);
    } finally {
      setIsAppealMisLoading(false);
    }
  };

  const handleAppealMisExportCSV = () => {
    const headers = [
      'S. No.',
      'Department',
      'Total Appeal',
      'Appeals Disposed',
      'Appeals Rejected',
      'Appeals Pending',
      'Appeals Under Process',
      'Appeals Open',
      'Appeals Closed',
      'Disposal%'
    ];

    const rows = appealMisData.map((row, index) => [
      index + 1,
      row.department,
      row.totalAppeals,
      row.appealsDisposed,
      row.appealsRejected,
      row.appealsPending,
      row.appealsUnderProcess,
      row.appealsOpen,
      row.appealsClosed,
      row.disposalPercentage !== null ? `${row.disposalPercentage}%` : '0.00%'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Appeal_MIS_Report_${new Date().toLocaleDateString('en-GB').split('/').join('-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (sidebarActiveItem === 'Appeal MIS Report') {
      const delayDebounceFn = setTimeout(() => {
        fetchAppealMisReport();
      }, 400);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [sidebarActiveItem, appealMisCurrentPage, appealMisEntriesPerPage, appealMisSearchQuery, appealMisDeptFilter]);

  useEffect(() => {
    const handleCloseDropdown = () => {
      setOpenActionDropdownId(null);
      setIsProfileDropdownOpen(false);
    };
    window.addEventListener('click', handleCloseDropdown);
    return () => window.removeEventListener('click', handleCloseDropdown);
  }, []);

  const handleSort = (columnName) => {
    if (sortColumn === columnName) {
      setSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortColumn(columnName);
      setSortDirection('DESC');
    }
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/A';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const getDepartmentMeta = (dept, index) => {
    const name = dept.name.toUpperCase();

    // Fallbacks
    let typeStr = 'OTHER';
    if (dept.type === 'Administrative' || dept.type === 'ADMIN') {
      typeStr = 'ADMIN';
    } else if (dept.type === 'DoPG') {
      typeStr = 'DoPG';
    }

    const creator = dept.createdBy || 'System';

    return {
      type: typeStr,
      createdOn: formatDate(dept.createdAt),
      createdBy: creator
    };
  };

  const fetchDepartmentsList = async () => {
    setIsDeptLoading(true);
    try {
      const data = await adminService.getDepartments();
      if (data) {
        setDepartments(data);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setIsDeptLoading(false);
    }
  };

  useEffect(() => {
    if (sidebarActiveItem === 'Department Mapping' || sidebarActiveItem === 'Appeal MIS Report') {
      fetchDepartmentsList();
    }
  }, [sidebarActiveItem]);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!deptType) {
      alert('Type of Department is required.');
      return;
    }
    let finalName = '';
    if (deptNameSelect === 'add') {
      if (!customDeptName.trim()) {
        alert('Department name is required.');
        return;
      }
      if (!officeName.trim()) {
        alert('Office name of Nodal is required.');
        return;
      }
      if (!designation.trim()) {
        alert('Designation of Department Nodal is required.');
        return;
      }
      finalName = customDeptName.trim();
    } else {
      if (!deptNameSelect) {
        alert('Department Name is required.');
        return;
      }
      finalName = deptNameSelect;
    }

    if (!/^[a-zA-Z0-9\s\-,()]+$/.test(finalName)) {
      alert('Department name can only contain letters, numbers, spaces, hyphens (-), commas (,), and brackets ().');
      return;
    }

    const exists = departments.some(d => d.name.toUpperCase() === finalName.toUpperCase());
    if (exists) {
      alert('Department already exists.');
      return;
    }

    try {
      await adminService.createDepartment({
        name: finalName.toUpperCase(),
        type: deptType === 'ADMIN' ? 'Administrative' : deptType === 'OTHER' ? 'Line Department' : deptType
      });
      alert('Department added successfully.');
      setDeptType('');
      setDeptNameSelect('');
      setCustomDeptName('');
      setOfficeName('');
      setDesignation('');
      fetchDepartmentsList();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create department');
    }
  };

  const handleResetForm = () => {
    setDeptType('');
    setDeptNameSelect('');
    setCustomDeptName('');
    setOfficeName('');
    setDesignation('');
  };

  const handleUpdateDept = async (e) => {
    e.preventDefault();
    if (!editDeptModal.name.trim()) {
      alert('Field can not be empty');
      return;
    }

    if (!/^[a-zA-Z0-9\s\-,()]+$/.test(editDeptModal.name.trim())) {
      alert('Department name can only contain letters, numbers, spaces, hyphens (-), commas (,), and brackets ().');
      return;
    }

    try {
      await adminService.updateDepartment(editDeptModal.id, {
        name: editDeptModal.name.trim().toUpperCase(),
        type: editDeptModal.type
      });
      alert('Department name changed.');
      setEditDeptModal({ isOpen: false, id: null, name: '', type: '' });
      fetchDepartmentsList();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update department name');
    }
  };

  // Fetch Dept Category Mapping details
  useEffect(() => {
    if (showDeptMappingModal) {
      const fetchMapping = async () => {
        try {
          const res = await adminService.getDeptMapping();
          if (res) {
            setMappingData(res);
            if (res.nodalD && res.nodalD.length > 0) {
              setSelectedDept(res.nodalD[0].department || '');
            }
            setSessionName(res.sessionname || '');
          }
        } catch (err) {
          console.error('Error fetching mapping masters:', err);
        }
      };
      fetchMapping();
    }
  }, [showDeptMappingModal]);

  // Fetch metadata for Nodal and Office & Designation creation
  useEffect(() => {
    if (sidebarActiveItem === 'Create Department Nodal' || sidebarActiveItem === 'Create Offices & Designation') {
      const fetchMetaData = async () => {
        try {
          const desigData = await adminService.getDesignations();
          setDesignations(desigData || []);
          if (sidebarActiveItem === 'Create Department Nodal') {
            const deptsData = await adminService.getDepartments();
            setAllDepartments(deptsData || []);
          } else {
            const rolesData = await adminService.getUserTypes();
            setRoles(rolesData || []);
            const mappingData = await adminService.getRoleDesignations();
            setRoleDesignations(mappingData || []);
          }
        } catch (err) {
          console.error('Error fetching metadata:', err);
        }
      };
      fetchMetaData();
    }
  }, [sidebarActiveItem]);

  const handleCreateNodal = async (e) => {
    e.preventDefault();
    if (!nodalForm.firstName.trim() || !nodalForm.lastName.trim() || !nodalForm.mobile.trim() || !nodalForm.email.trim() || !nodalForm.password.trim() || !nodalForm.departmentName || !nodalForm.officeName.trim()) {
      alert("All fields except middle name are mandatory.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nodalForm.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(nodalForm.mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      await adminService.createNodal({
        firstName: nodalForm.firstName,
        middleName: nodalForm.middleName,
        lastName: nodalForm.lastName,
        mobile: nodalForm.mobile,
        email: nodalForm.email,
        departmentName: nodalForm.departmentName,
        officeName: nodalForm.officeName,
        designationName: nodalForm.designationName,
        password: nodalForm.password,
        userType: nodalForm.userType
      });
      alert("Department Nodal created successfully!");
      setShowCreateNodalModal(false);
      setNodalForm({
        firstName: '',
        middleName: '',
        lastName: '',
        mobile: '',
        email: '',
        departmentType: 'OTHER',
        departmentName: '',
        userType: '',
        officeName: '',
        designationName: '',
        password: ''
      });
    } catch (err) {
      alert("Failed to create Nodal: " + (err.response?.data?.message || err.message));
    }
  };

  const handleOfficeDesignationSubmit = async (e) => {
    e.preventDefault();
    if (!officeDesignationForm.roleId || !officeDesignationForm.designationId) {
      alert("Please select both role and designation.");
      return;
    }

    try {
      let finalDesignationId = officeDesignationForm.designationId;

      if (officeDesignationForm.designationId === 'add') {
        if (!newDesignationName.trim()) {
          alert("Designation name is required.");
          return;
        }

        // Check if designation already exists in designations master list
        const exists = designations.find(d => d.name.toUpperCase() === newDesignationName.trim().toUpperCase());
        let designRes;
        if (exists) {
          designRes = exists;
        } else {
          designRes = await adminService.createDesignation({ name: newDesignationName.trim().toUpperCase() });
          setDesignations(prev => [designRes, ...prev]);
        }
        finalDesignationId = designRes.id;
      }

      if (editMappingId) {
        const res = await adminService.updateRoleDesignation(editMappingId, {
          roleId: Number(officeDesignationForm.roleId),
          designationId: Number(finalDesignationId)
        });
        alert("Role designation mapping updated successfully!");
        setRoleDesignations(roleDesignations.map(m => m.id === editMappingId ? res : m));
        setEditMappingId(null);
      } else {
        const res = await adminService.createRoleDesignation({
          roleId: Number(officeDesignationForm.roleId),
          designationId: Number(finalDesignationId)
        });
        alert("Role designation mapping created successfully!");
        setRoleDesignations([res, ...roleDesignations]);
      }
      setNewDesignationName('');
      handleResetOfficeDesignationForm();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || err.message || "Failed to save mapping.");
    }
  };

  const handleResetOfficeDesignationForm = () => {
    setOfficeDesignationForm({ roleId: '', designationId: '' });
    setEditMappingId(null);
  };

  const handleEditMappingClick = (rd) => {
    setOfficeDesignationForm({
      roleId: rd.roleId ? String(rd.roleId) : '',
      designationId: rd.designationId ? String(rd.designationId) : ''
    });
    setEditMappingId(rd.id);
  };

  const handleDesignationSubmit = async (e) => {
    e.preventDefault();
    if (!newDesignationName.trim()) {
      alert("Designation name is required.");
      return;
    }
    try {
      if (editDesignationId) {
        await adminService.updateDesignation(editDesignationId, {
          name: newDesignationName.trim().toUpperCase()
        });
        alert("Designation updated successfully!");
        setEditDesignationId(null);
      } else {
        await adminService.createDesignation({
          name: newDesignationName.trim().toUpperCase()
        });
        alert("Designation created successfully!");
      }
      setNewDesignationName('');
      // Refresh designations list
      const desigData = await adminService.getDesignations();
      setDesignations(desigData || []);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to save designation.");
    }
  };

  const handleEditDesignationClick = (d) => {
    setNewDesignationName(d.name);
    setEditDesignationId(d.id);
  };

  const handleDeleteDesignationClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this designation?")) {
      return;
    }
    try {
      await adminService.deleteDesignation(id);
      alert("Designation deleted successfully!");
      // Refresh designations list
      const desigData = await adminService.getDesignations();
      setDesignations(desigData || []);
      if (editDesignationId === id) {
        setNewDesignationName('');
        setEditDesignationId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete designation.");
    }
  };

  const handleDeleteMappingClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this office & designation mapping?")) {
      return;
    }
    try {
      await adminService.deleteRoleDesignation(id);
      alert("Role designation mapping deleted successfully!");
      setRoleDesignations(roleDesignations.filter(m => m.id !== id));
      if (editMappingId === id) {
        handleResetOfficeDesignationForm();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Failed to delete mapping.");
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!createUserForm.userType) {
      alert("Please select a User Type.");
      return;
    }
    if (!createUserForm.lastName.trim() || !createUserForm.mobile.trim() || !createUserForm.email.trim() || !createUserForm.officeName.trim() || !createUserForm.designation.trim() || !createUserForm.password.trim()) {
      alert("All fields marked with * are mandatory.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createUserForm.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!/^\d{10}$/.test(createUserForm.mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Password validation message from screenshot:
    // "Password should be minimum of 8 characters contain uppercase letter/lowercase letter, digits and special characters between @$!%*?&."
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(createUserForm.password)) {
      alert("Password should be minimum of 8 characters contain uppercase letter/lowercase letter, digits and special characters between @$!%*?&.");
      return;
    }

    try {
      const res = await grievanceService.createOfficialUser({
        userType: createUserForm.userType,
        firstName: createUserForm.firstName,
        middleName: createUserForm.middleName,
        lastName: createUserForm.lastName,
        mobile: createUserForm.mobile,
        email: createUserForm.email,
        officeName: createUserForm.officeName,
        designationName: createUserForm.designation,
        password: createUserForm.password
      });

      if (res && (res.statusCode === "1" || res.statusName === "Success")) {
        alert("Official User created successfully!");
        setCreateUserForm({
          userType: '',
          firstName: '',
          middleName: '',
          lastName: '',
          mobile: '',
          email: '',
          officeName: '',
          designation: '',
          password: ''
        });
        setSidebarActiveItem('Super Admin Dashboard');
      } else {
        alert(res.statusName || "Failed to create official user.");
      }
    } catch (err) {
      alert("Failed to create official user: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDepartmentChange = async (deptName) => {
    setNodalForm(prev => ({ ...prev, departmentName: deptName }));
    if (!deptName) {
      setExistingNodal(null);
      setSelectedUserAction('0');
      setDeptUsers([]);
      return;
    }

    setIsCheckingNodal(true);
    try {
      const res = await adminService.getNodalByDept(deptName);
      if (res && res.assigned) {
        setExistingNodal(res);
        setSelectedUserAction(res.email);
        setNodalForm(prev => ({
          ...prev,
          firstName: res.firstName,
          middleName: res.middleName,
          lastName: res.lastName,
          mobile: res.mobile,
          email: res.email,
          designationName: res.designationName,
          password: ''
        }));
      } else {
        setExistingNodal(null);
        setSelectedUserAction('0');
        setNodalForm(prev => ({
          ...prev,
          firstName: '',
          middleName: '',
          lastName: '',
          mobile: '',
          email: '',
          designationName: '',
          password: ''
        }));
      }

      // Fetch created users list for table
      const list = await adminService.getDeptUsersList(deptName);
      setDeptUsers(list || []);
    } catch (err) {
      console.error('Error fetching department user details:', err);
      setExistingNodal(null);
      setDeptUsers([]);
    } finally {
      setIsCheckingNodal(false);
    }
  };

  const handleAddDeptCategory = async (e) => {
    e.preventDefault();
    const payload = {
      department_name: selectedDept,
      category: selectedCat === 'add' ? newCatName : selectedCat,
      sub_category: subCat === 'add' ? newSubCatName : subCat,
      sub_Cat_Next_Level2: subCatL2 === 'add' ? newSubCatL2Name : subCatL2,
      sub_Cat_Next_Level3: subCatL3 === 'add' ? newSubCatL3Name : subCatL3,
      sub_Cat_Next_Level4: subCatL4 === 'add' ? newSubCatL4Name : subCatL4,
      reminderInDays: parseInt(reminderDays) || 7,
      sessionname: sessionName,
      sessionvalue: sessionName
    };

    try {
      const res = await adminService.addDeptCategory(payload);
      if (res && res.statusCode === '1') {
        alert('Department Category Mapping saved successfully!');
        // Refresh mapping list
        const updatedRes = await adminService.getDeptMapping();
        if (updatedRes) {
          setMappingData(updatedRes);
        }
        // Reset states
        setSelectedCat('0');
        setNewCatName('');
        setSubCat('0');
        setNewSubCatName('');
        setSubCatL2('0');
        setNewSubCatL2Name('');
        setSubCatL3('0');
        setNewSubCatL3Name('');
        setSubCatL4('0');
        setNewSubCatL4Name('');
      } else {
        alert(res.statusName || 'Failed to submit mapping configuration.');
      }
    } catch (err) {
      console.error(err);
      alert('Error registering category mapping.');
    }
  };

  // Filter grievances
  const filteredGrievances = grievances.filter(g => {
    const q = searchQuery.toLowerCase();
    return (
      g.grievanceId.toLowerCase().includes(q) ||
      g.department.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.submittedBy.toLowerCase().includes(q) ||
      g.mobile.toLowerCase().includes(q) ||
      g.status.toLowerCase().includes(q)
    );
  });

  // Export to CSV Functionality
  const handleExportCSV = () => {
    if (!filteredGrievances.length) return;
    const headers = ["S.No.", "Grievance ID", "Mode", "Privilege Assigned", "Mobile", "Date of Last Action", "Department", "Category", "Submitted By", "Date", "Status", "AI Classification"];
    const rows = filteredGrievances.map((g, index) => [
      index + 1,
      g.grievanceId,
      g.mode,
      g.privilege,
      g.mobile,
      g.lastActionDate,
      `"${g.department}"`,
      `"${g.category}"`,
      `"${g.submittedBy}"`,
      g.date,
      g.status,
      g.aiClassification
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Applications_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Colors matching reference screenshot
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resolved
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
      case 'Does Not Pertain':
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            Does Not Pertain
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#fef08a] text-amber-900 border border-amber-300 inline-flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 fill-amber-500" />
            Pending
          </span>
        );
    }
  };

  const getPaginationRange = (current, total) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  // Filter mappings to show only supported roles and support searching friendly names
  const filteredMappings = roleDesignations
    .filter(rd => SUPPORTED_ROLES_MAP[rd.roleName])
    .filter(rd => {
      const query = mappingSearchQuery.toLowerCase().trim();
      if (!query) return true;
      const displayRole = SUPPORTED_ROLES_MAP[rd.roleName] || rd.roleName;
      return (
        (displayRole && displayRole.toLowerCase().includes(query)) ||
        (rd.designationName && rd.designationName.toLowerCase().includes(query)) ||
        (rd.createdBy && rd.createdBy.toLowerCase().includes(query))
      );
    });

  const totalMappingPages = Math.ceil(filteredMappings.length / mappingEntriesToShow);
  const displayedMappings = filteredMappings.slice(
    (mappingCurrentPage - 1) * mappingEntriesToShow,
    mappingCurrentPage * mappingEntriesToShow
  );

  // Filter designations
  const filteredDesignations = designations.filter(d => {
    const query = designationSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return d.name && d.name.toLowerCase().includes(query);
  });

  const totalDesignationPages = Math.ceil(filteredDesignations.length / designationEntriesToShow);
  const displayedDesignations = filteredDesignations.slice(
    (designationCurrentPage - 1) * designationEntriesToShow,
    designationCurrentPage * designationEntriesToShow
  );

  return (
    <div className="min-h-screen bg-[#edf2f7] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans flex flex-col select-none">

      {/* ── TOP NAVBAR HEADER ── */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-xs sticky top-0 z-30 select-none">

        {/* Left Branding */}
        <div className="flex items-center gap-3">
          {/* JK Samadhan Logo */}
          <img
            src={logoImg}
            alt="JK Samadhan Emblem"
            className="h-10 w-auto object-contain shrink-0"
          />
          <div className="text-left leading-none font-sans">
            <h1 className="text-[15px] font-black text-[#1e3a8a] dark:text-white tracking-tight flex items-center gap-1">
              <span>JK Samadhan 3.0</span>
            </h1>
            <span className="text-[9px] text-slate-500 font-bold block mt-1">Government of Jammu & Kashmir</span>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          {/* JK Raabita Logo */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-500 via-yellow-500 to-indigo-600 flex items-center justify-center text-[8px] font-bold text-white shadow-2xs">R</div>
            <span className="text-xs font-extrabold text-[#1a365d] dark:text-slate-350">JK Raabita</span>
          </div>

          {/* Menu Hamburger Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border-0 bg-transparent"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right Action Pills */}
        <div className="flex items-center gap-2">
          {/* Dropdown Pills */}
          <div className="hidden md:flex items-center gap-1.5">
            <button className="px-3 py-1.5 bg-[#c3002f] hover:bg-[#a10026] text-white rounded-full text-[11px] font-bold flex items-center gap-1 border-0 cursor-pointer shadow-xs">
              <PlaySquare className="w-3.5 h-3.5 fill-white text-[#c3002f]" />
              <span>LMS Videos</span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>
            <button className="px-3 py-1.5 bg-[#1a202c] hover:bg-black text-white rounded-full text-[11px] font-bold flex items-center gap-1 border-0 cursor-pointer shadow-xs">
              <span>User Manual</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <button className="px-3 py-1.5 bg-[#1a202c] hover:bg-black text-white rounded-full text-[11px] font-bold flex items-center gap-1 border-0 cursor-pointer shadow-xs">
              <span>Language</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(prev => !prev); }}
              className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-[13px] font-bold rounded-full flex items-center gap-2 transition-colors cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <div className="w-6 h-6 rounded-full bg-slate-600 text-white flex items-center justify-center font-bold">
                <User className="h-4 w-4" />
              </div>
              <span className="max-w-[155px] truncate font-sans text-slate-700 dark:text-slate-300 text-xs">
                {user?.name || 'harender singh'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60 text-slate-600 dark:text-slate-450" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1.5 z-50 text-left font-sans animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider">Logged in as</span>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name || 'harender singh'}</span>
                </div>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    setSidebarActiveItem('Account Settings');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-750 dark:text-slate-250 cursor-pointer bg-transparent border-0 flex items-center gap-2"
                >
                  <Sliders className="h-3.5 w-3.5 text-slate-500" />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 cursor-pointer bg-transparent border-0 flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-550" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN DASHBOARD BODY AREA ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── DARK NAVY SIDEBAR MENU ── */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#1e1f31] text-slate-300 flex flex-col transition-all duration-300 shrink-0 shadow-lg border-r border-slate-800 z-20`}>

          {/* Sidebar Top Title Item */}
          <div className="p-3.5 bg-[#18192a] border-b border-slate-800 flex items-center gap-3">
            {sidebarActiveItem !== 'Super Admin Dashboard' ? (
              <button
                onClick={() => setSidebarActiveItem('Super Admin Dashboard')}
                className="w-full py-2 bg-[#28293d] hover:bg-[#32334d] text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 border-0 cursor-pointer transition-all px-2.5"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                {!sidebarCollapsed && <span>Back</span>}
              </button>
            ) : (
              <>
                <div className="p-1.5 bg-[#2a2b42] rounded-md text-slate-300">
                  <PieChart className="w-4 h-4 text-blue-400" />
                </div>
                {!sidebarCollapsed && (
                  <span className="font-bold text-xs text-white tracking-wide truncate">
                    Super Admin Dashboard
                  </span>
                )}
              </>
            )}
          </div>

          {/* Menu Items List */}
          {sidebarActiveItem !== 'Account Settings' && (() => {
            const isAnalyticalContext = [
              'Analytical Dashboard',
              'Citizen Registration List',
              'Department User List',
              'Dealing Hand Grievances',
              'Age Analysis Report',
              'Status Wise Report',
              'Pendency Report',
              'Age Wise Pendency Report',
              'District Wise Report',
              'Average Time Taken Report',
              'Appellate Report',
              'Announcement / Notification List',
              'Appeal MIS Report',
              'Tree Dashboard',
              'Advance Query Builder',
              'Feedback Analysis',
              'New Feedback Analysis',
              'Heatmap'
            ].includes(sidebarActiveItem);

            return (
              <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
                {isAnalyticalContext ? (
                  <>
                    {/* Monitoring Desk */}
                    <button
                      onClick={() => setSidebarActiveItem('Analytical Dashboard')}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors border-0 cursor-pointer ${sidebarActiveItem === 'Analytical Dashboard'
                          ? 'bg-[#e0d6ff] text-[#5c3beb] shadow-xs font-black'
                          : 'hover:bg-[#28293d] text-slate-300'
                        }`}
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span>Monitoring Desk</span>}
                    </button>

                    {/* MIS Reports Group */}
                    <div className="space-y-1">
                      <button
                        onClick={() => setMisMenuOpen(!misMenuOpen)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors border-0 cursor-pointer ${misMenuOpen ? 'bg-[#3b82f6] text-white shadow-sm' : 'hover:bg-[#28293d] text-slate-300'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <FolderOpen className="w-4 h-4 shrink-0" />
                          {!sidebarCollapsed && <span className="truncate">MIS Reports</span>}
                        </div>
                        {!sidebarCollapsed && (
                          misMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Sub-menu items */}
                      {misMenuOpen && !sidebarCollapsed && (
                        <div className="pl-4 space-y-1.5 pt-1">
                          {[
                            { label: 'Citizen Registration List', name: 'Citizen Registration List', icon: Users },
                            { label: 'Department User List', name: 'Department User List', icon: UserCheck },
                            { label: 'Dealing Hand Grievances', name: 'Dealing Hand Grievances', icon: ClipboardList },
                            { label: 'Age Analysis Report', name: 'Age Analysis Report', icon: Clock },
                            { label: 'Status Wise Report', name: 'Status Wise Report', icon: BarChart3 },
                            { label: 'Pendency Report', name: 'Pendency Report', icon: AlertTriangle },
                            { label: 'Dependency Report', name: 'Age Wise Pendency Report', icon: AlertCircle },
                            { label: 'District Wise Report', name: 'District Wise Report', icon: Map },
                            { label: 'Average Time Taken Report', name: 'Average Time Taken Report', icon: Clock },
                            { label: 'Appellate Report', name: 'Appellate Report', icon: ShieldCheck },
                            { label: 'Announcement / Notification List', name: 'Announcement / Notification List', icon: Bell },
                            { label: 'Appeal Report', name: 'Appeal MIS Report', icon: FileText }
                          ].map((item, idx) => {
                            const Icon = item.icon;
                            const isActive = sidebarActiveItem === item.name;
                            return (
                              <button
                                key={idx}
                                onClick={() => setSidebarActiveItem(item.name)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition-colors border-0 cursor-pointer flex items-center gap-2 block truncate ${isActive
                                    ? 'text-white bg-[#28293d] border-l-2 border-blue-500 pl-2'
                                    : 'text-slate-400 hover:text-white hover:bg-[#28293d]'
                                  }`}
                              >
                                <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Tree Dashboard */}
                    <button
                      onClick={() => setSidebarActiveItem('Tree Dashboard')}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors border-0 cursor-pointer ${sidebarActiveItem === 'Tree Dashboard' ? 'bg-[#3b82f6] text-white shadow-sm' : 'hover:bg-[#28293d] text-slate-300'
                        }`}
                    >
                      <Network className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span>Tree Dashboard</span>}
                    </button>

                    {/* Advance Query Builder */}
                    <button
                      onClick={() => setSidebarActiveItem('Advance Query Builder')}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors border-0 cursor-pointer ${sidebarActiveItem === 'Advance Query Builder' ? 'bg-[#3b82f6] text-white shadow-sm' : 'hover:bg-[#28293d] text-slate-300'
                        }`}
                    >
                      <Database className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span>Advance Query Builder</span>}
                    </button>

                    {/* Feedback Analysis */}
                    <button
                      onClick={() => setSidebarActiveItem('Feedback Analysis')}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors border-0 cursor-pointer ${sidebarActiveItem === 'Feedback Analysis' ? 'bg-[#3b82f6] text-white shadow-sm' : 'hover:bg-[#28293d] text-slate-300'
                        }`}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span>Feedback Analysis</span>}
                    </button>

                    {/* New Feedback Analysis */}
                    <button
                      onClick={() => setSidebarActiveItem('New Feedback Analysis')}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors border-0 cursor-pointer ${sidebarActiveItem === 'New Feedback Analysis' ? 'bg-[#3b82f6] text-white shadow-sm' : 'hover:bg-[#28293d] text-slate-300'
                        }`}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span>New Feedback Analysis</span>}
                    </button>

                    {/* Heatmap */}
                    <button
                      onClick={() => setSidebarActiveItem('Heatmap')}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors border-0 cursor-pointer ${sidebarActiveItem === 'Heatmap' ? 'bg-[#3b82f6] text-white shadow-sm' : 'hover:bg-[#28293d] text-slate-300'
                        }`}
                    >
                      <Flame className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span>Heatmap</span>}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Accordion Group: Mapping & User Creation */}
                    <div className="space-y-1">
                      <button
                        onClick={() => setMappingMenuOpen(!mappingMenuOpen)}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors border-0 cursor-pointer ${mappingMenuOpen ? 'bg-[#3b82f6] text-white shadow-sm' : 'hover:bg-[#28293d] text-slate-300'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Sliders className="w-4 h-4 shrink-0" />
                          {!sidebarCollapsed && <span className="truncate">Mapping & User Creation</span>}
                        </div>
                        {!sidebarCollapsed && (
                          mappingMenuOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Sub-menu items */}
                      {mappingMenuOpen && !sidebarCollapsed && (
                        <div className="pl-4 space-y-1.5 pt-1">
                          <button
                            onClick={() => setSidebarActiveItem('Department Mapping')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors border-0 cursor-pointer block truncate ${sidebarActiveItem === 'Department Mapping' ? 'text-white bg-[#28293d]' : 'text-slate-400 hover:text-white hover:bg-[#28293d]'
                              }`}
                          >
                            • Department Mapping
                          </button>
                          <button
                            onClick={() => setSidebarActiveItem('Create Department Nodal')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors border-0 cursor-pointer block truncate ${sidebarActiveItem === 'Create Department Nodal' ? 'text-white bg-[#28293d]' : 'text-slate-400 hover:text-white hover:bg-[#28293d]'
                              }`}
                          >
                            • Create Department Nodal
                          </button>
                          <button
                            onClick={() => setSidebarActiveItem('Create users')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors border-0 cursor-pointer block truncate ${sidebarActiveItem === 'Create users' ? 'text-white bg-[#28293d]' : 'text-slate-400 hover:text-white hover:bg-[#28293d]'
                              }`}
                          >
                            • Create users
                          </button>
                          <button
                            onClick={() => setSidebarActiveItem('Create Offices & Designation')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors border-0 cursor-pointer block truncate ${sidebarActiveItem === 'Create Offices & Designation' ? 'text-white bg-[#28293d]' : 'text-slate-400 hover:text-white hover:bg-[#28293d]'
                              }`}
                          >
                            • Create Offices & Designation
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Analytical Dashboard Button */}
                    <button
                      onClick={() => setSidebarActiveItem('Analytical Dashboard')}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors border-0 cursor-pointer ${sidebarActiveItem === 'Analytical Dashboard' ? 'bg-[#3b82f6] text-white shadow-sm' : 'hover:bg-[#28293d] text-slate-300'
                        }`}
                    >
                      <BarChart3 className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span>Analytical Dashboard</span>}
                    </button>

                    {/* Appeal Dashboard Button */}
                    <button
                      onClick={() => setSidebarActiveItem('Appeal Dashboard')}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors border-0 cursor-pointer ${sidebarActiveItem === 'Appeal Dashboard' ? 'bg-[#3b82f6] text-white shadow-sm' : 'hover:bg-[#28293d] text-slate-300'
                        }`}
                    >
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      {!sidebarCollapsed && <span>Appeal Dashboard</span>}
                    </button>
                  </>
                )}
              </nav>
            );
          })() /* Navigation list closed */}

          {/* Sidebar Footer Version Badge */}
          <div className="p-3 border-t border-slate-800 text-center text-[10px] font-mono font-bold text-slate-400">
            {!sidebarCollapsed ? 'ver: v2.7.13' : 'v2.7.13'}
          </div>

        </aside>

        {/* ── CONTENT AREA ── */}
        <main className="flex-1 p-5 overflow-y-auto space-y-5 text-left">

          {/* Breadcrumb Title & Announcement Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {sidebarActiveItem === 'Department Mapping' ? 'Department Mapping' : sidebarActiveItem === 'Create Department Nodal' ? 'Create Department Nodal' : sidebarActiveItem === 'Create users' ? 'Create Users' : sidebarActiveItem === 'Create Offices & Designation' ? 'Create Offices & Designation' : 'Home'}
              </h2>
              <span className="text-slate-400 font-medium">|</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {sidebarActiveItem === 'Department Mapping'
                  ? 'Department Mapping'
                  : sidebarActiveItem === 'Create Department Nodal'
                    ? 'Create Department Nodal'
                    : sidebarActiveItem === 'Create users'
                      ? 'Create Users'
                      : sidebarActiveItem === 'Create Offices & Designation'
                        ? 'Create Offices & Designation'
                        : sidebarActiveItem === 'Appeal Dashboard'
                          ? `Appeal Dashboard (${user?.department || 'null'})`
                          : 'Super Admin Dashboard'}
              </span>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-3">
              {sidebarActiveItem === 'Department Mapping' && (
                <button
                  type="button"
                  onClick={() => setShowDeptMappingModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm border-0 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Configure Category Mapping</span>
                </button>
              )}
              {sidebarActiveItem === 'Super Admin Dashboard' && (
                <>
                  <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                    {['Home', 'JK-IGRAMS', 'CPGRAMS', 'HLG Mulaqaat'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs tracking-wide transition-all border-0 cursor-pointer ${activeTab === tab
                            ? 'bg-blue-600 text-white shadow-xs font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 bg-transparent font-medium'
                          }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsCreateAnnouncementOpen(true)}
                    className="px-4 py-2 bg-[#8C39F9] hover:bg-[#7b2cbf] active:bg-[#6a21a8] text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-sm border-0 cursor-pointer transition-all"
                  >
                    <div className="relative">
                      <Bell className="w-4 h-4" />
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                        {stats.notifications ? stats.notifications.length : 0}
                      </span>
                    </div>
                    <span>Create Announcement +</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Render Active View */}
          {['Department User List', 'Dealing Hand Grievances', 'Age Analysis Report', 'Status Wise Report', 'Pendency Report', 'Age Wise Pendency Report', 'District Wise Report', 'Average Time Taken Report', 'Appellate Report', 'Announcement / Notification List', 'Tree Dashboard', 'Advance Query Builder', 'Feedback Analysis', 'New Feedback Analysis', 'Heatmap'].includes(sidebarActiveItem) ? (
            /* ────────────────────────────────────────────────────────
               VIEW: REPORT / DASHBOARD PLACEHOLDER
               ──────────────────────────────────────────────────────── */
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs animate-fadeIn text-left min-h-[400px] flex flex-col items-center justify-center">
              <div className="text-center space-y-3 max-w-md">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{sidebarActiveItem}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The visual structure and reporting widgets for <strong>{sidebarActiveItem}</strong> will be implemented and connected to database APIs in the next phase.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-full text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                  <span>UI Container Initialized</span>
                </div>
              </div>
            </div>
          ) : sidebarActiveItem === 'Citizen Registration List' ? (
            <CitizenRegistrationReport />
          ) : sidebarActiveItem === 'Create Department Nodal' ? (
            /* ────────────────────────────────────────────────────────
               VIEW: CREATE DEPARTMENT NODAL SCREEN (FULL SCREEN)
               ──────────────────────────────────────────────────────── */
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs animate-fadeIn text-left">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Create Department Nodal</span>
              </h3>

              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                <ul className="list-disc pl-4 space-y-1 text-rose-800 font-mono">
                  <li>Except middle name all fields are mandatory.</li>
                  <li>Password should be minimum of 8 characters containing uppercase letter, lowercase letter, digits, and special characters.</li>
                </ul>
              </div>

              {existingNodal && (
                <div className="bg-amber-50 border border-amber-250 text-amber-850 p-4 rounded-xl font-bold flex justify-between items-center animate-fadeIn text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    <span>Active Nodal Officer: <strong className="font-extrabold text-amber-900">{existingNodal.firstName} {existingNodal.lastName}</strong> (Email: {existingNodal.email}, Mobile: {existingNodal.mobile})</span>
                  </div>
                  <span className="bg-amber-200 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-1 rounded-md text-[9px] uppercase font-black tracking-wider">Already Assigned</span>
                </div>
              )}

              <form onSubmit={handleCreateNodal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Department Type</label>
                    <select
                      value={nodalForm.departmentType}
                      onChange={(e) => setNodalForm({ ...nodalForm, departmentType: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="SELECT">Select</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="DOPG">DOPG</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider flex justify-between items-center">
                      <span>Department Name</span>
                      {isCheckingNodal && <span className="text-blue-500 animate-pulse text-[10px] lowercase font-mono">Checking...</span>}
                    </label>
                    <select
                      value={nodalForm.departmentName}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select</option>
                      {allDepartments
                        .filter(d => !nodalForm.departmentType || nodalForm.departmentType === 'SELECT' || d.type?.toUpperCase() === nodalForm.departmentType?.toUpperCase())
                        .map((d, i) => (
                          <option key={i} value={d.name}>{d.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                {/* Select/Create new User Section */}
                {nodalForm.departmentName && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <h4 className="font-extrabold text-blue-600 dark:text-blue-400 text-[11px] uppercase tracking-wider font-sans">Select/Create new User</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider font-sans">User</label>
                        <select
                          value={selectedUserAction}
                          onChange={(e) => setSelectedUserAction(e.target.value)}
                          disabled={existingNodal !== null}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-bold text-slate-800 dark:text-slate-200 disabled:opacity-60"
                        >
                          {existingNodal ? (
                            <option value={existingNodal.email}>{existingNodal.email}</option>
                          ) : (
                            <>
                              <option value="0">Select</option>
                              <option value="add">Create new User</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form fields shown if user action is 'add' or Nodal is already assigned */}
                {(existingNodal !== null || selectedUserAction === 'add') && (
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">First Name</label>
                        <input
                          type="text"
                          placeholder="First name"
                          value={nodalForm.firstName}
                          onChange={(e) => setNodalForm({ ...nodalForm, firstName: e.target.value })}
                          disabled={existingNodal !== null}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100 disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Middle Name</label>
                        <input
                          type="text"
                          placeholder="Middle name"
                          value={nodalForm.middleName}
                          onChange={(e) => setNodalForm({ ...nodalForm, middleName: e.target.value })}
                          disabled={existingNodal !== null}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100 disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Last Name</label>
                        <input
                          type="text"
                          placeholder="Last name"
                          value={nodalForm.lastName}
                          onChange={(e) => setNodalForm({ ...nodalForm, lastName: e.target.value })}
                          disabled={existingNodal !== null}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-855 dark:text-slate-100 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Mobile</label>
                        <input
                          type="text"
                          placeholder="Mobile"
                          maxLength="10"
                          value={nodalForm.mobile}
                          onChange={(e) => setNodalForm({ ...nodalForm, mobile: e.target.value })}
                          disabled={existingNodal !== null}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100 disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Email</label>
                        <input
                          type="email"
                          placeholder="Email"
                          value={nodalForm.email}
                          onChange={(e) => setNodalForm({ ...nodalForm, email: e.target.value })}
                          disabled={existingNodal !== null}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100 disabled:opacity-60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Office Name *</label>
                        <input
                          type="text"
                          placeholder="Office Name"
                          value={nodalForm.officeName}
                          onChange={(e) => setNodalForm({ ...nodalForm, officeName: e.target.value })}
                          disabled={existingNodal !== null}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100 disabled:opacity-60"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Select User Type</label>
                        <select
                          value={nodalForm.userType}
                          onChange={(e) => setNodalForm({ ...nodalForm, userType: e.target.value, designationName: '' })}
                          disabled={existingNodal !== null}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-bold text-slate-800 dark:text-slate-200 disabled:opacity-60"
                        >
                          <option value="">Select Role</option>
                          <option value="ROLE_SuperAdmin">Super Admin</option>
                          <option value="ROLE_Secretary">Secretary</option>
                          <option value="ROLE_DM">DM</option>
                          <option value="ROLE_DealingHand">Dealing Hand</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Select Designation</label>
                        <select
                          value={nodalForm.designationName}
                          onChange={(e) => setNodalForm({ ...nodalForm, designationName: e.target.value })}
                          disabled={existingNodal !== null || !nodalForm.userType}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-bold text-slate-800 dark:text-slate-200 disabled:opacity-60"
                        >
                          <option value="">{!nodalForm.userType ? "Select Role first" : "Select Designation"}</option>
                          {existingNodal ? (
                            <option value={nodalForm.designationName}>{nodalForm.designationName}</option>
                          ) : (
                            designations
                              .filter(d =>
                                roleDesignations.some(rd => rd.roleName === nodalForm.userType && Number(rd.designationId) === d.id)
                              )
                              .map((d, i) => (
                                <option key={i} value={d.name}>{d.name}</option>
                              ))
                          )}
                        </select>
                      </div>

                      {!existingNodal && (
                        <div>
                          <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Password</label>
                          <input
                            type="password"
                            placeholder="Password"
                            value={nodalForm.password}
                            onChange={(e) => setNodalForm({ ...nodalForm, password: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100"
                          />
                        </div>
                      )}
                    </div>

                    {!existingNodal && (
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-center gap-2">
                        <button
                          type="submit"
                          className="px-8 py-2.5 bg-[#3b82f6] hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-sm border-0 cursor-pointer text-xs"
                        >
                          Create
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </form>

              {/* Created Users List Table (shown at the bottom) */}
              {nodalForm.departmentName && deptUsers && deptUsers.length > 0 && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
                  <h4 className="font-extrabold text-blue-600 dark:text-blue-400 text-sm uppercase tracking-wider font-sans">Created Users</h4>

                  <div className="border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900">
                    <table className="w-full border-collapse text-[11px] text-left">
                      <thead>
                        <tr className="bg-blue-600 dark:bg-blue-800 text-white font-extrabold uppercase select-none text-[10px]">
                          <th className="p-3 border-r border-blue-500/30 text-center w-12">S. No.</th>
                          <th className="p-3 border-r border-blue-500/30">Name</th>
                          <th className="p-3 border-r border-blue-500/30">Department</th>
                          <th className="p-3 border-r border-blue-500/30">Designation</th>
                          <th className="p-3 border-r border-blue-500/30">Created On</th>
                          <th className="p-3">Created By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deptUsers.map((u, idx) => (
                          <tr key={idx} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300">
                            <td className="p-3 border-r border-slate-200 dark:border-slate-800 text-center font-bold">{idx + 1}</td>
                            <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold">{u.name}</td>
                            <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-semibold">{u.department}</td>
                            <td className="p-3 border-r border-slate-200 dark:border-slate-800">{u.designation}</td>
                            <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-mono text-[10px]">{u.createdAt}</td>
                            <td className="p-3 font-semibold">{u.createdBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : sidebarActiveItem === 'Create users' ? (
            /* ────────────────────────────────────────────────────────
               VIEW: CREATE USERS SCREEN (MATCHING USER REFERENCE SCREENSHOT)
               ──────────────────────────────────────────────────────── */
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-xs animate-fadeIn text-left">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Create Users</span>
              </h3>

              <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">User Type *</label>
                  <select
                    value={createUserForm.userType}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, userType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-bold text-slate-800 dark:text-slate-200 text-xs"
                  >
                    <option value="">--Select--</option>
                    <option value="Executive Administrator">Executive Administrator</option>
                    <option value="Dealing Hand Head">Dealing Hand Head</option>
                    <option value="FMC Head">FMC Head</option>
                    <option value="DM">DM</option>
                    <option value="Raabita Head">Raabita Head</option>
                    <option value="Monitoring Cell">Monitoring Cell</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">First name</label>
                    <input
                      type="text"
                      placeholder="First name"
                      value={createUserForm.firstName}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, firstName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Middle name</label>
                    <input
                      type="text"
                      placeholder="Middle name"
                      value={createUserForm.middleName}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, middleName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Last name *</label>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={createUserForm.lastName}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, lastName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Mobile *</label>
                    <input
                      type="text"
                      placeholder="Mobile"
                      maxLength="10"
                      value={createUserForm.mobile}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, mobile: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Email *</label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={createUserForm.email}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Designation *</label>
                    <input
                      type="text"
                      placeholder="Designation"
                      value={createUserForm.designation}
                      onChange={(e) => setCreateUserForm({ ...createUserForm, designation: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Office Name *</label>
                  <input
                    type="text"
                    placeholder="Office Name"
                    value={createUserForm.officeName}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, officeName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Password *</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={createUserForm.password}
                    onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-850 dark:text-slate-100"
                  />
                  <span className="block text-[10px] text-red-500 mt-1 font-semibold leading-relaxed">
                    Password should be minimum of 8 characters contain uppercase letter/lowercase letter, digits and special characters between @$!%*?&.
                  </span>
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-sm border-0 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          ) : sidebarActiveItem === 'Create Offices & Designation' ? (
            /* ────────────────────────────────────────────────────────
               VIEW: CREATE OFFICES & DESIGNATION SCREEN
               ──────────────────────────────────────────────────────── */
            <div className="space-y-6 animate-fadeIn">
              {/* Red Warning Note */}
              <div className="bg-red-50/50 dark:bg-red-955/20 border border-red-200/50 dark:border-red-900/30 p-4 rounded-xl space-y-1.5 text-xs text-left">
                <h4 className="font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider text-[11px] mb-1">Note:</h4>
                <ul className="list-disc pl-4 space-y-1 text-red-600 dark:text-red-400 font-semibold leading-relaxed">
                  <li>Before creating offices and designation please check the already created</li>
                  <li>If office and users not available kindly create it.</li>
                  <li>It will be helpful for downline users to create the lastmile user.</li>
                </ul>
              </div>


              {/* Create/Edit Form */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>{editMappingId ? "Edit Office & Designation" : "Create Office & Designation"}</span>
                </h3>
                <form onSubmit={handleOfficeDesignationSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Role *</label>
                    <select
                      value={officeDesignationForm.roleId}
                      onChange={(e) => setOfficeDesignationForm({ ...officeDesignationForm, roleId: e.target.value, designationId: '' })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      required
                    >
                      <option value="">Select Role</option>
                      {roles.filter(r => SUPPORTED_ROLES_MAP[r.typeName]).map((r, i) => (
                        <option key={i} value={r.id}>{SUPPORTED_ROLES_MAP[r.typeName]}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">Designation *</label>
                    <select
                      value={officeDesignationForm.designationId}
                      onChange={(e) => setOfficeDesignationForm({ ...officeDesignationForm, designationId: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                      required
                      disabled={!officeDesignationForm.roleId}
                    >
                      <option value="">{!officeDesignationForm.roleId ? "Select Role first" : "Select Designation"}</option>
                      {officeDesignationForm.roleId && (
                        <option value="add" className="text-blue-600 dark:text-blue-400 font-extrabold">+ Add New Designation</option>
                      )}
                      {designations
                        .map((d, i) => (
                          <option key={i} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                  </div>

                  {officeDesignationForm.designationId === 'add' && (
                    <div className="md:col-span-2">
                      <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1.5 font-semibold text-[11px] uppercase tracking-wider">New Designation Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. ASSISTANT ENGINEER"
                        value={newDesignationName}
                        onChange={(e) => setNewDesignationName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-bold text-slate-800 dark:text-slate-200 uppercase"
                        required
                      />
                    </div>
                  )}

                  <div className="md:col-span-2 pt-2 flex gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-sm border-0 cursor-pointer text-xs uppercase tracking-wider transition-all"
                    >
                      {editMappingId ? "Update" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetOfficeDesignationForm}
                      className="px-6 py-2.5 bg-[#1e1f31] hover:bg-[#28293d] text-white font-extrabold rounded-lg shadow-sm border-0 cursor-pointer text-xs uppercase tracking-wider transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>

              {/* Table Component */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>Created Office & Designations</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const data = await adminService.getRoleDesignations();
                          setRoleDesignations(data || []);
                        } catch (err) {
                          console.error("Refresh failed", err);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-400 bg-transparent cursor-pointer flex items-center justify-center"
                      title="Refresh Table"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Search & Entry controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400">
                    <span>Show</span>
                    <select
                      value={mappingEntriesToShow}
                      onChange={(e) => {
                        setMappingEntriesToShow(Number(e.target.value));
                        setMappingCurrentPage(1);
                      }}
                      className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 outline-none font-bold text-slate-800 dark:text-slate-200 cursor-pointer font-sans"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>entries</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Search:</span>
                    <div className="relative">
                      <input
                        type="text"
                        value={mappingSearchQuery}
                        onChange={(e) => {
                          setMappingSearchQuery(e.target.value);
                          setMappingCurrentPage(1);
                        }}
                        className="bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded pl-7 pr-2.5 py-1.5 outline-none text-slate-800 dark:text-slate-200 w-44 font-semibold text-xs"
                        placeholder="Search..."
                      />
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Table list */}
                <div className="border border-slate-200 dark:border-slate-850 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900">
                  <table className="w-full border-collapse text-[11px] text-left">
                    <thead>
                      <tr className="bg-blue-600 dark:bg-blue-800 text-white font-extrabold uppercase select-none text-[10px]">
                        <th className="p-3 border-r border-blue-500/30 text-center w-12">S. No.</th>
                        <th className="p-3 border-r border-blue-500/30">Role</th>
                        <th className="p-3 border-r border-blue-500/30">Designation</th>
                        <th className="p-3 border-r border-blue-500/30">Created By</th>
                        <th className="p-3 border-r border-blue-500/30">Created On</th>
                        <th className="p-3 text-center w-24">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedMappings.length > 0 ? (
                        displayedMappings.map((rd, idx) => (
                          <tr key={rd.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-955 text-slate-700 dark:text-slate-300">
                            <td className="p-3 border-r border-slate-200 dark:border-slate-800 text-center font-bold">
                              {(mappingCurrentPage - 1) * mappingEntriesToShow + idx + 1}
                            </td>
                            <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold">{SUPPORTED_ROLES_MAP[rd.roleName] || rd.roleName}</td>
                            <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-semibold">{rd.designationName}</td>
                            <td className="p-3 border-r border-slate-200 dark:border-slate-800">{rd.createdBy}</td>
                            <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-mono text-[10px]">
                              {rd.createdAt ? rd.createdAt.replace('T', ' ') : 'NA'}
                            </td>
                            <td className="p-3 text-center flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleEditMappingClick(rd)}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold border-0 cursor-pointer text-[10px] flex items-center gap-1 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteMappingClick(rd.id)}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold border-0 cursor-pointer text-[10px] flex items-center gap-1 transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-6 text-center text-slate-500 font-bold">No mapping records found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                {totalMappingPages > 1 && (
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      Showing {((mappingCurrentPage - 1) * mappingEntriesToShow) + 1} to {Math.min(mappingCurrentPage * mappingEntriesToShow, filteredMappings.length)} of ${filteredMappings.length} entries
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setMappingCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={mappingCurrentPage === 1}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:hover:bg-slate-950 font-bold bg-transparent disabled:opacity-50 cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setMappingCurrentPage(prev => Math.min(prev + 1, totalMappingPages))}
                        disabled={mappingCurrentPage === totalMappingPages}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:hover:bg-slate-955 font-bold bg-transparent disabled:opacity-50 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : sidebarActiveItem === 'Department Mapping' ? (
            /* ────────────────────────────────────────────────────────
              VIEW: DEPARTMENT CONFIGURATION SCREEN
              ──────────────────────────────────────────────────────── */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">

              {/* Left Column: Create Department Form */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 h-fit">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Create New Department</span>
                </h3>

                <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Type of Department *</label>
                    <select
                      value={deptType}
                      onChange={(e) => setDeptType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-bold text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select Type</option>
                      <option value="ADMIN">Administrative Department</option>
                      <option value="OTHER">Line / Other Department</option>
                      <option value="DoPG">Department of Public Grievances (DoPG)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Department Name *</label>
                    <select
                      value={deptNameSelect}
                      onChange={(e) => setDeptNameSelect(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select Name or Option</option>
                      <option value="add">Add new department</option>
                      {/* <option value="HEALTH AND MEDICAL EDUCATION DEPARTMENT">Health and Medical Education Department</option>
                      <option value="SCHOOL EDUCATION DEPARTMENT">School Education Department</option>
                      <option value="HIGHER EDUCATION DEPARTMENT">Higher Education Department</option>
                      <option value="HOME DEPARTMENT">Home Department</option>
                      <option value="JAL SHAKTI DEPARTMENT">Jal Shakti Department</option>
                      <option value="POWER DEVELOPMENT DEPARTMENT">Power Development Department</option>
                      <option value="REVENUE DEPARTMENT">Revenue Department</option>
                      <option value="RURAL DEVELOPMENT DEPARTMENT">Rural Development Department</option> */}
                    </select>

                    {deptNameSelect === 'add' && (
                      <div className="space-y-3 mt-3">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Department name *</label>
                          <input
                            type="text"
                            value={customDeptName}
                            onChange={(e) => setCustomDeptName(e.target.value)}
                            placeholder="Department"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none text-slate-800 dark:text-slate-100 uppercase font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Office name of Nodal *</label>
                          <input
                            type="text"
                            value={officeName}
                            onChange={(e) => setOfficeName(e.target.value)}
                            placeholder="Office name"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none text-slate-800 dark:text-slate-100 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Designation of Department Nodal *</label>
                          <input
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="Designation"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 outline-none text-slate-800 dark:text-slate-100 font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-sm border-0 cursor-pointer transition-all"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-6 py-2.5 bg-[#1e1f31] hover:bg-[#28293d] text-white font-extrabold rounded-lg shadow-sm border-0 cursor-pointer transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Departments List Table */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                    <span>Registered Departments ({departments.length})</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="relative">
                      <input
                        type="text"
                        value={tableSearchQuery}
                        onChange={(e) => setTableSearchQuery(e.target.value)}
                        className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-blue-600 text-slate-800 dark:text-slate-250 w-44"
                        placeholder="Search departments..."
                      />
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    </div>

                    <select
                      value={filterDeptTypeTable}
                      onChange={(e) => setFilterDeptTypeTable(e.target.value)}
                      className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg px-2 py-1.5 text-xs outline-none text-slate-800 dark:text-slate-250 font-bold"
                    >
                      <option value="">All Types</option>
                      <option value="ADMIN">Administrative</option>
                      <option value="OTHER">Line Department</option>
                      <option value="DoPG">DoPG</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-400 uppercase tracking-widest text-[9px] font-extrabold select-none">
                        <th className="px-5 py-3 text-center">S.No.</th>
                        <th className="px-5 py-3">Department Name</th>
                        <th className="px-5 py-3">Type</th>
                        <th className="px-5 py-3">Created On</th>
                        <th className="px-5 py-3">Created By</th>
                        <th className="px-5 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isDeptLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-400 font-bold">Loading registered departments...</td>
                        </tr>
                      ) : departments.filter(d => {
                        const q = tableSearchQuery.toLowerCase();
                        const matchesSearch = d.name.toLowerCase().includes(q);
                        const matchesType = filterDeptTypeTable ? d.type === filterDeptTypeTable : true;
                        return matchesSearch && matchesType;
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-slate-400">No departments match your filter.</td>
                        </tr>
                      ) : (
                        departments.filter(d => {
                          const q = tableSearchQuery.toLowerCase();
                          const matchesSearch = d.name.toLowerCase().includes(q);
                          const matchesType = filterDeptTypeTable ? d.type === filterDeptTypeTable : true;
                          return matchesSearch && matchesType;
                        }).map((d, index) => {
                          const meta = getDepartmentMeta(d, index);
                          return (
                            <tr key={d.id || index} className="border-b border-slate-150 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-5 py-3 text-center font-bold text-slate-500">{index + 1}</td>
                              <td className="px-5 py-3 font-bold text-slate-800 dark:text-slate-200">{d.name}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${meta.type === 'ADMIN'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                                  }`}>
                                  {meta.type}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-slate-500 font-mono text-[10px]">{meta.createdOn}</td>
                              <td className="px-5 py-3 font-medium text-slate-600 dark:text-slate-400">{meta.createdBy}</td>
                              <td className="px-5 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => setEditDeptModal({ isOpen: true, id: d.id, name: d.name, type: d.type })}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-650 dark:text-blue-400 rounded text-[10px] font-bold transition border-0 cursor-pointer"
                                >
                                  Edit Name
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : sidebarActiveItem === 'Analytical Dashboard' ? (
            /* ────────────────────────────────────────────────────────
               VIEW: ANALYTICAL REPORTS VIEW
               ──────────────────────────────────────────────────────── */
            <div className="space-y-6 animate-fadeIn">
              {/* Header section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-left">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Analytical Dashboard</h2>
                  <p className="text-xs text-slate-500">Real-time analytical reporting and performance metrics across departments</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={resetAnalFilters}
                    className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1.5 transition border-0 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
                  </button>
                </div>
              </div>

              {/* Filters Pane */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 text-left">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Filter className="w-4 h-4 text-blue-500" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Search & Filter Criteria</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Department</label>
                    <select
                      value={analDept}
                      onChange={(e) => handleAnalDeptChange(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category</label>
                    <select
                      value={analCat}
                      onChange={(e) => handleAnalCatChange(e.target.value)}
                      disabled={!analDept}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium disabled:opacity-55"
                    >
                      <option value="">All Categories</option>
                      {analCategoriesList.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Category */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Sub Category</label>
                    <select
                      value={analSubCat}
                      onChange={(e) => setAnalSubCat(e.target.value)}
                      disabled={!analCat}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium disabled:opacity-55"
                    >
                      <option value="">All Sub Categories</option>
                      {analSubCategoriesList.map((sub) => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Overall Status */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Overall Status</label>
                    <select
                      value={analStatus}
                      onChange={(e) => setAnalStatus(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    >
                      <option value="">All Statuses</option>
                      <option value="Registered">Registered</option>
                      <option value="Pending">Pending</option>
                      <option value="Open">Open</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Appealed">Appealed</option>
                      <option value="Forwarded">Forwarded</option>
                    </select>
                  </div>

                  {/* Sub Status */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Sub Status</label>
                    <select
                      value={analSubStatus}
                      onChange={(e) => setAnalSubStatus(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    >
                      <option value="">All Sub Statuses</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Under Process">Under Process</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* Window (Origin) */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Window (Grievance Origin)</label>
                    <select
                      value={analWindow}
                      onChange={(e) => setAnalWindow(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    >
                      <option value="">All Origins</option>
                      <option value="JKSAMADHAN">J&K Samadhan</option>
                      <option value="JKIGRAMS">JK-IGRAMS</option>
                      <option value="CPGRAMS">CPGRAMS</option>
                    </select>
                  </div>

                  {/* From Date */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">From Date</label>
                    <input
                      type="date"
                      value={analFromDate}
                      onChange={(e) => setAnalFromDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    />
                  </div>

                  {/* To Date */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">To Date</label>
                    <input
                      type="date"
                      value={analToDate}
                      onChange={(e) => setAnalToDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    />
                  </div>

                  {/* Operator */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Operator (Days)</label>
                    <select
                      value={analOperator}
                      onChange={(e) => setAnalOperator(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    >
                      <option value="">No Filter</option>
                      <option value="lt">{"< Less than"}</option>
                      <option value="gt">{"> Greater than"}</option>
                    </select>
                  </div>

                  {/* Operand Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Operand (In Days)</label>
                    <input
                      type="number"
                      placeholder="e.g. 30"
                      value={analOperand}
                      onChange={(e) => setAnalOperand(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    />
                  </div>

                  {/* Administrative Type */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Administrative Type</label>
                    <select
                      value={analAdminType}
                      onChange={(e) => setAnalAdminType(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    >
                      <option value="">All Types</option>
                      <option value="Normal">Normal</option>
                      <option value="Priority">Priority</option>
                      <option value="Key">Key / Important</option>
                    </select>
                  </div>

                  {/* AI Tracking */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">AI Tracking</label>
                    <select
                      value={analAiTracking}
                      onChange={(e) => setAnalAiTracking(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    >
                      <option value="">All Tracks</option>
                      <option value="active">Active AI Tracking</option>
                      <option value="inactive">No AI Tracking</option>
                    </select>
                  </div>

                  {/* AI Classification */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">AI Classification</label>
                    <select
                      value={analAiClassification}
                      onChange={(e) => setAnalAiClassification(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    >
                      <option value="">All Classifications</option>
                      <option value="auto">Automated</option>
                      <option value="manual">Manual Override</option>
                    </select>
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mode</label>
                    <select
                      value={analMode}
                      onChange={(e) => setAnalMode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                    >
                      <option value="">All Modes</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline / Physical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Total Grievance Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/10 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 flex flex-col justify-between h-32 shadow-xs text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Total Grievances</span>
                    <FolderOpen className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-blue-950 dark:text-white leading-none">
                      {isAnalSummaryLoading ? '...' : (analSummary?.totalGrievances || 0)}
                    </h3>
                    <p className="text-[9px] text-blue-700 dark:text-blue-400 mt-1 font-semibold">Overall registered elements</p>
                  </div>
                </div>

                {/* Closed Grievance Card */}
                <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-950/40 dark:to-teal-900/10 border border-teal-200 dark:border-teal-900/50 rounded-xl p-4 flex flex-col justify-between h-32 shadow-xs text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">Closed Grievances</span>
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-teal-950 dark:text-white leading-none">
                      {isAnalSummaryLoading ? '...' : ((analSummary?.resolved || 0) + (analSummary?.rejected || 0))}
                    </h3>
                    <div className="flex gap-2 text-[9px] text-teal-700 dark:text-teal-400 mt-1.5 font-bold uppercase tracking-wider">
                      <span>Res: {analSummary?.resolved || 0}</span>
                      <span>Rej: {analSummary?.rejected || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Grievances Open Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/10 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 flex flex-col justify-between h-32 shadow-xs text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Open Grievances</span>
                    <AlertCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-emerald-950 dark:text-white leading-none">
                      {isAnalSummaryLoading ? '...' : (analSummary?.open || 0)}
                    </h3>
                    <p className="text-[9px] text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">Pending redressal processing</p>
                  </div>
                </div>

                {/* Appealed Grievances Card */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex flex-col justify-between h-32 shadow-xs text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Appealed Grievances</span>
                    <Flag className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-amber-950 dark:text-white leading-none">
                      {isAnalSummaryLoading ? '...' : (analSummary?.appealReceivedCount || 0)}
                    </h3>
                    <p className="text-[9px] text-amber-700 dark:text-amber-400 mt-1 font-semibold">Elevated to appellate authority</p>
                  </div>
                </div>

                {/* Disposal Percentage Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/10 border border-indigo-200 dark:border-indigo-900/50 rounded-xl p-4 flex flex-col justify-between h-32 shadow-xs text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Disposal Percentage</span>
                    <ThumbsUp className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-indigo-950 dark:text-white leading-none">
                      {isAnalSummaryLoading ? '...' : `${analSummary?.averageResolutionTime || 0.0}%`}
                    </h3>
                    <p className="text-[9px] text-indigo-700 dark:text-indigo-400 mt-1 font-semibold">Redressal closing success rate</p>
                  </div>
                </div>
              </div>

              {/* Data Table Area */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden text-left">
                {/* Controls toolbar */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Show</span>
                    <select
                      value={analEntriesPerPage}
                      onChange={(e) => { setAnalEntriesPerPage(Number(e.target.value)); setAnalCurrentPage(1); }}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-1 text-xs text-slate-700 dark:text-slate-300 outline-none font-bold"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-xs font-semibold text-slate-500">entries</span>
                  </div>

                  <div className="flex flex-1 md:max-w-md gap-2 items-center justify-end">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search ID, description, submitter..."
                        value={analSearchQuery}
                        onChange={(e) => { setAnalSearchQuery(e.target.value); setAnalCurrentPage(1); }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium placeholder-slate-400"
                      />
                    </div>
                    <button
                      onClick={handleAnalExportCSV}
                      disabled={analGrievances.length === 0}
                      className="px-3 py-2 text-xs font-bold bg-emerald-600 hover:bg-[#059669] text-white rounded-lg flex items-center gap-1.5 transition border-0 cursor-pointer disabled:opacity-50"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
                    </button>
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="p-3 border-r border-slate-100 dark:border-slate-800 text-center w-12">S.No.</th>

                        <th onClick={() => handleAnalSort('uniqId')} className="p-3 border-r border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50">
                          <div className="flex items-center gap-1">
                            Grievance ID <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </th>

                        <th className="p-3 border-r border-slate-100 dark:border-slate-800">Department</th>
                        <th className="p-3 border-r border-slate-100 dark:border-slate-800">Category</th>
                        <th className="p-3 border-r border-slate-100 dark:border-slate-800">Sub Category</th>
                        <th className="p-3 border-r border-slate-100 dark:border-slate-800">Sub Cat L2</th>
                        <th className="p-3 border-r border-slate-100 dark:border-slate-800">Sub Cat L3</th>
                        <th className="p-3 border-r border-slate-100 dark:border-slate-800">Sub Cat L4</th>
                        <th className="p-3 border-r border-slate-100 dark:border-slate-800">Submitted By</th>

                        <th onClick={() => handleAnalSort('createdAt')} className="p-3 border-r border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50">
                          <div className="flex items-center gap-1">
                            Submitted On <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </th>

                        <th className="p-3 border-r border-slate-100 dark:border-slate-800">Window</th>
                        <th className="p-3 border-r border-slate-100 dark:border-slate-800">Division</th>
                        <th className="p-3 border-r border-slate-100 dark:border-slate-800">District</th>

                        <th onClick={() => handleAnalSort('status')} className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50">
                          <div className="flex items-center gap-1">
                            Status <ArrowUpDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {isAnalLoading ? (
                        <tr>
                          <td colSpan="14" className="p-8 text-center text-slate-400 font-semibold">
                            <span className="inline-block animate-pulse">Loading analytical records...</span>
                          </td>
                        </tr>
                      ) : analGrievances.length === 0 ? (
                        <tr>
                          <td colSpan="14" className="p-8 text-center text-slate-400 font-semibold">No records found matching criteria</td>
                        </tr>
                      ) : (
                        analGrievances.map((g, index) => {
                          return (
                            <tr key={g.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300 transition-colors">
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-center text-slate-400">
                                {((analCurrentPage - 1) * analEntriesPerPage) + index + 1}
                              </td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 font-bold text-blue-600 dark:text-blue-400">
                                {g.uniqId || g.id}
                              </td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 font-medium truncate max-w-[150px]" title={g.department}>
                                {g.department}
                              </td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 font-medium truncate max-w-[150px]" title={g.grievanceCategory}>
                                {g.grievanceCategory}
                              </td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-slate-500 font-medium">{g.subCategory}</td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-slate-500 font-medium">{g.subCategoryL2}</td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-slate-500 font-medium">{g.subCategoryL3}</td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-slate-500 font-medium">{g.subCategoryL4}</td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 font-medium">{g.citizenName || 'NA'}</td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-slate-400 font-mono">
                                {g.createdAt ? g.createdAt.replace('T', ' ').substring(0, 19) : 'NA'}
                              </td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                  {g.origin}
                                </span>
                              </td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-slate-500">{g.division}</td>
                              <td className="p-3 border-r border-slate-100 dark:border-slate-800 text-slate-500">{g.district}</td>
                              <td className="p-3">
                                {getStatusBadge(g.status)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {!isAnalLoading && analTotalPages > 1 && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-500">
                      Showing {((analCurrentPage - 1) * analEntriesPerPage) + 1} to {Math.min(analCurrentPage * analEntriesPerPage, analTotalElements)} of {analTotalElements} entries
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setAnalCurrentPage(1)}
                        disabled={analCurrentPage === 1}
                        className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent font-bold cursor-pointer disabled:opacity-50"
                      >
                        First
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnalCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={analCurrentPage === 1}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent font-bold cursor-pointer disabled:opacity-50"
                      >
                        Previous
                      </button>

                      {getPaginationRange(analCurrentPage, analTotalPages).map(pageNum => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setAnalCurrentPage(pageNum)}
                          className={`px-3 py-1.5 border rounded font-bold cursor-pointer ${analCurrentPage === pageNum ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setAnalCurrentPage(prev => Math.min(prev + 1, analTotalPages))}
                        disabled={analCurrentPage === analTotalPages}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent font-bold cursor-pointer disabled:opacity-50"
                      >
                        Next
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnalCurrentPage(analTotalPages)}
                        disabled={analCurrentPage === analTotalPages}
                        className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 rounded bg-transparent font-bold cursor-pointer disabled:opacity-50"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly Citizen Registration Bar Graph */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs text-left space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#5c3beb]" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Monthly Citizen Registration
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    Total: {analSummary?.monthlyCitizenTrends?.reduce((sum, item) => sum + (item.value || 0), 0) || 0}
                  </div>
                </div>

                <div className="h-80 w-full font-sans">
                  {analSummary?.monthlyCitizenTrends && analSummary.monthlyCitizenTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <ChartBarChart
                        data={analSummary.monthlyCitizenTrends}
                        margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="label"
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          dx={-10}
                        />
                        <ChartTooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            borderRadius: '12px',
                            color: '#fff',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '10px 14px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                          cursor={{ fill: 'rgba(92, 59, 235, 0.05)' }}
                        />
                        <Bar
                          dataKey="value"
                          name="Citizen Registrations"
                          fill="url(#colorCitizenGrad)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={50}
                        />
                        <defs>
                          <linearGradient id="colorCitizenGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#5c3beb" stopOpacity={0.9} />
                          </linearGradient>
                        </defs>
                      </ChartBarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                      No citizen registration data available for the selected filters
                    </div>
                  )}
                </div>
              </div>

              {/* Slide-out Overlay Drawer for Analytical Dashboard Filters */}
              {showAnalFilterDrawer && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
                  {/* Click outside to close */}
                  <div className="flex-1 cursor-pointer" onClick={() => setShowAnalFilterDrawer(false)}></div>

                  <div className="w-96 bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slideIn">
                    {/* Header: Purple color bar (#6b38fb) */}
                    <div className="bg-[#6b38fb] px-6 py-4 flex justify-between items-center text-white">
                      <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                      </h3>
                      <button
                        onClick={() => setShowAnalFilterDrawer(false)}
                        className="text-white hover:text-slate-205 bg-transparent border-0 cursor-pointer font-bold text-base leading-none"
                      >
                        ✖
                      </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 p-6 space-y-6 text-left overflow-y-auto">
                      {/* Date Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">From / on</label>
                          <input
                            type="date"
                            value={analFromDate}
                            onChange={(e) => setAnalFromDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">To</label>
                          <input
                            type="date"
                            value={analToDate}
                            onChange={(e) => setAnalToDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-705 text-slate-700 dark:text-slate-300 outline-none font-medium"
                          />
                        </div>
                      </div>

                      <hr className="border-slate-100 dark:border-slate-800 my-4" />

                      {/* Radios Area */}
                      <div className="space-y-3">
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'web', label: 'Web' },
                          { id: 'mobile', label: 'Mobile' },
                          { id: 'normal', label: 'Normal' },
                          { id: 'priority', label: 'Priority' },
                          { id: 'beyond7', label: 'Beyond 7 days' },
                          { id: 'beyond28', label: 'Beyond 28 days' }
                        ].map((radio) => (
                          <label key={radio.id} className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                            <input
                              type="radio"
                              name="analRadioFilter"
                              checked={analRadioFilter === radio.id}
                              onChange={() => {
                                setAnalRadioFilter(radio.id);
                                if (radio.id === 'all') {
                                  setAnalMode('');
                                  setAnalAdminType('');
                                  setAnalOperator('');
                                  setAnalOperand('');
                                } else if (radio.id === 'web') {
                                  setAnalMode('online');
                                  setAnalAdminType('');
                                  setAnalOperator('');
                                  setAnalOperand('');
                                } else if (radio.id === 'mobile') {
                                  setAnalMode('offline');
                                  setAnalAdminType('');
                                  setAnalOperator('');
                                  setAnalOperand('');
                                } else if (radio.id === 'normal') {
                                  setAnalAdminType('Normal');
                                  setAnalMode('');
                                  setAnalOperator('');
                                  setAnalOperand('');
                                } else if (radio.id === 'priority') {
                                  setAnalAdminType('Priority');
                                  setAnalMode('');
                                  setAnalOperator('');
                                  setAnalOperand('');
                                } else if (radio.id === 'beyond7') {
                                  setAnalOperator('gt');
                                  setAnalOperand('7');
                                  setAnalMode('');
                                  setAnalAdminType('');
                                } else if (radio.id === 'beyond28') {
                                  setAnalOperator('gt');
                                  setAnalOperand('28');
                                  setAnalMode('');
                                  setAnalAdminType('');
                                }
                              }}
                              className="w-4 h-4 text-[#6b38fb] focus:ring-[#6b38fb] border-slate-300"
                            />
                            <span>{radio.label}</span>
                          </label>
                        ))}
                      </div>

                      <hr className="border-slate-100 dark:border-slate-800 my-4" />

                      {/* Select Fields */}
                      <div className="space-y-4">
                        {/* Status Select */}
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Status</label>
                          <select
                            value={analStatus}
                            onChange={(e) => setAnalStatus(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                          >
                            <option value="">Select Status</option>
                            <option value="Registered">Registered</option>
                            <option value="Pending">Pending</option>
                            <option value="Open">Open</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Appealed">Appealed</option>
                            <option value="Forwarded">Forwarded</option>
                          </select>
                        </div>

                        {/* District Select */}
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">District</label>
                          <select
                            value={analDistrict}
                            onChange={(e) => setAnalDistrict(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                          >
                            <option value="">Select District</option>
                            {analDistrictsList.map((dist) => (
                              <option key={dist.id} value={dist.name}>{dist.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Department Select */}
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Department</label>
                          <select
                            value={analDept}
                            onChange={(e) => handleAnalDeptChange(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-750 text-slate-700 dark:text-slate-300 outline-none font-medium"
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Category Select */}
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Category</label>
                          <select
                            value={analCat}
                            onChange={(e) => handleAnalCatChange(e.target.value)}
                            disabled={!analDept}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium disabled:opacity-55"
                          >
                            <option value="">Select Category</option>
                            {analCategoriesList.map((cat) => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex gap-2">
                      <button
                        onClick={() => setShowAnalFilterDrawer(false)}
                        className="flex-1 py-2.5 bg-[#6b38fb] hover:bg-[#5b2be3] text-white text-xs font-bold rounded-lg cursor-pointer border-0 shadow-sm"
                      >
                        Apply Filters
                      </button>
                      <button
                        onClick={() => {
                          resetAnalFilters();
                        }}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 text-slate-650 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer border-0"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowAnalFilterDrawer(false)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer border-0"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : sidebarActiveItem === 'Appeal Dashboard' ? (
            /* ────────────────────────────────────────────────────────
               VIEW: APPEALS REDRESSAL LOGS
               ──────────────────────────────────────────────────────── */
            <div className="space-y-6 animate-fadeIn">
              {/* 2 Rows of 4 Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Appeals */}
                <div className="bg-[#1e6091] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-100">Total Appeals</span>
                    <span className="block text-2xl font-black font-mono">{appealSummary?.totalAppeals || 0}</span>
                  </div>
                  <PieChart className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 2. Appeal Disposed */}
                <div className="bg-[#0e7c8b] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-100">Appeal Disposed</span>
                    <span className="block text-2xl font-black font-mono">{appealSummary?.appealDisposed || 0}</span>
                  </div>
                  <Calendar className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 3. Appeals Rejected */}
                <div className="bg-[#5e9e31] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-100">Appeals Rejected</span>
                    <span className="block text-2xl font-black font-mono">{appealSummary?.appealsRejected || 0}</span>
                  </div>
                  <ThumbsUp className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 4. Appeals Pending */}
                <div className="bg-[#eb6f38] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-orange-100">Appeales Pending</span>
                    <span className="block text-2xl font-black font-mono">{appealSummary?.appealsPending || 0}</span>
                  </div>
                  <AlertCircle className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 5. Appeals Under Process */}
                <div className="bg-[#f0b429] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-100">Appeals Under Process <span className="block text-[9px] lowercase font-light italic text-amber-200">(Forwarded To Subordinate Users)</span></span>
                    <span className="block text-2xl font-black font-mono">{appealSummary?.appealsUnderProcess || 0}</span>
                  </div>
                  <Copy className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 6. Appeals Open */}
                <div className="bg-[#8220ab] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-purple-100">Appeals Open <span className="block text-[9px] lowercase font-light italic text-purple-200">(Pending+Forwarded)</span></span>
                    <span className="block text-2xl font-black font-mono">{appealSummary?.appealsOpen || 0}</span>
                  </div>
                  <Presentation className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 7. Appeals Closed */}
                <div className="bg-[#e6496b] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-rose-100">Appeals Closed <span className="block text-[9px] lowercase font-light italic text-rose-200">(Disposed+Rejected)</span></span>
                    <span className="block text-2xl font-black font-mono">{appealSummary?.appealsClosed || 0}</span>
                  </div>
                  <Flag className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 8. Disposal % */}
                <div className="bg-[#00c9a7] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-100">Disposal %</span>
                    <span className="block text-2xl font-black font-mono">{appealSummary?.disposalPercentage || '0.00'}</span>
                  </div>
                  <ClipboardList className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>
              </div>

              {/* Card 9 Centered Below */}
              <div className="flex justify-center w-full mt-4">
                <div className="bg-[#d81b60] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left w-full sm:w-1/4">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-pink-100">Remarks Received</span>
                    <span className="block text-2xl font-black font-mono">{appealSummary?.remarksReceived || 0}</span>
                  </div>
                  <ThumbsUp className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>
              </div>

              {/* Total Applications Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden text-left p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Total Applications Table</h3>

                  {/* Top-right export/print buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full border-0 cursor-pointer shadow-xs transition"
                      title="Print/Export PDF"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        fetchAppealDashboardSummary();
                        fetchAppealDashboardList();
                      }}
                      className="p-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-full border-0 cursor-pointer shadow-xs transition"
                      title="Refresh Data"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pagination controls & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>Show</span>
                    <select
                      value={appealEntriesPerPage}
                      onChange={(e) => {
                        setAppealEntriesPerPage(parseInt(e.target.value));
                        setAppealCurrentPage(1);
                      }}
                      className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-bold text-slate-800 dark:text-white outline-none"
                    >
                      {[5, 10, 25, 50, 100].map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </select>
                    <span>entries</span>
                  </div>

                  <div className="relative">
                    <span className="mr-1">Search:</span>
                    <input
                      type="text"
                      value={appealSearchQuery}
                      onChange={(e) => {
                        setAppealSearchQuery(e.target.value);
                        setAppealCurrentPage(1);
                      }}
                      className="pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold text-slate-850 dark:text-white outline-none w-48 focus:border-blue-500 focus:bg-white"
                      placeholder="Search appeals..."
                    />
                    {appealSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setAppealSearchQuery('');
                          setAppealCurrentPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 border-0 bg-transparent cursor-pointer text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-slate-600 dark:text-slate-400 border-collapse">
                    <thead>
                      <tr className="bg-blue-600 text-white font-extrabold uppercase text-[10px] tracking-wider text-left">
                        <th className="p-3 border border-slate-200 dark:border-slate-800">S.No.</th>
                        <th
                          onClick={() => handleAppealSort('department')}
                          className="p-3 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-blue-700 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Department</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleAppealSort('submittedBy.officeName')}
                          className="p-3 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-blue-700 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Office Name</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleAppealSort('grievance.uniqId')}
                          className="p-3 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-blue-700 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Grievance Id</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleAppealSort('appealUniqId')}
                          className="p-3 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-blue-700 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Appeal Id</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th
                          onClick={() => handleAppealSort('updatedAt')}
                          className="p-3 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-blue-700 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>date Of Action</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800">Action Taken</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800">Action Taken By</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800">Grievance Forwarded To</th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 max-w-xs truncate">Remark</th>
                        <th
                          onClick={() => handleAppealSort('status')}
                          className="p-3 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-blue-700 transition"
                        >
                          <div className="flex items-center gap-1.5">
                            <span>Status</span>
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          </div>
                        </th>
                        <th className="p-3 border border-slate-200 dark:border-slate-800 text-center font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isAppealLoading ? (
                        <tr>
                          <td colSpan={12} className="p-8 text-center text-slate-500 font-semibold">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                              <span>Loading appeals list...</span>
                            </div>
                          </td>
                        </tr>
                      ) : appeals.length === 0 ? (
                        <tr>
                          <td colSpan={12} className="p-8 text-center text-slate-400 font-semibold">
                            No appeal records found.
                          </td>
                        </tr>
                      ) : (
                        appeals.map((item, index) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850/60 font-medium text-slate-700 dark:text-slate-350"
                          >
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60 font-mono text-[11px]">
                              {(appealCurrentPage - 1) * appealEntriesPerPage + index + 1}
                            </td>
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60 font-bold text-slate-900 dark:text-white">
                              {item.department}
                            </td>
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60">
                              {item.officeName}
                            </td>
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60 font-bold text-blue-600 dark:text-blue-400">
                              {item.grievanceUniqId}
                            </td>
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60 font-mono font-bold text-rose-600 dark:text-rose-400">
                              {item.appealUniqId}
                            </td>
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60 font-mono">
                              {item.dateOfAction}
                            </td>
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60 font-semibold text-slate-800 dark:text-slate-200">
                              {item.actionTaken || 'Submitted'}
                            </td>
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60">
                              {item.actionTakenBy}
                            </td>
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60">
                              {item.grievanceForwardedTo}
                            </td>
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60 max-w-xs truncate" title={item.remark}>
                              {item.remark}
                            </td>
                            <td className="p-3 border-r border-slate-100 dark:border-slate-850/60">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' :
                                  item.status === 'Rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300' :
                                    item.status === 'Appeal Forwarded' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300' :
                                      'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => window.location.hash = `/appeal/${item.id}`}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-black border-0 cursor-pointer transition shadow-xs flex items-center gap-1 mx-auto"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Action</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                {!isAppealLoading && appeals.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>
                      Showing {(appealCurrentPage - 1) * appealEntriesPerPage + 1} to {Math.min(appealCurrentPage * appealEntriesPerPage, appealTotalElements)} of {appealTotalElements} entries
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={appealCurrentPage === 1}
                        onClick={() => setAppealCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-slate-800 dark:text-white"
                      >
                        Previous
                      </button>
                      {getPaginationRange(appealCurrentPage, appealTotalPages).map((pageNum, idx) => {
                        if (pageNum === '...') {
                          return (
                            <span key={`dots-${idx}`} className="px-2 text-slate-400 select-none font-bold">
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setAppealCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded-lg border-0 cursor-pointer font-bold ${appealCurrentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-655'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        disabled={appealCurrentPage === appealTotalPages}
                        onClick={() => setAppealCurrentPage(prev => Math.min(appealTotalPages, prev + 1))}
                        className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-slate-800 dark:text-white"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : sidebarActiveItem === 'Appeal MIS Report' ? (
            /* ────────────────────────────────────────────────────────
               VIEW: APPEAL MIS REPORT (DEPARTMENT-WISE SUMMARY)
               ──────────────────────────────────────────────────────── */
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 text-left animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-855/60 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Appeal MIS Report</h3>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5">
                    Department-wise cumulative statistics and disposal ratios of active appeals.
                  </p>
                </div>

                {/* Export Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAppealMisExportCSV}
                    className="px-4.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold border-0 cursor-pointer transition shadow-xs flex items-center gap-1.5"
                    title="Export CSV / Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Excel Export</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex flex-col gap-1 w-full max-w-xs text-xs">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">List of Departments:</label>
                  <select
                    value={appealMisDeptFilter}
                    onChange={(e) => {
                      setAppealMisDeptFilter(e.target.value);
                      setAppealMisCurrentPage(1);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="0">Select (All)</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1 w-full max-w-xs text-xs">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search:</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search department..."
                      value={appealMisSearchQuery}
                      onChange={(e) => {
                        setAppealMisSearchQuery(e.target.value);
                        setAppealMisCurrentPage(1);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-slate-100 rounded-lg pl-8 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* MIS Report Table */}
              <div className="space-y-4">
                <div className="overflow-x-auto border border-slate-150 dark:border-slate-850 rounded-xl">
                  <table className="w-full border-collapse text-xs font-sans text-slate-800 dark:text-slate-100">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-left">S. No.</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-left">Department</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Total Appeal</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Appeals Disposed</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Appeals Rejected</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Appeals Pending</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Appeals Under Process</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Appeals Open</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center">Appeals Closed</th>
                        <th className="p-3 text-center">Disposal%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
                      {isAppealMisLoading ? (
                        <tr>
                          <td colSpan="10" className="p-8 text-center text-slate-500 font-semibold italic animate-pulse">
                            Loading MIS data...
                          </td>
                        </tr>
                      ) : appealMisData.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="p-8 text-center text-slate-500 font-semibold italic">
                            No MIS report data available.
                          </td>
                        </tr>
                      ) : (
                        appealMisData.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors font-medium">
                            <td className="p-3 border-r border-slate-150 dark:border-slate-850/60 text-left">
                              {(appealMisCurrentPage - 1) * appealMisEntriesPerPage + index + 1}
                            </td>
                            <td className="p-3 border-r border-slate-150 dark:border-slate-850/60 text-left font-bold text-slate-800 dark:text-slate-200">
                              {item.department}
                            </td>
                            <td className="p-3 border-r border-slate-150 dark:border-slate-850/60 text-center font-mono text-blue-600 dark:text-blue-400 font-bold">
                              {item.totalAppeals || 0}
                            </td>
                            <td className="p-3 border-r border-slate-150 dark:border-slate-850/60 text-center font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {item.appealsDisposed || 0}
                            </td>
                            <td className="p-3 border-r border-slate-150 dark:border-slate-850/60 text-center font-mono text-rose-600 dark:text-rose-400 font-bold">
                              {item.appealsRejected || 0}
                            </td>
                            <td className="p-3 border-r border-slate-150 dark:border-slate-850/60 text-center font-mono text-amber-600 dark:text-amber-400 font-bold">
                              {item.appealsPending || 0}
                            </td>
                            <td className="p-3 border-r border-slate-150 dark:border-slate-850/60 text-center font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                              {item.appealsUnderProcess || 0}
                            </td>
                            <td className="p-3 border-r border-slate-150 dark:border-slate-850/60 text-center font-mono text-slate-700 dark:text-slate-300 font-bold">
                              {item.appealsOpen || 0}
                            </td>
                            <td className="p-3 border-r border-slate-150 dark:border-slate-850/60 text-center font-mono text-slate-700 dark:text-slate-300 font-bold">
                              {item.appealsClosed || 0}
                            </td>
                            <td className="p-3 text-center font-mono">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${(item.disposalPercentage || 0) >= 75 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' :
                                  (item.disposalPercentage || 0) >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' :
                                    'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                                }`}>
                                {item.disposalPercentage !== null ? `${item.disposalPercentage}%` : '0.00%'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {!isAppealMisLoading && appealMisData.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>
                      Showing {(appealMisCurrentPage - 1) * appealMisEntriesPerPage + 1} to {Math.min(appealMisCurrentPage * appealMisEntriesPerPage, appealMisTotalElements)} of {appealMisTotalElements} entries
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={appealMisCurrentPage === 1}
                        onClick={() => setAppealMisCurrentPage(prev => Math.max(1, prev - 1))}
                        className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-slate-800 dark:text-white"
                      >
                        Previous
                      </button>
                      {getPaginationRange(appealMisCurrentPage, appealMisTotalPages).map((pageNum, idx) => {
                        if (pageNum === '...') {
                          return (
                            <span key={`dots-${idx}`} className="px-2 text-slate-400 select-none font-bold">
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setAppealMisCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded-lg border-0 cursor-pointer font-bold ${appealMisCurrentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        disabled={appealMisCurrentPage === appealMisTotalPages}
                        onClick={() => setAppealMisCurrentPage(prev => Math.min(appealMisTotalPages, prev + 1))}
                        className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-slate-800 dark:text-white"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : sidebarActiveItem === 'Account Settings' ? (
            /* ────────────────────────────────────────────────────────
               VIEW: SUPER ADMIN PROFILE SECTION (MATCHING SCREENSHOT)
               ──────────────────────────────────────────────────────── */
            <div className="space-y-6 animate-fadeIn text-left text-xs font-sans">

              {/* Profile Section Purple Banner */}
              <div className="bg-[#c2c5e3] dark:bg-indigo-950/40 text-slate-800 dark:text-slate-100 p-3 rounded-lg shadow-sm border border-slate-350 dark:border-slate-800 text-center font-bold tracking-wider text-sm font-display">
                PROFILE SECTION
              </div>

              {/* Sub tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setProfileSubTab('Overview')}
                  className={`px-4 py-2 border-b-2 font-bold cursor-pointer transition-colors border-0 bg-transparent ${profileSubTab === 'Overview'
                      ? 'border-blue-600 text-blue-600 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-250 font-bold'
                    }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('ChangePassword')}
                  className={`px-4 py-2 border-b-2 font-bold cursor-pointer transition-colors border-0 bg-transparent ${profileSubTab === 'ChangePassword'
                      ? 'border-blue-600 text-blue-600 font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-250 font-bold'
                    }`}
                >
                  Change Password
                </button>
              </div>

              {/* Subtab content container */}
              {profileSubTab === 'Overview' ? (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  {/* Member Since heading */}
                  <div className="space-y-2">
                    <h4 className="font-black text-[#1e3a8a] dark:text-blue-400 text-sm uppercase tracking-wide">Member Since</h4>
                    <p className="font-black font-mono text-slate-700 dark:text-slate-300 text-xs">
                      2024-06-18 23:41:58.752 IST
                    </p>
                  </div>

                  {/* Profile Details heading */}
                  <div className="space-y-4">
                    <h4 className="font-black text-[#1e3a8a] dark:text-blue-400 text-sm uppercase tracking-wide">Profile Details</h4>

                    <div className="max-w-3xl space-y-3.5 text-xs">
                      <div className="grid grid-cols-3 md:grid-cols-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-[#1e3a8a] dark:text-slate-400">Full Name</span>
                        <span className="col-span-2 md:col-span-3 text-slate-800 dark:text-slate-200 font-semibold">{user?.name || 'harender singh'}</span>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-[#1e3a8a] dark:text-slate-400">Department</span>
                        <span className="col-span-2 md:col-span-3 text-slate-800 dark:text-slate-200 font-semibold">{user?.department || ''}</span>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-[#1e3a8a] dark:text-slate-400">Designation</span>
                        <span className="col-span-2 md:col-span-3 text-slate-800 dark:text-slate-200 font-semibold">{user?.designation || 'director'}</span>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-[#1e3a8a] dark:text-slate-400">STATE</span>
                        <span className="col-span-2 md:col-span-3 text-slate-800 dark:text-slate-200 font-semibold">{user?.state || ''}</span>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-[#1e3a8a] dark:text-slate-400">Mobile Number</span>
                        <span className="col-span-2 md:col-span-3 text-slate-800 dark:text-slate-200 font-semibold">{user?.mobile || user?.phone || '+91-9499494949'}</span>
                      </div>
                      <div className="grid grid-cols-3 md:grid-cols-4 pb-2">
                        <span className="font-bold text-[#1e3a8a] dark:text-slate-400">Email</span>
                        <span className="col-span-2 md:col-span-3 text-slate-800 dark:text-slate-200 font-semibold">{user?.email || 'superadmin@gmail.com'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-black text-[#1e3a8a] dark:text-blue-400 text-sm uppercase tracking-wide">Change Password</h4>
                    </div>

                    {/* Note Rules */}
                    <div className="space-y-1 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800/40">
                      <span className="text-amber-800 dark:text-amber-300 font-extrabold block text-xs">Note:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-amber-700 dark:text-amber-400 font-semibold text-xs leading-normal">
                        <li>The new password must meet the following security requirements:</li>
                        <ul className="list-circle pl-4 space-y-0.5 text-[11px] text-amber-600 dark:text-amber-400">
                          <li>At least 8 characters long.</li>
                          <li>At least 1 uppercase letter (A-Z).</li>
                          <li>At least 1 lowercase letter (a-z).</li>
                          <li>At least 1 digit (0-9) and 1 special character (e.g. @$!%*?&).</li>
                        </ul>
                      </ul>
                    </div>

                    {/* Alerts */}
                    {cpSuccess && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-fadeIn">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{cpSuccess}</span>
                      </div>
                    )}

                    {cpError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl flex items-center gap-2.5 text-xs text-red-800 dark:text-red-300 font-medium animate-fadeIn">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                        <span>{cpError}</span>
                      </div>
                    )}

                    {/* Change Password Form */}
                    <form onSubmit={handleAccountChangePassword} className="space-y-4 max-w-xl pt-2">
                      
                      {/* Current Password */}
                      <div className="space-y-1.5">
                        <label className="block font-bold text-xs text-slate-700 dark:text-slate-300">
                          Current Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative max-w-md">
                          <input
                            type={cpShowCurrent ? 'text' : 'password'}
                            value={cpCurrentPassword}
                            onChange={(e) => setCpCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            disabled={cpLoading}
                            className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setCpShowCurrent(!cpShowCurrent)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer"
                          >
                            {cpShowCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-1.5">
                        <label className="block font-bold text-xs text-slate-700 dark:text-slate-300">
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative max-w-md">
                          <input
                            type={cpShowNew ? 'text' : 'password'}
                            value={cpNewPassword}
                            onChange={(e) => setCpNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            disabled={cpLoading}
                            className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setCpShowNew(!cpShowNew)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer"
                          >
                            {cpShowNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1.5">
                        <label className="block font-bold text-xs text-slate-700 dark:text-slate-300">
                          Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative max-w-md">
                          <input
                            type={cpShowConfirm ? 'text' : 'password'}
                            value={cpConfirmPassword}
                            onChange={(e) => setCpConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            disabled={cpLoading}
                            className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setCpShowConfirm(!cpShowConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer"
                          >
                            {cpShowConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="pt-3 flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={cpLoading}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold rounded-lg border-0 cursor-pointer text-xs flex items-center gap-2 shadow-xs disabled:opacity-50"
                        >
                          {cpLoading ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Change Password</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCpCurrentPassword('');
                            setCpNewPassword('');
                            setCpConfirmPassword('');
                            setCpError('');
                            setCpSuccess('');
                            setProfileSubTab('Overview');
                          }}
                          disabled={cpLoading}
                          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg border-0 cursor-pointer text-xs"
                        >
                          Cancel
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'JK-IGRAMS' ? (
            <JkIgramsDashboardView user={user} />
          ) : (
            /* ────────────────────────────────────────────────────────
               VIEW: SUPER ADMIN MAIN DASHBOARD HOME
               ──────────────────────────────────────────────────────── */
            <div className="space-y-6 animate-fadeIn">

              {/* Metric stats cards (8 columns/cards matching user reference) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Grievance Received */}
                <div className="bg-[#1e6091] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-100">Total Grievance Received</span>
                    <span className="block text-2xl font-black font-mono">Total {stats.totalG}</span>
                    <span className="block text-[10px] font-semibold text-blue-200">Web {stats.web} Mobile {stats.App}</span>
                  </div>
                  <PieChart className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 2. Pending with Departments */}
                <div className="bg-[#0096c7] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-50">Pending with Departments</span>
                    <span className="block text-2xl font-black font-mono">{stats.pending}</span>
                    <span className="block text-[10px] text-transparent select-none">-</span>
                  </div>
                  <Calendar className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 3. Final Disposed */}
                <div className="bg-[#4ea8de] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-50">Final Disposed</span>
                    <span className="block text-2xl font-black font-mono">Total {stats.totalClosed}</span>
                    <span className="block text-[10px] font-semibold text-blue-100">Resolved {stats.resolved} Rejected {stats.rejected}</span>
                  </div>
                  <ThumbsUp className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 4. Appealed */}
                <div className="bg-[#f3722c] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-orange-100">Appealed</span>
                    <span className="block text-2xl font-black font-mono">{stats.appealReceviedCount}</span>
                    <span className="block text-[10px] text-transparent select-none">-</span>
                  </div>
                  <AlertCircle className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 5. Forwarded */}
                <div className="bg-[#f9c74f] text-slate-800 p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">Forwarded</span>
                    <span className="block text-2xl font-black font-mono">{stats.forwarded}</span>
                    <span className="block text-[10px] text-transparent select-none">-</span>
                  </div>
                  <Copy className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300 text-slate-700" />
                </div>

                {/* 6. Does Not Pertain */}
                <div className="bg-[#7209b7] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-purple-100">Does Not Pertain</span>
                    <span className="block text-2xl font-black font-mono">{stats.dNpCount}</span>
                    <span className="block text-[10px] text-transparent select-none">-</span>
                  </div>
                  <Presentation className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 7. CPGRAMS */}
                <div className="bg-[#f94144] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-red-100">CPGRAMS</span>
                    <span className="block text-2xl font-black font-mono">Total {stats.totalCPGRAM}</span>
                    <span className="block text-[10px] font-semibold text-red-200">Forwarded {stats.fwdToCPGRAM} Closed {stats.cpgramClosed}</span>
                  </div>
                  <Copy className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>

                {/* 8. Escalation Figures */}
                <div className="bg-[#43aa8b] text-white p-4.5 rounded-xl shadow-xs flex justify-between items-center relative overflow-hidden group border-0 text-left">
                  <div className="space-y-2 relative z-10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-100">Escalation Figures</span>
                    <span className="block text-2xl font-black font-mono">Total {stats.priorityFlagCount}</span>
                    <span className="block text-[10px] font-semibold text-teal-200">
                      Beyond 7 Days {Math.floor(Number(stats.priorityFlagCount) / 2)} Beyond 28 Days {Number(stats.priorityFlagCount) - Math.floor(Number(stats.priorityFlagCount) / 2)}
                    </span>
                  </div>
                  <Flag className="h-10 w-10 opacity-30 transform group-hover:scale-110 transition duration-300" />
                </div>
              </div>



              {/* Grievance Datatable */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                    <span>Total Applications Table</span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:border-blue-600 text-slate-800 dark:text-slate-250 w-52 font-medium"
                        placeholder="Search grievances..."
                      />
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1.5 items-center">
                      <button
                        type="button"
                        onClick={handleHomeReload}
                        disabled={isLoading}
                        title="Reload Data"
                        className="w-8 h-8 rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-white flex items-center justify-center border-0 cursor-pointer shadow-sm hover:scale-105 transition-all disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowHomeFilterDrawer(true)}
                        title="Filter Criteria"
                        className="w-8 h-8 rounded-full bg-[#0d9488] hover:bg-[#0f766e] text-white flex items-center justify-center border-0 cursor-pointer shadow-sm hover:scale-105 transition-all"
                      >
                        <Filter className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleHomeExportExcel}
                        disabled={exportStatus === 'STARTING'}
                        title="Download Complete Excel Report (All Records)"
                        className={`w-8 h-8 rounded-full ${exportStatus === 'PROCESSING' && activeExportFormat === 'Excel' ? 'bg-indigo-600 animate-pulse' : 'bg-[#1e3a8a] hover:bg-[#172554]'} text-white flex items-center justify-center border-0 cursor-pointer shadow-sm hover:scale-105 transition-all disabled:opacity-50`}
                      >
                        {exportStatus === 'PROCESSING' && activeExportFormat === 'Excel' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleHomeExportPDF}
                        disabled={exportStatus === 'STARTING'}
                        title="Download Complete PDF Report (All Records)"
                        className={`w-8 h-8 rounded-full ${exportStatus === 'PROCESSING' && activeExportFormat === 'PDF' ? 'bg-indigo-600 animate-pulse' : 'bg-[#0f172a] hover:bg-[#1e293b]'} text-white flex items-center justify-center border-0 cursor-pointer shadow-sm hover:scale-105 transition-all disabled:opacity-50`}
                      >
                        {exportStatus === 'PROCESSING' && activeExportFormat === 'PDF' ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-blue-600 dark:bg-blue-800 text-white border-b border-slate-200 dark:border-slate-800 text-[9px] font-extrabold select-none uppercase">
                        <th className="p-3 text-center">Action</th>
                        <th
                          onClick={() => handleSort('id')}
                          className="p-3 text-center cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors"
                        >
                          S. No. {sortColumn === 'id' ? (sortDirection === 'ASC' ? '▲' : '▼') : '↕'}
                        </th>
                        <th
                          onClick={() => handleSort('grievanceId')}
                          className="p-3 cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors"
                        >
                          Grievance ID {sortColumn === 'grievanceId' ? (sortDirection === 'ASC' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-3">Mode</th>
                        <th className="p-3">Privilege Assigned</th>
                        <th className="p-3">Mobile Number</th>
                        <th className="p-3">Date of Last Action</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Sub Category</th>
                        <th className="p-3">Sub Category Level 2</th>
                        <th className="p-3">Sub Category Level 3</th>
                        <th className="p-3">Sub Category Level 4</th>
                        <th className="p-3">Submitted By</th>
                        <th className="p-3">Received From</th>
                        <th
                          onClick={() => handleSort('createdAt')}
                          className="p-3 cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors"
                        >
                          Date {sortColumn === 'createdAt' ? (sortDirection === 'ASC' ? '▲' : '▼') : '↕'}
                        </th>
                        <th
                          onClick={() => handleSort('status')}
                          className="p-3 cursor-pointer hover:bg-blue-700 dark:hover:bg-blue-900 transition-colors"
                        >
                          Status {sortColumn === 'status' ? (sortDirection === 'ASC' ? '▲' : '▼') : '↕'}
                        </th>
                        <th className="p-3 text-center">AI Classification</th>
                        <th className="p-3 text-center">AI Tracking</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={19} className="text-center py-10 text-slate-400 font-bold">Loading redressal queue...</td>
                        </tr>
                      ) : filteredGrievances.length === 0 ? (
                        <tr>
                          <td colSpan={19} className="text-center py-10 text-slate-400">No grievances listed.</td>
                        </tr>
                      ) : (
                        grievances.map((g, idx) => (
                          <tr key={g.id || idx} className="border-b border-slate-150 dark:border-slate-855 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-slate-700 dark:text-slate-350">
                            {/* Action */}
                            <td className="p-3 text-center relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionDropdownId(openActionDropdownId === g.id ? null : g.id);
                                }}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded border-0 text-[10px] font-extrabold cursor-pointer transition-all uppercase tracking-wider"
                              >
                                Actions ▾
                              </button>
                              {openActionDropdownId === g.id && (
                                <div className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 text-left overflow-hidden animate-fadeIn">
                                  <Link
                                    to={`/superadmin/grievance-details/${g.id}`}
                                    onClick={() => setOpenActionDropdownId(null)}
                                    className="w-full block px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-250 font-bold border-0 bg-transparent cursor-pointer text-left no-underline transition-colors"
                                  >
                                    🔍 Grievance Details
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedGrievance(g);
                                      setActionStatus(g.status || 'Pending');
                                      setActionRemark('');
                                      setOpenActionDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-250 font-bold border-0 bg-transparent cursor-pointer text-left transition-colors"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      setOpenActionDropdownId(null);
                                      if (window.confirm("Are you sure you want to forward this grievance to CPGRAMS?")) {
                                        try {
                                          await grievanceService.processGrievance(g.id, 'Forwarded To CPGRAM', 'Forwarded to CPGRAMS by Super Admin');
                                          setGrievances(prev => prev.map(item => item.id === g.id ? { ...item, status: 'Forwarded To CPGRAM' } : item));
                                          alert("Grievance forwarded to CPGRAMS successfully!");
                                        } catch (err) {
                                          alert("Failed to forward grievance: " + err.message);
                                        }
                                      }
                                    }}
                                    className="w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] text-blue-600 dark:text-blue-400 font-extrabold border-0 bg-transparent cursor-pointer text-left transition-colors"
                                  >
                                    ✈ Forward to CPGRAMS
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* S. No. */}
                            <td className="p-3 text-center font-bold">{(currentPage - 1) * entriesPerPage + idx + 1}</td>

                            {/* Grievance ID */}
                            <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400 min-w-[180px]">
                              <Link to={`/superadmin/grievance-details/${g.id}`} className="hover:underline cursor-pointer block text-blue-600 dark:text-blue-400">
                                {g.grievanceId}
                              </Link>
                              <div className="text-[9px] text-slate-500 font-sans font-medium">Document Uploaded by Citizen : {g.docUploaded}</div>
                            </td>

                            {/* Mode */}
                            <td className="p-3 font-semibold">{g.mode}</td>

                            {/* Privilege Assigned */}
                            <td className="p-3">{g.privilege}</td>

                            {/* Mobile Number */}
                            <td className="p-3 font-mono">{g.mobile}</td>

                            {/* Date of Last Action */}
                            <td className="p-3 font-mono text-[10px] min-w-[120px]">{g.lastActionDate}</td>

                            {/* Department */}
                            <td className="p-3 font-bold min-w-[200px]">{g.department}</td>

                            {/* Category */}
                            <td className="p-3 font-semibold min-w-[200px]">{g.category}</td>

                            {/* Sub Category */}
                            <td className="p-3 min-w-[150px]">{g.subCategory}</td>

                            {/* Sub Category Level 2 */}
                            <td className="p-3">{g.subCategoryLevel2}</td>

                            {/* Sub Category Level 3 */}
                            <td className="p-3">{g.subCategoryLevel3}</td>

                            {/* Sub Category Level 4 */}
                            <td className="p-3">{g.subCategoryLevel4}</td>

                            {/* Submitted By */}
                            <td className="p-3 font-bold min-w-[120px]">{g.submittedBy}</td>

                            {/* Received From */}
                            <td className="p-3">{g.receivedFrom}</td>

                            {/* Date */}
                            <td className="p-3 font-mono text-[10px] min-w-[120px]">{g.date}</td>

                            {/* Status */}
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${g.status === 'Pending' || g.status === 'Registered'
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-250 animate-pulse'
                                  : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-250'
                                }`}>
                                {g.status}
                              </span>
                            </td>

                            {/* AI Classification */}
                            <td className="p-3 text-center">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-yellow-100 text-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300 border border-yellow-250">
                                {g.aiClassification}
                              </span>
                            </td>

                            {/* AI Tracking */}
                            <td className="p-3 text-center">
                              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-extrabold text-[10px] flex items-center justify-center mx-auto shadow-sm">
                                0/28
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {!isLoading && grievances.length > 0 && (
                  <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-bold text-slate-500">
                    <div>
                      Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, totalElements)} of {totalElements} entries
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-750 rounded text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Prev
                      </button>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded font-black">
                        {currentPage}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage >= totalPages}
                        className="px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-750 rounded text-slate-700 dark:text-slate-300 font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Slide-out Overlay Drawer for Super Admin Home Dashboard Filters */}
              {showHomeFilterDrawer && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
                  {/* Click outside to close */}
                  <div className="flex-1 cursor-pointer" onClick={() => setShowHomeFilterDrawer(false)}></div>

                  <div className="w-96 bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-slideIn">
                    {/* Header: Purple color bar (#6b38fb) */}
                    <div className="bg-[#6b38fb] px-6 py-4 flex justify-between items-center text-white">
                      <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                      </h3>
                      <button
                        onClick={() => setShowHomeFilterDrawer(false)}
                        className="text-white hover:text-slate-205 bg-transparent border-0 cursor-pointer font-bold text-base leading-none"
                      >
                        ✖
                      </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 p-6 space-y-6 text-left overflow-y-auto">
                      {/* Date Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">From / on</label>
                          <input
                            type="date"
                            value={homeDateFromFilter}
                            onChange={(e) => setHomeDateFromFilter(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">To</label>
                          <input
                            type="date"
                            value={homeDateToFilter}
                            onChange={(e) => setHomeDateToFilter(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                          />
                        </div>
                      </div>

                      <hr className="border-slate-100 dark:border-slate-800 my-4" />

                      {/* Radios Area */}
                      <div className="space-y-3">
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'web', label: 'Web' },
                          { id: 'mobile', label: 'Mobile' },
                          { id: 'normal', label: 'Normal' },
                          { id: 'priority', label: 'Priority' },
                          { id: 'beyond7', label: 'Beyond 7 days' },
                          { id: 'beyond28', label: 'Beyond 28 days' }
                        ].map((radio) => (
                          <label key={radio.id} className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                            <input
                              type="radio"
                              name="homeRadioFilter"
                              checked={homeRadioFilter === radio.id}
                              onChange={() => {
                                setHomeRadioFilter(radio.id);
                                if (radio.id === 'all') {
                                  setHomeModeFilter('');
                                  setHomeOriginFilter('');
                                  setHomeKeyFlagFilter('');
                                } else if (radio.id === 'web') {
                                  setHomeModeFilter('online');
                                  setHomeOriginFilter('web');
                                  setHomeKeyFlagFilter('');
                                } else if (radio.id === 'mobile') {
                                  setHomeModeFilter('offline');
                                  setHomeOriginFilter('mobile');
                                  setHomeKeyFlagFilter('');
                                } else if (radio.id === 'normal') {
                                  setHomeKeyFlagFilter('Normal');
                                  setHomeModeFilter('');
                                  setHomeOriginFilter('');
                                } else if (radio.id === 'priority') {
                                  setHomeKeyFlagFilter('Priority');
                                  setHomeModeFilter('');
                                  setHomeOriginFilter('');
                                } else if (radio.id === 'beyond7') {
                                  setHomeKeyFlagFilter('Beyond7');
                                  setHomeModeFilter('');
                                  setHomeOriginFilter('');
                                } else if (radio.id === 'beyond28') {
                                  setHomeKeyFlagFilter('Beyond28');
                                  setHomeModeFilter('');
                                  setHomeOriginFilter('');
                                }
                              }}
                              className="w-4 h-4 text-[#6b38fb] focus:ring-[#6b38fb] border-slate-300"
                            />
                            <span>{radio.label}</span>
                          </label>
                        ))}
                      </div>

                      <hr className="border-slate-100 dark:border-slate-800 my-4" />

                      {/* Select Fields */}
                      <div className="space-y-4">
                        {/* Status Select */}
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Status</label>
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                          >
                            <option value="">Select Status</option>
                            <option value="Registered">Registered</option>
                            <option value="Pending">Pending</option>
                            <option value="Open">Open</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Appealed">Appealed</option>
                            <option value="Forwarded">Forwarded</option>
                          </select>
                        </div>

                        {/* District Select */}
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">District</label>
                          <select
                            value={homeDistrictFilter}
                            onChange={(e) => setHomeDistrictFilter(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                          >
                            <option value="">Select District</option>
                            {analDistrictsList.map((dist) => (
                              <option key={dist.id} value={dist.name}>{dist.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Department Select */}
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Department</label>
                          <select
                            value={deptFilter}
                            onChange={(e) => handleHomeDeptChange(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium"
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Category Select */}
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">Category</label>
                          <select
                            value={homeCategoryFilter}
                            onChange={(e) => setHomeCategoryFilter(e.target.value)}
                            disabled={!deptFilter}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-300 outline-none font-medium disabled:opacity-55"
                          >
                            <option value="">Select Category</option>
                            {homeCategoriesList.map((cat) => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-850 flex gap-2">
                      <button
                        onClick={() => setShowHomeFilterDrawer(false)}
                        className="flex-1 py-2.5 bg-[#6b38fb] hover:bg-[#5b2be3] text-white text-xs font-bold rounded-lg cursor-pointer border-0 shadow-sm"
                      >
                        Apply Filters
                      </button>
                      <button
                        onClick={() => {
                          resetHomeFilters();
                        }}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 text-slate-650 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer border-0"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowHomeFilterDrawer(false)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer border-0"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* ── MODALS SECTION ── */}

      {/* 1. Review Grievance Modal */}
      {selectedGrievance && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-left flex flex-col">
            <div className="bg-[#1d72b8] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wide">Review Grievance #{selectedGrievance.grievanceId}</h3>
              <button onClick={() => setSelectedGrievance(null)} className="text-white hover:text-slate-200 bg-transparent border-0 cursor-pointer text-sm">✖</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Department</span>
                  <span className="font-bold text-slate-800">{selectedGrievance.department}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Category</span>
                  <span className="font-bold text-slate-800">{selectedGrievance.category}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Submitted By</span>
                  <span className="font-bold text-slate-800">{selectedGrievance.submittedBy} ({selectedGrievance.mobile})</span>
                </div>
                <div>
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">AI Classification</span>
                  <span className="font-bold text-amber-700">{selectedGrievance.aiClassification}</span>
                </div>
              </div>

              <hr className="border-slate-200" />

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Update Resolution Status</label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Does Not Pertain">Does Not Pertain</option>
                </select>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Action Remarks</label>
                <textarea
                  value={actionRemark}
                  onChange={(e) => setActionRemark(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 h-20 outline-none focus:border-blue-600 resize-none"
                  placeholder="Enter official action notes..."
                />
                <button
                  onClick={async () => {
                    try {
                      await grievanceService.processGrievance(selectedGrievance.id, actionStatus, actionRemark);
                      setGrievances(prev => prev.map(item => item.id === selectedGrievance.id ? { ...item, status: actionStatus } : item));
                      alert(`Updated ${selectedGrievance.grievanceId} status to ${actionStatus}`);
                    } catch (err) {
                      alert("Failed to update status: " + err.message);
                    }
                    setSelectedGrievance(null);
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm cursor-pointer border-0"
                >
                  Submit Official Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1b. Grievance Details Modal */}
      {viewingGrievance && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-left flex flex-col">
            <div className="bg-[#1d72b8] text-white px-6 py-4 flex justify-between items-center shadow-md">
              <h3 className="font-bold text-sm uppercase tracking-wide">Grievance Details #{viewingGrievance.grievanceId}</h3>
              <button onClick={() => setViewingGrievance(null)} className="text-white hover:text-slate-200 bg-transparent border-0 cursor-pointer text-sm font-bold">✖</button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Grievance ID</span>
                  <span className="font-bold text-slate-800">{viewingGrievance.grievanceId}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Status</span>
                  <span className="font-bold text-slate-800">{viewingGrievance.status}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Department</span>
                  <span className="font-bold text-slate-800">{viewingGrievance.department}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Category</span>
                  <span className="font-bold text-slate-800">{viewingGrievance.category}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Sub Category</span>
                  <span className="font-bold text-slate-800">{viewingGrievance.subCategory}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Submitted By</span>
                  <span className="font-bold text-slate-800">{viewingGrievance.submittedBy}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Mobile Number</span>
                  <span className="font-bold text-slate-800">{viewingGrievance.mobile}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Date of last action</span>
                  <span className="font-bold text-slate-800">{viewingGrievance.lastActionDate}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">Mode</span>
                  <span className="font-bold text-slate-800">{viewingGrievance.mode}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] font-extrabold text-slate-400 uppercase">AI Classification</span>
                  <span className="font-bold text-amber-700">{viewingGrievance.aiClassification}</span>
                </div>
              </div>
              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setViewingGrievance(null)}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg border-0 cursor-pointer text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-left flex flex-col">
            <div className="bg-[#8b5cf6] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase">Create Portal Announcement</h3>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-white bg-transparent border-0 cursor-pointer text-sm">✖</button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Announcement Type</label>
                <select
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 outline-none"
                >
                  <option value="General">General Broadcast</option>
                  <option value="Urgent Alert">Urgent Alert</option>
                  <option value="System Maintenance">System Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Message Content</label>
                <textarea
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 h-24 outline-none resize-none"
                  placeholder="Enter announcement text to broadcast to all departments & citizens..."
                />
              </div>
              <button
                onClick={() => {
                  alert(`Announcement published!`);
                  setShowAnnouncementModal(false);
                  setAnnouncementMsg('');
                }}
                className="w-full py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-lg border-0 cursor-pointer"
              >
                Broadcast Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Department Mapping Modal */}
      {showDeptMappingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden text-left flex flex-col max-h-[90vh]">
            <div className="bg-[#3b82f6] text-white px-6 py-4 flex justify-between items-center shadow-md shrink-0">
              <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-100" />
                <span>Create Department Category Mapping</span>
              </h3>
              <button onClick={() => setShowDeptMappingModal(false)} className="text-white hover:text-blue-100 bg-transparent border-0 cursor-pointer text-sm font-bold">✖</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">

              {/* Question card */}
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                <h4 className="font-bold text-rose-800 text-sm mb-2">Question: Why categorization is important?</h4>
                <ul className="list-disc pl-4 space-y-1 text-emerald-800 font-mono">
                  <li>Categorization defines the grievances to streamline the operational response workflow.</li>
                  <li>Categorizing grievances helps in prioritizing urgent cases requiring immediate attention.</li>
                  <li>Certain types of grievances require specific expertise; category matching routes the complaints to the correct nodal officer.</li>
                </ul>
              </div>

              {/* Form mappings */}
              <form onSubmit={handleAddDeptCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">Department Name</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-350 rounded-lg p-2.5 outline-none font-bold text-slate-800"
                  >
                    <option value="">Select Department</option>
                    {mappingData.depts && mappingData.depts.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">Category of Grievance <span className="text-rose-500">*</span></label>
                  <select
                    value={selectedCat}
                    onChange={(e) => setSelectedCat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-350 rounded-lg p-2.5 outline-none text-slate-800 font-bold"
                  >
                    <option value="0">Select Category</option>
                    <option value="add">Add new category</option>
                    {mappingData.cat && mappingData.cat.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                  {selectedCat === 'add' && (
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Enter new category name"
                      className="w-full mt-2 bg-white border border-slate-350 rounded-lg p-2.5 outline-none text-slate-800"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">Reminder (in days)</label>
                  <input
                    type="number"
                    value={reminderDays}
                    onChange={(e) => setReminderDays(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-350 rounded-lg p-2.5 outline-none text-slate-850 font-bold font-mono"
                    min="1"
                    max="99"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">Sub Category of Grievance</label>
                  <select
                    value={subCat}
                    onChange={(e) => setSubCat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-350 rounded-lg p-2.5 outline-none text-slate-800"
                  >
                    <option value="0">Select Subcategory</option>
                    <option value="add">Add new sub-category</option>
                    {mappingData.allData && Array.from(new Set(mappingData.allData.map(d => d.subCategoryName))).filter(Boolean).map((sc, i) => (
                      <option key={i} value={sc}>{sc}</option>
                    ))}
                  </select>
                  {subCat === 'add' && (
                    <input
                      type="text"
                      value={newSubCatName}
                      onChange={(e) => setNewSubCatName(e.target.value)}
                      placeholder="Enter sub-category"
                      className="w-full mt-2 bg-white border border-slate-350 rounded-lg p-2.5 outline-none text-slate-800"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">Next Level 2 Category</label>
                  <select
                    value={subCatL2}
                    onChange={(e) => setSubCatL2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-350 rounded-lg p-2.5 outline-none text-slate-800"
                  >
                    <option value="0">Select Level 2</option>
                    <option value="add">Add level 2 category</option>
                    {mappingData.allData && Array.from(new Set(mappingData.allData.map(d => d.subCategoryLevel2Name))).filter(Boolean).map((sc, i) => (
                      <option key={i} value={sc}>{sc}</option>
                    ))}
                  </select>
                  {subCatL2 === 'add' && (
                    <input
                      type="text"
                      value={newSubCatL2Name}
                      onChange={(e) => setNewSubCatL2Name(e.target.value)}
                      placeholder="Enter level 2 sub-category"
                      className="w-full mt-2 bg-white border border-slate-350 rounded-lg p-2.5 outline-none text-slate-800"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">Next Level 3 Category</label>
                  <select
                    value={subCatL3}
                    onChange={(e) => setSubCatL3(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-350 rounded-lg p-2.5 outline-none text-slate-800"
                  >
                    <option value="0">Select Level 3</option>
                    <option value="add">Add level 3 category</option>
                    {mappingData.allData && Array.from(new Set(mappingData.allData.map(d => d.subCategoryLevel3Name))).filter(Boolean).map((sc, i) => (
                      <option key={i} value={sc}>{sc}</option>
                    ))}
                  </select>
                  {subCatL3 === 'add' && (
                    <input
                      type="text"
                      value={newSubCatL3Name}
                      onChange={(e) => setNewSubCatL3Name(e.target.value)}
                      placeholder="Enter level 3 sub-category"
                      className="w-full mt-2 bg-white border border-slate-350 rounded-lg p-2.5 outline-none text-slate-800"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1.5">Next Level 4 Category</label>
                  <select
                    value={subCatL4}
                    onChange={(e) => setSubCatL4(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-350 rounded-lg p-2.5 outline-none text-slate-800"
                  >
                    <option value="0">Select Level 4</option>
                    <option value="add">Add level 4 category</option>
                    {mappingData.allData && Array.from(new Set(mappingData.allData.map(d => d.subCategoryLevel4Name))).filter(Boolean).map((sc, i) => (
                      <option key={i} value={sc}>{sc}</option>
                    ))}
                  </select>
                  {subCatL4 === 'add' && (
                    <input
                      type="text"
                      value={newSubCatL4Name}
                      onChange={(e) => setNewSubCatL4Name(e.target.value)}
                      placeholder="Enter level 4 sub-category"
                      className="w-full mt-2 bg-white border border-slate-350 rounded-lg p-2.5 outline-none text-slate-800"
                    />
                  )}
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowDeptMappingModal(false)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg border-0 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#3b82f6] hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-sm border-0 cursor-pointer"
                  >
                    Save Configuration
                  </button>
                </div>

              </form>

              {/* Table displaying mapping values */}
              <div className="border border-slate-250 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-100 p-3.5 border-b border-slate-250">
                  <h4 className="font-extrabold text-slate-800 uppercase tracking-wider">Active Category-Department Configurations</h4>
                </div>
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full border-collapse text-[11px] text-left">
                    <thead>
                      <tr className="bg-slate-800 text-white select-none">
                        <th className="p-2.5 border-r border-slate-700 text-center">S.No.</th>
                        <th className="p-2.5 border-r border-slate-700">Department Name</th>
                        <th className="p-2.5 border-r border-slate-700">Category Name</th>
                        <th className="p-2.5 border-r border-slate-700">Sub Category Name</th>
                        <th className="p-2.5 border-r border-slate-700">Level 2</th>
                        <th className="p-2.5 border-r border-slate-700">Level 3</th>
                        <th className="p-2.5 border-r border-slate-700">Level 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappingData.allData && mappingData.allData.length > 0 ? (
                        mappingData.allData.map((d, index) => (
                          <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 text-slate-700">
                            <td className="p-2 border-r border-slate-200 text-center font-bold">{index + 1}</td>
                            <td className="p-2 border-r border-slate-200 font-bold">{d.departmentName}</td>
                            <td className="p-2 border-r border-slate-200 font-semibold">{d.categoryName}</td>
                            <td className="p-2 border-r border-slate-200">{d.subCategoryName || '-'}</td>
                            <td className="p-2 border-r border-slate-200">{d.subCategoryLevel2Name || '-'}</td>
                            <td className="p-2 border-r border-slate-200">{d.subCategoryLevel3Name || '-'}</td>
                            <td className="p-2 border-r border-slate-200">{d.subCategoryLevel4Name || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center p-4 text-slate-400">No active category mappings registered yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}



      {/* 4. Edit Department Modal */}
      {editDeptModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-left flex flex-col">
            <div className="bg-[#1d72b8] text-white px-6 py-4 flex justify-between items-center shadow-md shrink-0">
              <h3 className="font-extrabold text-sm uppercase tracking-wider">
                Edit Department Name
              </h3>
              <button
                onClick={() => setEditDeptModal({ isOpen: false, id: null, name: '', type: '' })}
                className="text-white hover:text-blue-100 bg-transparent border-0 cursor-pointer text-sm font-bold"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleUpdateDept} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-slate-600 mb-1.5 uppercase text-[10px] tracking-wide">
                  New Department Name
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={editDeptModal.name}
                  onChange={(e) => setEditDeptModal({ ...editDeptModal, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 outline-none font-bold text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditDeptModal({ isOpen: false, id: null, name: '', type: '' })}
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg border-0 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg shadow-sm border-0 cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Asynchronous Excel Export Progress Card */}
      {showExportBanner && (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
          {isExportMinimized ? (
            <div
              onClick={() => setIsExportMinimized(false)}
              className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-full shadow-2xl border border-slate-700 cursor-pointer hover:bg-slate-800 transition"
              title="Click to expand export progress"
            >
              {exportStatus === 'PROCESSING' || exportStatus === 'STARTING' ? (
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              ) : exportStatus === 'COMPLETED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : exportStatus === 'CANCELLED' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span className="text-xs font-bold">
                {exportStatus === 'COMPLETED'
                  ? `${activeExportFormat} Ready`
                  : exportStatus === 'CANCELLED'
                  ? 'Export Cancelled'
                  : exportStatus === 'FAILED'
                  ? 'Export Failed'
                  : `Exporting ${activeExportFormat}... ${exportProgress}%`}
              </span>
              <Maximize2 className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
            </div>
          ) : (
            <div className="w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-200">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    exportStatus === 'COMPLETED'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'
                      : exportStatus === 'CANCELLED'
                      ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600'
                      : exportStatus === 'FAILED'
                      ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600'
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                  }`}>
                    {exportStatus === 'PROCESSING' || exportStatus === 'STARTING' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : exportStatus === 'COMPLETED' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : exportStatus === 'CANCELLED' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : activeExportFormat === 'PDF' ? (
                      <FileText className="w-5 h-5" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white m-0">
                      Complete {activeExportFormat} Export
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                      Super Admin Full Dataset
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsExportMinimized(true)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-0 cursor-pointer transition"
                    title="Minimize"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (exportStatus === 'PROCESSING' || exportStatus === 'STARTING') {
                        handleCancelExport();
                      } else {
                        setShowExportBanner(false);
                        setExportStatus('IDLE');
                        setExportJobId(null);
                      }
                    }}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-0 cursor-pointer transition"
                    title={exportStatus === 'PROCESSING' || exportStatus === 'STARTING' ? 'Cancel Export' : 'Close'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="py-3 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {exportStatus === 'STARTING' && 'Preparing export job...'}
                    {exportStatus === 'PROCESSING' && 'Streaming database records...'}
                    {exportStatus === 'COMPLETED' && 'Excel report is ready!'}
                    {exportStatus === 'CANCELLED' && 'Export was cancelled'}
                    {exportStatus === 'FAILED' && 'Export encountered an issue'}
                  </span>
                  <span className="font-black text-blue-600 dark:text-blue-400">
                    {exportProgress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      exportStatus === 'COMPLETED'
                        ? 'bg-emerald-500'
                        : exportStatus === 'CANCELLED'
                        ? 'bg-amber-500'
                        : exportStatus === 'FAILED'
                        ? 'bg-rose-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>

                {/* Progress & Cancel Actions for PROCESSING / STARTING */}
                {(exportStatus === 'PROCESSING' || exportStatus === 'STARTING') && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                      {exportTotalRecords > 0
                        ? `Processed ${exportProcessedRecords.toLocaleString()} of ${exportTotalRecords.toLocaleString()} records`
                        : 'Calculating total records...'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelExport}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition border border-rose-200 dark:border-rose-800 cursor-pointer flex items-center gap-1"
                      title="Cancel ongoing export"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                )}

                {exportStatus === 'COMPLETED' && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      Download initiated automatically
                    </span>
                    <button
                      type="button"
                      onClick={() => grievanceService.downloadSuperAdminExcelFile(exportJobId)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 border-0 cursor-pointer shadow-xs transition"
                    >
                      <Download className="w-3 h-3" /> Download Again
                    </button>
                  </div>
                )}

                {exportStatus === 'CANCELLED' && (
                  <div className="pt-1 space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 m-0">
                      The export job has been cancelled. No file was downloaded.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleHomeExportExcel}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border-0 cursor-pointer transition shadow-xs"
                      >
                        <RefreshCw className="w-3 h-3" /> Start New Export
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowExportBanner(false);
                          setExportStatus('IDLE');
                          setExportJobId(null);
                        }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border-0 cursor-pointer transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {exportStatus === 'FAILED' && (
                  <div className="pt-1">
                    <p className="text-[11px] text-rose-500 font-medium m-0 mb-2">
                      {exportErrorMessage}
                    </p>
                    <button
                      type="button"
                      onClick={handleHomeExportExcel}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 border-0 cursor-pointer transition"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry Export
                    </button>
                  </div>
                )}
              </div>

              {/* Card Footer Info */}
              {/* <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
                <span>* Dashboard filters and pagination remain unaffected.</span>
              </div> */}
            </div>
          )}
        </div>
      )}

      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateAnnouncementOpen}
        onClose={() => setIsCreateAnnouncementOpen(false)}
        onSuccess={() => {
          // optional refresh
        }}
      />

    </div>
  );
}
