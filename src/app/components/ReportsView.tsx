import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle, 
  Users, Target, Calendar, DollarSign, Activity, ArrowUp, ArrowDown,
  Zap, Timer, Award, X, BarChart3
} from 'lucide-react';

interface ReportsViewProps {
  workspaceId: string;
  workspaceName: string;
  workspaceType: string;
  accessToken: string;
  onClose: () => void;
}

const COLORS = ['#14213D', '#FCA311', '#737373', '#E5E5E5', '#000000', '#14213D'];

export function ReportsView({ 
  workspaceId, 
  workspaceName, 
  workspaceType, 
  accessToken,
  onClose 
}: ReportsViewProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading reports data
    setTimeout(() => setLoading(false), 500);
  }, []);

  // Mock data for different report types
  const scrumBurndownData = [
    { day: 'Day 1', remaining: 100, ideal: 100 },
    { day: 'Day 2', remaining: 85, ideal: 85 },
    { day: 'Day 3', remaining: 75, ideal: 70 },
    { day: 'Day 4', remaining: 60, ideal: 55 },
    { day: 'Day 5', remaining: 45, ideal: 40 },
    { day: 'Day 6', remaining: 30, ideal: 25 },
    { day: 'Day 7', remaining: 15, ideal: 10 },
    { day: 'Day 8', remaining: 5, ideal: 0 },
  ];

  const velocityData = [
    { sprint: 'Sprint 1', committed: 45, completed: 42 },
    { sprint: 'Sprint 2', committed: 50, completed: 48 },
    { sprint: 'Sprint 3', committed: 48, completed: 50 },
    { sprint: 'Sprint 4', committed: 52, completed: 49 },
    { sprint: 'Sprint 5', committed: 55, completed: 53 },
  ];

  const ticketVolumeData = [
    { date: 'Mon', created: 12, resolved: 8, pending: 4 },
    { date: 'Tue', created: 15, resolved: 10, pending: 5 },
    { date: 'Wed', created: 10, resolved: 14, pending: 6 },
    { date: 'Thu', created: 18, resolved: 12, pending: 8 },
    { date: 'Fri', created: 14, resolved: 16, pending: 7 },
    { date: 'Sat', created: 8, resolved: 6, pending: 3 },
    { date: 'Sun', created: 5, resolved: 4, pending: 2 },
  ];

  const priorityDistributionData = [
    { name: 'Critical', value: 8 },
    { name: 'High', value: 24 },
    { name: 'Medium', value: 45 },
    { name: 'Low', value: 23 },
  ];

  const kanbanMetricsData = [
    { week: 'Week 1', cycleTime: 4.2, throughput: 12 },
    { week: 'Week 2', cycleTime: 3.8, throughput: 15 },
    { week: 'Week 3', cycleTime: 4.5, throughput: 11 },
    { week: 'Week 4', cycleTime: 3.2, throughput: 18 },
  ];

  const businessMetricsData = [
    { month: 'Jan', budget: 50000, spent: 42000, roi: 125 },
    { month: 'Feb', budget: 50000, spent: 48000, roi: 132 },
    { month: 'Mar', budget: 50000, spent: 45000, roi: 145 },
    { month: 'Apr', budget: 50000, spent: 51000, roi: 138 },
  ];

  const resolutionTimeData = [
    { category: 'Bug Fix', avgTime: 2.4 },
    { category: 'Feature Request', avgTime: 5.2 },
    { category: 'Question', avgTime: 0.8 },
    { category: 'Incident', avgTime: 1.5 },
    { category: 'Change Request', avgTime: 4.1 },
  ];

  const renderScrumReports = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sprint Velocity</CardDescription>
            <CardTitle className="text-3xl">53</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <ArrowUp className="w-4 h-4 mr-1" />
              <span>+8% from last sprint</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completion Rate</CardDescription>
            <CardTitle className="text-3xl">96%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Above target</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sprint Progress</CardDescription>
            <CardTitle className="text-3xl">Day 6/10</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm" style={{ color: '#FCA311' }}>
              <Clock className="w-4 h-4 mr-1" />
              <span>On track</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Team Capacity</CardDescription>
            <CardTitle className="text-3xl">85%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-yellow-600">
              <Users className="w-4 h-4 mr-1" />
              <span>Optimal range</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sprint Burndown Chart</CardTitle>
            <CardDescription>Story points remaining vs. ideal burndown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scrumBurndownData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="remaining" stroke="#2563eb" strokeWidth={2} name="Actual" />
                <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" name="Ideal" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Velocity Trend</CardTitle>
            <CardDescription>Committed vs. completed story points per sprint</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sprint" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="committed" fill="#94a3b8" name="Committed" />
                <Bar dataKey="completed" fill="#2563eb" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderWorkdeskReports = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Resolution Time</CardDescription>
            <CardTitle className="text-3xl">2.3h</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <ArrowDown className="w-4 h-4 mr-1" />
              <span>-15% this week</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>SLA Compliance</CardDescription>
            <CardTitle className="text-3xl">94%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Within target</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open Tickets</CardDescription>
            <CardTitle className="text-3xl">42</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-yellow-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>12 high priority</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Customer Satisfaction</CardDescription>
            <CardTitle className="text-3xl">4.6/5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <Award className="w-4 h-4 mr-1" />
              <span>Excellent</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Volume Trend</CardTitle>
            <CardDescription>Created, resolved, and pending tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={ticketVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="created" stackId="1" stroke="#f59e0b" fill="#fbbf24" name="Created" />
                <Area type="monotone" dataKey="resolved" stackId="2" stroke="#10b981" fill="#34d399" name="Resolved" />
                <Area type="monotone" dataKey="pending" stackId="3" stroke="#ef4444" fill="#f87171" name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Tickets by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Resolution Time</CardTitle>
            <CardDescription>By ticket category (hours)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resolutionTimeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="avgTime" fill="#0891b2" name="Avg. Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SLA Performance</CardTitle>
            <CardDescription>Response and resolution metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">First Response Time</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">98%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Resolution Time</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">94%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">92%</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderKanbanReports = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cycle Time</CardDescription>
            <CardTitle className="text-3xl">3.2d</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <ArrowDown className="w-4 h-4 mr-1" />
              <span>-12% improvement</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Throughput</CardDescription>
            <CardTitle className="text-3xl">18</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>items/week</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>WIP Limit</CardDescription>
            <CardTitle className="text-3xl">8/10</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-blue-600">
              <Activity className="w-4 h-4 mr-1" />
              <span>Within limit</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lead Time</CardDescription>
            <CardTitle className="text-3xl">5.8d</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-yellow-600">
              <Timer className="w-4 h-4 mr-1" />
              <span>Average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cycle Time & Throughput</CardTitle>
            <CardDescription>Weekly flow metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kanbanMetricsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cycleTime" stroke="#2563eb" strokeWidth={2} name="Cycle Time (days)" />
                <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} name="Throughput" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative Flow Diagram</CardTitle>
            <CardDescription>Work in progress by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[
                { date: 'Week 1', todo: 15, inProgress: 8, review: 4, done: 23 },
                { date: 'Week 2', todo: 12, inProgress: 10, review: 5, done: 31 },
                { date: 'Week 3', todo: 10, inProgress: 9, review: 6, done: 40 },
                { date: 'Week 4', todo: 8, inProgress: 8, review: 4, done: 52 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="done" stackId="1" stroke="#10b981" fill="#34d399" name="Done" />
                <Area type="monotone" dataKey="review" stackId="1" stroke="#f59e0b" fill="#fbbf24" name="Review" />
                <Area type="monotone" dataKey="inProgress" stackId="1" stroke="#2563eb" fill="#60a5fa" name="In Progress" />
                <Area type="monotone" dataKey="todo" stackId="1" stroke="#94a3b8" fill="#cbd5e1" name="To Do" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTestReports = () => (
    <div className="space-y-6">
      {/* Test Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Test Cases</CardDescription>
            <CardTitle className="text-3xl">{metrics.totalTasks || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Across all test suites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pass Rate</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {metrics.totalTasks ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Tests passing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed Tests</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {Math.round((metrics.totalTasks || 0) * 0.15)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Test Coverage</CardDescription>
            <CardTitle className="text-3xl text-blue-600">82%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Code coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Execution Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Test Execution Trends</CardTitle>
          <CardDescription>Test pass/fail rates over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="Passed" stackId="1" stroke="#10b981" fill="#10b981" />
              <Area type="monotone" dataKey="Failed" stackId="1" stroke="#ef4444" fill="#ef4444" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Test Status and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Status Distribution</CardTitle>
            <CardDescription>Current test execution status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Priority Breakdown</CardTitle>
            <CardDescription>Tests by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Test Automation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Automated Tests</CardDescription>
            <CardTitle className="text-2xl">65%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Of total test suite</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Manual Tests</CardDescription>
            <CardTitle className="text-2xl">35%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Require manual execution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg. Execution Time</CardDescription>
            <CardTitle className="text-2xl">12m</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">Per test run</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderBusinessReports = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Project ROI</CardDescription>
            <CardTitle className="text-3xl">138%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Above target</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Budget Utilization</CardDescription>
            <CardTitle className="text-3xl">86%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-blue-600">
              <DollarSign className="w-4 h-4 mr-1" />
              <span>$172K / $200K</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Milestones Completed</CardDescription>
            <CardTitle className="text-3xl">8/12</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <Target className="w-4 h-4 mr-1" />
              <span>67% complete</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Timeline Status</CardDescription>
            <CardTitle className="text-3xl">On Track</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-green-600">
              <Calendar className="w-4 h-4 mr-1" />
              <span>3 months remaining</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs. Spending</CardTitle>
            <CardDescription>Monthly budget tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={businessMetricsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
                <Bar dataKey="spent" fill="#2563eb" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROI Trend</CardTitle>
            <CardDescription>Return on investment over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={businessMetricsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={2} name="ROI (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Timeline & Milestones</CardTitle>
            <CardDescription>Key deliverables and progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Project Kickoff', date: 'Jan 15', status: 'completed', progress: 100 },
                { name: 'Requirements Gathering', date: 'Feb 1', status: 'completed', progress: 100 },
                { name: 'Design Phase', date: 'Feb 28', status: 'completed', progress: 100 },
                { name: 'Development Sprint 1', date: 'Mar 15', status: 'completed', progress: 100 },
                { name: 'Development Sprint 2', date: 'Mar 30', status: 'in-progress', progress: 75 },
                { name: 'Testing & QA', date: 'Apr 15', status: 'pending', progress: 0 },
                { name: 'User Acceptance', date: 'Apr 30', status: 'pending', progress: 0 },
                { name: 'Production Deployment', date: 'May 15', status: 'pending', progress: 0 },
              ].map((milestone, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    milestone.status === 'completed' ? 'bg-green-500' : 
                    milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{milestone.name}</span>
                      <span className="text-xs text-gray-500">{milestone.date}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-auto" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <div className="text-white p-6 shadow-lg" style={{ background: 'linear-gradient(135deg, #14213D 0%, #1a2d52 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-8 h-8" style={{ color: '#FCA311' }} />
                <h1 className="text-3xl font-bold">{workspaceName} - Reports</h1>
                <Badge variant="secondary" className="border-0" style={{ backgroundColor: 'rgba(252, 163, 17, 0.2)', color: '#FCA311' }}>
                  {workspaceType.toUpperCase()}
                </Badge>
              </div>
              <p className="text-gray-300">Analytics and insights for your project</p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#FCA311' }}></div>
              <p className="text-gray-600">Loading reports...</p>
            </div>
          </div>
        ) : (
          <>
            {workspaceType === 'scrum' && renderScrumReports()}
            {workspaceType === 'workdesk' && renderWorkdeskReports()}
            {workspaceType === 'kanban' && renderKanbanReports()}
            {workspaceType === 'test' && renderTestReports()}
            {(workspaceType === 'business' || (!['scrum', 'workdesk', 'kanban', 'test'].includes(workspaceType))) && renderBusinessReports()}
          </>
        )}
      </div>
    </div>
  );
}