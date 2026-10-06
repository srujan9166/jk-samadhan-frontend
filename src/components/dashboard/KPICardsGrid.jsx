import React from 'react';
import KPICard from './KPICard';

/**
 * Reusable Responsive KPI Cards Grid
 * Accepts a list of card objects: [{ id, title, value, icon, color, onClick, isActive, badge }]
 */
export default function KPICardsGrid({ cards = [], columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5', className = '' }) {
  if (!cards || cards.length === 0) return null;

  return (
    <div className={`grid gap-4 ${columns} ${className}`}>
      {cards.map((card, idx) => (
        <KPICard
          key={card.id || card.title || idx}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color}
          onClick={card.onClick}
          isActive={card.isActive}
          badge={card.badge}
        />
      ))}
    </div>
  );
}
