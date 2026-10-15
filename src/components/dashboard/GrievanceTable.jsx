import React from 'react';
import { Eye, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, UserCheck, Shield, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Common Unified Grievance Status Badge
 */
export function StatusBadge({ status }) {
  const norm = (status || 'Pending').toLowerCase();

  if (norm === 'resolved' || norm === 'disposed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Resolved</span>
      </span>
    );
  }

  if (norm === 'rejected' || norm === 'closed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        <span>Rejected</span>
      </span>
    );
  }

  if (norm === 'appealed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Appealed</span>
      </span>
    );
  }

  if (norm === 'in progress' || norm === 'under review' || norm === 'hearing scheduled') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  if (norm === 'forwarded') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
        <span>Forwarded</span>
      </span>
    );
  }

  // Default: Pending / In Process
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
      <span>Pending</span>
    </span>
  );
}

/**
 * Reusable Common GrievanceTable Component
 * 
 * Config-driven table rendering:
 * - config.visibleColumns: array of column keys to display
 * - config.actions: array of actions available to the user's role ('view', 'assign', 'forward', 'process', etc.)
 * 
 * Supports SuperAdmin, DM, RMC, DealingHand, Department, Appellate, and Citizen roles.
 */
export default function GrievanceTable({
  data = [],
  config = {},
  isLoading = false,
  sortColumn,
  sortDirection,
  onSort,
  onAction,
  startIndex = 0,
  className = ''
}) {
  const visibleColumns = config.visibleColumns || [
    'sNo',
    'grievanceId',
    'department',
    'category',
    'status',
    'createdDate',
    'actions'
  ];

  const actions = config.actions || ['view'];

  const getSortIcon = (colKey) => {
    if (sortColumn !== colKey) return <span className="opacity-40 ml-1">↕</span>;
    return sortDirection === 'ASC' ? (
      <ChevronUp className="w-3.5 h-3.5 inline ml-1 text-white" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 inline ml-1 text-white" />
    );
  };

  const getDeptDisplay = (dept) => {
    if (!dept) return 'N/A';
    if (typeof dept === 'object' && dept.name) return dept.name;
    return String(dept);
  };

  const formatDate = (rawDate) => {
    if (!rawDate) return 'N/A';
    try {
      if (rawDate.includes('T')) return rawDate.split('T')[0];
      return rawDate;
    } catch {
      return rawDate;
    }
  };

  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 border-collapse text-xs">
        <thead>
          <tr className="bg-[#164581] dark:bg-slate-900 text-white font-extrabold uppercase tracking-wider text-[10px] select-none">
            {visibleColumns.includes('sNo') && (
              <th className="px-4 py-3.5 text-center border-b border-slate-700/50 w-14">
                S. No.
              </th>
            )}

            {visibleColumns.includes('grievanceId') && (
              <th
                onClick={() => onSort && onSort('grievanceId')}
                className={`px-4 py-3.5 text-left border-b border-slate-700/50 ${
                  onSort ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''
                }`}
              >
                Grievance ID {onSort && getSortIcon('grievanceId')}
              </th>
            )}

            {visibleColumns.includes('mode') && (
              <th className="px-4 py-3.5 text-left border-b border-slate-700/50">
                Mode
              </th>
            )}

            {visibleColumns.includes('citizen') && (
              <th className="px-4 py-3.5 text-left border-b border-slate-700/50">
                Citizen Name
              </th>
            )}

            {visibleColumns.includes('phone') && (
              <th className="px-4 py-3.5 text-left border-b border-slate-700/50">
                Mobile No.
              </th>
            )}

            {visibleColumns.includes('department') && (
              <th
                onClick={() => onSort && onSort('department')}
                className={`px-4 py-3.5 text-left border-b border-slate-700/50 ${
                  onSort ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''
                }`}
              >
                Department {onSort && getSortIcon('department')}
              </th>
            )}

            {visibleColumns.includes('category') && (
              <th className="px-4 py-3.5 text-left border-b border-slate-700/50">
                Category
              </th>
            )}

            {visibleColumns.includes('subCategory') && (
              <th className="px-4 py-3.5 text-left border-b border-slate-700/50">
                Sub Category
              </th>
            )}

            {visibleColumns.includes('subject') && (
              <th className="px-4 py-3.5 text-left border-b border-slate-700/50">
                Subject
              </th>
            )}

            {visibleColumns.includes('district') && (
              <th className="px-4 py-3.5 text-left border-b border-slate-700/50">
                District
              </th>
            )}

            {visibleColumns.includes('createdDate') && (
              <th
                onClick={() => onSort && onSort('createdDate')}
                className={`px-4 py-3.5 text-left border-b border-slate-700/50 ${
                  onSort ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''
                }`}
              >
                Date {onSort && getSortIcon('createdDate')}
              </th>
            )}

            {visibleColumns.includes('status') && (
              <th className="px-4 py-3.5 text-left border-b border-slate-700/50">
                Status
              </th>
            )}

            {visibleColumns.includes('actions') && (
              <th className="px-4 py-3.5 text-center border-b border-slate-700/50">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800 font-medium">
          {isLoading ? (
            <tr>
              <td colSpan={visibleColumns.length} className="py-16 text-center text-slate-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-500 animate-pulse">Loading grievance records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={visibleColumns.length}
                className="py-16 text-center text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/50"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">No records found</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    No grievance records match the current filter or search criteria.
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, idx) => {
              const rowId = item.id || item.refNum || item.uniqId || idx;
              const refNumber = item.refNum || item.uniqId || (item.id ? `JK-${item.id}-2026` : 'N/A');
              const citizenName = item.citizenName || item.name || item.fullName || 'Anonymous';
              const citizenPhone = item.citizenPhone || item.mobile || item.phone || 'N/A';
              const deptName = getDeptDisplay(item.department);
              const category = item.category || item.grievanceCategory || 'General';
              const subCategory = item.subCategory || item.subCategoryLevel1 || 'N/A';
              const subject = item.subject || item.description || 'No summary provided';
              const district = item.district || item.districtName || 'J&K';
              const dateVal = formatDate(item.date || item.createdDate || item.createdAt);
              const status = item.status || 'Pending';
              const mode = item.source || item.mode || (item.channel ? item.channel : 'Web');

              return (
                <tr
                  key={rowId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-slate-700 dark:text-slate-200"
                >
                  {visibleColumns.includes('sNo') && (
                    <td className="px-4 py-3 text-center text-slate-500 dark:text-slate-400 font-mono font-bold">
                      {startIndex + idx + 1}
                    </td>
                  )}

                  {visibleColumns.includes('grievanceId') && (
                    <td className="px-4 py-3 font-bold font-mono text-[#164581] dark:text-blue-400 whitespace-nowrap">
                      {refNumber}
                    </td>
                  )}

                  {visibleColumns.includes('mode') && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                        {mode}
                      </span>
                    </td>
                  )}

                  {visibleColumns.includes('citizen') && (
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      {citizenName}
                    </td>
                  )}

                  {visibleColumns.includes('phone') && (
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {citizenPhone}
                    </td>
                  )}

                  {visibleColumns.includes('department') && (
                    <td className="px-4 py-3 max-w-[220px] truncate" title={deptName}>
                      {deptName}
                    </td>
                  )}

                  {visibleColumns.includes('category') && (
                    <td className="px-4 py-3 max-w-[180px] truncate" title={category}>
                      {category}
                    </td>
                  )}

                  {visibleColumns.includes('subCategory') && (
                    <td className="px-4 py-3 max-w-[180px] truncate text-slate-500 dark:text-slate-400" title={subCategory}>
                      {subCategory}
                    </td>
                  )}

                  {visibleColumns.includes('subject') && (
                    <td className="px-4 py-3 max-w-[240px] truncate" title={subject}>
                      {subject}
                    </td>
                  )}

                  {visibleColumns.includes('district') && (
                    <td className="px-4 py-3 whitespace-nowrap font-medium">
                      {district}
                    </td>
                  )}

                  {visibleColumns.includes('createdDate') && (
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {dateVal}
                    </td>
                  )}

                  {visibleColumns.includes('status') && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={status} />
                    </td>
                  )}

                  {visibleColumns.includes('actions') && (
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {actions.includes('view') && (
                          <button
                            type="button"
                            onClick={() => onAction && onAction('view', item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors border-0 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>View</span>
                          </button>
                        )}

                        {actions.includes('assign') && (
                          <button
                            type="button"
                            onClick={() => onAction && onAction('assign', item)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-lg transition-colors border-0 cursor-pointer"
                            title="Assign to Nodal Officer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </button>
                        )}

                        {actions.includes('forward') && (
                          <button
                            type="button"
                            onClick={() => onAction && onAction('forward', item)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg transition-colors border-0 cursor-pointer"
                            title="Forward Grievance"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Forward</span>
                          </button>
                        )}

                        {actions.includes('process') && (
                          <button
                            type="button"
                            onClick={() => onAction && onAction('process', item)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-lg transition-colors border-0 cursor-pointer"
                            title="Process Grievance"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Process</span>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
