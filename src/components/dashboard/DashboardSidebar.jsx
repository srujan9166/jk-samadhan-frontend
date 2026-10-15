import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

/**
 * Common Reusable Configuration-Driven Sidebar
 * 
 * Takes `items` from DASHBOARD_ROLE_CONFIG[role].sidebar.
 * Handles active item selection, group expand/collapse, and responsive drawer state.
 */
export default function DashboardSidebar({
  items = [],
  activeItem = '',
  onSelectItem,
  isCollapsed = false,
  role = 'CITIZEN',
  className = ''
}) {
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <aside
      className={`bg-[#1e1f31] dark:bg-slate-950 text-white flex flex-col justify-between shrink-0 select-none transition-all duration-300 z-30 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {items.map((entry) => {
          if (entry.type === 'group') {
            const isGroupOpen = openGroups[entry.id] ?? true;
            const GroupIcon = entry.icon || LayoutDashboard;

            return (
              <div key={entry.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between text-slate-300 hover:bg-[#28293d] transition-colors border-0 cursor-pointer ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                  title={entry.label}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <GroupIcon className="w-4 h-4 shrink-0 text-slate-400" />
                    {!isCollapsed && <span className="truncate">{entry.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="shrink-0 text-slate-400">
                      {isGroupOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </button>

                {!isCollapsed && isGroupOpen && entry.children && (
                  <div className="pl-6 space-y-1 border-l-2 border-slate-700/50 ml-4">
                    {entry.children.map((child) => {
                      const ChildIcon = child.icon || LayoutDashboard;
                      const isActive = activeItem === child.id || activeItem === child.label;

                      return (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => onSelectItem && onSelectItem(child.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold flex items-center gap-2 transition-all border-0 cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-[#28293d]/50'
                          }`}
                        >
                          <ChildIcon className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Single Item
          const ItemIcon = entry.icon || LayoutDashboard;
          const isActive = activeItem === entry.id || activeItem === entry.label;

          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelectItem && onSelectItem(entry.id)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-colors border-0 cursor-pointer ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-black'
                  : 'text-slate-300 hover:bg-[#28293d]'
              }`}
              title={entry.label}
            >
              <ItemIcon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">{entry.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Branding */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center font-bold uppercase tracking-wider">
          <span>JK Samadhan 3.0 Portal</span>
        </div>
      )}
    </aside>
  );
}
