import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { FolderKanban, Plus, Loader2, X, Layers, Target, Briefcase } from 'lucide-react';

interface WorkspacesPanelProps {
  accessToken: string;
  onWorkspaceSelect: (workspaceId: string) => void;
  onClose: () => void;
}

interface Workspace {
  id: string;
  name: string;
  type?: 'kanban' | 'scrum' | 'business';
  createdAt: string;
  description?: string;
}

export function WorkspacesPanel({ accessToken, onWorkspaceSelect, onClose }: WorkspacesPanelProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    type: 'kanban' as 'kanban' | 'scrum' | 'business',
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/user/workspaces`,
        {
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load workspaces');
      }

      const data = await response.json();
      setWorkspaces(data.workspaces || []);
    } catch (error) {
      console.error('Error loading workspaces:', error);
      toast.error('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWorkspace.name.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspaces/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(newWorkspace)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      const data = await response.json();
      toast.success('Workspace created successfully!');
      setNewWorkspace({ name: '', type: 'kanban', description: '' });
      setShowCreateForm(false);
      loadWorkspaces();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'kanban':
        return <Layers className="w-4 h-4" />;
      case 'scrum':
        return <Target className="w-4 h-4" />;
      case 'business':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <FolderKanban className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'kanban':
        return 'text-white';
      case 'scrum':
        return 'text-white';
      case 'business':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex z-50" onClick={onClose}>
      <div 
        className="w-96 bg-white h-full shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-white p-6 flex items-center justify-between" style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)' }}>
          <div>
            <h2 className="text-2xl font-bold">Workspaces</h2>
            <p className="text-sm mt-1" style={{ color: '#E5E5E5' }}>Manage all your workspaces</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ backgroundColor: 'rgba(252, 163, 17, 0.2)' }}
          >
            <X className="w-5 h-5" style={{ color: '#FCA311' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create Button */}
          {!showCreateForm ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="w-full mb-6 text-white"
              style={{ backgroundColor: '#14213D' }}
            >
              <Plus className="w-4 h-4 mr-2" style={{ color: '#FCA311' }} />
              Create New Workspace
            </Button>
          ) : (
            <Card className="mb-6" style={{ borderColor: 'rgba(252, 163, 17, 0.3)' }}>
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#000000' }}>New Workspace</CardTitle>
                <CardDescription>Create a new workspace for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Workspace Name</Label>
                    <Input
                      id="name"
                      value={newWorkspace.name}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                      placeholder="Enter workspace name..."
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Workspace Type</Label>
                    <Select
                      value={newWorkspace.type}
                      onValueChange={(value: 'kanban' | 'scrum' | 'business') => 
                        setNewWorkspace({ ...newWorkspace, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kanban">Kanban</SelectItem>
                        <SelectItem value="scrum">Scrum</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={newWorkspace.description}
                      onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                      placeholder="Brief description..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewWorkspace({ name: '', type: 'kanban', description: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Workspaces List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FCA311' }} />
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No workspaces yet</p>
              <p className="text-sm text-gray-400">Create your first workspace to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                All Workspaces ({workspaces.length})
              </h3>
              {workspaces.map((workspace) => (
                <Card
                  key={workspace.id}
                  className="cursor-pointer hover:shadow-md transition-all group"
                  style={{ borderColor: '#E5E5E5' }}
                  onClick={() => {
                    onWorkspaceSelect(workspace.id);
                    onClose();
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#14213D' }}>
                        <FolderKanban className="w-5 h-5" style={{ color: '#FCA311' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold transition-colors truncate" style={{ color: '#000000' }}>
                          {workspace.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#14213D' }}>
                            {(workspace.type || 'kanban').toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(workspace.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {workspace.description && (
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {workspace.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}