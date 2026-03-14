import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Sparkles, TrendingUp, Users, FolderKanban, CheckCircle2, 
  Clock, Zap, Target, Award, Brain, ArrowRight, Calendar,
  Activity, BarChart3, Rocket
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface DashboardHeaderProps {
  accessToken: string;
  userName?: string;
  workspaceCount: number;
  onQuickAction?: (action: string) => void;
}

export function DashboardHeader({ 
  accessToken, 
  userName = 'User',
  workspaceCount,
  onQuickAction 
}: DashboardHeaderProps) {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedToday: 0,
    activeSprints: 0,
    teamMembers: 0,
    productivity: 0
  });
  const [aiInsight, setAiInsight] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
    loadAIInsight();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/dashboard/stats`,
        {
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAIInsight = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/dashboard/insight`,
        {
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAiInsight(data.insight || '');
      }
    } catch (error) {
      console.error('Error loading AI insight:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getProductivityColor = () => {
    if (stats.productivity >= 80) return 'text-green-600';
    if (stats.productivity >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const quickActions = [
    { id: 'create', label: 'Create Workspace', icon: FolderKanban, color: 'blue' },
    { id: 'sprint', label: 'Start Sprint', icon: Rocket, color: 'cyan' },
    { id: 'team', label: 'Invite Team', icon: Users, color: 'blue' },
    { id: 'reports', label: 'View Reports', icon: BarChart3, color: 'green' }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Light Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-gray-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(99, 102, 241, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      {/* Floating Light Orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="relative px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-cyan-500 animate-pulse" />
              <span className="text-cyan-600 text-sm font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              {getGreeting()}, {userName}! 👋
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Welcome back to your AI-powered workspace. Here's what's happening today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {/* Workspaces */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group hover:border-blue-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <FolderKanban className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  <Badge className="bg-blue-100 text-blue-700 border-0">Active</Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{workspaceCount}</div>
                <div className="text-xs text-gray-600">Workspaces</div>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group hover:border-green-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 group-hover:text-green-600 transition-colors" />
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalTasks || 0}</div>
                <div className="text-xs text-gray-600">Total Tasks</div>
              </CardContent>
            </Card>

            {/* Completed Today */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group hover:border-emerald-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-5 h-5 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Today</Badge>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completedToday || 0}</div>
                <div className="text-xs text-gray-600">Completed</div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group hover:border-blue-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  <Activity className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.teamMembers || 0}</div>
                <div className="text-xs text-gray-600">Team Members</div>
              </CardContent>
            </Card>

            {/* Productivity Score */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group hover:border-yellow-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-yellow-500 group-hover:text-yellow-600 transition-colors" />
                  <Award className="w-4 h-4 text-yellow-500" />
                </div>
                <div className={`text-3xl font-bold text-gray-900 mb-1`}>
                  {stats.productivity || 85}%
                </div>
                <div className="text-xs text-gray-600">Productivity</div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insight & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* AI Insight Card */}
            <Card className="md:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-gray-900 text-base">AI-Powered Insight</CardTitle>
                    <CardDescription className="text-cyan-600 text-xs">Smart recommendations for today</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                  {loading ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="text-sm">Analyzing your workspace...</span>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {aiInsight || "Your team's velocity is up 15% this week! Consider creating a new sprint to maintain momentum. You have 3 high-priority tasks ready for assignment."}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => onQuickAction?.('ai-suggestions')}
                  >
                    <Sparkles className="w-3 h-3 mr-2" />
                    View All Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-900 text-base">Quick Actions</CardTitle>
                <CardDescription className="text-gray-600 text-xs">Get started instantly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => onQuickAction?.(action.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${
                        action.color === 'blue' ? 'bg-blue-100' :
                        action.color === 'cyan' ? 'bg-cyan-100' :
                        'bg-green-100'
                      } flex items-center justify-center transition-colors`}>
                        <action.icon className={`w-4 h-4 ${
                          action.color === 'blue' ? 'text-blue-600' :
                          action.color === 'cyan' ? 'text-cyan-600' :
                          'text-green-600'
                        }`} />
                      </div>
                      <span className="text-gray-900 text-sm font-medium">{action.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
