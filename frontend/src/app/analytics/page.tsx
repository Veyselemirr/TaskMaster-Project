'use client'

import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  BarChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  CheckSquare,
  Clock,
  AlertTriangle,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { TaskStatus, TaskPriority, TaskType } from '@/types/task'

// Mock analytics data
const analyticsData = {
  overview: {
    totalTasks: 156,
    completedTasks: 89,
    inProgressTasks: 32,
    overdueTasks: 12,
    completionRate: 57,
    averageCompletionTime: 4.2,
    productivityScore: 87
  },
  timeframeComparison: {
    thisWeek: { completed: 23, created: 18, overdue: 3 },
    lastWeek: { completed: 19, created: 21, overdue: 5 },
    thisMonth: { completed: 89, created: 78, overdue: 12 },
    lastMonth: { completed: 76, created: 82, overdue: 8 }
  },
  tasksByStatus: [
    { status: 'Completed', count: 89, percentage: 57, color: 'bg-success-500' },
    { status: 'In Progress', count: 32, percentage: 21, color: 'bg-primary-500' },
    { status: 'Todo', count: 23, percentage: 15, color: 'bg-neutral-400' },
    { status: 'Overdue', count: 12, percentage: 7, color: 'bg-error-500' }
  ],
  tasksByPriority: [
    { priority: 'Critical', count: 8, percentage: 5, color: 'bg-error-600' },
    { priority: 'High', count: 34, percentage: 22, color: 'bg-warning-500' },
    { priority: 'Medium', count: 78, percentage: 50, color: 'bg-primary-500' },
    { priority: 'Low', count: 36, percentage: 23, color: 'bg-neutral-400' }
  ],
  tasksByType: [
    { type: 'Feature', count: 56, percentage: 36 },
    { type: 'Bug', count: 32, percentage: 21 },
    { type: 'Task', count: 45, percentage: 29 },
    { type: 'Improvement', count: 23, percentage: 14 }
  ],
  projectProgress: [
    { name: 'TaskMaster App', total: 45, completed: 32, progress: 71 },
    { name: 'E-commerce Platform', total: 38, completed: 23, progress: 61 },
    { name: 'Mobile App Development', total: 29, completed: 18, progress: 62 },
    { name: 'Infrastructure Upgrade', total: 22, completed: 8, progress: 36 },
    { name: 'Security Audit', total: 22, completed: 8, progress: 36 }
  ],
  weeklyProgress: [
    { week: 'Week 1', completed: 15, created: 18 },
    { week: 'Week 2', completed: 22, created: 16 },
    { week: 'Week 3', completed: 19, created: 21 },
    { week: 'Week 4', completed: 23, created: 18 }
  ],
  teamPerformance: [
    { name: 'John Doe', completed: 23, assigned: 28, completionRate: 82 },
    { name: 'Sarah Wilson', completed: 18, assigned: 22, completionRate: 82 },
    { name: 'Mike Johnson', completed: 19, assigned: 25, completionRate: 76 },
    { name: 'Alex Chen', completed: 15, assigned: 21, completionRate: 71 },
    { name: 'David Kim', completed: 14, assigned: 18, completionRate: 78 }
  ]
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = React.useState('week')
  const [selectedMetric, setSelectedMetric] = React.useState('completion')

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    if (Math.abs(change) < 1) return { icon: Minus, color: 'text-neutral-500', text: '0%' }
    if (change > 0) return { icon: ArrowUp, color: 'text-success-600', text: `+${change.toFixed(1)}%` }
    return { icon: ArrowDown, color: 'text-error-600', text: `${change.toFixed(1)}%` }
  }

  const currentData = timeframe === 'week' 
    ? analyticsData.timeframeComparison.thisWeek 
    : analyticsData.timeframeComparison.thisMonth
  
  const previousData = timeframe === 'week' 
    ? analyticsData.timeframeComparison.lastWeek 
    : analyticsData.timeframeComparison.lastMonth

  const completedChange = getChangeIndicator(currentData.completed, previousData.completed)
  const createdChange = getChangeIndicator(currentData.created, previousData.created)
  const overdueChange = getChangeIndicator(currentData.overdue, previousData.overdue)

  const overviewStats = [
    {
      title: 'Total Tasks',
      value: analyticsData.overview.totalTasks,
      icon: CheckSquare,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      change: completedChange
    },
    {
      title: 'Completion Rate',
      value: `${analyticsData.overview.completionRate}%`,
      icon: Target,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      change: completedChange
    },
    {
      title: 'Avg. Completion',
      value: `${analyticsData.overview.averageCompletionTime} days`,
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
      change: completedChange
    },
    {
      title: 'Productivity Score',
      value: analyticsData.overview.productivityScore,
      icon: TrendingUp,
      color: 'text-info-600',
      bgColor: 'bg-info-100',
      change: completedChange
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart className="h-8 w-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-neutral-900">Analytics Dashboard</h1>
            </div>
            <p className="mt-1 text-neutral-600">
              Track your productivity and gain insights into your task management
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {overviewStats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                      <p className="text-2xl font-semibold text-neutral-900">{stat.value}</p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 ${stat.change.color}`}>
                    <stat.change.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{stat.change.text}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Task Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Task Status Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.tasksByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-4 w-4 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium text-neutral-700">{item.status}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-900 w-12 text-right">
                        {item.count}
                      </span>
                      <span className="text-sm text-neutral-500 w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Task Priority Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.tasksByPriority.map((item) => (
                  <div key={item.priority} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-4 w-4 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium text-neutral-700">{item.priority}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-900 w-12 text-right">
                        {item.count}
                      </span>
                      <span className="text-sm text-neutral-500 w-8 text-right">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Project Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.projectProgress.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-900">{project.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neutral-600">
                        {project.completed}/{project.total} tasks
                      </span>
                      <span className="text-sm font-semibold text-neutral-900">
                        {project.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-neutral-200 rounded-full">
                    <div 
                      className="h-2 bg-primary-500 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Team Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 text-sm font-medium text-neutral-500">Team Member</th>
                    <th className="text-right py-2 text-sm font-medium text-neutral-500">Completed</th>
                    <th className="text-right py-2 text-sm font-medium text-neutral-500">Assigned</th>
                    <th className="text-right py-2 text-sm font-medium text-neutral-500">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {analyticsData.teamPerformance.map((member) => (
                    <tr key={member.name} className="hover:bg-neutral-50">
                      <td className="py-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-neutral-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-sm text-neutral-900">{member.completed}</td>
                      <td className="py-3 text-right text-sm text-neutral-900">{member.assigned}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 bg-neutral-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-primary-500 rounded-full"
                              style={{ width: `${member.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-neutral-900 w-8">
                            {member.completionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Task Type Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Task Type Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {analyticsData.tasksByType.map((type) => (
                  <div key={type.type} className="text-center p-4 bg-neutral-50 rounded-lg">
                    <div className="text-2xl font-bold text-neutral-900">{type.count}</div>
                    <div className="text-sm text-neutral-600">{type.type}</div>
                    <div className="text-xs text-neutral-500 mt-1">{type.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Weekly Progress Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.weeklyProgress.map((week) => (
                  <div key={week.week} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">{week.week}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-success-500" />
                        <span className="text-sm text-neutral-600">{week.completed} completed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-primary-500" />
                        <span className="text-sm text-neutral-600">{week.created} created</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Insights */}
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary-900 mb-2">Productivity Insights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-primary-800">
                  <div>
                    <span className="font-medium">Best performing day:</span> Wednesday
                  </div>
                  <div>
                    <span className="font-medium">Most productive time:</span> 10 AM - 12 PM
                  </div>
                  <div>
                    <span className="font-medium">Avg. tasks per day:</span> 4.2 tasks
                  </div>
                  <div>
                    <span className="font-medium">Top category:</span> Feature Development
                  </div>
                  <div>
                    <span className="font-medium">Completion streak:</span> 7 days
                  </div>
                  <div>
                    <span className="font-medium">Time saved:</span> 2.5 hours/week
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}