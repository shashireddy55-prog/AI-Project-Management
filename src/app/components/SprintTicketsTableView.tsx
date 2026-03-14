import { ArrowLeft, User, Calendar, Target, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface SprintTicketsTableViewProps {
  tickets: any[];
  filterStatus: string;
  sprintName: string;
  onBack: () => void;
}

export function SprintTicketsTableView({ tickets, filterStatus, sprintName, onBack }: SprintTicketsTableViewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'To Do':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'epic':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'story':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'subtask':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4 mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sprint
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#000000]">
              {filterStatus} Tickets
            </h1>
            <p className="text-gray-600 mt-1">{sprintName}</p>
          </div>
          <Badge className={`${getStatusColor(filterStatus)} text-sm px-3 py-1`}>
            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
          </Badge>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          {tickets.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-[#000000]">Ticket ID</TableHead>
                    <TableHead className="font-semibold text-[#000000]">Type</TableHead>
                    <TableHead className="font-semibold text-[#000000] min-w-[300px]">Title</TableHead>
                    <TableHead className="font-semibold text-[#000000]">Status</TableHead>
                    <TableHead className="font-semibold text-[#000000]">Priority</TableHead>
                    <TableHead className="font-semibold text-[#000000]">Assignee</TableHead>
                    <TableHead className="font-semibold text-[#000000]">Story Points</TableHead>
                    <TableHead className="font-semibold text-[#000000]">Epic</TableHead>
                    <TableHead className="font-semibold text-[#000000]">Parent Story</TableHead>
                    <TableHead className="font-semibold text-[#000000]">Created Date</TableHead>
                    <TableHead className="font-semibold text-[#000000]">Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm font-medium text-[#000000]">
                        {ticket.id}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(ticket.type)} variant="outline">
                          {ticket.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-md">
                          <div className="text-[#000000] mb-1">{ticket.title}</div>
                          {ticket.description && (
                            <div className="text-xs text-gray-500 line-clamp-2">
                              {ticket.description}
                            </div>
                          )}
                        </div>
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
                        <div className="flex items-center gap-2">
                          {ticket.assignee && ticket.assignee !== 'Unassigned' ? (
                            <>
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{ticket.assignee}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">Unassigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {ticket.storyPoints ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {ticket.storyPoints} pts
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {ticket.epicId ? (
                          <span className="text-sm text-gray-700">{ticket.epicId}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {ticket.storyId ? (
                          <span className="text-sm text-gray-700">{ticket.storyId}</span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {ticket.createdDate ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(ticket.createdDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {ticket.dueDate ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(ticket.dueDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Found</h3>
              <p className="text-sm text-gray-500">
                There are no {filterStatus.toLowerCase()} tickets in this sprint.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
