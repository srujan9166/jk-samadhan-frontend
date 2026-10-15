import React, { useState } from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';

/**
 * Common Reusable DashboardLayout Component
 * 
 * Provides the unified layout shell for all authenticated roles.
 * Integrates DashboardHeader, DashboardSidebar, and flexible content area.
 */
export default function DashboardLayout({
  user,
  role,
  roleTitle,
  sidebarItems = [],
  activeSidebarItem,
  onSelectSidebarItem,
  onLogout,
  onOpenChangePassword,
  onLmsClick,
  children
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Unified Common Header */}
      <DashboardHeader
        user={user}
        role={role}
        roleTitle={roleTitle}
        onLogout={onLogout}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
        onOpenChangePassword={onOpenChangePassword}
        onLmsClick={onLmsClick}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Unified Configuration-Driven Sidebar */}
        <DashboardSidebar
          items={sidebarItems}
          activeItem={activeSidebarItem}
          onSelectItem={onSelectSidebarItem}
          isCollapsed={sidebarCollapsed}
          role={role}
        />

        {/* Dynamic Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
