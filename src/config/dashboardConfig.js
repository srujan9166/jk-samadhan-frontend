import {
  LayoutDashboard,
  BarChart3,
  CheckSquare,
  Building2,
  Users,
  Shield,
  FileText,
  HelpCircle,
  FolderOpen,
  UserCheck,
  ClipboardList,
  Clock,
  AlertTriangle,
  Map,
  ShieldCheck,
  Bell,
  Network,
  Database,
  MessageSquare,
  Flame,
  PlusCircle,
  Flag,
  FilePlus,
  Scale
} from 'lucide-react';

/**
 * Normalizes user role string into a canonical role identifier
 */
export const normalizeRole = (user) => {
  if (!user) return 'CITIZEN';
  
  const role = (user.role || '').toUpperCase();
  const email = (user.email || '').toLowerCase();
  const username = (user.username || '').toLowerCase();

  // Super Admin / Secretary
  if (
    role === 'ROLE_SUPERADMIN' ||
    role === 'SUPERADMIN' ||
    role === 'ROLE_SECRETARY' ||
    role === 'SECRETARY' ||
    email.includes('superadmin') ||
    username.includes('superadmin')
  ) {
    return 'SUPERADMIN';
  }

  // Monitoring Cell
  if (
    role === 'ROLE_MONITORING_CELL' ||
    role === 'MONITORING_CELL' ||
    email.includes('monitor') ||
    username.includes('monitor')
  ) {
    return 'MONITORING_CELL';
  }

  // Raabita / RMC Head & Users
  if (
    role === 'ROLE_RAABITA_HEAD' ||
    role === 'RAABITA_HEAD' ||
    role === 'ROLE_RMC_HEAD' ||
    role === 'RMC_HEAD' ||
    role === 'ROLE_RMC' ||
    role === 'RMC' ||
    role === 'RAABITA' ||
    role.includes('RAABITA') ||
    role.includes('RMC') ||
    email.includes('raabita') ||
    username.includes('raabita') ||
    username.includes('rmc')
  ) {
    return 'RMC';
  }

  // District Magistrate (DM)
  if (
    role === 'DM' ||
    role === 'ROLE_DM' ||
    role === 'ROLE_DISTRICT_MAGISTRATE' ||
    role === 'DISTRICT_MAGISTRATE'
  ) {
    return 'DM';
  }

  // Dealing Hand / Dealing Hand Head
  if (
    role === 'DEALINGHAND' ||
    role === 'ROLE_DEALINGHAND' ||
    role === 'DEALING_HAND' ||
    role === 'ROLE_DEALING_HAND' ||
    role === 'DEALINGHANDHEAD' ||
    role === 'DEALING_HAND_HEAD' ||
    role === 'ROLE_DEALINGHAND_HEAD' ||
    role.includes('DEALING') ||
    email.includes('dealing') ||
    username.includes('dealing')
  ) {
    return 'DEALING_HAND';
  }

  // Appellate Authority
  if (
    role === 'APPELLATE' ||
    role === 'ROLE_APPELLATE' ||
    role === 'ROLE_APPELLATE_AUTHORITY'
  ) {
    return 'APPELLATE';
  }

  // Department Nodal / Officer
  if (
    role === 'ROLE_DEPT_ADMIN' ||
    role === 'DEPT_ADMIN' ||
    role === 'ROLE_DEPARTMENT' ||
    role === 'DEPARTMENT' ||
    role === 'OFFICER' ||
    role === 'ROLE_DEPARTMENT_NODAL' ||
    role.includes('ADMIN') ||
    email.includes('admin') ||
    username.includes('admin')
  ) {
    return 'DEPARTMENT';
  }

  // Fallback to Citizen
  return 'CITIZEN';
};

/**
 * Role-Prefixed Dashboard Base URLs (like JK Revenue)
 */
export const ROLE_DASHBOARDS = {
  SUPERADMIN: '/superAdmin',
  MONITORING_CELL: '/monitoringCell',
  RMC: '/rmc',
  DM: '/dm',
  DEPARTMENT: '/dept',
  DEALING_HAND: '/dealingHand',
  APPELLATE: '/appellate',
  CITIZEN: '/citizen'
};

/**
 * Returns the base route URL for a normalized role
 */
export const getRoleBaseUrl = (userOrRole) => {
  const roleKey = typeof userOrRole === 'string' ? userOrRole : normalizeRole(userOrRole);
  return ROLE_DASHBOARDS[roleKey] || '/citizen';
};

/**
 * Centralized Role-Based Dashboard Configuration
 * Dictates sidebar navigation items, default view, and permitted components for each role.
 */
export const DASHBOARD_ROLE_CONFIG = {
  SUPERADMIN: {
    roleTitle: 'Super Admin Dashboard',
    basePath: '/superAdmin',
    defaultView: 'Super Admin Dashboard',
    sidebar: [
      {
        type: 'item',
        id: 'Super Admin Dashboard',
        label: 'Dashboard Overview',
        icon: LayoutDashboard,
      },
      {
        type: 'item',
        id: 'Analytical Dashboard',
        label: 'Analytical Dashboard',
        icon: BarChart3,
      },
      {
        type: 'group',
        id: 'Mapping & User Creation',
        label: 'Mapping & User Creation',
        icon: Building2,
        children: [
          { id: 'Department Mapping', label: 'Department Mapping', icon: Building2 },
          { id: 'Create Department Nodal', label: 'Create Department Nodal', icon: Shield },
          { id: 'Create users', label: 'Create Users', icon: Users },
          { id: 'Create Offices & Designation', label: 'Create Offices & Designation', icon: Building2 },
        ],
      },
      {
        type: 'group',
        id: 'MIS Reports',
        label: 'MIS Reports',
        icon: FolderOpen,
        children: [
          { id: 'Citizen Registration List', label: 'Citizen Registration List', icon: Users },
          { id: 'Department User List', label: 'Department User List', icon: UserCheck },
          { id: 'Dealing Hand Grievances', label: 'Dealing Hand Grievances', icon: ClipboardList },
          { id: 'Status Wise Report', label: 'Status Wise Report', icon: BarChart3 },
          { id: 'Pendency Report', label: 'Pendency Report', icon: AlertTriangle },
          { id: 'District Wise Report', label: 'District Wise Report', icon: Map },
          { id: 'Average Time Taken Report', label: 'Average Time Taken Report', icon: Clock },
          { id: 'Appellate Report', label: 'Appellate Report', icon: ShieldCheck },
          { id: 'Announcement / Notification List', label: 'Announcement / Notification List', icon: Bell },
          { id: 'Appeal MIS Report', label: 'Appeal Report', icon: FileText },
        ],
      },
      {
        type: 'item',
        id: 'Tree Dashboard',
        label: 'Tree Dashboard',
        icon: Network,
      },
      {
        type: 'item',
        id: 'Advance Query Builder',
        label: 'Advance Query Builder',
        icon: Database,
      },
      {
        type: 'item',
        id: 'Feedback Analysis',
        label: 'Feedback Analysis',
        icon: MessageSquare,
      },
      {
        type: 'item',
        id: 'New Feedback Analysis',
        label: 'New Feedback Analysis',
        icon: MessageSquare,
      },
      {
        type: 'item',
        id: 'Heatmap',
        label: 'Heatmap',
        icon: Flame,
      },
      {
        type: 'item',
        id: 'Appeal Dashboard',
        label: 'Appeal Dashboard',
        icon: ShieldCheck,
      }
    ],
  },

  MONITORING_CELL: {
    roleTitle: 'Monitoring Cell Dashboard',
    defaultView: 'Analytical Dashboard',
    sidebar: [
      {
        type: 'item',
        id: 'Analytical Dashboard',
        label: 'Monitoring Desk',
        icon: LayoutDashboard,
      },
      {
        type: 'group',
        id: 'MIS Reports',
        label: 'MIS Reports',
        icon: FolderOpen,
        children: [
          { id: 'Citizen Registration List', label: 'Citizen Registration List', icon: Users },
          { id: 'Department User List', label: 'Department User List', icon: UserCheck },
          { id: 'Status Wise Report', label: 'Status Wise Report', icon: BarChart3 },
          { id: 'Pendency Report', label: 'Pendency Report', icon: AlertTriangle },
          { id: 'District Wise Report', label: 'District Wise Report', icon: Map },
          { id: 'Average Time Taken Report', label: 'Average Time Taken Report', icon: Clock },
          { id: 'Appellate Report', label: 'Appellate Report', icon: ShieldCheck },
          { id: 'Announcement / Notification List', label: 'Announcement / Notification List', icon: Bell },
        ],
      },
      {
        type: 'item',
        id: 'Tree Dashboard',
        label: 'Tree Dashboard',
        icon: Network,
      },
      {
        type: 'item',
        id: 'Advance Query Builder',
        label: 'Advance Query Builder',
        icon: Database,
      },
      {
        type: 'item',
        id: 'Feedback Analysis',
        label: 'Feedback Analysis',
        icon: MessageSquare,
      },
      {
        type: 'item',
        id: 'New Feedback Analysis',
        label: 'New Feedback Analysis',
        icon: MessageSquare,
      },
      {
        type: 'item',
        id: 'Heatmap',
        label: 'Heatmap',
        icon: Flame,
      }
    ],
  },

  RMC: {
    roleTitle: 'RMC Head Dashboard',
    defaultView: 'RMC Head Dashboard',
    sidebar: [
      {
        type: 'item',
        id: 'RMC Head Dashboard',
        label: 'RMC Dashboard',
        icon: LayoutDashboard,
      },
      {
        type: 'item',
        id: 'Create RMC Users',
        label: 'Create RMC Users',
        icon: Users,
      },
      {
        type: 'item',
        id: 'Department User List',
        label: 'User List',
        icon: UserCheck,
      },
      {
        type: 'item',
        id: 'Status Wise Report',
        label: 'Grievance Status',
        icon: Flag,
      },
      {
        type: 'item',
        id: 'District Wise Report',
        label: 'District Wise Report',
        icon: Map,
      },
      {
        type: 'item',
        id: 'Announcement / Notification List',
        label: 'Announcements',
        icon: Bell,
      }
    ],
  },

  DM: {
    roleTitle: 'DM Dashboard',
    defaultView: 'DM Dashboard',
    sidebar: [
      {
        type: 'item',
        id: 'DM Dashboard',
        label: 'DM Dashboard',
        icon: LayoutDashboard,
      },
      {
        type: 'item',
        id: 'Analytical Dashboard',
        label: 'Analytical Dashboard',
        icon: BarChart3,
      },
      {
        type: 'item',
        id: 'District Wise Report',
        label: 'District Wise Report',
        icon: Map,
      },
      {
        type: 'item',
        id: 'Status Wise Report',
        label: 'Status Wise Report',
        icon: BarChart3,
      },
      {
        type: 'item',
        id: 'Feedback Analysis',
        label: 'Feedback Analysis',
        icon: MessageSquare,
      },
      {
        type: 'item',
        id: 'New Feedback Analysis',
        label: 'New Feedback Analysis',
        icon: MessageSquare,
      },
      {
        type: 'item',
        id: 'Heatmap',
        label: 'District Heatmap',
        icon: Flame,
      }
    ],
  },

  DEALING_HAND: {
    roleTitle: 'Dealing Hand Dashboard',
    defaultView: 'DealingHand Dashboard',
    sidebar: [
      {
        type: 'item',
        id: 'DealingHand Dashboard',
        label: 'DealingHand Dashboard',
        icon: LayoutDashboard,
      },
      {
        type: 'item',
        id: 'Lodge Grievance Form',
        label: 'Lodge Grievance',
        icon: FilePlus,
      },
      {
        type: 'item',
        id: 'Create users',
        label: 'Create DealingHand Users',
        icon: Users,
      },
      {
        type: 'item',
        id: 'Department User List',
        label: 'User List',
        icon: UserCheck,
      },
      {
        type: 'item',
        id: 'Status Wise Report',
        label: 'Grievance Status',
        icon: Flag,
      },
      {
        type: 'item',
        id: 'Dealing Hand Grievances',
        label: 'Dealing Hand Grievances',
        icon: ClipboardList,
      }
    ],
  },

  DEPARTMENT: {
    roleTitle: 'Department Nodal Dashboard',
    defaultView: 'Department Dashboard',
    sidebar: [
      {
        type: 'item',
        id: 'Department Dashboard',
        label: 'Grievance Overview',
        icon: LayoutDashboard,
      },
      {
        type: 'item',
        id: 'Status Wise Report',
        label: 'Department Status Report',
        icon: BarChart3,
      },
      {
        type: 'item',
        id: 'Pendency Report',
        label: 'Department Pendency',
        icon: AlertTriangle,
      },
      {
        type: 'item',
        id: 'Announcement / Notification List',
        label: 'Announcements',
        icon: Bell,
      }
    ],
  },

  APPELLATE: {
    roleTitle: 'Appellate Authority Dashboard',
    defaultView: 'Appellate Dashboard',
    sidebar: [
      {
        type: 'item',
        id: 'Appellate Dashboard',
        label: 'Appeals Overview',
        icon: Scale,
      },
      {
        type: 'item',
        id: 'Appellate Report',
        label: 'Appellate MIS Report',
        icon: ShieldCheck,
      }
    ],
  },

  CITIZEN: {
    roleTitle: 'Citizen Portal',
    defaultView: 'Citizen Dashboard',
    sidebar: [
      {
        type: 'item',
        id: 'Citizen Dashboard',
        label: 'My Grievances',
        icon: LayoutDashboard,
      },
      {
        type: 'item',
        id: 'Citizen Lodge Grievance',
        label: 'Lodge Grievance',
        icon: FilePlus,
      },
      {
        type: 'item',
        id: 'Citizen Lodge Appeal',
        label: 'Lodge Appeal',
        icon: Scale,
      }
    ],
  }
};
