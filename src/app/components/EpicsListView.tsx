import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Layers,
  ArrowLeft,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  Target,
  Calendar,
  User,
  TrendingUp,
  BookOpen,
  ArrowUpDown
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
import { EditEpicModal } from './EditEpicModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { toast } from 'sonner';

interface EpicsListViewProps {
  workspace: any;
  onBack: () => void;
  onEditEpic?: (epicId: string, epicTitle: string) => void;
  onDeleteEpic?: (epicId: string, epicTitle: string) => void;
  onAddStoryToEpic?: (epicId: string, epicTitle: string) => void;
  onCreateEpic?: () => void;
}

export function EpicsListView({ 
  workspace, 
  onBack, 
  onEditEpic, 
  onDeleteEpic, 
  onAddStoryToEpic,
  onCreateEpic 
}: EpicsListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'title' | 'businessValue' | 'storyCount' | 'status'>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showEditEpicModal, setShowEditEpicModal] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<any>(null);

  const epics = workspace.backlog?.epics || [];
  
  // Debug logging
  console.log('EpicsListView - Workspace data:', workspace);
  console.log('EpicsListView - Backlog:', workspace.backlog);
  console.log('EpicsListView - Epics:', epics);
  console.log('EpicsListView - Epics count:', epics.length);
  
  // Alert to verify rendering
  if (epics.length > 0) {
    console.log('✅ EPICS FOUND:', epics.length, 'epics');
  } else {
    console.log('❌ NO EPICS FOUND - workspace.backlog:', workspace.backlog);
  }
  
  // Calculate story count for each epic
  const epicsWithStoryCount = epics.map((epic: any) => ({
    ...epic,
    storyCount: workspace.backlog?.stories?.filter((s: any) => s.epicId === epic.id).length || 0,
    status: epic.status || 'Not Started'
  }));

  // Filter epics based on search query
  const filteredEpics = epicsWithStoryCount.filter((epic: any) =>
    epic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    epic.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort epics
  const sortedEpics = [...filteredEpics].sort((a: any, b: any) => {
    let aValue, bValue;
    
    switch(sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'businessValue':
        const priorityOrder: any = { 'High': 3, 'Medium': 2, 'Low': 1 };
        aValue = priorityOrder[a.businessValue] || 0;
        bValue = priorityOrder[b.businessValue] || 0;
        break;
      case 'storyCount':
        aValue = a.storyCount;
        bValue = b.storyCount;
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
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

  const handleSort = (field: 'title' | 'businessValue' | 'storyCount' | 'status') => {
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
                  <Layers className="w-7 h-7 text-indigo-600" />
                  Epics
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {sortedEpics.length} epic{sortedEpics.length !== 1 ? 's' : ''} in {workspace.workspace?.name}
                </p>
              </div>
            </div>
            <Button 
              onClick={onCreateEpic}
              className="gap-2"
              style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)', color: 'white' }}
            >
              <Plus className="w-4 h-4" style={{ color: '#FCA311' }} />
              Create Epic
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search epics by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto p-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[40%]">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-2 font-semibold hover:text-indigo-600 transition-colors"
                  >
                    Epic Title
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="w-[25%]">Description</TableHead>
                <TableHead className="w-[10%]">
                  <button
                    onClick={() => handleSort('businessValue')}
                    className="flex items-center gap-2 font-semibold hover:text-indigo-600 transition-colors"
                  >
                    Priority
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
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
                    onClick={() => handleSort('storyCount')}
                    className="flex items-center gap-2 font-semibold hover:text-indigo-600 transition-colors"
                  >
                    Stories
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead className="w-[5%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEpics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <p className="text-gray-500">
                      {searchQuery ? 'No epics found matching your search.' : 'No epics yet.'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                sortedEpics.map((epic: any, index: number) => (
                  <motion.tr
                    key={epic.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-indigo-50/30 transition-colors border-b"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <span className="font-semibold text-gray-900">{epic.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {epic.description || 'No description'}
                      </p>
                    </TableCell>
                    <TableCell>
                      {epic.businessValue ? (
                        <Badge className={getPriorityColor(epic.businessValue)}>
                          {epic.businessValue}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(epic.status)}>
                        {epic.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-cyan-600" />
                        <span className="font-medium">{epic.storyCount}</span>
                      </div>
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
                              setSelectedEpic(epic);
                              setShowEditEpicModal(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Epic
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              if (onAddStoryToEpic) {
                                onAddStoryToEpic(epic.id, epic.title);
                              } else {
                                toast.info('Add Story', {
                                  description: `Adding story to ${epic.title}`
                                });
                              }
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Story
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (onDeleteEpic) {
                                onDeleteEpic(epic.id, epic.title);
                              } else {
                                toast.error('Delete Epic', {
                                  description: `Deleting ${epic.title}`
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
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Edit Epic Modal */}
      {selectedEpic && (
        <EditEpicModal
          isOpen={showEditEpicModal}
          onClose={() => {
            setShowEditEpicModal(false);
            setSelectedEpic(null);
          }}
          epic={selectedEpic}
          onUpdate={(updatedEpic) => {
            // Call parent callback if provided
            if (onEditEpic) {
              onEditEpic(updatedEpic.id, updatedEpic.title);
            }
            setShowEditEpicModal(false);
            setSelectedEpic(null);
          }}
          onDelete={(epicId) => {
            // Call parent callback if provided
            if (onDeleteEpic) {
              onDeleteEpic(epicId, selectedEpic.title);
            }
            setShowEditEpicModal(false);
            setSelectedEpic(null);
          }}
        />
      )}
    </div>
  );
}