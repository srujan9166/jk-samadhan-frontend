import React from 'react';
import { Search, RefreshCw, FileSpreadsheet, FileText, Filter } from 'lucide-react';

/**
 * Common Reusable TableFilters Component
 * 
 * Provides search bar, page size select, status quick-filter pills,
 * channel filters (All/Web/Mobile), refresh button, and export shortcuts.
 */
export default function TableFilters({
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageSizeChange,
  searchQuery = '',
  onSearchChange,
  placeholder = 'Search by ID, department, category, citizen...',
  onRefresh,
  isRefreshing = false,
  statusFilter = '',
  statusOptions = [],
  onStatusFilterChange,
  channelFilter,
  onChannelFilterChange,
  onExportExcel,
  onExportPDF,
  isExporting = false,
  rightActions,
  className = ''
}) {
  return (
    <div className={`p-4 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 text-xs ${className}`}>
      {/* Top Row: Page size, status tabs / pills, and exports */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Entries selector + optional Channel filter */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold">
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

          {onChannelFilterChange && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
              {['All', 'Web', 'Mobile'].map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => onChannelFilterChange(ch)}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border-0 cursor-pointer transition-colors ${
                    (channelFilter || 'All') === ch
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Status Filter Pills + Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.length > 0 && onStatusFilterChange && (
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => onStatusFilterChange('')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border-0 cursor-pointer ${
                  !statusFilter
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                }`}
              >
                All Statuses
              </button>
              {statusOptions.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onStatusFilterChange(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border-0 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}

          {/* Export buttons */}
          {(onExportExcel || onExportPDF) && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              {onExportExcel && (
                <button
                  type="button"
                  onClick={onExportExcel}
                  disabled={isExporting}
                  className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center border-0 cursor-pointer shadow-xs transition-transform active:scale-95 disabled:opacity-50"
                  title="Export to Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              )}
              {onExportPDF && (
                <button
                  type="button"
                  onClick={onExportPDF}
                  disabled={isExporting}
                  className="w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center border-0 cursor-pointer shadow-xs transition-transform active:scale-95 disabled:opacity-50"
                  title="Export to PDF"
                >
                  <FileText className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {rightActions}
        </div>
      </div>

      {/* Bottom Row: Search Input + Refresh Button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs outline-none bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-blue-600 dark:focus:border-blue-500 font-medium transition-all shadow-2xs"
          />
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer transition-colors shadow-2xs shrink-0"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
