import React from 'react';
import KPICard from './KPICard';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  FileText,
  Scale,
  Bell,
  ArrowRight
} from 'lucide-react';

const ICON_MAP = {
  total: LayoutDashboard,
  pending: Clock,
  resolved: CheckCircle2,
  rejected: XCircle,
  inProgress: Clock,
  appealed: Scale,
  forwarded: ArrowRight,
  alert: AlertTriangle,
  feedback: HelpCircle,
  hearing: Scale,
  announcement: Bell
};

/**
 * Reusable Unified KPICards Section
 * 
 * Takes `config` (array of KPI card configs for the user's role)
 * and `stats` (counts/metrics object).
 * Renders consistent interactive cards with active status highlighting.
 */
export default function KPICards({
  config = [],
  stats = {},
  activeFilter = '',
  onCardClick,
  columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  className = ''
}) {
  if (!config || config.length === 0) return null;

  return (
    <div className={`grid gap-4 ${columns} ${className}`}>
      {config.map((item) => {
        const IconComponent = item.icon || ICON_MAP[item.key] || LayoutDashboard;
        const val = stats[item.key] !== undefined && stats[item.key] !== null
          ? stats[item.key]
          : (stats[item.title] !== undefined ? stats[item.title] : 0);

        const isActive = activeFilter && item.filterValue && activeFilter === item.filterValue;

        return (
          <KPICard
            key={item.id || item.key || item.title}
            title={item.title}
            value={val}
            icon={IconComponent}
            color={item.color || 'blue'}
            onClick={onCardClick && item.filterValue !== undefined ? () => onCardClick(item.filterValue) : undefined}
            isActive={isActive}
            badge={item.badge}
          />
        );
      })}
    </div>
  );
}
