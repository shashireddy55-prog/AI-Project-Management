import { useState, useMemo, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Plus, Link, X, Check, ChevronDown, Settings2, Filter, Eye, EyeOff, Grid3x3 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface TimelineGanttProps {
  workspace: any;
}

type ViewMode = 'days' | 'weeks' | 'months' | 'quarters';

interface Task {
  id: string;
  title: string;
  type: 'epic' | 'story' | 'subtask';
  status: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  assignee?: string;
  epicId?: string;
  storyId?: string;
  dependencies?: string[];
}

export function TimelineGantt({ workspace }: TimelineGanttProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('weeks');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDependencyDialog, setShowDependencyDialog] = useState(false);
  const [selectedTaskForDependency, setSelectedTaskForDependency] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  
  // State for collapse/expand functionality
  const [collapsedParents, setCollapsedParents] = useState<Set<string>>(new Set());

  // Timeline configuration state
  const [timelineConfig, setTimelineConfig] = useState({
    showWeekends: true,
    showDependencies: true,
    showProgressBars: true,
    showAssignees: true,
    rowHeight: 48, // in pixels
    autoScroll: true,
    highlightCriticalPath: false,
    showMilestones: true,
    groupBy: 'type' as 'type' | 'assignee' | 'status' | 'none',
    colorScheme: 'type' as 'type' | 'status' | 'priority'
  });

  // Form state for new ticket
  const [newTicket, setNewTicket] = useState({
    title: '',
    type: 'subtask' as 'epic' | 'story' | 'subtask',
    assignee: '',
    startDate: '',
    endDate: '',
    epicId: '',
    storyId: ''
  });

  // Generate tasks from workspace data
  const [tasks, setTasks] = useState<Task[]>(() => {
    const allTasks: Task[] = [];
    const today = new Date();
    
    // Add epics
    if (workspace.backlog?.epics) {
      workspace.backlog.epics.forEach((epic: any, index: number) => {
        const startDate = epic.createdAt ? new Date(epic.createdAt) : new Date(today.getTime() - (30 - index * 5) * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + (60 + index * 10) * 24 * 60 * 60 * 1000);
        const progress = epic.status === 'Done' ? 100 : epic.status === 'In Progress' ? 50 : 0;
        
        allTasks.push({
          id: epic.id,
          title: epic.title || epic.name,
          type: 'epic',
          status: epic.status,
          startDate,
          endDate,
          progress,
          assignee: epic.owner || epic.assignee,
          dependencies: []
        });
      });
    }

    // Add stories
    if (workspace.backlog?.stories) {
      workspace.backlog.stories.forEach((story: any, index: number) => {
        const startDate = story.createdAt ? new Date(story.createdAt) : new Date(today.getTime() - (20 - index * 3) * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + (14 + index * 2) * 24 * 60 * 60 * 1000);
        const progress = story.status === 'Done' ? 100 : story.status === 'In Progress' ? 60 : story.status === 'In Review' ? 80 : 0;
        
        allTasks.push({
          id: story.id,
          title: story.title,
          type: 'story',
          status: story.status,
          startDate,
          endDate,
          progress,
          assignee: story.assignee,
          epicId: story.epicId,
          dependencies: []
        });
      });
    }

    // Add subtasks
    if (workspace.backlog?.subtasks) {
      workspace.backlog.subtasks.forEach((subtask: any, index: number) => {
        const startDate = subtask.createdAt ? new Date(subtask.createdAt) : new Date(today.getTime() - (10 - index) * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + (5 + index) * 24 * 60 * 60 * 1000);
        const progress = subtask.status === 'Done' ? 100 : subtask.status === 'In Progress' ? 70 : 0;
        
        allTasks.push({
          id: subtask.id,
          title: subtask.title,
          type: 'subtask',
          status: subtask.status,
          startDate,
          endDate,
          progress,
          assignee: subtask.assignee,
          storyId: subtask.storyId,
          dependencies: []
        });
      });
    }

    return allTasks.sort((a, b) => {
      // Sort by type first (epics, then stories, then subtasks), then by start date
      const typeOrder = { epic: 0, story: 1, subtask: 2 };
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return a.startDate.getTime() - b.startDate.getTime();
    });
  });

  // Calculate date range based on tasks
  const dateRange = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
      };
    }

    const allDates = tasks.flatMap(t => [t.startDate, t.endDate]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add padding
    const start = new Date(minDate);
    start.setDate(start.getDate() - 14);
    const end = new Date(maxDate);
    end.setDate(end.getDate() + 14);
    
    return { start, end };
  }, [tasks]);

  // Generate timeline columns based on view mode
  const timelineColumns = useMemo(() => {
    const columns: { date: Date; label: string; isToday: boolean }[] = [];
    const current = new Date(dateRange.start);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (current <= dateRange.end) {
      let label = '';
      let nextDate = new Date(current);
      const currentDay = new Date(current);
      currentDay.setHours(0, 0, 0, 0);
      
      switch (viewMode) {
        case 'days':
          label = current.getDate().toString();
          if (current.getDate() === 1) {
            label = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weeks':
          const weekNum = Math.ceil((current.getDate() + 6 - current.getDay()) / 7);
          label = `W${weekNum}`;
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'months':
          label = current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'quarters':
          const quarter = Math.floor(current.getMonth() / 3) + 1;
          label = `Q${quarter} ${current.getFullYear()}`;
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
      }

      columns.push({ 
        date: new Date(current), 
        label,
        isToday: currentDay.getTime() === today.getTime()
      });
      current.setTime(nextDate.getTime());
    }

    return columns;
  }, [dateRange, viewMode]);

  // Calculate task bar position and width
  const getTaskBarStyle = (task: Task) => {
    const totalDays = (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24);
    const taskStart = (task.startDate.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24);
    const taskDuration = (task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    const left = (taskStart / totalDays) * 100;
    const width = Math.max((taskDuration / totalDays) * 100, 1); // Minimum 1% width
    
    return { left: `${left}%`, width: `${width}%` };
  };

  // Calculate today marker position
  const getTodayMarkerPosition = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24);
    const todayOffset = (today.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24);
    const position = (todayOffset / totalDays) * 100;
    
    return position >= 0 && position <= 100 ? position : null;
  };

  // Get color based on task type
  const getTaskColor = (task: Task) => {
    switch (task.type) {
      case 'epic':
        return { bg: '#9333EA', light: '#E9D5FF', border: '#7C3AED' }; // Purple
      case 'story':
        return { bg: '#3B82F6', light: '#DBEAFE', border: '#2563EB' }; // Blue
      case 'subtask':
        return { bg: '#10B981', light: '#D1FAE5', border: '#059669' }; // Green
      default:
        return { bg: '#6B7280', light: '#E5E7EB', border: '#4B5563' }; // Gray
    }
  };

  // Navigate timeline
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case 'days':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'weeks':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 28 : -28));
        break;
      case 'months':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 3 : -3));
        break;
      case 'quarters':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 12 : -12));
        break;
    }
    setCurrentDate(newDate);
  };

  // Scroll to today
  const scrollToToday = () => {
    if (scrollContainerRef.current) {
      const todayPosition = getTodayMarkerPosition();
      if (todayPosition !== null) {
        const scrollLeft = (todayPosition / 100) * scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth / 2;
        scrollContainerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
    setCurrentDate(new Date());
    toast.success('Scrolled to today');
  };

  // Get column width based on view mode
  const getColumnWidth = () => {
    switch (viewMode) {
      case 'days':
        return '60px';
      case 'weeks':
        return '100px';
      case 'months':
        return '120px';
      case 'quarters':
        return '150px';
      default:
        return '100px';
    }
  };

  // Handle create ticket
  const handleCreateTicket = () => {
    if (!newTicket.title.trim()) {
      toast.error('Please enter a ticket title');
      return;
    }

    if (!newTicket.startDate || !newTicket.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    const workspaceKey = workspace.key || 'TSK';
    const ticketNumber = tasks.length + 1;
    const ticketId = `${workspaceKey}-${ticketNumber}`;

    const newTask: Task = {
      id: ticketId,
      title: newTicket.title,
      type: newTicket.type,
      status: 'TODO',
      startDate: new Date(newTicket.startDate),
      endDate: new Date(newTicket.endDate),
      progress: 0,
      assignee: newTicket.assignee || undefined,
      epicId: newTicket.epicId || undefined,
      storyId: newTicket.storyId || undefined,
      dependencies: []
    };

    setTasks([...tasks, newTask]);
    setShowCreateDialog(false);
    setNewTicket({
      title: '',
      type: 'subtask',
      assignee: '',
      startDate: '',
      endDate: '',
      epicId: '',
      storyId: ''
    });

    toast.success(`Ticket ${ticketId} created successfully!`);
  };

  // Handle add dependency
  const handleAddDependency = (taskId: string) => {
    setSelectedTaskForDependency(taskId);
    setShowDependencyDialog(true);
  };

  const handleConfirmDependency = (dependsOnId: string) => {
    if (!selectedTaskForDependency) return;

    setTasks(tasks.map(task => {
      if (task.id === selectedTaskForDependency) {
        return {
          ...task,
          dependencies: [...(task.dependencies || []), dependsOnId]
        };
      }
      return task;
    }));

    setShowDependencyDialog(false);
    setSelectedTaskForDependency(null);
    toast.success('Dependency added successfully!');
  };

  // Get available tasks for dependency selection
  const getAvailableTasksForDependency = () => {
    return tasks.filter(t => t.id !== selectedTaskForDependency);
  };

  // Synchronize scroll between left and right sides
  const handleLeftScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleRightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Toggle collapse/expand for a parent ticket
  const toggleParentCollapse = (parentId: string) => {
    setCollapsedParents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(parentId)) {
        newSet.delete(parentId);
      } else {
        newSet.add(parentId);
      }
      return newSet;
    });
  };

  // Check if a task has children
  const hasChildren = (task: Task): boolean => {
    if (task.type === 'epic') {
      return tasks.some(t => t.epicId === task.id);
    } else if (task.type === 'story') {
      return tasks.some(t => t.storyId === task.id);
    }
    return false;
  };

  // Check if a task should be visible
  const isTaskVisible = (task: Task): boolean => {
    // If task is a story, check if its epic is collapsed
    if (task.type === 'story' && task.epicId) {
      if (collapsedParents.has(task.epicId)) {
        return false;
      }
    }
    // If task is a subtask, check if its story or epic is collapsed
    if (task.type === 'subtask' && task.storyId) {
      if (collapsedParents.has(task.storyId)) {
        return false;
      }
      // Also check if the parent epic is collapsed
      const parentStory = tasks.find(t => t.id === task.storyId);
      if (parentStory?.epicId && collapsedParents.has(parentStory.epicId)) {
        return false;
      }
    }
    return true;
  };

  // Get visible tasks
  const visibleTasks = useMemo(() => {
    return tasks.filter(isTaskVisible);
  }, [tasks, collapsedParents]);

  const todayMarkerPosition = getTodayMarkerPosition();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#E5E5E5' }}>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5" style={{ color: '#FCA311' }} />
          <h2 className="text-lg font-semibold" style={{ color: '#000000' }}>Project Timeline</h2>
          <Badge variant="outline" className="ml-2">
            {tasks.length} Tasks
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Ticket Button */}
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
            style={{ backgroundColor: '#14213D', color: '#FFFFFF' }}
          >
            <Plus className="w-4 h-4" />
            Create Ticket
          </Button>

          {/* View Mode Selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg ml-4" style={{ backgroundColor: '#E5E5E5' }}>
            {(['days', 'weeks', 'months', 'quarters'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize"
                style={{
                  backgroundColor: viewMode === mode ? '#14213D' : 'transparent',
                  color: viewMode === mode ? '#FFFFFF' : '#000000'
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToToday}
              className="h-8 px-3 text-xs font-medium"
              style={{ borderColor: '#FCA311', color: '#FCA311' }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 ml-2 border-l pl-2" style={{ borderColor: '#E5E5E5' }}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                const modes: ViewMode[] = ['days', 'weeks', 'months', 'quarters'];
                const currentIndex = modes.indexOf(viewMode);
                if (currentIndex > 0) setViewMode(modes[currentIndex - 1]);
              }}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                const modes: ViewMode[] = ['days', 'weeks', 'months', 'quarters'];
                const currentIndex = modes.indexOf(viewMode);
                if (currentIndex < modes.length - 1) setViewMode(modes[currentIndex + 1]);
              }}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Timeline Configuration */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 ml-2"
              >
                <Settings2 className="w-4 h-4" style={{ color: '#FCA311' }} />
                <span className="text-xs">Settings</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-4 border-b" style={{ borderColor: '#E5E5E5' }}>
                <h4 className="font-semibold text-sm mb-1" style={{ color: '#000000' }}>
                  Timeline Configuration
                </h4>
                <p className="text-xs text-gray-500">
                  Customize how your timeline is displayed
                </p>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-4">

                <Separator />

                {/* Display Options */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-gray-700">Display Options</h5>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <Label htmlFor="show-weekends" className="text-sm cursor-pointer">
                        Show Weekends
                      </Label>
                    </div>
                    <Switch
                      id="show-weekends"
                      checked={timelineConfig.showWeekends}
                      onCheckedChange={(checked) =>
                        setTimelineConfig({ ...timelineConfig, showWeekends: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4 text-gray-400" />
                      <Label htmlFor="show-dependencies" className="text-sm cursor-pointer">
                        Show Dependencies
                      </Label>
                    </div>
                    <Switch
                      id="show-dependencies"
                      checked={timelineConfig.showDependencies}
                      onCheckedChange={(checked) =>
                        setTimelineConfig({ ...timelineConfig, showDependencies: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Grid3x3 className="w-4 h-4 text-gray-400" />
                      <Label htmlFor="show-progress" className="text-sm cursor-pointer">
                        Show Progress Bars
                      </Label>
                    </div>
                    <Switch
                      id="show-progress"
                      checked={timelineConfig.showProgressBars}
                      onCheckedChange={(checked) =>
                        setTimelineConfig({ ...timelineConfig, showProgressBars: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <Label htmlFor="show-assignees" className="text-sm cursor-pointer">
                        Show Assignees
                      </Label>
                    </div>
                    <Switch
                      id="show-assignees"
                      checked={timelineConfig.showAssignees}
                      onCheckedChange={(checked) =>
                        setTimelineConfig({ ...timelineConfig, showAssignees: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <Label htmlFor="show-milestones" className="text-sm cursor-pointer">
                        Show Milestones
                      </Label>
                    </div>
                    <Switch
                      id="show-milestones"
                      checked={timelineConfig.showMilestones}
                      onCheckedChange={(checked) =>
                        setTimelineConfig({ ...timelineConfig, showMilestones: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Grouping & Color */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-gray-700">Grouping & Colors</h5>
                  
                  <div className="space-y-2">
                    <Label htmlFor="group-by" className="text-sm">
                      Group By
                    </Label>
                    <Select
                      value={timelineConfig.groupBy}
                      onValueChange={(value: any) =>
                        setTimelineConfig({ ...timelineConfig, groupBy: value })
                      }
                    >
                      <SelectTrigger id="group-by" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="type">Type (Epic/Story/Subtask)</SelectItem>
                        <SelectItem value="assignee">Assignee</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color-scheme" className="text-sm">
                      Color Scheme
                    </Label>
                    <Select
                      value={timelineConfig.colorScheme}
                      onValueChange={(value: any) =>
                        setTimelineConfig({ ...timelineConfig, colorScheme: value })
                      }
                    >
                      <SelectTrigger id="color-scheme" className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="type">By Type</SelectItem>
                        <SelectItem value="status">By Status</SelectItem>
                        <SelectItem value="priority">By Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* View Options */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-gray-700">View Options</h5>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-scroll" className="text-sm cursor-pointer">
                      Auto-scroll to Today
                    </Label>
                    <Switch
                      id="auto-scroll"
                      checked={timelineConfig.autoScroll}
                      onCheckedChange={(checked) =>
                        setTimelineConfig({ ...timelineConfig, autoScroll: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="critical-path" className="text-sm cursor-pointer">
                      Highlight Critical Path
                    </Label>
                    <Switch
                      id="critical-path"
                      checked={timelineConfig.highlightCriticalPath}
                      onCheckedChange={(checked) =>
                        setTimelineConfig({ ...timelineConfig, highlightCriticalPath: checked })
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Layout Customization */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-gray-700">Layout Customization</h5>
                  
                  <div className="space-y-2">
                    <Label htmlFor="row-height" className="text-sm">
                      Row Height: {timelineConfig.rowHeight}px
                    </Label>
                    <input
                      id="row-height"
                      type="range"
                      min="32"
                      max="72"
                      step="8"
                      value={timelineConfig.rowHeight}
                      onChange={(e) =>
                        setTimelineConfig({ ...timelineConfig, rowHeight: parseInt(e.target.value) })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        accentColor: '#FCA311'
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Compact</span>
                      <span>Comfortable</span>
                      <span>Spacious</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Reset Button */}
                <Button
                  className="w-full"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTimelineConfig({
                      showWeekends: true,
                      showDependencies: true,
                      showProgressBars: true,
                      showAssignees: true,
                      rowHeight: 48,
                      autoScroll: true,
                      highlightCriticalPath: false,
                      showMilestones: true,
                      groupBy: 'type',
                      colorScheme: 'type'
                    });
                    toast.success('Timeline settings reset to defaults');
                  }}
                >
                  Reset to Defaults
                </Button>
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Empty State */}
      {tasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks to Display</h3>
            <p className="text-sm text-gray-500 max-w-md mb-4">
              Create tickets to see them on the timeline. The Gantt chart will show task durations and dependencies.
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
              style={{ backgroundColor: '#14213D', color: '#FFFFFF' }}
            >
              <Plus className="w-4 h-4" />
              Create Your First Ticket
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Gantt Chart */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left side - Task list */}
            <div className="w-80 border-r flex-shrink-0 flex flex-col" style={{ borderColor: '#E5E5E5' }}>
              {/* Header */}
              <div className="h-12 border-b flex items-center px-4 font-semibold text-sm flex-shrink-0" style={{ borderColor: '#E5E5E5', backgroundColor: '#F9FAFB', color: '#000000' }}>
                Task Name
              </div>
              
              {/* Task list */}
              <div className="flex-1 overflow-y-auto" ref={leftScrollRef} onScroll={handleLeftScroll}>
                <div className="divide-y" style={{ borderColor: '#E5E5E5' }}>
                  {visibleTasks.map((task) => {
                    const colors = getTaskColor(task);
                    const indent = task.type === 'story' ? 'pl-6' : task.type === 'subtask' ? 'pl-12' : 'pl-4';
                    const taskHasChildren = hasChildren(task);
                    const isCollapsed = collapsedParents.has(task.id);
                    
                    return (
                      <div
                        key={task.id}
                        className={`h-12 flex items-center ${indent} pr-2 cursor-pointer transition-colors hover:bg-gray-50 group`}
                        onMouseEnter={() => setHoveredTask(task.id)}
                        onMouseLeave={() => setHoveredTask(null)}
                        style={{
                          backgroundColor: hoveredTask === task.id ? '#F3F4F6' : 'transparent'
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Collapse/Expand Toggle Button */}
                          {taskHasChildren ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleParentCollapse(task.id);
                              }}
                              className="flex-shrink-0 hover:bg-gray-200 rounded p-0.5 transition-colors"
                              title={isCollapsed ? 'Expand' : 'Collapse'}
                            >
                              <ChevronRight 
                                className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                                style={{ color: '#6B7280' }}
                              />
                            </button>
                          ) : (
                            <div className="w-4 flex-shrink-0" />
                          )}
                          
                          <div
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: colors.bg }}
                          />
                          <span className="text-sm font-medium truncate" style={{ color: '#000000' }}>
                            {task.id}
                          </span>
                          <span className="text-xs text-gray-500 truncate flex-1">
                            {task.title}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleAddDependency(task.id)}
                            title="Add dependency"
                          >
                            <Link className="w-3 h-3" style={{ color: '#FCA311' }} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right side - Timeline */}
            <div className="flex-1 overflow-auto relative" ref={scrollContainerRef} onScroll={handleRightScroll}>
              <div style={{ minWidth: `${timelineColumns.length * parseInt(getColumnWidth())}px` }}>
                {/* Timeline header */}
                <div className="h-12 border-b flex" style={{ borderColor: '#E5E5E5', backgroundColor: '#F9FAFB' }}>
                  {timelineColumns.map((col, i) => (
                    <div
                      key={i}
                      className="border-r flex items-center justify-center text-xs font-medium flex-shrink-0"
                      style={{
                        width: getColumnWidth(),
                        borderColor: '#E5E5E5',
                        backgroundColor: col.isToday ? '#FEF3C7' : 'transparent',
                        color: col.isToday ? '#92400E' : '#6B7280'
                      }}
                    >
                      {col.label}
                    </div>
                  ))}
                </div>

                {/* Gantt bars */}
                <div className="relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {timelineColumns.map((col, i) => (
                      <div
                        key={i}
                        className="border-r flex-shrink-0"
                        style={{
                          width: getColumnWidth(),
                          borderColor: '#E5E5E5'
                        }}
                      />
                    ))}
                  </div>

                  {/* Today marker line */}
                  {todayMarkerPosition !== null && (
                    <div
                      className="absolute top-0 bottom-0 pointer-events-none z-20"
                      style={{
                        left: `${todayMarkerPosition}%`,
                        width: '3px',
                        backgroundColor: '#FCA311',
                        boxShadow: '0 0 10px rgba(252, 163, 17, 0.5)'
                      }}
                    >
                      <div
                        className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap"
                        style={{
                          backgroundColor: '#FCA311',
                          color: '#FFFFFF'
                        }}
                      >
                        TODAY
                      </div>
                    </div>
                  )}

                  {/* Task rows */}
                  <div className="divide-y relative" style={{ borderColor: '#E5E5E5' }}>
                    {visibleTasks.map((task) => {
                      const colors = getTaskColor(task);
                      const barStyle = getTaskBarStyle(task);
                      
                      return (
                        <div
                          key={task.id}
                          className="h-12 relative cursor-pointer"
                          onMouseEnter={() => setHoveredTask(task.id)}
                          onMouseLeave={() => setHoveredTask(null)}
                          style={{
                            backgroundColor: hoveredTask === task.id ? '#F3F4F6' : 'transparent'
                          }}
                        >
                          {/* Task bar */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-7 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md group overflow-hidden"
                            style={{
                              ...barStyle,
                              backgroundColor: colors.light,
                              border: `2px solid ${colors.bg}`,
                              zIndex: hoveredTask === task.id ? 10 : 1
                            }}
                          >
                            {/* Progress bar */}
                            <div
                              className="h-full transition-all duration-300"
                              style={{
                                width: `${task.progress}%`,
                                backgroundColor: colors.bg,
                                opacity: 0.3
                              }}
                            />
                            
                            {/* Task info */}
                            <div className="absolute inset-0 flex items-center px-2">
                              <span className="text-xs font-semibold truncate" style={{ color: colors.bg }}>
                                {task.id}
                              </span>
                              {task.assignee && (
                                <span className="ml-auto text-xs font-medium bg-white/80 rounded px-1.5 py-0.5" style={{ color: colors.bg }}>
                                  {task.assignee.split(' ')[0]}
                                </span>
                              )}
                            </div>

                            {/* Dependency indicator */}
                            {task.dependencies && task.dependencies.length > 0 && (
                              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FCA311' }}>
                                <Link className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}

                            {/* Hover tooltip */}
                            {hoveredTask === task.id && (
                              <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-white rounded-lg shadow-xl border-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ borderColor: colors.bg }}>
                                <div className="text-sm font-bold mb-1" style={{ color: '#000000' }}>{task.id}</div>
                                <div className="text-xs text-gray-600 mb-2">{task.title}</div>
                                <div className="flex items-center gap-2 text-xs mb-2">
                                  <Badge variant="outline" style={{ borderColor: colors.bg, color: colors.bg }}>
                                    {task.type}
                                  </Badge>
                                  <Badge variant="outline">{task.status}</Badge>
                                </div>
                                <div className="text-xs text-gray-500">
                                  <div>Start: {task.startDate.toLocaleDateString()}</div>
                                  <div>End: {task.endDate.toLocaleDateString()}</div>
                                  <div className="mt-1">Progress: {task.progress}%</div>
                                  {task.dependencies && task.dependencies.length > 0 && (
                                    <div className="mt-1">Dependencies: {task.dependencies.join(', ')}</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="border-t px-6 py-3 flex items-center gap-6" style={{ borderColor: '#E5E5E5', backgroundColor: '#F9FAFB' }}>
            <span className="text-sm font-medium" style={{ color: '#6B7280' }}>Legend:</span>
            {[
              { type: 'epic', label: 'Epic', color: '#9333EA' },
              { type: 'story', label: 'Story', color: '#3B82F6' },
              { type: 'subtask', label: 'Subtask', color: '#10B981' }
            ].map(item => (
              <div key={item.type} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-sm" style={{ color: '#000000' }}>{item.label}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FCA311' }} />
                <span>Today Marker</span>
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                <Link className="w-3 h-3" style={{ color: '#FCA311' }} />
                <span>Has Dependencies</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle style={{ color: '#000000' }}>Create New Ticket</DialogTitle>
            <DialogDescription>
              Add a new ticket to the project timeline with start and end dates.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 overflow-y-auto max-h-[60vh]">
            <div className="space-y-4 py-4 px-1 bg-white">
            <div className="space-y-2">
              <Label htmlFor="title">Ticket Title *</Label>
              <Input
                id="title"
                placeholder="Enter ticket title"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={newTicket.type} onValueChange={(value: any) => setNewTicket({ ...newTicket, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="subtask">Subtask</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  placeholder="Enter assignee name"
                  value={newTicket.assignee}
                  onChange={(e) => setNewTicket({ ...newTicket, assignee: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newTicket.startDate}
                  onChange={(e) => setNewTicket({ ...newTicket, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newTicket.endDate}
                  onChange={(e) => setNewTicket({ ...newTicket, endDate: e.target.value })}
                />
              </div>
            </div>

            {newTicket.type === 'story' && (
              <div className="space-y-2">
                <Label htmlFor="epicId">Epic</Label>
                <Select value={newTicket.epicId} onValueChange={(value) => setNewTicket({ ...newTicket, epicId: value })}>
                  <SelectTrigger id="epicId">
                    <SelectValue placeholder="Select an epic (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.filter(t => t.type === 'epic').map(epic => (
                      <SelectItem key={epic.id} value={epic.id}>{epic.id} - {epic.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newTicket.type === 'subtask' && (
              <div className="space-y-2">
                <Label htmlFor="storyId">Story</Label>
                <Select value={newTicket.storyId} onValueChange={(value) => setNewTicket({ ...newTicket, storyId: value })}>
                  <SelectTrigger id="storyId">
                    <SelectValue placeholder="Select a story (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.filter(t => t.type === 'story').map(story => (
                      <SelectItem key={story.id} value={story.id}>{story.id} - {story.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            </div>
          </ScrollArea>

          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket} style={{ backgroundColor: '#14213D', color: '#FFFFFF' }}>
              <Check className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dependency Dialog */}
      <Dialog open={showDependencyDialog} onOpenChange={setShowDependencyDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle style={{ color: '#000000' }}>Add Dependency</DialogTitle>
            <DialogDescription>
              Select a task that {selectedTaskForDependency} depends on.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <ScrollArea className="h-64 rounded-md border p-4">
              <div className="space-y-2">
                {getAvailableTasksForDependency().map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleConfirmDependency(task.id)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#E5E5E5' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: getTaskColor(task).bg }}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: '#000000' }}>{task.id}</div>
                        <div className="text-xs text-gray-500">{task.title}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">{task.type}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDependencyDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}