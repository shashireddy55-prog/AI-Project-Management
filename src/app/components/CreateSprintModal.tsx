import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import {
  GitBranch,
  Calendar,
  Target,
  Zap,
  BookOpen,
  Clock,
  Users,
  AlertCircle,
  Sparkles,
  Plus,
  X,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

interface CreateSprintModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  projectId: string;
  accessToken: string;
  onSprintCreated: (sprint: any) => void;
  existingSprints?: any[];
  availableStories?: any[];
  sprintCadence?: number; // in weeks
}

export function CreateSprintModal({
  open,
  onClose,
  workspaceId,
  projectId: projId,
  accessToken,
  onSprintCreated,
  existingSprints = [],
  availableStories = [],
  sprintCadence = 2
}: CreateSprintModalProps) {
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState('');
  const [selectedStories, setSelectedStories] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useAI, setUseAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);

  // Calculate sprint number
  const nextSprintNumber = existingSprints.length + 1;

  // Initialize default values
  useEffect(() => {
    if (open) {
      // Set default sprint name
      setSprintName(`Sprint ${nextSprintNumber}`);
      
      // Calculate default dates (starting next Monday)
      const today = new Date();
      const nextMonday = new Date(today);
      const dayOfWeek = today.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      
      const sprintEnd = new Date(nextMonday);
      sprintEnd.setDate(nextMonday.getDate() + (sprintCadence * 7) - 1);
      
      setStartDate(nextMonday.toISOString().split('T')[0]);
      setEndDate(sprintEnd.toISOString().split('T')[0]);
      
      // Reset other fields
      setSprintGoal('');
      setCapacity('40'); // Default story points capacity
      setSelectedStories(new Set());
      setErrors({});
      setUseAI(false);
      setAiPrompt('');
      setIsGeneratingWithAI(false);
      setIsCreating(false);
    }
  }, [open, nextSprintNumber, sprintCadence]);

  // Auto-update end date when start date changes
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + (sprintCadence * 7) - 1);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [startDate, sprintCadence]);

  const handleStoryToggle = (storyId: string) => {
    const newSelected = new Set(selectedStories);
    if (newSelected.has(storyId)) {
      newSelected.delete(storyId);
    } else {
      newSelected.add(storyId);
    }
    setSelectedStories(newSelected);
  };

  const calculateTotalPoints = () => {
    return availableStories
      .filter(story => selectedStories.has(story.id))
      .reduce((sum, story) => sum + (story.storyPoints || 0), 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!sprintName.trim()) {
      newErrors.sprintName = 'Sprint name is required';
    }

    if (!sprintGoal.trim() && !useAI) {
      newErrors.sprintGoal = 'Sprint goal is required';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!capacity || parseInt(capacity) <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (useAI && !aiPrompt.trim()) {
      newErrors.aiPrompt = 'AI prompt is required when using AI generation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter an AI prompt');
      return;
    }

    console.log('🤖 Starting AI Sprint Generation...');
    console.log('Prompt:', aiPrompt);
    console.log('Available Stories:', availableStories.length);

    setIsGeneratingWithAI(true);

    try {
      const requestBody = {
        prompt: aiPrompt,
        workspaceId,
        projectId: projId,
        sprintNumber: nextSprintNumber,
        sprintCadence,
        availableStories: availableStories.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          storyPoints: s.storyPoints,
          priority: s.priority
        }))
      };

      console.log('Request Body:', requestBody);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/ai/generate-sprint`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        // Fallback to manual mode on error
        toast.info('AI Generation Unavailable', {
          description: 'Using manual mode for sprint creation'
        });
        setUseAI(false);
        setIsGeneratingWithAI(false);
        return;
      }

      const result = await response.json();
      console.log('✅ AI Response:', result);
      
      // Populate form with AI-generated data
      if (result.sprintGoal) {
        console.log('Setting sprint goal:', result.sprintGoal);
        setSprintGoal(result.sprintGoal);
      }
      
      if (result.suggestedStories && Array.isArray(result.suggestedStories)) {
        console.log('Setting suggested stories:', result.suggestedStories);
        const suggestedIds = new Set(result.suggestedStories);
        setSelectedStories(suggestedIds);
      }
      
      if (result.recommendedCapacity) {
        console.log('Setting recommended capacity:', result.recommendedCapacity);
        setCapacity(result.recommendedCapacity.toString());
      }

      toast.success('AI Generated Sprint Plan! 🎉', {
        description: 'Review and adjust the generated sprint details'
      });

    } catch (error) {
      console.error('❌ AI generation error:', error);
      toast.info('Using Manual Mode', {
        description: 'AI generation unavailable, create sprint manually'
      });
      setUseAI(false);
    } finally {
      setIsGeneratingWithAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Validation Error', {
        description: 'Please fix the errors in the form'
      });
      return;
    }

    setIsCreating(true);

    try {
      // Get fresh access token from Supabase
      const { getSupabaseClient } = await import('/utils/supabase/client');
      const supabase = getSupabaseClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('❌ Failed to get session:', sessionError);
        toast.error('Authentication Error', {
          description: 'Please sign in again to continue'
        });
        setIsCreating(false);
        return;
      }

      const freshAccessToken = session.access_token;
      console.log('🔑 Using fresh access token (first 20 chars):', freshAccessToken.substring(0, 20));
      console.log('📤 Sending sprint creation request...');
      console.log('🌐 Project ID:', projectId);
      console.log('🌐 Public Anon Key (first 20 chars):', publicAnonKey.substring(0, 20));
      console.log('🌐 Full URL:', `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/sprints/create`);
      console.log('Request body:', {
        workspaceId,
        projectId: projId,
        sprintName,
        sprintGoal,
        startDate,
        endDate,
        capacity: parseInt(capacity),
        selectedStories: Array.from(selectedStories),
      });

      let response;
      try {
        response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/sprints/create`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,  // Use ANON_KEY for edge functions
              'X-User-Token': freshAccessToken,  // Send user token in custom header
            },
            body: JSON.stringify({
              workspaceId,
              projectId: projId,
              sprintName,
              sprintGoal,
              startDate,
              endDate,
              capacity: parseInt(capacity),
              selectedStories: Array.from(selectedStories),
            }),
          }
        );
      } catch (fetchError) {
        console.error('❌ Fetch failed with error:', fetchError);
        console.error('Error type:', typeof fetchError);
        console.error('Error message:', fetchError instanceof Error ? fetchError.message : String(fetchError));
        console.error('Error stack:', fetchError instanceof Error ? fetchError.stack : 'No stack');
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to fetch'}`);
      }

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const responseText = await response.text();
        console.error('❌ Sprint creation failed - Response text:', responseText);
        
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { error: responseText };
        }
        
        console.error('❌ Sprint creation failed - Parsed error:', errorData);
        throw new Error(errorData.error || 'Failed to create sprint');
      }

      const newSprint = await response.json();
      
      console.log('✅ Sprint created - Response:', newSprint);
      
      toast.success('Sprint Created Successfully! 🎉', {
        description: `${sprintName} is ready with ${selectedStories.size} stories`
      });

      // Pass the sprint object, not the entire response
      onSprintCreated(newSprint.sprint || newSprint);
      onClose();

    } catch (error) {
      console.error('Error creating sprint:', error);
      toast.error('Failed to Create Sprint', {
        description: 'Please try again or contact support'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const totalPoints = calculateTotalPoints();
  const capacityNum = parseInt(capacity) || 0;
  const isOverCapacity = totalPoints > capacityNum;
  const capacityPercent = capacityNum > 0 ? (totalPoints / capacityNum) * 100 : 0;

  // Filter only unassigned stories
  const unassignedStories = availableStories.filter(story => !story.sprintId);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white" style={{ background: '#FFFFFF' }}>
        <DialogHeader className="bg-gray-50 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-xl" style={{ color: '#000000' }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #14213D 0%, #1a2d52 100%)' }}>
              <GitBranch className="w-5 h-5" style={{ color: '#FCA311' }} />
            </div>
            Create New Sprint
          </DialogTitle>
          <DialogDescription style={{ color: '#737373' }}>
            Plan your next sprint by setting goals, capacity, and selecting stories to work on
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6 bg-gray-50">
          {/* AI Mode Toggle */}
          <Card className="p-4" style={{ background: 'linear-gradient(135deg, #E5E5E5 0%, #FFFFFF 100%)', borderColor: '#14213D' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" style={{ color: '#FCA311' }} />
                <div>
                  <div className="font-semibold" style={{ color: '#000000' }}>AI-Powered Sprint Planning</div>
                  <div className="text-sm" style={{ color: '#737373' }}>Let AI suggest sprint goals and story selection</div>
                </div>
              </div>
              <Checkbox
                checked={useAI}
                onCheckedChange={(checked) => setUseAI(checked as boolean)}
              />
            </div>

            <AnimatePresence>
              {useAI && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-3"
                >
                  <div>
                    <Label htmlFor="aiPrompt" style={{ color: '#000000' }}>AI Prompt</Label>
                    <Textarea
                      id="aiPrompt"
                      placeholder="Describe your sprint goals and priorities..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="mt-1 min-h-[80px]"
                      style={{ borderColor: errors.aiPrompt ? '#dc2626' : '#E5E5E5' }}
                    />
                    {errors.aiPrompt && (
                      <p className="text-sm text-red-600 mt-1">{errors.aiPrompt}</p>
                    )}
                  </div>
                  <Button
                    onClick={handleAIGenerate}
                    disabled={isGeneratingWithAI}
                    className="w-full gap-2"
                    style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)', color: 'white' }}
                  >
                    {isGeneratingWithAI ? (
                      <>
                        <Zap className="w-4 h-4 animate-pulse" style={{ color: '#FCA311' }} />
                        Generating with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" style={{ color: '#FCA311' }} />
                        Generate Sprint Plan
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sprintName" style={{ color: '#000000' }}>
                Sprint Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sprintName"
                placeholder="Sprint 1"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                className="mt-1"
                style={{ borderColor: errors.sprintName ? '#dc2626' : '#E5E5E5' }}
              />
              {errors.sprintName && (
                <p className="text-sm text-red-600 mt-1">{errors.sprintName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="capacity" style={{ color: '#000000' }}>
                Capacity (Story Points) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                placeholder="40"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="mt-1"
                style={{ borderColor: errors.capacity ? '#dc2626' : '#E5E5E5' }}
              />
              {errors.capacity && (
                <p className="text-sm text-red-600 mt-1">{errors.capacity}</p>
              )}
            </div>
          </div>

          {/* Sprint Goal */}
          <div>
            <Label htmlFor="sprintGoal" style={{ color: '#000000' }}>
              Sprint Goal <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="sprintGoal"
              placeholder="What do you want to achieve in this sprint?"
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              className="mt-1 min-h-[80px]"
              style={{ borderColor: errors.sprintGoal ? '#dc2626' : '#E5E5E5' }}
            />
            {errors.sprintGoal && (
              <p className="text-sm text-red-600 mt-1">{errors.sprintGoal}</p>
            )}
          </div>

          {/* Sprint Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" style={{ color: '#000000' }}>
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
                style={{ borderColor: errors.startDate ? '#dc2626' : '#E5E5E5' }}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate" style={{ color: '#000000' }}>
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1"
                style={{ borderColor: errors.endDate ? '#dc2626' : '#E5E5E5' }}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
              )}
              <p className="text-xs mt-1" style={{ color: '#737373' }}>
                {sprintCadence}-week sprint ({sprintCadence * 7} days)
              </p>
            </div>
          </div>

          {/* Capacity Indicator */}
          {capacityNum > 0 && (
            <Card className="p-4" style={{ background: isOverCapacity ? '#FEF2F2' : '#F0FDF4', borderColor: isOverCapacity ? '#FCA5A5' : '#BBF7D0' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" style={{ color: isOverCapacity ? '#DC2626' : '#16A34A' }} />
                  <span className="font-semibold" style={{ color: '#000000' }}>
                    Capacity Status
                  </span>
                </div>
                <Badge style={{ 
                  background: isOverCapacity ? '#DC2626' : '#16A34A',
                  color: 'white'
                }}>
                  {totalPoints} / {capacityNum} pts ({Math.round(capacityPercent)}%)
                </Badge>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#E5E5E5' }}>
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(capacityPercent, 100)}%`,
                    background: isOverCapacity ? 'linear-gradient(to right, #DC2626, #EF4444)' : 'linear-gradient(to right, #16A34A, #22C55E)'
                  }}
                />
              </div>
              {isOverCapacity && (
                <p className="text-sm mt-2" style={{ color: '#DC2626' }}>
                  ⚠️ Sprint is over capacity by {totalPoints - capacityNum} points
                </p>
              )}
            </Card>
          )}

          {/* Story Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label style={{ color: '#000000' }}>
                <BookOpen className="w-4 h-4 inline mr-2" style={{ color: '#FCA311' }} />
                Select Stories ({selectedStories.size} selected, {totalPoints} pts)
              </Label>
            </div>

            {unassignedStories.length === 0 ? (
              <Card className="p-6 text-center" style={{ background: '#E5E5E5' }}>
                <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#737373' }} />
                <p style={{ color: '#737373' }}>No available stories to add to sprint</p>
                <p className="text-sm mt-1" style={{ color: '#737373' }}>
                  All stories are already assigned or create new stories first
                </p>
              </Card>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3" style={{ borderColor: '#E5E5E5', background: '#FFFFFF' }}>
                {unassignedStories.map((story) => (
                  <Card
                    key={story.id}
                    className="p-3 cursor-pointer transition-all duration-200 hover:shadow-md"
                    style={{ 
                      borderColor: selectedStories.has(story.id) ? '#14213D' : '#E5E5E5',
                      background: selectedStories.has(story.id) ? '#F0F9FF' : '#FFFFFF'
                    }}
                    onClick={() => handleStoryToggle(story.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedStories.has(story.id)}
                        onCheckedChange={() => handleStoryToggle(story.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate" style={{ color: '#000000' }}>
                            {story.title}
                          </span>
                          {story.storyPoints && (
                            <Badge variant="outline" style={{ borderColor: '#14213D', color: '#14213D' }}>
                              {story.storyPoints} pts
                            </Badge>
                          )}
                          {story.priority && (
                            <Badge variant="outline" style={{ 
                              borderColor: story.priority === 'HIGH' || story.priority === 'CRITICAL' ? '#DC2626' : '#737373',
                              color: story.priority === 'HIGH' || story.priority === 'CRITICAL' ? '#DC2626' : '#737373'
                            }}>
                              {story.priority}
                            </Badge>
                          )}
                        </div>
                        {story.description && (
                          <p className="text-sm truncate" style={{ color: '#737373' }}>
                            {story.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 flex items-center justify-between" style={{ borderColor: '#E5E5E5', background: '#FFFFFF' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#737373' }}>
            <Calendar className="w-4 h-4" />
            <span>
              {startDate && endDate ? (
                <>
                  {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </>
              ) : (
                'Select dates'
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isCreating || (selectedStories.size === 0 && !useAI)}
              className="gap-2"
              style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)', color: 'white' }}
            >
              {isCreating ? (
                <>
                  <Zap className="w-4 h-4 animate-pulse" style={{ color: '#FCA311' }} />
                  Creating Sprint...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" style={{ color: '#FCA311' }} />
                  Create Sprint
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}