import { motion } from 'motion/react';
import { Briefcase, FolderKanban, Layers, BookOpen, CheckSquare } from 'lucide-react';

interface HierarchyDiagramProps {
  stats: {
    programs?: number;
    projects: number;
    epics: number;
    stories: number;
    subtasks: number;
  };
  compact?: boolean;
}

export function HierarchyDiagram({ stats, compact = false }: HierarchyDiagramProps) {
  const levels = [
    {
      name: 'Workspace',
      icon: Briefcase,
      color: 'from-slate-600 to-slate-700',
      count: 1,
      level: 0,
      show: true
    },
    {
      name: 'Programs',
      icon: FolderKanban,
      color: 'from-purple-600 to-purple-700',
      count: stats.programs || 0,
      level: 1,
      show: stats.programs && stats.programs > 0
    },
    {
      name: 'Projects',
      icon: FolderKanban,
      color: 'from-blue-600 to-blue-700',
      count: stats.projects,
      level: stats.programs && stats.programs > 0 ? 2 : 1,
      show: true
    },
    {
      name: 'Epics',
      icon: Layers,
      color: 'from-indigo-600 to-indigo-700',
      count: stats.epics,
      level: stats.programs && stats.programs > 0 ? 3 : 2,
      show: true
    },
    {
      name: 'Stories',
      icon: BookOpen,
      color: 'from-cyan-600 to-cyan-700',
      count: stats.stories,
      level: stats.programs && stats.programs > 0 ? 4 : 3,
      show: true
    },
    {
      name: 'Subtasks',
      icon: CheckSquare,
      color: 'from-green-600 to-green-700',
      count: stats.subtasks,
      level: stats.programs && stats.programs > 0 ? 5 : 4,
      show: true
    }
  ];

  const visibleLevels = levels.filter(l => l.show);

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {visibleLevels.map((level, index) => (
          <div key={level.name} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center`}>
              <level.icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {level.count} {level.name}
            </span>
            {index < visibleLevels.length - 1 && (
              <span className="text-gray-400 mx-1">→</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleLevels.map((level, index) => (
        <motion.div
          key={level.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-4"
          style={{ paddingLeft: `${level.level * 24}px` }}
        >
          {/* Connection Line */}
          {level.level > 0 && (
            <div className="absolute left-0 w-6 h-px bg-gradient-to-r from-gray-300 to-transparent" 
                 style={{ marginLeft: `${(level.level - 1) * 24 + 16}px` }} 
            />
          )}
          
          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center shadow-lg flex-shrink-0 relative z-10`}
          >
            <level.icon className="w-5 h-5 text-white" />
          </motion.div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{level.name}</span>
              {level.count > 0 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                  {level.count}
                </span>
              )}
            </div>
            {level.level > 0 && (
              <div className="text-xs text-gray-500">
                Level {level.level}
              </div>
            )}
          </div>

          {/* Vertical connector to next level */}
          {index < visibleLevels.length - 1 && level.count > 0 && (
            <div 
              className="absolute w-px h-6 bg-gradient-to-b from-gray-300 to-transparent" 
              style={{ 
                marginLeft: `${level.level * 24 + 20}px`,
                marginTop: '40px'
              }} 
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
