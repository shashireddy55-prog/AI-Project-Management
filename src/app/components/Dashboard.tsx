import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getSupabaseClient } from '../../../utils/supabase/client';
import { Loader2, Sparkles, LogOut, FolderKanban, Plus, Search, Compass, Grid3x3, Clock, Mic, Send, Zap, Image as ImageIcon, Music, Link as LinkIcon, Users, Layers, FileText, BarChart3, Ticket, LayoutDashboard, TrendingUp, Download, Settings, BookOpen } from 'lucide-react';
import { Logo } from './Logo';
import { AICommandModal } from './AICommandModal';
import { IntegrationsModal } from './IntegrationsModal';
import { UserManagementModal } from './UserManagementModal';
import { WorkspacesPanel } from './WorkspacesPanel';
import { ArticlesPanel } from './ArticlesPanel';
import { DashboardsView } from './DashboardsView';
import { BoardsView } from './BoardsView';
import { WorkdeskView } from './WorkdeskView';
import { ReportsView } from './ReportsView';
import { ImportDataModal } from './ImportDataModal';
import { SettingsModal } from './SettingsModal';
import { GlobalAIAssistant } from './GlobalAIAssistant';
import { DashboardHeader } from './DashboardHeader';
import { EmptyStateWelcome } from './EmptyStateWelcome';
import { RecentActivity } from './RecentActivity';
import { QuickCommandsHelp } from './QuickCommandsHelp';
import { DashboardCategories } from './DashboardCategories';
import { DemoModeBanner } from './DemoModeBanner';
import { OpenAIQuotaHelp } from './OpenAIQuotaHelp';
import { GlobalIntelligenceDashboard } from './GlobalIntelligenceDashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface DashboardProps {
  accessToken: string;
  onWorkspaceCreated: (workspaceId: string) => void;
  onLogout: () => void;
}

interface Workspace {
  id: string;
  name: string;
  type?: string;
  createdAt: string;
}

export function Dashboard({ accessToken, onWorkspaceCreated, onLogout }: DashboardProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('scrum');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [currentToken, setCurrentToken] = useState(accessToken);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showAICommandModal, setShowAICommandModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWorkspacesPanel, setShowWorkspacesPanel] = useState(false);
  const [showArticlesPanel, setShowArticlesPanel] = useState(false);
  const [showDashboardsView, setShowDashboardsView] = useState(false);
  const [showBoardsView, setShowBoardsView] = useState(false);
  const [showWorkdeskView, setShowWorkdeskView] = useState(false);
  const [selectedWorkdeskId, setSelectedWorkdeskId] = useState<string | null>(null);
  const [showCreateWorkdeskModal, setShowCreateWorkdeskModal] = useState(false);
  const [workdeskName, setWorkdeskName] = useState('');
  const [showReportsView, setShowReportsView] = useState(false);
  const [selectedReportWorkspace, setSelectedReportWorkspace] = useState<Workspace | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickCommandsHelp, setShowQuickCommandsHelp] = useState(false);
  const [showDemoModeBanner, setShowDemoModeBanner] = useState(false);
  const [showQuotaHelp, setShowQuotaHelp] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allEpics, setAllEpics] = useState<any[]>([]);
  const [allStories, setAllStories] = useState<any[]>([]);
  const [allSprints, setAllSprints] = useState<any[]>([]);

  useEffect(() => {
    console.log('=== INITIALIZING DASHBOARD ===');
    console.log('Initial token (first 30 chars):', accessToken.substring(0, 30));
    
    // Just load workspaces with the current token - don't refresh on mount
    loadWorkspaces(accessToken);
  }, []);
  
  const checkAndRefreshToken = async (): Promise<string> => {
    try {
      const supabase = getSupabaseClient();
      
      // Get current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        toast.error('Session error. Please log in again.');
        setTimeout(() => onLogout(), 2000);
        return accessToken;
      }
      
      if (!session?.access_token) {
        console.log('No active session found');
        toast.error('Session expired. Please log in again.');
        setTimeout(() => onLogout(), 2000);
        return accessToken;
      }
      
      // Check if token is expired or expiring soon
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      
      if (expiresAt) {
        const timeUntilExpiry = expiresAt - now;
        console.log('Token time until expiry:', timeUntilExpiry, 'seconds');
        
        // If token expires in less than 5 minutes OR is already expired, refresh it
        if (timeUntilExpiry < 300) {
          console.log('Token expiring soon or expired, refreshing...');
          const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !refreshedSession?.access_token) {
            console.error('Failed to refresh token:', refreshError);
            toast.error('Session expired. Please log in again.');
            setTimeout(() => onLogout(), 2000);
            return accessToken;
          }
          
          console.log('Token refreshed successfully');
          setCurrentToken(refreshedSession.access_token);
          return refreshedSession.access_token;
        }
      }
      
      // Token is still valid
      setCurrentToken(session.access_token);
      return session.access_token;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return accessToken;
    }
  };

  useEffect(() => {
    // Update the current token whenever accessToken prop changes
    setCurrentToken(accessToken);
    loadCurrentUser();
  }, [accessToken]);

  const loadCurrentUser = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email || 'user@example.com',
          name: session.user.user_metadata?.name || 'Project Manager'
        });
      } else {
        // Fallback for non-authenticated users
        setCurrentUser({
          id: 'demo-user',
          email: 'user@example.com',
          name: 'Project Manager'
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setCurrentUser({
        id: 'demo-user',
        email: 'user@example.com',
        name: 'Project Manager'
      });
    }
  };

  const loadWorkspaces = async (token: string = currentToken) => {
    try {
      console.log('\n'.repeat(3));
      console.log('🔥🔥🔥 TESTING IF SERVER HAS UPDATED 🔥🔥🔥');
      console.log('='.repeat(80));
      
      // Test 1: Ping endpoint
      try {
        console.log('\n📍 TEST 1: Ping endpoint');
        const pingResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/ping`
        );
        const pingText = await pingResponse.text();
        console.log(`Status: ${pingResponse.status}`);
        console.log(`Response: ${pingText}`);
        if (pingText.includes('v6.0')) {
          console.log('✅✅✅ PING TEST PASSED - NEW CODE IS RUNNING! ✅✅✅');
        } else {
          console.log('❌ PING TEST FAILED - OLD CODE STILL RUNNING');
        }
      } catch (e) {
        console.error('❌ Ping test error:', e);
      }
      
      // Test 2: Test-no-auth endpoint
      try {
        console.log('\n📍 TEST 2: Test-no-auth endpoint');
        const testResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/test-no-auth`
        );
        console.log(`Status: ${testResponse.status}`);
        const testData = await testResponse.json();
        console.log('Response:', JSON.stringify(testData, null, 2));
        
        if (testData.VERSION === '6.0' || testData.MESSAGE?.includes('NEW SERVER')) {
          console.log('✅✅✅ TEST-NO-AUTH PASSED - NEW CODE IS RUNNING! ✅✅✅');
        } else {
          console.log('❌ TEST-NO-AUTH FAILED - OLD CODE STILL RUNNING');
        }
      } catch (e) {
        console.error('❌ Test-no-auth error:', e);
      }
      
      console.log('='.repeat(80));
      console.log('\n')
      
      console.log('=== LOADING WORKSPACES ===');
      console.log('Token type:', typeof token);
      console.log('Token is null/undefined:', token == null);
      console.log('Token (first 30 chars):', token?.substring(0, 30) + '...');
      console.log('Token (last 30 chars):', token ? '...' + token.substring(token.length - 30) : 'N/A');
      console.log('Token length:', token?.length);
      console.log('Token contains Bearer?:', token?.includes('Bearer'));
      
      // Try to decode the JWT on the client side to see what's in it
      try {
        if (token) {
          const parts = token.split('.');
          console.log('JWT parts count:', parts.length);
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            console.log('JWT payload:', payload);
            console.log('JWT sub (user ID):', payload.sub);
            console.log('JWT exp:', payload.exp);
            console.log('JWT exp date:', new Date(payload.exp * 1000).toISOString());
            console.log('Token expired?:', payload.exp < Date.now() / 1000);
          }
        }
      } catch (e) {
        console.error('Failed to decode token on client:', e);
      }
      
      console.log('API URL:', `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/user/workspaces`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/user/workspaces`,
        {
          headers: {
            'X-Access-Token': token,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to load workspaces:');
        console.error('  Status:', response.status);
        console.error('  Status Text:', response.statusText);
        console.error('  Error data (full):', JSON.stringify(errorData, null, 2));
        console.error('  Error message:', errorData.error || errorData.message);
        console.error('  Error details:', errorData.details);
        console.error('  Error code:', errorData.code);
        console.log('=== END LOADING WORKSPACES (FAILED) ===');
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          setTimeout(() => onLogout(), 2000);
          return;
        }
        
        toast.error(`Failed to load workspaces: ${errorData.error || errorData.message || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      console.log('Workspaces loaded successfully:', data.workspaces?.length || 0);
      console.log('=== END LOADING WORKSPACES (SUCCESS) ===');
      setWorkspaces(data.workspaces || []);
      
      // Load all project data for Global Intelligence Dashboard
      if (data.workspaces && data.workspaces.length > 0) {
        await loadAllProjectData(data.workspaces, token);
      }
    } catch (error) {
      console.error('Error loading workspaces (exception):', error);
      console.log('=== END LOADING WORKSPACES (EXCEPTION) ===');
      toast.error('Error loading workspaces. Please refresh the page.');
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const loadAllProjectData = async (workspaces: Workspace[], token: string = currentToken) => {
    try {
      console.log('=== LOADING ALL PROJECT DATA FOR GLOBAL INTELLIGENCE ===');
      
      let allProjectsData: any[] = [];
      let allEpicsData: any[] = [];
      let allStoriesData: any[] = [];
      let allSprintsData: any[] = [];

      // Load data from each workspace
      for (const workspace of workspaces) {
        try {
          // Load projects
          const projectsResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspaces/${workspace.id}/projects`,
            {
              headers: {
                'X-Access-Token': token,
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );

          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            const projects = projectsData.projects || [];
            allProjectsData = [...allProjectsData, ...projects];

            // For each project, load epics, stories, and sprints
            for (const project of projects) {
              // Load epics
              const epicsResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/projects/${project.id}/epics`,
                {
                  headers: {
                    'X-Access-Token': token,
                    'Authorization': `Bearer ${publicAnonKey}`
                  }
                }
              );

              if (epicsResponse.ok) {
                const epicsData = await epicsResponse.json();
                allEpicsData = [...allEpicsData, ...(epicsData.epics || [])];
              }

              // Load stories
              const storiesResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/projects/${project.id}/stories`,
                {
                  headers: {
                    'X-Access-Token': token,
                    'Authorization': `Bearer ${publicAnonKey}`
                  }
                }
              );

              if (storiesResponse.ok) {
                const storiesData = await storiesResponse.json();
                allStoriesData = [...allStoriesData, ...(storiesData.stories || [])];
              }

              // Load sprints
              const sprintsResponse = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/projects/${project.id}/sprints`,
                {
                  headers: {
                    'X-Access-Token': token,
                    'Authorization': `Bearer ${publicAnonKey}`
                  }
                }
              );

              if (sprintsResponse.ok) {
                const sprintsData = await sprintsResponse.json();
                allSprintsData = [...allSprintsData, ...(sprintsData.sprints || [])];
              }
            }
          }
        } catch (error) {
          console.error(`Error loading data for workspace ${workspace.id}:`, error);
        }
      }

      console.log('Loaded projects:', allProjectsData.length);
      console.log('Loaded epics:', allEpicsData.length);
      console.log('Loaded stories:', allStoriesData.length);
      console.log('Loaded sprints:', allSprintsData.length);

      setAllProjects(allProjectsData);
      setAllEpics(allEpicsData);
      setAllStories(allStoriesData);
      setAllSprints(allSprintsData);

      console.log('=== END LOADING ALL PROJECT DATA ===');
    } catch (error) {
      console.error('Error loading all project data:', error);
    }
  };

  const handleWorkspaceCreatedFromAI = (workspace: any) => {
    console.log('AI Workspace created:', workspace);
    // Navigate to the newly created workspace
    onWorkspaceCreated(workspace.id);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspace`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': currentToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ prompt })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Workspace creation failed:', response.status, data);
        
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          setTimeout(() => onLogout(), 2000);
          return;
        }
        
        toast.error(`Failed to create workspace: ${data.error || 'Unknown error'}`);
        return;
      }

      // Check if we got demo mode data (fallback from OpenAI failure)
      if (data.demoMode || data.usingMockData) {
        setShowDemoModeBanner(true);
        toast.success('Workspace created in Demo Mode!', {
          description: 'AI quota reached. Using demo data. Workspace is fully functional.',
          duration: 6000
        });
      } else {
        toast.success('Workspace created successfully!', {
          description: 'AI-powered workspace is ready to use'
        });
      }
      
      setPrompt('');
      await loadWorkspaces();
      onWorkspaceCreated(data.workspaceId);
    } catch (error) {
      console.error('Workspace creation error:', error);
      toast.error('Failed to create workspace. Please check your network connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateWorkdeskProject = async () => {
    setShowCreateWorkdeskModal(true);
  };

  const handleSubmitWorkdesk = async () => {
    if (!workdeskName.trim()) {
      toast.error('Please enter a name for the Workdesk project');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspaces/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': currentToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            name: workdeskName,
            type: 'workdesk',
            description: 'Service desk for managing support tickets and customer requests'
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast.success('Workdesk project created successfully!');
        setShowCreateWorkdeskModal(false);
        setWorkdeskName('');
        await loadWorkspaces(currentToken);
        setSelectedWorkdeskId(data.workspace.id);
        setShowWorkdeskView(true);
      } else {
        toast.error('Failed to create Workdesk project');
      }
    } catch (error) {
      console.error('Error creating workdesk project:', error);
      toast.error('Failed to create Workdesk project');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'generate':
        // Focus on input
        document.querySelector('input[type="text"]')?.focus();
        toast.info('Enter your project description below to generate a workspace');
        break;
      case 'sprint':
        if (workspaces.length === 0) {
          toast.error('Create a workspace first to manage sprints');
        } else {
          toast.info('Opening your most recent workspace...');
          onWorkspaceCreated(workspaces[0].id);
        }
        break;
      case 'search':
        setShowSearchModal(true);
        break;
      case 'insights':
        setShowInsightsModal(true);
        break;
      case 'workdesk':
        handleCreateWorkdeskProject();
        break;
      default:
        break;
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    
    const matchingWorkspace = workspaces.find(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (matchingWorkspace) {
      toast.success(`Found: ${matchingWorkspace.name}`);
      setShowSearchModal(false);
      setSearchQuery('');
      onWorkspaceCreated(matchingWorkspace.id);
    } else {
      toast.error('No matching workspaces found');
    }
  };

  const handleVoiceInput = () => {
    toast.info('Voice input feature coming soon!');
  };

  const handleUpgrade = () => {
    toast.info('Upgrade to Pro for unlimited workspaces and advanced AI features!');
  };

  const handleSidebarAction = (action: string) => {
    switch (action) {
      case 'new':
        document.querySelector('input[type="text"]')?.focus();
        break;
      case 'search':
        setShowSearchModal(true);
        break;
      case 'dashboards':
        setShowDashboardsView(true);
        break;
      case 'boards':
        setShowBoardsView(true);
        break;
      case 'workdesk':
        // Show all workdesk projects
        const workdeskProjects = workspaces.filter(w => w.type === 'workdesk');
        if (workdeskProjects.length === 0) {
          toast.info('No Workdesk projects yet. Click "Create Workdesk" to get started.');
          handleCreateWorkdeskProject();
        } else if (workdeskProjects.length === 1) {
          setSelectedWorkdeskId(workdeskProjects[0].id);
          setShowWorkdeskView(true);
        } else {
          toast.info(`You have ${workdeskProjects.length} Workdesk projects. Click on any to open.`);
        }
        break;
      case 'workspaces':
        setShowWorkspacesPanel(true);
        break;
      case 'articles':
        setShowArticlesPanel(true);
        break;
      case 'explore':
        toast.info('Explore feature - Browse templates and examples');
        break;
      case 'grid':
        toast.info('Grid view - All workspaces displayed');
        break;
      case 'history':
        toast.info('History - View recent activity and changes');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 50%, #E5E5E5 100%)' }}>
      {/* Sidebar */}
      <div className="w-20 bg-white/80 backdrop-blur-sm border-r border-gray-200 flex flex-col items-center py-6 gap-4">
        {/* Workspace Icon & Create Button */}
        <button 
          onClick={() => handleSidebarAction('new')}
          className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-md hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg, #14213D, #1a2d52)' }}
          title="Create New Workspace"
        >
          <Plus className="w-5 h-5" style={{ color: '#FCA311' }} />
        </button>

        {/* Nav Buttons */}
        <button 
          onClick={() => handleSidebarAction('dashboards')}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="Dashboards"
        >
          <LayoutDashboard className="w-5 h-5" style={{ color: '#FCA311' }} />
        </button>
        <button 
          onClick={() => handleSidebarAction('boards')}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="Boards"
        >
          <FolderKanban className="w-5 h-5" style={{ color: '#FCA311' }} />
        </button>
        <button 
          onClick={() => handleSidebarAction('workdesk')}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="Workdesk (Service Desk)"
        >
          <Ticket className="w-5 h-5" style={{ color: '#FCA311' }} />
        </button>
        <div className="w-10 h-px bg-gray-300 my-2"></div>
        <button 
          onClick={() => handleSidebarAction('search')}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="Search Workspaces"
        >
          <Search className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={() => handleSidebarAction('workspaces')}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="All Workspaces"
        >
          <Layers className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={() => handleSidebarAction('articles')}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="Articles & Documentation"
        >
          <FileText className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={() => handleSidebarAction('explore')}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="Explore Templates"
        >
          <Compass className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={() => handleSidebarAction('grid')}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="Grid View"
        >
          <Grid3x3 className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={() => handleSidebarAction('history')}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="History"
        >
          <Clock className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1"></div>
        <button 
          onClick={onLogout}
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Workspace Management</h1>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowQuickCommandsHelp(true)} 
              variant="outline" 
              size="sm" 
              className="border-gray-300"
              title="AI Command Examples"
            >
              <BookOpen className="w-4 h-4 mr-2" style={{ color: '#FCA311' }} />
              <span className="hidden sm:inline" style={{ color: '#000000' }}>Commands</span>
            </Button>
            <Button 
              onClick={() => setShowImportModal(true)} 
              variant="outline" 
              size="sm" 
              className="border-2 hover:shadow-md transition-all"
              style={{ 
                background: 'linear-gradient(to right, rgba(252, 163, 17, 0.08), rgba(252, 163, 17, 0.12))',
                borderColor: '#FCA311'
              }}
              data-import-trigger
            >
              <Download className="w-4 h-4 mr-2" style={{ color: '#FCA311' }} />
              <span className="hidden sm:inline" style={{ color: '#14213D' }}>Import Data</span>
              <span className="sm:hidden" style={{ color: '#14213D' }}>Import</span>
            </Button>
            <Button onClick={handleUpgrade} className="text-white font-semibold" style={{ background: 'linear-gradient(135deg, #14213D, #1a2d52)' }} size="sm">
              <Zap className="w-4 h-4 mr-2" style={{ color: '#FCA311' }} />
              <span className="hidden sm:inline">Upgrade</span>
            </Button>
            <Button 
              onClick={() => setShowSettingsModal(true)} 
              variant="outline" 
              size="sm"
              className="border-gray-300"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-8 py-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Demo Mode Banner */}
            {showDemoModeBanner && (
              <DemoModeBanner 
                onDismiss={() => setShowDemoModeBanner(false)} 
                onShowHelp={() => setShowQuotaHelp(true)}
              />
            )}

            {/* Global AI Intelligence Dashboard - Show prominently at top */}
            {currentUser && !isLoadingWorkspaces && (
              <div className="mb-8">
                <GlobalIntelligenceDashboard
                  userId={currentUser.id}
                  userRole="admin"
                  workspaces={workspaces}
                  projects={allProjects}
                  epics={allEpics}
                  stories={allStories}
                  sprints={allSprints}
                  accessToken={currentToken}
                />
              </div>
            )}

            {/* Workspaces Grid */}
            {isLoadingWorkspaces ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FCA311' }} />
              </div>
            ) : workspaces.length === 0 ? (
              <EmptyStateWelcome 
                onCreateWorkspace={() => {
                  const input = document.querySelector('input[placeholder*="Mobile Banking"]') as HTMLInputElement;
                  if (input) input.focus();
                }}
                onViewExamples={() => {
                  toast.info('Scroll down to see example commands!');
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
              />
            ) : (
              <>
                <DashboardCategories
                  workspaces={workspaces}
                  onWorkspaceClick={(workspaceId) => onWorkspaceCreated(workspaceId)}
                  onReportClick={(workspace) => {
                    setSelectedReportWorkspace(workspace);
                    setShowReportsView(true);
                  }}
                  onShowWorkspacesPanel={() => setShowWorkspacesPanel(true)}
                  onShowArticlesPanel={() => setShowArticlesPanel(true)}
                  onShowDashboardsView={() => setShowDashboardsView(true)}
                  onCreateWorkspace={() => {
                    setPrompt('create Software Development workspace with scrum type');
                  }}
                />
                
                <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ display: 'none' }}>Your Workspaces</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8" style={{ display: 'none' }}>
                  {workspaces.map((workspace) => (
                    <Card 
                      key={workspace.id} 
                      className="bg-white/90 backdrop-blur-sm border-gray-200 hover:shadow-xl transition-all group"
                      style={{ ':hover': { borderColor: '#FCA311' } }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FCA311'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            workspace.type === 'workdesk' ? 'bg-[#E5E5E5]' : 
                            workspace.type === 'test' ? 'bg-slate-100' :
                            'bg-[#E5E5E5]'
                          }`}>
                            {workspace.type === 'workdesk' ? (
                              <Ticket className="w-6 h-6" style={{ color: '#14213D' }} />
                            ) : workspace.type === 'test' ? (
                              <BarChart3 className="w-6 h-6" style={{ color: '#FCA311' }} />
                            ) : (
                              <FolderKanban className="w-6 h-6" style={{ color: '#14213D' }} />
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {workspace.type && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${
                                  workspace.type === 'workdesk' 
                                    ? 'bg-[#E5E5E5]' 
                                    : workspace.type === 'test'
                                    ? 'bg-slate-100 text-slate-800'
                                    : workspace.type === 'scrum'
                                    ? 'bg-[#E5E5E5]'
                                    : 'bg-[#E5E5E5]'
                                }`}
                                style={workspace.type === 'workdesk' || workspace.type === 'scrum' || (!['test'].includes(workspace.type || '')) ? { color: '#14213D' } : {}}
                              >
                                {workspace.type === 'test' ? 'QA/TEST' : workspace.type.toUpperCase()}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(workspace.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <CardTitle className={`text-lg transition-colors ${
                          workspace.type === 'workdesk' ? 'group-hover:text-[#14213D]' : 
                          workspace.type === 'test' ? 'group-hover:text-slate-600' :
                          'group-hover:text-[#14213D]'
                        }`}>
                          {workspace.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Click to view kanban board and manage tasks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              if (workspace.type === 'workdesk') {
                                setSelectedWorkdeskId(workspace.id);
                                setShowWorkdeskView(true);
                              } else {
                                onWorkspaceCreated(workspace.id);
                              }
                            }}
                            className="flex-1 text-white"
                            style={{ backgroundColor: '#14213D' }}
                            size="sm"
                          >
                            {workspace.type === 'workdesk' ? 'Open Desk' : 
                             workspace.type === 'test' ? 'Open Tests' : 'Open Board'}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedReportWorkspace(workspace);
                              setShowReportsView(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <TrendingUp className="w-4 h-4" />
                            Reports
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="mt-8">
                  <RecentActivity accessToken={currentToken} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* AI Command Input Footer */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Projify AI v2.6</span>
            </div>
            
            <form onSubmit={handleCreateWorkspace} className="relative">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-full px-4 py-3 transition-all focus-within:ring-2" style={{ ':focus-within': { borderColor: '#FCA311', boxShadow: '0 0 0 2px rgba(252, 163, 17, 0.1)' } }}>
                <Plus className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Describe your workspace..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                  className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  title="Voice Input"
                >
                  <Mic className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="p-2 rounded-full transition-colors disabled:opacity-50 shadow-md"
                  style={{ backgroundColor: '#14213D' }}
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 mt-4 justify-center">
              <Button
                onClick={() => handleQuickAction('generate')}
                variant="outline"
                size="sm"
                className="rounded-full text-white border-0 shadow-sm"
                style={{ backgroundColor: '#14213D' }}
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Generate Project
              </Button>
              <Button
                onClick={() => handleQuickAction('sprint')}
                variant="outline"
                size="sm"
                className="rounded-full text-white border-0 shadow-sm"
                style={{ backgroundColor: '#14213D' }}
              >
                <ImageIcon className="w-3 h-3 mr-2" />
                Create Sprint
              </Button>
              <Button
                onClick={() => handleQuickAction('search')}
                variant="outline"
                size="sm"
                className="rounded-full text-white border-0 shadow-sm"
                style={{ backgroundColor: '#14213D' }}
              >
                <Search className="w-3 h-3 mr-2" />
                Search Tasks
              </Button>
              <Button
                onClick={() => handleQuickAction('insights')}
                variant="outline"
                size="sm"
                className="rounded-full text-white border-0 shadow-sm"
                style={{ backgroundColor: '#14213D' }}
              >
                <Music className="w-3 h-3 mr-2" />
                AI Insights
              </Button>
              <Button
                onClick={() => handleQuickAction('workdesk')}
                variant="outline"
                size="sm"
                className="rounded-full text-white border-0"
                style={{ backgroundColor: '#14213D' }}
              >
                <Ticket className="w-3 h-3 mr-2" />
                Create Workdesk
              </Button>
              <Button
                onClick={() => {
                  setPrompt('Create a QA test management workspace for our software testing team');
                  setTimeout(() => handleCreateWorkspace(new Event('submit') as any), 100);
                }}
                variant="outline"
                size="sm"
                className="rounded-full text-white border-0"
                style={{ backgroundColor: '#14213D' }}
              >
                <BarChart3 className="w-3 h-3 mr-2" />
                QA/Test Workspace
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowSearchModal(false)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" />
                Search Workspaces
              </CardTitle>
              <CardDescription>Find your workspaces by name</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Enter workspace name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button onClick={handleSearch} className="flex-1">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                  }}>
                    Cancel
                  </Button>
                </div>
                {workspaces.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">All Workspaces:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {workspaces.map((workspace) => (
                        <div
                          key={workspace.id}
                          className="p-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            setShowSearchModal(false);
                            setSearchQuery('');
                            onWorkspaceCreated(workspace.id);
                          }}
                        >
                          {workspace.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Workdesk Modal */}
      {showCreateWorkdeskModal && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreateWorkdeskModal(false)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-600" />
                Create Workdesk Project
              </CardTitle>
              <CardDescription>Set up a new service desk for managing tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Workdesk Name
                  </label>
                  <Input
                    placeholder="e.g., Customer Support Desk, IT Help Desk..."
                    value={workdeskName}
                    onChange={(e) => setWorkdeskName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitWorkdesk()}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSubmitWorkdesk} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <Ticket className="w-4 h-4 mr-2" />
                    Create Workdesk
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowCreateWorkdeskModal(false);
                    setWorkdeskName('');
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Command Modal */}
      {showAICommandModal && (
        <AICommandModal
          accessToken={currentToken}
          onClose={() => setShowAICommandModal(false)}
          onWorkspaceCreated={handleWorkspaceCreatedFromAI}
          onWorkBreakdownGenerated={() => loadWorkspaces(currentToken)}
        />
      )}

      {/* Integrations Modal */}
      {showIntegrationsModal && (
        <IntegrationsModal
          accessToken={currentToken}
          onClose={() => setShowIntegrationsModal(false)}
        />
      )}

      {/* User Management Modal */}
      {showUserManagementModal && (
        <UserManagementModal
          accessToken={currentToken}
          onClose={() => setShowUserManagementModal(false)}
        />
      )}

      {/* Workspaces Panel */}
      {showWorkspacesPanel && (
        <WorkspacesPanel
          accessToken={currentToken}
          onWorkspaceSelect={onWorkspaceCreated}
          onClose={() => setShowWorkspacesPanel(false)}
        />
      )}

      {/* Articles Panel */}
      {showArticlesPanel && (
        <ArticlesPanel
          accessToken={currentToken}
          onClose={() => setShowArticlesPanel(false)}
        />
      )}

      {/* Dashboards View */}
      {showDashboardsView && (
        <DashboardsView
          accessToken={currentToken}
          onClose={() => setShowDashboardsView(false)}
        />
      )}

      {/* Boards View */}
      {showBoardsView && (
        <BoardsView
          accessToken={currentToken}
          onBoardClick={onWorkspaceCreated}
          onClose={() => setShowBoardsView(false)}
        />
      )}

      {/* Workdesk View */}
      {showWorkdeskView && selectedWorkdeskId && (
        <WorkdeskView
          accessToken={currentToken}
          workspaceId={selectedWorkdeskId}
          workspaceName={workspaces.find(w => w.id === selectedWorkdeskId)?.name}
          onClose={() => {
            setShowWorkdeskView(false);
            setSelectedWorkdeskId(null);
          }}
        />
      )}

      {/* Reports View */}
      {showReportsView && selectedReportWorkspace && (
        <ReportsView
          workspaceId={selectedReportWorkspace.id}
          workspaceName={selectedReportWorkspace.name}
          workspaceType={selectedReportWorkspace.type || 'business'}
          accessToken={currentToken}
          onClose={() => {
            setShowReportsView(false);
            setSelectedReportWorkspace(null);
          }}
        />
      )}

      {/* Import Data Modal */}
      {showImportModal && (
        <ImportDataModal
          accessToken={currentToken}
          onClose={() => setShowImportModal(false)}
          onImportComplete={async () => {
            await loadWorkspaces();
            toast.success('Data imported successfully!');
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          accessToken={currentToken}
          onClose={() => setShowSettingsModal(false)}
          onOpenIntegrations={() => {
            setShowSettingsModal(false);
            setShowIntegrationsModal(true);
          }}
          onOpenUserManagement={() => {
            setShowSettingsModal(false);
            setShowUserManagementModal(true);
          }}
          onOpenImport={() => {
            setShowSettingsModal(false);
            setShowImportModal(true);
          }}
        />
      )}

      {/* Quick Commands Help Modal */}
      {showQuickCommandsHelp && (
        <QuickCommandsHelp
          onClose={() => setShowQuickCommandsHelp(false)}
          onUseCommand={(command) => {
            setPrompt(command);
            setShowQuickCommandsHelp(false);
            // Focus the input field
            setTimeout(() => {
              const input = document.querySelector('input[placeholder*="fintech"]') as HTMLInputElement;
              if (input) {
                input.focus();
              }
            }, 100);
          }}
        />
      )}

      {/* OpenAI Quota Help Dialog */}
      <Dialog open={showQuotaHelp} onOpenChange={setShowQuotaHelp}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="bg-gray-50 pb-4">
            <DialogTitle className="sr-only">OpenAI Quota Help</DialogTitle>
          </DialogHeader>
          <OpenAIQuotaHelp />
        </DialogContent>
      </Dialog>

      {/* Global AI Assistant */}
      <GlobalAIAssistant 
        accessToken={currentToken} 
        userId={currentUser?.id}
      />
    </div>
  );
}