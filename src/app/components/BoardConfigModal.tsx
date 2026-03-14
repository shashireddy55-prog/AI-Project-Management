import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  X,
  Save,
  LayoutGrid,
  Filter,
  Eye,
  Palette,
  Workflow,
  Clock,
  CheckSquare,
  Users,
  Tag
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';

interface BoardConfigModalProps {
  onClose: () => void;
  onSave?: (config: any) => void;
}

export function BoardConfigModal({ onClose, onSave }: BoardConfigModalProps) {
  const [config, setConfig] = useState({
    display: {
      showSubtasks: true,
      showEpicTags: true,
      showAssignees: true,
      showDueDates: true,
      showStoryPoints: true,
      showPriority: true,
      compactView: false,
      cardSize: 'medium',
    },
    columns: {
      todo: { enabled: true, name: 'To Do', limit: 0 },
      inProgress: { enabled: true, name: 'In Progress', limit: 5 },
      done: { enabled: true, name: 'Done', limit: 0 },
    },
    filters: {
      defaultView: 'all_sprints',
      defaultEpic: 'all',
      showEmptyColumns: true,
      groupBy: 'status',
    },
    behavior: {
      autoSave: true,
      confirmDelete: true,
      enableDragDrop: true,
      autoRefresh: true,
      refreshInterval: 30,
    },
    colors: {
      lowPriority: '#10B981',
      mediumPriority: '#F59E0B',
      highPriority: '#EF4444',
      criticalPriority: '#DC2626',
    }
  });

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
    toast.success('Board configuration saved', {
      description: 'Your board settings have been updated'
    });
    onClose();
  };

  const updateConfig = (section: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const updateColumnConfig = (column: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      columns: {
        ...prev.columns,
        [column]: {
          ...prev.columns[column as keyof typeof prev.columns],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl"
      >
        <Card className="max-h-[85vh] flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
          <CardHeader className="flex-shrink-0 border-b" style={{ backgroundColor: '#F9FAFB' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#14213D' }}>
                  <Settings className="w-5 h-5" style={{ color: '#FCA311' }} />
                </div>
                <div>
                  <CardTitle className="text-xl" style={{ color: '#000000' }}>
                    Board Configuration
                  </CardTitle>
                  <CardDescription>
                    Customize your Kanban board display and behavior
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <CardContent className="p-6" style={{ backgroundColor: '#F9FAFB' }}>
                <Tabs defaultValue="display" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="display" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Display
                    </TabsTrigger>
                    <TabsTrigger value="columns" className="flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4" />
                      Columns
                    </TabsTrigger>
                    <TabsTrigger value="filters" className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                    </TabsTrigger>
                    <TabsTrigger value="behavior" className="flex items-center gap-2">
                      <Workflow className="w-4 h-4" />
                      Behavior
                    </TabsTrigger>
                  </TabsList>

                  {/* Display Settings */}
                  <TabsContent value="display" className="space-y-6 bg-white p-6 rounded-lg">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#000000' }}>
                        <Eye className="w-5 h-5" style={{ color: '#FCA311' }} />
                        Card Display Options
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Subtasks Count</Label>
                            <p className="text-sm text-gray-500">Display task count on story cards</p>
                          </div>
                          <Switch
                            checked={config.display.showSubtasks}
                            onCheckedChange={(checked) => updateConfig('display', 'showSubtasks', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Epic Tags</Label>
                            <p className="text-sm text-gray-500">Display epic name on cards</p>
                          </div>
                          <Switch
                            checked={config.display.showEpicTags}
                            onCheckedChange={(checked) => updateConfig('display', 'showEpicTags', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Assignees</Label>
                            <p className="text-sm text-gray-500">Display assigned team members</p>
                          </div>
                          <Switch
                            checked={config.display.showAssignees}
                            onCheckedChange={(checked) => updateConfig('display', 'showAssignees', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Due Dates</Label>
                            <p className="text-sm text-gray-500">Display due dates on cards</p>
                          </div>
                          <Switch
                            checked={config.display.showDueDates}
                            onCheckedChange={(checked) => updateConfig('display', 'showDueDates', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Story Points</Label>
                            <p className="text-sm text-gray-500">Display story point estimates</p>
                          </div>
                          <Switch
                            checked={config.display.showStoryPoints}
                            onCheckedChange={(checked) => updateConfig('display', 'showStoryPoints', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Priority</Label>
                            <p className="text-sm text-gray-500">Display priority indicators</p>
                          </div>
                          <Switch
                            checked={config.display.showPriority}
                            onCheckedChange={(checked) => updateConfig('display', 'showPriority', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Compact View</Label>
                            <p className="text-sm text-gray-500">Reduce card spacing and padding</p>
                          </div>
                          <Switch
                            checked={config.display.compactView}
                            onCheckedChange={(checked) => updateConfig('display', 'compactView', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label>Card Size</Label>
                          <Select
                            value={config.display.cardSize}
                            onValueChange={(value) => updateConfig('display', 'cardSize', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Column Settings */}
                  <TabsContent value="columns" className="space-y-6 bg-white p-6 rounded-lg">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#000000' }}>
                        <LayoutGrid className="w-5 h-5" style={{ color: '#FCA311' }} />
                        Column Configuration
                      </h3>
                      
                      <div className="space-y-6">
                        {/* To Do Column */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">To Do Column</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Enable Column</Label>
                              <Switch
                                checked={config.columns.todo.enabled}
                                onCheckedChange={(checked) => updateColumnConfig('todo', 'enabled', checked)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Column Name</Label>
                              <Input
                                value={config.columns.todo.name}
                                onChange={(e) => updateColumnConfig('todo', 'name', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>WIP Limit (0 = No Limit)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={config.columns.todo.limit}
                                onChange={(e) => updateColumnConfig('todo', 'limit', parseInt(e.target.value))}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* In Progress Column */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">In Progress Column</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Enable Column</Label>
                              <Switch
                                checked={config.columns.inProgress.enabled}
                                onCheckedChange={(checked) => updateColumnConfig('inProgress', 'enabled', checked)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Column Name</Label>
                              <Input
                                value={config.columns.inProgress.name}
                                onChange={(e) => updateColumnConfig('inProgress', 'name', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>WIP Limit (0 = No Limit)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={config.columns.inProgress.limit}
                                onChange={(e) => updateColumnConfig('inProgress', 'limit', parseInt(e.target.value))}
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* Done Column */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Done Column</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Enable Column</Label>
                              <Switch
                                checked={config.columns.done.enabled}
                                onCheckedChange={(checked) => updateColumnConfig('done', 'enabled', checked)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Column Name</Label>
                              <Input
                                value={config.columns.done.name}
                                onChange={(e) => updateColumnConfig('done', 'name', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>WIP Limit (0 = No Limit)</Label>
                              <Input
                                type="number"
                                min="0"
                                value={config.columns.done.limit}
                                onChange={(e) => updateColumnConfig('done', 'limit', parseInt(e.target.value))}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Filter Settings */}
                  <TabsContent value="filters" className="space-y-6 bg-white p-6 rounded-lg">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#000000' }}>
                        <Filter className="w-5 h-5" style={{ color: '#FCA311' }} />
                        Default Filter Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Default Sprint View</Label>
                          <Select
                            value={config.filters.defaultView}
                            onValueChange={(value) => updateConfig('filters', 'defaultView', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all_sprints">All Sprints</SelectItem>
                              <SelectItem value="current_sprint">Current Sprint Only</SelectItem>
                              <SelectItem value="backlog">Backlog Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label>Default Epic Filter</Label>
                          <Select
                            value={config.filters.defaultEpic}
                            onValueChange={(value) => updateConfig('filters', 'defaultEpic', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Epics</SelectItem>
                              <SelectItem value="none">No Filter</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Show Empty Columns</Label>
                            <p className="text-sm text-gray-500">Display columns even when they have no cards</p>
                          </div>
                          <Switch
                            checked={config.filters.showEmptyColumns}
                            onCheckedChange={(checked) => updateConfig('filters', 'showEmptyColumns', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <Label>Group Cards By</Label>
                          <Select
                            value={config.filters.groupBy}
                            onValueChange={(value) => updateConfig('filters', 'groupBy', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="status">Status</SelectItem>
                              <SelectItem value="epic">Epic</SelectItem>
                              <SelectItem value="assignee">Assignee</SelectItem>
                              <SelectItem value="priority">Priority</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Behavior Settings */}
                  <TabsContent value="behavior" className="space-y-6 bg-white p-6 rounded-lg">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#000000' }}>
                        <Workflow className="w-5 h-5" style={{ color: '#FCA311' }} />
                        Board Behavior
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Auto-Save Changes</Label>
                            <p className="text-sm text-gray-500">Automatically save when moving cards</p>
                          </div>
                          <Switch
                            checked={config.behavior.autoSave}
                            onCheckedChange={(checked) => updateConfig('behavior', 'autoSave', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Confirm Before Delete</Label>
                            <p className="text-sm text-gray-500">Ask for confirmation when deleting cards</p>
                          </div>
                          <Switch
                            checked={config.behavior.confirmDelete}
                            onCheckedChange={(checked) => updateConfig('behavior', 'confirmDelete', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Enable Drag & Drop</Label>
                            <p className="text-sm text-gray-500">Allow moving cards between columns</p>
                          </div>
                          <Switch
                            checked={config.behavior.enableDragDrop}
                            onCheckedChange={(checked) => updateConfig('behavior', 'enableDragDrop', checked)}
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Auto-Refresh Board</Label>
                            <p className="text-sm text-gray-500">Automatically refresh board data</p>
                          </div>
                          <Switch
                            checked={config.behavior.autoRefresh}
                            onCheckedChange={(checked) => updateConfig('behavior', 'autoRefresh', checked)}
                          />
                        </div>

                        {config.behavior.autoRefresh && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <Label>Refresh Interval (seconds)</Label>
                              <Input
                                type="number"
                                min="10"
                                max="300"
                                value={config.behavior.refreshInterval}
                                onChange={(e) => updateConfig('behavior', 'refreshInterval', parseInt(e.target.value))}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </ScrollArea>
          </div>

          <div className="flex-shrink-0 border-t p-4 bg-gray-50 flex items-center justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              style={{ backgroundColor: '#14213D', color: '#FFFFFF' }}
              className="hover:opacity-90"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}