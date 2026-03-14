import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CheckCircle2, Clock, User, FolderKanban, 
  TrendingUp, AlertCircle, Plus, Edit
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface RecentActivityProps {
  accessToken: string;
}

interface Activity {
  id: string;
  type: string;
  action: string;
  title: string;
  workspace: string;
  timestamp: string;
  user: string;
}

export function RecentActivity({ accessToken }: RecentActivityProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3acdc7c6/dashboard/activity`,
        {
          headers: {
            'X-Access-Token': accessToken,
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" style={{ color: '#28a745' }} />;
      case 'updated':
        return <Edit className="w-4 h-4" style={{ color: '#FCA311' }} />;
      case 'created':
        return <Plus className="w-4 h-4" style={{ color: '#14213D' }} />;
      default:
        return <Clock className="w-4 h-4" style={{ color: '#737373' }} />;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'updated':
        return 'border-2';
      case 'created':
        return 'border-2';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getActivityBorderColor = (action: string) => {
    switch (action) {
      case 'updated':
        return { borderColor: 'rgba(252, 163, 17, 0.3)', backgroundColor: 'rgba(252, 163, 17, 0.05)' };
      case 'created':
        return { borderColor: 'rgba(20, 33, 61, 0.3)', backgroundColor: 'rgba(20, 33, 61, 0.05)' };
      default:
        return {};
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription>Your team's latest updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1">
              Activity will appear here as your team works
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base" style={{ color: '#000000' }}>Recent Activity</CardTitle>
            <CardDescription>Your team's latest updates</CardDescription>
          </div>
          <Badge variant="secondary" className="text-white" style={{ backgroundColor: '#14213D' }}>
            {activities.length} updates
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${getActivityColor(activity.action)}`}
              style={getActivityBorderColor(activity.action)}
            >
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                {getActivityIcon(activity.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{activity.user}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <FolderKanban className="w-3 h-3" />
                    <span className="truncate">{activity.workspace}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              </div>

              <Badge 
                variant="secondary" 
                className="flex-shrink-0 text-xs capitalize"
              >
                {activity.action}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}