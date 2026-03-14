import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Loader2, X, CheckCircle, AlertCircle, Settings, Link as LinkIcon, Unlink, Github, MessageSquare, FileText, Code, Database, Mail, Calendar, Video, Box, GitBranch, Layout, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { getSupabaseClient } from '../../../utils/supabase/client';

interface IntegrationsModalProps {
  workspaceId?: string;
  accessToken: string;
  onClose: () => void;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'dev' | 'communication' | 'design' | 'productivity';
  status: 'connected' | 'available' | 'coming_soon';
  config?: {
    apiKey?: string;
    webhookUrl?: string;
    syncEnabled?: boolean;
  };
}

export function IntegrationsModal({ workspaceId, accessToken, onClose }: IntegrationsModalProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [configForm, setConfigForm] = useState({
    apiKey: '',
    webhookUrl: '',
    syncEnabled: true
  });

  useEffect(() => {
    loadIntegrations();
  }, [workspaceId]);

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      // Get integrations from backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/integrations${workspaceId ? `?workspaceId=${workspaceId}` : ''}`,
        {
          method: 'GET',
          headers: {
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.integrations || getDefaultIntegrations());
      } else {
        setIntegrations(getDefaultIntegrations());
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
      setIntegrations(getDefaultIntegrations());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultIntegrations = (): Integration[] => [
    {
      id: 'jira',
      name: 'Jira',
      description: 'Import projects, issues, and workflows from Jira',
      icon: Box,
      category: 'dev',
      status: 'available'
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Sync PRs, issues, and commits with your stories',
      icon: Github,
      category: 'dev',
      status: 'available'
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      description: 'Connect merge requests and CI/CD pipelines',
      icon: GitBranch,
      category: 'dev',
      status: 'available'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get notifications and updates in your channels',
      icon: MessageSquare,
      category: 'communication',
      status: 'available'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Collaborate with your team in Teams',
      icon: Video,
      category: 'communication',
      status: 'available'
    },
    {
      id: 'confluence',
      name: 'Confluence',
      description: 'Link documentation to stories and epics',
      icon: FileText,
      category: 'productivity',
      status: 'available'
    },
    {
      id: 'figma',
      name: 'Figma',
      description: 'Attach design files to your user stories',
      icon: Palette,
      category: 'design',
      status: 'available'
    },
    {
      id: 'trello',
      name: 'Trello',
      description: 'Migrate boards and cards from Trello',
      icon: Layout,
      category: 'productivity',
      status: 'available'
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Sync tasks and documentation with Notion',
      icon: FileText,
      category: 'productivity',
      status: 'coming_soon'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync sprint dates and milestones',
      icon: Calendar,
      category: 'productivity',
      status: 'coming_soon'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 5000+ apps via Zapier',
      icon: Code,
      category: 'productivity',
      status: 'coming_soon'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Link customer requests to development stories',
      icon: Database,
      category: 'productivity',
      status: 'coming_soon'
    }
  ];

  const handleConnect = (integration: Integration) => {
    if (integration.status === 'coming_soon') {
      toast.info(`${integration.name} integration coming soon!`);
      return;
    }
    
    setSelectedIntegration(integration);
    setConfigForm({
      apiKey: integration.config?.apiKey || '',
      webhookUrl: integration.config?.webhookUrl || '',
      syncEnabled: integration.config?.syncEnabled ?? true
    });
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!workspaceId) {
      toast.error('Workspace is required to disconnect integration');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/integrations/${integrationId}/disconnect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ workspaceId })
        }
      );

      if (!response.ok) {
        toast.error('Failed to disconnect integration');
        return;
      }

      toast.success('Integration disconnected successfully');
      await loadIntegrations();
    } catch (error) {
      console.error('Error disconnecting integration:', error);
      toast.error('Failed to disconnect integration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration || !workspaceId) {
      toast.error('Integration and workspace are required');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const validToken = session?.access_token || accessToken;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/integrations/${selectedIntegration.id}/connect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': validToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            workspaceId,
            config: configForm
          })
        }
      );

      if (!response.ok) {
        toast.error('Failed to connect integration');
        return;
      }

      toast.success(`${selectedIntegration.name} connected successfully`);
      setSelectedIntegration(null);
      await loadIntegrations();
    } catch (error) {
      console.error('Error connecting integration:', error);
      toast.error('Failed to connect integration');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dev': return '💻';
      case 'communication': return '💬';
      case 'design': return '🎨';
      case 'productivity': return '⚡';
      default: return '🔌';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                Integrations
              </CardTitle>
              <CardDescription>Connect your favorite tools and services</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : selectedIntegration ? (
            <div className="space-y-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedIntegration(null)}>
                ← Back to Integrations
              </Button>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {selectedIntegration.icon && <selectedIntegration.icon className="w-8 h-8 text-blue-600" />}
                    <div>
                      <CardTitle className="text-lg">{selectedIntegration.name}</CardTitle>
                      <CardDescription>{selectedIntegration.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key / Access Token</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your API key..."
                      value={configForm.apiKey}
                      onChange={(e) => setConfigForm({ ...configForm, apiKey: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      Get your API key from {selectedIntegration.name} settings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                    <Input
                      id="webhookUrl"
                      type="url"
                      placeholder="https://..."
                      value={configForm.webhookUrl}
                      onChange={(e) => setConfigForm({ ...configForm, webhookUrl: e.target.value })}
                    />
                    <p className="text-xs text-gray-500">
                      Configure webhook to receive real-time updates
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="syncEnabled"
                      checked={configForm.syncEnabled}
                      onChange={(e) => setConfigForm({ ...configForm, syncEnabled: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="syncEnabled" className="cursor-pointer">
                      Enable automatic synchronization
                    </Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveIntegration} disabled={isSaving} className="flex-1">
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Connect Integration
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedIntegration(null)} disabled={isSaving}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Filter tabs */}
              <div className="flex gap-2 border-b pb-2">
                <button className="px-3 py-1 text-sm font-medium text-blue-600 border-b-2 border-blue-600">
                  All
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Connected
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Available
                </button>
              </div>

              {/* Import Data Feature Card */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to right, rgba(252, 163, 17, 0.12), rgba(252, 163, 17, 0.18))' }}>
                        <Database className="w-6 h-6" style={{ color: '#FCA311' }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg" style={{ color: '#000000' }}>Import Your Data</CardTitle>
                        <CardDescription style={{ color: '#404040' }}>
                          Migrate from Jira, Asana, Trello, and more without data loss
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4" style={{ color: '#404040' }}>
                    Seamlessly import all your projects, tasks, team members, comments, attachments, and relationships from popular project management tools.
                  </p>
                  <Button 
                    onClick={() => {
                      onClose();
                      // Trigger import modal - this would be passed from parent
                      setTimeout(() => {
                        const importBtn = document.querySelector('[data-import-trigger]') as HTMLButtonElement;
                        importBtn?.click();
                      }, 100);
                    }}
                    className="w-full text-white"
                    style={{ background: 'linear-gradient(135deg, #14213D, #1a2d52)' }}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Start Import
                  </Button>
                </CardContent>
              </Card>

              {/* Integrations grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {integration.icon && <integration.icon className="w-6 h-6 text-blue-600" />}
                          <div>
                            <h3 className="font-semibold text-sm">{integration.name}</h3>
                            <p className="text-xs text-gray-500">{getCategoryIcon(integration.category)} {integration.category}</p>
                          </div>
                        </div>
                        {integration.status === 'connected' && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                        {integration.status === 'coming_soon' && (
                          <Badge variant="secondary" className="text-xs">
                            Soon
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                        {integration.description}
                      </p>

                      <div className="flex gap-2">
                        {integration.status === 'connected' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConnect(integration)}
                              className="flex-1"
                            >
                              <Settings className="w-3 h-3 mr-1" />
                              Configure
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDisconnect(integration.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Unlink className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnect(integration)}
                            className="w-full"
                            variant={integration.status === 'coming_soon' ? 'outline' : 'default'}
                            disabled={integration.status === 'coming_soon'}
                          >
                            {integration.status === 'coming_soon' ? (
                              'Coming Soon'
                            ) : (
                              <>
                                <LinkIcon className="w-3 h-3 mr-1" />
                                Connect
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
