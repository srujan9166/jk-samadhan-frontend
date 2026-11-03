import React, { useState } from 'react';
import ChartEmptyState from './ChartEmptyState';

export default function BarChart({
  data = [],
  activeFilter = null,
  onBarClick = () => {},
  displayMode = 'both',
  orientation = 'horizontal' // 'horizontal' | 'vertical'
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const maxValue = Math.max(...data.map((d) => d.value || 0), 1);

  if (total === 0) {
    return <ChartEmptyState title="No Feedback Data" message="No responses recorded for this category." />;
  }

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col justify-end w-full h-52 pt-4 pb-2 px-2 select-none">
        <div className="flex items-end justify-around gap-2 h-36 border-b border-slate-200 dark:border-slate-800 pb-2">
          {data.map((item, idx) => {
            const heightPercent = ((item.value || 0) / maxValue) * 100;
            const pct = total > 0 ? (((item.value || 0) / total) * 100).toFixed(1) : '0.0';
            const isSelected = activeFilter === item.label;
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => onBarClick(item.label)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                {/* Floating tooltip/value */}
                <div className={`text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-opacity mb-1 ${
                  isHovered || isSelected ? 'opacity-100 scale-105' : 'opacity-80'
                }`}>
                  {displayMode === 'percent' ? `${pct}%` : item.value?.toLocaleString()}
                </div>

                {/* Bar */}
                <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-full">
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                    style={{
                      height: `${Math.max(heightPercent, 4)}%`,
                      backgroundColor: item.color,
                      opacity: isSelected ? 1 : isHovered ? 0.95 : 0.85
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Labels underneath */}
        <div className="flex items-start justify-around gap-2 pt-2">
          {data.map((item, idx) => (
            <div
              key={idx}
              className="flex-1 text-center truncate text-[10px] font-medium text-slate-600 dark:text-slate-400"
              title={item.label}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal layout (Standard & clear)
  return (
    <div className="space-y-3 py-2 w-full select-none">
      {data.map((item, idx) => {
        const widthPercent = ((item.value || 0) / maxValue) * 100;
        const pct = total > 0 ? (((item.value || 0) / total) * 100).toFixed(1) : '0.0';
        const isSelected = activeFilter === item.label;
        const isHovered = hoveredIndex === idx;

        return (
          <div
            key={idx}
            onClick={() => onBarClick(item.label)}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`p-2 rounded-xl transition-all cursor-pointer border ${
              isSelected
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-1 ring-blue-500'
                : isHovered
                  ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                  : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
            }`}
          >
            {/* Label & Values */}
            <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate" title={item.label}>
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-xs">
                {(displayMode === 'count' || displayMode === 'both') && (
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.value?.toLocaleString()}
                  </span>
                )}
                {(displayMode === 'percent' || displayMode === 'both') && (
                  <span className="text-[10px] font-semibold text-slate-500 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                    {pct}%
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(widthPercent, 2)}%`,
                  backgroundColor: item.color,
                  opacity: isSelected ? 1 : isHovered ? 0.95 : 0.85
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

