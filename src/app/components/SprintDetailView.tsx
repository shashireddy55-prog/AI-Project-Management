import { ArrowLeft, Calendar, Target, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { SprintTicketsTableView } from './SprintTicketsTableView';

interface SprintDetailViewProps {
  sprint: any;
  workspace: any;
  onBack: () => void;
}

export function SprintDetailView({ sprint, workspace, onBack }: SprintDetailViewProps) {
  const [showTicketsTable, setShowTicketsTable] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Get all stories in this sprint
  const sprintStories = workspace.backlog?.stories?.filter((s: any) => s.sprintId === sprint.id) || [];
  
  // Get all epics related to these stories
  const relatedEpicIds = new Set(sprintStories.map((s: any) => s.epicId));
  const relatedEpics = workspace.backlog?.epics?.filter((e: any) => relatedEpicIds.has(e.id)) || [];
  
  // Get all subtasks for these stories
  const storyIds = new Set(sprintStories.map((s: any) => s.id));
  const sprintSubtasks = workspace.backlog?.subtasks?.filter((st: any) => storyIds.has(st.storyId)) || [];
  
  // Calculate metrics
  const totalStories = sprintStories.length;
  const completedStories = sprintStories.filter((s: any) => s.status === 'Done').length;
  const inProgressStories = sprintStories.filter((s: any) => s.status === 'In Progress').length;
  const todoStories = sprintStories.filter((s: any) => s.status === 'To Do').length;
  
  const totalPoints = sprintStories.reduce((sum: number, s: any) => sum + (s.storyPoints || 0), 0);
  const completedPoints = sprintStories
    .filter((s: any) => s.status === 'Done')
    .reduce((sum: number, s: any) => sum + (s.storyPoints || 0), 0);
  
  const progressPercentage = totalStories > 0 ? Math.round((completedStories / totalStories) * 100) : 0;
  
  // Get status color
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
      case 'HIGH':
        return 'bg-red-100 text-red-700';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';
      case 'LOW':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Prepare all tickets data with type information
  const getAllTickets = () => {
    const allTickets = [];
    
    // Add stories with type
    sprintStories.forEach((story: any) => {
      allTickets.push({ ...story, type: 'Story' });
    });
    
    // Add subtasks with type
    sprintSubtasks.forEach((subtask: any) => {
      allTickets.push({ ...subtask, type: 'Subtask' });
    });
    
    return allTickets;
  };

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
    setShowTicketsTable(true);
  };

  const getFilteredTickets = () => {
    const allTickets = getAllTickets();
    return allTickets.filter(ticket => ticket.status === selectedStatus);
  };

  // Show table view if requested
  if (showTicketsTable && selectedStatus) {
    return (
      <SprintTicketsTableView
        tickets={getFilteredTickets()}
        filterStatus={selectedStatus}
        sprintName={sprint.name}
        onBack={() => {
          setShowTicketsTable(false);
          setSelectedStatus('');
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sprints
          </Button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#000000]">{sprint.name}</h1>
            <p className="text-gray-600 mt-1">{sprint.goal}</p>
          </div>
          <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1">
            {totalStories} stories • {totalPoints} points
          </Badge>
        </div>
        
        {/* Sprint Dates */}
        <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
          {sprint.startDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Start: {new Date(sprint.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {sprint.endDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>End: {new Date(sprint.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="px-6 py-4 grid grid-cols-4 gap-4 border-b border-gray-200">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
          onClick={() => handleStatusClick('Done')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Completed
            </div>
            <div className="text-2xl font-bold text-[#000000]">{completedStories}</div>
            <div className="text-xs text-gray-500">{completedPoints} points</div>
            <Button 
              size="sm" 
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusClick('Done');
              }}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
          onClick={() => handleStatusClick('In Progress')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              In Progress
            </div>
            <div className="text-2xl font-bold text-[#000000]">{inProgressStories}</div>
            <div className="text-xs text-gray-500">Active work</div>
            <Button 
              size="sm" 
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusClick('In Progress');
              }}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
          onClick={() => handleStatusClick('To Do')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <AlertCircle className="w-4 h-4 text-gray-600" />
              To Do
            </div>
            <div className="text-2xl font-bold text-[#000000]">{todoStories}</div>
            <div className="text-xs text-gray-500">Remaining work</div>
            <Button 
              size="sm" 
              className="w-full mt-3 bg-[#14213D] hover:bg-[#14213D]/90 text-white text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusClick('To Do');
              }}
            >
              View Details
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Target className="w-4 h-4 text-[#FCA311]" />
              Progress
            </div>
            <div className="text-2xl font-bold text-[#000000]">{progressPercentage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-[#FCA311] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">Overall completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Stories List */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Group by Epic */}
          {relatedEpics.length > 0 ? (
            relatedEpics.map((epic: any) => {
              const epicStories = sprintStories.filter((s: any) => s.epicId === epic.id);
              
              return (
                <div key={epic.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-purple-100 text-purple-700 text-xs">EPIC</Badge>
                    <h3 className="font-semibold text-[#000000]">{epic.title}</h3>
                    <span className="text-sm text-gray-500">({epicStories.length} stories)</span>
                  </div>
                  
                  <div className="space-y-2 ml-4">
                    {epicStories.map((story: any) => {
                      const storySubtasks = sprintSubtasks.filter((st: any) => st.storyId === story.id);
                      
                      return (
                        <Card key={story.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {story.id}
                                  </Badge>
                                  <Badge className={getStatusColor(story.status)}>
                                    {story.status}
                                  </Badge>
                                  {story.priority && (
                                    <Badge className={getPriorityColor(story.priority)}>
                                      {story.priority}
                                    </Badge>
                                  )}
                                  {story.storyPoints && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                      {story.storyPoints} pts
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className="text-base font-medium text-[#000000]">
                                  {story.title}
                                </CardTitle>
                                {story.description && (
                                  <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                                )}
                              </div>
                              {story.assignee && story.assignee !== 'Unassigned' && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Users className="w-4 h-4" />
                                  {story.assignee}
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          
                          {/* Subtasks */}
                          {storySubtasks.length > 0 && (
                            <CardContent className="pt-0">
                              <div className="border-t border-gray-200 pt-3">
                                <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                                  Subtasks ({storySubtasks.length})
                                </div>
                                <div className="space-y-2">
                                  {storySubtasks.map((subtask: any) => (
                                    <div key={subtask.id} className="flex items-center gap-3 text-sm pl-2">
                                      <Badge variant="outline" className="font-mono text-xs">
                                        {subtask.id}
                                      </Badge>
                                      <span className="flex-1">{subtask.title}</span>
                                      <Badge className={getStatusColor(subtask.status)} variant="outline">
                                        {subtask.status}
                                      </Badge>
                                      {subtask.assignee && subtask.assignee !== 'Unassigned' && (
                                        <span className="text-xs text-gray-500">{subtask.assignee}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            // Stories without epics
            <div className="space-y-2">
              {sprintStories.map((story: any) => {
                const storySubtasks = sprintSubtasks.filter((st: any) => st.storyId === story.id);
                
                return (
                  <Card key={story.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="font-mono text-xs">
                              {story.id}
                            </Badge>
                            <Badge className={getStatusColor(story.status)}>
                              {story.status}
                            </Badge>
                            {story.priority && (
                              <Badge className={getPriorityColor(story.priority)}>
                                {story.priority}
                              </Badge>
                            )}
                            {story.storyPoints && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                {story.storyPoints} pts
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base font-medium text-[#000000]">
                            {story.title}
                          </CardTitle>
                          {story.description && (
                            <p className="text-sm text-gray-600 mt-1">{story.description}</p>
                          )}
                        </div>
                        {story.assignee && story.assignee !== 'Unassigned' && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            {story.assignee}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    {/* Subtasks */}
                    {storySubtasks.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="border-t border-gray-200 pt-3">
                          <div className="text-xs font-semibold text-gray-600 mb-2 uppercase">
                            Subtasks ({storySubtasks.length})
                          </div>
                          <div className="space-y-2">
                            {storySubtasks.map((subtask: any) => (
                              <div key={subtask.id} className="flex items-center gap-3 text-sm pl-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                  {subtask.id}
                                </Badge>
                                <span className="flex-1">{subtask.title}</span>
                                <Badge className={getStatusColor(subtask.status)} variant="outline">
                                  {subtask.status}
                                </Badge>
                                {subtask.assignee && subtask.assignee !== 'Unassigned' && (
                                  <span className="text-xs text-gray-500">{subtask.assignee}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
          
          {totalStories === 0 && (
            <Card className="p-12">
              <div className="text-center text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Stories in Sprint</h3>
                <p className="text-sm">Add stories to this sprint to get started.</p>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}