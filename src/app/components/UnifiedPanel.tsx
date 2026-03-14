import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader } from './ui/card';

/**
 * Unified Panel Components - Consistent admin UI design
 * Use these for all card/panel layouts
 */

interface UnifiedPanelProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: 'default' | 'highlighted' | 'sidebar';
}

export function UnifiedPanel({
  title,
  icon,
  children,
  actions,
  className = '',
  noPadding = false,
  variant = 'default'
}: UnifiedPanelProps) {
  const variantStyles = {
    default: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E5E5'
    },
    highlighted: {
      backgroundColor: '#F8F9FA',
      borderColor: '#FCA311',
      borderWidth: '2px'
    },
    sidebar: {
      backgroundColor: '#FAFAFA',
      borderColor: '#E5E5E5'
    }
  };

  return (
    <Card
      className={`border shadow-sm ${className}`}
      style={{
        backgroundColor: variantStyles[variant].backgroundColor,
        borderColor: variantStyles[variant].borderColor,
        borderWidth: variantStyles[variant].borderWidth
      }}
    >
      {(title || actions) && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            {title && (
              <div className="flex items-center gap-2">
                {icon && <span style={{ color: '#FCA311' }}>{icon}</span>}
                <h3 className="text-lg font-semibold" style={{ color: '#000000' }}>
                  {title}
                </h3>
              </div>
            )}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={noPadding ? 'p-0' : ''}>
        {children}
      </CardContent>
    </Card>
  );
}

interface UnifiedStatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function UnifiedStatsCard({
  icon,
  label,
  value,
  trend,
  onClick
}: UnifiedStatsCardProps) {
  const Component = onClick ? motion.div : 'div';
  const props = onClick ? {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    onClick,
    className: 'cursor-pointer'
  } : {};

  return (
    <Component {...props}>
      <Card
        className="border shadow-sm hover:shadow-md transition-shadow"
        style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{label}</p>
              <p className="text-3xl font-bold mt-2" style={{ color: '#000000' }}>
                {value}
              </p>
              {trend && (
                <p
                  className={`text-sm mt-2 ${
                    trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </p>
              )}
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#FCA311' }}
            >
              <div className="text-white">{icon}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Component>
  );
}

interface UnifiedTabsPanelProps {
  tabs: {
    id: string;
    label: string;
    icon?: ReactNode;
    content: ReactNode;
    badge?: number;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function UnifiedTabsPanel({
  tabs,
  activeTab,
  onTabChange
}: UnifiedTabsPanelProps) {
  return (
    <div>
      {/* Tab Headers */}
      <div
        className="flex gap-1 border-b mb-6"
        style={{ borderColor: '#E5E5E5' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-[#000000]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {tab.icon && (
                <span
                  style={{
                    color: activeTab === tab.id ? '#FCA311' : 'currentColor'
                  }}
                >
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: '#FCA311' }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: '#FCA311' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

interface UnifiedEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function UnifiedEmptyState({
  icon,
  title,
  description,
  action
}: UnifiedEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: '#F5F5F5' }}
      >
        <div style={{ color: '#FCA311' }}>{icon}</div>
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>
        {title}
      </h3>
      <p className="text-sm text-gray-500 max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90"
          style={{ backgroundColor: '#14213D' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
