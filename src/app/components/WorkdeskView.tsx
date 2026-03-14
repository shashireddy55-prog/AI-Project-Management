import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Loader2, Ticket, Plus, Search, Filter, User, Clock, AlertCircle, CheckCircle2, X, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { ReportsView } from './ReportsView';

interface WorkdeskViewProps {
  accessToken: string;
  workspaceId: string;
  workspaceName?: string;
  onClose: () => void;
}

interface ServiceTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: string;
  requester: string;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  slaStatus?: 'Met' | 'At Risk' | 'Breached';
}

export function WorkdeskView({ accessToken, workspaceId, workspaceName, onClose }: WorkdeskViewProps) {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'Medium' as const,
    category: 'General',
    requester: 'User'
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workdesk/${workspaceId}/tickets`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workdesk/${workspaceId}/tickets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(newTicket)
        }
      );

      if (response.ok) {
        toast.success('Ticket created successfully');
        setShowCreateModal(false);
        setNewTicket({
          subject: '',
          description: '',
          priority: 'Medium',
          category: 'General',
          requester: 'User'
        });
        loadTickets();
      } else {
        toast.error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: ServiceTicket['status']) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workdesk/${workspaceId}/tickets/${ticketId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        toast.success('Status updated');
        loadTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Waiting': return 'bg-orange-100 text-orange-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLAColor = (slaStatus?: string) => {
    switch (slaStatus) {
      case 'Met': return 'text-green-600';
      case 'At Risk': return 'text-yellow-600';
      case 'Breached': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const ticketCounts = {
    all: tickets.length,
    Open: tickets.filter(t => t.status === 'Open').length,
    'In Progress': tickets.filter(t => t.status === 'In Progress').length,
    Waiting: tickets.filter(t => t.status === 'Waiting').length,
    Resolved: tickets.filter(t => t.status === 'Resolved').length,
    Closed: tickets.filter(t => t.status === 'Closed').length,
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Ticket className="w-7 h-7" />
              {workspaceName || 'Workdesk'} - Service Desk
            </h1>
            <p className="text-blue-100 mt-1">Manage support tickets and customer requests</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setShowReports(true)}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
            <Button onClick={onClose} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Back
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-6 gap-3 mt-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`p-3 rounded-lg transition-all ${filterStatus === 'all' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`}
          >
            <div className="text-2xl font-bold">{ticketCounts.all}</div>
            <div className="text-xs text-blue-100">All Tickets</div>
          </button>
          <button
            onClick={() => setFilterStatus('Open')}
            className={`p-3 rounded-lg transition-all ${filterStatus === 'Open' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`}
          >
            <div className="text-2xl font-bold">{ticketCounts.Open}</div>
            <div className="text-xs text-blue-100">Open</div>
          </button>
          <button
            onClick={() => setFilterStatus('In Progress')}
            className={`p-3 rounded-lg transition-all ${filterStatus === 'In Progress' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`}
          >
            <div className="text-2xl font-bold">{ticketCounts['In Progress']}</div>
            <div className="text-xs text-blue-100">In Progress</div>
          </button>
          <button
            onClick={() => setFilterStatus('Waiting')}
            className={`p-3 rounded-lg transition-all ${filterStatus === 'Waiting' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`}
          >
            <div className="text-2xl font-bold">{ticketCounts.Waiting}</div>
            <div className="text-xs text-blue-100">Waiting</div>
          </button>
          <button
            onClick={() => setFilterStatus('Resolved')}
            className={`p-3 rounded-lg transition-all ${filterStatus === 'Resolved' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`}
          >
            <div className="text-2xl font-bold">{ticketCounts.Resolved}</div>
            <div className="text-xs text-blue-100">Resolved</div>
          </button>
          <button
            onClick={() => setFilterStatus('Closed')}
            className={`p-3 rounded-lg transition-all ${filterStatus === 'Closed' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'}`}
          >
            <div className="text-2xl font-bold">{ticketCounts.Closed}</div>
            <div className="text-xs text-blue-100">Closed</div>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search tickets by number or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Create your first support ticket to get started'}
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Card 
                key={ticket.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-blue-500"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setShowTicketDetail(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-gray-600">{ticket.ticketNumber}</span>
                          <Badge className={getStatusColor(ticket.status)} variant="secondary">
                            {ticket.status}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                            {ticket.priority}
                          </Badge>
                          {ticket.slaStatus && (
                            <span className={`text-xs font-medium ${getSLAColor(ticket.slaStatus)}`}>
                              SLA: {ticket.slaStatus}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ticket.requester}
                          </span>
                          {ticket.assignee && (
                            <span className="flex items-center gap-1">
                              Assigned to: {ticket.assignee}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <Card className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Create New Ticket</CardTitle>
                  <CardDescription>Submit a new support request</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of the issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Detailed description of the request or issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="General">General</option>
                    <option value="Technical">Technical</option>
                    <option value="Access">Access</option>
                    <option value="Bug">Bug</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requester">Requester Name</Label>
                <Input
                  id="requester"
                  placeholder="Your name"
                  value={newTicket.requester}
                  onChange={(e) => setNewTicket({ ...newTicket, requester: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTicket} className="flex-1">
                  Create Ticket
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showTicketDetail && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTicketDetail(false)}>
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-sm text-gray-600">{selectedTicket.ticketNumber}</span>
                    <Badge className={getStatusColor(selectedTicket.status)} variant="secondary">
                      {selectedTicket.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedTicket.priority)} variant="secondary">
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                  <CardTitle>{selectedTicket.subject}</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowTicketDetail(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600">{selectedTicket.description || 'No description provided'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">Requester</h4>
                  <p className="text-gray-600">{selectedTicket.requester}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">Assignee</h4>
                  <p className="text-gray-600">{selectedTicket.assignee || 'Unassigned'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">Category</h4>
                  <p className="text-gray-600">{selectedTicket.category}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">Created</h4>
                  <p className="text-gray-600">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {(['Open', 'In Progress', 'Waiting', 'Resolved', 'Closed'] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedTicket.status === status ? 'default' : 'outline'}
                      onClick={() => handleUpdateTicketStatus(selectedTicket.id, status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports View */}
      {showReports && (
        <ReportsView
          workspaceId={workspaceId}
          workspaceName={workspaceName || 'Workdesk'}
          workspaceType="workdesk"
          accessToken={accessToken}
          onClose={() => setShowReports(false)}
        />
      )}
    </div>
  );
}
