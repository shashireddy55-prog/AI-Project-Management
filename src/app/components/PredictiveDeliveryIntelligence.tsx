import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  Zap,
  BarChart3,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface RiskFactor {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
}

interface Recommendation {
  action: string;
  impact: string;
  effort: 'high' | 'medium' | 'low';
}

interface DeliveryPrediction {
  projectId: string;
  projectName: string;
  currentStatus: {
    completion: number;
    velocity: number;
    sprintsRemaining: number;
  };
  forecast: {
    expectedCompletionDate: string;
    confidence: number;
    daysVariance: number;
    onTrack: boolean;
  };
  risks: RiskFactor[];
  recommendations: Recommendation[];
  criticalPath: {
    blockers: string[];
    dependencies: string[];
  };
  sprintHealth: {
    overcommitment: number;
    capacityUtilization: number;
    burndownTrend: 'healthy' | 'warning' | 'critical';
  };
}

interface PredictiveDeliveryIntelligenceProps {
  workspaceId: string;
  userId: string;
  accessToken: string;
}

export function PredictiveDeliveryIntelligence({ 
  workspaceId, 
  userId, 
  accessToken 
}: PredictiveDeliveryIntelligenceProps) {
  const [predictions, setPredictions] = useState<DeliveryPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const fetchPredictions = async () => {
    if (!accessToken) {
      console.warn('Cannot fetch predictions: No access token available');
      return;
    }

    setLoading(true);
    try {
      console.log('[Predictive Intelligence] Fetching predictions with:');
      console.log('[Predictive Intelligence] Access Token Length:', accessToken.length);
      console.log('[Predictive Intelligence] Token Preview:', accessToken.substring(0, 30) + '...');
      console.log('[Predictive Intelligence] Public Anon Key:', publicAnonKey.substring(0, 30) + '...');
      console.log('[Predictive Intelligence] Workspace ID:', workspaceId);
      console.log('[Predictive Intelligence] User ID:', userId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/delivery-intelligence/predict`,
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

      console.log('[Predictive Intelligence] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[Predictive Intelligence] Success! Received predictions:', data.predictions?.length || 0);
        setPredictions(data.predictions || []);
        if (data.predictions?.length > 0 && !selectedProject) {
          setSelectedProject(data.predictions[0].projectId);
        }
      } else {
        const errorText = await response.text();
        console.error('[Predictive Intelligence] Failed to fetch predictions:', errorText);
        console.error('[Predictive Intelligence] Response status:', response.status);
        
        // Show toast error to user
        toast.error('Failed to load predictions', {
          description: 'Authentication failed. Please try logging in again.'
        });
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && workspaceId) {
      fetchPredictions();
    }
  }, [workspaceId, accessToken]);

  const selectedPrediction = predictions.find(p => p.projectId === selectedProject);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>
            Predictive Delivery Intelligence
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered project forecasting and risk detection
          </p>
        </div>
        <Button
          onClick={fetchPredictions}
          disabled={loading}
          style={{ backgroundColor: '#14213D', color: '#FFFFFF' }}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </Button>
      </div>

      {/* Project Tabs */}
      {predictions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {predictions.map((pred) => (
            <button
              key={pred.projectId}
              onClick={() => setSelectedProject(pred.projectId)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedProject === pred.projectId
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={
                selectedProject === pred.projectId
                  ? { backgroundColor: '#14213D' }
                  : undefined
              }
            >
              {pred.projectName}
            </button>
          ))}
        </div>
      )}

      {!loading && predictions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No predictions available yet</p>
            <p className="text-sm text-gray-500">Add projects and tasks to get AI insights</p>
          </CardContent>
        </Card>
      )}

      {selectedPrediction && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Forecast */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Forecast Card */}
            <Card className={`border-2 ${selectedPrediction.forecast.onTrack ? 'border-green-200' : 'border-red-200'}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedPrediction.forecast.onTrack ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  )}
                  Delivery Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Expected Completion</p>
                    <p className="text-2xl font-bold" style={{ color: '#000000' }}>
                      {selectedPrediction.forecast.expectedCompletionDate}
                    </p>
                    {selectedPrediction.forecast.daysVariance !== 0 && (
                      <p className={`text-sm font-medium ${selectedPrediction.forecast.daysVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedPrediction.forecast.daysVariance > 0 ? '+' : ''}{selectedPrediction.forecast.daysVariance} days
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Confidence Level</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${selectedPrediction.forecast.confidence}%`,
                            backgroundColor: '#FCA311'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">{selectedPrediction.forecast.confidence}%</span>
                    </div>
                  </div>
                </div>

                {!selectedPrediction.forecast.onTrack && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="font-bold text-red-900 mb-2">
                      ⚠️ Release will miss deadline by {Math.abs(selectedPrediction.forecast.daysVariance)} days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" style={{ color: '#FCA311' }} />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Completion</p>
                    <p className="text-3xl font-bold" style={{ color: '#000000' }}>
                      {selectedPrediction.currentStatus.completion}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Velocity</p>
                    <p className="text-3xl font-bold" style={{ color: '#000000' }}>
                      {selectedPrediction.currentStatus.velocity}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Sprints Left</p>
                    <p className="text-3xl font-bold" style={{ color: '#000000' }}>
                      {selectedPrediction.currentStatus.sprintsRemaining}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Root Causes & Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPrediction.risks.map((risk, index) => (
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
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" style={{ color: '#FCA311' }} />
                  Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPrediction.recommendations.map((rec, index) => (
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
            {/* Sprint Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sprint Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Overcommitment</span>
                    <span className="text-sm font-bold">{selectedPrediction.sprintHealth.overcommitment}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedPrediction.sprintHealth.overcommitment > 100
                          ? 'bg-red-500'
                          : selectedPrediction.sprintHealth.overcommitment > 85
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(selectedPrediction.sprintHealth.overcommitment, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Capacity Utilization</span>
                    <span className="text-sm font-bold">{selectedPrediction.sprintHealth.capacityUtilization}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${selectedPrediction.sprintHealth.capacityUtilization}%`,
                        backgroundColor: '#FCA311'
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 mb-1">Burndown Trend</p>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPrediction.sprintHealth.burndownTrend === 'healthy'
                      ? 'bg-green-100 text-green-700'
                      : selectedPrediction.sprintHealth.burndownTrend === 'warning'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedPrediction.sprintHealth.burndownTrend === 'healthy' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {selectedPrediction.sprintHealth.burndownTrend}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Critical Path */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: '#FCA311' }} />
                  Critical Path
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPrediction.criticalPath.blockers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">BLOCKERS</p>
                    {selectedPrediction.criticalPath.blockers.map((blocker, index) => (
                      <div key={index} className="flex items-start gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{blocker}</p>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPrediction.criticalPath.dependencies.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">DEPENDENCIES</p>
                    {selectedPrediction.criticalPath.dependencies.map((dep, index) => (
                      <div key={index} className="flex items-start gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{dep}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}