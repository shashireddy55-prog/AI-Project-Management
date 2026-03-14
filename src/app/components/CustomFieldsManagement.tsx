import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, GripVertical, ListChecks, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Button } from './ui/button';

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox' | 'user' | 'script';
  required: boolean;
  options?: string[]; // For dropdown type
  defaultValue?: any;
  script?: string; // For script type - AI-generated script
  scriptDescription?: string; // User's description of what the script should do
  order: number;
}

interface CustomFieldsManagementProps {
  workspaceId: string;
  accessToken?: string;
}

export function CustomFieldsManagement({ workspaceId, accessToken }: CustomFieldsManagementProps) {
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  // Form state
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<CustomField['type']>('text');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<string[]>(['']);
  const [fieldDefaultValue, setFieldDefaultValue] = useState('');
  const [fieldScript, setFieldScript] = useState('');
  const [fieldScriptDescription, setFieldScriptDescription] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  useEffect(() => {
    console.log('CustomFieldsManagement - workspaceId:', workspaceId, 'accessToken:', accessToken ? 'present' : 'missing');
    if (workspaceId && accessToken) {
      loadCustomFields();
    } else {
      setIsLoading(false);
    }
  }, [workspaceId, accessToken]);

  const loadCustomFields = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspaces/${workspaceId}/custom-fields`,
        {
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCustomFields(data.customFields || []);
      } else {
        toast.error('Failed to load custom fields');
      }
    } catch (error) {
      console.error('Error loading custom fields:', error);
      toast.error('Error loading custom fields');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveField = async () => {
    if (!fieldName.trim()) {
      toast.error('Field name is required');
      return;
    }

    if (fieldType === 'dropdown' && fieldOptions.filter(opt => opt.trim()).length === 0) {
      toast.error('Dropdown fields must have at least one option');
      return;
    }

    try {
      const fieldData: Partial<CustomField> = {
        name: fieldName.trim(),
        type: fieldType,
        required: fieldRequired,
        options: fieldType === 'dropdown' ? fieldOptions.filter(opt => opt.trim()) : undefined,
        defaultValue: fieldDefaultValue || undefined,
        script: fieldType === 'script' ? fieldScript : undefined,
        scriptDescription: fieldType === 'script' ? fieldScriptDescription : undefined,
        order: editingField ? editingField.order : customFields.length
      };

      const url = editingField
        ? `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspaces/${workspaceId}/custom-fields/${editingField.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspaces/${workspaceId}/custom-fields`;

      const response = await fetch(url, {
        method: editingField ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': accessToken,
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(fieldData)
      });

      if (response.ok) {
        toast.success(editingField ? 'Custom field updated' : 'Custom field created');
        resetForm();
        loadCustomFields();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save custom field');
      }
    } catch (error) {
      console.error('Error saving custom field:', error);
      toast.error('Error saving custom field');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this custom field? This will remove the field from all stories.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/workspaces/${workspaceId}/custom-fields/${fieldId}`,
        {
          method: 'DELETE',
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        toast.success('Custom field deleted');
        loadCustomFields();
      } else {
        toast.error('Failed to delete custom field');
      }
    } catch (error) {
      console.error('Error deleting custom field:', error);
      toast.error('Error deleting custom field');
    }
  };

  const resetForm = () => {
    setFieldName('');
    setFieldType('text');
    setFieldRequired(false);
    setFieldOptions(['']);
    setFieldDefaultValue('');
    setFieldScript('');
    setFieldScriptDescription('');
    setEditingField(null);
    setShowAddForm(false);
  };

  const handleEditField = (field: CustomField) => {
    setFieldName(field.name);
    setFieldType(field.type);
    setFieldRequired(field.required);
    setFieldOptions(field.options || ['']);
    setFieldDefaultValue(field.defaultValue || '');
    setFieldScript(field.script || '');
    setFieldScriptDescription(field.scriptDescription || '');
    setEditingField(field);
    setShowAddForm(true);
  };

  const addOption = () => {
    setFieldOptions([...fieldOptions, '']);
  };

  const removeOption = (index: number) => {
    setFieldOptions(fieldOptions.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...fieldOptions];
    newOptions[index] = value;
    setFieldOptions(newOptions);
  };

  const handleGenerateScript = async () => {
    if (!fieldScriptDescription.trim()) {
      toast.error('Please enter a script description');
      return;
    }

    setIsGeneratingScript(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/ai/generate-script`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            description: fieldScriptDescription,
            fieldName: fieldName
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFieldScript(data.script || '');
        toast.success('Script generated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate script');
      }
    } catch (error) {
      console.error('Error generating script:', error);
      toast.error('Error generating script');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading custom fields...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="font-medium text-blue-900">About Custom Fields</div>
            <div className="text-sm text-blue-700 mt-1">
              Custom fields allow you to add additional information to stories and epics. You can create fields of different types (text, number, date, dropdown, checkbox, user) and mark them as required if needed.
            </div>
          </div>
        </div>
      </div>

      {/* Existing Fields List */}
      {customFields.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#14213D' }}>
              <ListChecks className="w-5 h-5" style={{ color: '#FCA311' }} />
              Existing Custom Fields ({customFields.length})
            </h3>
            <span className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: '#FCA311', color: '#14213D' }}>
              {customFields.length} field{customFields.length !== 1 ? 's' : ''} configured
            </span>
          </div>
          <div className="space-y-2">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="flex items-center gap-3 p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
                style={{ borderColor: '#E5E5E5' }}
              >
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-base" style={{ color: '#000000' }}>
                      {field.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded border bg-gray-50">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 border-red-300">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    {field.type === 'dropdown' && field.options && (
                      <span>
                        Options: {field.options.join(', ')}
                      </span>
                    )}
                    {field.defaultValue && (
                      <span className="text-xs">
                        Default: <code className="bg-gray-100 px-1 py-0.5 rounded">{field.defaultValue}</code>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => handleEditField(field)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-orange-50"
                  >
                    <Edit2 className="w-4 h-4" style={{ color: '#FCA311' }} />
                  </Button>
                  <Button
                    onClick={() => handleDeleteField(field.id)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !showAddForm && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg" style={{ borderColor: '#E5E5E5' }}>
            <ListChecks className="w-12 h-12 mx-auto mb-4" style={{ color: '#FCA311' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#14213D' }}>
              No Custom Fields Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create custom fields to capture additional information specific to your project needs.
            </p>
          </div>
        )
      )}

      {/* Add/Edit Form */}
      {showAddForm ? (
        <div 
          className="border rounded-lg p-6"
          style={{ borderColor: '#FCA311', backgroundColor: '#FFFFFF' }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#14213D' }}>
            {editingField ? 'Edit Custom Field' : 'Add New Custom Field'}
          </h3>
          
          <div className="space-y-4">
            {/* Field Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>
                Field Name *
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g., Customer Priority"
                className="w-full px-3 py-2 border rounded-lg"
                style={{ borderColor: '#E5E5E5' }}
              />
            </div>

            {/* Field Type */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>
                Field Type *
              </label>
              <select
                value={fieldType}
                onChange={(e) => setFieldType(e.target.value as CustomField['type'])}
                className="w-full px-3 py-2 border rounded-lg"
                style={{ borderColor: '#E5E5E5' }}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkbox">Checkbox</option>
                <option value="user">User</option>
                <option value="script">Script</option>
              </select>
            </div>

            {/* Dropdown Options */}
            {fieldType === 'dropdown' && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>
                  Dropdown Options *
                </label>
                <div className="space-y-2">
                  {fieldOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border rounded-lg"
                        style={{ borderColor: '#E5E5E5' }}
                      />
                      {fieldOptions.length > 1 && (
                        <Button
                          onClick={() => removeOption(index)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={addOption}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </div>
            )}

            {/* Default Value */}
            {fieldType !== 'checkbox' && (
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>
                  Default Value (Optional)
                </label>
                {fieldType === 'dropdown' ? (
                  <select
                    value={fieldDefaultValue}
                    onChange={(e) => setFieldDefaultValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: '#E5E5E5' }}
                  >
                    <option value="">-- No default --</option>
                    {fieldOptions.filter(opt => opt.trim()).map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={fieldType === 'number' ? 'number' : fieldType === 'date' ? 'date' : 'text'}
                    value={fieldDefaultValue}
                    onChange={(e) => setFieldDefaultValue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: '#E5E5E5' }}
                  />
                )}
              </div>
            )}

            {/* Script */}
            {fieldType === 'script' && (
              <div className="space-y-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-purple-900">AI-Powered Script Field</div>
                      <div className="text-sm text-purple-700 mt-1">
                        Describe what you want this field to calculate, and AI will generate the script for you. Script fields are computed dynamically based on story, epic, and workspace data.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>
                    What should this field calculate? *
                  </label>
                  <textarea
                    value={fieldScriptDescription}
                    onChange={(e) => setFieldScriptDescription(e.target.value)}
                    placeholder="e.g., Calculate the total story points completed in this epic&#10;e.g., Show the percentage of tasks that are done&#10;e.g., Count the number of high-priority stories"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: '#E5E5E5' }}
                  />
                </div>

                <Button
                  onClick={handleGenerateScript}
                  disabled={isGeneratingScript || !fieldScriptDescription.trim()}
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: '#FCA311' }}
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Script...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Script with AI
                    </>
                  )}
                </Button>

                {fieldScript && (
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#000000' }}>
                      Generated Script (You can edit this)
                    </label>
                    <textarea
                      value={fieldScript}
                      onChange={(e) => setFieldScript(e.target.value)}
                      placeholder="Script will appear here..."
                      rows={8}
                      className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                      style={{ borderColor: '#E5E5E5' }}
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      The script receives a context object with: story, epic, workspace, and customFields
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Required Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={fieldRequired}
                onChange={(e) => setFieldRequired(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="required" className="text-sm" style={{ color: '#000000' }}>
                Required field
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveField}
                className="text-white font-semibold"
                style={{ backgroundColor: '#14213D' }}
              >
                {editingField ? 'Update Field' : 'Create Field'}
              </Button>
              <Button
                onClick={resetForm}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowAddForm(true)}
          className="text-white font-semibold"
          style={{ backgroundColor: '#14213D' }}
        >
          <Plus className="w-4 h-4 mr-2" style={{ color: '#FCA311' }} />
          Add New Custom Field
        </Button>
      )}
    </div>
  );
}