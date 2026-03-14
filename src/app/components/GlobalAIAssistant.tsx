import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bot, X, Send, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { AICommandConfirmation, AICommandDetails } from './AICommandConfirmation';

interface GlobalAIAssistantProps {
  accessToken: string;
  workspaceId?: string;
  userId?: string;
}

export function GlobalAIAssistant({ accessToken, workspaceId, userId }: GlobalAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [history, setHistory] = useState<Array<{ command: string; result: string; success: boolean }>>([]);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [commandDetails, setCommandDetails] = useState<AICommandDetails | null>(null);

  useEffect(() => {
    checkAIStatus();
  }, [workspaceId]);

  const checkAIStatus = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/settings${workspaceId ? `?workspaceId=${workspaceId}` : ''}`,
        {
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const enabled = workspaceId ? data.workspaceAiEnabled : data.aiEnabled;
        setAiEnabled(enabled !== false);
      }
    } catch (error) {
      console.error('Error checking AI status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim() || !aiEnabled) return;

    setIsParsing(true);
    
    try {
      // Step 1: Parse the command
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/ai-commands/parse`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            command,
            workspaceId,
            userId,
            context: {
              timestamp: new Date().toISOString()
            }
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Show confirmation modal with details
        setCommandDetails(data.details);
        setConfirmationOpen(true);
      } else {
        toast.error(data.error || 'Failed to parse command');
        setHistory([{ command, result: data.error, success: false }, ...history]);
      }
    } catch (error) {
      console.error('AI command parsing error:', error);
      toast.error('Failed to parse command');
      setHistory([{ command, result: 'Error parsing command', success: false }, ...history]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmCommand = async () => {
    if (!commandDetails) return;

    setIsProcessing(true);
    
    try {
      // Step 2: Execute the confirmed command
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/ai-commands/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            parsedCommand: commandDetails,
            workspaceId,
            userId
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message || 'Command executed successfully');
        setHistory([{ command, result: data.message, success: true }, ...history]);
        setCommand('');
        setConfirmationOpen(false);
        setCommandDetails(null);
      } else {
        toast.error(data.error || 'Failed to execute command');
        setHistory([{ command, result: data.error, success: false }, ...history]);
      }
    } catch (error) {
      console.error('AI command execution error:', error);
      toast.error('Failed to execute command');
      setHistory([{ command, result: 'Error executing command', success: false }, ...history]);
    } finally {
      setIsProcessing(false);
    }
  };

  const exampleCommands = [
    'Create a high priority task for implementing user authentication',
    'Generate a 2-week sprint starting next Monday',
    'Assign all backend tasks to john@example.com',
    'Create a test workspace for the QA team',
    'Estimate story points for task #123',
    'Import data from Jira'
  ];

  return (
    <>
      {/* AI Command Confirmation Modal */}
      <AICommandConfirmation
        isOpen={confirmationOpen}
        onClose={() => {
          setConfirmationOpen(false);
          setCommandDetails(null);
        }}
        onConfirm={handleConfirmCommand}
        details={commandDetails}
        isProcessing={isProcessing}
      />

      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-40 ${
          aiEnabled 
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' 
            : 'bg-gray-400 hover:bg-gray-500'
        }`}
        title={aiEnabled ? 'AI Assistant' : 'AI Disabled'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
        {aiEnabled && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 z-40">
          <Card className="shadow-2xl border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                </div>
                <Badge 
                  variant={aiEnabled ? 'default' : 'secondary'}
                  className={aiEnabled ? 'bg-green-500' : 'bg-gray-500'}
                >
                  {aiEnabled ? 'Active' : 'Disabled'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              {!aiEnabled ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-900">
                      <p className="font-semibold mb-1">AI is disabled</p>
                      <p className="text-xs">Enable AI in Settings to use AI commands</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Command Input */}
                  <form onSubmit={handleSubmit} className="mb-4">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <input
                        type="text"
                        placeholder="Type an AI command..."
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        disabled={isProcessing || !aiEnabled}
                        className="flex-1 bg-transparent border-0 outline-none text-sm"
                      />
                      <button
                        type="submit"
                        disabled={isProcessing || !command.trim() || !aiEnabled}
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Example Commands */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Quick Examples:</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {exampleCommands.slice(0, 3).map((example, index) => (
                        <button
                          key={index}
                          onClick={() => setCommand(example)}
                          className="w-full text-left text-xs p-2 bg-gray-50 hover:bg-blue-50 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Command History */}
                  {history.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">Recent Commands:</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {history.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className={`p-2 rounded text-xs ${
                              item.success 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                            }`}
                          >
                            <div className="flex items-start gap-2 mb-1">
                              {item.success ? (
                                <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                              )}
                              <p className="font-medium text-gray-900 flex-1">{item.command}</p>
                            </div>
                            <p className={`text-xs ml-5 ${item.success ? 'text-green-700' : 'text-red-700'}`}>
                              {item.result}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}