import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Layers,
  BookOpen,
  CheckSquare,
  Calendar,
  TrendingUp,
  Users,
  Target,
  Workflow,
  AlertTriangle,
  BarChart3,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  FolderKanban,
  GitBranch,
  Zap,
  Shield,
  Link2,
  FileText,
  Filter,
  Search,
  Sparkles,
  Ticket
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
// Tabs component removed - using sidebar navigation instead
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { HierarchyDiagram } from './HierarchyDiagram';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import { CreateEpicModal } from './CreateEpicModal';
import { CreateStoryModal } from './CreateStoryModal';
import { CreateSprintModal } from './CreateSprintModal';
import { AICommandInput } from './AICommandInput';
import { WorkspaceSettings } from './WorkspaceSettings';
import { BoardConfigModal } from './BoardConfigModal';
import { EpicsListView } from './EpicsListView';
import { TicketsListView } from './TicketsListView';
import { TimelineGantt } from './TimelineGantt';
import { SprintDetailView } from './SprintDetailView';
import { IntelligenceDashboard } from './IntelligenceDashboard';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface WorkspaceViewProps {
  workspace: any;
  onBack: () => void;
  onWorkspaceUpdate?: (updatedWorkspace: any) => void;
}

// Helper function to extract workspace ID from any structure
function extractWorkspaceId(workspace: any, workspaceData: any): string | null {
  if (!workspace && !workspaceData) return null;
  
  // Try all possible locations
  const possibleIds = [
    workspace?.workspace?.id,
    workspace?.id,
    workspaceData?.workspace?.id,
    workspaceData?.id,
  ];
  
  // Return first non-null ID
  for (const id of possibleIds) {
    if (id && typeof id === 'string' && id.trim() !== '') {
      return id;
    }
  }
  
  // Fallback: Generate ID from workspace name for demo workspaces
  const workspaceName = workspace?.workspace?.name || workspaceData?.workspace?.name;
  if (workspaceName) {
    // Create a deterministic ID from the workspace name
    const generatedId = `demo-${workspaceName.toLowerCase().replace(/\s+/g, '-')}`;
    console.warn(`⚠️ No workspace ID found, generating demo ID: ${generatedId}`);
    return generatedId;
  }
  
  return null;
}

export function WorkspaceView({ workspace, onBack, onWorkspaceUpdate }: WorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateEpicModal, setShowCreateEpicModal] = useState(false);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [showCreateSprintModal, setShowCreateSprintModal] = useState(false);
  const [selectedEpicId, setSelectedEpicId] = useState<string>('');
  const [workspaceData, setWorkspaceData] = useState(workspace);
  const [showAICommand, setShowAICommand] = useState(false);
  const [aiCommandContext, setAICommandContext] = useState<'workspace' | 'board' | 'dashboard' | 'report' | 'ticket' | 'user' | 'general'>('ticket');
  const [isGenerating, setIsGenerating] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('admin'); // Default to admin for demo
  const [showSettingsView, setShowSettingsView] = useState(false);
  const [showBoardConfigModal, setShowBoardConfigModal] = useState(false);
  const [showEpicsListView, setShowEpicsListView] = useState(false);
  const [showTicketsListView, setShowTicketsListView] = useState(false);
  const [showTimelineView, setShowTimelineView] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<any>(null);
  const [showSprintDetailView, setShowSprintDetailView] = useState(false);

  // Update workspaceData when workspace prop changes
  useEffect(() => {
    console.log('🔍 Workspace prop changed:', workspace);
    const extractedId = extractWorkspaceId(workspace, workspace);
    console.log('🔍 Extracted ID:', extractedId);
    
    // If workspace doesn't have an ID, add it
    if (extractedId && !workspace?.id && !workspace?.workspace?.id) {
      const updatedWorkspace = {
        ...workspace,
        id: extractedId,
        workspace: {
          ...workspace.workspace,
          id: extractedId,
          key: workspace.workspace?.key || workspace.workspace?.name?.substring(0, 3).toUpperCase() || 'WRK'
        }
      };
      console.log('✅ Added missing ID to workspace:', updatedWorkspace);
      setWorkspaceData(updatedWorkspace);
    } else {
      setWorkspaceData(workspace);
    }
  }, [workspace]);

  // Get access token on mount
  useEffect(() => {
    const getToken = async () => {
      const { getSupabaseClient } = await import('/utils/supabase/client');
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
      }
    };
    getToken();
  }, []);

  // Handler functions for all actions
  const handleSettingsClick = () => {
    toast.success('Opening Workspace Settings', {
      description: 'Configure workspace preferences and permissions'
    });
    setShowSettingsView(true);
  };

  const handleConfigurationClick = () => {
    toast.success('Opening Board Configuration', {
      description: 'Configure board display and behavior settings'
    });
    setShowBoardConfigModal(true);
  };

  const handleAddStory = () => {
    setSelectedEpicId('');
    setShowCreateStoryModal(true);
  };

  const handleAddEpic = () => {
    setShowCreateEpicModal(true);
  };

  const handleFilterClick = () => {
    toast.info('Filter Options', {
      description: 'Opening filter menu to refine backlog items...'
    });
  };

  const handleCreateSprint = () => {
    setShowCreateSprintModal(true);
  };

  const handleEditEpic = (epicId: string, epicTitle: string) => {
    toast.info('Edit Epic', {
      description: `Opening editor for "${epicTitle}"`
    });
  };

  const handleAddStoryToEpic = (epicId: string, epicTitle: string) => {
    setSelectedEpicId(epicId);
    setShowCreateStoryModal(true);
  };

  const handleDeleteEpic = (epicId: string, epicTitle: string) => {
    toast.error('Delete Epic', {
      description: `Are you sure you want to delete "${epicTitle}"? This action cannot be undone.`,
      duration: 5000
    });
  };

  const handleConnectIntegration = (integration: string) => {
    toast.success(`Connect ${integration}`, {
      description: `Opening ${integration} integration setup...`
    });
  };

  // Handler for clicking stats cards
  const handleStatsCardClick = (type: string) => {
    switch(type) {
      case 'programs':
        toast.info('Programs View', {
          description: 'Showing all programs in this workspace'
        });
        setActiveTab('overview');
        break;
      case 'projects':
        toast.info('Projects View', {
          description: 'Showing all projects in this workspace'
        });
        setActiveTab('overview');
        break;
      case 'epics':
        console.log('=== EPICS BUTTON CLICKED ===');
        console.log('Workspace object:', workspace);
        console.log('Workspace data state:', workspaceData);
        console.log('Workspace backlog:', workspaceData?.backlog);
        console.log('Workspace epics:', workspaceData?.backlog?.epics);
        console.log('Epics count:', workspaceData?.backlog?.epics?.length);
        console.log('=== END EPICS DEBUG ===');
        
        toast.info('Epics View', {
          description: `Showing all ${workspaceData.stats?.epics || 0} epics`
        });
        setShowEpicsListView(true);
        break;
      case 'tickets':
        toast.info('Tickets View', {
          description: `Showing all tickets (epics, stories, subtasks)`
        });
        setShowTicketsListView(true);
        break;
      case 'subtasks':
      case 'timeline':
        toast.info('Timeline View', {
          description: `Viewing project timeline and task dependencies`
        });
        setShowTimelineView(true);
        break;
      case 'velocity':
        toast.info('Velocity Chart', {
          description: `Team velocity: ${workspace.capacity?.velocity || 0} points per sprint`
        });
        setActiveTab('sprints');
        break;
      default:
        break;
    }
  };

  const toggleEpic = (epicId: string) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId);
    } else {
      newExpanded.add(epicId);
    }
    setExpandedEpics(newExpanded);
  };

  const toggleStory = (storyId: string) => {
    const newExpanded = new Set(expandedStories);
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId);
    } else {
      newExpanded.add(storyId);
    }
    setExpandedStories(newExpanded);
  };

  // Get methodology badge color
  const getMethodologyColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'scrum': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'kanban': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'hybrid': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Menu items configuration
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'backlog', label: 'Backlog', icon: Layers },
    { id: 'board', label: 'Board', icon: Workflow },
    { id: 'sprints', label: 'Sprints', icon: GitBranch },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Show full-screen epics list view when activated */}
      {showEpicsListView ? (
        <EpicsListView
          workspace={workspaceData}
          onBack={() => setShowEpicsListView(false)}
          onEditEpic={handleEditEpic}
          onDeleteEpic={handleDeleteEpic}
          onAddStoryToEpic={handleAddStoryToEpic}
          onCreateEpic={handleAddEpic}
        />
      ) : showTicketsListView ? (
        <TicketsListView
          workspace={workspaceData}
          onBack={() => setShowTicketsListView(false)}
          onEditTicket={(ticketId, ticketTitle, ticketType) => {
            toast.info('Edit Ticket', {
              description: `Editing ${ticketType}: ${ticketId} - ${ticketTitle}`
            });
          }}
          onDeleteTicket={(ticketId, ticketTitle, ticketType) => {
            toast.error('Delete Ticket', {
              description: `Deleting ${ticketType}: ${ticketId} - ${ticketTitle}`
            });
          }}
          onCreateTicket={() => {
            toast.info('Create Ticket', {
              description: 'Create a new ticket (Epic, Story, or Subtask)'
            });
          }}
        />
      ) : showSprintDetailView && selectedSprint ? (
        <SprintDetailView
          sprint={selectedSprint}
          workspace={workspaceData}
          onBack={() => {
            setShowSprintDetailView(false);
            setSelectedSprint(null);
          }}
        />
      ) : showTimelineView ? (
        <div className="h-screen flex flex-col bg-white">
          {/* Back Button Header */}
          <div className="flex items-center gap-3 px-6 py-3 border-b bg-white" style={{ borderColor: '#E5E5E5' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimelineView(false)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Workspace
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm font-medium text-gray-600">{workspaceData.name}</span>
          </div>

          {/* Timeline Content - Full Height */}
          <div className="flex-1 overflow-hidden">
            <TimelineGantt workspace={workspaceData} />
          </div>
        </div>
      ) : showSettingsView ? (
        <WorkspaceSettings
          workspace={workspace}
          currentUserRole={currentUserRole}
          onSave={async (settings) => {
            console.log('=== SAVE SETTINGS DEBUG ===');
            console.log('Workspace settings:', settings);
            console.log('workspaceData:', workspaceData);
            console.log('workspace prop:', workspace);
            console.log('workspaceData type:', typeof workspaceData);
            console.log('workspace type:', typeof workspace);
            
            // Use helper function to extract workspace ID
            const wsId = extractWorkspaceId(workspace, workspaceData);
            console.log('Extracted workspace ID:', wsId);
            console.log('=== END DEBUG ===');
            
            if (!wsId) {
              console.error('ERROR: No workspace ID found!');
              console.error('Workspace data structure:', JSON.stringify({
                workspaceKeys: Object.keys(workspaceData || {}),
                workspaceProps: Object.keys(workspace || {}),
                workspaceDataWorkspace: workspaceData?.workspace,
                workspaceWorkspace: workspace?.workspace
              }, null, 2));
              
              toast.error('Error', {
                description: 'Workspace ID not found. Please open the workspace from the dashboard and try again.'
              });
              throw new Error('Workspace ID not found');
            }
            
            // Check if this is a demo workspace (from sidebar)
            const isDemoWorkspace = wsId.startsWith('demo-') || wsId.startsWith('workspace-');
            
            if (isDemoWorkspace) {
              // Demo workspace - just update local state without backend call
              console.log('📝 Demo workspace detected - updating local state only');
              toast.success('Settings Updated (Demo Mode)', {
                description: 'Settings saved locally. Note: This is a demo workspace from the sidebar.'
              });
            } else {
              // Real workspace - call backend to update workspace settings
              try {
                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspace/${wsId}/settings`,
                  {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`,
                      'X-Access-Token': accessToken || ''
                    },
                    body: JSON.stringify(settings)
                  }
                );

                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  throw new Error(errorData.error || 'Failed to update workspace settings');
                }

                toast.success('Settings Updated', {
                  description: 'Workspace settings have been saved successfully.'
                });
              } catch (error) {
                console.error('Error updating settings:', error);
                toast.error('Update Failed', {
                  description: error instanceof Error ? error.message : 'Failed to save workspace settings.'
                });
                // Re-throw error so WorkspaceSettings component can handle it
                throw error;
              }
            }
            
            // Update workspace data with new settings
            setWorkspaceData(prev => ({
              ...prev,
              workspace: {
                ...prev.workspace,
                name: settings.general.name,
                description: settings.general.description,
                key: settings.general.key,
              },
              methodology: {
                ...prev.methodology,
                type: settings.methodology.type,
                estimationModel: settings.methodology.estimationModel,
              },
            }));
          }}
          onBack={() => setShowSettingsView(false)}
        />
      ) : (
        <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {workspace.workspace?.name || 'Workspace'}
                  </h1>
                  <Badge className={getMethodologyColor(workspace.methodology?.type)}>
                    {workspace.methodology?.type?.toUpperCase() || 'SCRUM'}
                  </Badge>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    <Zap className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                  {/* Role Badge - Click to change for demo purposes */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="cursor-pointer hover:opacity-80 transition-opacity p-0 h-auto border-0"
                      >
                        <Badge 
                          style={{ 
                            background: currentUserRole === 'admin' || currentUserRole === 'owner' 
                              ? '#14213D' 
                              : '#6B7280',
                            color: 'white'
                          }}
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {currentUserRole === 'admin' ? 'Admin' : currentUserRole === 'owner' ? 'Owner' : 'Member'}
                        </Badge>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setCurrentUserRole('owner');
                        toast.info('Role changed to Owner', {
                          description: 'You now have full access to all settings'
                        });
                      }}>
                        <Shield className="w-4 h-4 mr-2 text-purple-600" />
                        Owner
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setCurrentUserRole('admin');
                        toast.info('Role changed to Admin', {
                          description: 'You can access workspace settings'
                        });
                      }}>
                        <Shield className="w-4 h-4 mr-2 text-blue-600" />
                        Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setCurrentUserRole('member');
                        toast.warning('Role changed to Member', {
                          description: 'Settings access is now restricted'
                        });
                      }}>
                        <Users className="w-4 h-4 mr-2 text-gray-600" />
                        Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {workspace.workspace?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={handleSettingsClick}>
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white gap-2" onClick={handleAddStory}>
                <Plus className="w-4 h-4" />
                Add Story
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-6 gap-4">
            {workspace.stats?.programs > 0 && (
              <div 
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200" 
                onClick={() => handleStatsCardClick('programs')}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FolderKanban className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">Programs</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">{workspace.stats.programs}</div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Sidebar Menu */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Navigation</h3>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-[#14213D] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#FCA311]' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="h-full">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* All Content - Left Aligned */}
                <div className="max-w-4xl space-y-6">
                  {/* AI Intelligence Dashboard */}
                  {workspaceData?.id && (
                    <IntelligenceDashboard
                      workspaceId={workspaceData.id}
                      sprints={workspaceData?.sprints || []}
                      userId="current-user"
                      accessToken={accessToken}
                      projects={workspaceData?.projects || []}
                      epics={workspaceData?.epics || []}
                      stories={workspaceData?.stories || []}
                    />
                  )}

                  {/* Workspace Information Section */}
                  <div className="space-y-6">
                    {/* Project Hierarchy */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="w-5 h-5 text-blue-600" />
                          Project Hierarchy
                        </CardTitle>
                        <CardDescription>
                          Complete structure from programs to subtasks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <HierarchyDiagram stats={workspace.stats || {}} />
                      </CardContent>
                    </Card>

                    {/* Methodology & Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          Methodology & Configuration
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Methodology</div>
                            <Badge className={getMethodologyColor(workspace.methodology?.type)}>
                              {workspace.methodology?.type?.toUpperCase() || 'SCRUM'}
                            </Badge>
                            <p className="text-xs text-gray-600 mt-2">
                              {workspace.methodology?.reasoning || 'Agile methodology for iterative development'}
                            </p>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Estimation Model</div>
                            <Badge className="bg-cyan-100 text-cyan-700 border-cyan-300">
                              {workspace.methodology?.estimationModel?.replace('_', ' ').toUpperCase() || 'STORY POINTS'}
                            </Badge>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Sprint Cadence</div>
                            <div className="text-lg font-bold text-blue-600">
                              {workspace.methodology?.sprintCadence || 2} Weeks
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Team Capacity</div>
                            <div className="text-lg font-bold text-green-600">
                              {workspace.capacity?.totalPoints || 0} Points
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Workflow States */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Workflow className="w-5 h-5 text-blue-600" />
                          Workflow States
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 flex-wrap">
                          {workspace.workflow?.states?.map((state: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <Badge variant="outline" className="border-gray-300">
                                {state}
                              </Badge>
                              {index < (workspace.workflow?.states?.length || 0) - 1 && (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Industry */}
                    {workspace.industry && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Industry</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-600">Domain</div>
                            <div className="font-semibold text-gray-900">
                              {workspace.industry.domain || 'Technology'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Sector</div>
                            <div className="font-semibold text-gray-900">
                              {workspace.industry.sector || 'Software'}
                            </div>
                          </div>
                          {workspace.industry.keywords?.length > 0 && (
                            <div>
                              <div className="text-xs text-gray-600 mb-2">Keywords</div>
                              <div className="flex flex-wrap gap-1">
                                {workspace.industry.keywords.map((keyword: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Roles */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Team Roles
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {workspace.roles?.map((role: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">{role.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {role.permissions?.[0] || 'view'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Issue Types */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Issue Types
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {workspace.issueTypes?.map((type: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded bg-${type.color}-100 flex items-center justify-center`}>
                                <span className="text-xs">📋</span>
                              </div>
                              <span className="text-sm text-gray-700">{type.name}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Integrations */}
                    {workspace.integrations?.recommended?.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Link2 className="w-4 h-4" />
                            Recommended Integrations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {workspace.integrations.recommended.map((integration: string, i: number) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-sm text-gray-700">{integration}</span>
                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleConnectIntegration(integration)}>
                                  Connect
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
            </div>
          )}

          {/* Backlog */}
          {activeTab === 'backlog' && (
            <div className="h-full">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                <div className="max-w-4xl space-y-4">
                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search epics, stories, subtasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="gap-2" onClick={handleFilterClick}>
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                  <Button className="gap-2" style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)', color: 'white' }} onClick={handleAddEpic}>
                    <Plus className="w-4 h-4" style={{ color: '#FCA311' }} />
                    Add Epic
                  </Button>
                </div>

                {/* Empty State */}
                {(!workspace.backlog?.epics || workspace.backlog.epics.length === 0) && (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(252, 163, 17, 0.1)' }}>
                        <Layers className="w-10 h-10" style={{ color: '#FCA311' }} />
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#000000' }}>
                        No Backlog Items Yet
                      </h3>
                      <p className="text-gray-600 text-center mb-6 max-w-md">
                        Start building your product backlog by creating epics, user stories, and tasks. 
                        Use AI to generate structured work items automatically.
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          className="gap-2" 
                          style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)', color: 'white' }}
                          onClick={handleAddEpic}
                        >
                          <Plus className="w-4 h-4" style={{ color: '#FCA311' }} />
                          Create First Epic
                        </Button>
                        <Button 
                          variant="outline" 
                          className="gap-2"
                          onClick={handleAddStory}
                        >
                          <BookOpen className="w-4 h-4" />
                          Create Story
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Backlog Hierarchy */}
                <div className="space-y-4">{workspace.backlog?.epics?.map((epic: any) => (
                    <Card key={epic.id} className="overflow-hidden">
                      <div
                        className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b cursor-pointer hover:from-indigo-100 hover:to-purple-100 transition-colors"
                        onClick={() => toggleEpic(epic.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <button className="mt-1">
                              {expandedEpics.has(epic.id) ? (
                                <ChevronDown className="w-5 h-5 text-indigo-600" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-indigo-600" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Layers className="w-5 h-5 text-indigo-600" />
                                <h3 className="font-bold text-gray-900">{epic.title}</h3>
                                {epic.businessValue && (
                                  <Badge className={getPriorityColor(epic.businessValue)}>
                                    {epic.businessValue}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{epic.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-gray-500">
                                  {workspace.backlog?.stories?.filter((s: any) => s.epicId === epic.id).length || 0} stories
                                </span>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditEpic(epic.id, epic.title)}>Edit Epic</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddStoryToEpic(epic.id, epic.title)}>Add Story</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteEpic(epic.id, epic.title)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Stories under Epic */}
                      <AnimatePresence>
                        {expandedEpics.has(epic.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="p-4 space-y-3 bg-white">
                              {workspace.backlog?.stories
                                ?.filter((story: any) => story.epicId === epic.id)
                                .map((story: any) => (
                                  <Card key={story.id} className="border-l-4 border-l-cyan-500">
                                    <div
                                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                      onClick={() => toggleStory(story.id)}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 flex-1">
                                          <button>
                                            {expandedStories.has(story.id) ? (
                                              <ChevronDown className="w-4 h-4 text-cyan-600 mt-1" />
                                            ) : (
                                              <ChevronRight className="w-4 h-4 text-cyan-600 mt-1" />
                                            )}
                                          </button>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <BookOpen className="w-4 h-4 text-cyan-600" />
                                              <h4 className="font-semibold text-gray-900">{story.title}</h4>
                                              {story.priority && (
                                                <Badge variant="outline" className={getPriorityColor(story.priority)}>
                                                  {story.priority}
                                                </Badge>
                                              )}
                                              {story.storyPoints && (
                                                <Badge variant="outline" className="border-blue-300 text-blue-700">
                                                  {story.storyPoints} pts
                                                </Badge>
                                              )}
                                            </div>
                                            <p className="text-sm text-gray-600">{story.description}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Subtasks under Story */}
                                      <AnimatePresence>
                                        {expandedStories.has(story.id) && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 ml-7 space-y-2"
                                          >
                                            {/* Acceptance Criteria */}
                                            {story.acceptanceCriteria && story.acceptanceCriteria.length > 0 && (
                                              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                                <div className="text-xs font-semibold text-green-700 mb-2">
                                                  Acceptance Criteria
                                                </div>
                                                <ul className="space-y-1">
                                                  {story.acceptanceCriteria.map((criteria: string, i: number) => (
                                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                      <CheckSquare className="w-3 h-3 text-green-600 mt-1 flex-shrink-0" />
                                                      <span>{criteria}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            )}

                                            {/* Subtasks */}
                                            {workspace.backlog?.subtasks
                                              ?.filter((subtask: any) => subtask.storyId === story.id)
                                              .map((subtask: any) => (
                                                <div
                                                  key={subtask.id}
                                                  className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors"
                                                >
                                                  <div className="flex items-start gap-2">
                                                    <CheckSquare className="w-4 h-4 text-green-600 mt-0.5" />
                                                    <div className="flex-1">
                                                      <div className="font-medium text-sm text-gray-900">
                                                        {subtask.title}
                                                      </div>
                                                      {subtask.description && (
                                                        <div className="text-xs text-gray-600 mt-1">
                                                          {subtask.description}
                                                        </div>
                                                      )}
                                                      {subtask.estimatedHours && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                          ~{subtask.estimatedHours}h
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </Card>
                                ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                </div>
                </div>
              </div>
            </ScrollArea>
            </div>
          )}

          {/* Board - Kanban Board */}
          {activeTab === 'board' && (
            <div className="h-full">
            <div className="p-6 h-full">
              <div className="max-w-6xl">
                <div className="grid grid-cols-4 gap-4 h-full">
                {workspace.workflow?.states?.map((state: string, index: number) => (
                  <Card key={index} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{state}</span>
                        <Badge variant="outline" className="ml-2">
                          {workspace.backlog?.stories?.filter((s: any) => s.status === state.toUpperCase().replace(' ', '_')).length || 0}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-3">
                      {workspace.backlog?.stories
                        ?.filter((s: any) => s.status === state.toUpperCase().replace(' ', '_'))
                        .map((story: any) => (
                          <Card key={story.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="space-y-2">
                              <div className="font-medium text-sm">{story.title}</div>
                              <div className="flex items-center gap-2">
                                {story.priority && (
                                  <Badge variant="outline" className={`text-xs ${getPriorityColor(story.priority)}`}>
                                    {story.priority}
                                  </Badge>
                                )}
                                {story.storyPoints && (
                                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                    {story.storyPoints} pts
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
              </div>
            </div>
            </div>
          )}

          {/* Sprints */}
          {activeTab === 'sprints' && (
            <div className="h-full">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                <div className="max-w-4xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Sprint Planning</h2>
                    <p className="text-sm text-gray-600">
                      {workspace.methodology?.sprintCadence || 2}-week sprint cadence
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white gap-2" onClick={handleCreateSprint}>
                    <Plus className="w-4 h-4" />
                    Create Sprint
                  </Button>
                </div>

                <div className="grid gap-4">
                  {workspace.sprints?.sprints && workspace.sprints.sprints.length > 0 ? (
                    workspace.sprints.sprints.map((sprint: any, index: number) => (
                      <Card key={sprint.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-blue-600" />
                                {sprint.name}
                              </CardTitle>
                              <CardDescription className="mt-1">{sprint.goal}</CardDescription>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700">
                              {workspace.backlog?.stories?.filter((s: any) => s.sprintId === sprint.id).length || 0} stories
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            {sprint.startDate && (
                              <div>
                                <div className="text-gray-600">Start Date</div>
                                <div className="font-medium">{new Date(sprint.startDate).toLocaleDateString()}</div>
                              </div>
                            )}
                            {sprint.endDate && (
                              <div>
                                <div className="text-gray-600">End Date</div>
                                <div className="font-medium">{new Date(sprint.endDate).toLocaleDateString()}</div>
                              </div>
                            )}
                          </div>
                          <Button 
                            className="w-full bg-[#14213D] hover:bg-[#14213D]/90 text-white"
                            onClick={() => {
                              setSelectedSprint(sprint);
                              setShowSprintDetailView(true);
                            }}
                          >
                            <GitBranch className="w-4 h-4 mr-2" />
                            View Sprint Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="p-12">
                      <div className="text-center text-gray-500">
                        <GitBranch className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">No Sprints Yet</h3>
                        <p className="text-sm mb-4">Create your first sprint to start planning your work.</p>
                        <Button 
                          onClick={handleCreateSprint}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Create First Sprint
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
                </div>
              </div>
            </ScrollArea>
            </div>
          )}

          {/* Timeline */}
          {activeTab === 'timeline' && (
            <div className="h-full">
            <div className="h-full w-full">
              <TimelineGantt workspace={workspaceData} />
            </div>
            </div>
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <div className="h-full">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>

                <div className="grid grid-cols-2 gap-6">
                  {workspace.reports?.dashboards?.map((dashboard: string, index: number) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          {dashboard}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                          Chart Placeholder
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* KPIs */}
                {workspace.reports?.kpis?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Performance Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {workspace.reports.kpis.map((kpi: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">{kpi.name}</div>
                            <div className="text-2xl font-bold text-gray-900">
                              {kpi.target} {kpi.unit}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
            </div>
          )}

          {/* Configuration - Board Configuration */}
          {activeTab === 'settings' && (
            <div className="h-full">
            <div className="h-full p-8">
              <div className="max-w-4xl">
              <Card className="max-w-2xl w-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" style={{ color: '#FCA311' }} />
                    Board Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure board display settings, columns, and workflow behavior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleConfigurationClick}
                    className="w-full"
                    style={{ 
                      background: 'linear-gradient(to right, #14213D, #1a2d52)',
                      color: 'white'
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Open Board Configuration
                  </Button>
                </CardContent>
              </Card>
              </div>
            </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating AI Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setAICommandContext('ticket');
          setShowAICommand(true);
        }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-40 group"
        style={{ 
          background: 'linear-gradient(135deg, #14213D 0%, #1a2d52 100%)',
          border: '3px solid #FCA311'
        }}
      >
        <Sparkles className="w-7 h-7" style={{ color: '#FCA311' }} />
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: '#FCA311' }}>
          <Zap className="w-4 h-4 text-white" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
            <div className="font-semibold">AI Command Center</div>
            <div className="text-xs text-gray-300">Create tickets with AI</div>
          </div>
        </div>
      </motion.button>

      {/* Board Configuration Modal */}
      {showBoardConfigModal && (
        <BoardConfigModal
          onClose={() => setShowBoardConfigModal(false)}
          onSave={(config) => {
            console.log('Board configuration saved:', config);
            // Handle board configuration updates here
          }}
        />
      )}

      {/* Workspace Settings Modal */}
      {showSettingsView && (
        <div className="fixed inset-0 z-50 bg-white">
          <WorkspaceSettings
            workspace={workspace}
            currentUserRole={currentUserRole}
            onSave={async (settings) => {
              console.log('Workspace settings saved:', settings);
              
              // Use helper function to extract workspace ID
              const wsId = extractWorkspaceId(workspace, workspaceData);
              
              if (!wsId) {
                console.error('ERROR: No workspace ID found!');
                toast.dismiss('save-settings');
                toast.error('Error', {
                  description: 'Workspace ID not found. Please open the workspace from the dashboard and try again.'
                });
                throw new Error('Workspace ID not found');
              }
              
              // Check if this is a demo workspace (from sidebar)
              const isDemoWorkspace = wsId.startsWith('demo-') || wsId.startsWith('workspace-');
              
              if (isDemoWorkspace) {
                // Demo workspace - just update local state without backend call
                console.log('📝 Demo workspace detected - updating local state only');
                
                // Update workspace data with new settings
                setWorkspaceData(prev => ({
                  ...prev,
                  workspace: {
                    ...prev.workspace,
                    name: settings.general.name,
                    description: settings.general.description,
                    key: settings.general.key,
                    visibility: settings.general.visibility,
                    defaultAssignee: settings.general.defaultAssignee,
                  },
                  methodology: {
                    ...prev.methodology,
                    type: settings.methodology.type,
                    estimationModel: settings.methodology.estimationModel,
                    sprintDuration: settings.methodology.sprintDuration,
                    startDay: settings.methodology.startDay,
                  },
                  workflow: {
                    ...prev.workflow,
                    states: settings.workflow.states,
                    allowCustomStates: settings.workflow.allowCustomStates,
                  },
                  permissions: settings.permissions,
                  notifications: settings.notifications,
                  automation: settings.automation,
                  integrations: {
                    ...prev.integrations,
                    ...settings.integrations,
                  },
                }));
                
                // Dismiss loading toast and show success
                toast.dismiss('save-settings');
                toast.success('Settings Saved Successfully! (Demo Mode)', {
                  description: 'Settings saved locally. Note: This is a demo workspace from the sidebar.',
                  duration: 4000
                });
                
                setShowSettingsView(false);
              } else {
                // Real workspace - call backend
                try {
                  const response = await fetch(
                    `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspace/${wsId}/settings`,
                    {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${publicAnonKey}`,
                        'X-Access-Token': accessToken || ''
                      },
                      body: JSON.stringify(settings)
                    }
                  );

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update workspace settings');
                  }

                  const result = await response.json();
                  console.log('Backend response:', result);
                  
                  // Update workspace data with new settings
                  setWorkspaceData(prev => ({
                    ...prev,
                    workspace: {
                      ...prev.workspace,
                      name: settings.general.name,
                      description: settings.general.description,
                      key: settings.general.key,
                      visibility: settings.general.visibility,
                      defaultAssignee: settings.general.defaultAssignee,
                    },
                    methodology: {
                      ...prev.methodology,
                      type: settings.methodology.type,
                      estimationModel: settings.methodology.estimationModel,
                      sprintDuration: settings.methodology.sprintDuration,
                      startDay: settings.methodology.startDay,
                    },
                    workflow: {
                      ...prev.workflow,
                      states: settings.workflow.states,
                      allowCustomStates: settings.workflow.allowCustomStates,
                    },
                    permissions: settings.permissions,
                    notifications: settings.notifications,
                    automation: settings.automation,
                    integrations: {
                      ...prev.integrations,
                      ...settings.integrations,
                    },
                  }));
                  
                  // Dismiss loading toast and show success
                  toast.dismiss('save-settings');
                  toast.success('Settings Saved Successfully!', {
                    description: 'All workspace settings have been updated.',
                    duration: 4000
                  });
                  
                  setShowSettingsView(false);
                } catch (error) {
                  console.error('Failed to save workspace settings:', error);
                  // Dismiss loading toast and show error
                  toast.dismiss('save-settings');
                  toast.error('Failed to Save Settings', {
                    description: error instanceof Error ? error.message : 'An error occurred while saving settings. Please try again.',
                    duration: 5000
                  });
                }
              }
            }}
            onBack={() => setShowSettingsView(false)}
          />
        </div>
      )}
        </>
      )}

      {/* Modals - Always rendered regardless of view */}
      <CreateEpicModal
        isOpen={showCreateEpicModal}
        onClose={() => setShowCreateEpicModal(false)}
        onSubmit={(epicData) => {
          // Add epic to workspace backlog
          const newWorkspace = {
            ...workspaceData,
            backlog: {
              ...workspaceData.backlog,
              epics: [...(workspaceData.backlog?.epics || []), epicData]
            },
            stats: {
              ...workspaceData.stats,
              epics: (workspaceData.stats?.epics || 0) + 1
            }
          };
          setWorkspaceData(newWorkspace);
          setShowCreateEpicModal(false);
          toast.success('Epic Created!', {
            description: `"${epicData.title}" has been added to the backlog.`
          });
        }}
        projectId={workspaceData.backlog?.projects?.[0]?.id || 'proj-1'}
        workspaceKey={workspaceData.workspace?.key || 'PROJ'}
        existingTickets={[
          ...(workspaceData.backlog?.epics || []),
          ...(workspaceData.backlog?.stories || []),
          ...(workspaceData.backlog?.subtasks || [])
        ]}
      />
      <CreateStoryModal
        isOpen={showCreateStoryModal}
        onClose={() => setShowCreateStoryModal(false)}
        onSubmit={(storyData) => {
          // Add story to workspace backlog
          const newWorkspace = {
            ...workspaceData,
            backlog: {
              ...workspaceData.backlog,
              stories: [...(workspaceData.backlog?.stories || []), storyData]
            },
            stats: {
              ...workspaceData.stats,
              stories: (workspaceData.stats?.stories || 0) + 1
            }
          };
          setWorkspaceData(newWorkspace);
          setShowCreateStoryModal(false);
          toast.success('Story Created!', {
            description: `"${storyData.title}" has been added to the backlog.`
          });
        }}
        epics={workspaceData.backlog?.epics || []}
        preSelectedEpicId={selectedEpicId}
        workspaceKey={workspaceData.workspace?.key || 'PROJ'}
        existingTickets={[
          ...(workspaceData.backlog?.epics || []),
          ...(workspaceData.backlog?.stories || []),
          ...(workspaceData.backlog?.subtasks || [])
        ]}
      />
      <CreateSprintModal
        open={showCreateSprintModal}
        onClose={() => setShowCreateSprintModal(false)}
        workspaceId={workspaceData.id}
        projectId={workspaceData.backlog?.projects?.[0]?.id || 'proj-1'}
        accessToken={accessToken}
        onSprintCreated={(newSprint) => {
          console.log('📝 Sprint created callback triggered');
          console.log('New sprint data:', newSprint);
          console.log('Current workspace sprints:', workspaceData.sprints);
          
          // Add sprint to workspace
          const newWorkspace = {
            ...workspaceData,
            sprints: {
              ...workspaceData.sprints,
              sprints: [...(workspaceData.sprints?.sprints || []), newSprint]
            }
          };
          
          console.log('Updated workspace data:', newWorkspace);
          console.log('Updated sprints list:', newWorkspace.sprints.sprints);
          
          setWorkspaceData(newWorkspace);
          
          // Notify parent component to update its state
          if (onWorkspaceUpdate) {
            onWorkspaceUpdate(newWorkspace);
          }
          
          setShowCreateSprintModal(false);
        }}
        existingSprints={workspaceData.sprints?.sprints || []}
        availableStories={workspaceData.backlog?.stories || []}
        sprintCadence={workspaceData.methodology?.sprintCadence || 2}
      />
      
      {/* AI Command Modal */}
      <AICommandInput
        isOpen={showAICommand}
        onClose={() => setShowAICommand(false)}
        onSubmit={async (command: string, context: string) => {
          setIsGenerating(true);
          toast.info('AI Processing...', {
            description: 'Generating tickets with AI'
          });
          
          // Simulate AI generation (in real app, call backend)
          setTimeout(() => {
            toast.success('AI Generation Complete!', {
              description: 'Tickets have been added to your backlog'
            });
            setIsGenerating(false);
            setShowAICommand(false);
          }, 2000);
        }}
        isGenerating={isGenerating}
        context={aiCommandContext}
        workspaces={[]}
      />
    </div>
  );
}