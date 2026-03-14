import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  actions?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

/**
 * Unified Modal Component - Consistent admin UI design
 * Color scheme:
 * - #000000 for text
 * - #14213D for headers, primary buttons
 * - #FCA311 for icons and accents
 * - #E5E5E5/#FFFFFF for backgrounds
 */
export function UnifiedModal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  size = 'lg',
  actions,
  isLoading = false,
  className = ''
}: UnifiedModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl'
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Unified Header */}
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{
                backgroundColor: '#14213D',
                borderColor: '#14213D'
              }}
            >
              <div className="flex items-center gap-3">
                {icon && (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#FCA311' }}
                  >
                    <div className="text-white">{icon}</div>
                  </div>
                )}
                <h2 className="text-xl font-bold text-white">
                  {title}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: '#FFFFFF' }}>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FCA311' }} />
                </div>
              ) : (
                children
              )}
            </div>

            {/* Actions Footer */}
            {actions && (
              <div
                className="px-6 py-4 border-t flex items-center justify-end gap-3"
                style={{
                  backgroundColor: '#F5F5F5',
                  borderColor: '#E5E5E5'
                }}
              >
                {actions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
