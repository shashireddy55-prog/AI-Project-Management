import { ReactNode } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { UnifiedButton, UnifiedIconButton } from './UnifiedButtons';
import { Badge } from './ui/badge';

/**
 * Unified Header System - Consistent admin UI design
 * Use these for all screen headers
 */

interface UnifiedPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  breadcrumbs?: { label: string; onClick?: () => void }[];
  onBack?: () => void;
  actions?: ReactNode;
  tabs?: ReactNode;
}

export function UnifiedPageHeader({
  title,
  subtitle,
  icon,
  breadcrumbs,
  onBack,
  actions,
  tabs
}: UnifiedPageHeaderProps) {
  return (
    <div className="border-b" style={{ borderColor: '#E5E5E5', backgroundColor: '#FFFFFF' }}>
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {crumb.onClick ? (
                  <button
                    onClick={crumb.onClick}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-gray-500">{crumb.label}</span>
                )}
                {index < breadcrumbs.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Back Button */}
            {onBack && (
              <UnifiedIconButton
                icon={<ArrowLeft className="w-5 h-5" />}
                onClick={onBack}
                variant="ghost"
                tooltip="Go back"
              />
            )}

            {/* Title Section */}
            <div className="flex items-center gap-3">
              {icon && (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#FCA311' }}
                >
                  <div className="text-white">{icon}</div>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#000000' }}>
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {tabs && (
        <div className="px-6">
          {tabs}
        </div>
      )}
    </div>
  );
}

interface UnifiedSectionHeaderProps {
  title: string;
  icon?: ReactNode;
  badge?: string | number;
  actions?: ReactNode;
  description?: string;
}

export function UnifiedSectionHeader({
  title,
  icon,
  badge,
  actions,
  description
}: UnifiedSectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          {icon && <span style={{ color: '#FCA311' }}>{icon}</span>}
          <h2 className="text-xl font-bold" style={{ color: '#000000' }}>
            {title}
          </h2>
          {badge !== undefined && (
            <Badge
              className="text-white"
              style={{ backgroundColor: '#FCA311' }}
            >
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

interface UnifiedListHeaderProps {
  title: string;
  count?: number;
  icon?: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function UnifiedListHeader({
  title,
  count,
  icon,
  searchValue,
  onSearchChange,
  filters,
  actions
}: UnifiedListHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <span style={{ color: '#FCA311' }}>{icon}</span>}
          <h2 className="text-xl font-bold" style={{ color: '#000000' }}>
            {title}
          </h2>
          {count !== undefined && (
            <Badge
              variant="outline"
              className="text-sm"
              style={{ borderColor: '#FCA311', color: '#FCA311' }}
            >
              {count}
            </Badge>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Search and Filters Row */}
      {(onSearchChange || filters) && (
        <div className="flex items-center gap-3">
          {onSearchChange && (
            <div className="flex-1">
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  borderColor: '#E5E5E5',
                  color: '#000000'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FCA311';
                  e.target.style.boxShadow = '0 0 0 3px rgba(252, 163, 17, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E5E5';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}
          {filters}
        </div>
      )}
    </div>
  );
}
