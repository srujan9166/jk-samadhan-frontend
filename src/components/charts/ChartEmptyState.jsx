import React from 'react';
import { BarChart2 } from 'lucide-react';

export default function ChartEmptyState({ 
  title = 'No Data Available', 
  message = 'No feedback records match the current filter criteria.',
  height = 'h-48'
}) {
  return (
    <div className={`${height} flex flex-col items-center justify-center p-6 text-center select-none`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
        <BarChart2 className="w-6 h-6 stroke-1" />
      </div>
      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
        {title}
      </h5>
      <p className="text-[11px] text-slate-400 max-w-[220px] leading-relaxed">
        {message}
      </p>
    </div>
  );
}

