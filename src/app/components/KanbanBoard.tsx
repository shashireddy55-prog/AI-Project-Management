import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getSupabaseClient } from '../../../utils/supabase/client';
import { Logo } from './Logo';
import { Loader2, ArrowLeft, Filter, Plus, Download, Share2, Users, Edit, Trash2, X, CheckCircle, Eye, ListTodo, Square, CheckSquare, Calendar, User, Flag, Tag, Clock, Link as LinkIcon, Sparkles, Settings } from 'lucide-react';
import { AICommandModal } from './AICommandModal';
import { IntegrationsModal } from './IntegrationsModal';
import { UserManagementModal } from './UserManagementModal';
import { BoardConfigModal } from './BoardConfigModal';
import { TicketDetailModal } from './TicketDetailModal';

interface KanbanBoardProps {
  workspaceId: string;
  accessToken: string;
  onBack: () => void;
}

interface Story {
  id: string;
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  epicId: string;
  sprintId: string | null;
  description?: string;
  tasks?: Task[];
}

interface Task {
  id: string;
  summary: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  startDate?: string;
  dueDate?: string;
  storyId: string;
  sprintId?: string;
  storyPoints?: number;
  assignee?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tags?: string[];
  createdAt: string;
}

interface Epic {
  id: string;
  title: string;
  projectId: string;
}

interface Sprint {
  id: string;
  name: string;
  projectId: string;
}

interface WorkspaceData {
  workspace: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    name: string;
  };
  epics: Epic[];
  stories: Story[];
  sprints: Sprint[];
}

const ITEM_TYPE = 'STORY';

interface DraggableStoryProps {
  story: Story;
  epic: Epic | undefined;
  onView: (story: Story) => void;
  onEdit: (story: Story) => void;
  onDelete: (storyId: string) => void;
}

function DraggableStory({ story, epic, onView, onEdit, onDelete }: DraggableStoryProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: story.id, currentStatus: story.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [showActions, setShowActions] = useState(false);
  const taskCount = story.tasks?.length || 0;
  const completedTasks = story.tasks?.filter(t => t.status === 'DONE').length || 0;

  return (
    <div
      ref={drag}
      className={`bg-white p-3 rounded-lg border shadow-sm cursor-move hover:shadow-md transition-shadow group ${
        isDragging ? 'opacity-50' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onView(story)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-gray-900 flex-1">{story.title}</p>
        {showActions && (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(story);
              }}
              className="p-1 rounded transition-colors hover:bg-[#E5E5E5]"
              title="View details"
            >
              <Eye className="w-3 h-3" style={{ color: '#14213D' }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(story);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Edit story"
            >
              <Edit className="w-3 h-3 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(story.id);
              }}
              className="p-1 rounded transition-colors hover:bg-[#E5E5E5]"
              title="Delete story"
            >
              <Trash2 className="w-3 h-3" style={{ color: '#FCA311' }} />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-2">
        {epic && (
          <Badge variant="outline" className="text-xs">
            {epic.title}
          </Badge>
        )}
        {taskCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <ListTodo className="w-3 h-3" />
            <span>{completedTasks}/{taskCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ColumnProps {
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  stories: Story[];
  epics: Epic[];
  onDrop: (storyId: string, newStatus: string) => void;
  onView: (story: Story) => void;
  onEdit: (story: Story) => void;
  onDelete: (storyId: string) => void;
}

function Column({ title, status, stories, epics, onDrop, onView, onEdit, onDelete }: ColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: string; currentStatus: string }) => {
      if (item.currentStatus !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const columnStories = stories.filter((s) => s.status === status);

  return (
    <div className="flex-1 min-w-[280px]">
      <div className="bg-gray-100 rounded-lg p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <Badge variant="secondary">{columnStories.length}</Badge>
        </div>
        <div
          ref={drop}
          className={`space-y-3 min-h-[400px] rounded-lg p-2 transition-colors ${
            isOver ? 'bg-[#E5E5E5]' : ''
          }`}
        >
          {columnStories.map((story) => (
            <DraggableStory
              key={story.id}
              story={story}
              epic={epics.find((e) => e.id === story.epicId)}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({ workspaceId, accessToken, onBack }: KanbanBoardProps) {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentToken, setCurrentToken] = useState(accessToken);
  const [showAllSprints, setShowAllSprints] = useState(true);
  const [selectedEpic, setSelectedEpic] = useState<string | null>(null);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [showViewStoryModal, setShowViewStoryModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showViewTaskModal, setShowViewTaskModal] = useState(false);
  const [showAICommandModal, setShowAICommandModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showBoardConfigModal, setShowBoardConfigModal] = useState(false);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryEpic, setNewStoryEpic] = useState('');
  const [newStoryStatus, setNewStoryStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [newStoryDescription, setNewStoryDescription] = useState('');
  const [taskForm, setTaskForm] = useState({
    summary: '',
    description: '',
    status: 'TODO' as 'TODO' | 'IN_PROGRESS' | 'DONE',
    startDate: '',
    dueDate: '',
    sprintId: '',
    storyPoints: 0,
    assignee: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    tags: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    refreshAndLoadData();
  }, [workspaceId]);
  
  useEffect(() => {
    // Update token when prop changes
    setCurrentToken(accessToken);
  }, [accessToken]);

  const refreshAndLoadData = async () => {
    try {
      const supabase = getSupabaseClient();
      console.log('Refreshing session in KanbanBoard...');
      
      // Try to refresh the session
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        // If refresh fails, try getting the existing session
        const { data: { session: existingSession }, error: getError } = await supabase.auth.getSession();
        
        if (getError || !existingSession?.access_token) {
          console.error('Session error in KanbanBoard:', getError);
          toast.error('Session expired.');
          setTimeout(() => onBack(), 2000);
          return;
        }
        
        setCurrentToken(existingSession.access_token);
        await runMigration(existingSession.access_token);
        await loadWorkspaceData(existingSession.access_token);
        return;
      }
      
      if (!session?.access_token) {
        toast.error('Session expired.');
        setTimeout(() => onBack(), 2000);
        return;
      }
      
      console.log('Session refreshed in KanbanBoard');
      setCurrentToken(session.access_token);
      await runMigration(session.access_token);
      await loadWorkspaceData(session.access_token);
    } catch (error) {
      console.error('Error refreshing session in KanbanBoard:', error);
      toast.error('Session error.');
      setIsLoading(false);
    }
  };

  const runMigration = async (token: string) => {
    try {
      console.log('Running data migration to add projectId to stories...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/migrate/add-project-ids`,
        {
          method: 'POST',
          headers: {
            'X-Access-Token': token,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.storiesUpdated > 0 || result.epicsUpdated > 0) {
          console.log(`Migration completed: ${result.storiesUpdated} stories and ${result.epicsUpdated} epics updated`);
        }
      }
    } catch (error) {
      console.error('Migration error (non-critical):', error);
      // Don't show error to user as this is a background operation
    }
  };

  const loadWorkspaceData = async (token: string = currentToken) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspace/${workspaceId}`,
        {
          headers: {
            'X-Access-Token': token,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        toast.error('Failed to load workspace data');
        return;
      }

      const workspaceData = await response.json();
      console.log('📊 Workspace data received:', {
        workspace: workspaceData.workspace?.name,
        project: workspaceData.project?.name,
        epicsCount: workspaceData.epics?.length || 0,
        storiesCount: workspaceData.stories?.length || 0,
        sprintsCount: workspaceData.sprints?.length || 0
      });
      
      if (workspaceData.stories && workspaceData.stories.length > 0) {
        console.log('Sample story:', workspaceData.stories[0]);
      } else {
        console.warn('⚠️ No stories found in workspace data!');
      }
      
      setData(workspaceData);
    } catch (error) {
      console.error('Error loading workspace:', error);
      toast.error('Failed to load workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (storyId: string, newStatus: string) => {
    if (!data) return;

    // Optimistic update
    const updatedStories = data.stories.map((s) =>
      s.id === storyId ? { ...s, status: newStatus as Story['status'] } : s
    );
    setData({ ...data, stories: updatedStories });

    try {
      // Get fresh token before updating
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || currentToken;
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/story/${storyId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) {
        toast.error('Failed to update story');
        // Revert on failure
        loadWorkspaceData();
      } else {
        toast.success('Story updated');
      }
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error('Failed to update story');
      loadWorkspaceData();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Failed to load workspace</p>
            <Button onClick={onBack} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sprint1 = data.sprints.find((s) => s.name.includes('1') || s.name.includes('Sprint 1'));
  
  console.log('🔍 Board filtering:', {
    totalStories: data.stories.length,
    totalSprints: data.sprints.length,
    sprint1Found: !!sprint1,
    sprint1Id: sprint1?.id,
    showAllSprints
  });
  
  let filteredStories = showAllSprints 
    ? data.stories 
    : sprint1 
      ? data.stories.filter((s) => s.sprintId === sprint1.id)
      : data.stories;
  
  console.log('After sprint filter:', filteredStories.length);
  
  // Apply epic filter if selected
  if (selectedEpic) {
    filteredStories = filteredStories.filter((s) => s.epicId === selectedEpic);
    console.log('After epic filter:', filteredStories.length);
  }
  
  console.log('Final filtered stories to display:', filteredStories.length);

  const handleFilterBySprint = () => {
    setShowAllSprints(!showAllSprints);
    toast.info(showAllSprints ? 'Showing Sprint 1 only' : 'Showing all sprints');
  };

  const handleExport = () => {
    toast.info('Exporting workspace data...');
    // Create a simple export
    const exportData = {
      workspace: data.workspace,
      project: data.project,
      epics: data.epics,
      stories: data.stories,
      sprints: data.sprints
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.workspace.name.replace(/\s/g, '_')}_export.json`;
    a.click();
    toast.success('Workspace exported!');
  };

  const handleShare = () => {
    toast.info('Share functionality - Copy workspace link to clipboard');
    navigator.clipboard.writeText(window.location.href);
    toast.success('Workspace link copied to clipboard!');
  };

  const handleAddStory = () => {
    setNewStoryTitle('');
    setNewStoryDescription('');
    setNewStoryEpic(data?.epics[0]?.id || '');
    setNewStoryStatus('TODO');
    setShowAddStoryModal(true);
  };

  const handleViewStory = (story: Story) => {
    setViewingStory(story);
    setShowViewStoryModal(true);
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setNewStoryTitle(story.title);
    setNewStoryDescription(story.description || '');
    setNewStoryEpic(story.epicId);
    setNewStoryStatus(story.status);
    setShowEditStoryModal(true);
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }

    if (!data) return;

    // Optimistic update
    const updatedStories = data.stories.filter((s) => s.id !== storyId);
    setData({ ...data, stories: updatedStories });

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || currentToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/story/${storyId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        toast.error('Failed to delete story');
        loadWorkspaceData();
      } else {
        toast.success('Story deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error('Failed to delete story');
      loadWorkspaceData();
    }
  };

  const handleCreateStory = async () => {
    if (!newStoryTitle.trim()) {
      toast.error('Please enter a story title');
      return;
    }

    if (!newStoryEpic) {
      toast.error('Please select an epic');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || currentToken;

      const sprint1 = data?.sprints.find((s) => s.name.includes('1') || s.name.includes('Sprint 1'));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/story`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            workspaceId,
            title: newStoryTitle,
            description: newStoryDescription,
            epicId: newStoryEpic,
            sprintId: sprint1?.id || null,
            status: newStoryStatus
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`Failed to create story: ${errorData.error || 'Unknown error'}`);
        return;
      }

      toast.success('Story created successfully');
      setShowAddStoryModal(false);
      setNewStoryTitle('');
      setNewStoryDescription('');
      await loadWorkspaceData();
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Failed to create story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStory = async () => {
    if (!editingStory || !newStoryTitle.trim()) {
      toast.error('Please enter a story title');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || currentToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/story/${editingStory.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            title: newStoryTitle,
            description: newStoryDescription,
            epicId: newStoryEpic,
            status: newStoryStatus
          })
        }
      );

      if (!response.ok) {
        toast.error('Failed to update story');
        return;
      }

      toast.success('Story updated successfully');
      setShowEditStoryModal(false);
      setEditingStory(null);
      await loadWorkspaceData();
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error('Failed to update story');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAddTaskModal = () => {
    setTaskForm({
      summary: '',
      description: '',
      status: 'TODO',
      startDate: '',
      dueDate: '',
      sprintId: data?.sprints[0]?.id || '',
      storyPoints: 0,
      assignee: '',
      priority: 'MEDIUM',
      tags: []
    });
    setShowAddTaskModal(true);
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      summary: task.summary,
      description: task.description || '',
      status: task.status,
      startDate: task.startDate || '',
      dueDate: task.dueDate || '',
      sprintId: task.sprintId || data?.sprints[0]?.id || '',
      storyPoints: task.storyPoints || 0,
      assignee: task.assignee || '',
      priority: task.priority || 'MEDIUM',
      tags: task.tags || []
    });
    setShowViewTaskModal(false);
    setShowAddTaskModal(true);
  };

  const handleAddTask = async () => {
    if (!viewingStory || !taskForm.summary.trim()) {
      toast.error('Please enter a task summary');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || currentToken;

      const taskData = {
        ...taskForm,
        storyId: viewingStory.id
      };

      const url = editingTask 
        ? `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/story/${viewingStory.id}/task/${editingTask.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/story/${viewingStory.id}/task`;

      const response = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': validToken,
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        toast.error(`Failed to ${editingTask ? 'update' : 'add'} task`);
        return;
      }

      const result = await response.json();
      toast.success(`Task ${editingTask ? 'updated' : 'added'} successfully`);
      setShowAddTaskModal(false);
      setEditingTask(null);
      
      // Update the viewing story with the new task
      setViewingStory(result.story);
      await loadWorkspaceData();
    } catch (error) {
      console.error('Error adding/updating task:', error);
      toast.error(`Failed to ${editingTask ? 'update' : 'add'} task`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
    setShowViewTaskModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!viewingStory) return;

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || currentToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/story/${viewingStory.id}/task/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        toast.error('Failed to delete task');
        return;
      }

      const result = await response.json();
      toast.success('Task deleted');
      setViewingStory(result.story);
      await loadWorkspaceData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleFilterByEpic = (epicId: string | null) => {
    setSelectedEpic(epicId);
    if (epicId) {
      const epic = data?.epics.find(e => e.id === epicId);
      toast.info(`Filtering by: ${epic?.title}`);
    } else {
      toast.info('Showing all epics');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
        <div className="max-w-7xl mx-auto py-6 space-y-6">
          {/* Debug Info Banner */}
          {data.stories.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Debug Info:</strong> No stories found in workspace. 
                Epics: {data.epics.length}, Sprints: {data.sprints.length}. 
                Check browser console for detailed logs.
              </p>
            </div>
          )}
          {data.stories.length > 0 && filteredStories.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Filter Info:</strong> {data.stories.length} total stories, but 0 shown after filtering. 
                Sprint filter: {showAllSprints ? 'OFF (showing all)' : 'ON (Sprint 1 only)'}. 
                Epic filter: {selectedEpic ? 'ON' : 'OFF'}. 
                Try clicking "All Sprints" button.
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={onBack} className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">{data.workspace.name}</h1>
              {data.project && (
                <p className="text-gray-600 mt-1">{data.project.name}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowBoardConfigModal(true)} title="Board Configuration">
                <Settings className="w-4 h-4 mr-2" />
                Configuration
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAICommandModal(true)} title="AI Command Center">
                <Sparkles className="w-4 h-4 mr-2" />
                AI
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowIntegrationsModal(true)} title="Integrations">
                <LinkIcon className="w-4 h-4 mr-2" />
                Integrations
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowUserManagementModal(true)} title="User Management">
                <Users className="w-4 h-4 mr-2" />
                Team
              </Button>
              <Button variant="outline" size="sm" onClick={handleAddStory}>
                <Plus className="w-4 h-4 mr-2" />
                Add Story
              </Button>
              <Button variant="outline" size="sm" onClick={handleFilterBySprint}>
                <Filter className="w-4 h-4 mr-2" />
                {showAllSprints ? 'Filter Sprint' : 'All Sprints'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              {sprint1 && !showAllSprints && (
                <Badge variant="default" className="text-sm px-3 py-1">
                  {sprint1.name}
                </Badge>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Epics</h2>
              {selectedEpic && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleFilterByEpic(null)}
                  className="text-xs"
                >
                  Clear Filter
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {data.epics.map((epic) => (
                <Badge 
                  key={epic.id} 
                  variant={selectedEpic === epic.id ? "default" : "secondary"} 
                  className="text-sm px-3 py-1 cursor-pointer transition-colors"
                  style={selectedEpic === epic.id ? { 
                    background: 'linear-gradient(135deg, #14213D, #1a2d52)',
                    color: '#FFFFFF'
                  } : {}}
                  onClick={() => handleFilterByEpic(selectedEpic === epic.id ? null : epic.id)}
                >
                  {epic.title}
                  <span className="ml-2 text-xs">
                    ({data.stories.filter(s => s.epicId === epic.id).length})
                  </span>
                </Badge>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Kanban Board - All Stories</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {data.stories.length} total {data.stories.length === 1 ? 'story' : 'stories'}
                {!showAllSprints && sprint1 && ` • Showing ${filteredStories.length} ${selectedEpic ? 'filtered' : `in ${sprint1.name}`}`}
                {showAllSprints && ` • Showing all sprints`}
                {selectedEpic && ` • Filtered by epic`}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-4">
                <Column
                  title="To Do"
                  status="TODO"
                  stories={filteredStories}
                  epics={data.epics}
                  onDrop={handleDrop}
                  onView={handleViewStory}
                  onEdit={handleEditStory}
                  onDelete={handleDeleteStory}
                />
                <Column
                  title="In Progress"
                  status="IN_PROGRESS"
                  stories={filteredStories}
                  epics={data.epics}
                  onDrop={handleDrop}
                  onView={handleViewStory}
                  onEdit={handleEditStory}
                  onDelete={handleDeleteStory}
                />
                <Column
                  title="Done"
                  status="DONE"
                  stories={filteredStories}
                  epics={data.epics}
                  onDrop={handleDrop}
                  onView={handleViewStory}
                  onEdit={handleEditStory}
                  onDelete={handleDeleteStory}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Story Modal */}
      {showAddStoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAddStoryModal(false)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New Story
              </CardTitle>
              <CardDescription>Create a new story in this workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storyTitle">Story Title</Label>
                  <Input
                    id="storyTitle"
                    placeholder="Enter story title..."
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storyDescription">Description (Optional)</Label>
                  <textarea
                    id="storyDescription"
                    placeholder="Add a detailed description..."
                    value={newStoryDescription}
                    onChange={(e) => setNewStoryDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="storyEpic">Epic</Label>
                  <select
                    id="storyEpic"
                    value={newStoryEpic}
                    onChange={(e) => setNewStoryEpic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {data?.epics.map((epic) => (
                      <option key={epic.id} value={epic.id}>
                        {epic.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storyStatus">Status</Label>
                  <select
                    id="storyStatus"
                    value={newStoryStatus}
                    onChange={(e) => setNewStoryStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateStory} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Story
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddStoryModal(false)} disabled={isSubmitting}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Story Modal */}
      {showEditStoryModal && editingStory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowEditStoryModal(false)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Story
              </CardTitle>
              <CardDescription>Update story details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editStoryTitle">Story Title</Label>
                  <Input
                    id="editStoryTitle"
                    placeholder="Enter story title..."
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editStoryDescription">Description (Optional)</Label>
                  <textarea
                    id="editStoryDescription"
                    placeholder="Add a detailed description..."
                    value={newStoryDescription}
                    onChange={(e) => setNewStoryDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="editStoryEpic">Epic</Label>
                  <select
                    id="editStoryEpic"
                    value={newStoryEpic}
                    onChange={(e) => setNewStoryEpic(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {data?.epics.map((epic) => (
                      <option key={epic.id} value={epic.id}>
                        {epic.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editStoryStatus">Status</Label>
                  <select
                    id="editStoryStatus"
                    value={newStoryStatus}
                    onChange={(e) => setNewStoryStatus(e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdateStory} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Update Story
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowEditStoryModal(false);
                    setEditingStory(null);
                  }} disabled={isSubmitting}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Story Modal - Using TicketDetailModal */}
      <TicketDetailModal
        isOpen={showViewStoryModal}
        onClose={() => {
          setShowViewStoryModal(false);
          setViewingStory(null);
        }}
        ticket={viewingStory || {}}
        workspaceKey={data?.workspace?.key || 'WSP'}
        accessToken={accessToken}
        onUpdate={(updatedTicket) => {
          // Refresh workspace data to show updates
          loadWorkspaceData();
          toast.success('Ticket updated successfully');
        }}
        onDelete={(ticketId) => {
          handleDeleteStory(ticketId);
          setShowViewStoryModal(false);
          setViewingStory(null);
        }}
      />

      {/* Add/Edit Task Modal */}
      {showAddTaskModal && viewingStory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddTaskModal(false)}>
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </CardTitle>
              <CardDescription>
                Parent Story: <span className="font-medium">{viewingStory.title}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Summary */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="taskSummary">Summary *</Label>
                    <Input
                      id="taskSummary"
                      placeholder="Enter task summary..."
                      value={taskForm.summary}
                      onChange={(e) => setTaskForm({ ...taskForm, summary: e.target.value })}
                      autoFocus
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="taskDescription">Description</Label>
                    <textarea
                      id="taskDescription"
                      placeholder="Detailed description of the task..."
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="taskStatus">Status</Label>
                    <select
                      id="taskStatus"
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="taskPriority">Priority</Label>
                    <select
                      id="taskPriority"
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="taskStartDate">Start Date</Label>
                    <Input
                      id="taskStartDate"
                      type="date"
                      value={taskForm.startDate}
                      onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                    />
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label htmlFor="taskDueDate">Due Date</Label>
                    <Input
                      id="taskDueDate"
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    />
                  </div>

                  {/* Sprint */}
                  <div className="space-y-2">
                    <Label htmlFor="taskSprint">Sprint</Label>
                    <select
                      id="taskSprint"
                      value={taskForm.sprintId}
                      onChange={(e) => setTaskForm({ ...taskForm, sprintId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Sprint</option>
                      {data?.sprints.map((sprint) => (
                        <option key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Story Points */}
                  <div className="space-y-2">
                    <Label htmlFor="taskStoryPoints">Story Points</Label>
                    <Input
                      id="taskStoryPoints"
                      type="number"
                      min="0"
                      max="100"
                      value={taskForm.storyPoints}
                      onChange={(e) => setTaskForm({ ...taskForm, storyPoints: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  {/* Assignee */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="taskAssignee">Assignee</Label>
                    <Input
                      id="taskAssignee"
                      placeholder="e.g., john@example.com or John Doe"
                      value={taskForm.assignee}
                      onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleAddTask} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {editingTask ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {editingTask ? 'Update Task' : 'Create Task'}
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddTaskModal(false);
                      setEditingTask(null);
                    }} 
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Task Modal */}
      {showViewTaskModal && viewingTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowViewTaskModal(false)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {viewingTask.status === 'DONE' ? (
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    ) : viewingTask.status === 'IN_PROGRESS' ? (
                      <Clock className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                    {viewingTask.summary}
                  </CardTitle>
                  <CardDescription className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant={viewingTask.status === 'DONE' ? 'default' : 'secondary'}>
                      {viewingTask.status === 'TODO' ? 'To Do' : viewingTask.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                    </Badge>
                    {viewingTask.priority && (
                      <Badge 
                        variant={viewingTask.priority === 'CRITICAL' ? 'destructive' : viewingTask.priority === 'HIGH' ? 'default' : 'secondary'}
                      >
                        {viewingTask.priority} Priority
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowViewTaskModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Parent Story */}
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <ListTodo className="w-4 h-4" />
                    Parent Story
                  </h3>
                  <p className="text-sm text-gray-600">{viewingStory?.title}</p>
                </div>

                {/* Description */}
                {viewingTask.description && (
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">Description</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewingTask.description}</p>
                  </div>
                )}

                {/* Task Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sprint */}
                  {viewingTask.sprintId && (
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Sprint
                      </h3>
                      <p className="text-sm text-gray-600">
                        {data?.sprints.find(s => s.id === viewingTask.sprintId)?.name || 'Unknown Sprint'}
                      </p>
                    </div>
                  )}

                  {/* Story Points */}
                  {viewingTask.storyPoints && viewingTask.storyPoints > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 mb-1 flex items-center gap-2">
                        <Flag className="w-4 h-4" />
                        Story Points
                      </h3>
                      <p className="text-sm text-gray-600">{viewingTask.storyPoints}</p>
                    </div>
                  )}

                  {/* Start Date */}
                  {viewingTask.startDate && (
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Start Date
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(viewingTask.startDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}

                  {/* Due Date */}
                  {viewingTask.dueDate && (
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 mb-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Due Date
                      </h3>
                      <p className={`text-sm ${new Date(viewingTask.dueDate) < new Date() && viewingTask.status !== 'DONE' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {new Date(viewingTask.dueDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                        {new Date(viewingTask.dueDate) < new Date() && viewingTask.status !== 'DONE' && ' (Overdue)'}
                      </p>
                    </div>
                  )}

                  {/* Assignee */}
                  {viewingTask.assignee && (
                    <div>
                      <h3 className="font-semibold text-sm text-gray-700 mb-1 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Assignee
                      </h3>
                      <p className="text-sm text-gray-600">{viewingTask.assignee}</p>
                    </div>
                  )}

                  {/* Created Date */}
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Created
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(viewingTask.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleOpenEditTaskModal(viewingTask)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Task
                  </Button>
                  <Button
                    onClick={() => {
                      if (window.confirm('Delete this task?')) {
                        setShowViewTaskModal(false);
                        handleDeleteTask(viewingTask.id);
                      }
                    }}
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
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
          workspaceId={workspaceId}
          accessToken={currentToken}
          onClose={() => setShowAICommandModal(false)}
          onWorkBreakdownGenerated={() => loadWorkspaceData()}
        />
      )}

      {/* Integrations Modal */}
      {showIntegrationsModal && (
        <IntegrationsModal
          workspaceId={workspaceId}
          accessToken={currentToken}
          onClose={() => setShowIntegrationsModal(false)}
        />
      )}

      {/* User Management Modal */}
      {showUserManagementModal && (
        <UserManagementModal
          workspaceId={workspaceId}
          accessToken={currentToken}
          onClose={() => setShowUserManagementModal(false)}
        />
      )}

      {/* Board Configuration Modal */}
      {showBoardConfigModal && (
        <BoardConfigModal
          onClose={() => setShowBoardConfigModal(false)}
          onSave={(config) => {
            console.log('Board configuration saved:', config);
            // Handle board configuration updates here
            // You can store in local state or send to backend
          }}
        />
      )}
    </DndProvider>
  );
}
