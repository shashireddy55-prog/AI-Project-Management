import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  Shield,
  Users,
  Zap,
  AlertTriangle,
  CheckSquare,
  Lock,
  Globe,
  Bell,
  Calendar,
  Target,
  GitBranch,
  Workflow,
  BarChart3,
  Save,
  X,
  Plus,
  Trash2,
  Edit2,
  Key,
  Database,
  Link2,
  Mail,
  Clock,
  FileText,
  Upload,
  ArrowLeft,
  ListChecks
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { CustomFieldsManagement } from './CustomFieldsManagement';

interface WorkspaceSettingsProps {
  workspace: any;
  currentUserRole?: string;
  onSave?: (settings: any) => void;
  onBack?: () => void;
  accessToken?: string;
}

export function WorkspaceSettings({ 
  workspace, 
  currentUserRole = 'admin', 
  onSave,
  onBack,
  accessToken
}: WorkspaceSettingsProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [settingsData, setSettingsData] = useState({
    general: {
      name: workspace.workspace?.name || '',
      description: workspace.workspace?.description || '',
      key: workspace.workspace?.key || '',
      visibility: 'private',
      defaultAssignee: 'unassigned',
    },
    methodology: {
      type: workspace.methodology?.type || 'scrum',
      estimationModel: workspace.methodology?.estimationModel || 'story_points',
      sprintDuration: workspace.methodology?.sprintCadence?.duration || 2,
      startDay: workspace.methodology?.sprintCadence?.startDay || 'Monday',
    },
    workflow: {
      states: ['To Do', 'In Progress', 'In Review', 'Done'],
      allowCustomStates: true,
    },
    notifications: {
      emailNotifications: true,
      slackNotifications: false,
      assignmentNotifications: true,
      sprintNotifications: true,
      mentionNotifications: true,
    },
    permissions: {
      allowGuestAccess: false,
      requireApprovalForEpics: true,
      allowMembersToCreateSprints: false,
      allowMembersToInvite: true,
    },
    automation: {
      autoAssignIssues: false,
      autoCloseCompletedSprints: true,
      autoArchiveOldIssues: false,
      archiveAfterDays: 90,
    },
    integrations: {
      github: false,
      slack: false,
      jira: false,
      confluence: false,
    },
  });

  // Check if user is admin
  useEffect(() => {
    // In production, this would check against the backend
    // For now, we'll use the prop or default to admin for demo
    const checkAdminAccess = async () => {
      // Simulate API call to check user role
      const userIsAdmin = currentUserRole === 'admin' || currentUserRole === 'owner';
      setIsAdmin(userIsAdmin);
      
      if (!userIsAdmin) {
        toast.error('Access Denied', {
          description: 'Only workspace administrators can access settings.',
          duration: 5000
        });
      }
    };
    
    checkAdminAccess();
  }, [currentUserRole]);

  // Update settings data when workspace prop changes
  useEffect(() => {
    if (workspace) {
      console.log('📝 Updating WorkspaceSettings with workspace data:', workspace);
      console.log('   workspace.workspace?.name:', workspace.workspace?.name);
      console.log('   workspace.name:', workspace.name);
      console.log('   workspace.workspace?.description:', workspace.workspace?.description);
      console.log('   workspace.description:', workspace.description);
      console.log('   workspace.workspace?.key:', workspace.workspace?.key);
      console.log('   workspace.key:', workspace.key);
      
      setSettingsData({
        general: {
          name: workspace.workspace?.name || workspace.name || '',
          description: workspace.workspace?.description || workspace.description || '',
          key: workspace.workspace?.key || workspace.key || '',
          visibility: workspace.workspace?.visibility || 'private',
          defaultAssignee: workspace.workspace?.defaultAssignee || 'unassigned',
        },
        methodology: {
          type: workspace.methodology?.type || 'scrum',
          estimationModel: workspace.methodology?.estimationModel || 'story_points',
          sprintDuration: workspace.methodology?.sprintCadence?.duration || workspace.methodology?.sprintDuration || 2,
          startDay: workspace.methodology?.sprintCadence?.startDay || workspace.methodology?.startDay || 'Monday',
        },
        workflow: {
          states: workspace.workflow?.states || ['To Do', 'In Progress', 'In Review', 'Done'],
          allowCustomStates: workspace.workflow?.allowCustomStates ?? true,
        },
        notifications: {
          emailNotifications: workspace.notifications?.emailNotifications ?? true,
          slackNotifications: workspace.notifications?.slackNotifications ?? false,
          assignmentNotifications: workspace.notifications?.assignmentNotifications ?? true,
          sprintNotifications: workspace.notifications?.sprintNotifications ?? true,
          mentionNotifications: workspace.notifications?.mentionNotifications ?? true,
        },
        permissions: {
          allowGuestAccess: workspace.permissions?.allowGuestAccess ?? false,
          requireApprovalForEpics: workspace.permissions?.requireApprovalForEpics ?? true,
          allowMembersToCreateSprints: workspace.permissions?.allowMembersToCreateSprints ?? false,
          allowMembersToInvite: workspace.permissions?.allowMembersToInvite ?? true,
        },
        automation: {
          autoAssignIssues: workspace.automation?.autoAssignIssues ?? false,
          autoCloseCompletedSprints: workspace.automation?.autoCloseCompletedSprints ?? true,
          autoArchiveOldIssues: workspace.automation?.autoArchiveOldIssues ?? false,
          archiveAfterDays: workspace.automation?.archiveAfterDays ?? 90,
        },
        integrations: {
          github: workspace.integrations?.github ?? false,
          slack: workspace.integrations?.slack ?? false,
          jira: workspace.integrations?.jira ?? false,
          confluence: workspace.integrations?.confluence ?? false,
        },
      });
    }
  }, [workspace]);

  const handleSaveSettings = async () => {
    if (!isAdmin) {
      toast.error('Access Denied', {
        description: 'Only workspace administrators can modify settings.'
      });
      return;
    }
    
    try {
      if (onSave) {
        await onSave(settingsData);
      }
      
      // Parent component (WorkspaceView) will handle success notification and closing
      // No need for success toast here since WorkspaceView shows it
    } catch (error) {
      // Only show error if parent doesn't handle it
      // Most errors should be caught and handled by the parent component
      console.error('Error in handleSaveSettings:', error);
    }
  };

  const handleInputChange = (section: string, field: string, value: any) => {
    setSettingsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // If not admin, show access denied message
  if (!isAdmin) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Access Restricted</CardTitle>
            <CardDescription className="text-base">
              You need workspace administrator privileges to access these settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Please contact your workspace owner or administrator for access.
            </p>
            {onBack && (
              <Button onClick={onBack} variant="outline" className="w-full">
                <X className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50 relative">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pb-24">
        <div className="p-6 max-w-5xl mx-auto">{/* Removed bottom padding */}
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {onBack && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6" style={{ color: '#FCA311' }} />
                    Workspace Settings
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Configure workspace preferences, permissions, and integrations
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                <Shield className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <div className="overflow-x-auto pb-2">
              <TabsList className="inline-flex w-auto min-w-full bg-gray-100 p-1 rounded-lg gap-1">
                <TabsTrigger value="general" className="text-sm whitespace-nowrap px-4">
                  <Settings className="w-4 h-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger value="methodology" className="text-sm whitespace-nowrap px-4">
                  <Target className="w-4 h-4 mr-2" />
                  Methodology
                </TabsTrigger>
                <TabsTrigger value="workflow" className="text-sm whitespace-nowrap px-4">
                  <Workflow className="w-4 h-4 mr-2" />
                  Workflow
                </TabsTrigger>
                <TabsTrigger value="permissions" className="text-sm whitespace-nowrap px-4">
                  <Shield className="w-4 h-4 mr-2" />
                  Permissions
                </TabsTrigger>
                <TabsTrigger value="notifications" className="text-sm whitespace-nowrap px-4">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="automation" className="text-sm whitespace-nowrap px-4">
                  <Zap className="w-4 h-4 mr-2" />
                  Automation
                </TabsTrigger>
                <TabsTrigger value="integrations" className="text-sm whitespace-nowrap px-4">
                  <Link2 className="w-4 h-4 mr-2" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger value="custom-fields" className="text-sm whitespace-nowrap px-4">
                  <ListChecks className="w-4 h-4 mr-2" />
                  Custom Fields
                </TabsTrigger>
              </TabsList>
            </div>

            {/* General Settings */}
            <TabsContent value="general" className="space-y-6 bg-white p-6 rounded-lg">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update workspace name, description, and basic settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      value={settingsData.general.name}
                      onChange={(e) => handleInputChange('general', 'name', e.target.value)}
                      placeholder="Enter workspace name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workspace-description">Description</Label>
                    <Textarea
                      id="workspace-description"
                      value={settingsData.general.description}
                      onChange={(e) => handleInputChange('general', 'description', e.target.value)}
                      placeholder="Describe the purpose of this workspace"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workspace-key" className="flex items-center gap-2">
                      <Key className="w-4 h-4" style={{ color: '#FCA311' }} />
                      Workspace Key
                    </Label>
                    <Input
                      id="workspace-key"
                      value={settingsData.general.key}
                      onChange={(e) => {
                        // Convert to uppercase and allow only letters and numbers
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                        handleInputChange('general', 'key', value);
                      }}
                      placeholder="MOB"
                      maxLength={10}
                      className="font-mono font-bold text-lg"
                    />
                    <div className="space-y-2 mt-2">
                      <p className="text-xs text-gray-600">
                        This unique key will be used as a prefix for all tickets in this workspace.
                      </p>
                      {settingsData.general.key && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="text-xs font-medium text-blue-900 mb-1">Ticket ID Preview:</div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="font-mono font-semibold" style={{ borderColor: '#FCA311', color: '#14213D' }}>
                              {settingsData.general.key}-1
                            </Badge>
                            <Badge variant="outline" className="font-mono font-semibold" style={{ borderColor: '#FCA311', color: '#14213D' }}>
                              {settingsData.general.key}-2
                            </Badge>
                            <Badge variant="outline" className="font-mono font-semibold" style={{ borderColor: '#FCA311', color: '#14213D' }}>
                              {settingsData.general.key}-3
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visibility">Workspace Visibility</Label>
                    <Select
                      value={settingsData.general.visibility}
                      onValueChange={(value) => handleInputChange('general', 'visibility', value)}
                    >
                      <SelectTrigger id="visibility">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Private - Only invited members
                          </div>
                        </SelectItem>
                        <SelectItem value="organization">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Organization - All organization members
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Public - Anyone with the link
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-assignee">Default Assignee</Label>
                    <Select
                      value={settingsData.general.defaultAssignee}
                      onValueChange={(value) => handleInputChange('general', 'defaultAssignee', value)}
                    >
                      <SelectTrigger id="default-assignee">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        <SelectItem value="creator">Issue Creator</SelectItem>
                        <SelectItem value="project-lead">Project Lead</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Methodology Settings */}
            <TabsContent value="methodology" className="space-y-6 bg-white p-6 rounded-lg">
              <Card>
                <CardHeader>
                  <CardTitle>Project Methodology</CardTitle>
                  <CardDescription>
                    Configure your team's agile methodology and estimation approach
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="methodology-type">Methodology Type</Label>
                    <Select
                      value={settingsData.methodology.type}
                      onValueChange={(value) => handleInputChange('methodology', 'type', value)}
                    >
                      <SelectTrigger id="methodology-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scrum">Scrum</SelectItem>
                        <SelectItem value="kanban">Kanban</SelectItem>
                        <SelectItem value="scrumban">Scrumban</SelectItem>
                        <SelectItem value="waterfall">Waterfall</SelectItem>
                        <SelectItem value="agile">Agile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimation-model">Estimation Model</Label>
                    <Select
                      value={settingsData.methodology.estimationModel}
                      onValueChange={(value) => handleInputChange('methodology', 'estimationModel', value)}
                    >
                      <SelectTrigger id="estimation-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="story_points">Story Points</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="t-shirt">T-Shirt Sizes</SelectItem>
                        <SelectItem value="fibonacci">Fibonacci</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sprint-duration">Sprint Duration (weeks)</Label>
                      <Input
                        id="sprint-duration"
                        type="number"
                        min="1"
                        max="4"
                        value={settingsData.methodology.sprintDuration}
                        onChange={(e) => handleInputChange('methodology', 'sprintDuration', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sprint-start-day">Sprint Start Day</Label>
                      <Select
                        value={settingsData.methodology.startDay}
                        onValueChange={(value) => handleInputChange('methodology', 'startDay', value)}
                      >
                        <SelectTrigger id="sprint-start-day">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monday">Monday</SelectItem>
                          <SelectItem value="Tuesday">Tuesday</SelectItem>
                          <SelectItem value="Wednesday">Wednesday</SelectItem>
                          <SelectItem value="Thursday">Thursday</SelectItem>
                          <SelectItem value="Friday">Friday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Capacity Planning</CardTitle>
                  <CardDescription>
                    Configure team capacity and velocity tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-900">Current Velocity</div>
                        <div className="text-sm text-blue-700 mt-1">
                          {workspace.capacity?.velocity || 25} story points per sprint
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Based on last 3 sprints average
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Workflow Settings */}
            <TabsContent value="workflow" className="space-y-6 bg-white p-6 rounded-lg">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow States</CardTitle>
                  <CardDescription>
                    Customize issue states and workflow transitions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Workflow States</Label>
                    <div className="flex flex-wrap gap-2">
                      {settingsData.workflow.states.map((state, index) => (
                        <Badge key={index} variant="outline" className="gap-1">
                          {state}
                          <button
                            onClick={() => {
                              const newStates = settingsData.workflow.states.filter((_, i) => i !== index);
                              handleInputChange('workflow', 'states', newStates);
                            }}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settingsData.workflow.allowCustomStates}
                        onCheckedChange={(checked) => handleInputChange('workflow', 'allowCustomStates', checked)}
                      />
                      <Label htmlFor="custom-states" className="cursor-pointer">
                        Allow team members to create custom states
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Permissions Settings */}
            <TabsContent value="permissions" className="space-y-6 bg-white p-6 rounded-lg">
              <Card>
                <CardHeader>
                  <CardTitle>Access & Permissions</CardTitle>
                  <CardDescription>
                    Control who can access and modify workspace content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Guest Access</div>
                        <div className="text-sm text-gray-600">Allow external collaborators to view workspace</div>
                      </div>
                      <Switch
                        checked={settingsData.permissions.allowGuestAccess}
                        onCheckedChange={(checked) => handleInputChange('permissions', 'allowGuestAccess', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Epic Approval Required</div>
                        <div className="text-sm text-gray-600">Require admin approval before creating epics</div>
                      </div>
                      <Switch
                        checked={settingsData.permissions.requireApprovalForEpics}
                        onCheckedChange={(checked) => handleInputChange('permissions', 'requireApprovalForEpics', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Members Can Create Sprints</div>
                        <div className="text-sm text-gray-600">Allow all members to plan and create sprints</div>
                      </div>
                      <Switch
                        checked={settingsData.permissions.allowMembersToCreateSprints}
                        onCheckedChange={(checked) => handleInputChange('permissions', 'allowMembersToCreateSprints', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Members Can Invite</div>
                        <div className="text-sm text-gray-600">Allow members to invite new team members</div>
                      </div>
                      <Switch
                        checked={settingsData.permissions.allowMembersToInvite}
                        onCheckedChange={(checked) => handleInputChange('permissions', 'allowMembersToInvite', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Role Management</CardTitle>
                  <CardDescription>
                    Define workspace roles and their permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">Owner</div>
                          <div className="text-xs text-gray-600">Full workspace control</div>
                        </div>
                      </div>
                      <Badge style={{ background: '#14213D', color: 'white' }}>1 member</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Key className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Admin</div>
                          <div className="text-xs text-gray-600">Manage settings & members</div>
                        </div>
                      </div>
                      <Badge variant="outline">2 members</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Member</div>
                          <div className="text-xs text-gray-600">Create & edit issues</div>
                        </div>
                      </div>
                      <Badge variant="outline">8 members</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Settings */}
            <TabsContent value="notifications" className="space-y-6 bg-white p-6 rounded-lg">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how and when you receive workspace notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5" style={{ color: '#FCA311' }} />
                        <div>
                          <div className="font-medium text-gray-900">Email Notifications</div>
                          <div className="text-sm text-gray-600">Receive updates via email</div>
                        </div>
                      </div>
                      <Switch
                        checked={settingsData.notifications.emailNotifications}
                        onCheckedChange={(checked) => handleInputChange('notifications', 'emailNotifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5" style={{ color: '#FCA311' }} />
                        <div>
                          <div className="font-medium text-gray-900">Slack Notifications</div>
                          <div className="text-sm text-gray-600">Send notifications to Slack</div>
                        </div>
                      </div>
                      <Switch
                        checked={settingsData.notifications.slackNotifications}
                        onCheckedChange={(checked) => handleInputChange('notifications', 'slackNotifications', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base">Notification Types</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="assignment-notif" className="cursor-pointer">
                          Issue assignments
                        </Label>
                        <Switch
                          id="assignment-notif"
                          checked={settingsData.notifications.assignmentNotifications}
                          onCheckedChange={(checked) => handleInputChange('notifications', 'assignmentNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sprint-notif" className="cursor-pointer">
                          Sprint updates
                        </Label>
                        <Switch
                          id="sprint-notif"
                          checked={settingsData.notifications.sprintNotifications}
                          onCheckedChange={(checked) => handleInputChange('notifications', 'sprintNotifications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="mention-notif" className="cursor-pointer">
                          Mentions and comments
                        </Label>
                        <Switch
                          id="mention-notif"
                          checked={settingsData.notifications.mentionNotifications}
                          onCheckedChange={(checked) => handleInputChange('notifications', 'mentionNotifications', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation Settings */}
            <TabsContent value="automation" className="space-y-6 bg-white p-6 rounded-lg">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Automation Rules
                  </CardTitle>
                  <CardDescription>
                    Automate repetitive tasks and workflows
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Auto-assign Issues</div>
                        <div className="text-sm text-gray-600">Automatically assign new issues to team members</div>
                      </div>
                      <Switch
                        checked={settingsData.automation.autoAssignIssues}
                        onCheckedChange={(checked) => handleInputChange('automation', 'autoAssignIssues', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Auto-close Completed Sprints</div>
                        <div className="text-sm text-gray-600">Close sprints automatically when all issues are done</div>
                      </div>
                      <Switch
                        checked={settingsData.automation.autoCloseCompletedSprints}
                        onCheckedChange={(checked) => handleInputChange('automation', 'autoCloseCompletedSprints', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Auto-archive Old Issues</div>
                        <div className="text-sm text-gray-600">Archive completed issues after a set period</div>
                      </div>
                      <Switch
                        checked={settingsData.automation.autoArchiveOldIssues}
                        onCheckedChange={(checked) => handleInputChange('automation', 'autoArchiveOldIssues', checked)}
                      />
                    </div>
                    {settingsData.automation.autoArchiveOldIssues && (
                      <div className="ml-4 space-y-2">
                        <Label htmlFor="archive-days">Archive after (days)</Label>
                        <Input
                          id="archive-days"
                          type="number"
                          min="30"
                          max="365"
                          value={settingsData.automation.archiveAfterDays}
                          onChange={(e) => handleInputChange('automation', 'archiveAfterDays', parseInt(e.target.value))}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>

                  {workspace.automation?.rules?.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <Label className="text-base">Active Automation Rules</Label>
                        {workspace.automation.rules.map((rule: any, index: number) => (
                          <div key={index} className="flex items-start justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{rule.name}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                Trigger: <code className="text-xs bg-white px-1 rounded">{rule.trigger}</code> → 
                                Action: <code className="text-xs bg-white px-1 rounded ml-1">{rule.action}</code>
                              </div>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Active</Badge>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations Settings */}
            <TabsContent value="integrations" className="space-y-6 bg-white p-6 rounded-lg">
              <Card>
                <CardHeader>
                  <CardTitle>External Integrations</CardTitle>
                  <CardDescription>
                    Connect your workspace with external tools and services
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">GitHub</div>
                            <div className="text-xs text-gray-600">Source control</div>
                          </div>
                        </div>
                        <Switch
                          checked={settingsData.integrations.github}
                          onCheckedChange={(checked) => handleInputChange('integrations', 'github', checked)}
                        />
                      </div>
                      {settingsData.integrations.github && (
                        <div className="text-xs text-gray-600 bg-green-50 border border-green-200 rounded p-2">
                          ✓ Connected to organization/repo
                        </div>
                      )}
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium">Slack</div>
                            <div className="text-xs text-gray-600">Team chat</div>
                          </div>
                        </div>
                        <Switch
                          checked={settingsData.integrations.slack}
                          onCheckedChange={(checked) => handleInputChange('integrations', 'slack', checked)}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                            J
                          </div>
                          <div>
                            <div className="font-medium">Jira</div>
                            <div className="text-xs text-gray-600">Issue tracking</div>
                          </div>
                        </div>
                        <Switch
                          checked={settingsData.integrations.jira}
                          onCheckedChange={(checked) => handleInputChange('integrations', 'jira', checked)}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold">
                            C
                          </div>
                          <div>
                            <div className="font-medium">Confluence</div>
                            <div className="text-xs text-gray-600">Documentation</div>
                          </div>
                        </div>
                        <Switch
                          checked={settingsData.integrations.confluence}
                          onCheckedChange={(checked) => handleInputChange('integrations', 'confluence', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {workspace.integrations?.recommended && workspace.integrations.recommended.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-base mb-3 block">Recommended Integrations</Label>
                        <div className="flex gap-2 flex-wrap">
                          {workspace.integrations.recommended.map((integration: string, i: number) => (
                            <Badge key={i} variant="outline" className="gap-1" style={{ borderColor: '#FCA311', color: '#14213D' }}>
                              <Plus className="w-3 h-3" />
                              {integration}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custom Fields Settings */}
            <TabsContent value="custom-fields" className="space-y-6 bg-white p-6 rounded-lg">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#14213D' }}>Custom Fields</h2>
                <p className="text-gray-600 mb-6">
                  Add and manage custom fields for issues and epics
                </p>
                <CustomFieldsManagement workspaceId={workspace.id} accessToken={accessToken} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Add bottom padding to prevent content from being hidden behind the sticky footer */}
          <div className="h-20"></div>
        </div>
      </div>

      {/* Fixed Footer with Action Buttons - Always visible at bottom */}
      <div className="fixed bottom-0 left-0 right-0 border-t-2 bg-white px-6 py-5 shadow-2xl z-50" style={{ borderTopColor: '#E5E5E5' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="px-6 py-2 text-base"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSaveSettings}
            className="text-white px-8 py-2 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
            style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)' }}
          >
            <Save className="w-5 h-5 mr-2" style={{ color: '#FCA311' }} />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}