import { AlertTriangle, ExternalLink, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface DemoModeBannerProps {
  onDismiss?: () => void;
  onShowHelp?: () => void;
}

export function DemoModeBanner({ onDismiss, onShowHelp }: DemoModeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 mb-4 rounded-lg shadow-sm"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            Demo Mode Active
          </h3>
          <p className="text-sm text-amber-800 mb-3">
            Your OpenAI API quota has been exceeded. The app is using demo data instead of AI generation. 
            All features remain fully functional, but AI-powered content generation is temporarily unavailable.
          </p>
          <div className="flex flex-wrap gap-3">
            {onShowHelp && (
              <button
                onClick={onShowHelp}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
              >
                How to Fix This
              </button>
            )}
            <a
              href="https://platform.openai.com/account/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 hover:text-amber-700 underline"
            >
              Add Billing to OpenAI Account
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 hover:text-amber-700 underline"
            >
              Get New API Key
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
