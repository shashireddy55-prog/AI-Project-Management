import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Loader2, X, Plus, UserPlus, UserMinus, Shield, Mail, Crown, User, Edit, Trash2, CheckCircle, AlertCircle, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getSupabaseClient } from '../../../utils/supabase/client';

interface UserManagementModalProps {
  workspaceId?: string;
  accessToken: string;
  onClose: () => void;
}

interface WorkspaceUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'project_manager' | 'scrum_master' | 'developer' | 'qa' | 'product_owner' | 'stakeholder';
  status: 'active' | 'invited' | 'suspended';
  joinedAt: string;
  lastActive?: string;
  teams?: string[];
}

interface Team {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  workspaceIds: string[];
  createdAt: string;
  color?: string;
}

const ROLE_COLORS = {
  admin: 'bg-[#E5E5E5]',
  project_manager: 'bg-[#E5E5E5]',
  scrum_master: 'bg-[#E5E5E5]',
  developer: 'bg-[#E5E5E5]',
  qa: 'bg-[#E5E5E5]',
  product_owner: 'bg-[#E5E5E5]',
  stakeholder: 'bg-gray-100 text-gray-800'
};

const ROLE_TEXT_COLORS = {
  admin: '#14213D',
  project_manager: '#14213D',
  scrum_master: '#14213D',
  developer: '#14213D',
  qa: '#FCA311',
  product_owner: '#14213D',
  stakeholder: '#737373'
};

const ROLE_PERMISSIONS = {
  admin: ['All permissions', 'Manage users', 'Delete workspace', 'Configure integrations'],
  project_manager: ['Manage sprints', 'Assign tasks', 'View reports', 'Manage workflow'],
  scrum_master: ['Facilitate sprints', 'Manage backlog', 'Run ceremonies', 'View metrics'],
  developer: ['Create/edit stories', 'Update tasks', 'Comment', 'View board'],
  qa: ['Test stories', 'Create bugs', 'Update task status', 'View board'],
  product_owner: ['Prioritize backlog', 'Approve stories', 'View reports', 'Manage epics'],
  stakeholder: ['View-only access', 'Comment on items', 'View reports']
};

const TEAM_COLORS = [
  'bg-[#14213D]',
  'bg-[#14213D]',
  'bg-slate-500',
  'bg-[#14213D]',
  'bg-[#14213D]',
  'bg-slate-600',
  'bg-[#14213D]',
  'bg-[#14213D]'
];

export function UserManagementModal({ workspaceId, accessToken, onClose }: UserManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users');
  const [users, setUsers] = useState<WorkspaceUser[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editingUser, setEditingUser] = useState<WorkspaceUser | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'developer' as WorkspaceUser['role']
  });
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    color: TEAM_COLORS[0],
    memberIds: [] as string[],
    workspaceIds: workspaceId ? [workspaceId] : [] as string[]
  });

  useEffect(() => {
    loadData();
  }, [workspaceId, activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'users') {
        await loadUsers();
      } else {
        await loadTeams();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/users${workspaceId ? `?workspaceId=${workspaceId}` : ''}`,
        {
          method: 'GET',
          headers: {
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || getMockUsers());
      } else {
        setUsers(getMockUsers());
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers(getMockUsers());
    }
  };

  const loadTeams = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/teams${workspaceId ? `?workspaceId=${workspaceId}` : ''}`,
        {
          method: 'GET',
          headers: {
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      setTeams([]);
    }
  };

  const getMockUsers = (): WorkspaceUser[] => [
    {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }
  ];

  const handleInviteUser = async () => {
    if (!inviteForm.email) {
      toast.error('Email is required');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/users/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            ...inviteForm,
            workspaceId
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to invite user');
        return;
      }

      toast.success(`Invitation sent to ${inviteForm.email}`);
      setShowInviteModal(false);
      setInviteForm({ email: '', name: '', role: 'developer' });
      await loadUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to invite user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamForm.name) {
      toast.error('Team name is required');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/teams`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(teamForm)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to create team');
        return;
      }

      toast.success(`Team "${teamForm.name}" created successfully`);
      setShowCreateTeamModal(false);
      setTeamForm({
        name: '',
        description: '',
        color: TEAM_COLORS[0],
        memberIds: [],
        workspaceIds: workspaceId ? [workspaceId] : []
      });
      await loadTeams();
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/teams/${editingTeam.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(teamForm)
        }
      );

      if (!response.ok) {
        toast.error('Failed to update team');
        return;
      }

      toast.success('Team updated successfully');
      setShowEditTeamModal(false);
      setEditingTeam(null);
      await loadTeams();
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Delete team "${teamName}"? This will remove all team assignments.`)) {
      return;
    }

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/teams/${teamId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        toast.error('Failed to delete team');
        return;
      }

      toast.success('Team deleted successfully');
      await loadTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: WorkspaceUser['role']) => {
    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/users/${userId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ role: newRole, workspaceId })
        }
      );

      if (!response.ok) {
        toast.error('Failed to update user role');
        return;
      }

      toast.success('User role updated successfully');
      setEditingUser(null);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Remove ${userEmail} from this workspace?`)) {
      return;
    }

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/users/${userId}${workspaceId ? `?workspaceId=${workspaceId}` : ''}`,
        {
          method: 'DELETE',
          headers: {
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (!response.ok) {
        toast.error('Failed to remove user');
        return;
      }

      toast.success('User removed successfully');
      await loadUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignTeamToWorkspace = async (teamId: string, workspaceIdToAssign: string) => {
    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/teams/${teamId}/assign-workspace`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ workspaceId: workspaceIdToAssign })
        }
      );

      if (!response.ok) {
        toast.error('Failed to assign team to workspace');
        return;
      }

      toast.success('Team assigned to workspace successfully');
      await loadTeams();
    } catch (error) {
      console.error('Error assigning team:', error);
      toast.error('Failed to assign team');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      description: team.description || '',
      color: team.color || TEAM_COLORS[0],
      memberIds: team.memberIds || [],
      workspaceIds: team.workspaceIds || []
    });
    setShowEditTeamModal(true);
  };

  const toggleTeamMember = (userId: string) => {
    setTeamForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }));
  };

  const getRoleIcon = (role: WorkspaceUser['role']) => {
    switch (role) {
      case 'admin': return Crown;
      case 'project_manager': return Shield;
      case 'scrum_master': return User;
      default: return User;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
        <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                User & Team Management
              </CardTitle>
              <CardDescription>Manage team members, teams, and workspace assignments</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-4 border-b mb-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Users
              </div>
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'teams'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4" />
                Teams
              </div>
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : activeTab === 'users' ? (
            <div className="space-y-6">
              {/* Users Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {users.length} {users.length === 1 ? 'user' : 'users'}
                  </p>
                </div>
                <Button onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite User
                </Button>
              </div>

              {/* Users list */}
              <div className="space-y-2">
                {users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E5E5E5' }}>
                              <User className="w-5 h-5" style={{ color: '#14213D' }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm">{user.name || user.email}</h3>
                                {user.status === 'invited' && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Mail className="w-3 h-3 mr-1" />
                                    Invited
                                  </Badge>
                                )}
                                {user.status === 'suspended' && (
                                  <Badge variant="destructive" className="text-xs">
                                    Suspended
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                              
                              <div className="flex items-center gap-4 mt-2">
                                {editingUser?.id === user.id ? (
                                  <select
                                    value={user.role}
                                    onChange={(e) => handleUpdateUserRole(user.id, e.target.value as WorkspaceUser['role'])}
                                    className="text-xs px-2 py-1 border rounded"
                                  >
                                    <option value="admin">Admin</option>
                                    <option value="project_manager">Project Manager</option>
                                    <option value="scrum_master">Scrum Master</option>
                                    <option value="developer">Developer</option>
                                    <option value="qa">QA</option>
                                    <option value="product_owner">Product Owner</option>
                                    <option value="stakeholder">Stakeholder</option>
                                  </select>
                                ) : (
                                  <Badge className={`text-xs ${ROLE_COLORS[user.role]}`} style={{ color: ROLE_TEXT_COLORS[user.role as keyof typeof ROLE_TEXT_COLORS] }}>
                                    <RoleIcon className="w-3 h-3 mr-1" />
                                    {user.role.replace('_', ' ')}
                                  </Badge>
                                )}
                                
                                {user.lastActive && (
                                  <span className="text-xs text-gray-400">
                                    Last active: {new Date(user.lastActive).toLocaleDateString()}
                                  </span>
                                )}
                              </div>

                              {/* Role permissions */}
                              {ROLE_PERMISSIONS[user.role] && (
                                <div className="mt-3">
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Permissions:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {ROLE_PERMISSIONS[user.role].slice(0, 3).map((permission, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {permission}
                                      </Badge>
                                    ))}
                                    {ROLE_PERMISSIONS[user.role].length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{ROLE_PERMISSIONS[user.role].length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {editingUser?.id === user.id ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUser(null)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            )}
                            
                            {user.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveUser(user.id, user.email)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <UserMinus className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Teams Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    {teams.length} {teams.length === 1 ? 'team' : 'teams'}
                  </p>
                </div>
                <Button onClick={() => setShowCreateTeamModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </div>

              {/* Teams list */}
              <div className="space-y-3">
                {teams.length === 0 ? (
                  <div className="text-center py-12">
                    <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No teams created yet</p>
                    <Button onClick={() => setShowCreateTeamModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Team
                    </Button>
                  </div>
                ) : (
                  teams.map((team) => (
                    <Card key={team.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full ${team.color || 'bg-blue-500'} flex items-center justify-center`}>
                              <UsersIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm">{team.name}</h3>
                              {team.description && (
                                <p className="text-xs text-gray-500 mt-1">{team.description}</p>
                              )}
                              
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  <UsersIcon className="w-3 h-3 mr-1" />
                                  {(team.memberIds || []).length} {(team.memberIds || []).length === 1 ? 'member' : 'members'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {(team.workspaceIds || []).length} {(team.workspaceIds || []).length === 1 ? 'workspace' : 'workspaces'}
                                </Badge>
                              </div>

                              {/* Team members preview */}
                              {(team.memberIds || []).length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Members:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {(team.memberIds || []).slice(0, 5).map((memberId) => {
                                      const member = users.find(u => u.id === memberId);
                                      if (!member) return null;
                                      return (
                                        <Badge key={memberId} variant="outline" className="text-xs">
                                          {member.name || member.email}
                                        </Badge>
                                      );
                                    })}
                                    {(team.memberIds || []).length > 5 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{(team.memberIds || []).length - 5} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTeam(team)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteTeam(team.id, team.name)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setShowInviteModal(false)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Invite Team Member
              </CardTitle>
              <CardDescription>Send an invitation to join this workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email Address *</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteName">Full Name</Label>
                <Input
                  id="inviteName"
                  type="text"
                  placeholder="John Doe"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteRole">Role</Label>
                <select
                  id="inviteRole"
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as WorkspaceUser['role'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="developer">Developer</option>
                  <option value="qa">QA Engineer</option>
                  <option value="scrum_master">Scrum Master</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="product_owner">Product Owner</option>
                  <option value="stakeholder">Stakeholder</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {ROLE_PERMISSIONS[inviteForm.role] && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-900">
                    <strong>Permissions for {inviteForm.role.replace('_', ' ')}:</strong>
                  </p>
                  <ul className="text-xs text-blue-800 mt-1 space-y-1">
                    {ROLE_PERMISSIONS[inviteForm.role].slice(0, 3).map((permission, idx) => (
                      <li key={idx}>• {permission}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleInviteUser} disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowInviteModal(false)} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Team Modal */}
      {(showCreateTeamModal || showEditTeamModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => {
          setShowCreateTeamModal(false);
          setShowEditTeamModal(false);
          setEditingTeam(null);
        }}>
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-blue-600" />
                {editingTeam ? 'Edit Team' : 'Create Team'}
              </CardTitle>
              <CardDescription>
                {editingTeam ? 'Update team details and members' : 'Create a new team and assign members'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  type="text"
                  placeholder="Engineering Team"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamDescription">Description</Label>
                <Input
                  id="teamDescription"
                  type="text"
                  placeholder="Backend development team"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Team Color</Label>
                <div className="flex gap-2">
                  {TEAM_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setTeamForm({ ...teamForm, color })}
                      className={`w-8 h-8 rounded-full ${color} ${
                        teamForm.color === color ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Team Members ({teamForm.memberIds.length} selected)</Label>
                <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                  {users.length === 0 ? (
                    <p className="text-sm text-gray-500">No users available. Invite users first.</p>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => toggleTeamMember(user.id)}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={teamForm.memberIds.includes(user.id)}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name || user.email}</p>
                          <p className="text-xs text-gray-500">{user.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={editingTeam ? handleUpdateTeam : handleCreateTeam} disabled={isSaving} className="flex-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingTeam ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editingTeam ? <CheckCircle className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {editingTeam ? 'Update Team' : 'Create Team'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateTeamModal(false);
                    setShowEditTeamModal(false);
                    setEditingTeam(null);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
