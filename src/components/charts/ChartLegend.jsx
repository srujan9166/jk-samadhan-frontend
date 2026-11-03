import React from 'react';

export default function ChartLegend({
  data = [],
  activeFilter = null,
  hoveredLabel = null,
  onHover = () => {},
  onSelect = () => {},
  displayMode = 'both', // 'both', 'percent', 'count'
  columns = 2
}) {
  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

  const colClass = columns === 1 
    ? 'grid-cols-1' 
    : columns === 3 
      ? 'grid-cols-1 sm:grid-cols-3' 
      : 'grid-cols-2';

  return (
    <div className={`grid ${colClass} gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]`}>
      {data.map((item, idx) => {
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
        const isSelected = activeFilter === item.label;
        const isHovered = hoveredLabel === item.label;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(item.label)}
            onMouseEnter={() => onHover(item.label)}
            onMouseLeave={() => onHover(null)}
            className={`flex items-center justify-between p-1.5 rounded-lg text-left transition-all border-0 bg-transparent cursor-pointer ${
              isSelected
                ? 'bg-blue-50 dark:bg-blue-950/60 ring-1 ring-blue-500 font-bold'
                : isHovered
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 pr-1">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs transition-transform duration-150"
                style={{ 
                  backgroundColor: item.color,
                  transform: isHovered || isSelected ? 'scale(1.25)' : 'scale(1)' 
                }}
              />
              <span className="text-slate-700 dark:text-slate-300 truncate" title={item.label}>
                {item.label}
              </span>
            </div>

            <div className="shrink-0 flex items-center gap-1.5 ml-1">
              {(displayMode === 'count' || displayMode === 'both') && (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.value?.toLocaleString()}
                </span>
              )}
              {(displayMode === 'percent' || displayMode === 'both') && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                  {pct}%
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

