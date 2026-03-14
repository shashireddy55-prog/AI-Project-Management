import React, { useState } from 'react';
import { Search, Bell, Settings, Zap, BookOpen, Download, Plus, Sparkles, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Logo } from './Logo';
import { Badge } from './ui/badge';

interface GlassHeaderProps {
  onCreateWorkspace: () => void;
  onShowCommands: () => void;
  onShowSettings: () => void;
  onShowImport: () => void;
  onLogout?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  notificationCount?: number;
  onLogoClick?: () => void;
  onShowNotifications?: () => void;
  // New props for workspace context
  isWorkspaceView?: boolean;
  workspaceName?: string;
  onCreateTicket?: () => void;
}

export function GlassHeader({
  onCreateWorkspace,
  onShowCommands,
  onShowSettings,
  onShowImport,
  onLogout,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  notificationCount = 0,
  onLogoClick,
  onShowNotifications,
  isWorkspaceView = false,
  workspaceName = '',
  onCreateTicket
}: GlassHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Check if it starts with "/" for commands
      if (searchQuery.startsWith('/')) {
        onShowCommands();
      } else {
        // Trigger AI search
        onSearchSubmit?.(searchQuery);
      }
    }
  };

  return (
    <div className="glass-strong border-b border-blue-200/30 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left - Logo + Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="sm" showText={true} clickable={true} onLogoClick={onLogoClick} animated={true} />
          </div>
          
          {/* Search Bar */}
          <div className={`flex-1 transition-all duration-300 ${showSearch ? 'scale-100' : 'scale-95'}`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search workspaces, tasks, or type / for commands..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setShowSearch(false)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-4 h-10 glass-strong border-blue-200/30 focus:border-blue-400 text-gray-700 placeholder:text-gray-400"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge className="bg-blue-100 text-blue-600 border-blue-200 text-xs">
                    ⌘K
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Actions - Conditional based on view */}
          {isWorkspaceView && (
            <Button
              onClick={onCreateTicket}
              className="text-white shadow-lg transition-all duration-300 transform hover:scale-105 h-10"
              style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)' }}
            >
              <Plus className="w-4 h-4 mr-2" style={{ color: '#FCA311' }} />
              <span className="hidden sm:inline">Create Ticket</span>
              <span className="sm:hidden">Create</span>
            </Button>
          )}

          {/* Commands Button */}
          <Button
            onClick={onShowCommands}
            variant="outline"
            className="glass-dark border-slate-200/30 hover:border-blue-400 hover:bg-blue-50 text-gray-700 h-10"
            title="AI Command Examples"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Commands</span>
          </Button>

          {/* Notifications */}
          <Button
            onClick={onShowNotifications}
            variant="ghost"
            className="relative hover:bg-blue-50 text-gray-700 h-10 w-10 p-0"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse">
                {notificationCount > 9 ? '9+' : notificationCount}
              </div>
            )}
          </Button>

          {/* Settings */}
          <Button
            onClick={onShowSettings}
            variant="ghost"
            className="hover:bg-blue-50 text-gray-700 h-10 w-10 p-0"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Logout */}
          {onLogout && (
            <Button
              onClick={onLogout}
              variant="ghost"
              className="hover:bg-red-100 text-gray-700 hover:text-red-600 h-10 w-10 p-0"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats Bar - Optional */}
      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-gray-600">System Status:</span>
          <span className="text-green-600 font-semibold">All Systems Operational</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <span>AI Ready</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Zap className="w-4 h-4 text-blue-600" />
          <span>Pro Plan</span>
        </div>
      </div>
    </div>
  );
}