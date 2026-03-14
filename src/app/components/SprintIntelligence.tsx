import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, CheckCircle, TrendingDown, Users, AlertCircle, ArrowRight, Calendar, Target } from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  stories: any[];
  capacity?: number;
}

interface SprintAnalysis {
  sprintId: string;
  sprintName: string;
  completionProbability: number;
  status: 'healthy' | 'warning' | 'critical';
  issues: {
    overcommitment: boolean;
    unbalancedWorkload: boolean;
    wipViolations: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  };
  recommendations: {
    type: 'move_stories' | 'reduce_scope' | 'rebalance' | 'wip_limit';
    message: string;
    details?: string;
    storiesToMove?: number;
    targetSprint?: string;
  }[];
  metrics: {
    totalPoints: number;
    capacity: number;
    utilizationPercent: number;
    completedPoints: number;
    remainingPoints: number;
    daysRemaining: number;
    velocity: number;
  };
}

interface SprintIntelligenceProps {
  workspaceId: string;
  sprints: Sprint[];
  onRefresh?: () => void;
}

export function SprintIntelligence({ workspaceId, sprints, onRefresh }: SprintIntelligenceProps) {
  const [analyses, setAnalyses] = useState<SprintAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    analyzeSprints();
  }, [sprints]);

  const analyzeSprints = () => {
    setLoading(true);

    // Filter active sprints
    const activeSprints = sprints.filter(s => s.status === 'Active' || s.status === 'Planning');

    const sprintAnalyses = activeSprints.map(sprint => {
      const totalPoints = sprint.stories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);
      const capacity = sprint.capacity || 40;
      const completedPoints = sprint.stories
        .filter(s => s.status === 'Done')
        .reduce((sum, story) => sum + (story.storyPoints || 0), 0);
      const remainingPoints = totalPoints - completedPoints;

      const endDate = new Date(sprint.endDate);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      const utilizationPercent = (totalPoints / capacity) * 100;
      const completionPercent = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

      // Calculate velocity (points per day)
      const startDate = new Date(sprint.startDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = totalDays - daysRemaining;
      const velocity = daysElapsed > 0 ? completedPoints / daysElapsed : 0;

      // Predict completion probability
      const pointsPerDay = velocity;
      const projectedCompletion = daysRemaining > 0 ? completedPoints + (pointsPerDay * daysRemaining) : completedPoints;
      const rawProbability = totalPoints > 0 ? (projectedCompletion / totalPoints) * 100 : 100;
      const completionProbability = Math.min(100, Math.max(0, rawProbability));

      // Detect issues
      const overcommitment = utilizationPercent > 100;
      const unbalancedWorkload = utilizationPercent > 120 || utilizationPercent < 50;
      const wipViolations = sprint.stories.filter(s => s.status === 'In Progress').length > 5;

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (completionProbability < 50 || utilizationPercent > 120) {
        riskLevel = 'high';
      } else if (completionProbability < 75 || utilizationPercent > 100) {
        riskLevel = 'medium';
      }

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (riskLevel === 'high') status = 'critical';
      else if (riskLevel === 'medium') status = 'warning';

      // Generate recommendations
      const recommendations: SprintAnalysis['recommendations'] = [];

      if (overcommitment && utilizationPercent > 110) {
        const storiesToMove = Math.ceil((totalPoints - capacity) / 5); // Assume 5 points per story
        const nextSprintIndex = sprints.findIndex(s => s.id === sprint.id) + 1;
        const targetSprint = nextSprintIndex < sprints.length ? sprints[nextSprintIndex].name : 'Backlog';
        
        recommendations.push({
          type: 'move_stories',
          message: `Move ${storiesToMove} stories to ${targetSprint}`,
          details: `Sprint is overcommitted by ${Math.round(utilizationPercent - 100)}%. Reduce scope to improve completion probability.`,
          storiesToMove,
          targetSprint
        });
      }

      if (wipViolations) {
        const wipCount = sprint.stories.filter(s => s.status === 'In Progress').length;
        recommendations.push({
          type: 'wip_limit',
          message: `Reduce work in progress from ${wipCount} to 5 items`,
          details: 'Too many stories in progress simultaneously. Focus on completing current work before starting new items.'
        });
      }

      if (unbalancedWorkload && !overcommitment && utilizationPercent < 60) {
        recommendations.push({
          type: 'reduce_scope',
          message: 'Consider adding more stories from backlog',
          details: `Sprint utilization is only ${Math.round(utilizationPercent)}%. Team has capacity for additional work.`
        });
      }

      if (completionProbability < 60 && !overcommitment) {
        recommendations.push({
          type: 'rebalance',
          message: 'Team velocity below expected pace',
          details: 'Consider daily standups to identify and remove blockers. Monitor progress more closely.'
        });
      }

      return {
        sprintId: sprint.id,
        sprintName: sprint.name,
        completionProbability: Math.round(completionProbability),
        status,
        issues: {
          overcommitment,
          unbalancedWorkload,
          wipViolations,
          riskLevel
        },
        recommendations,
        metrics: {
          totalPoints,
          capacity,
          utilizationPercent: Math.round(utilizationPercent),
          completedPoints,
          remainingPoints,
          daysRemaining,
          velocity: Math.round(velocity * 10) / 10
        }
      };
    });

    setAnalyses(sprintAnalyses);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (analyses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div 
        className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#000000' }}>Sprint Intelligence</h3>
              <p className="text-sm text-gray-600">AI-powered sprint health analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading ? (
              <span className="text-sm text-gray-500">Analyzing...</span>
            ) : (
              <span className="text-sm text-gray-500">{analyses.length} active sprint{analyses.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Analyzing sprint health...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <div key={analysis.sprintId} className={`rounded-lg border-2 p-4 ${getStatusColor(analysis.status)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(analysis.status)}
                      <h4 className="font-semibold">{analysis.sprintName}</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-600">Completion Probability</div>
                        <div className={`text-2xl font-bold ${getProbabilityColor(analysis.completionProbability)}`}>
                          {analysis.completionProbability}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="bg-white bg-opacity-50 rounded p-2">
                      <div className="text-xs text-gray-600">Utilization</div>
                      <div className="font-semibold">{analysis.metrics.utilizationPercent}%</div>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded p-2">
                      <div className="text-xs text-gray-600">Points</div>
                      <div className="font-semibold">{analysis.metrics.completedPoints}/{analysis.metrics.totalPoints}</div>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded p-2">
                      <div className="text-xs text-gray-600">Days Left</div>
                      <div className="font-semibold">{analysis.metrics.daysRemaining}</div>
                    </div>
                    <div className="bg-white bg-opacity-50 rounded p-2">
                      <div className="text-xs text-gray-600">Velocity</div>
                      <div className="font-semibold">{analysis.metrics.velocity} pts/day</div>
                    </div>
                  </div>

                  {/* Issues */}
                  {(analysis.issues.overcommitment || analysis.issues.wipViolations || analysis.issues.unbalancedWorkload) && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold mb-1">Detected Issues:</div>
                      <div className="space-y-1">
                        {analysis.issues.overcommitment && (
                          <div className="flex items-center gap-2 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Sprint overcommitment detected</span>
                          </div>
                        )}
                        {analysis.issues.wipViolations && (
                          <div className="flex items-center gap-2 text-xs">
                            <AlertCircle className="w-3 h-3" />
                            <span>WIP limit violations</span>
                          </div>
                        )}
                        {analysis.issues.unbalancedWorkload && (
                          <div className="flex items-center gap-2 text-xs">
                            <Users className="w-3 h-3" />
                            <span>Unbalanced workload distribution</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations.length > 0 && (
                    <div className="border-t border-current border-opacity-20 pt-3">
                      <div className="text-xs font-semibold mb-2">AI Recommendations:</div>
                      <div className="space-y-2">
                        {analysis.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-white bg-opacity-60 rounded p-2">
                            <div className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#FCA311' }} />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{rec.message}</div>
                                {rec.details && (
                                  <div className="text-xs text-gray-700 mt-1">{rec.details}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
