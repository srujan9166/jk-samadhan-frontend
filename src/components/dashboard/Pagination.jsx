import React from 'react';

/**
 * Reusable Pagination Component
 * Displays "Showing X to Y of Z entries" and Previous / Page Numbers / Next buttons.
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  className = ''
}) {
  if (totalPages <= 1 && totalElements <= pageSize) return null;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalElements);

  // Generate page numbers
  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={`px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 select-none ${className}`}>
      <div>
        Showing <span className="font-bold text-slate-800 dark:text-slate-200">{totalElements > 0 ? startIndex + 1 : 0}</span> to{' '}
        <span className="font-bold text-slate-800 dark:text-slate-200">{endIndex}</span> of{' '}
        <span className="font-bold text-slate-800 dark:text-slate-200">{totalElements}</span> entries
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Previous
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange && onPageChange(p)}
            className={`px-3 py-1 rounded-lg border-0 cursor-pointer font-bold transition-colors ${
              currentPage === p
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
