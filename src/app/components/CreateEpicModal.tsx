import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Layers, AlertCircle } from 'lucide-react';
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

interface CreateEpicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (epicData: any) => void;
  projectId: string;
  workspaceKey: string;
  existingTickets?: any[]; // All existing tickets (epics, stories, subtasks) to calculate next ID
}

export function CreateEpicModal({ isOpen, onClose, onSubmit, projectId, workspaceKey, existingTickets = [] }: CreateEpicModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    businessValue: 'MEDIUM',
    projectId: projectId
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
      status: 'To Do',
      priority: 'HIGH',
      owner: 'Unassigned',
      createdAt: new Date().toISOString()
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      businessValue: 'MEDIUM',
      projectId: projectId
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        style={{ border: '2px solid rgba(252, 163, 17, 0.3)' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#14213D' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FCA311' }}>
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create New Epic</h2>
                <p className="text-sm text-gray-300">Add a high-level initiative to your project</p>
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
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold" style={{ color: '#000000' }}>
                Epic Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter epic title..."
                className={`h-12 ${errors.title ? 'border-red-500' : ''}`}
                style={{ color: '#000000' }}
              />
              {errors.title && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.title}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">A clear, concise name for this epic</p>
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
                placeholder="Describe the epic's purpose, goals, and expected outcomes..."
                className={`min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
                style={{ color: '#000000' }}
              />
              {errors.description && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.description}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">Provide detailed context about what this epic aims to achieve</p>
            </div>

            {/* Business Value */}
            <div className="space-y-2">
              <Label htmlFor="businessValue" className="text-sm font-semibold" style={{ color: '#000000' }}>
                Business Value
              </Label>
              <Select
                value={formData.businessValue}
                onValueChange={(value) => handleChange('businessValue', value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CRITICAL">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span>Critical - Must have for success</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="HIGH">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>High - Important for business goals</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="MEDIUM">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>Medium - Moderate business impact</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="LOW">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Low - Nice to have</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Rate the business value and priority of this epic</p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex gap-3">
                <Layers className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-blue-900">About Epics</h4>
                  <p className="text-xs text-blue-700">
                    Epics are large bodies of work that can be broken down into smaller stories. 
                    They typically represent major features or initiatives that span multiple sprints.
                    After creating this epic, you can add user stories to it.
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
              <Layers className="w-4 h-4" style={{ color: '#FCA311' }} />
              Create Epic
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}