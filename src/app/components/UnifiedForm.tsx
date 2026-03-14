import { ReactNode } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

/**
 * Unified Form Components - Consistent admin UI design
 * Use these components for all forms to maintain design consistency
 */

interface UnifiedFieldProps {
  label: string;
  icon?: ReactNode;
  required?: boolean;
  children: ReactNode;
  helpText?: string;
  error?: string;
}

export function UnifiedField({
  label,
  icon,
  required = false,
  children,
  helpText,
  error
}: UnifiedFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#000000' }}>
        {icon && <span style={{ color: '#FCA311' }}>{icon}</span>}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {helpText && !error && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

interface UnifiedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}

export function UnifiedInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  className = ''
}: UnifiedInputProps) {
  return (
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`border-gray-300 focus:border-[#FCA311] focus:ring-[#FCA311] ${className}`}
      style={{ color: '#000000' }}
    />
  );
}

interface UnifiedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export function UnifiedTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  disabled = false,
  className = ''
}: UnifiedTextareaProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`border-gray-300 focus:border-[#FCA311] focus:ring-[#FCA311] resize-none ${className}`}
      style={{ color: '#000000' }}
    />
  );
}

interface UnifiedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; badge?: ReactNode }[];
  placeholder?: string;
  disabled?: boolean;
}

export function UnifiedSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false
}: UnifiedSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="border-gray-300 focus:border-[#FCA311] focus:ring-[#FCA311]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.badge || option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

interface UnifiedSectionProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function UnifiedSection({
  title,
  icon,
  children,
  className = ''
}: UnifiedSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: '#E5E5E5' }}>
          {icon && <span style={{ color: '#FCA311' }}>{icon}</span>}
          <h3 className="text-lg font-semibold" style={{ color: '#000000' }}>
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

interface UnifiedFormGridProps {
  columns?: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

export function UnifiedFormGrid({
  columns = 2,
  children,
  className = ''
}: UnifiedFormGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}
