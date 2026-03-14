import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Search, Plus, TrendingUp, Users, Target, Clock, Zap, CheckCircle } from 'lucide-react';
import { GlassSidebar } from './GlassSidebar';
import { GlassDashboardWrapper } from './GlassDashboardWrapper';
import { GlassHeader } from './GlassHeader';
import { GlassWorkspaceCard } from './GlassWorkspaceCard';
import { ZCPCWizard } from './ZCPCWizard';
import { AICommandInput } from './AICommandInput';
import { AISearchResults } from './AISearchResults';
import { WorkspaceView } from './WorkspaceView';
import { ArticleSpaceList } from './ArticleSpaceList';
import { ArticleSpaceView } from './ArticleSpaceView';
import { AdminSettings } from './AdminSettings';
import { TeamSpace } from './TeamSpace';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface GlassShowcaseProps {
  onLogout?: () => void;
  accessToken?: string;
}

export function GlassShowcase({ onLogout, accessToken }: GlassShowcaseProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showZCPCWizard, setShowZCPCWizard] = useState(false);
  const [showAICommandInput, setShowAICommandInput] = useState(false);
  const [showAISearchResults, setShowAISearchResults] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiCommandContext, setAICommandContext] = useState<'workspace' | 'board' | 'dashboard' | 'report' | 'ticket' | 'user' | 'general'>('workspace');
  const [isGeneratingWorkspace, setIsGeneratingWorkspace] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [selectedArticleSpace, setSelectedArticleSpace] = useState<any>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [showCommandsHelp, setShowCommandsHelp] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [currentAccessToken, setCurrentAccessToken] = useState('');

  // Get access token on mount
  useEffect(() => {
    const getToken = async () => {
      console.log('[GlassShowcase] Getting access token...');
      console.log('[GlassShowcase] accessToken prop:', accessToken ? 'present' : 'missing');
      
      if (accessToken) {
        console.log('[GlassShowcase] Using accessToken from props');
        console.log('[GlassShowcase] Token length:', accessToken.length);
        console.log('[GlassShowcase] Token preview:', accessToken.substring(0, 20) + '...');
        setCurrentAccessToken(accessToken);
      } else {
        try {
          console.log('[GlassShowcase] Fetching token from Supabase session...');
          const { getSupabaseClient } = await import('/utils/supabase/client');
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            console.log('[GlassShowcase] Got token from session');
            console.log('[GlassShowcase] Session token length:', session.access_token.length);
            setCurrentAccessToken(session.access_token);
          } else {
            console.warn('No access token found in session');
          }
        } catch (error) {
          console.error('Error getting access token:', error);
        }
      }
    };
    getToken();
  }, [accessToken]);

  // Load workspaces when token is available
  useEffect(() => {
    if (currentAccessToken) {
      loadWorkspaces();
    }
  }, [currentAccessToken]);

  const loadWorkspaces = async () => {
    if (!currentAccessToken) return;
    
    try {
      setIsLoadingWorkspaces(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/user/workspaces`,
        {
          headers: {
            'X-Access-Token': currentAccessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to load workspaces:', errorData);
        toast.error('Failed to load workspaces');
        setWorkspaces([]);
        return;
      }

      const data = await response.json();
      setWorkspaces(data.workspaces || []);
    } catch (error) {
      console.error('Error loading workspaces:', error);
      toast.error('Error loading workspaces');
      setWorkspaces([]);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  // Helper function to generate sample backlog data for each workspace
  const generateSampleBacklog = (workspaceKey: string) => {
    // This will be populated with sample data based on workspace key
    const backlogData: any = {
      projects: [],
      epics: [],
      stories: [],
      subtasks: []
    };

    if (workspaceKey === 'MOB') {
      // Mobile Banking - detailed sample data will be added
      backlogData.projects = [{ id: 'proj-1', name: 'Mobile Banking Platform', description: 'Complete mobile banking solution', owner: 'Sarah Chen', timeline: { startDate: '2026-03-01', endDate: '2026-06-30' } }];
      backlogData.epics = [
        { id: 'MOB-1', title: 'User Authentication & Security', description: 'Secure authentication with biometric support', projectId: 'proj-1', status: 'In Progress', priority: 'HIGH', businessValue: 'Critical', owner: 'Sarah Chen', createdAt: '2026-03-01', storyCount: 3 },
        { id: 'MOB-2', title: 'Payment Processing', description: 'Enable payments and transfers', projectId: 'proj-1', status: 'To Do', priority: 'HIGH', businessValue: 'High', owner: 'Michael Park', createdAt: '2026-03-02', storyCount: 3 }
      ];
      backlogData.stories = [
        { id: 'MOB-3', title: 'As a user, I want to login with biometric authentication', description: 'Quick and secure login with fingerprint/face', epicId: 'MOB-1', status: 'Done', priority: 'HIGH', storyPoints: 8, assignee: 'Alex Johnson', acceptanceCriteria: ['Support fingerprint auth', 'Support face recognition', 'Fallback to PIN'], labels: ['security'], createdAt: '2026-03-01', subtaskCount: 2 },
        { id: 'MOB-4', title: 'As a user, I want to enable two-factor authentication', description: 'Additional security with 2FA', epicId: 'MOB-1', status: 'In Progress', priority: 'HIGH', storyPoints: 5, assignee: 'Priya Sharma', acceptanceCriteria: ['SMS OTP', 'Authenticator app support'], labels: ['security', '2fa'], createdAt: '2026-03-01', subtaskCount: 2 },
        { id: 'MOB-5', title: 'As a user, I want to send money to saved payees', description: 'Quick transfer to payees', epicId: 'MOB-2', status: 'To Do', priority: 'HIGH', storyPoints: 8, assignee: 'Unassigned', acceptanceCriteria: ['View payee list', 'Enter amount', 'Confirm with biometric'], labels: ['payment'], createdAt: '2026-03-05', subtaskCount: 3 }
      ];
      backlogData.subtasks = [
        { id: 'MOB-6', title: 'Implement fingerprint API integration', storyId: 'MOB-3', status: 'Done', assignee: 'Alex Johnson', estimatedHours: 8, actualHours: 7 },
        { id: 'MOB-7', title: 'Create fallback PIN UI', storyId: 'MOB-3', status: 'Done', assignee: 'Maria Garcia', estimatedHours: 4, actualHours: 4 },
        { id: 'MOB-8', title: 'Implement SMS OTP service', storyId: 'MOB-4', status: 'In Progress', assignee: 'Priya Sharma', estimatedHours: 6, actualHours: 4 },
        { id: 'MOB-9', title: 'Add authenticator app support', storyId: 'MOB-4', status: 'To Do', assignee: 'Unassigned', estimatedHours: 8, actualHours: 0 },
        { id: 'MOB-10', title: 'Create payee selection UI', storyId: 'MOB-5', status: 'To Do', assignee: 'Unassigned', estimatedHours: 4, actualHours: 0 },
        { id: 'MOB-11', title: 'Implement transfer API', storyId: 'MOB-5', status: 'To Do', assignee: 'Unassigned', estimatedHours: 8, actualHours: 0 },
        { id: 'MOB-12', title: 'Add transaction confirmation', storyId: 'MOB-5', status: 'To Do', assignee: 'Unassigned', estimatedHours: 5, actualHours: 0 }
      ];
    } else if (workspaceKey === 'ECOM') {
      backlogData.projects = [{ id: 'proj-1', name: 'E-commerce Marketplace', description: 'Full-stack marketplace platform', owner: 'David Kim', timeline: { startDate: '2026-02-15', endDate: '2026-07-30' } }];
      backlogData.epics = [
        { id: 'ECOM-1', title: 'Product Catalog Management', description: 'Product listing and search', projectId: 'proj-1', status: 'In Progress', priority: 'HIGH', businessValue: 'Critical', owner: 'David Kim', createdAt: '2026-02-15', storyCount: 3 },
        { id: 'ECOM-2', title: 'Shopping Cart & Checkout', description: 'Cart and payment flow', projectId: 'proj-1', status: 'To Do', priority: 'HIGH', businessValue: 'Critical', owner: 'Emma Thompson', createdAt: '2026-02-16', storyCount: 3 }
      ];
      backlogData.stories = [
        { id: 'ECOM-3', title: 'As a customer, I want to browse products by category', description: 'Navigate product categories', epicId: 'ECOM-1', status: 'Done', priority: 'HIGH', storyPoints: 8, assignee: 'Olivia Martinez', acceptanceCriteria: ['Category navigation', 'Show products', 'Subcategory filter'], labels: ['catalog'], createdAt: '2026-02-15', subtaskCount: 2 },
        { id: 'ECOM-4', title: 'As a customer, I want to search for products', description: 'Full-text product search', epicId: 'ECOM-1', status: 'In Progress', priority: 'HIGH', storyPoints: 8, assignee: 'Liam Chen', acceptanceCriteria: ['Search API', 'Filters', 'Suggestions'], labels: ['search'], createdAt: '2026-02-16', subtaskCount: 3 },
        { id: 'ECOM-5', title: 'As a customer, I want to add products to cart', description: 'Shopping cart functionality', epicId: 'ECOM-2', status: 'To Do', priority: 'HIGH', storyPoints: 5, assignee: 'Unassigned', acceptanceCriteria: ['Add to cart', 'Update quantity', 'Show total'], labels: ['cart'], createdAt: '2026-02-20', subtaskCount: 3 }
      ];
      backlogData.subtasks = [
        { id: 'ECOM-6', title: 'Create category navigation component', storyId: 'ECOM-3', status: 'Done', assignee: 'Olivia Martinez', estimatedHours: 6, actualHours: 6 },
        { id: 'ECOM-7', title: 'Implement category API', storyId: 'ECOM-3', status: 'Done', assignee: 'Noah Anderson', estimatedHours: 5, actualHours: 5 },
        { id: 'ECOM-8', title: 'Implement search API with Elasticsearch', storyId: 'ECOM-4', status: 'In Progress', assignee: 'Liam Chen', estimatedHours: 10, actualHours: 7 },
        { id: 'ECOM-9', title: 'Create search UI component', storyId: 'ECOM-4', status: 'In Progress', assignee: 'Ava Taylor', estimatedHours: 5, actualHours: 4 },
        { id: 'ECOM-10', title: 'Add search suggestions', storyId: 'ECOM-4', status: 'To Do', assignee: 'Unassigned', estimatedHours: 6, actualHours: 0 },
        { id: 'ECOM-11', title: 'Create add to cart API', storyId: 'ECOM-5', status: 'To Do', assignee: 'Unassigned', estimatedHours: 4, actualHours: 0 },
        { id: 'ECOM-12', title: 'Add cart button UI', storyId: 'ECOM-5', status: 'To Do', assignee: 'Unassigned', estimatedHours: 3, actualHours: 0 },
        { id: 'ECOM-13', title: 'Implement cart counter', storyId: 'ECOM-5', status: 'To Do', assignee: 'Unassigned', estimatedHours: 2, actualHours: 0 }
      ];
    } else if (workspaceKey === 'MCQ1') {
      backlogData.projects = [{ id: 'proj-1', name: 'Q1 Product Launch Campaign', description: 'Digital marketing strategy', owner: 'Rachel Green', timeline: { startDate: '2026-01-01', endDate: '2026-03-31' } }];
      backlogData.epics = [
        { id: 'MCQ1-1', title: 'Social Media Campaign', description: 'Multi-platform social strategy', projectId: 'proj-1', status: 'In Progress', priority: 'HIGH', businessValue: 'High', owner: 'Rachel Green', createdAt: '2026-01-01', storyCount: 2 },
        { id: 'MCQ1-2', title: 'Email Marketing Campaign', description: 'Email campaigns for product launch', projectId: 'proj-1', status: 'To Do', priority: 'HIGH', businessValue: 'High', owner: 'Mark Thompson', createdAt: '2026-01-02', storyCount: 2 }
      ];
      backlogData.stories = [
        { id: 'MCQ1-3', title: 'As a marketer, I want to create social media content calendar', description: 'Plan and schedule social posts', epicId: 'MCQ1-1', status: 'Done', priority: 'HIGH', storyPoints: 5, assignee: 'Lisa Wang', acceptanceCriteria: ['30-day calendar', 'Multi-platform'], labels: ['social-media'], createdAt: '2026-01-01', subtaskCount: 2 },
        { id: 'MCQ1-4', title: 'As a marketer, I want to design email templates', description: 'Responsive email templates', epicId: 'MCQ1-2', status: 'In Progress', priority: 'HIGH', storyPoints: 8, assignee: 'Tom Rodriguez', acceptanceCriteria: ['Welcome template', 'Newsletter template'], labels: ['email'], createdAt: '2026-01-05', subtaskCount: 2 }
      ];
      backlogData.subtasks = [
        { id: 'MCQ1-5', title: 'Research competitor social strategy', storyId: 'MCQ1-3', status: 'Done', assignee: 'Lisa Wang', estimatedHours: 6, actualHours: 5 },
        { id: 'MCQ1-6', title: 'Draft content themes', storyId: 'MCQ1-3', status: 'Done', assignee: 'Lisa Wang', estimatedHours: 4, actualHours: 4 },
        { id: 'MCQ1-7', title: 'Design welcome email layout', storyId: 'MCQ1-4', status: 'In Progress', assignee: 'Tom Rodriguez', estimatedHours: 5, actualHours: 4 },
        { id: 'MCQ1-8', title: 'Create newsletter template', storyId: 'MCQ1-4', status: 'To Do', assignee: 'Unassigned', estimatedHours: 5, actualHours: 0 }
      ];
    } else if (workspaceKey === 'QA') {
      backlogData.projects = [{ id: 'proj-1', name: 'Test Automation Framework', description: 'Comprehensive testing suite', owner: 'Jennifer Brooks', timeline: { startDate: '2026-03-10', endDate: '2026-06-15' } }];
      backlogData.epics = [
        { id: 'QA-1', title: 'UI Test Automation', description: 'Automated UI testing', projectId: 'proj-1', status: 'In Progress', priority: 'HIGH', businessValue: 'High', owner: 'Jennifer Brooks', createdAt: '2026-03-10', storyCount: 2 },
        { id: 'QA-2', title: 'API Test Automation', description: 'API and integration tests', projectId: 'proj-1', status: 'To Do', priority: 'HIGH', businessValue: 'High', owner: 'Kevin Zhang', createdAt: '2026-03-11', storyCount: 2 }
      ];
      backlogData.stories = [
        { id: 'QA-3', title: 'As a QA engineer, I want to set up Selenium framework', description: 'Configure Selenium WebDriver', epicId: 'QA-1', status: 'Done', priority: 'HIGH', storyPoints: 8, assignee: 'Ryan Cooper', acceptanceCriteria: ['Install Selenium', 'Page object model'], labels: ['automation'], createdAt: '2026-03-10', subtaskCount: 2 },
        { id: 'QA-4', title: 'As a QA engineer, I want to automate login tests', description: 'Automated login test cases', epicId: 'QA-1', status: 'In Progress', priority: 'HIGH', storyPoints: 5, assignee: 'Amy Peterson', acceptanceCriteria: ['Valid login test', 'Invalid credentials test'], labels: ['automation'], createdAt: '2026-03-12', subtaskCount: 2 }
      ];
      backlogData.subtasks = [
        { id: 'QA-5', title: 'Install Selenium dependencies', storyId: 'QA-3', status: 'Done', assignee: 'Ryan Cooper', estimatedHours: 2, actualHours: 2 },
        { id: 'QA-6', title: 'Create page object base class', storyId: 'QA-3', status: 'Done', assignee: 'Ryan Cooper', estimatedHours: 4, actualHours: 4 },
        { id: 'QA-7', title: 'Write valid login test case', storyId: 'QA-4', status: 'Done', assignee: 'Amy Peterson', estimatedHours: 3, actualHours: 3 },
        { id: 'QA-8', title: 'Write invalid credentials test', storyId: 'QA-4', status: 'In Progress', assignee: 'Amy Peterson', estimatedHours: 3, actualHours: 2 }
      ];
    }

    return backlogData;
  };

  const handleLogoClick = () => {
    setActiveView('dashboard');
    setSelectedWorkspace(null);
    setSelectedArticleSpace(null);
    console.log('Logo clicked - resetting to dashboard view');
    toast.success('Welcome Home!', {
      description: 'Navigated to dashboard'
    });
  };

  const handleCreateItem = (itemType: string) => {
    console.log('Create:', itemType);
    
    // Handle different create actions with AI Command Input
    switch (itemType) {
      case 'workspaces':
        setAICommandContext('workspace');
        setShowAICommandInput(true);
        toast.info('AI Workspace Creator', {
          description: 'Describe your project and let AI create everything for you!'
        });
        break;
      case 'boards':
        setAICommandContext('board');
        setShowAICommandInput(true);
        toast.info('AI Board Creator', {
          description: 'Create kanban or scrum boards with AI!'
        });
        break;
      case 'dashboard':
        setAICommandContext('dashboard');
        setShowAICommandInput(true);
        toast.info('AI Dashboard Creator', {
          description: 'Generate analytics dashboards with AI!'
        });
        break;
      case 'article-space':
        toast.info('Create Article Space', {
          description: 'Article space creation coming soon!'
        });
        break;
      case 'team-space':
        setAICommandContext('user');
        setShowAICommandInput(true);
        toast.info('AI User Management', {
          description: 'Add users to projects with AI!'
        });
        break;
      case 'sprints':
        toast.info('Create Sprint', {
          description: 'Sprint creation coming soon!'
        });
        break;
      case 'team':
        setAICommandContext('user');
        setShowAICommandInput(true);
        toast.info('AI User Management', {
          description: 'Add team members with AI!'
        });
        break;
      default:
        setAICommandContext('general');
        setShowAICommandInput(true);
    }
  };

  // Handle AI command submission - Universal handler for all contexts
  const handleAICommandSubmit = async (command: string, context: string) => {
    setIsGeneratingWorkspace(true);
    
    try {
      console.log(`Executing AI command for ${context}:`, command);
      
      let endpoint = '';
      let successMessage = '';
      let errorPrefix = '';
      
      // Route to different endpoints based on context
      switch (context) {
        case 'workspace':
          endpoint = '/zcpc/generate';
          successMessage = 'Workspace created successfully! 🎉';
          errorPrefix = 'Failed to create workspace';
          break;
        case 'board':
          endpoint = '/ai/create-board';
          successMessage = 'Board created successfully! 📋';
          errorPrefix = 'Failed to create board';
          break;
        case 'dashboard':
          endpoint = '/ai/create-dashboard';
          successMessage = 'Dashboard created successfully! 📊';
          errorPrefix = 'Failed to create dashboard';
          break;
        case 'report':
          endpoint = '/ai/create-report';
          successMessage = 'Report generated successfully! 📈';
          errorPrefix = 'Failed to generate report';
          break;
        case 'ticket':
          endpoint = '/ai/create-ticket';
          successMessage = 'Ticket created successfully! 🎫';
          errorPrefix = 'Failed to create ticket';
          break;
        case 'user':
          endpoint = '/ai/add-user';
          successMessage = 'User added successfully! 👤';
          errorPrefix = 'Failed to add user';
          break;
        default:
          endpoint = '/ai/execute-command';
          successMessage = 'Command executed successfully! ✅';
          errorPrefix = 'Failed to execute command';
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ 
            description: command,
            context: context,
            workspaceId: selectedWorkspace?.workspace?.id || null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types
        if (response.status === 429 || data.error?.includes('quota')) {
          toast.error('OpenAI Quota Exceeded', {
            description: 'Your OpenAI API key has insufficient quota. Please add billing at platform.openai.com.',
            duration: 10000
          });
        } else if (response.status === 401) {
          toast.error('Authentication Error', {
            description: 'OpenAI API key is invalid. Please update it in Admin Settings.',
            duration: 8000
          });
        } else if (response.status === 404) {
          // Endpoint doesn't exist yet - show demo mode
          toast.warning(`${context.charAt(0).toUpperCase() + context.slice(1)} Created (Demo Mode)`, {
            description: `Backend endpoint not yet implemented. Showing mock ${context} creation.`,
            duration: 8000
          });
          
          // Close AI command input
          setShowAICommandInput(false);
          return;
        } else if (response.status >= 500) {
          toast.error('Server Error', {
            description: 'Service is temporarily unavailable. Please try again in a few moments.',
            duration: 8000
          });
        } else {
          toast.error(`${errorPrefix}: ${data.error || 'Unknown error'}`, {
            duration: 6000
          });
        }
        return;
      }

      // Show different notification based on demo mode
      if (data.demoMode) {
        toast.warning(`${context.charAt(0).toUpperCase() + context.slice(1)} created in Demo Mode`, {
          description: 'OpenAI quota exceeded. Using sample data. Add billing at platform.openai.com for AI generation.',
          duration: 8000
        });
      } else {
        toast.success(successMessage, {
          description: data.workspace?.name || data.title || data.name || `${context.charAt(0).toUpperCase() + context.slice(1)} is ready to use!`
        });
      }
      
      // Close AI command input
      setShowAICommandInput(false);
      
      // Handle specific context actions
      if (context === 'workspace') {
        setSelectedWorkspace(data);
        setWorkspaces(prev => [...prev, data]);
      } else if (context === 'board') {
        toast.info('Opening board view...', { duration: 2000 });
      } else if (context === 'dashboard') {
        toast.info('Opening dashboard view...', { duration: 2000 });
      } else if (context === 'report') {
        toast.info('Opening report...', { duration: 2000 });
      } else if (context === 'ticket') {
        toast.info(`${data.type?.toUpperCase() || 'Ticket'} added to backlog`, { 
          description: `Story Points: ${data.storyPoints || 0} • Priority: ${data.priority || 'MEDIUM'}`,
          duration: 3000 
        });
      } else if (context === 'user') {
        toast.info('User added to project', { duration: 2000 });
      }
    } catch (error) {
      console.error('AI command execution error:', error);
      toast.error('Failed to execute command', {
        description: 'Please check your network connection and try again.',
        duration: 6000
      });
    } finally {
      setIsGeneratingWorkspace(false);
    }
  };

  // Handle workspace actions
  const handleDeleteWorkspace = (workspaceName: string) => {
    toast.error('Delete Workspace', {
      description: `Deleting "${workspaceName}" - This feature will be implemented soon.`
    });
  };

  const handleEditWorkspace = (workspaceName: string) => {
    toast.info('Edit Workspace', {
      description: `Opening editor for "${workspaceName}"...`
    });
  };

  const handleViewReports = (workspaceName: string) => {
    toast.info('View Reports', {
      description: `Loading analytics dashboard for "${workspaceName}"...`
    });
  };

  const handleExportWorkspace = (workspaceName: string) => {
    toast.success('Export Workspace', {
      description: `Preparing export for "${workspaceName}"... Download will start shortly.`
    });
  };

  // Handle header actions
  const handleShowCommands = () => {
    toast.info('AI Commands', {
      description: 'Type "/" in the search bar to see available AI commands'
    });
  };

  const handleShowSettings = () => {
    setActiveView('settings');
    toast.success('Settings', {
      description: 'Opening admin settings panel...'
    });
  };

  const handleShowImport = () => {
    toast.info('Import Data', {
      description: 'Import from Jira, Trello, or upload CSV files - Coming soon!'
    });
  };

  const handleNotifications = () => {
    toast.info('Notifications', {
      description: 'You have 3 unread notifications'
    });
  };

  // Handle quick actions
  const handleImportFromJira = () => {
    toast.info('Import from Jira', {
      description: 'Jira integration will be available soon. Connect your Jira account to migrate projects.'
    });
  };

  const handleInviteTeam = () => {
    toast.info('Invite Team Members', {
      description: 'Team collaboration features coming soon. Invite members via email.'
    });
  };

  const handleViewAnalytics = () => {
    toast.info('View Analytics', {
      description: 'Analytics dashboard with insights and metrics - Coming soon!'
    });
  };

  const handleFilterWorkspaces = () => {
    toast.info('Filter Workspaces', {
      description: 'Filter by type, status, or team - Feature coming soon!'
    });
  };

  const handleSortWorkspaces = () => {
    toast.info('Sort Workspaces', {
      description: 'Sort by name, date, or activity - Feature coming soon!'
    });
  };

  // Handle AI Search submission
  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      setAiSearchQuery(query);
      setShowAISearchResults(true);
      toast.info('🔍 AI Search', {
        description: `Searching for "${query}"...`
      });
    }
  };

  return (
    <GlassDashboardWrapper>
      {(() => {
        console.log('Render state check:', {
          activeView,
          hasSelectedWorkspace: !!selectedWorkspace,
          hasSelectedArticleSpace: !!selectedArticleSpace,
          selectedWorkspaceName: selectedWorkspace?.workspace?.name
        });
      })()}
      {activeView === 'settings' ? (
        // Show Admin Settings when settings is selected
        <AdminSettings onBack={() => setActiveView('dashboard')} />
      ) : activeView === 'team-space' ? (
        // Show Team Space when team-space is selected in sidebar
        <TeamSpace onBack={() => setActiveView('dashboard')} />
      ) : selectedArticleSpace ? (
        // Show Article Space View when a space is selected
        <ArticleSpaceView
          space={selectedArticleSpace}
          onBack={() => setSelectedArticleSpace(null)}
        />
      ) : selectedWorkspace ? (
        // Show workspace view when a workspace is selected
        <div className="flex h-screen flex-col">
          <GlassHeader
            onCreateWorkspace={() => setShowZCPCWizard(true)}
            onShowCommands={() => handleShowCommands()}
            onShowSettings={() => handleShowSettings()}
            onShowImport={() => handleShowImport()}
            onLogout={onLogout}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            notificationCount={3}
            onLogoClick={handleLogoClick}
            onShowNotifications={handleNotifications}
            isWorkspaceView={true}
            workspaceName={selectedWorkspace.workspace?.name || 'Workspace'}
            onCreateTicket={() => {
              setAICommandContext('ticket');
              setShowAICommandInput(true);
              toast.info('AI Ticket Creator', {
                description: 'Create epics, stories, or subtasks with AI!'
              });
            }}
          />
          <div className="flex-1 overflow-hidden">
            <WorkspaceView
              workspace={selectedWorkspace}
              onBack={() => setSelectedWorkspace(null)}
              onWorkspaceUpdate={(updatedWorkspace) => {
                console.log('🔄 Workspace updated in parent:', updatedWorkspace);
                setSelectedWorkspace(updatedWorkspace);
                
                // Also update the workspace in the workspaces list
                setWorkspaces(prev => prev.map(ws => 
                  ws.id === updatedWorkspace.id ? updatedWorkspace : ws
                ));
              }}
            />
          </div>
        </div>
      ) : activeView === 'article-space' ? (
        // Show Article Space List when Article Space is selected in sidebar
        <ArticleSpaceList
          onSelectSpace={(space) => setSelectedArticleSpace(space)}
          onCreateSpace={() => {
            toast.info('Create Article Space', {
              description: 'Article space creation coming soon!'
            });
          }}
          onBack={() => setActiveView('dashboard')}
          accessToken={currentAccessToken}
        />
      ) : (
        // Show dashboard when no workspace is selected
        <div className="flex flex-col h-screen">
          {/* Header - Full Width */}
          <GlassHeader
            onCreateWorkspace={() => setShowZCPCWizard(true)}
            onShowCommands={() => handleShowCommands()}
            onShowSettings={() => handleShowSettings()}
            onShowImport={() => handleShowImport()}
            onLogout={onLogout}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearchSubmit}
            notificationCount={3}
            onLogoClick={handleLogoClick}
            onShowNotifications={handleNotifications}
          />

          {/* Sidebar + Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <GlassSidebar
              activeView={activeView}
              onNavigate={setActiveView}
              onLogout={onLogout}
              onCreateItem={handleCreateItem}
              onLogoClick={handleLogoClick}
              workspaces={workspaces}
              onWorkspaceSelect={(workspace) => {
                console.log('Workspace selected:', workspace);
                setSelectedWorkspace(workspace);
                console.log('selectedWorkspace state updated');
                toast.success('Opening Workspace', {
                  description: `Loading ${workspace.workspace?.name}...`
                });
              }}
              onArticleSpaceSelect={(space) => {
                setSelectedArticleSpace(space);
                toast.success('Opening Article Space', {
                  description: `Loading ${space.name}...`
                });
              }}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Welcome Banner */}
                <div className="glass-strong rounded-2xl p-8 mb-6 border border-slate-200/30 relative overflow-hidden">
                  {/* Gradient overlay */}
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/40 to-transparent pointer-events-none"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">
                            ✨ Glass UI
                          </Badge>
                          <Badge className="glass-dark text-gray-700 border-blue-200/30">
                            Light Theme
                          </Badge>
                        </div>
                        <h1 className="text-2xl font-bold mb-3">
                          Welcome to <span className="text-gradient">Projify AI</span>
                        </h1>
                        <p className="text-base text-gray-600 mb-6">
                          Experience the stunning glassmorphism design with animated gradients, 
                          floating particles, and smooth effects. Your workspace has never looked this good! ✨
                        </p>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            className="glass-dark border-slate-200/30 hover:border-blue-300 hover:bg-blue-50 text-gray-700"
                            onClick={() => setShowZCPCWizard(true)}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Try AI Commands
                          </Button>
                        </div>
                      </div>
                      
                      {/* Floating stats */}
                      <div className="hidden lg:flex flex-col gap-3">
                        {[
                          { icon: TrendingUp, value: '↑ 45%', label: 'Productivity', color: 'from-blue-600 to-blue-700' },
                          { icon: Users, value: '12+', label: 'Team Members', color: 'from-slate-600 to-slate-700' },
                          { icon: Zap, value: '99.9%', label: 'Uptime', color: 'from-cyan-600 to-cyan-700' },
                        ].map((stat, i) => (
                          <div 
                            key={`stat-${stat.label}-${i}`}
                            className="glass-strong rounded-xl p-4 min-w-[140px] border border-blue-200/30 floating"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-lg font-bold text-gray-800">{stat.value}</span>
                            </div>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workspaces Grid */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Your Workspaces</h2>
                      <p className="text-gray-500 text-sm mt-1">Manage and organize all your projects</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="glass-dark border-blue-200/30 text-gray-700 hover:bg-blue-50" onClick={handleFilterWorkspaces}>
                        Filter
                      </Button>
                      <Button variant="outline" className="glass-dark border-blue-200/30 text-gray-700 hover:bg-blue-50" onClick={handleSortWorkspaces}>
                        Sort
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {isLoadingWorkspaces ? (
                      <div className="col-span-full text-center py-12">
                        <div className="inline-flex items-center gap-3 px-6 py-4 glass-strong rounded-2xl border border-blue-200/30">
                          <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                          <p className="text-gray-700 font-medium">Loading your workspaces...</p>
                        </div>
                      </div>
                    ) : workspaces.length > 0 ? (
                      workspaces.map((workspace) => (
                        <GlassWorkspaceCard
                          key={workspace.id}
                          workspace={workspace}
                          onClick={() => {
                            // Create a mock full workspace object for demo
                            const backlogData = generateSampleBacklog(workspace.key);
                            
                            console.log('=== WORKSPACE CLICK DEBUG ===');
                            console.log('Workspace Key:', workspace.key);
                            console.log('Generated Backlog Data:', backlogData);
                            console.log('Epics in backlog:', backlogData.epics);
                            console.log('Epics count:', backlogData.epics.length);
                            
                            const fullWorkspace = {
                              id: workspace.id,
                              workspace: {
                                id: workspace.id,
                                name: workspace.name,
                                key: workspace.key,
                                description: workspace.description,
                                type: workspace.type,
                                created_at: workspace.created_at
                              },
                              methodology: {
                                type: workspace.type,
                                estimationModel: 'story_points',
                                sprintCadence: 2,
                                reasoning: 'Agile methodology selected for iterative development'
                              },
                              stats: {
                                projects: backlogData.projects.length,
                                epics: backlogData.epics.length,
                                stories: backlogData.stories.length,
                                subtasks: backlogData.subtasks.length
                              },
                              workflow: {
                                states: ['To Do', 'In Progress', 'In Review', 'Done']
                              },
                              issueTypes: [
                                { name: 'Epic', icon: 'layers', color: 'purple', hierarchy: 1 },
                                { name: 'Story', icon: 'book', color: 'blue', hierarchy: 2 },
                                { name: 'Subtask', icon: 'check-square', color: 'green', hierarchy: 3 }
                              ],
                              roles: [
                                { name: 'Product Owner', permissions: ['admin'] },
                                { name: 'Scrum Master', permissions: ['manage'] },
                                { name: 'Developer', permissions: ['edit'] }
                              ],
                              backlog: {
                                projects: backlogData.projects,
                                epics: backlogData.epics,
                                stories: backlogData.stories,
                                subtasks: backlogData.subtasks
                              },
                              sprints: {
                                cadence: 2,
                                sprints: []
                              },
                              capacity: {
                                totalPoints: 50,
                                velocity: 25
                              },
                              reports: {
                                dashboards: ['Burndown Chart', 'Velocity Chart'],
                                kpis: []
                              },
                              integrations: {
                                recommended: ['Slack', 'GitHub']
                              }
                            };
                            
                            console.log('Full Workspace Object:', fullWorkspace);
                            console.log('Full Workspace Backlog:', fullWorkspace.backlog);
                            console.log('=== END DEBUG ===');
                            
                            setSelectedWorkspace(fullWorkspace);
                          }}
                          onDelete={() => handleDeleteWorkspace(workspace.name)}
                          onEdit={() => handleEditWorkspace(workspace.name)}
                          onViewReports={() => handleViewReports(workspace.name)}
                          onExport={() => handleExportWorkspace(workspace.name)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center">
                        <p className="text-gray-500">No workspaces found. Create a new one using the button below.</p>
                      </div>
                    )}

                    {/* Create New Card */}
                    <button 
                      onClick={() => setShowZCPCWizard(true)}
                      className="glass border-2 border-dashed border-gray-200 hover:border-blue-500/50 rounded-2xl p-6 min-h-[300px] flex flex-col items-center justify-center gap-4 group transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 mb-1">Create New Workspace</p>
                        <p className="text-sm text-gray-600">Use AI to generate instantly</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="glass-strong rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        title: 'Import from Jira',
                        description: 'Migrate your existing projects',
                        icon: '📥',
                        color: 'from-blue-500 to-cyan-500'
                      },
                      {
                        title: 'Invite Team Members',
                        description: 'Collaborate with your team',
                        icon: '👥',
                        color: 'from-green-500 to-emerald-500'
                      },
                      {
                        title: 'View Analytics',
                        description: 'Track your progress',
                        icon: '📊',
                        color: 'from-blue-500 to-cyan-500'
                      },
                    ].map((action, i) => (
                      <button
                        key={`action-${action.title.replace(/\s+/g, '-')}-${i}`}
                        className="glass-dark rounded-xl p-4 text-left hover:scale-105 transition-all duration-300 border border-gray-200 hover:border-blue-300 group"
                        onClick={() => {
                          switch (action.title) {
                            case 'Import from Jira':
                              handleImportFromJira();
                              break;
                            case 'Invite Team Members':
                              handleInviteTeam();
                              break;
                            case 'View Analytics':
                              handleViewAnalytics();
                              break;
                            default:
                              break;
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                            {action.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">{action.title}</p>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZCPC Wizard */}
      <ZCPCWizard
        isOpen={showZCPCWizard}
        onClose={() => setShowZCPCWizard(false)}
        onComplete={async (workspace) => {
          console.log('Workspace created:', workspace);
          
          // Save workspace to database
          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspaces/create`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-Access-Token': currentAccessToken,
                  'Authorization': `Bearer ${publicAnonKey}`
                },
                body: JSON.stringify({
                  name: workspace.workspace?.name || 'New Workspace',
                  key: workspace.workspace?.key,
                  type: workspace.workspace?.type || workspace.methodology?.type || 'scrum',
                  description: workspace.workspace?.description || ''
                })
              }
            );

            if (response.ok) {
              const data = await response.json();
              console.log('Workspace saved to database:', data);
              
              // Update the workspace with the database ID and data
              workspace.id = data.workspace.id;
              workspace.workspace.id = data.workspace.id;
              workspace.workspace.name = data.workspace.name;
              workspace.workspace.key = data.workspace.key;
              workspace.workspace.type = data.workspace.type;
              workspace.workspace.description = data.workspace.description;
              
              toast.success('Workspace created successfully! 🎉', {
                description: `Opening ${data.workspace.name}...`
              });
              
              // Reload workspaces list from database
              await loadWorkspaces();
              
              // Open the newly created workspace with the database data
              setSelectedWorkspace(workspace);
              setShowZCPCWizard(false);
            } else {
              const errorData = await response.json();
              console.error('Failed to save workspace:', errorData);
              toast.error('Workspace created but failed to save', {
                description: errorData.error || 'Unknown error'
              });
            }
          } catch (error) {
            console.error('Error saving workspace:', error);
            toast.error('Workspace created but failed to save');
          }
        }}
      />

      {/* AI Command Input */}
      <AICommandInput
        isOpen={showAICommandInput}
        onClose={() => setShowAICommandInput(false)}
        onSubmit={handleAICommandSubmit}
        isGenerating={isGeneratingWorkspace}
        context={aiCommandContext}
        workspaces={workspaces}
      />

      {/* AI Search Results */}
      <AISearchResults
        isOpen={showAISearchResults}
        onClose={() => setShowAISearchResults(false)}
        searchQuery={aiSearchQuery}
        accessToken={currentAccessToken}
      />
    </GlassDashboardWrapper>
  );
}