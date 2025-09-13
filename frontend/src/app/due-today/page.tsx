'use client'

import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Search, 
  Plus, 
  User, 
  Calendar,
  Clock,
  AlertCircle,
  CheckSquare,
  Flag,
  MoreVertical,
  Filter
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types/task'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'

// Mock tasks data - filtering for today's due date
const today = new Date()
today.setHours(23, 59, 59, 999) // End of today

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Implement user authentication system',
    description: 'Set up JWT-based authentication with login, register, and password reset functionality.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimatedHours: 8,
    actualHours: 5,
    progress: 60,
    dueDate: today,
    assignedToId: 1,
    assignedTo: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['auth', 'security', 'backend'],
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-09-11'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 5,
    title: 'Design user dashboard wireframes',
    description: 'Create comprehensive wireframes for the main dashboard including layout, navigation, and key widgets.',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    type: TaskType.TASK,
    estimatedHours: 4,
    actualHours: 0,
    progress: 0,
    dueDate: today,
    assignedToId: 4,
    assignedTo: { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'UI/UX Designer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['design', 'wireframes', 'dashboard'],
    createdAt: new Date('2024-09-09'),
    updatedAt: new Date('2024-09-10'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 8,
    title: 'Update project documentation',
    description: 'Review and update all project documentation including API docs, deployment guides, and user manuals.',
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    type: TaskType.TASK,
    estimatedHours: 6,
    actualHours: 0,
    progress: 0,
    dueDate: today,
    assignedToId: 2,
    assignedTo: { id: 2, name: 'John Doe', email: 'john@example.com', role: 'Lead Developer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['documentation', 'api', 'guides'],
    createdAt: new Date('2024-09-08'),
    updatedAt: new Date('2024-09-09'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 12,
    title: 'Mobile app testing on iOS',
    description: 'Comprehensive testing of mobile application on various iOS devices and versions.',
    status: TaskStatus.TESTING,
    priority: TaskPriority.HIGH,
    type: TaskType.BUG,
    estimatedHours: 3,
    actualHours: 2,
    progress: 75,
    dueDate: today,
    assignedToId: 6,
    assignedTo: { id: 6, name: 'Alex Chen', email: 'alex@example.com', role: 'Mobile Developer' },
    projectId: 3,
    project: { id: 3, name: 'Mobile App Development', status: 'ACTIVE' },
    tags: ['mobile', 'testing', 'ios'],
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-09-11'),
    createdById: 6,
    createdBy: { id: 6, name: 'Alex Chen', email: 'alex@example.com', role: 'Mobile Developer' }
  },
  {
    id: 15,
    title: 'Performance optimization review',
    description: 'Analyze application performance metrics and identify optimization opportunities.',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.CRITICAL,
    type: TaskType.IMPROVEMENT,
    estimatedHours: 5,
    actualHours: 3,
    progress: 40,
    dueDate: today,
    assignedToId: 3,
    assignedTo: { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Backend Developer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['performance', 'optimization', 'review'],
    createdAt: new Date('2024-09-09'),
    updatedAt: new Date('2024-09-11'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  }
]

export default function DueTodayPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')
  const [tasks, setTasks] = React.useState(mockTasks)

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL:
        return 'bg-error-100 text-error-800 border-error-200'
      case TaskPriority.HIGH:
        return 'bg-warning-100 text-warning-800 border-warning-200'
      case TaskPriority.MEDIUM:
        return 'bg-primary-100 text-primary-800 border-primary-200'
      case TaskPriority.LOW:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200'
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200'
      case TaskStatus.IN_PROGRESS:
        return 'bg-primary-100 text-primary-800 border-primary-200'
      case TaskStatus.REVIEW:
        return 'bg-warning-100 text-warning-800 border-warning-200'
      case TaskStatus.TESTING:
        return 'bg-info-100 text-info-800 border-info-200'
      case TaskStatus.DONE:
        return 'bg-success-100 text-success-800 border-success-200'
      case TaskStatus.BLOCKED:
        return 'bg-error-100 text-error-800 border-error-200'
    }
  }

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL:
      case TaskPriority.HIGH:
        return <Flag className="h-3 w-3 text-error-600" />
      case TaskPriority.MEDIUM:
        return <Flag className="h-3 w-3 text-warning-600" />
      default:
        return <Flag className="h-3 w-3 text-neutral-400" />
    }
  }

  const stats = [
    {
      name: 'Total Due Today',
      value: tasks.length,
      color: 'text-primary-600',
      icon: Clock
    },
    {
      name: 'High Priority',
      value: tasks.filter(t => t.priority === TaskPriority.HIGH || t.priority === TaskPriority.CRITICAL).length,
      color: 'text-error-600',
      icon: AlertCircle
    },
    {
      name: 'In Progress',
      value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      color: 'text-warning-600',
      icon: CheckSquare
    },
    {
      name: 'Completed',
      value: tasks.filter(t => t.status === TaskStatus.DONE).length,
      color: 'text-success-600',
      icon: CheckSquare
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Due Today</h1>
            <p className="mt-1 text-neutral-600">
              Tasks that are due today - {formatDate(today, 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
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
                      <dt className="text-sm font-medium text-neutral-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-2xl font-semibold text-neutral-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value={TaskStatus.TODO}>To Do</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.REVIEW}>In Review</option>
              <option value={TaskStatus.TESTING}>Testing</option>
              <option value={TaskStatus.DONE}>Done</option>
              <option value={TaskStatus.BLOCKED}>Blocked</option>
            </select>
          </div>
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All Priorities</option>
              <option value={TaskPriority.CRITICAL}>Critical</option>
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.LOW}>Low</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-warm-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link 
                          href={`/tasks/${task.id}`}
                          className="block hover:text-primary-600 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                            {task.title}
                          </h3>
                        </Link>
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge className={getPriorityColor(task.priority)} size="sm">
                            <div className="flex items-center space-x-1">
                              {getPriorityIcon(task.priority)}
                              <span>{task.priority}</span>
                            </div>
                          </Badge>
                          <Badge className={getStatusColor(task.status)} size="sm">
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {task.type}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                      {task.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-neutral-600">Progress</span>
                        <span className="font-semibold text-neutral-900">{task.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-neutral-200">
                        <div
                          className="h-2 rounded-full bg-primary-600 transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Task Meta Information */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        {task.assignedTo && (
                          <div className="flex items-center space-x-2">
                            <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-700">
                                {task.assignedTo.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-neutral-600">{task.assignedTo.name}</span>
                          </div>
                        )}
                        {task.project && (
                          <div className="flex items-center space-x-1">
                            <span className="text-neutral-400">•</span>
                            <span className="text-neutral-600">{task.project.name}</span>
                          </div>
                        )}
                        {task.estimatedHours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-neutral-400" />
                            <span className="text-neutral-600">{task.estimatedHours}h estimated</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 text-error-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Due Today</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-12 w-12 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No tasks due today</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Great! You have no tasks due today. Take a break or work ahead.'}
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Task
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  )
}