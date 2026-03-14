import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  Users, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  Target,
  TrendingUp,
  Package,
  Clock,
  Layers,
  GitBranch,
  Activity,
  BarChart3,
  XCircle,
  ChevronRight,
  Eye,
  Play,
  Download,
  RefreshCw,
  ExternalLink,
  Filter,
  Maximize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface IntelligenceDashboardProps {
  workspaceId: string;
  sprints: any[];
  userId?: string;
  accessToken?: string;
  projects?: any[];
  epics?: any[];
  stories?: any[];
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

interface PredictiveAnalysis {
  forecastCompletionDate: string;
  daysSlippage: number;
  missesDeadline: boolean;
  rootCauses: string[];
  recommendations: {
    message: string;
    impact: string;
  }[];
  milestoneRisks: {
    milestone: string;
    probability: number;
    status: 'on-track' | 'at-risk' | 'delayed';
  }[];
  velocityTrend: 'increasing' | 'stable' | 'declining';
  criticalPathRisks: string[];
}

interface DependencyAnalysis {
  dependencies: {
    id: string;
    from: string;
    to: string;
    type: 'blocks' | 'blocked-by' | 'relates-to';
    status: 'healthy' | 'at-risk' | 'blocked';
    delayDays: number;
    impact: string;
    upstreamDelay: boolean;
  }[];
  totalDependencies: number;
  blockedItems: number;
  criticalDependencies: number;
  crossTeamConflicts: string[];
}

export function IntelligenceDashboard({ workspaceId, sprints, userId, accessToken, projects, epics, stories }: IntelligenceDashboardProps) {
  const [sprintAnalyses, setSprintAnalyses] = useState<SprintAnalysis[]>([]);
  const [predictiveData, setPredictiveData] = useState<PredictiveAnalysis | null>(null);
  const [dependencyData, setDependencyData] = useState<DependencyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    predictive: true,
    dependency: true,
    sprint: true
  });
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'warning' | 'healthy' | 'dependencies'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalData, setDetailModalData] = useState<any>(null);

  useEffect(() => {
    analyzeAll();
  }, [sprints, workspaceId, projects, epics, stories]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      workspaceId,
      overallHealth,
      sprintAnalyses,
      predictiveData,
      dependencyData
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligence-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (section: string, data: any) => {
    setDetailModalData(data);
    setShowDetailModal(true);
  };

  const handleApplyRecommendation = (recommendation: any) => {
    console.log('Applying recommendation:', recommendation);
    alert(`Apply Recommendation\n\n"${recommendation.message}"\n\nThis would:\n1. Show confirmation dialog\n2. Execute the recommended action\n3. Update affected items\n4. Track the change\n\nNote: This is a demo - actual implementation would modify workspace data.`);
  };

  const handleStatCardClick = (type: 'sprints' | 'critical' | 'warnings' | 'dependencies') => {
    let data: any = {};
    let title = '';

    switch (type) {
      case 'sprints':
        title = 'Active Sprints Overview';
        data = {
          type: 'sprints',
          sprints: sprintAnalyses,
          totalSprints: sprintAnalyses.length,
          avgHealth: overallHealth
        };
        setSelectedFilter('all');
        break;
      case 'critical':
        title = 'Critical Issues';
        data = {
          type: 'critical',
          sprints: sprintAnalyses.filter(a => a.status === 'critical'),
          count: criticalCount,
          issues: sprintAnalyses.filter(a => a.status === 'critical').flatMap(s => s.recommendations)
        };
        setSelectedFilter('critical');
        break;
      case 'warnings':
        title = 'Warning Issues';
        data = {
          type: 'warnings',
          sprints: sprintAnalyses.filter(a => a.status === 'warning'),
          count: warningCount,
          issues: sprintAnalyses.filter(a => a.status === 'warning').flatMap(s => s.recommendations)
        };
        setSelectedFilter('warning');
        break;
      case 'dependencies':
        title = 'Dependency Analysis';
        data = {
          type: 'dependencies',
          dependencies: dependencyData,
          criticalDeps: dependencyData?.dependencies.filter(d => d.status === 'blocked' || d.status === 'at-risk')
        };
        setSelectedFilter('dependencies');
        break;
    }

    setDetailModalData({ title, ...data });
    setShowDetailModal(true);
  };

  const analyzeAll = async () => {
    setLoading(true);
    
    // Ensure sprints is an array
    const sprintsArray = Array.isArray(sprints) ? sprints : [];
    
    // Analyze sprints
    const activeSprints = sprintsArray.filter(s => s.status === 'Active' || s.status === 'Planning');
    const analyses = activeSprints.map(sprint => analyzeSprint(sprint));
    setSprintAnalyses(analyses);

    // Calculate predictive analytics locally
    const predictive = calculatePredictiveAnalytics(sprintsArray, projects, epics, stories);
    setPredictiveData(predictive);

    // Calculate dependency analytics locally
    const dependencies = calculateDependencyAnalytics(sprintsArray, projects, epics, stories);
    setDependencyData(dependencies);

    setLoading(false);
  };

  const analyzeSprint = (sprint: any): SprintAnalysis => {
    const totalPoints = sprint.stories?.reduce((sum: number, story: any) => sum + (story.storyPoints || 0), 0) || 0;
    const capacity = sprint.capacity || 40;
    const completedPoints = sprint.stories?.filter((s: any) => s.status === 'Done')
      .reduce((sum: number, story: any) => sum + (story.storyPoints || 0), 0) || 0;
    const remainingPoints = totalPoints - completedPoints;

    const endDate = new Date(sprint.endDate);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    const utilizationPercent = (totalPoints / capacity) * 100;

    const startDate = new Date(sprint.startDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = totalDays - daysRemaining;
    const velocity = daysElapsed > 0 ? completedPoints / daysElapsed : 0;

    const pointsPerDay = velocity;
    const projectedCompletion = daysRemaining > 0 ? completedPoints + (pointsPerDay * daysRemaining) : completedPoints;
    const rawProbability = totalPoints > 0 ? (projectedCompletion / totalPoints) * 100 : 100;
    const completionProbability = Math.min(100, Math.max(0, rawProbability));

    const overcommitment = utilizationPercent > 100;
    const unbalancedWorkload = utilizationPercent > 120 || utilizationPercent < 50;
    const wipViolations = sprint.stories?.filter((s: any) => s.status === 'In Progress').length > 5;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (completionProbability < 50 || utilizationPercent > 120) riskLevel = 'high';
    else if (completionProbability < 75 || utilizationPercent > 100) riskLevel = 'medium';

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (riskLevel === 'high') status = 'critical';
    else if (riskLevel === 'medium') status = 'warning';

    const recommendations: SprintAnalysis['recommendations'] = [];

    if (overcommitment && utilizationPercent > 110) {
      const storiesToMove = Math.ceil((totalPoints - capacity) / 5);
      const sprintsArray = Array.isArray(sprints) ? sprints : [];
      const nextSprintIndex = sprintsArray.findIndex(s => s.id === sprint.id) + 1;
      const targetSprint = nextSprintIndex < sprintsArray.length ? sprintsArray[nextSprintIndex].name : 'Backlog';
      
      recommendations.push({
        type: 'move_stories',
        message: `Move ${storiesToMove} stories to ${targetSprint}`,
        details: `Sprint is overcommitted by ${Math.round(utilizationPercent - 100)}%. Reduce scope to improve completion probability.`
      });
    }

    if (wipViolations) {
      const wipCount = sprint.stories?.filter((s: any) => s.status === 'In Progress').length || 0;
      recommendations.push({
        type: 'wip_limit',
        message: `Reduce work in progress from ${wipCount} to 5 items`,
        details: 'Too many stories in progress simultaneously. Focus on completing current work.'
      });
    }

    if (unbalancedWorkload && !overcommitment && utilizationPercent < 60) {
      recommendations.push({
        type: 'reduce_scope',
        message: 'Consider adding more stories from backlog',
        details: `Sprint utilization is only ${Math.round(utilizationPercent)}%. Team has capacity for additional work.`
      });
    }

    return {
      sprintId: sprint.id,
      sprintName: sprint.name,
      completionProbability: Math.round(completionProbability),
      status,
      issues: { overcommitment, unbalancedWorkload, wipViolations, riskLevel },
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
  };

  const calculatePredictiveAnalytics = (sprintsArray: any[], projects?: any[], epics?: any[], stories?: any[]): PredictiveAnalysis => {
    // Get all active sprints
    const activeSprints = sprintsArray.filter(s => s.status === 'Active');
    
    // Calculate overall velocity across all sprints
    let totalVelocity = 0;
    let sprintCount = 0;
    const velocities: number[] = [];

    activeSprints.forEach(sprint => {
      const startDate = new Date(sprint.startDate);
      const now = new Date();
      const endDate = new Date(sprint.endDate);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const completedPoints = sprint.stories?.filter((s: any) => s.status === 'Done')
        .reduce((sum: number, story: any) => sum + (story.storyPoints || 0), 0) || 0;
      
      if (daysElapsed > 0) {
        const velocity = completedPoints / daysElapsed;
        velocities.push(velocity);
        totalVelocity += velocity;
        sprintCount++;
      }
    });

    const avgVelocity = sprintCount > 0 ? totalVelocity / sprintCount : 2;

    // Determine velocity trend
    let velocityTrend: 'increasing' | 'stable' | 'declining' = 'stable';
    if (velocities.length >= 2) {
      const recent = velocities[velocities.length - 1];
      const previous = velocities[velocities.length - 2];
      if (recent > previous * 1.1) velocityTrend = 'increasing';
      else if (recent < previous * 0.9) velocityTrend = 'declining';
    }

    // Calculate remaining work
    const allStories = stories || [];
    const remainingStories = allStories.filter((s: any) => s.status !== 'Done');
    const remainingPoints = remainingStories.reduce((sum: number, s: any) => sum + (s.storyPoints || 3), 0);

    // Forecast completion
    const daysToComplete = avgVelocity > 0 ? Math.ceil(remainingPoints / avgVelocity) : 30;
    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + daysToComplete);

    // Find target date (from latest sprint or project)
    let targetDate = new Date();
    if (activeSprints.length > 0) {
      const latestSprint = activeSprints.reduce((latest, sprint) => {
        const sprintEnd = new Date(sprint.endDate);
        const latestEnd = new Date(latest.endDate);
        return sprintEnd > latestEnd ? sprint : latest;
      });
      targetDate = new Date(latestSprint.endDate);
    }

    const daysSlippage = Math.ceil((forecastDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    const missesDeadline = daysSlippage > 0;

    // Identify root causes
    const rootCauses: string[] = [];
    if (velocityTrend === 'declining') {
      rootCauses.push('Sprint velocity declining over time');
    }
    
    const overcommittedSprints = activeSprints.filter(s => {
      const totalPoints = s.stories?.reduce((sum: number, story: any) => sum + (story.storyPoints || 0), 0) || 0;
      const capacity = s.capacity || 40;
      return totalPoints > capacity * 1.2;
    });
    if (overcommittedSprints.length > 0) {
      rootCauses.push(`${overcommittedSprints.length} sprint(s) significantly overcommitted`);
    }

    const blockedStories = allStories.filter((s: any) => s.status === 'Blocked' || s.blockedBy);
    if (blockedStories.length > 0) {
      rootCauses.push(`${blockedStories.length} stories currently blocked by dependencies`);
    }

    if (avgVelocity < 2) {
      rootCauses.push('Team velocity below expected capacity');
    }

    // Generate recommendations
    const recommendations: { message: string; impact: string }[] = [];
    
    if (missesDeadline && daysSlippage > 5) {
      const pointsToRemove = Math.ceil(daysSlippage * avgVelocity);
      recommendations.push({
        message: `Remove ${pointsToRemove} story points from scope`,
        impact: `Will bring delivery back on schedule`
      });
      recommendations.push({
        message: 'Add 1-2 additional team members',
        impact: 'Could increase velocity by 20-30%'
      });
    }

    if (velocityTrend === 'declining') {
      recommendations.push({
        message: 'Investigate velocity decline - reduce WIP and technical debt',
        impact: 'Stabilize team output and predictability'
      });
    }

    if (blockedStories.length > 0) {
      recommendations.push({
        message: 'Resolve blocked dependencies immediately',
        impact: `Unblock ${blockedStories.length} stories worth ~${blockedStories.length * 3} points`
      });
    }

    // Calculate milestone risks
    const milestoneRisks: PredictiveAnalysis['milestoneRisks'] = [];
    if (activeSprints.length > 0) {
      activeSprints.forEach(sprint => {
        const totalPoints = sprint.stories?.reduce((sum: number, story: any) => sum + (story.storyPoints || 0), 0) || 0;
        const completedPoints = sprint.stories?.filter((s: any) => s.status === 'Done')
          .reduce((sum: number, story: any) => sum + (story.storyPoints || 0), 0) || 0;
        const remainingPoints = totalPoints - completedPoints;
        
        const endDate = new Date(sprint.endDate);
        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        
        const requiredVelocity = daysRemaining > 0 ? remainingPoints / daysRemaining : remainingPoints;
        const probability = avgVelocity > 0 ? Math.min(100, (avgVelocity / requiredVelocity) * 100) : 50;

        let status: 'on-track' | 'at-risk' | 'delayed' = 'on-track';
        if (probability < 50) status = 'delayed';
        else if (probability < 75) status = 'at-risk';

        milestoneRisks.push({
          milestone: sprint.name,
          probability: Math.round(probability),
          status
        });
      });
    }

    // Identify critical path risks
    const criticalPathRisks: string[] = [];
    if (blockedStories.length > 0) {
      criticalPathRisks.push(`${blockedStories.length} blocked items on critical path`);
    }
    if (overcommittedSprints.length > 0) {
      criticalPathRisks.push('Sprint overcommitment threatens timeline');
    }
    if (velocityTrend === 'declining') {
      criticalPathRisks.push('Declining velocity increases schedule risk');
    }

    return {
      forecastCompletionDate: forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysSlippage,
      missesDeadline,
      rootCauses,
      recommendations,
      milestoneRisks,
      velocityTrend,
      criticalPathRisks
    };
  };

  const calculateDependencyAnalytics = (sprintsArray: any[], projects?: any[], epics?: any[], stories?: any[]): DependencyAnalysis => {
    const dependencies: DependencyAnalysis['dependencies'] = [];
    const allStories = stories || [];
    
    // Analyze story dependencies
    allStories.forEach((story: any) => {
      if (story.blockedBy || story.blocks || story.relatesTo) {
        const blockedByList = Array.isArray(story.blockedBy) ? story.blockedBy : (story.blockedBy ? [story.blockedBy] : []);
        const blocksList = Array.isArray(story.blocks) ? story.blocks : (story.blocks ? [story.blocks] : []);
        const relatesList = Array.isArray(story.relatesTo) ? story.relatesTo : (story.relatesTo ? [story.relatesTo] : []);

        blockedByList.forEach((blockerId: string) => {
          const blockerStory = allStories.find((s: any) => s.id === blockerId);
          if (blockerStory) {
            let delayDays = 0;
            let status: 'healthy' | 'at-risk' | 'blocked' = 'healthy';
            let upstreamDelay = false;

            // Check if blocker is delayed
            if (blockerStory.status !== 'Done') {
              if (blockerStory.dueDate) {
                const dueDate = new Date(blockerStory.dueDate);
                const now = new Date();
                if (now > dueDate) {
                  delayDays = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                  status = 'blocked';
                  upstreamDelay = true;
                }
              }
              if (blockerStory.status === 'To Do' || blockerStory.status === 'Backlog') {
                status = 'at-risk';
              }
            }

            dependencies.push({
              id: `${blockerId}-${story.id}`,
              from: blockerStory.title || `Story ${blockerId}`,
              to: story.title || `Story ${story.id}`,
              type: 'blocked-by',
              status,
              delayDays,
              impact: upstreamDelay ? 
                `May delay dependent work by ${delayDays + 2} days` :
                'Monitoring for potential delays',
              upstreamDelay
            });
          }
        });

        blocksList.forEach((blockedId: string) => {
          const blockedStory = allStories.find((s: any) => s.id === blockedId);
          if (blockedStory) {
            dependencies.push({
              id: `${story.id}-${blockedId}`,
              from: story.title || `Story ${story.id}`,
              to: blockedStory.title || `Story ${blockedId}`,
              type: 'blocks',
              status: story.status === 'Done' ? 'healthy' : 'at-risk',
              delayDays: 0,
              impact: story.status !== 'Done' ? 
                'Blocking downstream work' :
                'Completed - no blocking impact',
              upstreamDelay: false
            });
          }
        });
      }
    });

    const blockedItems = dependencies.filter(d => d.status === 'blocked').length;
    const criticalDependencies = dependencies.filter(d => d.status === 'blocked' || d.delayDays > 0).length;
    
    // Identify cross-team conflicts (simplified)
    const crossTeamConflicts: string[] = [];
    const delayedDeps = dependencies.filter(d => d.delayDays > 0);
    if (delayedDeps.length > 0) {
      crossTeamConflicts.push(`${delayedDeps.length} cross-team dependencies currently delayed`);
    }
    if (blockedItems > 2) {
      crossTeamConflicts.push('Multiple blocking dependencies detected - coordinate team efforts');
    }

    return {
      dependencies,
      totalDependencies: dependencies.length,
      blockedItems,
      criticalDependencies,
      crossTeamConflicts
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  // Calculate overall health score
  const overallHealth = sprintAnalyses.length > 0
    ? Math.round(sprintAnalyses.reduce((sum, a) => sum + a.completionProbability, 0) / sprintAnalyses.length)
    : 100;

  const criticalCount = sprintAnalyses.filter(a => a.status === 'critical').length;
  const warningCount = sprintAnalyses.filter(a => a.status === 'warning').length;

  return (
    <Card className="border-2" style={{ borderColor: '#FCA311' }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Intelligence Dashboard</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive workspace analytics & recommendations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-3">
              <div className="text-xs text-gray-600">Overall Health</div>
              <div className={`text-2xl font-bold ${getProbabilityColor(overallHealth)}`}>
                {overallHealth}%
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => analyzeAll()}
                className="text-xs"
                style={{ borderColor: '#14213D', color: '#14213D' }}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportReport}
                className="text-xs"
                style={{ borderColor: '#14213D', color: '#14213D' }}
              >
                <Download className="w-3 h-3 mr-1" />
                Export Report
              </Button>
              <Button 
                size="sm"
                onClick={() => handleViewDetails('Dashboard Overview', { overallHealth, criticalCount, warningCount })}
                className="text-xs text-white"
                style={{ backgroundColor: '#14213D' }}
              >
                <Maximize2 className="w-3 h-3 mr-1" />
                Full View
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar - Clickable */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div 
            className="bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-gray-300" 
            onClick={() => handleStatCardClick('sprints')}
          >
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4" style={{ color: '#FCA311' }} />
              <span className="text-xs font-medium text-gray-700">Active Sprints</span>
            </div>
            <div className="text-xl font-bold" style={{ color: '#000000' }}>{sprintAnalyses.length}</div>
            <div className="text-xs text-gray-500 mt-1">Click to view</div>
          </div>
          <div 
            className="bg-red-50 rounded-lg p-3 border border-red-200 cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-red-300" 
            onClick={() => handleStatCardClick('critical')}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">Critical Issues</span>
            </div>
            <div className="text-xl font-bold text-red-900">{criticalCount}</div>
            <div className="text-xs text-red-600 mt-1">Click to view</div>
          </div>
          <div 
            className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-yellow-300" 
            onClick={() => handleStatCardClick('warnings')}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700">Warnings</span>
            </div>
            <div className="text-xl font-bold text-yellow-900">{warningCount}</div>
            <div className="text-xs text-yellow-600 mt-1">Click to view</div>
          </div>
          <div 
            className="bg-blue-50 rounded-lg p-3 border border-blue-200 cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-blue-300" 
            onClick={() => handleStatCardClick('dependencies')}
          >
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Dependencies</span>
            </div>
            <div className="text-xl font-bold text-blue-900">{dependencyData?.totalDependencies || 0}</div>
            <div className="text-xs text-blue-600 mt-1">Click to view</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto" style={{ borderColor: '#FCA311' }}></div>
            <p className="text-sm text-gray-500 mt-3">Analyzing workspace intelligence...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Predictive Delivery Intelligence - ALWAYS SHOW */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <TrendingUp className="w-5 h-5" style={{ color: '#14213D' }} />
                <h3 className="font-semibold text-lg" style={{ color: '#000000' }}>Predictive Delivery Intelligence</h3>
              </div>
              
              {predictiveData ? (
                <div className={`rounded-lg p-4 border-2 ${
                  predictiveData.missesDeadline ? 'bg-red-50 border-red-300' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                }`}>
                  {/* Forecast Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {predictiveData.missesDeadline ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      <span className={`font-bold text-lg ${predictiveData.missesDeadline ? 'text-red-900' : 'text-blue-900'}`}>
                        {predictiveData.missesDeadline 
                          ? `Forecast: Release will miss deadline by ${predictiveData.daysSlippage} days`
                          : `Forecast: On track for ${predictiveData.forecastCompletionDate}`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <div className="text-xs text-gray-600 mb-1">Projected Delivery</div>
                      <div className="text-sm font-bold text-gray-900">
                        {predictiveData.forecastCompletionDate}
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <div className="text-xs text-gray-600 mb-1">Velocity Trend</div>
                      <div className="text-sm font-bold flex items-center gap-1">
                        {predictiveData.velocityTrend === 'increasing' && (
                          <><TrendingUp className="w-3 h-3 text-green-600" /><span className="text-green-700">Increasing</span></>
                        )}
                        {predictiveData.velocityTrend === 'stable' && (
                          <><Activity className="w-3 h-3 text-blue-600" /><span className="text-blue-700">Stable</span></>
                        )}
                        {predictiveData.velocityTrend === 'declining' && (
                          <><TrendingDown className="w-3 h-3 text-red-600" /><span className="text-red-700">Declining</span></>
                        )}
                      </div>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded p-3">
                      <div className="text-xs text-gray-600 mb-1">Critical Path Risks</div>
                      <div className="text-sm font-bold text-gray-900">
                        {predictiveData.criticalPathRisks.length} identified
                      </div>
                    </div>
                  </div>

                  {/* Root Causes */}
                  {predictiveData.rootCauses.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold mb-2" style={{ color: '#000000' }}>Root Causes:</div>
                      <div className="space-y-1">
                        {predictiveData.rootCauses.map((cause, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span style={{ color: '#FCA311' }}>•</span>
                            <span>{cause}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {predictiveData.recommendations.length > 0 && (
                    <div className="border-t border-current border-opacity-20 pt-3">
                      <div className="text-sm font-semibold mb-2" style={{ color: '#000000' }}>Recommended Actions:</div>
                      <div className="space-y-2">
                        {predictiveData.recommendations.map((rec, idx) => (
                          <div key={idx} className="bg-white bg-opacity-70 rounded p-2">
                            <div className="flex items-start gap-2">
                              <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#FCA311' }} />
                              <div className="flex-1">
                                <div className="font-medium text-sm">{rec.message}</div>
                                <div className="text-xs text-gray-700 mt-0.5">{rec.impact}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestone Risks */}
                  {predictiveData.milestoneRisks.length > 0 && (
                    <div className="border-t border-current border-opacity-20 pt-3 mt-3">
                      <div className="text-sm font-semibold mb-2" style={{ color: '#000000' }}>Milestone Risk Probability:</div>
                      <div className="space-y-2">
                        {predictiveData.milestoneRisks.map((risk, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white bg-opacity-70 rounded p-2">
                            <span className="text-sm">{risk.milestone}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                risk.status === 'on-track' ? 'bg-green-100 text-green-700' :
                                risk.status === 'at-risk' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {risk.status}
                              </span>
                              <span className={`font-bold ${getProbabilityColor(risk.probability)}`}>
                                {risk.probability}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">No predictive data available yet</p>
                  <p className="text-xs mt-1">Create sprints and add stories to enable forecasting</p>
                </div>
              )}
            </div>

            {/* Dependency Intelligence - ALWAYS SHOW */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                <GitBranch className="w-5 h-5" style={{ color: '#14213D' }} />
                <h3 className="font-semibold text-lg" style={{ color: '#000000' }}>Dependency Intelligence</h3>
                {dependencyData && dependencyData.totalDependencies > 0 && (
                  <span className="text-xs text-gray-500">({dependencyData.totalDependencies} tracked)</span>
                )}
              </div>
              
              {dependencyData && dependencyData.dependencies.length > 0 ? (
                <div className="space-y-3">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 rounded p-3 border border-gray-200">
                      <div className="text-xs text-gray-600 mb-1">Total Dependencies</div>
                      <div className="text-lg font-bold">{dependencyData.totalDependencies}</div>
                    </div>
                    <div className="bg-red-50 rounded p-3 border border-red-200">
                      <div className="text-xs text-gray-600 mb-1">Blocked Items</div>
                      <div className="text-lg font-bold text-red-700">{dependencyData.blockedItems}</div>
                    </div>
                    <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
                      <div className="text-xs text-gray-600 mb-1">Critical Dependencies</div>
                      <div className="text-lg font-bold text-yellow-700">{dependencyData.criticalDependencies}</div>
                    </div>
                  </div>

                  {/* Dependency List */}
                  <div className="space-y-2">
                    {dependencyData.dependencies.slice(0, 5).map((dep, idx) => (
                      <div key={dep.id} className={`rounded-lg p-3 border ${
                        dep.status === 'blocked' ? 'bg-red-50 border-red-200' :
                        dep.status === 'at-risk' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-sm flex items-center gap-2">
                              <GitBranch className="w-3 h-3" />
                              <span className="truncate">{dep.from}</span>
                              <ArrowRight className="w-3 h-3" style={{ color: '#FCA311' }} />
                              <span className="truncate">{dep.to}</span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded ${
                                dep.type === 'blocks' ? 'bg-purple-100 text-purple-700' :
                                dep.type === 'blocked-by' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {dep.type}
                              </span>
                              {dep.upstreamDelay && (
                                <span className="text-red-600 font-medium">
                                  Delayed {dep.delayDays} days
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ml-2 flex-shrink-0 ${
                            dep.status === 'blocked' ? 'bg-red-100 text-red-700' :
                            dep.status === 'at-risk' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {dep.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-700 bg-white bg-opacity-60 rounded p-2">
                          <span className="font-medium">Impact: </span>{dep.impact}
                        </div>
                      </div>
                    ))}
                    {dependencyData.dependencies.length > 5 && (
                      <div className="text-center text-xs text-gray-500 pt-2">
                        +{dependencyData.dependencies.length - 5} more dependencies
                      </div>
                    )}
                  </div>

                  {/* Cross-team Conflicts */}
                  {dependencyData.crossTeamConflicts.length > 0 && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="text-sm font-semibold mb-2 text-purple-900">Cross-Team Alerts:</div>
                      <div className="space-y-1">
                        {dependencyData.crossTeamConflicts.map((conflict, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="w-3 h-3 mt-0.5 text-purple-600 flex-shrink-0" />
                            <span className="text-purple-800">{conflict}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <GitBranch className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No dependencies tracked yet</p>
                  <p className="text-xs mt-1">Add blockedBy, blocks, or relatesTo fields to stories to track dependencies</p>
                </div>
              )}
            </div>

            {/* Sprint Intelligence Section */}
            {sprintAnalyses.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Target className="w-5 h-5" style={{ color: '#14213D' }} />
                  <h3 className="font-semibold text-lg" style={{ color: '#000000' }}>Sprint Intelligence</h3>
                  <span className="text-xs text-gray-500">({sprintAnalyses.length} active)</span>
                </div>
                
                <div className="space-y-3">
                  {sprintAnalyses.map((analysis) => (
                    <div key={analysis.sprintId} className={`rounded-lg border-2 p-4 ${getStatusColor(analysis.status)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(analysis.status)}
                          <h4 className="font-semibold">{analysis.sprintName}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Completion Probability</div>
                          <div className={`text-2xl font-bold ${getProbabilityColor(analysis.completionProbability)}`}>
                            {analysis.completionProbability}%
                          </div>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
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
              </div>
            )}

            {/* No data state */}
            {sprintAnalyses.length === 0 && !predictiveData && !dependencyData && (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active sprints or analytics data available</p>
                <p className="text-xs text-gray-400 mt-1">Create sprints to see AI-powered insights</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Detail Modal */}
      {showDetailModal && detailModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>{detailModalData.title}</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6">
              {detailModalData.type === 'sprints' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-sm text-gray-600 mb-1">Total Active Sprints</div>
                      <div className="text-3xl font-bold text-blue-900">{detailModalData.totalSprints}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-sm text-gray-600 mb-1">Average Health Score</div>
                      <div className={`text-3xl font-bold ${getProbabilityColor(detailModalData.avgHealth)}`}>{detailModalData.avgHealth}%</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-3">All Active Sprints</h3>
                  {detailModalData.sprints.map((sprint: SprintAnalysis) => (
                    <div key={sprint.sprintId} className={`rounded-lg border-2 p-4 mb-3 ${getStatusColor(sprint.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(sprint.status)}
                          <span className="font-semibold">{sprint.sprintName}</span>
                        </div>
                        <span className={`text-xl font-bold ${getProbabilityColor(sprint.completionProbability)}`}>
                          {sprint.completionProbability}%
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Utilization:</span>
                          <span className="font-semibold ml-1">{sprint.metrics.utilizationPercent}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Points:</span>
                          <span className="font-semibold ml-1">{sprint.metrics.completedPoints}/{sprint.metrics.totalPoints}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Days Left:</span>
                          <span className="font-semibold ml-1">{sprint.metrics.daysRemaining}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Velocity:</span>
                          <span className="font-semibold ml-1">{sprint.metrics.velocity} pts/day</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detailModalData.type === 'critical' && (
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <div className="text-sm text-gray-600">Total Critical Issues</div>
                        <div className="text-3xl font-bold text-red-900">{detailModalData.count}</div>
                      </div>
                    </div>
                    <p className="text-sm text-red-800 mt-2">Sprints with critical health require immediate attention to avoid failure.</p>
                  </div>

                  <h3 className="font-semibold text-lg mb-3">Critical Sprints</h3>
                  {detailModalData.sprints.map((sprint: SprintAnalysis) => (
                    <div key={sprint.sprintId} className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="font-semibold">{sprint.sprintName}</span>
                        </div>
                        <span className="text-xl font-bold text-red-600">{sprint.completionProbability}%</span>
                      </div>
                      {sprint.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold">Recommendations:</div>
                          {sprint.recommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white rounded p-2 text-sm">
                              <div className="font-medium">{rec.message}</div>
                              {rec.details && <div className="text-xs text-gray-600 mt-1">{rec.details}</div>}
                              <Button
                                size="sm"
                                className="mt-2 text-xs text-white"
                                style={{ backgroundColor: '#14213D' }}
                                onClick={() => handleApplyRecommendation(rec)}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Apply Recommendation
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {detailModalData.type === 'warnings' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      <div>
                        <div className="text-sm text-gray-600">Total Warnings</div>
                        <div className="text-3xl font-bold text-yellow-900">{detailModalData.count}</div>
                      </div>
                    </div>
                    <p className="text-sm text-yellow-800 mt-2">Sprints with warnings should be monitored closely to prevent escalation.</p>
                  </div>

                  <h3 className="font-semibold text-lg mb-3">Warning Sprints</h3>
                  {detailModalData.sprints.map((sprint: SprintAnalysis) => (
                    <div key={sprint.sprintId} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <span className="font-semibold">{sprint.sprintName}</span>
                        </div>
                        <span className="text-xl font-bold text-yellow-600">{sprint.completionProbability}%</span>
                      </div>
                      {sprint.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold">Recommendations:</div>
                          {sprint.recommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white rounded p-2 text-sm">
                              <div className="font-medium">{rec.message}</div>
                              {rec.details && <div className="text-xs text-gray-600 mt-1">{rec.details}</div>}
                              <Button
                                size="sm"
                                className="mt-2 text-xs text-white"
                                style={{ backgroundColor: '#14213D' }}
                                onClick={() => handleApplyRecommendation(rec)}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Apply Recommendation
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {detailModalData.type === 'dependencies' && detailModalData.dependencies && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-1">Total Dependencies</div>
                      <div className="text-2xl font-bold">{detailModalData.dependencies.totalDependencies}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="text-sm text-gray-600 mb-1">Blocked Items</div>
                      <div className="text-2xl font-bold text-red-700">{detailModalData.dependencies.blockedItems}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="text-sm text-gray-600 mb-1">Critical</div>
                      <div className="text-2xl font-bold text-yellow-700">{detailModalData.dependencies.criticalDependencies}</div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-3">All Dependencies</h3>
                  {detailModalData.dependencies.dependencies.map((dep: any) => (
                    <div key={dep.id} className={`rounded-lg p-4 border-2 mb-3 ${
                      dep.status === 'blocked' ? 'bg-red-50 border-red-200' :
                      dep.status === 'at-risk' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <GitBranch className="w-4 h-4" />
                          <span className="font-medium text-sm">{dep.from}</span>
                          <ArrowRight className="w-4 h-4" style={{ color: '#FCA311' }} />
                          <span className="font-medium text-sm">{dep.to}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          dep.status === 'blocked' ? 'bg-red-100 text-red-700' :
                          dep.status === 'at-risk' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {dep.status}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                          dep.type === 'blocks' ? 'bg-purple-100 text-purple-700' :
                          dep.type === 'blocked-by' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {dep.type}
                        </span>
                      </div>
                      {dep.upstreamDelay && (
                        <div className="text-sm text-red-600 font-medium mt-1">
                          ⚠️ Delayed by {dep.delayDays} days
                        </div>
                      )}
                      <div className="text-sm text-gray-700 mt-2 bg-white rounded p-2">
                        <span className="font-medium">Impact:</span> {dep.impact}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}