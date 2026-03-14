import { FolderKanban, MoreVertical, Trash2, Edit, BarChart3, FileText, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  type?: string;
  created_at: string;
  epic_count?: number;
  story_count?: number;
  task_count?: number;
}

interface GlassWorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onViewReports: () => void;
  onExport: () => void;
}

const workspaceTypeColors = {
  kanban: 'from-blue-600 to-blue-700',
  scrum: 'from-slate-600 to-slate-700',
  business: 'from-blue-600 to-blue-700',
  test: 'from-slate-600 to-slate-700',
};

const workspaceTypeIcons = {
  kanban: '📋',
  scrum: '🏃',
  business: '💼',
  test: '🧪',
};

export function GlassWorkspaceCard({ 
  workspace, 
  onClick, 
  onDelete, 
  onEdit, 
  onViewReports,
  onExport 
}: GlassWorkspaceCardProps) {
  const workspaceType = workspace.type?.toLowerCase() || 'kanban';
  const gradientClass = workspaceTypeColors[workspaceType as keyof typeof workspaceTypeColors] || workspaceTypeColors.kanban;
  const icon = workspaceTypeIcons[workspaceType as keyof typeof workspaceTypeIcons] || '📋';

  return (
    <div className="group card hover:scale-[1.02] cursor-pointer">
      {/* Gradient top bar */}
      <div className={`h-2 bg-gradient-to-r ${gradientClass} rounded-t-xl`}></div>
      
      <div className="p-6" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                {workspace.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Created {new Date(workspace.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="hover:bg-blue-50 text-gray-600 hover:text-blue-600"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="hover:bg-red-50 text-gray-600 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Description */}
        {workspace.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {workspace.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="glass-dark rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gradient">{workspace.epic_count || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Epics</div>
          </div>
          <div className="glass-dark rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gradient">{workspace.story_count || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Stories</div>
          </div>
          <div className="glass-dark rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-gradient">{workspace.task_count || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Tasks</div>
          </div>
        </div>

        {/* Type badge */}
        <div className="flex items-center justify-between">
          <Badge className={`bg-gradient-to-r ${gradientClass} text-white border-0 capitalize`}>
            {workspaceType}
          </Badge>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewReports();
              }}
              className="text-xs hover:bg-blue-50 text-gray-600 hover:text-blue-600 h-7"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Reports
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onExport();
              }}
              className="text-xs hover:bg-blue-50 text-gray-600 hover:text-blue-600 h-7"
            >
              <FileText className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Hover effect - glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradientClass} opacity-10 blur-xl`}></div>
      </div>
    </div>
  );
}
