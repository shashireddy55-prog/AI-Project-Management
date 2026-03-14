import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, X, CheckCircle, AlertTriangle, TrendingUp, ListTodo, Workflow, BarChart3, Target } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getSupabaseClient } from '../../../utils/supabase/client';

interface AICommandModalProps {
  workspaceId?: string;
  accessToken: string;
  onClose: () => void;
  onWorkspaceCreated?: (workspace: any) => void;
  onWorkBreakdownGenerated?: () => void;
}

type CommandType = 'create_workspace' | 'generate_breakdown' | 'sprint_health' | 'risk_analysis' | 'optimization';

interface GeneratedEpic {
  title: string;
  description: string;
  stories: GeneratedStory[];
}

interface GeneratedStory {
  title: string;
  description: string;
  acceptance_criteria: string[];
  tasks: string[];
  dependencies: string[];
  risks: string[];
  storyPoints?: number;
  priority?: string;
}

interface AIResult {
  type: string;
  data: any;
  confidence?: number;
  recommendations?: string[];
}

export function AICommandModal({ workspaceId, accessToken, onClose, onWorkspaceCreated, onWorkBreakdownGenerated }: AICommandModalProps) {
  const [commandType, setCommandType] = useState<CommandType | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [generatedEpics, setGeneratedEpics] = useState<GeneratedEpic[]>([]);

  const handleSelectCommand = (type: CommandType) => {
    setCommandType(type);
    setResult(null);
    setGeneratedEpics([]);
    
    // Set example prompts
    switch (type) {
      case 'create_workspace':
        setPrompt('Build a HIPAA-compliant healthcare web app with 10 engineers in 4 months');
        break;
      case 'generate_breakdown':
        setPrompt('Build a user authentication system with email, social login, 2FA, and password reset');
        break;
      case 'sprint_health':
        setPrompt('Analyze current sprint health and provide recommendations');
        break;
      case 'risk_analysis':
        setPrompt('Identify delivery risks and suggest mitigation strategies');
        break;
      case 'optimization':
        setPrompt('Suggest workflow and process optimizations');
        break;
    }
  };

  const handleExecuteCommand = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a command');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      let endpoint = '';
      let body: any = { prompt };

      switch (commandType) {
        case 'create_workspace':
          endpoint = '/ai/create-workspace';
          break;
        case 'generate_breakdown':
          endpoint = '/ai/work-breakdown';
          body.workspaceId = workspaceId;
          break;
        case 'sprint_health':
          endpoint = '/ai/sprint-health';
          body.workspaceId = workspaceId;
          break;
        case 'risk_analysis':
          endpoint = '/ai/risk-analysis';
          body.workspaceId = workspaceId;
          break;
        case 'optimization':
          endpoint = '/ai/optimization';
          body.workspaceId = workspaceId;
          break;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`AI command failed: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      setResult(data);

      if (commandType === 'create_workspace' && data.workspace) {
        toast.success(`Workspace "${data.workspace.name}" created with ${data.epicCount} epics and ${data.storyCount} stories!`);
        // Call the callback to navigate to the new workspace
        if (onWorkspaceCreated) {
          onWorkspaceCreated(data.workspace);
        }
        onClose();
        return;
      }

      if (commandType === 'generate_breakdown' && data.epics) {
        setGeneratedEpics(data.epics);
      }

      toast.success('AI command completed successfully');
    } catch (error) {
      console.error('Error executing AI command:', error);
      toast.error('Failed to execute AI command');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveBreakdown = async () => {
    if (!generatedEpics.length || !workspaceId) return;

    setIsProcessing(true);

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/ai/work-breakdown/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            workspaceId,
            epics: generatedEpics
          })
        }
      );

      if (!response.ok) {
        toast.error('Failed to approve work breakdown');
        return;
      }

      toast.success('Work breakdown approved and created successfully');
      onWorkBreakdownGenerated?.();
      onClose();
    } catch (error) {
      console.error('Error approving breakdown:', error);
      toast.error('Failed to approve work breakdown');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveWorkspace = async () => {
    if (!result?.workspace) return;

    try {
      onWorkspaceCreated?.(result.workspace);
      toast.success('Workspace created successfully');
      onClose();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI Command Center
              </CardTitle>
              <CardDescription>Execute AI-powered project management actions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!commandType ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 mb-3">Select AI Action</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectCommand('create_workspace')}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-all text-left group"
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FCA311'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                >
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm group-hover:text-blue-600">Create Workspace</h4>
                      <p className="text-xs text-gray-600 mt-1">Zero-config workspace from description</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectCommand('generate_breakdown')}
                  disabled={!workspaceId}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  onMouseEnter={(e) => !workspaceId ? null : e.currentTarget.style.borderColor = '#FCA311'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                >
                  <div className="flex items-start gap-3">
                    <ListTodo className="w-5 h-5 mt-0.5" style={{ color: '#FCA311' }} />
                    <div>
                      <h4 className="font-semibold text-sm" style={{ color: '#000000' }}>Generate Work Breakdown</h4>
                      <p className="text-xs text-gray-600 mt-1">Create epics, stories, and tasks from text</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectCommand('sprint_health')}
                  disabled={!workspaceId}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  onMouseEnter={(e) => !workspaceId ? null : e.currentTarget.style.borderColor = '#FCA311'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
                >
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 mt-0.5" style={{ color: '#FCA311' }} />
                    <div>
                      <h4 className="font-semibold text-sm" style={{ color: '#000000' }}>Sprint Health Analysis</h4>
                      <p className="text-xs text-gray-600 mt-1">AI Scrum Master sprint insights</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectCommand('risk_analysis')}
                  disabled={!workspaceId}
                  className="p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm group-hover:text-blue-600">Risk Analysis</h4>
                      <p className="text-xs text-gray-600 mt-1">Projify AI delivery forecast</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectCommand('optimization')}
                  disabled={!workspaceId}
                  className="p-4 border rounded-lg hover:bg-gray-50 hover:border-blue-500 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed md:col-span-2"
                >
                  <div className="flex items-start gap-3">
                    <Workflow className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm group-hover:text-blue-600">Process Optimization</h4>
                      <p className="text-xs text-gray-600 mt-1">Living workflow engine suggestions</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button variant="outline" size="sm" onClick={() => setCommandType(null)}>
                ← Back to Commands
              </Button>

              <div className="space-y-2">
                <Label htmlFor="aiPrompt">Command Prompt</Label>
                <textarea
                  id="aiPrompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to achieve..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                  disabled={isProcessing}
                />
              </div>

              <Button onClick={handleExecuteCommand} disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Execute AI Command
                  </>
                )}
              </Button>

              {/* Results Display */}
              {result && (
                <div className="mt-6 space-y-4">
                  {commandType === 'generate_breakdown' && generatedEpics.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Generated Work Breakdown</h3>
                        <Badge variant="secondary">{generatedEpics.length} Epics</Badge>
                      </div>

                      {generatedEpics.map((epic, epicIdx) => (
                        <Card key={epicIdx}>
                          <CardHeader>
                            <CardTitle className="text-base">{epic.title}</CardTitle>
                            <CardDescription>{epic.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">Stories</h4>
                                <Badge variant="outline">{epic.stories.length}</Badge>
                              </div>
                              {epic.stories.map((story, storyIdx) => (
                                <div key={storyIdx} className="border rounded-lg p-3">
                                  <h5 className="font-medium text-sm">{story.title}</h5>
                                  <p className="text-xs text-gray-600 mt-1">{story.description}</p>
                                  {story.storyPoints && (
                                    <Badge variant="secondary" className="mt-2 text-xs">
                                      {story.storyPoints} points
                                    </Badge>
                                  )}
                                  {story.tasks.length > 0 && (
                                    <div className="mt-2 text-xs text-gray-500">
                                      {story.tasks.length} tasks
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleApproveBreakdown} disabled={isProcessing} className="flex-1">
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Create
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => setResult(null)}>
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  )}

                  {commandType === 'create_workspace' && result.workspace && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Workspace Configuration</h3>
                      <div className="border rounded-lg p-4 space-y-2">
                        <div>
                          <span className="font-semibold text-sm">Name:</span> {result.workspace.name}
                        </div>
                        <div>
                          <span className="font-semibold text-sm">Methodology:</span> {result.workspace.methodology || 'Scrum'}
                        </div>
                        <div>
                          <span className="font-semibold text-sm">Team Size:</span> {result.workspace.teamSize || 'Not specified'}
                        </div>
                      </div>
                      <Button onClick={handleApproveWorkspace} className="w-full">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Create Workspace
                      </Button>
                    </div>
                  )}

                  {(commandType === 'sprint_health' || commandType === 'risk_analysis' || commandType === 'optimization') && (
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4 space-y-3">
                        {result.confidence && (
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">Confidence:</span>
                            <Badge variant={result.confidence > 70 ? 'default' : 'secondary'}>
                              {result.confidence}%
                            </Badge>
                          </div>
                        )}
                        
                        {result.recommendations && result.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                              {result.recommendations.map((rec: string, idx: number) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.analysis && (
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">{result.analysis}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}