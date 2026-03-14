import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  X, Upload, FileJson, FileSpreadsheet, Download, CheckCircle2, 
  AlertCircle, Loader2, Settings, Database, Cloud, File,
  ChevronRight, Info, Users, Tag, Calendar, Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface ImportDataModalProps {
  accessToken: string;
  workspaceId?: string;
  onClose: () => void;
  onImportComplete?: () => void;
}

type ImportSource = 'jira' | 'asana' | 'trello' | 'monday' | 'clickup' | 'linear' | 'csv' | 'json';

interface ImportConfig {
  source: ImportSource;
  method: 'api' | 'file';
  apiKey?: string;
  apiUrl?: string;
  domain?: string;
  file?: File;
  mapping?: FieldMapping;
}

interface FieldMapping {
  [key: string]: string;
}

const IMPORT_SOURCES = [
  { 
    id: 'jira' as ImportSource, 
    name: 'Jira', 
    icon: '🔷',
    description: 'Import from Atlassian Jira',
    method: 'api',
    fields: ['API Token', 'Domain', 'Email']
  },
  { 
    id: 'asana' as ImportSource, 
    name: 'Asana', 
    icon: '🔸',
    description: 'Import from Asana',
    method: 'api',
    fields: ['Personal Access Token']
  },
  { 
    id: 'trello' as ImportSource, 
    name: 'Trello', 
    icon: '📋',
    description: 'Import from Trello boards',
    method: 'api',
    fields: ['API Key', 'API Token']
  },
  { 
    id: 'monday' as ImportSource, 
    name: 'Monday.com', 
    icon: '🎯',
    description: 'Import from Monday.com',
    method: 'api',
    fields: ['API Token']
  },
  { 
    id: 'clickup' as ImportSource, 
    name: 'ClickUp', 
    icon: '⚡',
    description: 'Import from ClickUp',
    method: 'api',
    fields: ['API Token']
  },
  { 
    id: 'linear' as ImportSource, 
    name: 'Linear', 
    icon: '📐',
    description: 'Import from Linear',
    method: 'api',
    fields: ['API Key']
  },
  { 
    id: 'csv' as ImportSource, 
    name: 'CSV File', 
    icon: '📊',
    description: 'Import from CSV file',
    method: 'file',
    fields: []
  },
  { 
    id: 'json' as ImportSource, 
    name: 'JSON File', 
    icon: '📄',
    description: 'Import from JSON file',
    method: 'file',
    fields: []
  },
];

const DEFAULT_FIELD_MAPPING = {
  // Source field -> Our field
  summary: 'summary',
  title: 'summary',
  name: 'summary',
  description: 'description',
  body: 'description',
  content: 'description',
  status: 'status',
  state: 'status',
  priority: 'priority',
  importance: 'priority',
  assignee: 'assignee',
  assigned_to: 'assignee',
  owner: 'assignee',
  reporter: 'reporter',
  creator: 'reporter',
  created_by: 'reporter',
  due_date: 'dueDate',
  dueDate: 'dueDate',
  deadline: 'dueDate',
  start_date: 'startDate',
  startDate: 'startDate',
  labels: 'tags',
  tags: 'tags',
  story_points: 'storyPoints',
  storyPoints: 'storyPoints',
  points: 'storyPoints',
  estimate: 'storyPoints',
  sprint: 'sprint',
  iteration: 'sprint',
  parent: 'parentTicket',
  parent_issue: 'parentTicket',
  epic: 'parentTicket',
  comments: 'comments',
  attachments: 'attachments',
  watchers: 'watchers',
  subtasks: 'subtasks',
  dependencies: 'dependencies',
  linked_issues: 'dependencies',
};

export function ImportDataModal({ accessToken, workspaceId, onClose, onImportComplete }: ImportDataModalProps) {
  const [step, setStep] = useState<'source' | 'config' | 'mapping' | 'preview' | 'importing'>('source');
  const [selectedSource, setSelectedSource] = useState<ImportSource | null>(null);
  const [config, setConfig] = useState<ImportConfig>({
    source: 'jira',
    method: 'api',
    mapping: DEFAULT_FIELD_MAPPING,
  });
  const [credentials, setCredentials] = useState<{ [key: string]: string }>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState({ total: 0, success: 0, failed: 0 });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleSourceSelect = (source: ImportSource) => {
    const sourceConfig = IMPORT_SOURCES.find(s => s.id === source);
    setSelectedSource(source);
    setConfig({
      source,
      method: sourceConfig?.method as 'api' | 'file',
      mapping: DEFAULT_FIELD_MAPPING,
    });
    setStep('config');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Parse file to get preview
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          let data: any[] = [];

          if (file.name.endsWith('.json')) {
            data = JSON.parse(text);
          } else if (file.name.endsWith('.csv')) {
            // Simple CSV parsing
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            data = lines.slice(1).filter(line => line.trim()).map(line => {
              const values = line.split(',').map(v => v.trim());
              const obj: any = {};
              headers.forEach((header, index) => {
                obj[header] = values[index];
              });
              return obj;
            });
          }

          setPreviewData(data.slice(0, 5)); // Preview first 5 items
          toast.success(`Loaded ${data.length} items from file`);
        } catch (error) {
          console.error('Error parsing file:', error);
          toast.error('Failed to parse file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleTestConnection = async () => {
    toast.info('Testing connection...');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/import/test-connection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            source: selectedSource,
            credentials
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success(`Connected successfully! Found ${result.itemCount || 0} items.`);
        setPreviewData(result.preview || []);
        setStep('preview');
      } else {
        const error = await response.json();
        toast.error(`Connection failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error('Failed to test connection');
    }
  };

  const handleStartImport = async () => {
    setStep('importing');
    setImportProgress(0);
    setImportStats({ total: 0, success: 0, failed: 0 });

    try {
      const formData = new FormData();
      formData.append('source', selectedSource || 'jira');
      formData.append('workspaceId', workspaceId || 'default');
      formData.append('credentials', JSON.stringify(credentials));
      formData.append('mapping', JSON.stringify(config.mapping));
      
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/import/start`,
        {
          method: 'POST',
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: formData
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        // Simulate progress for demo (replace with actual progress tracking)
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setImportProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setImportStats({
              total: result.total || previewData.length,
              success: result.success || previewData.length,
              failed: result.failed || 0
            });
            toast.success('Import completed successfully!');
            setTimeout(() => {
              onImportComplete?.();
              onClose();
            }, 2000);
          }
        }, 500);
      } else {
        const error = await response.json();
        toast.error(`Import failed: ${error.message || 'Unknown error'}`);
        setStep('preview');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data');
      setStep('preview');
    }
  };

  const renderSourceSelection = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Import Source</h3>
        <p className="text-sm text-gray-600">Choose where you want to import your data from</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {IMPORT_SOURCES.map((source) => (
          <Card
            key={source.id}
            className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
            onClick={() => handleSourceSelect(source.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="text-3xl">{source.icon}</div>
                <Badge variant="secondary" className="text-xs">
                  {source.method === 'api' ? 'API' : 'File'}
                </Badge>
              </div>
              <CardTitle className="text-base mt-2">{source.name}</CardTitle>
              <CardDescription className="text-xs">{source.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">What gets imported?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>All tasks/issues with full details</li>
              <li>Status, priority, and custom fields</li>
              <li>Assignees, reporters, and team members</li>
              <li>Comments, attachments, and history</li>
              <li>Relationships (parent-child, dependencies)</li>
              <li>Sprints, epics, and project structure</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            // Download sample CSV template
            const csv = 'summary,description,status,priority,assignee,dueDate,storyPoints,tags\n"Sample Task","Task description","To Do","High","john@example.com","2026-03-15",5,"backend,api"\n"Another Task","Description here","In Progress","Medium","jane@example.com","2026-03-20",3,"frontend"';
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'import-template.csv';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Downloaded import template');
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Download CSV Template
        </Button>
      </div>
    </div>
  );

  const renderConfiguration = () => {
    const sourceConfig = IMPORT_SOURCES.find(s => s.id === selectedSource);

    if (config.method === 'file') {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload {sourceConfig?.name} File</h3>
            <p className="text-sm text-gray-600">Select a file to import from your computer</p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.json"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                CSV or JSON files accepted
              </p>
            </label>
          </div>

          {uploadedFile && previewData.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({previewData.length} items shown)</Label>
              <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-auto">
                <pre className="text-xs">{JSON.stringify(previewData, null, 2)}</pre>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setStep('source')} variant="outline">
              Back
            </Button>
            <Button 
              onClick={() => setStep('preview')} 
              disabled={!uploadedFile}
              className="flex-1"
            >
              Continue to Preview
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Configure {sourceConfig?.name} Connection</h3>
          <p className="text-sm text-gray-600">Enter your API credentials to connect</p>
        </div>

        {selectedSource === 'jira' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="domain">Jira Domain</Label>
              <Input
                id="domain"
                placeholder="yourcompany.atlassian.net"
                value={credentials.domain || ''}
                onChange={(e) => setCredentials({ ...credentials, domain: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@company.com"
                value={credentials.email || ''}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Your Jira API token"
                value={credentials.apiToken || ''}
                onChange={(e) => setCredentials({ ...credentials, apiToken: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Generate at: <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" className="text-blue-600 hover:underline">Atlassian API Tokens</a>
              </p>
            </div>
          </>
        )}

        {selectedSource === 'asana' && (
          <div className="space-y-2">
            <Label htmlFor="apiToken">Personal Access Token</Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="Your Asana PAT"
              value={credentials.apiToken || ''}
              onChange={(e) => setCredentials({ ...credentials, apiToken: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Generate at: <a href="https://app.asana.com/0/developer-console" target="_blank" className="text-blue-600 hover:underline">Asana Developer Console</a>
            </p>
          </div>
        )}

        {selectedSource === 'trello' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                placeholder="Your Trello API key"
                value={credentials.apiKey || ''}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Your Trello token"
                value={credentials.apiToken || ''}
                onChange={(e) => setCredentials({ ...credentials, apiToken: e.target.value })}
              />
              <p className="text-xs text-gray-500">
                Get credentials at: <a href="https://trello.com/app-key" target="_blank" className="text-blue-600 hover:underline">Trello API Key</a>
              </p>
            </div>
          </>
        )}

        {(selectedSource === 'monday' || selectedSource === 'clickup' || selectedSource === 'linear') && (
          <div className="space-y-2">
            <Label htmlFor="apiToken">API Token</Label>
            <Input
              id="apiToken"
              type="password"
              placeholder={`Your ${sourceConfig?.name} API token`}
              value={credentials.apiToken || ''}
              onChange={(e) => setCredentials({ ...credentials, apiToken: e.target.value })}
            />
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-900">
              Your credentials are only used for this import and are not stored permanently.
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={() => setStep('source')} variant="outline">
            Back
          </Button>
          <Button 
            onClick={handleTestConnection} 
            disabled={!credentials.apiToken && !credentials.apiKey}
            className="flex-1"
          >
            Test Connection & Preview
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderPreview = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Preview Import Data</h3>
        <p className="text-sm text-gray-600">Review the data before importing</p>
      </div>

      {previewData.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Items</CardDescription>
                <CardTitle className="text-2xl">{previewData.length}+</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Fields Mapped</CardDescription>
                <CardTitle className="text-2xl">{Object.keys(config.mapping || {}).length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Status</CardDescription>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  Ready
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h4 className="font-semibold text-sm">Sample Data (First 3 Items)</h4>
            </div>
            <div className="divide-y max-h-80 overflow-auto">
              {previewData.slice(0, 3).map((item, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <p className="text-gray-900">{item.summary || item.title || item.name || 'Untitled'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <Badge variant="secondary" className="ml-2">{item.status || item.state || 'N/A'}</Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Priority:</span>
                      <Badge variant="secondary" className="ml-2">{item.priority || 'Medium'}</Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Assignee:</span>
                      <span className="ml-2 text-gray-900">{item.assignee || item.assigned_to || 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="text-sm text-green-900">
                <p className="font-semibold mb-1">Import includes:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3" /> All task fields
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> Team members
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Labels & tags
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Dates & sprints
                  </div>
                  <div className="flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> Relationships
                  </div>
                  <div className="flex items-center gap-1">
                    <File className="w-3 h-3" /> Attachments
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Database className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600">No preview data available</p>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button onClick={() => setStep('config')} variant="outline">
          Back
        </Button>
        <Button 
          onClick={handleStartImport} 
          disabled={previewData.length === 0}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Start Import
        </Button>
      </div>
    </div>
  );

  const renderImporting = () => (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <Loader2 className="w-16 h-16 mx-auto text-blue-600 animate-spin mb-4" />
        <h3 className="text-xl font-semibold mb-2">Importing Data...</h3>
        <p className="text-sm text-gray-600">Please don't close this window</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold">{importProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${importProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{importStats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Imported</CardDescription>
            <CardTitle className="text-2xl text-green-600">{importStats.success}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">{importStats.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {importProgress === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
          <p className="font-semibold text-green-900">Import Completed Successfully!</p>
          <p className="text-sm text-green-700 mt-1">Redirecting to workspace...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Import Data</CardTitle>
              <CardDescription>
                Migrate your projects from other tools without losing any data
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[
              { key: 'source', label: 'Source' },
              { key: 'config', label: 'Configure' },
              { key: 'preview', label: 'Preview' },
              { key: 'importing', label: 'Import' }
            ].map((s, index) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 flex-1 ${
                  step === s.key ? 'text-blue-600' : 
                  ['config', 'preview', 'importing'].indexOf(step) > ['config', 'preview', 'importing'].indexOf(s.key) 
                    ? 'text-green-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === s.key ? 'bg-blue-100 text-blue-600' :
                    ['config', 'preview', 'importing'].indexOf(step) > ['config', 'preview', 'importing'].indexOf(s.key)
                      ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s.label}</span>
                </div>
                {index < 3 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {step === 'source' && renderSourceSelection()}
          {step === 'config' && renderConfiguration()}
          {step === 'preview' && renderPreview()}
          {step === 'importing' && renderImporting()}
        </CardContent>
      </Card>
    </div>
  );
}
