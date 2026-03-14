import { ReactNode } from 'react';

interface GlassDashboardWrapperProps {
  children: ReactNode;
}

export function GlassDashboardWrapper({ children }: GlassDashboardWrapperProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated particles */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Floating orbs - light theme */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-slate-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
