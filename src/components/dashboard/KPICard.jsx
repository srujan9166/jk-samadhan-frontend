import React from 'react';

const COLOR_PRESETS = {
  blue: 'bg-[#1e40af] text-white border-blue-800/20 shadow-blue-900/10',
  teal: 'bg-[#0f766e] text-white border-teal-800/20 shadow-teal-900/10',
  green: 'bg-[#15803d] text-white border-green-800/20 shadow-green-900/10',
  orange: 'bg-[#c2410c] text-white border-orange-800/20 shadow-orange-900/10',
  yellow: 'bg-[#b45309] text-white border-yellow-800/20 shadow-yellow-900/10',
  rose: 'bg-[#be123c] text-white border-rose-800/20 shadow-rose-900/10',
  purple: 'bg-[#6b21a8] text-white border-purple-800/20 shadow-purple-900/10',
  indigo: 'bg-[#4338ca] text-white border-indigo-800/20 shadow-indigo-900/10',
};

/**
 * Reusable Unified KPICard Component
 * Used across Super Admin, Citizen, Department, DM, RMC, and Appellate dashboards.
 */
export default function KPICard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  onClick,
  isActive = false,
  badge,
  className = ''
}) {
  const colorClass = COLOR_PRESETS[color] || (color.startsWith('bg-') ? color : COLOR_PRESETS.blue);
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-5 rounded-xl border select-none transition-all duration-300 flex justify-between items-center shadow-md ${colorClass} ${
        isClickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5' : ''
      } ${
        isActive ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-slate-900 shadow-xl scale-[1.02]' : ''
      } ${className}`}
    >
      <div className="space-y-1 z-10 text-left">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-white/90 truncate max-w-[200px]" title={title}>
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="block text-3xl font-extrabold font-mono tracking-tight">
            {value !== undefined && value !== null ? value : 0}
          </span>
          {badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
              {badge}
            </span>
          )}
        </div>
      </div>

      {Icon && (
        <div className="shrink-0 text-white/20 stroke-[1.5] transition-transform duration-300 group-hover:scale-110">
          {React.isValidElement(Icon) ? Icon : <Icon className="h-11 w-11" />}
        </div>
      )}
    </div>
  );
}
