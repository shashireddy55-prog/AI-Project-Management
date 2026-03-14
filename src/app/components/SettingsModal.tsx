import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  X, Settings as SettingsIcon, Users, Link as LinkIcon, Download, 
  Sparkles, Bell, Lock, Palette, Globe, Database, Shield,
  ChevronRight, Bot, Zap, CheckCircle2, Moon, Sun, Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface SettingsModalProps {
  accessToken: string;
  workspaceId?: string;
  onClose: () => void;
  onOpenIntegrations: () => void;
  onOpenUserManagement: () => void;
  onOpenImport: () => void;
}

type SettingsTab = 'general' | 'ai' | 'access' | 'integrations' | 'notifications' | 'appearance';

export function SettingsModal({ 
  accessToken, 
  workspaceId, 
  onClose, 
  onOpenIntegrations, 
  onOpenUserManagement,
  onOpenImport 
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [workspaceAiEnabled, setWorkspaceAiEnabled] = useState(true);
  const [autoAssign, setAutoAssign] = useState(true);
  const [autoEstimate, setAutoEstimate] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    slack: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [workspaceId]);

  const loadSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/settings${workspaceId ? `?workspaceId=${workspaceId}` : ''}`,
        {
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAiEnabled(data.aiEnabled ?? true);
        setWorkspaceAiEnabled(data.workspaceAiEnabled ?? true);
        setAutoAssign(data.autoAssign ?? true);
        setAutoEstimate(data.autoEstimate ?? true);
        setAiSuggestions(data.aiSuggestions ?? true);
        setTheme(data.theme || 'light');
        setNotifications(data.notifications || { email: true, browser: true, slack: false });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            workspaceId,
            aiEnabled,
            workspaceAiEnabled,
            autoAssign,
            autoEstimate,
            aiSuggestions,
            theme,
            notifications
          })
        }
      );

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general' as SettingsTab, label: 'General', icon: SettingsIcon },
    { id: 'ai' as SettingsTab, label: 'AI Settings', icon: Bot },
    { id: 'access' as SettingsTab, label: 'Users & Access', icon: Users },
    { id: 'integrations' as SettingsTab, label: 'Integrations', icon: LinkIcon },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
  ];

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">General Settings</h3>
        
        {workspaceId && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Workspace Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Workspace ID</Label>
                <Input value={workspaceId} disabled className="bg-gray-50" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Access key features quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => {
                onClose();
                setTimeout(() => onOpenImport(), 100);
              }}
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Import Data
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => {
                onClose();
                setTimeout(() => onOpenIntegrations(), 100);
              }}
            >
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Manage Integrations
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => {
                onClose();
                setTimeout(() => onOpenUserManagement(), 100);
              }}
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                User Management
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">AI-Powered Features</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure how AI assists with project management tasks
        </p>
      </div>

      {/* Global AI Toggle */}
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base">Enable AI Assistant</CardTitle>
                <CardDescription>
                  {workspaceId ? 'AI features for this workspace' : 'AI features for all workspaces'}
                </CardDescription>
              </div>
            </div>
            <button
              onClick={() => {
                if (workspaceId) {
                  setWorkspaceAiEnabled(!workspaceAiEnabled);
                } else {
                  setAiEnabled(!aiEnabled);
                }
                toast.success(`AI ${(workspaceId ? !workspaceAiEnabled : !aiEnabled) ? 'enabled' : 'disabled'}`);
              }}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                (workspaceId ? workspaceAiEnabled : aiEnabled) ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                (workspaceId ? workspaceAiEnabled : aiEnabled) ? 'translate-x-7' : ''
              }`} />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {(workspaceId ? workspaceAiEnabled : aiEnabled) ? (
            <div className="bg-white rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">AI is active</span>
              </div>
              <p className="text-xs text-gray-600">
                {workspaceId 
                  ? 'Users can use AI commands to create tasks, estimate work, assign team members, and more in this workspace.'
                  : 'Users across all workspaces can use AI commands for project management.'
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Lock className="w-4 h-4" />
                <span className="font-medium">Manual mode</span>
              </div>
              <p className="text-xs text-gray-600">
                AI is disabled. All actions require manual admin approval.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Features */}
      {(workspaceId ? workspaceAiEnabled : aiEnabled) && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Capabilities</CardTitle>
              <CardDescription>Choose which AI features to enable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">Auto-Assign Tasks</Label>
                  <p className="text-xs text-gray-600">AI automatically assigns tasks based on expertise and workload</p>
                </div>
                <button
                  onClick={() => setAutoAssign(!autoAssign)}
                  className={`ml-4 w-11 h-6 rounded-full transition-colors ${
                    autoAssign ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoAssign ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">Auto-Estimate Story Points</Label>
                  <p className="text-xs text-gray-600">AI suggests story points based on task complexity</p>
                </div>
                <button
                  onClick={() => setAutoEstimate(!autoEstimate)}
                  className={`ml-4 w-11 h-6 rounded-full transition-colors ${
                    autoEstimate ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoEstimate ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">AI Suggestions</Label>
                  <p className="text-xs text-gray-600">Get real-time suggestions while working</p>
                </div>
                <button
                  onClick={() => setAiSuggestions(!aiSuggestions)}
                  className={`ml-4 w-11 h-6 rounded-full transition-colors ${
                    aiSuggestions ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    aiSuggestions ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI Commands Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white rounded p-2">
                  <code className="text-blue-600">Create task...</code>
                </div>
                <div className="bg-white rounded p-2">
                  <code className="text-blue-600">Generate sprint...</code>
                </div>
                <div className="bg-white rounded p-2">
                  <code className="text-blue-600">Assign to...</code>
                </div>
                <div className="bg-white rounded p-2">
                  <code className="text-blue-600">Estimate work...</code>
                </div>
                <div className="bg-white rounded p-2">
                  <code className="text-blue-600">Create workspace...</code>
                </div>
                <div className="bg-white rounded p-2">
                  <code className="text-blue-600">Import from...</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  const renderAccessTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Users & Access Control</h3>
        <p className="text-sm text-gray-600 mb-4">
          Manage team members and permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">User Management</CardTitle>
          <CardDescription>Add, remove, and manage team members</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              onClose();
              setTimeout(() => onOpenUserManagement(), 100);
            }}
            className="w-full"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Users & Teams
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permissions</CardTitle>
          <CardDescription>Configure role-based access control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">Admin</p>
              <p className="text-xs text-gray-600">Full access to all features</p>
            </div>
            <Badge>Active</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">Member</p>
              <p className="text-xs text-gray-600">Can view and edit assigned tasks</p>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-sm">Viewer</p>
              <p className="text-xs text-gray-600">Read-only access</p>
            </div>
            <Badge variant="secondary">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrationsTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Integrations</h3>
        <p className="text-sm text-gray-600 mb-4">
          Connect with external tools and services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected Services</CardTitle>
          <CardDescription>Manage your integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline"
            onClick={() => {
              onClose();
              setTimeout(() => onOpenIntegrations(), 100);
            }}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              View All Integrations
            </span>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button 
            variant="outline"
            onClick={() => {
              onClose();
              setTimeout(() => onOpenImport(), 100);
            }}
            className="w-full justify-between bg-green-50 border-green-300"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-green-600" />
              <span className="text-green-700">Import Data</span>
            </span>
            <ChevronRight className="w-4 h-4 text-green-600" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Notifications</h3>
        <p className="text-sm text-gray-600 mb-4">
          Configure how you receive updates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Email Notifications</Label>
              <p className="text-xs text-gray-600">Receive updates via email</p>
            </div>
            <button
              onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
              className={`w-11 h-6 rounded-full transition-colors ${
                notifications.email ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                notifications.email ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Browser Notifications</Label>
              <p className="text-xs text-gray-600">Get notified in your browser</p>
            </div>
            <button
              onClick={() => setNotifications({ ...notifications, browser: !notifications.browser })}
              className={`w-11 h-6 rounded-full transition-colors ${
                notifications.browser ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                notifications.browser ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Slack Notifications</Label>
              <p className="text-xs text-gray-600">Send updates to Slack</p>
            </div>
            <button
              onClick={() => setNotifications({ ...notifications, slack: !notifications.slack })}
              className={`w-11 h-6 rounded-full transition-colors ${
                notifications.slack ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                notifications.slack ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Appearance</h3>
        <p className="text-sm text-gray-600 mb-4">
          Customize how the app looks
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            onClick={() => setTheme('light')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              theme === 'light' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Light</p>
                <p className="text-xs text-gray-600">Bright and clean</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              theme === 'dark' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Dark</p>
                <p className="text-xs text-gray-600">Easy on the eyes</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTheme('auto')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              theme === 'auto' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Auto</p>
                <p className="text-xs text-gray-600">Match system preference</p>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <SettingsIcon className="w-6 h-6" />
                Settings
              </CardTitle>
              <CardDescription>
                {workspaceId ? 'Workspace settings and preferences' : 'Global application settings'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'general' && renderGeneralTab()}
              {activeTab === 'ai' && renderAITab()}
              {activeTab === 'access' && renderAccessTab()}
              {activeTab === 'integrations' && renderIntegrationsTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'appearance' && renderAppearanceTab()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-2 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
