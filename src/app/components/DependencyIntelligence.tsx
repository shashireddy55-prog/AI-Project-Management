import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  AlertTriangle, 
  Network,
  AlertCircle,
  Clock,
  XCircle,
  Zap,
  RefreshCw,
  Sparkles,
  GitBranch,
  Link2,
  ShieldAlert,
  TrendingUp,
  Activity,
  Target
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface DependencyChain {
  storyId: string;
  storyTitle: string;
  chainDepth: number;
  dependencies: string[];
  isBlocked: boolean;
  blockedBy: string[];
}

interface DependencyRisk {
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  description: string;
  impact: string;
  affectedItems: string[];
  delayEstimate?: number;
}

interface DependencyAlert {
  id: string;
  type: 'delay' | 'blocking' | 'conflict' | 'risk';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedStories: string[];
  suggestedAction: string;
}

interface DependencyGraph {
  nodes: Array<{
    id: string;
    label: string;
    status: string;
    type: 'story' | 'epic' | 'project';
    riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  }>;
  edges: Array<{
    from: string;
    to: string;
    type: 'depends_on' | 'blocks';
    status: 'active' | 'delayed' | 'resolved';
  }>;
}

interface DependencyData {
  projectId: string;
  projectName: string;
  summary: {
    totalDependencies: number;
    blockedStories: number;
    delayedDependencies: number;
    criticalChains: number;
    riskScore: number;
  };
  dependencyChains: DependencyChain[];
  blockedWork: any[];
  delays: DependencyAlert[];
  conflicts: DependencyAlert[];
  impact: {
    totalStoriesAtRisk: number;
    estimatedDelayDays: number;
    criticalPathAffected: boolean;
    milestoneImpact: string[];
  };
  dependencyGraph: DependencyGraph;
  alerts: DependencyAlert[];
  risks: DependencyRisk[];
  recommendations: Array<{ action: string; impact: string; effort: string }>;
}

interface DependencyIntelligenceProps {
  workspaceId: string;
  userId: string;
  accessToken: string;
}

// Wrapper component to filter Figma props from icons
const IconWrapper = ({ 
  component: Icon, 
  ...props 
}: { 
  component: React.ComponentType<any>;
  [key: string]: any;
}) => {
  const { 
    'data-node-id': _nodeId,
    'data-figma-id': _figmaId,
    ...validProps 
  } = props;
  return <Icon {...validProps} />;
};

export function DependencyIntelligence({ 
  workspaceId, 
  userId, 
  accessToken 
}: DependencyIntelligenceProps) {
  const [dependencyData, setDependencyData] = useState<DependencyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const fetchDependencyAnalysis = async () => {
    if (!accessToken) {
      console.warn('Cannot fetch dependency analysis: No access token available');
      return;
    }

    setLoading(true);
    try {
      console.log('[Dependency Intelligence] Fetching analysis with:');
      console.log('[Dependency Intelligence] Access Token Length:', accessToken.length);
      console.log('[Dependency Intelligence] Token Preview:', accessToken.substring(0, 30) + '...');
      console.log('[Dependency Intelligence] Public Anon Key:', publicAnonKey.substring(0, 30) + '...');
      console.log('[Dependency Intelligence] Workspace ID:', workspaceId);
      console.log('[Dependency Intelligence] User ID:', userId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/dependency-intelligence/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ workspaceId, userId })
        }
      );

      console.log('[Dependency Intelligence] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[Dependency Intelligence] Success! Received data:', data.dependencyData?.length || 0);
        setDependencyData(data.dependencyData || []);
        if (data.dependencyData?.length > 0 && !selectedProject) {
          setSelectedProject(data.dependencyData[0].projectId);
        }
      } else {
        const errorText = await response.text();
        console.error('[Dependency Intelligence] Failed to fetch analysis:', errorText);
        console.error('[Dependency Intelligence] Response status:', response.status);
        
        toast.error('Failed to load dependency analysis', {
          description: 'Authentication failed. Please try logging in again.'
        });
      }
    } catch (error) {
      console.error('Error fetching dependency analysis:', error);
      toast.error('Error loading dependency analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && workspaceId) {
      fetchDependencyAnalysis();
    }
  }, [workspaceId, accessToken]);

  const selectedData = dependencyData.find(d => d.projectId === selectedProject);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'delay': return Clock;
      case 'blocking': return XCircle;
      case 'conflict': return AlertTriangle;
      case 'risk': return ShieldAlert;
      default: return AlertCircle;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>
            Dependency Intelligence
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered dependency monitoring and risk detection
          </p>
        </div>
        <Button
          onClick={fetchDependencyAnalysis}
          disabled={loading}
          style={{ backgroundColor: '#14213D', color: '#FFFFFF' }}
          className="flex items-center gap-2"
        >
          <IconWrapper component={RefreshCw} className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </Button>
      </div>

      {/* Project Tabs */}
      {dependencyData.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dependencyData.map((data) => (
            <button
              key={data.projectId}
              onClick={() => setSelectedProject(data.projectId)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedProject === data.projectId
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={
                selectedProject === data.projectId
                  ? { backgroundColor: '#14213D' }
                  : undefined
              }
            >
              {data.projectName}
            </button>
          ))}
        </div>
      )}

      {!loading && dependencyData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconWrapper component={Sparkles} className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No dependency data available yet</p>
            <p className="text-sm text-gray-500">Add projects with dependencies to get AI insights</p>
          </CardContent>
        </Card>
      )}

      {selectedData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Dependencies</p>
                      <p className="text-2xl font-bold" style={{ color: '#000000' }}>
                        {selectedData.summary.totalDependencies}
                      </p>
                    </div>
                    <IconWrapper component={Link2} className="w-8 h-8" style={{ color: '#FCA311' }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Blocked</p>
                      <p className="text-2xl font-bold text-red-600">
                        {selectedData.summary.blockedStories}
                      </p>
                    </div>
                    <IconWrapper component={XCircle} className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Delays</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {selectedData.summary.delayedDependencies}
                      </p>
                    </div>
                    <IconWrapper component={Clock} className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Risk Score</p>
                      <p className={`text-2xl font-bold ${getRiskScoreColor(selectedData.summary.riskScore)}`}>
                        {selectedData.summary.riskScore}
                      </p>
                    </div>
                    <IconWrapper component={Activity} className={`w-8 h-8 ${getRiskScoreColor(selectedData.summary.riskScore)}`} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Impact Summary */}
            {selectedData.impact.totalStoriesAtRisk > 0 && (
              <Card className="border-2 border-red-200 bg-red-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900">
                    <IconWrapper component={AlertTriangle} className="w-6 h-6" />
                    Impact Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Stories at Risk</p>
                      <p className="text-3xl font-bold text-red-600">
                        {selectedData.impact.totalStoriesAtRisk}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estimated Delay</p>
                      <p className="text-3xl font-bold text-orange-600">
                        {selectedData.impact.estimatedDelayDays} days
                      </p>
                    </div>
                  </div>
                  
                  {selectedData.impact.criticalPathAffected && (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                      <p className="text-sm font-bold text-red-900">⚠️ Critical Path Affected</p>
                      <p className="text-xs text-red-700 mt-1">
                        Complex dependency chains are blocked, requiring immediate attention
                      </p>
                    </div>
                  )}

                  {selectedData.impact.milestoneImpact.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-700">MILESTONE IMPACT</p>
                      {selectedData.impact.milestoneImpact.map((impact, idx) => (
                        <p key={idx} className="text-sm text-gray-700">• {impact}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconWrapper component={ShieldAlert} className="w-5 h-5 text-red-600" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedData.alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <IconWrapper component={Sparkles} className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No active alerts</p>
                    <p className="text-xs text-gray-500">All dependencies are healthy</p>
                  </div>
                ) : (
                  selectedData.alerts.slice(0, 5).map((alert) => {
                    const AlertIcon = getAlertIcon(alert.type);
                    return (
                      <div
                        key={alert.id}
                        className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-start gap-3">
                          <IconWrapper component={AlertIcon} className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">{alert.title}</span>
                              <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                                {alert.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{alert.description}</p>
                            <div className="bg-white/30 rounded p-2 mt-2">
                              <p className="text-xs font-medium">Suggested Action:</p>
                              <p className="text-xs mt-1">{alert.suggestedAction}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconWrapper component={AlertCircle} className="w-5 h-5 text-orange-600" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedData.risks.map((risk, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${getSeverityColor(risk.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{risk.type}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                          {risk.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm mb-2">• {risk.description}</p>
                    <p className="text-xs font-medium">Impact: {risk.impact}</p>
                    {risk.delayEstimate && (
                      <p className="text-xs mt-1 font-medium">
                        Estimated Delay: {risk.delayEstimate} days
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      Affected: {risk.affectedItems.length} items
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconWrapper component={Zap} className="w-5 h-5" style={{ color: '#FCA311' }} />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedData.recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium flex-1" style={{ color: '#000000' }}>
                        {rec.action}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEffortBadge(rec.effort)}`}>
                        {rec.effort} effort
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Expected Impact: {rec.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Dependency Chains */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconWrapper component={GitBranch} className="w-4 h-4" style={{ color: '#FCA311' }} />
                  Dependency Chains
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedData.dependencyChains.slice(0, 5).map((chain, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">
                        DEPTH: {chain.chainDepth}
                      </span>
                      {chain.isBlocked && (
                        <IconWrapper component={XCircle} className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1">{chain.storyTitle}</p>
                    <p className="text-xs text-gray-600">
                      {chain.dependencies.length} dependencies
                    </p>
                    {chain.blockedBy.length > 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        Blocked by {chain.blockedBy.length} items
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Dependency Graph Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <IconWrapper component={Network} className="w-4 h-4" style={{ color: '#FCA311' }} />
                  Dependency Graph
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] flex flex-col items-center justify-center">
                  <IconWrapper component={Network} className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-600 text-center">
                    {selectedData.dependencyGraph.nodes.length} nodes
                  </p>
                  <p className="text-xs text-gray-600 text-center">
                    {selectedData.dependencyGraph.edges.length} connections
                  </p>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Visual graph coming soon
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Blocked Work */}
            {selectedData.blockedWork.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconWrapper component={XCircle} className="w-4 h-4 text-red-500" />
                    Blocked Work
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedData.blockedWork.slice(0, 5).map((work, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200">
                      <IconWrapper component={XCircle} className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{work.title}</p>
                        {work.blockedBy && work.blockedBy.length > 0 && (
                          <p className="text-xs text-red-600">
                            Blocked by {work.blockedBy.length} items
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
