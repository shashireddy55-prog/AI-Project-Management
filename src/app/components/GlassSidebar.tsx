import { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Target, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Sparkles,
  Plus,
  Home,
  Workflow,
  Calendar,
  FileText,
  Kanban,
  ChevronDown,
  ChevronRight,
  Circle,
  MessageSquare
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'motion/react';

interface GlassSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onCreateItem?: (itemType: string) => void;
  onLogoClick?: () => void;
  onWorkspaceSelect?: (workspace: any) => void;
  onArticleSpaceSelect?: (space: any) => void;
  workspaces?: any[];
}

// Sample data for each category
const sampleData = {
  dashboard: [
    { id: 'overview', name: 'Overview Dashboard', type: 'Main' },
    { id: 'analytics', name: 'Analytics', type: 'Reports' },
    { id: 'team-performance', name: 'Team Performance', type: 'Metrics' },
  ],
  boards: [
    { id: 'sprint-board', name: 'Sprint Board', type: 'Scrum' },
    { id: 'kanban-board', name: 'Kanban Board', type: 'Kanban' },
    { id: 'backlog', name: 'Product Backlog', type: 'Planning' },
  ],
  workspaces: [
    { id: 'mobile-banking', name: 'Mobile Banking App', type: 'Scrum' },
    { id: 'ecommerce', name: 'E-commerce Platform', type: 'Kanban' },
    { id: 'marketing', name: 'Marketing Campaign Q1', type: 'Business' },
    { id: 'ai-chatbot', name: 'AI Chatbot Integration', type: 'Agile' },
  ],
  'article-space': [
    { id: 'product-docs', name: 'Product Documentation', type: 'Docs' },
    { id: 'team-wiki', name: 'Team Wiki', type: 'Knowledge' },
    { id: 'api-guide', name: 'API Reference Guide', type: 'Technical' },
  ],
  'team-space': [
    { id: 'project-management', name: 'Project Management', type: 'Agile' },
    { id: 'task-tracking', name: 'Task Tracking', type: 'Scrum' },
    { id: 'time-logging', name: 'Time Logging', type: 'Business' },
    { id: 'resource-allocation', name: 'Resource Allocation', type: 'Planning' },
    { id: 'performance-reviews', name: 'Performance Reviews', type: 'Metrics' },
    { id: 'communication-tools', name: 'Communication Tools', type: 'Knowledge' },
  ],
};

export function GlassSidebar({ activeView, onNavigate, onLogout, onCreateItem, onLogoClick, onWorkspaceSelect, onArticleSpaceSelect, workspaces }: GlassSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('dashboard');

  // Only use real workspaces - NO sample data
  const workspacesList = workspaces && workspaces.length > 0
    ? workspaces.map(ws => ({
        id: ws.id,
        name: ws.workspace?.name || ws.name,
        type: ws.methodology?.type || ws.type || 'Scrum'
      }))
    : [];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboards', icon: LayoutDashboard, badge: '0' },
    { id: 'boards', label: 'Boards', icon: Kanban, badge: '0' },
    { id: 'workspaces', label: 'Workspaces', icon: FolderKanban, badge: workspacesList.length.toString() },
    { id: 'article-space', label: 'Article Spaces', icon: FileText, badge: '0' },
    { id: 'team-space', label: 'Team Space', icon: MessageSquare, badge: '0' },
  ];

  const handleSectionClick = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
      onNavigate(sectionId);
    }
  };

  const handleItemClick = (sectionId: string, itemId: string) => {
    // Handle workspace selection
    if (sectionId === 'workspaces' && onWorkspaceSelect) {
      // First, try to find the workspace in the real workspaces list
      if (workspaces && workspaces.length > 0) {
        const realWorkspace = workspaces.find(ws => ws.id === itemId);
        if (realWorkspace) {
          console.log('✅ Found real workspace with ID:', realWorkspace.id);
          onWorkspaceSelect(realWorkspace);
          return;
        }
      }
      
      // If not found in real workspaces, fall back to demo workspace creation
      const item = sampleData[sectionId as keyof typeof sampleData]?.find(i => i.id === itemId);
      if (item) {
        // Create a full workspace object for demo
        const workspaceId = `workspace-${item.id}`;
        const fullWorkspace = {
          id: workspaceId,
          workspace: {
            id: workspaceId,
            name: item.name,
            key: item.name.substring(0, 3).toUpperCase(),
            description: `${item.name} - ${item.type} methodology`,
            type: item.type.toLowerCase(),
            created_at: new Date().toISOString()
          },
          methodology: {
            type: item.type.toLowerCase(),
            estimationModel: 'story_points',
            sprintCadence: 2,
            reasoning: `${item.type} methodology selected for iterative development`
          },
          stats: {
            projects: 1,
            epics: Math.floor(Math.random() * 10) + 5,
            stories: Math.floor(Math.random() * 30) + 20,
            subtasks: Math.floor(Math.random() * 150) + 100
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
            epics: [],
            stories: [],
            subtasks: []
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
        onWorkspaceSelect(fullWorkspace);
        return;
      }
    }
    
    // Handle article space selection
    const item = sampleData[sectionId as keyof typeof sampleData]?.find(i => i.id === itemId);
    if (sectionId === 'article-space' && item && onArticleSpaceSelect) {
      const articleSpace = {
        id: item.id,
        name: item.name,
        type: item.type,
        description: `${item.name} - Comprehensive documentation and knowledge base`,
        icon: '📚',
        color: 'blue',
        articleCount: Math.floor(Math.random() * 50) + 10,
        lastUpdated: new Date().toISOString(),
        isFavorite: false
      };
      onArticleSpaceSelect(articleSpace);
      return;
    }
    
    // Default navigation for other sections
    onNavigate(`${sectionId}-${itemId}`);
  };

  return (
    <div className="w-64 glass border-r border-slate-200/30 flex flex-col h-full">
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto pt-6">
        {menuItems.map((item) => (
          <div key={item.id}>
            {/* Section Header */}
            <div className="group relative">
              <button
                onClick={() => handleSectionClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  expandedSection === item.id
                    ? 'glass-strong shadow-lg border-2'
                    : 'text-gray-700 hover:glass-dark'
                }`}
                style={expandedSection === item.id ? { borderColor: '#FCA311', color: '#000000' } : {}}
              >
                <item.icon className="w-5 h-5" style={{ color: expandedSection === item.id ? '#FCA311' : '#737373' }} />
                <span className="flex-1 text-left font-medium" style={{ color: '#000000' }}>{item.label}</span>
                <div className="flex items-center gap-1">
                  {item.badge && (
                    <Badge variant="outline" className="text-xs" style={{ borderColor: '#FCA311', color: '#FCA311', backgroundColor: 'rgba(252, 163, 17, 0.1)' }}>
                      {item.badge}
                    </Badge>
                  )}
                  {expandedSection === item.id ? (
                    <ChevronDown className="w-4 h-4" style={{ color: '#FCA311' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: '#737373' }} />
                  )}
                </div>
              </button>
              
              {/* Create Button - appears on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateItem?.(item.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transform transition-transform z-10 glow-orange"
                style={{ backgroundColor: '#FCA311' }}
                title={`Create ${item.label}`}
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Expandable List */}
            <AnimatePresence>
              {expandedSection === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 pl-2" style={{ borderColor: 'rgba(252, 163, 17, 0.3)' }}>
                    {item.id === 'workspaces' && workspacesList.length === 0 ? (
                      <div className="px-3 py-4 text-center">
                        <p className="text-xs text-gray-500 mb-2">No workspaces yet</p>
                        <p className="text-[10px] text-gray-400">Click + to create your first workspace</p>
                      </div>
                    ) : item.id !== 'workspaces' ? (
                      <div className="px-3 py-4 text-center">
                        <p className="text-xs text-gray-500 mb-2">No {item.label.toLowerCase()} yet</p>
                        <p className="text-[10px] text-gray-400">Create items to see them here</p>
                      </div>
                    ) : (
                      workspacesList.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleItemClick(item.id, subItem.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                            activeView === `${item.id}-${subItem.id}`
                              ? 'font-medium shadow-sm'
                              : 'hover:bg-slate-50'
                          }`}
                          style={activeView === `${item.id}-${subItem.id}` ? {
                            backgroundColor: 'rgba(20, 33, 61, 0.1)',
                            color: '#000000',
                            borderLeft: '3px solid #FCA311'
                          } : { color: '#737373' }}
                        >
                          <Circle 
                            className="w-2 h-2 fill-current" 
                            style={{ color: activeView === `${item.id}-${subItem.id}` ? '#FCA311' : '#D4D4D4' }} 
                          />
                          <span className="flex-1 text-left truncate">{subItem.name}</span>
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0"
                            style={activeView === `${item.id}-${subItem.id}` ? {
                              borderColor: '#FCA311',
                              color: '#FCA311',
                              backgroundColor: 'rgba(252, 163, 17, 0.1)'
                            } : {
                              borderColor: '#D4D4D4',
                              color: '#737373'
                            }}
                          >
                            {subItem.type}
                          </Badge>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-1 border-t border-slate-200/30">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
            activeView === 'settings'
              ? 'glass-strong shadow-lg'
              : 'text-gray-700 hover:glass-dark'
          }`}
          style={activeView === 'settings' ? { color: '#FCA311' } : {}}
        >
          <Settings className="w-5 h-5" style={{ color: activeView === 'settings' ? '#FCA311' : '#737373' }} />
          <span className="font-medium" style={{ color: '#000000' }}>Settings</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-red-600 hover:glass-dark hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}