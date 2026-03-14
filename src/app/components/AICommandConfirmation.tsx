import { useState } from 'react';
import { UnifiedModal } from './UnifiedModal';
import { UnifiedButtons } from './UnifiedButtons';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  Layers, 
  Kanban, 
  LayoutDashboard, 
  FileBarChart, 
  Ticket, 
  Settings, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Calendar,
  Target,
  GitBranch,
  FolderPlus,
  Edit,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';

export interface AICommandDetails {
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'configure' | 'bulk';
  targetEntity: string;
  confidence: number;
  params: Record<string, any>;
  summary: string;
  impactLevel: 'low' | 'medium' | 'high';
  affectedItems?: string[];
  warnings?: string[];
  recommendations?: string[];
}

interface AICommandConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  details: AICommandDetails | null;
  isProcessing?: boolean;
}

const actionIcons: Record<string, any> = {
  create_workspace: Layers,
  create_project: FolderPlus,
  create_board: Kanban,
  create_dashboard: LayoutDashboard,
  create_epic: Target,
  create_story: Ticket,
  create_sprint: Calendar,
  create_subtask: GitBranch,
  update_workflow: Settings,
  update_settings: Settings,
  add_field: Plus,
  remove_field: Minus,
  add_user: Users,
  remove_user: Users,
  update_board: Kanban,
  delete_item: Trash2,
  bulk_update: Edit,
  default: Sparkles
};

const actionColors: Record<string, string> = {
  create: '#10B981',
  update: '#3B82F6',
  delete: '#EF4444',
  configure: '#8B5CF6',
  bulk: '#F59E0B'
};

const impactColors: Record<string, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444'
};

export function AICommandConfirmation({
  isOpen,
  onClose,
  onConfirm,
  details,
  isProcessing = false
}: AICommandConfirmationProps) {
  if (!details) return null;

  const Icon = actionIcons[details.action] || actionIcons.default;
  const actionColor = actionColors[details.actionType] || '#FCA311';
  const impactColor = impactColors[details.impactLevel] || '#F59E0B';

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm AI Command"
      icon={<Sparkles className="w-6 h-6" />}
      size="lg"
      isLoading={isProcessing}
      actions={
        <>
          <UnifiedButtons.Secondary onClick={onClose} disabled={isProcessing}>
            Cancel
          </UnifiedButtons.Secondary>
          <UnifiedButtons.Primary onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Confirm & Execute'}
          </UnifiedButtons.Primary>
        </>
      }
    >
      <div className="space-y-6">
        {/* AI Analysis Summary */}
        <div 
          className="p-4 rounded-lg border-2"
          style={{ 
            backgroundColor: '#F8FAFC',
            borderColor: actionColor,
            borderLeftWidth: '4px'
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: actionColor }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1" style={{ color: '#000000' }}>
                {details.summary}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: actionColor + '20',
                    color: actionColor,
                    border: `1px solid ${actionColor}`
                  }}
                >
                  {details.actionType.toUpperCase()}
                </Badge>
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: '#E5E5E5',
                    color: '#000000'
                  }}
                >
                  {details.targetEntity}
                </Badge>
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: impactColor + '20',
                    color: impactColor,
                    border: `1px solid ${impactColor}`
                  }}
                >
                  {details.impactLevel.toUpperCase()} Impact
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: '#000000' }}>
              AI Confidence Score
            </span>
            <span className="text-sm font-bold" style={{ color: '#FCA311' }}>
              {Math.round(details.confidence * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${details.confidence * 100}%`,
                backgroundColor: details.confidence >= 0.8 ? '#10B981' : details.confidence >= 0.6 ? '#F59E0B' : '#EF4444'
              }}
            />
          </div>
          {details.confidence < 0.7 && (
            <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-900">
                Low confidence score. Please review the details carefully before confirming.
              </p>
            </div>
          )}
        </div>

        {/* Parameters Details */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: '#000000' }}>
            <Info className="w-4 h-4" style={{ color: '#FCA311' }} />
            Command Details
          </h4>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {Object.entries(details.params).map(([key, value], index) => (
              <div 
                key={key}
                className={`px-4 py-3 flex items-start justify-between ${
                  index !== Object.entries(details.params).length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <span className="text-sm font-medium capitalize" style={{ color: '#666666' }}>
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-bold text-right ml-4" style={{ color: '#000000' }}>
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Affected Items */}
        {details.affectedItems && details.affectedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: '#000000' }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
              Affected Items ({details.affectedItems.length})
            </h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-h-40 overflow-y-auto">
              <ul className="space-y-1">
                {details.affectedItems.map((item, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
                    <span style={{ color: '#000000' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Warnings */}
        {details.warnings && details.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              Warnings ({details.warnings.length})
            </h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
              {details.warnings.map((warning, index) => (
                <div key={index} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900">{warning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {details.recommendations && details.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold flex items-center gap-2" style={{ color: '#3B82F6' }}>
              <Info className="w-4 h-4" />
              AI Recommendations ({details.recommendations.length})
            </h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              {details.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Preview */}
        <div 
          className="p-4 rounded-lg border-2 border-dashed"
          style={{ 
            backgroundColor: '#F8FAFC',
            borderColor: '#FCA311'
          }}
        >
          <h4 className="text-sm font-bold mb-2 flex items-center gap-2" style={{ color: '#000000' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#FCA311' }} />
            What will happen when you confirm?
          </h4>
          <p className="text-sm" style={{ color: '#666666' }}>
            {getActionDescription(details)}
          </p>
        </div>
      </div>
    </UnifiedModal>
  );
}

function getActionDescription(details: AICommandDetails): string {
  const { action, params, affectedItems } = details;

  switch (action) {
    case 'create_workspace':
      return `A new workspace "${params.name || 'Untitled'}" will be created with ${params.projectCount || 0} projects, ${params.epicCount || 0} epics, and ${params.storyCount || 0} stories.`;
    
    case 'create_project':
      return `A new project "${params.name || 'Untitled'}" will be created in the current workspace with ${params.epicCount || 0} epics and ${params.methodology || 'Scrum'} methodology.`;
    
    case 'create_board':
      return `A new ${params.boardType || 'Kanban'} board "${params.name || 'Untitled'}" will be created with ${params.columns?.length || 0} columns.`;
    
    case 'create_dashboard':
      return `A new dashboard "${params.name || 'Untitled'}" will be created with ${params.widgets?.length || 0} widgets including ${params.chartTypes?.join(', ') || 'various charts'}.`;
    
    case 'update_workflow':
      return `The workflow will be updated with ${params.changes?.length || 0} changes affecting ${affectedItems?.length || 0} items.`;
    
    case 'add_field':
      return `A new field "${params.fieldName}" of type "${params.fieldType}" will be added to ${params.targetEntity || 'the selected entity'}.`;
    
    case 'remove_field':
      return `The field "${params.fieldName}" will be removed from ${params.targetEntity || 'the selected entity'}. This may affect ${affectedItems?.length || 0} items.`;
    
    case 'bulk_update':
      return `${affectedItems?.length || 0} items will be updated with the specified changes.`;
    
    default:
      return `The AI will execute the "${action}" command with the parameters shown above.`;
  }
}
