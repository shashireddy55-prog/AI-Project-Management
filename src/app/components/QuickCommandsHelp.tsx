import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Sparkles, Code, Rocket, Users, TestTube, Palette, 
  TrendingUp, X, Copy, Check, ChevronDown, ChevronUp 
} from 'lucide-react';
import { toast } from 'sonner';

interface QuickCommandsHelpProps {
  onClose: () => void;
  onUseCommand?: (command: string) => void;
}

export function QuickCommandsHelp({ onClose, onUseCommand }: QuickCommandsHelpProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('software');

  const commandCategories = [
    {
      id: 'software',
      icon: Code,
      title: 'Software Development',
      color: 'blue',
      commands: [
        'create Mobile Banking workspace with scrum type',
        'create E-commerce Platform workspace with kanban type',
        'create SaaS Dashboard workspace with scrum type',
        'create API Development workspace with kanban type'
      ]
    },
    {
      id: 'business',
      icon: TrendingUp,
      title: 'Business & Marketing',
      color: 'green',
      commands: [
        'create Marketing Campaign workspace with scrum type',
        'create Product Launch workspace with kanban type',
        'create Sales Pipeline workspace with scrum type',
        'create Customer Success workspace with kanban type'
      ]
    },
    {
      id: 'testing',
      icon: TestTube,
      title: 'QA & Testing',
      color: 'cyan',
      commands: [
        'create QA Testing workspace with scrum type',
        'create Test Automation workspace with kanban type',
        'create Mobile Testing workspace with scrum type',
        'create Security Testing workspace with kanban type'
      ]
    },
    {
      id: 'design',
      icon: Palette,
      title: 'Design & Creative',
      color: 'blue',
      commands: [
        'create UI/UX Design workspace with kanban type',
        'create Brand Identity workspace with scrum type',
        'create Website Redesign workspace with kanban type',
        'create Design System workspace with scrum type'
      ]
    },
    {
      id: 'workdesk',
      icon: Rocket,
      title: 'Workdesk Projects',
      color: 'blue',
      commands: [
        'create Customer Support workspace with kanban type',
        'create IT Help Desk workspace with scrum type',
        'create Bug Tracking workspace with kanban type',
        'create Service Requests workspace with scrum type'
      ]
    }
  ];

  const handleCopy = (command: string, index: number) => {
    navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    toast.success('Command copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleUse = (command: string) => {
    onUseCommand?.(command);
    onClose();
    toast.success('Command ready to use!');
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                AI Command Examples
              </CardTitle>
              <CardDescription className="mt-1">
                Copy and paste these commands to quickly create workspaces, projects, and workdesks
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1 p-6">
          <div className="space-y-4">
            {commandCategories.map((category, categoryIndex) => {
              const isExpanded = expandedCategory === category.id;
              const Icon = category.icon;
              
              return (
                <div key={category.id}>
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-${category.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${category.color}-600`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">{category.title}</h3>
                        <p className="text-xs text-gray-500">{category.commands.length} commands</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">
                        {category.commands.length}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      )}
                    </div>
                  </button>

                  {/* Commands List */}
                  {isExpanded && (
                    <div className="mt-2 space-y-2 pl-4">
                      {category.commands.map((command, commandIndex) => {
                        const globalIndex = categoryIndex * 100 + commandIndex;
                        const isCopied = copiedIndex === globalIndex;
                        
                        return (
                          <div
                            key={commandIndex}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-start gap-2">
                                  <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    "{command}"
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopy(command, globalIndex)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {isCopied ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleUse(command)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Use
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pro Tips Section */}
          <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-600" />
              Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-0.5">•</span>
                <span>Be specific: Include team size, timeline, and technologies for better results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-0.5">•</span>
                <span>Mix and match: Combine different elements to create unique workspaces</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-0.5">•</span>
                <span>Use the AI Assistant: Click the floating AI button anytime for help</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-0.5">•</span>
                <span>Iterate: Start simple, then use AI to add more details to your workspace</span>
              </li>
            </ul>
          </div>
        </CardContent>

        <div className="border-t bg-gray-50 p-4 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            💡 Click "Use" to auto-fill the command, or "Copy" to use it later
          </p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}