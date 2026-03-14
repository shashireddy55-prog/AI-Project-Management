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
  Maximize2,
  Briefcase,
  FolderKanban
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface GlobalIntelligenceDashboardProps {
  userId: string;
  userRole: 'admin' | 'project_admin' | 'user';
  workspaces: any[];
  projects: any[];
  epics: any[];
  stories: any[];
  sprints: any[];
  accessToken?: string;
}

interface ProjectAnalysis {
  projectId: string;
  projectName: string;
  workspaceName: string;
  health: number;
  status: 'healthy' | 'warning' | 'critical';
  velocity: number;
  completionPercentage: number;
  blockers: number;
  atRiskSprints: number;
  recommendations: {
    type: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

interface OverallMetrics {
  totalProjects: number;
  healthyProjects: number;
  warningProjects: number;
  criticalProjects: number;
  totalSprints: number;
  activeSprints: number;
  totalBlockers: number;
  avgVelocity: number;
  avgHealth: number;
}

export function GlobalIntelligenceDashboard({ 
  userId, 
  userRole, 
  workspaces, 
  projects, 
  epics, 
  stories, 
  sprints,
  accessToken 
}: GlobalIntelligenceDashboardProps) {
  const [projectAnalyses, setProjectAnalyses] = useState<ProjectAnalysis[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalData, setDetailModalData] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'critical' | 'warning' | 'healthy'>('all');

  useEffect(() => {
    analyzeAllProjects();
  }, [userId, userRole, projects, epics, stories, sprints]);

  const analyzeAllProjects = () => {
    setLoading(true);

    // Filter projects based on user role
    let userProjects = projects;
    
    if (userRole === 'user') {
      // For regular users, only show projects where they have assigned stories
      const userStoryIds = stories.filter((s: any) => s.assignee === userId).map((s: any) => s.epicId);
      const userEpicIds = epics.filter((e: any) => userStoryIds.includes(e.id)).map((e: any) => e.projectId);
      userProjects = projects.filter((p: any) => userEpicIds.includes(p.id));
    } else if (userRole === 'project_admin') {
      // For project admins, show projects they created or manage
      userProjects = projects.filter((p: any) => p.createdBy === userId || p.projectAdmin === userId);
    }
    // For admin, show all projects

    // Analyze each project
    const analyses: ProjectAnalysis[] = userProjects.map(project => {
      const projectEpics = epics.filter((e: any) => e.projectId === project.id);
      const projectStories = stories.filter((s: any) => 
        projectEpics.some(e => e.id === s.epicId)
      );
      const projectSprints = sprints.filter((sp: any) => sp.projectId === project.id);

      // Calculate health metrics
      const totalStories = projectStories.length;
      const completedStories = projectStories.filter((s: any) => s.status === 'Done').length;
      const blockedStories = projectStories.filter((s: any) => 
        s.status === 'Blocked' || s.blockedBy
      ).length;
      const completionPercentage = totalStories > 0 ? (completedStories / totalStories) * 100 : 0;

      // Calculate velocity
      const activeSprintsForProject = projectSprints.filter((s: any) => s.status === 'Active');
      let velocity = 0;
      let totalVelocity = 0;
      let sprintCount = 0;

      activeSprintsForProject.forEach(sprint => {
        const sprintStories = projectStories.filter((s: any) => s.sprintId === sprint.id);
        const completedPoints = sprintStories
          .filter((s: any) => s.status === 'Done')
          .reduce((sum: number, s: any) => sum + (s.storyPoints || 0), 0);
        
        const startDate = new Date(sprint.startDate);
        const now = new Date();
        const daysElapsed = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        const sprintVelocity = completedPoints / daysElapsed;
        totalVelocity += sprintVelocity;
        sprintCount++;
      });

      velocity = sprintCount > 0 ? totalVelocity / sprintCount : 0;

      // Count at-risk sprints
      const atRiskSprints = activeSprintsForProject.filter(sprint => {
        const sprintStories = projectStories.filter((s: any) => s.sprintId === sprint.id);
        const totalPoints = sprintStories.reduce((sum: number, s: any) => sum + (s.storyPoints || 0), 0);
        const capacity = sprint.capacity || 40;
        return totalPoints > capacity * 1.1; // Overcommitted
      }).length;

      // Calculate health score
      let health = 100;
      if (completionPercentage < 30) health -= 30;
      else if (completionPercentage < 60) health -= 15;
      
      if (blockedStories > 5) health -= 25;
      else if (blockedStories > 2) health -= 15;
      
      if (velocity < 2) health -= 20;
      else if (velocity < 3) health -= 10;
      
      if (atRiskSprints > 2) health -= 20;
      else if (atRiskSprints > 0) health -= 10;

      health = Math.max(0, Math.min(100, health));

      // Determine status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (health < 50) status = 'critical';
      else if (health < 75) status = 'warning';

      // Generate recommendations
      const recommendations: ProjectAnalysis['recommendations'] = [];

      if (blockedStories > 2) {
        recommendations.push({
          type: 'blockers',
          message: `Resolve ${blockedStories} blocked stories to improve flow`,
          priority: 'high'
        });
      }

      if (atRiskSprints > 0) {
        recommendations.push({
          type: 'sprint_overcommitment',
          message: `${atRiskSprints} sprint(s) overcommitted - reduce scope`,
          priority: 'high'
        });
      }

      if (velocity < 2.5) {
        recommendations.push({
          type: 'velocity',
          message: 'Velocity below target - investigate team capacity',
          priority: 'medium'
        });
      }

      if (completionPercentage < 40 && totalStories > 10) {
        recommendations.push({
          type: 'progress',
          message: 'Project completion rate low - reassess priorities',
          priority: 'medium'
        });
      }

      const workspace = workspaces.find(w => w.id === project.workspaceId);

      return {
        projectId: project.id,
        projectName: project.name,
        workspaceName: workspace?.name || 'Unknown Workspace',
        health: Math.round(health),
        status,
        velocity: Math.round(velocity * 10) / 10,
        completionPercentage: Math.round(completionPercentage),
        blockers: blockedStories,
        atRiskSprints,
        recommendations
      };
    });

    setProjectAnalyses(analyses);

    // Calculate overall metrics
    const metrics: OverallMetrics = {
      totalProjects: analyses.length,
      healthyProjects: analyses.filter(a => a.status === 'healthy').length,
      warningProjects: analyses.filter(a => a.status === 'warning').length,
      criticalProjects: analyses.filter(a => a.status === 'critical').length,
      totalSprints: sprints.length,
      activeSprints: sprints.filter((s: any) => s.status === 'Active').length,
      totalBlockers: analyses.reduce((sum, a) => sum + a.blockers, 0),
      avgVelocity: analyses.length > 0 
        ? Math.round((analyses.reduce((sum, a) => sum + a.velocity, 0) / analyses.length) * 10) / 10 
        : 0,
      avgHealth: analyses.length > 0 
        ? Math.round(analyses.reduce((sum, a) => sum + a.health, 0) / analyses.length) 
        : 100
    };

    setOverallMetrics(metrics);
    setLoading(false);
  };

  const handleStatCardClick = (type: 'projects' | 'critical' | 'warnings' | 'blockers') => {
    let data: any = {};
    let title = '';

    switch (type) {
      case 'projects':
        title = 'All Projects Overview';
        data = {
          type: 'projects',
          projects: projectAnalyses,
          metrics: overallMetrics
        };
        setSelectedFilter('all');
        break;
      case 'critical':
        title = 'Critical Projects';
        data = {
          type: 'critical',
          projects: projectAnalyses.filter(p => p.status === 'critical'),
          count: overallMetrics?.criticalProjects || 0
        };
        setSelectedFilter('critical');
        break;
      case 'warnings':
        title = 'Warning Projects';
        data = {
          type: 'warnings',
          projects: projectAnalyses.filter(p => p.status === 'warning'),
          count: overallMetrics?.warningProjects || 0
        };
        setSelectedFilter('warning');
        break;
      case 'blockers':
        title = 'Blockers Across Projects';
        data = {
          type: 'blockers',
          projects: projectAnalyses.filter(p => p.blockers > 0),
          totalBlockers: overallMetrics?.totalBlockers || 0
        };
        break;
    }

    setDetailModalData({ title, ...data });
    setShowDetailModal(true);
  };

  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      overallMetrics,
      projectAnalyses,
      scope: userRole === 'admin' ? 'All Projects' : 
             userRole === 'project_admin' ? 'Managed Projects' : 
             'Projects I\'m Part Of'
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `global-intelligence-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getHealthColor = (health: number) => {
    if (health >= 75) return 'text-green-600';
    if (health >= 50) return 'text-yellow-600';
    return 'text-red-600';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Card className="border-2" style={{ borderColor: '#FCA311' }}>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto" style={{ borderColor: '#FCA311' }}></div>
            <p className="text-sm text-gray-500 mt-3">Analyzing your projects...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!overallMetrics || projectAnalyses.length === 0) {
    return (
      <Card className="border-2" style={{ borderColor: '#FCA311' }}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Global AI Intelligence</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {userRole === 'admin' ? 'All projects across organization' :
                 userRole === 'project_admin' ? 'Projects you manage' :
                 'Projects you\'re part of'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No projects available for analysis</p>
          <p className="text-xs text-gray-400 mt-1">
            {userRole === 'user' ? 'You\'re not assigned to any stories yet' : 'Create projects to see AI-powered insights'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2" style={{ borderColor: '#FCA311' }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Global AI Intelligence</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {userRole === 'admin' ? 'Organization-wide analytics & optimization' :
                 userRole === 'project_admin' ? 'Your managed projects analytics' :
                 'Your projects analytics & recommendations'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-3">
              <div className="text-xs text-gray-600">Overall Health</div>
              <div className={`text-2xl font-bold ${getHealthColor(overallMetrics.avgHealth)}`}>
                {overallMetrics.avgHealth}%
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={analyzeAllProjects}
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
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar - Clickable */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div 
            className="bg-blue-50 rounded-lg p-3 border border-blue-200 cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-blue-300" 
            onClick={() => handleStatCardClick('projects')}
          >
            <div className="flex items-center gap-2 mb-1">
              <FolderKanban className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Total Projects</span>
            </div>
            <div className="text-xl font-bold text-blue-900">{overallMetrics.totalProjects}</div>
            <div className="text-xs text-blue-600 mt-1">Click to view</div>
          </div>
          <div 
            className="bg-red-50 rounded-lg p-3 border border-red-200 cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-red-300" 
            onClick={() => handleStatCardClick('critical')}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">Critical Projects</span>
            </div>
            <div className="text-xl font-bold text-red-900">{overallMetrics.criticalProjects}</div>
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
            <div className="text-xl font-bold text-yellow-900">{overallMetrics.warningProjects}</div>
            <div className="text-xs text-yellow-600 mt-1">Click to view</div>
          </div>
          <div 
            className="bg-purple-50 rounded-lg p-3 border border-purple-200 cursor-pointer transition-all hover:shadow-md hover:scale-105 hover:border-purple-300" 
            onClick={() => handleStatCardClick('blockers')}
          >
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Total Blockers</span>
            </div>
            <div className="text-xl font-bold text-purple-900">{overallMetrics.totalBlockers}</div>
            <div className="text-xs text-purple-600 mt-1">Click to view</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Active Sprints</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{overallMetrics.activeSprints}</div>
            <div className="text-xs text-gray-600 mt-1">of {overallMetrics.totalSprints} total</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Avg Velocity</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{overallMetrics.avgVelocity}</div>
            <div className="text-xs text-gray-600 mt-1">points per day</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Healthy Projects</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{overallMetrics.healthyProjects}</div>
            <div className="text-xs text-gray-600 mt-1">of {overallMetrics.totalProjects} total</div>
          </div>
        </div>

        {/* Project List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <h3 className="font-semibold text-lg" style={{ color: '#000000' }}>Project Analysis</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`text-xs px-3 py-1 rounded ${
                  selectedFilter === 'all' 
                    ? 'text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
                style={selectedFilter === 'all' ? { backgroundColor: '#14213D' } : {}}
              >
                All ({projectAnalyses.length})
              </button>
              <button
                onClick={() => setSelectedFilter('critical')}
                className={`text-xs px-3 py-1 rounded ${
                  selectedFilter === 'critical' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Critical ({overallMetrics.criticalProjects})
              </button>
              <button
                onClick={() => setSelectedFilter('warning')}
                className={`text-xs px-3 py-1 rounded ${
                  selectedFilter === 'warning' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Warning ({overallMetrics.warningProjects})
              </button>
              <button
                onClick={() => setSelectedFilter('healthy')}
                className={`text-xs px-3 py-1 rounded ${
                  selectedFilter === 'healthy' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Healthy ({overallMetrics.healthyProjects})
              </button>
            </div>
          </div>

          {projectAnalyses
            .filter(p => selectedFilter === 'all' || p.status === selectedFilter)
            .map(project => (
              <div key={project.projectId} className={`rounded-lg border-2 p-4 ${getStatusColor(project.status)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(project.status)}
                      <span className="font-semibold text-lg">{project.projectName}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <Briefcase className="w-3 h-3 inline mr-1" />
                      {project.workspaceName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">Health Score</div>
                    <div className={`text-2xl font-bold ${getHealthColor(project.health)}`}>
                      {project.health}%
                    </div>
                  </div>
                </div>

                {/* Project Metrics */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-white bg-opacity-60 rounded p-2">
                    <div className="text-xs text-gray-600">Completion</div>
                    <div className="font-semibold">{project.completionPercentage}%</div>
                  </div>
                  <div className="bg-white bg-opacity-60 rounded p-2">
                    <div className="text-xs text-gray-600">Velocity</div>
                    <div className="font-semibold">{project.velocity} pts/day</div>
                  </div>
                  <div className="bg-white bg-opacity-60 rounded p-2">
                    <div className="text-xs text-gray-600">Blockers</div>
                    <div className={`font-semibold ${project.blockers > 0 ? 'text-red-600' : ''}`}>
                      {project.blockers}
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-60 rounded p-2">
                    <div className="text-xs text-gray-600">At-Risk Sprints</div>
                    <div className={`font-semibold ${project.atRiskSprints > 0 ? 'text-yellow-600' : ''}`}>
                      {project.atRiskSprints}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {project.recommendations.length > 0 && (
                  <div className="border-t border-current border-opacity-20 pt-3">
                    <div className="text-xs font-semibold mb-2">AI Recommendations:</div>
                    <div className="space-y-2">
                      {project.recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white bg-opacity-70 rounded p-2 flex items-start gap-2">
                          <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#FCA311' }} />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{rec.message}</div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

          {projectAnalyses.filter(p => selectedFilter === 'all' || p.status === selectedFilter).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No {selectedFilter} projects found</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Detail Modal */}
      {showDetailModal && detailModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[80vh] overflow-auto m-4" onClick={(e) => e.stopPropagation()}>
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
              {detailModalData.type === 'projects' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-sm text-gray-600 mb-1">Healthy</div>
                      <div className="text-3xl font-bold text-green-900">{detailModalData.metrics.healthyProjects}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="text-sm text-gray-600 mb-1">Warnings</div>
                      <div className="text-3xl font-bold text-yellow-900">{detailModalData.metrics.warningProjects}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="text-sm text-gray-600 mb-1">Critical</div>
                      <div className="text-3xl font-bold text-red-900">{detailModalData.metrics.criticalProjects}</div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-3">All Projects</h3>
                  {detailModalData.projects.map((project: ProjectAnalysis) => (
                    <div key={project.projectId} className={`rounded-lg border-2 p-4 mb-3 ${getStatusColor(project.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(project.status)}
                            <span className="font-semibold">{project.projectName}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{project.workspaceName}</div>
                        </div>
                        <span className={`text-xl font-bold ${getHealthColor(project.health)}`}>
                          {project.health}%
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Completion:</span>
                          <span className="font-semibold ml-1">{project.completionPercentage}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Velocity:</span>
                          <span className="font-semibold ml-1">{project.velocity}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Blockers:</span>
                          <span className="font-semibold ml-1">{project.blockers}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">At-Risk:</span>
                          <span className="font-semibold ml-1">{project.atRiskSprints}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(detailModalData.type === 'critical' || detailModalData.type === 'warnings') && (
                <div className="space-y-4">
                  <div className={`rounded-lg p-4 border mb-6 ${
                    detailModalData.type === 'critical' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {detailModalData.type === 'critical' ? (
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      )}
                      <div>
                        <div className="text-sm text-gray-600">Total {detailModalData.type === 'critical' ? 'Critical' : 'Warning'} Projects</div>
                        <div className={`text-3xl font-bold ${
                          detailModalData.type === 'critical' ? 'text-red-900' : 'text-yellow-900'
                        }`}>{detailModalData.count}</div>
                      </div>
                    </div>
                  </div>

                  {detailModalData.projects.map((project: ProjectAnalysis) => (
                    <div key={project.projectId} className={`rounded-lg border-2 p-4 mb-3 ${getStatusColor(project.status)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(project.status)}
                            <span className="font-semibold">{project.projectName}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{project.workspaceName}</div>
                        </div>
                        <span className={`text-xl font-bold ${getHealthColor(project.health)}`}>
                          {project.health}%
                        </span>
                      </div>
                      {project.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-semibold">Recommendations:</div>
                          {project.recommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white rounded p-2 text-sm flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-medium">{rec.message}</div>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(rec.priority)}`}>
                                {rec.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {detailModalData.type === 'blockers' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-6 h-6 text-purple-600" />
                      <div>
                        <div className="text-sm text-gray-600">Total Blockers Across All Projects</div>
                        <div className="text-3xl font-bold text-purple-900">{detailModalData.totalBlockers}</div>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-3">Projects with Blockers</h3>
                  {detailModalData.projects.map((project: ProjectAnalysis) => (
                    <div key={project.projectId} className="bg-purple-50 rounded-lg border-2 border-purple-200 p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-semibold">{project.projectName}</span>
                          <div className="text-xs text-gray-600 mt-1">{project.workspaceName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">Blockers</div>
                          <div className="text-xl font-bold text-purple-900">{project.blockers}</div>
                        </div>
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
