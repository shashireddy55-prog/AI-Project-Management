import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Ticket,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  Layers,
  BookOpen,
  CheckSquare,
  ArrowUpDown,
  User,
  Calendar
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { toast } from 'sonner';
import { TicketDetailModal } from './TicketDetailModal';

interface TicketsListViewProps {
  workspace: any;
  onBack: () => void;
  onEditTicket?: (ticketId: string, ticketTitle: string, ticketType: string) => void;
  onDeleteTicket?: (ticketId: string, ticketTitle: string, ticketType: string) => void;
  onCreateTicket?: () => void;
}

export function TicketsListView({ 
  workspace, 
  onBack, 
  onEditTicket, 
  onDeleteTicket, 
  onCreateTicket 
}: TicketsListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'epic' | 'story' | 'subtask'>('all');
  const [sortField, setSortField] = useState<'id' | 'title' | 'type' | 'status' | 'priority'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Gather all tickets from workspace backlog
  const epics = workspace.backlog?.epics || [];
  const stories = workspace.backlog?.stories || [];
  const subtasks = workspace.backlog?.subtasks || [];

  // Debug logging
  console.log('TicketsListView - Workspace data:', workspace);
  console.log('TicketsListView - Epics:', epics.length);
  console.log('TicketsListView - Stories:', stories.length);
  console.log('TicketsListView - Subtasks:', subtasks.length);

  // Combine all tickets into a unified list
  const allTickets = [
    ...epics.map((epic: any) => ({
      ...epic,
      type: 'Epic',
      ticketId: epic.id,
      assignee: epic.owner,
      priority: epic.priority || epic.businessValue,
      icon: Layers,
      iconColor: 'text-purple-600',
      typeColor: 'bg-purple-100 text-purple-700 border-purple-300'
    })),
    ...stories.map((story: any) => ({
      ...story,
      type: 'Story',
      ticketId: story.id,
      assignee: story.assignee,
      priority: story.priority,
      icon: BookOpen,
      iconColor: 'text-blue-600',
      typeColor: 'bg-blue-100 text-blue-700 border-blue-300'
    })),
    ...subtasks.map((subtask: any) => ({
      ...subtask,
      type: 'Subtask',
      ticketId: subtask.id,
      assignee: subtask.assignee,
      priority: 'Medium', // Subtasks typically don't have priority
      icon: CheckSquare,
      iconColor: 'text-green-600',
      typeColor: 'bg-green-100 text-green-700 border-green-300'
    }))
  ];

  console.log('TicketsListView - Total tickets:', allTickets.length);
  console.log('✅ ALL TICKETS DATA:', allTickets);

  // Filter by type
  const filteredByType = filterType === 'all' 
    ? allTickets 
    : allTickets.filter(ticket => ticket.type.toLowerCase() === filterType);

  // Filter by search query
  const filteredTickets = filteredByType.filter((ticket: any) =>
    ticket.ticketId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort tickets
  const sortedTickets = [...filteredTickets].sort((a: any, b: any) => {
    let aValue, bValue;
    
    switch(sortField) {
      case 'id':
        aValue = a.ticketId || '';
        bValue = b.ticketId || '';
        break;
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'type':
        const typeOrder: any = { 'Epic': 1, 'Story': 2, 'Subtask': 3 };
        aValue = typeOrder[a.type] || 0;
        bValue = typeOrder[b.type] || 0;
        break;
      case 'status':
        aValue = a.status?.toLowerCase() || '';
        bValue = b.status?.toLowerCase() || '';
        break;
      case 'priority':
        const priorityOrder: any = { 'HIGH': 3, 'High': 3, 'Critical': 4, 'MEDIUM': 2, 'Medium': 2, 'LOW': 1, 'Low': 1 };
        aValue = priorityOrder[a.priority] || 0;
        bValue = priorityOrder[b.priority] || 0;
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: 'id' | 'title' | 'type' | 'status' | 'priority') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'to do':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Ticket className="w-7 h-7 text-indigo-600" />
                  All Tickets
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {sortedTickets.length} ticket{sortedTickets.length !== 1 ? 's' : ''} in {workspace.workspace?.name}
                </p>
              </div>
            </div>
            <Button 
              onClick={onCreateTicket}
              className="gap-2"
              style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)', color: 'white' }}
            >
              <Plus className="w-4 h-4" style={{ color: '#FCA311' }} />
              Create Ticket
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tickets by ID, title, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  {filterType === 'all' ? 'All Types' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterType('all')}>
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('epic')}>
                  <Layers className="w-4 h-4 mr-2 text-purple-600" />
                  Epics Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('story')}>
                  <BookOpen className="w-4 h-4 mr-2 text-blue-600" />
                  Stories Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType('subtask')}>
                  <CheckSquare className="w-4 h-4 mr-2 text-green-600" />
                  Subtasks Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[10%]">
                  <button
                    onClick={() => handleSort('id')}
                    className="flex items-center gap-2 font-semibold hover:text-indigo-600 transition-colors"
                  >
                    Ticket ID
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="w-[8%]">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-2 font-semibold hover:text-indigo-600 transition-colors"
                  >
                    Type
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="w-[32%]">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-2 font-semibold hover:text-indigo-600 transition-colors"
                  >
                    Title
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="w-[20%]">Description</TableHead>
                <TableHead className="w-[10%]">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-2 font-semibold hover:text-indigo-600 transition-colors"
                  >
                    Status
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="w-[10%]">
                  <button
                    onClick={() => handleSort('priority')}
                    className="flex items-center gap-2 font-semibold hover:text-indigo-600 transition-colors"
                  >
                    Priority
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="w-[10%]">Assignee</TableHead>
                <TableHead className="w-[5%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <p className="text-gray-500">
                      {searchQuery || filterType !== 'all' 
                        ? 'No tickets found matching your filters.' 
                        : 'No tickets yet.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedTickets.map((ticket: any, index: number) => {
                  const IconComponent = ticket.icon;
                  return (
                    <motion.tr
                      key={ticket.ticketId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-indigo-50/30 transition-colors border-b"
                    >
                      <TableCell className="font-medium">
                        <span className="font-mono text-sm font-bold" style={{ color: '#14213D' }}>
                          {ticket.ticketId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={ticket.typeColor}>
                          <IconComponent className="w-3 h-3 mr-1" />
                          {ticket.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-4 h-4 ${ticket.iconColor} flex-shrink-0`} />
                          <span className="font-semibold text-gray-900 line-clamp-1">
                            {ticket.title}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {ticket.description || 'No description'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.priority ? (
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {ticket.assignee ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{ticket.assignee}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowTicketDetailModal(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit Ticket
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                if (onDeleteTicket) {
                                  onDeleteTicket(ticket.ticketId, ticket.title, ticket.type);
                                } else {
                                  toast.error('Delete Ticket', {
                                    description: `Deleting ${ticket.ticketId}: ${ticket.title}`
                                  });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          isOpen={showTicketDetailModal}
          onClose={() => {
            setShowTicketDetailModal(false);
            setSelectedTicket(null);
          }}
          ticket={selectedTicket}
          workspaceKey={workspace.workspace?.key || workspace.key || 'WSP'}
          onUpdate={(updatedTicket) => {
            // Call parent callback if provided
            if (onEditTicket) {
              onEditTicket(updatedTicket.ticketId, updatedTicket.title, updatedTicket.type);
            }
            setShowTicketDetailModal(false);
            setSelectedTicket(null);
          }}
          onDelete={(ticketId) => {
            // Call parent callback if provided
            if (onDeleteTicket) {
              onDeleteTicket(ticketId, selectedTicket.title, selectedTicket.type);
            }
            setShowTicketDetailModal(false);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
}