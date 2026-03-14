import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, Calendar, Target, Layers } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { projectId } from '/utils/supabase/info';
import { UnifiedModal } from './UnifiedModal';
import { UnifiedButton } from './UnifiedButtons';
import { UnifiedField, UnifiedInput, UnifiedTextarea, UnifiedFormGrid } from './UnifiedForm';

interface EditEpicModalProps {
  isOpen: boolean;
  onClose: () => void;
  epic: any;
  accessToken?: string;
  onUpdate?: (updatedEpic: any) => void;
  onDelete?: (epicId: string) => void;
}

export function EditEpicModal({
  isOpen,
  onClose,
  epic: initialEpic,
  accessToken,
  onUpdate,
  onDelete
}: EditEpicModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [editedEpic, setEditedEpic] = useState(initialEpic);

  useEffect(() => {
    setEditedEpic(initialEpic);
  }, [initialEpic]);

  const handleSave = async () => {
    if (!editedEpic.title?.trim()) {
      toast.error('Epic title is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/epics/${editedEpic.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken || ''
          },
          body: JSON.stringify({
            title: editedEpic.title,
            description: editedEpic.description,
            startDate: editedEpic.startDate,
            endDate: editedEpic.endDate,
            goals: editedEpic.goals
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update epic');
      }

      const updatedEpic = await response.json();
      toast.success('Epic updated successfully');
      
      if (onUpdate) {
        onUpdate(updatedEpic);
      }
      onClose();
    } catch (error) {
      console.error('Error updating epic:', error);
      toast.error('Failed to update epic');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this epic? All associated stories will be unlinked.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/epics/${editedEpic.id}`,
        {
          method: 'DELETE',
          headers: {
            'X-Access-Token': accessToken || ''
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete epic');
      }

      toast.success('Epic deleted successfully');
      if (onDelete) {
        onDelete(editedEpic.id);
      }
      onClose();
    } catch (error) {
      console.error('Error deleting epic:', error);
      toast.error('Failed to delete epic');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2" style={{ color: '#000000' }}>
                    <Layers className="w-5 h-5" style={{ color: '#FCA311' }} />
                    Edit Epic
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Epic Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                    Epic Title *
                  </label>
                  <Input
                    value={editedEpic.title || ''}
                    onChange={(e) => setEditedEpic({ ...editedEpic, title: e.target.value })}
                    placeholder="Enter epic title..."
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                    Description
                  </label>
                  <Textarea
                    value={editedEpic.description || ''}
                    onChange={(e) => setEditedEpic({ ...editedEpic, description: e.target.value })}
                    placeholder="Describe the epic..."
                    className="min-h-[120px]"
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                      <Calendar className="w-4 h-4 inline mr-1" style={{ color: '#FCA311' }} />
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={editedEpic.startDate || ''}
                      onChange={(e) => setEditedEpic({ ...editedEpic, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                      <Calendar className="w-4 h-4 inline mr-1" style={{ color: '#FCA311' }} />
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={editedEpic.endDate || ''}
                      onChange={(e) => setEditedEpic({ ...editedEpic, endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#000000' }}>
                    <Target className="w-4 h-4 inline mr-1" style={{ color: '#FCA311' }} />
                    Goals & Objectives
                  </label>
                  <Textarea
                    value={editedEpic.goals || ''}
                    onChange={(e) => setEditedEpic({ ...editedEpic, goals: e.target.value })}
                    placeholder="What are the goals of this epic?"
                    className="min-h-[80px]"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#E5E5E5' }}>
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Epic
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="text-white"
                      style={{ backgroundColor: '#14213D' }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}