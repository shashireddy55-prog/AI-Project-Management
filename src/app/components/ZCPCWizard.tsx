import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sparkles,
  Brain,
  Target,
  Workflow,
  FileText,
  Users,
  Layers,
  GitBranch,
  TrendingUp,
  Zap,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  CheckCircle,
  Loader2,
  ArrowRight,
  Play,
  Wand2,
  Lightbulb,
  Rocket,
  Globe,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { HierarchyDiagram } from './HierarchyDiagram';

interface ZCPCWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (workspace: any) => void;
}

// All 12 ZCPC components
const zcpcComponents = [
  { id: 'industry', icon: Brain, label: 'Industry Detection', color: 'from-blue-500 to-cyan-500' },
  { id: 'methodology', icon: Target, label: 'Methodology Selection', color: 'from-cyan-500 to-blue-500' },
  { id: 'workflow', icon: Workflow, label: 'Workflow Generation', color: 'from-blue-600 to-cyan-600' },
  { id: 'issuetypes', icon: FileText, label: 'Issue Type Creation', color: 'from-cyan-600 to-blue-600' },
  { id: 'roles', icon: Users, label: 'Role Assignment', color: 'from-blue-500 to-cyan-500' },
  { id: 'backlog', icon: Layers, label: 'Backlog Generation', color: 'from-cyan-500 to-blue-500' },
  { id: 'sprints', icon: GitBranch, label: 'Sprint Plan Creation', color: 'from-blue-600 to-cyan-600' },
  { id: 'capacity', icon: TrendingUp, label: 'Capacity Allocation', color: 'from-cyan-600 to-blue-600' },
  { id: 'automation', icon: Zap, label: 'Automation Setup', color: 'from-blue-500 to-cyan-500' },
  { id: 'risk', icon: AlertTriangle, label: 'Risk Engine Activation', color: 'from-cyan-500 to-blue-500' },
  { id: 'reports', icon: BarChart3, label: 'Report Generation', color: 'from-blue-600 to-cyan-600' },
  { id: 'integrations', icon: Settings, label: 'Integration Setup', color: 'from-cyan-600 to-blue-600' },
  { id: 'governance', icon: Shield, label: 'Governance Snapshot', color: 'from-blue-500 to-cyan-500' }
];

// Example prompts
const examplePrompts = [
  "create Mobile Banking workspace with scrum type",
  "create E-commerce Platform workspace with kanban type",
  "create Healthcare Portal workspace with scrum type",
  "create SaaS Project Management workspace with scrum type",
  "create Real Estate Listing workspace with kanban type"
];

export function ZCPCWizard({ isOpen, onClose, onComplete }: ZCPCWizardProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'complete'>('input');
  const [projectDescription, setProjectDescription] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [subdomainError, setSubdomainError] = useState('');
  const [generatingComponents, setGeneratingComponents] = useState<string[]>([]);
  const [completedComponents, setCompletedComponents] = useState<string[]>([]);
  const [currentComponent, setCurrentComponent] = useState<number>(0);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setProjectDescription('');
      setSubdomain('');
      setIsCheckingSubdomain(false);
      setSubdomainAvailable(null);
      setSubdomainError('');
      setGeneratingComponents([]);
      setCompletedComponents([]);
      setCurrentComponent(0);
      setGeneratedData(null);
      setIsGenerating(false);
    }
  }, [isOpen]);

  const handleUseExample = (example: string) => {
    setProjectDescription(example);
  };

  const handleGenerate = async () => {
    if (!projectDescription.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    setStep('generating');
    setIsGenerating(true);
    setCurrentComponent(0);
    setGeneratingComponents([]);
    setCompletedComponents([]);

    try {
      // Call the AI generation endpoint
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/zcpc/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            description: projectDescription
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ZCPC API Error:', errorData);
        
        // Handle specific error types
        if (response.status === 429 || errorData.message?.includes('quota') || errorData.message?.includes('429')) {
          throw new Error('OpenAI API quota exceeded. Please check your OpenAI account billing and usage limits at platform.openai.com');
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please check your OpenAI API key configuration.');
        } else if (response.status === 500) {
          throw new Error('Server error occurred. Please try again in a moment.');
        }
        
        throw new Error(errorData.message || errorData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.message || data.error);
      }

      // Simulate progressive component generation for UI
      for (let i = 0; i < zcpcComponents.length; i++) {
        setCurrentComponent(i);
        setGeneratingComponents([zcpcComponents[i].id]);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        
        setCompletedComponents(prev => [...prev, zcpcComponents[i].id]);
        setGeneratingComponents([]);
      }

      setGeneratedData(data);
      setStep('complete');
      
      // Show different notification based on demo mode
      if (data.demoMode) {
        toast.warning('Workspace created in Demo Mode', {
          description: 'OpenAI quota exceeded. Using sample data. Add billing at platform.openai.com for AI generation.',
          duration: 8000
        });
      } else {
        toast.success('Workspace created successfully! 🎉', {
          description: 'All components generated and configured'
        });
      }
    } catch (error: any) {
      console.error('ZCPC Generation Error:', error);
      
      // Provide more specific error messages
      let errorTitle = 'Generation Failed';
      let errorDescription = error.message || 'Please try again';
      let errorDuration = 5000;
      
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        errorTitle = '⚠️ OpenAI API Quota Exceeded';
        errorDescription = 'Your OpenAI API key has reached its usage limit. Please visit platform.openai.com to check your plan and add billing.';
        errorDuration = 10000;
      } else if (error.message?.includes('Authentication')) {
        errorTitle = '🔑 Authentication Error';
        errorDescription = 'Please check your OpenAI API key configuration in the Admin Settings.';
        errorDuration = 8000;
      } else if (error.message?.includes('Server error')) {
        errorTitle = '⚙️ Server Error';
        errorDescription = 'The server encountered an error. Please try again in a moment.';
      }
      
      toast.error(errorTitle, {
        description: errorDescription,
        duration: errorDuration
      });
      setStep('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    if (generatedData) {
      onComplete(generatedData);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        <Card className="bg-white shadow-2xl border-gray-200">
          {/* Header */}
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Wand2 className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Zero-Config Project Creation
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    Describe your project in natural language - AI does the rest
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
            <AnimatePresence mode="wait">
              {/* Step 1: Input */}
              {step === 'input' && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Stats Banner */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { value: '<30s', label: 'Setup Time', icon: Zap },
                      { value: '13', label: 'Components', icon: Layers },
                      { value: '100%', label: 'Automated', icon: Sparkles }
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 text-center"
                      >
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <stat.icon className="w-4 h-4 text-blue-600" />
                          <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        </div>
                        <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Input Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-semibold text-gray-900">
                        Describe Your Project
                      </Label>
                      <Badge className="bg-blue-100 text-blue-700 border-0">
                        <Lightbulb className="w-3 h-3 mr-1" />
                        AI-Powered
                      </Badge>
                    </div>
                    
                    <Textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe your project in detail..."
                      className="min-h-[120px] text-base border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                      disabled={isGenerating}
                    />
                    
                    <p className="text-sm text-gray-500">
                      Be as detailed as possible. Mention features, user types, integrations, or any specific requirements.
                    </p>
                  </div>

                  {/* Example Prompts */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">
                      💡 Quick Start Examples
                    </Label>
                    <div className="grid gap-2">
                      {examplePrompts.map((example, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          onClick={() => handleUseExample(example)}
                          className="text-left p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 hover:text-gray-900 transition-all group"
                        >
                          <div className="flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span>{example}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* What Will Be Generated */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Rocket className="w-5 h-5 text-blue-600" />
                      <h3 className="font-bold text-gray-900">What Will Be Auto-Generated</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {zcpcComponents.map((component, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          <span>{component.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={!projectDescription.trim() || isGenerating}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Generate Workspace
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Generating */}
              {step === 'generating' && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-8"
                >
                  {/* AI Processing Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-2xl"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Brain className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      AI is Creating Your Workspace
                    </h3>
                    <p className="text-gray-600">
                      Analyzing your requirements and generating all components...
                    </p>
                  </div>

                  {/* Progress Overview */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-gray-700">
                        Generation Progress
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {completedComponents.length} / {zcpcComponents.length}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-blue-200">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedComponents.length / zcpcComponents.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Component Generation Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {zcpcComponents.map((component, index) => {
                      const isCompleted = completedComponents.includes(component.id);
                      const isGenerating = generatingComponents.includes(component.id);
                      const isPending = !isCompleted && !isGenerating;

                      return (
                        <motion.div
                          key={component.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            isCompleted
                              ? 'bg-green-50 border-green-300'
                              : isGenerating
                              ? 'bg-blue-50 border-blue-400 shadow-lg'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${component.color}`}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-white" />
                              ) : isGenerating ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                              ) : (
                                <component.icon className="w-5 h-5 text-white opacity-50" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${
                                isCompleted ? 'text-green-700' : isGenerating ? 'text-blue-700' : 'text-gray-500'
                              }`}>
                                {component.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {isCompleted ? 'Complete' : isGenerating ? 'Generating...' : 'Pending'}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Current Action */}
                  {currentComponent < zcpcComponents.length && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border-2 border-blue-400 rounded-xl p-4 shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            Currently Processing: {zcpcComponents[currentComponent]?.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            AI is analyzing and configuring this component...
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Complete */}
              {step === 'complete' && generatedData && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 py-8"
                >
                  {/* Success Header */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 0.6 }}
                      className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Workspace Created Successfully! 🎉
                    </h3>
                    <p className="text-gray-600">
                      All {zcpcComponents.length} components have been generated and configured
                    </p>
                  </div>

                  {/* Generated Workspace Summary */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{generatedData.workspace?.name || 'New Workspace'}</h4>
                        <p className="text-sm text-gray-600">
                          Workspace ID: <span className="font-mono text-xs">{generatedData.workspace?.id?.substring(0, 8)}...</span>
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-4">
                      {generatedData.workspace?.description || projectDescription}
                    </p>

                    {/* Core Workspace Components Created */}
                    <div className="bg-white rounded-lg p-4 mb-4 border-2 border-blue-300 shadow-sm">
                      <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Workspace Creation Complete
                      </h5>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-700">Workspace ID</div>
                            <div className="text-gray-500 font-mono">{generatedData.workspace?.id?.substring(0, 12)}...</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-700">Project Container</div>
                            <div className="text-gray-500">{generatedData.stats?.projects || 0} Project(s)</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-700">Project Metadata</div>
                            <div className="text-gray-500">
                              {generatedData.backlog?.projects?.[0]?.metadata?.owner || 'Product Owner'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-700">Methodology</div>
                            <div className="text-gray-500 capitalize">{generatedData.methodology?.type || 'Scrum'}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-700">Estimation Model</div>
                            <div className="text-gray-500 capitalize">
                              {generatedData.methodology?.estimationModel?.replace('_', ' ') || 'Story Points'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-700">Sprint Cadence</div>
                            <div className="text-gray-500">{generatedData.methodology?.sprintCadence || 2} Weeks</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-gray-700">Risk Model</div>
                            <div className="text-gray-500">{generatedData.risk?.model?.toUpperCase() || '4-TIER'} Model</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hierarchy Stats */}
                    <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
                      <h5 className="text-xs font-bold text-gray-700 mb-3 uppercase">Projify AI Hierarchy Model</h5>
                      
                      {/* Visual Hierarchy Tree */}
                      <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                        <div className="space-y-1 font-mono text-xs text-gray-700">
                          <div className="font-bold text-blue-700">📦 Workspace</div>
                          {generatedData.stats?.programs > 0 && (
                            <>
                              <div className="pl-4 text-purple-600">└── 📋 Program (optional)</div>
                              <div className="pl-8 text-blue-600">└── 🎯 Project</div>
                              <div className="pl-12 text-indigo-600">└── 📑 Epic</div>
                              <div className="pl-16 text-cyan-600">└── 📝 Story</div>
                              <div className="pl-20 text-green-600">└── ✓ Subtask</div>
                            </>
                          )}
                          {generatedData.stats?.programs === 0 && (
                            <>
                              <div className="pl-4 text-blue-600">└── 🎯 Project</div>
                              <div className="pl-8 text-indigo-600">└── 📑 Epic</div>
                              <div className="pl-12 text-cyan-600">└── 📝 Story</div>
                              <div className="pl-16 text-green-600">└── ✓ Subtask</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Hierarchy Counts */}
                      <div className="space-y-2">
                        {generatedData.stats?.programs > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">└── Programs</span>
                              <Badge variant="outline" className="text-xs border-purple-300 text-purple-600 bg-purple-50">Optional</Badge>
                            </div>
                            <span className="font-bold text-purple-600">{generatedData.stats.programs}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{generatedData.stats?.programs > 0 ? '    ' : ''}└── Projects</span>
                            <Badge variant="outline" className="text-xs border-blue-300 text-blue-600 bg-blue-50">Mandatory</Badge>
                          </div>
                          <span className="font-bold text-blue-600">{generatedData.stats?.projects || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm pl-4 border-l-2 border-blue-200">
                          <span className="text-gray-600">└── Epics</span>
                          <span className="font-bold text-indigo-600">{generatedData.stats?.epics || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm pl-8 border-l-2 border-cyan-200 ml-4">
                          <span className="text-gray-600">└── Stories</span>
                          <span className="font-bold text-cyan-600">{generatedData.stats?.stories || 0}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm pl-12 border-l-2 border-green-200 ml-8">
                          <span className="text-gray-600">└── Subtasks</span>
                          <span className="font-bold text-green-600">{generatedData.stats?.subtasks || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Configuration */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">Industry</div>
                        <div className="font-bold text-blue-600 text-sm capitalize">
                          {generatedData.industry?.domain || 'Technology'}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">Team Size</div>
                        <div className="font-bold text-cyan-600 text-sm">
                          {generatedData.capacity?.teamSize || 5} Members
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">Velocity</div>
                        <div className="font-bold text-green-600 text-sm">
                          {generatedData.capacity?.velocity || 25} Points/Sprint
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Components Generated */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      All Components Generated
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {zcpcComponents.map((component, index) => (
                        <motion.div
                          key={component.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{component.label}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Create Another
                    </Button>
                    <Button
                      onClick={handleComplete}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Open Workspace
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}