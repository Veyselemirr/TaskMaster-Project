'use client'

import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TaskCard } from '@/components/tasks/TaskCard'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Plus,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types/task'
import { getTaskStatusColor, formatDate } from '@/lib/utils'

// Mock data - Replace with real API calls
const mockTasks: Task[] = [
  {
    id: 1,
    title: "Implement user authentication system",
    description: "Create login/register functionality with JWT tokens and password reset",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimatedHours: 16,
    actualHours: 8,
    startDate: new Date('2024-01-15'),
    dueDate: new Date('2024-01-25'),
    completedAt: null,
    createdById: 1,
    assignedToId: 2,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['authentication', 'security', 'backend'],
    customFields: null,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
    assignedTo: { id: 2, email: 'john@example.com', name: 'John Doe' },
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 50,
    totalTimeSpent: 480,
    comments: [
      { id: 1, taskId: 1, content: 'Progress update', authorId: 2, createdAt: new Date(), updatedAt: new Date() }
    ]
  },
  {
    id: 2,
    title: "Fix responsive layout issues",
    description: "Mobile layout breaks on smaller screens",
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    type: TaskType.BUG,
    estimatedHours: 4,
    actualHours: null,
    startDate: null,
    dueDate: new Date('2024-01-22'),
    completedAt: null,
    createdById: 1,
    assignedToId: null,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['frontend', 'css', 'mobile'],
    customFields: null,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 0
  },
  {
    id: 3,
    title: "Setup CI/CD pipeline",
    description: "Configure automated testing and deployment",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    type: TaskType.IMPROVEMENT,
    estimatedHours: 8,
    actualHours: 10,
    startDate: new Date('2024-01-05'),
    dueDate: new Date('2024-01-15'),
    completedAt: new Date('2024-01-14'),
    createdById: 1,
    assignedToId: 3,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['devops', 'ci/cd', 'automation'],
    customFields: null,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-14'),
    assignedTo: { id: 3, email: 'jane@example.com', name: 'Jane Smith' },
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 100,
    totalTimeSpent: 600
  }
]

const stats = [
  {
    name: 'Total Tasks',
    value: '12',
    change: '+4',
    changeType: 'increase' as const,
    icon: CheckCircle,
    color: 'text-blue-600'
  },
  {
    name: 'In Progress',
    value: '5',
    change: '+2',
    changeType: 'increase' as const,
    icon: Clock,
    color: 'text-orange-600'
  },
  {
    name: 'Overdue',
    value: '2',
    change: '-1',
    changeType: 'decrease' as const,
    icon: AlertTriangle,
    color: 'text-red-600'
  },
  {
    name: 'Completed',
    value: '5',
    change: '+3',
    changeType: 'increase' as const,
    icon: TrendingUp,
    color: 'text-green-600'
  }
]

export default function DashboardPage() {
  const handleStatusChange = (taskId: number, status: TaskStatus) => {
    console.log(`Changing task ${taskId} to ${status}`)
    // Implement API call
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Welcome back! Here's what's happening with your tasks.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Recent Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>
                  Your most recently updated tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockTasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={handleStatusChange}
                    className="shadow-none border-0 border-b border-gray-200 rounded-none last:border-b-0"
                  />
                ))}
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    View All Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Overview */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Team Projects
                </Button>
              </CardContent>
            </Card>

            {/* Priority Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Priority Tasks</CardTitle>
                <CardDescription>
                  High priority items need attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockTasks
                  .filter(task => task.priority === TaskPriority.HIGH)
                  .slice(0, 3)
                  .map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Badge className={getTaskStatusColor(task.status)} size="sm">
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Due {task.dueDate ? formatDate(task.dueDate, 'MMM dd') : 'No due date'}
                        </p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}