import React, { useState } from 'react';
import ChartLegend from './ChartLegend';
import ChartEmptyState from './ChartEmptyState';

export default function DonutChart({
  data = [],
  activeFilter = null,
  onSliceClick = () => {},
  displayMode = 'both',
  size = 180,
  innerRadiusRatio = 0.55
}) {
  const [hoveredLabel, setHoveredLabel] = useState(null);

  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

  if (total === 0) {
    return <ChartEmptyState title="No Feedback Data" message="No responses recorded for this question." />;
  }

  // Geometry
  const cx = 100;
  const cy = 100;
  const rOuter = 82;
  const rInner = rOuter * innerRadiusRatio;

  let cumulativeAngle = 0;
  const slices = data.map((item) => {
    const percent = total > 0 ? (item.value / total) : 0;
    const angle = percent * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + rOuter * Math.cos(startRad);
    const y1 = cy + rOuter * Math.sin(startRad);
    const x2 = cx + rOuter * Math.cos(endRad);
    const y2 = cy + rOuter * Math.sin(endRad);

    const x3 = cx + rInner * Math.cos(endRad);
    const y3 = cy + rInner * Math.sin(endRad);
    const x4 = cx + rInner * Math.cos(startRad);
    const y4 = cy + rInner * Math.sin(startRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    let pathData = '';
    if (percent >= 0.999) {
      // Full circle donut
      pathData = `M ${cx} ${cy - rOuter} A ${rOuter} ${rOuter} 0 1 1 ${cx - 0.01} ${cy - rOuter} M ${cx} ${cy - rInner} A ${rInner} ${rInner} 0 1 0 ${cx - 0.01} ${cy - rInner} Z`;
    } else if (item.value > 0) {
      pathData = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    }

    const pctDisplay = (percent * 100).toFixed(1);
    return {
      ...item,
      pathData,
      percent,
      pctDisplay,
      isSelected: activeFilter === item.label,
      isHovered: hoveredLabel === item.label
    };
  });

  // Active hovered or selected item
  const activeItem = slices.find((s) => s.isHovered) || slices.find((s) => s.isSelected);

  return (
    <div className="flex flex-col items-center justify-between w-full">
      {/* SVG Container */}
      <div className="relative flex items-center justify-center my-2" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xs select-none">
          <g>
            {slices.map((slice, i) => slice.pathData && (
              <path
                key={i}
                d={slice.pathData}
                fill={slice.color}
                onClick={() => onSliceClick(slice.label)}
                onMouseEnter={() => setHoveredLabel(slice.label)}
                onMouseLeave={() => setHoveredLabel(null)}
                className={`cursor-pointer transition-all duration-200 outline-hidden ${
                  slice.isSelected
                    ? 'stroke-3 stroke-blue-600 scale-105 origin-center opacity-100'
                    : slice.isHovered
                      ? 'stroke-2 stroke-white dark:stroke-slate-900 scale-104 origin-center opacity-100'
                      : 'opacity-90 hover:opacity-100'
                }`}
              >
                <title>{`${slice.label}: ${slice.value.toLocaleString()} (${slice.pctDisplay}%)`}</title>
              </path>
            ))}
          </g>
        </svg>

        {/* Center Interactive Hub */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeItem ? (
            <>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[90px]" title={activeItem.label}>
                {activeItem.label}
              </span>
              <span className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
                {activeItem.pctDisplay}%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {activeItem.value.toLocaleString()} votes
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total
              </span>
              <span className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
                {total.toLocaleString()}
              </span>
              <span className="text-[9px] text-blue-500 font-semibold tracking-tight">
                Responses
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="w-full">
        <ChartLegend
          data={data}
          activeFilter={activeFilter}
          hoveredLabel={hoveredLabel}
          onHover={setHoveredLabel}
          onSelect={onSliceClick}
          displayMode={displayMode}
          columns={data.length > 2 ? 2 : 2}
        />
      </div>
    </div>
  );
}

