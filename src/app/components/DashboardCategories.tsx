import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  FolderKanban, Plus, TrendingUp, FileText, LayoutDashboard, 
  BarChart3, Users
} from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  type?: string;
  createdAt: string;
}

interface DashboardCategoriesProps {
  workspaces: Workspace[];
  onWorkspaceClick: (workspaceId: string) => void;
  onReportClick: (workspace: Workspace) => void;
  onShowWorkspacesPanel: () => void;
  onShowArticlesPanel: () => void;
  onShowDashboardsView: () => void;
  onCreateWorkspace: () => void;
}

export function DashboardCategories({
  workspaces,
  onWorkspaceClick,
  onReportClick,
  onShowWorkspacesPanel,
  onShowArticlesPanel,
  onShowDashboardsView,
  onCreateWorkspace
}: DashboardCategoriesProps) {
  const regularWorkspaces = workspaces.filter(w => w.type !== 'workdesk');

  return (
    <div className="space-y-8">
      {/* Article Space Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" style={{ color: '#FCA311' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>Article Space</h2>
          </div>
          <Button
            onClick={onShowArticlesPanel}
            variant="outline"
            size="sm"
            className="text-white"
            style={{ backgroundColor: '#14213D' }}
          >
            View All Articles
          </Button>
        </div>
        
        <Card className="bg-white border-gray-200 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#14213D' }}>
                  <FileText className="w-6 h-6" style={{ color: '#FCA311' }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: '#000000' }}>Knowledge Base & Documentation</h3>
                  <p className="text-sm text-gray-600">Manage your articles, guides, and documentation</p>
                </div>
              </div>
              <Button
                onClick={onShowArticlesPanel}
                className="text-white"
                style={{ backgroundColor: '#14213D' }}
              >
                Open
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Recent Dashboard Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6" style={{ color: '#FCA311' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>Most Recent Dashboard</h2>
          </div>
          <Button
            onClick={onShowDashboardsView}
            variant="outline"
            size="sm"
            className="text-white"
            style={{ backgroundColor: '#14213D' }}
          >
            View All Dashboards
          </Button>
        </div>
        
        <Card className="bg-white border-gray-200 hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'rgba(20, 33, 61, 0.05)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#14213D' }}>
                  <FolderKanban className="w-5 h-5" style={{ color: '#FCA311' }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold" style={{ color: '#000000' }}>{workspaces.length}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'rgba(252, 163, 17, 0.05)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FCA311' }}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Tasks</p>
                  <p className="text-2xl font-bold" style={{ color: '#000000' }}>0</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'rgba(20, 33, 61, 0.05)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#14213D' }}>
                  <Users className="w-5 h-5" style={{ color: '#FCA311' }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold" style={{ color: '#000000' }}>1</p>
                </div>
              </div>
            </div>
            
            <Button
              onClick={onShowDashboardsView}
              className="w-full mt-4 text-white"
              style={{ backgroundColor: '#14213D' }}
            >
              Open Full Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reports Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" style={{ color: '#FCA311' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#000000' }}>Reports</h2>
          </div>
        </div>
        
        {workspaces.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Create a workspace to view reports</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => workspaces[0] && onReportClick(workspaces[0])}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#14213D' }}>
                    <TrendingUp className="w-6 h-6" style={{ color: '#FCA311' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#000000' }}>Performance Report</h3>
                    <p className="text-sm text-gray-600">Team productivity & velocity</p>
                  </div>
                </div>
                <Button
                  className="w-full text-white"
                  style={{ backgroundColor: '#14213D' }}
                >
                  View Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => workspaces[0] && onReportClick(workspaces[0])}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FCA311' }}>
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: '#000000' }}>Analytics Overview</h3>
                    <p className="text-sm text-gray-600">Comprehensive workspace insights</p>
                  </div>
                </div>
                <Button
                  className="w-full text-white"
                  style={{ backgroundColor: '#14213D' }}
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}