import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Unified Button System - Consistent admin UI design
 * All buttons follow the color scheme:
 * - Primary: #14213D
 * - Secondary: outlined with #14213D
 * - Accent: #FCA311
 * - Destructive: Red
 */

interface UnifiedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export function UnifiedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = ''
}: UnifiedButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#14213D',
      color: '#FFFFFF',
      className: 'hover:opacity-90 shadow-sm'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#14213D',
      className: 'border-2 hover:bg-gray-50',
      style: { borderColor: '#14213D' }
    },
    accent: {
      backgroundColor: '#FCA311',
      color: '#FFFFFF',
      className: 'hover:opacity-90 shadow-sm'
    },
    destructive: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
      className: 'hover:bg-red-700 shadow-sm'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#000000',
      className: 'hover:bg-gray-100'
    }
  };

  const style = {
    backgroundColor: variantStyles[variant].backgroundColor,
    color: variantStyles[variant].color,
    ...variantStyles[variant].style
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${sizeClasses[size]}
        ${variantStyles[variant].className}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      style={style}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span>{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span>{icon}</span>}
        </>
      )}
    </button>
  );
}

interface UnifiedIconButtonProps {
  icon: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export function UnifiedIconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  tooltip,
  disabled = false,
  className = ''
}: UnifiedIconButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#14213D',
      color: '#FFFFFF',
      className: 'hover:opacity-90'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#14213D',
      className: 'border-2 hover:bg-gray-50',
      style: { borderColor: '#14213D' }
    },
    accent: {
      backgroundColor: '#FCA311',
      color: '#FFFFFF',
      className: 'hover:opacity-90'
    },
    destructive: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
      className: 'hover:bg-red-700'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#000000',
      className: 'hover:bg-gray-100'
    }
  };

  const style = {
    backgroundColor: variantStyles[variant].backgroundColor,
    color: variantStyles[variant].color,
    ...variantStyles[variant].style
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        ${sizeClasses[size]}
        ${variantStyles[variant].className}
        rounded-lg
        flex items-center justify-center
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={style}
    >
      <div className={iconSizes[size]}>{icon}</div>
    </button>
  );
}

interface UnifiedButtonGroupProps {
  buttons: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: 'primary' | 'secondary' | 'accent' | 'destructive';
    disabled?: boolean;
  }[];
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
}

export function UnifiedButtonGroup({
  buttons,
  orientation = 'horizontal',
  fullWidth = false
}: UnifiedButtonGroupProps) {
  return (
    <div
      className={`
        flex gap-2
        ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {buttons.map((button, index) => (
        <UnifiedButton
          key={index}
          onClick={button.onClick}
          variant={button.variant || 'secondary'}
          icon={button.icon}
          disabled={button.disabled}
          fullWidth={fullWidth}
        >
          {button.label}
        </UnifiedButton>
      ))}
    </div>
  );
}
