import React from 'react';
import { PieChart as PieIcon, BarChart3 as BarIcon, Percent, Hash } from 'lucide-react';

export default function ChartCard({
  title,
  subtitle,
  children,
  total = null,
  activeFilter = null,
  onClearFilter = null,
  chartType = null, // 'donut' | 'bar'
  onToggleChartType = null,
  displayMode = null, // 'both' | 'percent' | 'count'
  onToggleDisplayMode = null,
  className = ''
}) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow duration-200 p-5 flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider truncate" title={title}>
              {title}
            </h4>
            {total !== null && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                {total.toLocaleString()} total
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeFilter && (
            <button
              onClick={onClearFilter}
              title="Clear Filter"
              className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer"
            >
              Filter: {activeFilter} &times;
            </button>
          )}

          {/* Chart Type Toggle: Donut vs Bar */}
          {chartType && onToggleChartType && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => onToggleChartType('donut')}
                title="Donut Chart View"
                className={`p-1 rounded-md border-0 cursor-pointer transition-colors ${
                  chartType === 'donut'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleChartType('bar')}
                title="Bar Chart View"
                className={`p-1 rounded-md border-0 cursor-pointer transition-colors ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <BarIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Display Mode Toggle: % vs Count */}
          {displayMode && onToggleDisplayMode && (
            <button
              type="button"
              onClick={onToggleDisplayMode}
              title={displayMode === 'percent' ? 'Show Counts' : 'Show Percentages'}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 border-0 cursor-pointer transition-colors"
            >
              {displayMode === 'percent' ? (
                <Hash className="w-3.5 h-3.5" />
              ) : (
                <Percent className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
    </div>
  );
}

