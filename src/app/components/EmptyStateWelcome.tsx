import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Logo } from './Logo';
import { QuickCommandsHelp } from './QuickCommandsHelp';
import { Sparkles, Rocket, Zap, Brain, Users, Target, BookOpen } from 'lucide-react';

interface EmptyStateWelcomeProps {
  onCreateWorkspace: () => void;
  onViewExamples: () => void;
}

export function EmptyStateWelcome({ onCreateWorkspace, onViewExamples }: EmptyStateWelcomeProps) {
  const [showQuickCommands, setShowQuickCommands] = useState(false);
  
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Planning',
      description: 'Let AI create your entire project structure from a simple description',
      color: 'cyan',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Zap,
      title: 'Smart Automation',
      description: 'Automatic task assignment, estimation, and sprint planning',
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Built-in user management, teams, and workspace permissions',
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Target,
      title: 'Zero Configuration',
      description: 'Start working immediately with intelligent defaults',
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <Logo size="xl" showText={true} />
        </div>
        
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Projify AI
        </h2>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create your first workspace and experience the power of AI-driven project management
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button 
            onClick={onCreateWorkspace}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 shadow-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create Your First Workspace
          </Button>
          
          <Button 
            onClick={() => setShowQuickCommands(true)}
            size="lg"
            variant="outline"
            className="border-blue-300 hover:border-blue-400 hover:bg-blue-50"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            AI Command Examples
          </Button>
          
          <Button 
            onClick={onViewExamples}
            size="lg"
            variant="outline"
            className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            View Examples
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {features.map((feature) => (
          <Card 
            key={feature.title}
            className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group bg-white"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start Examples */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardContent className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            Try These AI Commands
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'create Mobile Banking workspace with scrum type',
              'create QA Testing workspace with kanban type',
              'create E-commerce Platform workspace with scrum type',
              'create Marketing Campaign workspace with kanban type'
            ].map((example) => (
              <div 
                key={example}
                className="bg-white rounded-lg p-4 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="fintech"]') as HTMLInputElement;
                  if (input) {
                    input.value = example;
                    input.focus();
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  <p className="text-sm text-gray-700 group-hover:text-cyan-600 transition-colors">
                    "{example}"
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Click any example to try it, or type your own in the command box below
          </p>
        </CardContent>
      </Card>

      {/* Quick Commands Help Modal */}
      {showQuickCommands && (
        <QuickCommandsHelp 
          onClose={() => setShowQuickCommands(false)}
          onUseCommand={(command) => {
            const input = document.querySelector('input[placeholder*="fintech"]') as HTMLInputElement;
            if (input) {
              input.value = command;
              input.focus();
            }
          }}
        />
      )}
    </div>
  );
}