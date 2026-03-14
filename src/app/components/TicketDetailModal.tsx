import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Edit2,
  Save,
  Trash2,
  Calendar,
  User,
  Tag,
  Clock,
  Flag,
  Paperclip,
  MessageSquare,
  Link2,
  ChevronDown,
  MoreVertical,
  Copy,
  Archive,
  GitBranch,
  CheckSquare,
  AlertCircle,
  Ticket
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Card } from './ui/card';
import { UnifiedModal } from './UnifiedModal';
import { UnifiedButton } from './UnifiedButtons';
import { UnifiedField, UnifiedInput, UnifiedTextarea, UnifiedSelect } from './UnifiedForm';
import { UnifiedTabsPanel } from './UnifiedPanel';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  workspaceKey: string;
  accessToken?: string;
  onUpdate?: (updatedTicket: any) => void;
  onDelete?: (ticketId: string) => void;
}

export function TicketDetailModal({
  isOpen,
  onClose,
  ticket: initialTicket,
  workspaceKey,
  accessToken,
  onUpdate,
  onDelete
}: TicketDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ticket, setTicket] = useState(initialTicket);
  const [editedTicket, setEditedTicket] = useState(initialTicket);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');

  useEffect(() => {
    setTicket(initialTicket);
    setEditedTicket(initialTicket);
  }, [initialTicket]);

  const handleSave = async () => {
    if (!editedTicket.title?.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/stories/${editedTicket.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken || ''
          },
          body: JSON.stringify({
            title: editedTicket.title,
            description: editedTicket.description,
            status: editedTicket.status,
            priority: editedTicket.priority,
            assignee: editedTicket.assignee,
            dueDate: editedTicket.dueDate,
            estimatedHours: editedTicket.estimatedHours,
            labels: editedTicket.labels
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }

      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      setIsEditing(false);
      toast.success('Ticket updated successfully');
      
      if (onUpdate) {
        onUpdate(updatedTicket);
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/stories/${ticket.id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Access-Token': accessToken || ''
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete ticket');
      }

      toast.success('Ticket deleted successfully');
      if (onDelete) {
        onDelete(ticket.id);
      }
      onClose();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const comment = {
        id: `comment-${Date.now()}`,
        text: newComment,
        author: 'Current User',
        timestamp: new Date().toISOString(),
        ticketId: ticket.id
      };

      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleQuickStatusChange = async (newStatus: string) => {
    setEditedTicket({ ...editedTicket, status: newStatus });
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/stories/${ticket.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken || ''
          },
          body: JSON.stringify({
            ...ticket,
            status: newStatus
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      toast.success(`Status changed to ${newStatus}`);
      
      if (onUpdate) {
        onUpdate(updatedTicket);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
      setEditedTicket({ ...editedTicket, status: ticket.status });
    }
  };

  const handleQuickPriorityChange = async (newPriority: string) => {
    setEditedTicket({ ...editedTicket, priority: newPriority });
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/stories/${ticket.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken || ''
          },
          body: JSON.stringify({
            ...ticket,
            priority: newPriority
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update priority');

      const updatedTicket = await response.json();
      setTicket(updatedTicket);
      toast.success(`Priority changed to ${newPriority}`);
      
      if (onUpdate) {
        onUpdate(updatedTicket);
      }
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
      setEditedTicket({ ...editedTicket, priority: ticket.priority });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'highest':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      case 'lowest':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'TODO':
        return 'bg-gray-500';
      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return 'bg-blue-500';
      case 'IN_REVIEW':
      case 'IN REVIEW':
        return 'bg-purple-500';
      case 'DONE':
      case 'COMPLETED':
        return 'bg-green-500';
      case 'BLOCKED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E5E5E5' }}>
              <div className="flex items-center gap-3 flex-1">
                <Badge
                  className="text-white font-semibold px-3 py-1"
                  style={{ backgroundColor: '#14213D' }}
                >
                  {ticket.ticketId || `${workspaceKey}-${ticket.id?.slice(0, 4)}`}
                </Badge>
                {isEditing ? (
                  <Input
                    value={editedTicket.title || ''}
                    onChange={(e) => setEditedTicket({ ...editedTicket, title: e.target.value })}
                    className="text-xl font-bold border-0 focus-visible:ring-1 flex-1"
                    style={{ color: '#000000' }}
                    placeholder="Ticket title..."
                  />
                ) : (
                  <h2 className="text-xl font-bold" style={{ color: '#000000' }}>
                    {ticket.title || 'Untitled Ticket'}
                  </h2>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="text-white"
                      style={{ backgroundColor: '#14213D' }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedTicket(ticket);
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(ticket.ticketId || ticket.id);
                          toast.success('Ticket ID copied to clipboard');
                        }}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Ticket ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          const url = window.location.href;
                          navigator.clipboard.writeText(url);
                          toast.success('Link copied to clipboard');
                        }}>
                          <Link2 className="w-4 h-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Ticket
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
                <Button onClick={onClose} variant="ghost" size="icon">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Tabs */}
                <div className="flex gap-4 border-b mb-6" style={{ borderColor: '#E5E5E5' }}>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 px-2 font-medium transition-colors ${
                      activeTab === 'details'
                        ? 'border-b-2 text-[#14213D]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={activeTab === 'details' ? { borderColor: '#FCA311' } : {}}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={`pb-3 px-2 font-medium transition-colors ${
                      activeTab === 'comments'
                        ? 'border-b-2 text-[#14213D]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={activeTab === 'comments' ? { borderColor: '#FCA311' } : {}}
                  >
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Comments ({comments.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`pb-3 px-2 font-medium transition-colors ${
                      activeTab === 'activity'
                        ? 'border-b-2 text-[#14213D]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    style={activeTab === 'activity' ? { borderColor: '#FCA311' } : {}}
                  >
                    Activity
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                        Description
                      </label>
                      {isEditing ? (
                        <Textarea
                          value={editedTicket.description || ''}
                          onChange={(e) => setEditedTicket({ ...editedTicket, description: e.target.value })}
                          className="min-h-[200px] resize-y"
                          placeholder="Add a description..."
                        />
                      ) : (
                        <div
                          className="p-4 rounded-lg border min-h-[100px]"
                          style={{ backgroundColor: '#F5F5F5', borderColor: '#E5E5E5', color: '#000000' }}
                        >
                          {ticket.description || 'No description provided.'}
                        </div>
                      )}
                    </div>

                    {/* Subtasks */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-semibold" style={{ color: '#000000' }}>
                          <CheckSquare className="w-4 h-4 inline mr-2" style={{ color: '#FCA311' }} />
                          Subtasks
                        </label>
                        {isEditing && (
                          <Button size="sm" variant="outline">
                            <Plus className="w-3 h-3 mr-1" />
                            Add Subtask
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {ticket.subtasks && ticket.subtasks.length > 0 ? (
                          ticket.subtasks.map((subtask: any, index: number) => (
                            <Card key={index} className="p-3 flex items-center gap-3">
                              <input type="checkbox" checked={subtask.completed} className="w-4 h-4" />
                              <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                                {subtask.title}
                              </span>
                            </Card>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No subtasks yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <div>
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="mb-2"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        style={{ backgroundColor: '#14213D' }}
                        className="text-white"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comment
                      </Button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <Card key={comment.id} className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#FCA311' }}>
                                {comment.author.charAt(0)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold" style={{ color: '#000000' }}>
                                    {comment.author}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(comment.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p style={{ color: '#000000' }}>{comment.text}</p>
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No comments yet. Be the first to comment!</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4" style={{ color: '#FCA311' }} />
                        <span className="text-gray-600">
                          Created {new Date(ticket.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Edit2 className="w-4 h-4" style={{ color: '#FCA311' }} />
                        <span className="text-gray-600">
                          Last updated {new Date(ticket.updatedAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </Card>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="w-80 border-l p-6 overflow-y-auto" style={{ borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' }}>
                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                      Status
                    </label>
                    <Select
                      value={editedTicket.status || 'TODO'}
                      onValueChange={handleQuickStatusChange}
                      disabled={!isEditing && false} // Always enabled for quick updates
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          <Badge className={`${getStatusColor(editedTicket.status || 'TODO')} text-white`}>
                            {editedTicket.status?.replace('_', ' ') || 'TODO'}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">
                          <Badge className="bg-gray-500 text-white">TODO</Badge>
                        </SelectItem>
                        <SelectItem value="IN_PROGRESS">
                          <Badge className="bg-blue-500 text-white">IN PROGRESS</Badge>
                        </SelectItem>
                        <SelectItem value="IN_REVIEW">
                          <Badge className="bg-purple-500 text-white">IN REVIEW</Badge>
                        </SelectItem>
                        <SelectItem value="DONE">
                          <Badge className="bg-green-500 text-white">DONE</Badge>
                        </SelectItem>
                        <SelectItem value="BLOCKED">
                          <Badge className="bg-red-500 text-white">BLOCKED</Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                      <Flag className="w-4 h-4 inline mr-1" style={{ color: '#FCA311' }} />
                      Priority
                    </label>
                    <Select
                      value={editedTicket.priority || 'Medium'}
                      onValueChange={handleQuickPriorityChange}
                      disabled={!isEditing && false} // Always enabled for quick updates
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(editedTicket.priority || 'Medium')}`} />
                            {editedTicket.priority || 'Medium'}
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lowest">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-500" />
                            Lowest
                          </div>
                        </SelectItem>
                        <SelectItem value="Low">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            Low
                          </div>
                        </SelectItem>
                        <SelectItem value="Medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="High">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            High
                          </div>
                        </SelectItem>
                        <SelectItem value="Critical">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            Critical
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                      <User className="w-4 h-4 inline mr-1" style={{ color: '#FCA311' }} />
                      Assignee
                    </label>
                    {isEditing ? (
                      <Input
                        value={editedTicket.assignee || ''}
                        onChange={(e) => setEditedTicket({ ...editedTicket, assignee: e.target.value })}
                        placeholder="Unassigned"
                      />
                    ) : (
                      <div className="p-2 rounded border" style={{ borderColor: '#E5E5E5' }}>
                        {ticket.assignee || 'Unassigned'}
                      </div>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                      <Calendar className="w-4 h-4 inline mr-1" style={{ color: '#FCA311' }} />
                      Due Date
                    </label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editedTicket.dueDate || ''}
                        onChange={(e) => setEditedTicket({ ...editedTicket, dueDate: e.target.value })}
                      />
                    ) : (
                      <div className="p-2 rounded border" style={{ borderColor: '#E5E5E5' }}>
                        {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                    )}
                  </div>

                  {/* Estimated Hours */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                      <Clock className="w-4 h-4 inline mr-1" style={{ color: '#FCA311' }} />
                      Estimated Hours
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedTicket.estimatedHours || ''}
                        onChange={(e) => setEditedTicket({ ...editedTicket, estimatedHours: parseFloat(e.target.value) })}
                        placeholder="0"
                      />
                    ) : (
                      <div className="p-2 rounded border" style={{ borderColor: '#E5E5E5' }}>
                        {ticket.estimatedHours || 0}h
                      </div>
                    )}
                  </div>

                  {/* Labels */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                      <Tag className="w-4 h-4 inline mr-1" style={{ color: '#FCA311' }} />
                      Labels
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ticket.labels && ticket.labels.length > 0 ? (
                        ticket.labels.map((label: string, index: number) => (
                          <Badge key={index} variant="outline" style={{ borderColor: '#FCA311', color: '#FCA311' }}>
                            {label}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No labels</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}