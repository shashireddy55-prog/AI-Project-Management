import { useState } from 'react';
import { motion } from 'motion/react';
import { X, BookOpen, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (storyData: any) => void;
  epics: any[];
  preSelectedEpicId?: string;
  workspaceKey: string;
  existingTickets?: any[];
}

export function CreateStoryModal({ isOpen, onClose, onSubmit, epics, preSelectedEpicId, workspaceKey, existingTickets = [] }: CreateStoryModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    epicId: preSelectedEpicId || '',
    priority: 'MEDIUM',
    storyPoints: '5',
    acceptanceCriteria: ['']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate the next ticket number based on existing tickets
  const getNextTicketNumber = () => {
    if (existingTickets.length === 0) return 1;
    
    // Extract all ticket numbers from IDs that match workspace key prefix
    const ticketNumbers = existingTickets
      .map(ticket => ticket.id)
      .filter(id => typeof id === 'string' && id.startsWith(workspaceKey + '-'))
      .map(id => {
        const parts = id.split('-');
        const numPart = parts[parts.length - 1];
        return parseInt(numPart, 10);
      })
      .filter(num => !isNaN(num));
    
    if (ticketNumbers.length === 0) return 1;
    
    // Return max + 1
    return Math.max(...ticketNumbers) + 1;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.epicId) {
      newErrors.epicId = 'Please select an epic';
    }
    if (!formData.storyPoints || parseInt(formData.storyPoints) < 0) {
      newErrors.storyPoints = 'Valid story points required';
    }

    // Validate acceptance criteria
    const validCriteria = formData.acceptanceCriteria.filter(c => c.trim());
    if (validCriteria.length === 0) {
      newErrors.acceptanceCriteria = 'At least one acceptance criterion is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Generate ID with workspace key prefix
    const ticketNumber = getNextTicketNumber();
    const ticketId = `${workspaceKey}-${ticketNumber}`;

    // Submit the form
    onSubmit({
      ...formData,
      id: ticketId,
      storyPoints: parseInt(formData.storyPoints),
      acceptanceCriteria: validCriteria,
      status: 'To Do',
      assignee: 'Unassigned',
      createdAt: new Date().toISOString()
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      epicId: preSelectedEpicId || '',
      priority: 'MEDIUM',
      storyPoints: '5',
      acceptanceCriteria: ['']
    });
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCriteriaChange = (index: number, value: string) => {
    const newCriteria = [...formData.acceptanceCriteria];
    newCriteria[index] = value;
    setFormData(prev => ({ ...prev, acceptanceCriteria: newCriteria }));
    if (errors.acceptanceCriteria) {
      setErrors(prev => ({ ...prev, acceptanceCriteria: '' }));
    }
  };

  const addCriteria = () => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: [...prev.acceptanceCriteria, '']
    }));
  };

  const removeCriteria = (index: number) => {
    if (formData.acceptanceCriteria.length > 1) {
      setFormData(prev => ({
        ...prev,
        acceptanceCriteria: prev.acceptanceCriteria.filter((_, i) => i !== index)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        style={{ border: '2px solid rgba(252, 163, 17, 0.3)' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#14213D' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FCA311' }}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create New User Story</h2>
                <p className="text-sm text-gray-300">Define a user-focused requirement</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-white">
          <div className="space-y-6">
            {/* Epic Selection */}
            <div className="space-y-2">
              <Label htmlFor="epicId" className="text-sm font-semibold" style={{ color: '#000000' }}>
                Parent Epic *
              </Label>
              <Select
                value={formData.epicId}
                onValueChange={(value) => handleChange('epicId', value)}
              >
                <SelectTrigger className={`h-12 ${errors.epicId ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select an epic..." />
                </SelectTrigger>
                <SelectContent>
                  {epics.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      No epics available. Create an epic first.
                    </div>
                  ) : (
                    epics.map((epic) => (
                      <SelectItem key={epic.id} value={epic.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                          <span>{epic.title}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.epicId && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.epicId}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">This story will be grouped under the selected epic</p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold" style={{ color: '#000000' }}>
                Story Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter story title..."
                className={`h-12 ${errors.title ? 'border-red-500' : ''}`}
                style={{ color: '#000000' }}
              />
              {errors.title && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.title}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">A brief, descriptive title for this user story</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold" style={{ color: '#000000' }}>
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="As a [user type], I want to [action] so that [benefit]..."
                className={`min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                style={{ color: '#000000' }}
              />
              {errors.description && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.description}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">Use the format: "As a [user], I want [goal], so that [reason]"</p>
            </div>

            {/* Priority and Story Points */}
            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold" style={{ color: '#000000' }}>
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Critical</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span>High</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIUM">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Medium</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="LOW">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Low</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Story Points */}
              <div className="space-y-2">
                <Label htmlFor="storyPoints" className="text-sm font-semibold" style={{ color: '#000000' }}>
                  Story Points *
                </Label>
                <Select
                  value={formData.storyPoints}
                  onValueChange={(value) => handleChange('storyPoints', value)}
                >
                  <SelectTrigger className={`h-12 ${errors.storyPoints ? 'border-red-500' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Small</SelectItem>
                    <SelectItem value="2">2 - Small</SelectItem>
                    <SelectItem value="3">3 - Small-Medium</SelectItem>
                    <SelectItem value="5">5 - Medium</SelectItem>
                    <SelectItem value="8">8 - Large</SelectItem>
                    <SelectItem value="13">13 - Very Large</SelectItem>
                    <SelectItem value="21">21 - Huge</SelectItem>
                  </SelectContent>
                </Select>
                {errors.storyPoints && (
                  <div className="flex items-center gap-1 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.storyPoints}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Acceptance Criteria */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold" style={{ color: '#000000' }}>
                  Acceptance Criteria *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCriteria}
                  className="h-8 gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Criteria
                </Button>
              </div>
              <div className="space-y-2">
                {formData.acceptanceCriteria.map((criteria, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={criteria}
                        onChange={(e) => handleCriteriaChange(index, e.target.value)}
                        placeholder={`Criterion ${index + 1}...`}
                        className="h-10"
                        style={{ color: '#000000' }}
                      />
                    </div>
                    {formData.acceptanceCriteria.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCriteria(index)}
                        className="h-10 w-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {errors.acceptanceCriteria && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.acceptanceCriteria}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">Define clear, testable conditions that must be met</p>
            </div>

            {/* Info Box */}
            <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
              <div className="flex gap-3">
                <BookOpen className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-cyan-900">About User Stories</h4>
                  <p className="text-xs text-cyan-700">
                    User stories describe features from the user's perspective. They should be small enough 
                    to complete in one sprint and include clear acceptance criteria. You can add subtasks 
                    to break down the implementation work after creating the story.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">* Required fields</p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="px-6 gap-2"
              style={{ background: 'linear-gradient(to right, #14213D, #1a2d52)', color: 'white' }}
            >
              <BookOpen className="w-4 h-4" style={{ color: '#FCA311' }} />
              Create Story
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}