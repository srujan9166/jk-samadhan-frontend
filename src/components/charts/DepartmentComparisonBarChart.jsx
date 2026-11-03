import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  ArrowUpDown, 
  Search, 
  SlidersHorizontal,
  ChevronDown,
  Info
} from 'lucide-react';
import ChartEmptyState from './ChartEmptyState';

export default function DepartmentComparisonBarChart({
  departmentData = [], // array of department objects from API
  mode = 'modern', // 'modern' (Excellent/Good/Average/Poor) or 'legacy' (Satisfied/Call/Rating)
  selectedDept = '0',
  onSelectDept = () => {}
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('count'); // 'count' | 'satisfaction' | 'name'
  const [limit, setLimit] = useState(10); // 10, 20, 'all'
  const [hoveredDept, setHoveredDept] = useState(null);

  // Filter and sort departments
  const processedDepts = useMemo(() => {
    if (!departmentData || departmentData.length === 0) return [];

    let list = departmentData.filter((d) => {
      const name = d.departmentName || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (sortBy === 'count') {
      list.sort((a, b) => (b.totalFeedbackCount || 0) - (a.totalFeedbackCount || 0));
    } else if (sortBy === 'satisfaction') {
      if (mode === 'modern') {
        list.sort((a, b) => ((b.excellentPct || 0) + (b.goodPct || 0)) - ((a.excellentPct || 0) + (a.goodPct || 0)));
      } else {
        list.sort((a, b) => (b.satisfiedYesPct || 0) - (a.satisfiedYesPct || 0));
      }
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.departmentName || '').localeCompare(b.departmentName || ''));
    }

    if (limit !== 'all') {
      return list.slice(0, Number(limit));
    }
    return list;
  }, [departmentData, searchTerm, sortBy, limit, mode]);

  const maxCount = useMemo(() => {
    return Math.max(...(departmentData || []).map((d) => d.totalFeedbackCount || 0), 1);
  }, [departmentData]);

  if (!departmentData || departmentData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <ChartEmptyState
          title="No Department Feedback Data"
          message="Department feedback records will appear here when available."
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Department-Wise Feedback & Performance Comparison
            </h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              {departmentData.length} Departments
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Compare feedback volume and satisfaction distribution across departments. Click any department to filter.
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-7 pr-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-36 sm:w-44"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setSortBy('count')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors border-0 cursor-pointer ${
                sortBy === 'count'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              By Volume
            </button>
            <button
              onClick={() => setSortBy('satisfaction')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors border-0 cursor-pointer ${
                sortBy === 'satisfaction'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              By Satisfaction %
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors border-0 cursor-pointer ${
                sortBy === 'name'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              A-Z
            </button>
          </div>

          {/* Show Limit */}
          <select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="h-8 px-2 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value="all">All Departments</option>
          </select>
        </div>
      </div>

      {/* Legend for Stacked Composition */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] py-1 bg-slate-50 dark:bg-slate-800/40 px-3 rounded-lg border border-slate-100 dark:border-slate-800">
        <span className="font-bold text-slate-500">Distribution Key:</span>
        {mode === 'modern' ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
              <span className="text-slate-600 dark:text-slate-300">Excellent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
              <span className="text-slate-600 dark:text-slate-300">Good</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span className="text-slate-600 dark:text-slate-300">Average</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span className="text-slate-600 dark:text-slate-300">Poor</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span className="text-slate-600 dark:text-slate-300">Satisfied (Yes %)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span className="text-slate-600 dark:text-slate-300">Not Satisfied (No %)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" />
              <span className="text-slate-600 dark:text-slate-300">Call Received (Yes %)</span>
            </div>
          </>
        )}
      </div>

      {/* Stacked Horizontal Bars List */}
      <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
        {processedDepts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No departments match "{searchTerm}"
          </div>
        ) : (
          processedDepts.map((dept, idx) => {
            const isSelected = selectedDept === dept.departmentName;
            const isHovered = hoveredDept === dept.departmentName;
            const count = dept.totalFeedbackCount || 0;
            const volumeWidthPct = (count / maxCount) * 100;

            // Rating / Satisfaction percentages
            let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
            if (mode === 'modern') {
              p1 = dept.excellentPct || 0;
              p2 = dept.goodPct || 0;
              p3 = dept.averagePct || 0;
              p4 = dept.poorPct || 0;
            } else {
              p1 = dept.satisfiedYesPct || 0;
              p2 = dept.satisfiedNoPct || 0;
              p3 = dept.callReceivedYesPct || 0;
            }

            return (
              <div
                key={idx}
                onClick={() => onSelectDept(isSelected ? '0' : dept.departmentName)}
                onMouseEnter={() => setHoveredDept(dept.departmentName)}
                onMouseLeave={() => setHoveredDept(null)}
                className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500'
                    : isHovered
                      ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                      : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                }`}
              >
                {/* Department Header */}
                <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 w-5 text-right">
                      #{idx + 1}
                    </span>
                    <span
                      className="font-bold text-slate-800 dark:text-slate-100 uppercase truncate text-[11px]"
                      title={dept.departmentName}
                    >
                      {dept.departmentName}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white shrink-0">
                        Active Filter
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                      {count.toLocaleString()} feedbacks
                    </span>
                    {mode === 'modern' ? (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                        {((p1 + p2)).toFixed(1)}% Positive
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                        {p1.toFixed(1)}% Satisfied
                      </span>
                    )}
                  </div>
                </div>

                {/* Stacked Horizontal Progress Bar */}
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex relative">
                  {mode === 'modern' ? (
                    <>
                      <div
                        style={{ width: `${p1}%` }}
                        className="bg-[#38bdf8] h-full transition-all duration-300"
                        title={`Excellent: ${p1.toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${p2}%` }}
                        className="bg-[#2563eb] h-full transition-all duration-300"
                        title={`Good: ${p2.toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${p3}%` }}
                        className="bg-[#f59e0b] h-full transition-all duration-300"
                        title={`Average: ${p3.toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${p4}%` }}
                        className="bg-[#ef4444] h-full transition-all duration-300"
                        title={`Poor: ${p4.toFixed(1)}%`}
                      />
                    </>
                  ) : (
                    <>
                      <div
                        style={{ width: `${p1}%` }}
                        className="bg-[#10b981] h-full transition-all duration-300"
                        title={`Satisfied Yes: ${p1.toFixed(1)}%`}
                      />
                      <div
                        style={{ width: `${p2}%` }}
                        className="bg-[#ef4444] h-full transition-all duration-300"
                        title={`Satisfied No: ${p2.toFixed(1)}%`}
                      />
                    </>
                  )}
                </div>

                {/* Micro Percentage Labels underneath */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-0.5">
                  {mode === 'modern' ? (
                    <>
                      <span>Exc: {p1.toFixed(0)}%</span>
                      <span>Good: {p2.toFixed(0)}%</span>
                      <span>Avg: {p3.toFixed(0)}%</span>
                      <span>Poor: {p4.toFixed(0)}%</span>
                    </>
                  ) : (
                    <>
                      <span>Solution Satisfied: {p1.toFixed(1)}%</span>
                      <span>Not Satisfied: {p2.toFixed(1)}%</span>
                      <span>Call Received: {p3.toFixed(1)}%</span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

