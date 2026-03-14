import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Users,
  Shield,
  CreditCard,
  FileText,
  Bell,
  Database,
  Key,
  Mail,
  Globe,
  Zap,
  Lock,
  UserPlus,
  Trash2,
  Edit,
  MoreVertical,
  Search,
  Download,
  Upload,
  Check,
  X,
  AlertTriangle,
  Activity,
  BarChart3,
  Package,
  Palette,
  Code,
  Webhook,
  Server,
  HardDrive,
  Cloud,
  RefreshCw,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  Plus,
  Sparkles,
  Send,
  MessageSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';

interface AdminSettingsProps {
  onBack: () => void;
}

export function AdminSettings({ onBack }: AdminSettingsProps) {
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiCommand, setAiCommand] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const handleAICommand = async () => {
    if (!aiCommand.trim()) return;
    
    setIsProcessingAI(true);
    const command = aiCommand;
    
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessingAI(false);
      setAiCommand('');
      
      // Here you would integrate with OpenAI API to process admin commands
      // For now, simulate success
      toast.success('AI Command Executed', {
        description: `Successfully processed: "${command}"`
      });
      
      // Example of how different commands could be parsed and executed:
      // if (command.toLowerCase().includes('add user')) {
      //   // Parse user details and add user
      // } else if (command.toLowerCase().includes('enable 2fa')) {
      //   // Enable 2FA
      // } etc.
    }, 1500);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  Admin Settings
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your Projify AI workspace settings and configuration
                </p>
              </div>
            </div>
          </div>

          {/* AI Command Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#FCA311' }}>
                <Sparkles className="w-8 h-8 p-1.5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  AI Admin Assistant
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">Beta</Badge>
                </div>
                <div className="text-xs text-gray-600">
                  Configure system settings using natural language commands
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Enter admin command..."
                  value={aiCommand}
                  onChange={(e) => setAiCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAICommand()}
                  className="pl-10 bg-white border-gray-300 focus:border-blue-500"
                  disabled={isProcessingAI}
                />
              </div>
              <Button
                onClick={handleAICommand}
                disabled={!aiCommand.trim() || isProcessingAI}
                className="gap-2"
                style={{ backgroundColor: '#14213D', color: '#FFFFFF' }}
              >
                {isProcessingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Execute
                  </>
                )}
              </Button>
            </div>

            {/* Example Commands */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-600">Examples:</span>
              {[
                'Add user Sarah as Project Manager',
                'Enable two-factor authentication',
                'Set sprint duration to 3 weeks',
                'Change workspace timezone to PST'
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setAiCommand(example)}
                  className="text-xs px-2 py-1 rounded-md bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
                  disabled={isProcessingAI}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-row">
          {/* Sidebar Navigation */}
          <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto shrink-0">
            <TabsList className="p-4 space-y-1 flex flex-col w-full h-auto bg-transparent">
              <TabButton icon={Users} label="User Management" value="users" active={activeTab === 'users'} />
              <TabButton icon={Shield} label="Security & Access" value="security" active={activeTab === 'security'} />
              <TabButton icon={Palette} label="Workspace Settings" value="workspace" active={activeTab === 'workspace'} />
              <TabButton icon={Key} label="API & Integrations" value="integrations" active={activeTab === 'integrations'} />
              <TabButton icon={CreditCard} label="Billing & Plans" value="billing" active={activeTab === 'billing'} />
              <TabButton icon={Bell} label="Notifications" value="notifications" active={activeTab === 'notifications'} />
              <TabButton icon={FileText} label="Audit Logs" value="audit" active={activeTab === 'audit'} />
              <TabButton icon={Database} label="Data Management" value="data" active={activeTab === 'data'} />
              <TabButton icon={Server} label="System Config" value="system" active={activeTab === 'system'} />
            </TabsList>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50">
            <TabsContent value="users" className="m-0 h-full p-6">
              <UserManagement searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            </TabsContent>

            <TabsContent value="security" className="m-0 h-full p-6">
              <SecuritySettings />
            </TabsContent>

            <TabsContent value="workspace" className="m-0 h-full p-6">
              <WorkspaceSettings />
            </TabsContent>

            <TabsContent value="integrations" className="m-0 h-full p-6">
              <IntegrationsSettings />
            </TabsContent>

            <TabsContent value="billing" className="m-0 h-full p-6">
              <BillingSettings />
            </TabsContent>

            <TabsContent value="notifications" className="m-0 h-full p-6">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="audit" className="m-0 h-full p-6">
              <AuditLogs />
            </TabsContent>

            <TabsContent value="data" className="m-0 h-full p-6">
              <DataManagement />
            </TabsContent>

            <TabsContent value="system" className="m-0 h-full p-6">
              <SystemConfig />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, value, active }: any) {
  return (
    <TabsTrigger
      value={value}
      className={`w-full justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </TabsTrigger>
  );
}

// User Management Component
function UserManagement({ searchQuery, setSearchQuery }: any) {
  const [showAddUser, setShowAddUser] = useState(false);

  const users = [
    { id: '1', name: 'John Doe', email: 'john@projify.ai', role: 'Admin', status: 'Active', lastActive: '2 hours ago', avatar: 'JD' },
    { id: '2', name: 'Jane Smith', email: 'jane@projify.ai', role: 'Project Manager', status: 'Active', lastActive: '5 minutes ago', avatar: 'JS' },
    { id: '3', name: 'Mike Johnson', email: 'mike@projify.ai', role: 'Developer', status: 'Active', lastActive: '1 day ago', avatar: 'MJ' },
    { id: '4', name: 'Sarah Lee', email: 'sarah@projify.ai', role: 'Developer', status: 'Inactive', lastActive: '1 week ago', avatar: 'SL' },
    { id: '5', name: 'Tom Brown', email: 'tom@projify.ai', role: 'Viewer', status: 'Active', lastActive: '3 hours ago', avatar: 'TB' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value="25" color="blue" trend="+3 this week" />
        <StatCard icon={CheckCircle2} label="Active Users" value="22" color="cyan" trend="88% active" />
        <StatCard icon={Shield} label="Admins" value="3" color="blue" />
        <StatCard icon={Clock} label="Pending Invites" value="2" color="cyan" />
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Project Manager</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white gap-2">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage user access and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold shadow-lg">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {user.role}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 w-32">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {user.status}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{user.lastActive}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Key className="w-4 h-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Lock className="w-4 h-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Security Settings Component
function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordExpiry, setPasswordExpiry] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [ipWhitelisting, setIpWhitelisting] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Shield} label="Security Score" value="85%" color="blue" trend="Good" />
        <StatCard icon={Lock} label="2FA Users" value="18/25" color="cyan" trend="72% enabled" />
        <StatCard icon={AlertTriangle} label="Security Alerts" value="2" color="blue" trend="This week" />
      </div>

      {/* Authentication Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Authentication Settings
          </CardTitle>
          <CardDescription>Configure authentication and security policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow
            icon={Shield}
            title="Two-Factor Authentication"
            description="Require 2FA for all users"
            enabled={twoFactorEnabled}
            onToggle={setTwoFactorEnabled}
          />
          <SettingRow
            icon={Key}
            title="Password Expiry"
            description="Passwords expire every 90 days"
            enabled={passwordExpiry}
            onToggle={setPasswordExpiry}
          />
          <SettingRow
            icon={Globe}
            title="Single Sign-On (SSO)"
            description="Enable SSO with Google, Microsoft, or SAML"
            enabled={ssoEnabled}
            onToggle={setSsoEnabled}
          />
          <SettingRow
            icon={Server}
            title="IP Whitelisting"
            description="Restrict access to specific IP addresses"
            enabled={ipWhitelisting}
            onToggle={setIpWhitelisting}
          />
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            Password Policy
          </CardTitle>
          <CardDescription>Set password requirements for all users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Minimum Length
              </label>
              <Input type="number" defaultValue="8" className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Password Expiry (days)
              </label>
              <Input type="number" defaultValue="90" className="w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Require uppercase letters</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Require lowercase letters</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Require numbers</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">Require special characters</span>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            Save Password Policy
          </Button>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Session Management
          </CardTitle>
          <CardDescription>Control user session behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Session Timeout (minutes)
              </label>
              <Input type="number" defaultValue="30" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Max Concurrent Sessions
              </label>
              <Input type="number" defaultValue="3" />
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            Save Session Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Workspace Settings Component
function WorkspaceSettings() {
  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            General Settings
          </CardTitle>
          <CardDescription>Basic workspace configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Workspace Name
            </label>
            <Input defaultValue="FlowForge Team" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Workspace URL
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">flowforge.com/</span>
              <Input defaultValue="team" className="flex-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Default Timezone
            </label>
            <Select defaultValue="utc">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                <SelectItem value="est">Eastern Time (EST)</SelectItem>
                <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Default Language
            </label>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            Branding & Appearance
          </CardTitle>
          <CardDescription>Customize your workspace appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Workspace Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                FF
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
                <Button variant="outline">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Primary Color
            </label>
            <div className="flex items-center gap-4">
              <Input type="color" defaultValue="#3b82f6" className="w-20 h-10" />
              <Input defaultValue="#3b82f6" className="flex-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Secondary Color
            </label>
            <div className="flex items-center gap-4">
              <Input type="color" defaultValue="#06b6d4" className="w-20 h-10" />
              <Input defaultValue="#06b6d4" className="flex-1" />
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            Save Branding
          </Button>
        </CardContent>
      </Card>

      {/* Project Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Project Defaults
          </CardTitle>
          <CardDescription>Set default project configurations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Default Methodology
            </label>
            <Select defaultValue="agile">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agile">Agile</SelectItem>
                <SelectItem value="scrum">Scrum</SelectItem>
                <SelectItem value="kanban">Kanban</SelectItem>
                <SelectItem value="waterfall">Waterfall</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Sprint Duration (weeks)
            </label>
            <Input type="number" defaultValue="2" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Estimation Method
            </label>
            <Select defaultValue="story-points">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="story-points">Story Points</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="t-shirt">T-Shirt Sizes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            Save Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Integrations Settings Component
function IntegrationsSettings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const integrations = [
    { id: '1', name: 'Slack', description: 'Team communication', icon: MessageSquare, status: 'Connected', color: 'blue' },
    { id: '2', name: 'GitHub', description: 'Code repository', icon: Code, status: 'Connected', color: 'cyan' },
    { id: '3', name: 'Jira', description: 'Issue tracking', icon: FileText, status: 'Not Connected', color: 'blue' },
    { id: '4', name: 'Google Calendar', description: 'Calendar sync', icon: Calendar, status: 'Connected', color: 'cyan' }
  ];

  const webhooks = [
    { id: '1', name: 'Project Created', url: 'https://api.example.com/webhooks/project', status: 'Active' },
    { id: '2', name: 'Sprint Completed', url: 'https://api.example.com/webhooks/sprint', status: 'Active' },
    { id: '3', name: 'User Invited', url: 'https://api.example.com/webhooks/user', status: 'Inactive' }
  ];

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            API Keys
          </CardTitle>
          <CardDescription>Manage API keys for FlowForge integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Production API Key
            </label>
            <div className="flex items-center gap-2">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value="ff_live_sk_1234567890abcdefghijklmnop"
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Development API Key
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="password"
                value="ff_test_sk_0987654321zyxwvutsrqponmlk"
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button variant="outline" size="icon">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Keys
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Third-Party Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Third-Party Integrations
          </CardTitle>
          <CardDescription>Connect FlowForge with your favorite tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <motion.div
                  key={integration.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${integration.color}-100 to-${integration.color}-200 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${integration.color}-600`} />
                    </div>
                    <Badge className={integration.status === 'Connected' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                      {integration.status}
                    </Badge>
                  </div>
                  <div className="font-semibold text-gray-900">{integration.name}</div>
                  <div className="text-sm text-gray-600 mb-3">{integration.description}</div>
                  <Button
                    variant={integration.status === 'Connected' ? 'outline' : 'default'}
                    size="sm"
                    className={integration.status === 'Connected' ? '' : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'}
                  >
                    {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-blue-600" />
                Webhooks
              </CardTitle>
              <CardDescription>Configure webhook endpoints for events</CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <div
                key={webhook.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Webhook className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{webhook.name}</div>
                    <div className="text-sm text-gray-600 font-mono">{webhook.url}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={webhook.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                    {webhook.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Webhook
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Activity className="w-4 h-4 mr-2" />
                        Test Webhook
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Billing Settings Component
function BillingSettings() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Current Plan
          </CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">Professional Plan</div>
              <div className="text-gray-600">$99/month • Billed monthly</div>
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                <span className="text-sm text-gray-600">Next billing date: March 28, 2026</span>
              </div>
            </div>
            <Button variant="outline">Change Plan</Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Team Members</div>
              <div className="text-2xl font-bold text-blue-900">25 / 50</div>
            </div>
            <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-200">
              <div className="text-sm text-cyan-700 mb-1">Projects</div>
              <div className="text-2xl font-bold text-cyan-900">12 / Unlimited</div>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-sm text-blue-700 mb-1">Storage Used</div>
              <div className="text-2xl font-bold text-blue-900">45 GB / 100 GB</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Payment Method
          </CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Visa ending in 4242</div>
                <div className="text-sm text-gray-600">Expires 12/2027</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit</Button>
              <Button variant="outline">Remove</Button>
            </div>
          </div>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Billing History
          </CardTitle>
          <CardDescription>View and download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: 'Feb 28, 2026', amount: '$99.00', status: 'Paid', invoice: 'INV-2026-02' },
              { date: 'Jan 28, 2026', amount: '$99.00', status: 'Paid', invoice: 'INV-2026-01' },
              { date: 'Dec 28, 2025', amount: '$99.00', status: 'Paid', invoice: 'INV-2025-12' }
            ].map((invoice, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{invoice.invoice}</div>
                    <div className="text-sm text-gray-600">{invoice.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{invoice.amount}</div>
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      {invoice.status}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose what email notifications you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow icon={Mail} title="Project Updates" description="Get notified about project changes" enabled={true} />
          <SettingRow icon={Users} title="Team Mentions" description="When someone mentions you" enabled={true} />
          <SettingRow icon={FileText} title="Sprint Reports" description="Weekly sprint reports" enabled={true} />
          <SettingRow icon={AlertTriangle} title="Issue Assignments" description="When issues are assigned to you" enabled={true} />
          <SettingRow icon={Calendar} title="Sprint Reminders" description="Reminders for sprint events" enabled={false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            In-App Notifications
          </CardTitle>
          <CardDescription>Manage notifications within FlowForge</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow icon={Activity} title="Real-time Updates" description="Live updates for activity" enabled={true} />
          <SettingRow icon={Users} title="Team Activity" description="Team member actions" enabled={true} />
          <SettingRow icon={TrendingUp} title="Performance Alerts" description="Project performance warnings" enabled={true} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Notification Frequency
          </CardTitle>
          <CardDescription>Control how often you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Email Digest
            </label>
            <Select defaultValue="daily">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Audit Logs Component
function AuditLogs() {
  const logs = [
    { id: '1', user: 'John Doe', action: 'Created project "Mobile App Redesign"', timestamp: '2 minutes ago', type: 'create', icon: Plus },
    { id: '2', user: 'Jane Smith', action: 'Updated user permissions for Mike Johnson', timestamp: '15 minutes ago', type: 'update', icon: Edit },
    { id: '3', user: 'Admin', action: 'Changed security settings', timestamp: '1 hour ago', type: 'security', icon: Shield },
    { id: '4', user: 'Sarah Lee', action: 'Deleted workspace "Old Project"', timestamp: '3 hours ago', type: 'delete', icon: Trash2 },
    { id: '5', user: 'Tom Brown', action: 'Exported data backup', timestamp: '5 hours ago', type: 'export', icon: Download },
    { id: '6', user: 'Mike Johnson', action: 'Added integration for Slack', timestamp: '1 day ago', type: 'integration', icon: Zap }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Events" value="1,234" color="blue" />
        <StatCard icon={Users} label="Active Users" value="25" color="cyan" />
        <StatCard icon={Shield} label="Security Events" value="12" color="blue" />
        <StatCard icon={AlertTriangle} label="Warnings" value="3" color="cyan" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Activity Logs
              </CardTitle>
              <CardDescription>Track all activities in your workspace</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.map((log, index) => {
              const Icon = log.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{log.user}</span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                        {log.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700">{log.action}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Data Management Component
function DataManagement() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={HardDrive} label="Storage Used" value="45 GB" color="blue" trend="of 100 GB" />
        <StatCard icon={Database} label="Total Records" value="12,456" color="cyan" />
        <StatCard icon={Cloud} label="Last Backup" value="2h ago" color="blue" />
      </div>

      {/* Backup & Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            Backup & Export
          </CardTitle>
          <CardDescription>Manage data backups and exports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">Automatic Backups Enabled</div>
                <div className="text-sm text-gray-600">Daily backups at 2:00 AM UTC</div>
              </div>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Create Manual Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            Recent Backups
          </CardTitle>
          <CardDescription>View and restore from backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: 'Feb 28, 2026 02:00 AM', size: '2.4 GB', status: 'Success' },
              { date: 'Feb 27, 2026 02:00 AM', size: '2.3 GB', status: 'Success' },
              { date: 'Feb 26, 2026 02:00 AM', size: '2.3 GB', status: 'Success' }
            ].map((backup, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <Database className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{backup.date}</div>
                    <div className="text-sm text-gray-600">{backup.size}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    {backup.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Data Retention
          </CardTitle>
          <CardDescription>Configure data retention policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Audit Log Retention (days)
            </label>
            <Input type="number" defaultValue="90" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Deleted Item Retention (days)
            </label>
            <Input type="number" defaultValue="30" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Backup Retention (days)
            </label>
            <Input type="number" defaultValue="365" />
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
            Save Retention Policy
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// System Configuration Component
function SystemConfig() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Server} label="System Status" value="Healthy" color="blue" trend="All systems operational" />
        <StatCard icon={Activity} label="Uptime" value="99.9%" color="cyan" trend="Last 30 days" />
        <StatCard icon={TrendingUp} label="Performance" value="Excellent" color="blue" />
      </div>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            System Configuration
          </CardTitle>
          <CardDescription>Advanced system settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow icon={Activity} title="Performance Monitoring" description="Track system performance metrics" enabled={true} />
          <SettingRow icon={Shield} title="Security Scanning" description="Automated security scans" enabled={true} />
          <SettingRow icon={RefreshCw} title="Auto-Updates" description="Automatically install updates" enabled={false} />
          <SettingRow icon={Mail} title="Error Reporting" description="Send error reports to admins" enabled={true} />
        </CardContent>
      </Card>

      {/* System Maintenance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            System Maintenance
          </CardTitle>
          <CardDescription>Perform system maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline">
              <Database className="w-4 h-4 mr-2" />
              Optimize Database
            </Button>
            <Button variant="outline">
              <Activity className="w-4 h-4 mr-2" />
              Run Diagnostics
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Generate System Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            System Information
          </CardTitle>
          <CardDescription>View system details and version info</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <InfoRow label="FlowForge Version" value="2.5.0" />
            <InfoRow label="Database Version" value="PostgreSQL 14.5" />
            <InfoRow label="Server Location" value="US East (Ohio)" />
            <InfoRow label="Last System Update" value="Feb 15, 2026" />
            <InfoRow label="License Type" value="Professional" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function StatCard({ icon: Icon, label, value, color, trend }: any) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-100 to-${color}-200 flex items-center justify-center shadow-sm`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-600">{label}</div>
              {trend && <div className="text-xs text-gray-500 mt-1">{trend}</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SettingRow({ icon: Icon, title, description, enabled, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <div>
          <div className="font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
  );
}

function InfoRow({ label, value }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm text-gray-900 font-semibold">{value}</span>
    </div>
  );
}