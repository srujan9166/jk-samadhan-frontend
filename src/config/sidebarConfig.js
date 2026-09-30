/**
 * Dynamic Sidebar Configuration for J&K Samadhan
 * Inspired by JKRevenue sidebar-data.ts architecture
 */

import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Building2,
  GitPullRequest,
  CheckSquare,
  Shield,
  Settings,
  HelpCircle
} from 'lucide-react';

export const getSidebarConfig = (user) => {
  if (!user) return { groups: [] };

  const role = (user.role || '').toUpperCase();
  const email = (user.email || '').toLowerCase();
  const username = (user.username || '').toLowerCase();

  const isSuperAdmin = role === 'ROLE_SUPERADMIN' || role === 'SUPERADMIN' || email.includes('superadmin') || username.includes('superadmin') || role === 'SECRETARY';
  const isMonitoringCell = role === 'ROLE_MONITORING_CELL' || role === 'MONITORING_CELL' || email.includes('monitor') || username.includes('monitor');
  const isDeptAdmin = role.includes('ADMIN') || role === 'DEPT_ADMIN' || role === 'ROLE_DEPT_ADMIN';
  const isDM = role === 'DM' || role === 'ROLE_DM' || role === 'ROLE_DISTRICT_MAGISTRATE';
  const isAppellate = role === 'APPELLATE' || role === 'ROLE_APPELLATE';
  const isDealingHand = role === 'DEALINGHAND' || role === 'ROLE_DEALINGHAND' || role === 'DEALING_HAND';
  const isCitizen = !isSuperAdmin && !isMonitoringCell && !isDeptAdmin && !isDM && !isAppellate && !isDealingHand;

  // Base Dashboard URL by Role
  const dashboardPath = isSuperAdmin ? '/super-admin'
    : isMonitoringCell ? '/monitoring-cell'
    : isDeptAdmin ? '/department'
    : isDM ? '/dm'
    : isAppellate ? '/appellate'
    : isDealingHand ? '/dealing-hand'
    : '/citizen';

  const navGroups = [];

  // Main Group
  const mainItems = [
    {
      title: 'Dashboard Overview',
      url: dashboardPath,
      icon: LayoutDashboard,
      active: true,
    }
  ];

  if (isSuperAdmin || isMonitoringCell) {
    mainItems.push(
      { title: 'Analytical Dashboard', url: `${dashboardPath}?tab=analytical`, icon: BarChart3 },
      { title: 'Monitoring Cell Desk', url: `${dashboardPath}?tab=monitoring`, icon: CheckSquare }
    );
  }

  navGroups.push({
    title: 'General',
    items: mainItems,
  });

  // Management & User Creation Group
  if (isSuperAdmin) {
    navGroups.push({
      title: 'Administration',
      items: [
        { title: 'Department Mapping', url: `${dashboardPath}?tab=mapping`, icon: Building2 },
        { title: 'Create Users', url: `${dashboardPath}?tab=create-users`, icon: Users },
        { title: 'Create Nodal Officers', url: `${dashboardPath}?tab=create-nodal`, icon: Shield },
      ],
    });
  }

  // Action / Process Group
  if (isDealingHand) {
    navGroups.push({
      title: 'Grievance Operations',
      items: [
        { title: 'Lodge Grievance Form', url: '/dh-lodge', icon: FileText },
      ],
    });
  }

  // DM Specific Navigation Structure
  if (isDM) {
    return {
      dashboardPath: '/dm',
      navItems: [
        { title: 'DM Dashboard', name: 'DM Dashboard', icon: LayoutDashboard },
        { title: 'Analytical Dashboard', name: 'Analytical Dashboard', icon: BarChart3 },
        { title: 'Feedback Analysis', name: 'Feedback Analysis', icon: HelpCircle },
        { title: 'New Feedback Analysis', name: 'New Feedback Analysis', icon: HelpCircle },
      ],
      navGroups: [
        {
          title: 'General',
          items: [
            { title: 'DM Dashboard', url: '/dm', icon: LayoutDashboard },
            { title: 'Analytical Dashboard', url: '/dm?tab=analytical', icon: BarChart3 },
            { title: 'Feedback Analysis', url: '/dm?tab=feedback', icon: HelpCircle },
            { title: 'New Feedback Analysis', url: '/dm?tab=new-feedback', icon: HelpCircle }
          ]
        }
      ]
    };
  }

  // Reports Group (Exclude DM from general appeal reports)
  if (isSuperAdmin || isMonitoringCell || isDeptAdmin) {
    navGroups.push({
      title: 'Analytics & Reports',
      items: [
        { title: 'District-wise MIS', url: `${dashboardPath}?tab=district-mis`, icon: BarChart3 },
        { title: 'Department-wise MIS', url: `${dashboardPath}?tab=dept-mis`, icon: BarChart3 },
        { title: 'Appeal MIS Report', url: `${dashboardPath}?tab=appeal-mis`, icon: BarChart3 },
      ],
    });
  }

  return {
    dashboardPath,
    navGroups,
  };
};
