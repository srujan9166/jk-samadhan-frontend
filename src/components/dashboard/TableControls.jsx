import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

/**
 * Reusable TableControls Component
 * Provides unified entries-per-page select, search input, and optional refresh/export buttons.
 */
export default function TableControls({
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageSizeChange,
  searchQuery = '',
  onSearchChange,
  onRefresh,
  isRefreshing = false,
  placeholder = 'Search records...',
  rightActions,
  className = ''
}) {
  return (
    <div className={`px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold ${className}`}>
      {/* Page Size select */}
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
        <span>Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
          className="border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 px-2.5 py-1 text-slate-800 dark:text-slate-100 outline-none font-bold cursor-pointer"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span>entries</span>
      </div>

      {/* Right Controls: Search + Refresh + Actions */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
        <div className="relative flex-1 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-blue-600 dark:focus:border-blue-500 transition-all font-medium"
          />
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border-0 cursor-pointer transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}

        {rightActions}
      </div>
    </div>
  );
}
