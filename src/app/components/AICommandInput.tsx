import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, X, Layers, LayoutDashboard, FileBarChart, Ticket, UserPlus, Kanban } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface AICommandInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (command: string, context: string) => void;
  isGenerating?: boolean;
  context?: 'workspace' | 'board' | 'dashboard' | 'report' | 'ticket' | 'user' | 'general';
  workspaces?: any[];
}

const commandTemplates = {
  workspace: {
    title: "AI Workspace Creator",
    subtitle: "Describe your project and AI will create everything",
    icon: Layers,
    placeholder: "Example: Create a fintech mobile app with payment integration...",
    samples: [
      {
        category: "Software Development",
        commands: [
          "Create a mobile banking app with user authentication and payment features",
          "Build an e-commerce platform with product catalog and checkout",
          "Develop a task management system with kanban boards and sprints"
        ]
      },
      {
        category: "Marketing & Business",
        commands: [
          "Create a marketing campaign for Q1 product launch",
          "Build a content calendar for social media management",
          "Develop a customer feedback analysis project"
        ]
      },
      {
        category: "Data & Analytics",
        commands: [
          "Create a data pipeline project for real-time analytics",
          "Build a customer segmentation analysis workspace",
          "Develop a reporting dashboard for business metrics"
        ]
      }
    ]
  },
  board: {
    title: "AI Board Creator",
    subtitle: "Create kanban or scrum boards with AI",
    icon: Kanban,
    placeholder: "Example: Create a sprint board for backend API development...",
    samples: [
      {
        category: "Development Boards",
        commands: [
          "Create a sprint board for backend API development with To Do, In Progress, Review, Done columns",
          "Build a kanban board for frontend UI tasks with priority swimlanes",
          "Create a bug tracking board with severity-based workflow"
        ]
      },
      {
        category: "Product Boards",
        commands: [
          "Create a product roadmap board with quarterly milestones",
          "Build a feature request board with voting and prioritization",
          "Create a release planning board with version tracking"
        ]
      },
      {
        category: "Team Boards",
        commands: [
          "Create a team capacity planning board with resource allocation",
          "Build a design review board with approval workflow",
          "Create a QA testing board with test case management"
        ]
      }
    ]
  },
  dashboard: {
    title: "AI Dashboard Creator",
    subtitle: "Generate analytics dashboards with AI",
    icon: LayoutDashboard,
    placeholder: "Example: Create a team performance dashboard with velocity and burndown charts...",
    samples: [
      {
        category: "Performance Dashboards",
        commands: [
          "Create a team performance dashboard with velocity, burndown, and completion rate charts",
          "Build a sprint health dashboard with story point tracking and team capacity metrics",
          "Create an individual contributor dashboard with task completion and time tracking"
        ]
      },
      {
        category: "Business Dashboards",
        commands: [
          "Create a project portfolio dashboard with budget, timeline, and resource allocation",
          "Build an executive summary dashboard with KPIs and milestone progress",
          "Create a customer metrics dashboard with satisfaction scores and feedback trends"
        ]
      },
      {
        category: "Technical Dashboards",
        commands: [
          "Create a code quality dashboard with test coverage and bug density metrics",
          "Build a deployment dashboard with release frequency and success rates",
          "Create a system health dashboard with uptime and performance monitoring"
        ]
      }
    ]
  },
  report: {
    title: "AI Report Creator",
    subtitle: "Generate custom reports with AI",
    icon: FileBarChart,
    placeholder: "Example: Create a sprint retrospective report with team insights...",
    samples: [
      {
        category: "Sprint Reports",
        commands: [
          "Create a sprint retrospective report with completed tasks, blockers, and team insights",
          "Generate a sprint velocity report comparing last 6 sprints with trend analysis",
          "Create a sprint burndown report with daily progress and scope changes"
        ]
      },
      {
        category: "Performance Reports",
        commands: [
          "Generate a team productivity report with individual contributions and metrics",
          "Create a project health report with budget, timeline, and risk analysis",
          "Generate a release readiness report with quality gates and deployment checklist"
        ]
      },
      {
        category: "Analytics Reports",
        commands: [
          "Create a technical debt report with code quality and refactoring recommendations",
          "Generate a customer feedback report with sentiment analysis and trending issues",
          "Create a resource utilization report with capacity planning suggestions"
        ]
      }
    ]
  },
  ticket: {
    title: "AI Ticket Creator",
    subtitle: "Create detailed tickets with AI assistance",
    icon: Ticket,
    placeholder: "Example: Create a user story for login authentication with acceptance criteria...",
    samples: [
      {
        category: "User Stories",
        commands: [
          "Create a user story for login authentication with OAuth integration and acceptance criteria",
          "Create a user story for payment processing with Stripe integration and error handling",
          "Create a user story for user profile management with photo upload and validation"
        ]
      },
      {
        category: "Bug Tickets",
        commands: [
          "Create a bug ticket for login page not loading on mobile devices with reproduction steps",
          "Create a critical bug for payment failures with transaction logs and impact analysis",
          "Create a bug ticket for slow dashboard performance with profiling data"
        ]
      },
      {
        category: "Task Tickets",
        commands: [
          "Create a technical task for database migration with rollback plan and testing steps",
          "Create a task for API documentation update with endpoint specifications",
          "Create a task for unit test coverage improvement with specific test scenarios"
        ]
      }
    ]
  },
  user: {
    title: "AI User Management",
    subtitle: "Add users to projects with AI",
    icon: UserPlus,
    placeholder: "Example: Add Sarah Chen as Senior Developer to Mobile Banking App project...",
    samples: [
      {
        category: "Add Team Members",
        commands: [
          "Add Sarah Chen as Senior Developer to Mobile Banking App project with full access",
          "Add John Smith as Product Owner to E-commerce Platform with admin permissions",
          "Add Maria Garcia as QA Engineer to Backend API project with testing access"
        ]
      },
      {
        category: "Bulk User Addition",
        commands: [
          "Add the following developers to Mobile App project: Alex Kim, Jenny Lee, David Park",
          "Add entire Design Team (5 members) to UI Redesign project as Designers",
          "Add external consultants to Marketing Campaign with read-only access"
        ]
      },
      {
        category: "Role Assignment",
        commands: [
          "Promote Tom Wilson to Scrum Master role in Agile Transformation project",
          "Change Lisa Brown from Developer to Tech Lead in Backend Services project",
          "Add Robert Johnson as Stakeholder with reporting access to Q1 Planning"
        ]
      }
    ]
  },
  general: {
    title: "AI Command Center",
    subtitle: "Execute any command with AI",
    icon: Sparkles,
    placeholder: "Example: What would you like to create or manage?",
    samples: [
      {
        category: "Quick Commands",
        commands: [
          "Create a workspace for mobile app development",
          "Create a sprint board for current iteration",
          "Generate a performance dashboard for my team"
        ]
      }
    ]
  }
};

export function AICommandInput({ isOpen, onClose, onSubmit, isGenerating = false, context = 'workspace', workspaces = [] }: AICommandInputProps) {
  const [command, setCommand] = useState('');
  const template = commandTemplates[context];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onSubmit(command.trim(), context);
    }
  };

  const handleSampleClick = (sampleCommand: string) => {
    setCommand(sampleCommand);
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
        className="glass-strong rounded-3xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
        style={{ border: '2px solid rgba(252, 163, 17, 0.3)' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200/30 flex items-center justify-between" style={{ backgroundColor: '#14213D' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center glow-orange" style={{ backgroundColor: '#FCA311' }}>
              <template.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{template.title}</h2>
              <p className="text-sm text-gray-300">{template.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          {/* Command Input */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={template.placeholder}
                className="pr-12 h-14 text-base glass-dark border-2 focus:border-[#FCA311] transition-all"
                style={{ color: '#000000', borderColor: '#E5E5E5' }}
                disabled={isGenerating}
                autoFocus
              />
              <Button
                type="submit"
                disabled={!command.trim() || isGenerating}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg shadow-lg hover:scale-105 transition-transform"
                style={{ backgroundColor: '#FCA311' }}
              >
                {isGenerating ? (
                  <Sparkles className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" style={{ color: '#FCA311' }} />
              {context === 'workspace' && 'AI will auto-generate: Projects, Epics, Stories, Subtasks, Sprints, and more'}
              {context === 'board' && 'AI will create columns, workflows, and initial cards'}
              {context === 'dashboard' && 'AI will generate charts, widgets, and KPI metrics'}
              {context === 'report' && 'AI will analyze data and create comprehensive reports'}
              {context === 'ticket' && 'AI will generate detailed descriptions and acceptance criteria'}
              {context === 'user' && 'AI will configure roles and permissions automatically'}
            </p>
          </form>

          {/* Workspace Selector for ticket/user context */}
          {(context === 'ticket' || context === 'user') && workspaces.length > 0 && (
            <div className="mb-6 p-4 glass-dark rounded-xl border border-slate-200/30">
              <label className="text-sm font-medium mb-2 block" style={{ color: '#000000' }}>
                Target Workspace/Project
              </label>
              <select 
                className="w-full p-2 rounded-lg border-2 border-slate-200 focus:border-[#FCA311] outline-none"
                style={{ color: '#000000' }}
              >
                <option>Select a workspace...</option>
                {workspaces.map((ws, idx) => (
                  <option key={idx} value={ws.id}>{ws.workspace?.name || ws.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/30 glass-dark">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Powered by GPT-4o</span>
            <span>Zero-Config Project Creation (ZCPC)</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}