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
  AlertTriangle,
  CheckSquare,
  Flag,
  MoreVertical,
  Filter,
  Zap,
  ExclamationTriangle,
  Target,
  TrendingUp
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types/task'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'

// Mock high priority tasks data
const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Critical security vulnerability patch',
    description: 'Immediate fix required for SQL injection vulnerability discovered in authentication module. This affects all user accounts and requires urgent attention.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.CRITICAL,
    type: TaskType.BUG,
    estimatedHours: 6,
    actualHours: 4,
    progress: 75,
    dueDate: new Date('2024-09-14'), // Tomorrow
    assignedToId: 2,
    assignedTo: { id: 2, name: 'John Doe', email: 'john@example.com', role: 'Senior Developer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['security', 'sql-injection', 'urgent'],
    createdAt: new Date('2024-09-12'),
    updatedAt: new Date('2024-09-13'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 2,
    title: 'Production database backup failure',
    description: 'Production database backup system has failed for the past 3 days. Need to investigate and restore backup functionality immediately.',
    status: TaskStatus.TODO,
    priority: TaskPriority.CRITICAL,
    type: TaskType.BUG,
    estimatedHours: 4,
    actualHours: 0,
    progress: 0,
    dueDate: new Date('2024-09-13'), // Today
    assignedToId: 5,
    assignedTo: { id: 5, name: 'David Kim', email: 'david@example.com', role: 'DevOps Engineer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['database', 'backup', 'production'],
    createdAt: new Date('2024-09-12'),
    updatedAt: new Date('2024-09-12'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 3,
    title: 'API performance optimization',
    description: 'API response times have increased by 300% in the last week. Critical performance optimization needed to maintain service quality.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    type: TaskType.IMPROVEMENT,
    estimatedHours: 8,
    actualHours: 3,
    progress: 40,
    dueDate: new Date('2024-09-15'),
    assignedToId: 3,
    assignedTo: { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Backend Developer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['api', 'performance', 'optimization'],
    createdAt: new Date('2024-09-10'),
    updatedAt: new Date('2024-09-13'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 4,
    title: 'User authentication system revamp',
    description: 'Complete overhaul of the authentication system to implement OAuth 2.0, two-factor authentication, and improved security measures.',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimatedHours: 20,
    actualHours: 18,
    progress: 90,
    dueDate: new Date('2024-09-16'),
    assignedToId: 2,
    assignedTo: { id: 2, name: 'John Doe', email: 'john@example.com', role: 'Senior Developer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['auth', 'oauth', '2fa', 'security'],
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-12'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 5,
    title: 'Mobile app crash investigation',
    description: 'Critical crashes affecting 15% of mobile users. Need to identify root cause and deploy fix as soon as possible.',
    status: TaskStatus.BLOCKED,
    priority: TaskPriority.CRITICAL,
    type: TaskType.BUG,
    estimatedHours: 10,
    actualHours: 6,
    progress: 30,
    dueDate: new Date('2024-09-14'),
    assignedToId: 6,
    assignedTo: { id: 6, name: 'Alex Chen', email: 'alex@example.com', role: 'Mobile Developer' },
    projectId: 3,
    project: { id: 3, name: 'Mobile App Development', status: 'ACTIVE' },
    tags: ['mobile', 'crash', 'investigation'],
    createdAt: new Date('2024-09-11'),
    updatedAt: new Date('2024-09-13'),
    createdById: 6,
    createdBy: { id: 6, name: 'Alex Chen', email: 'alex@example.com', role: 'Mobile Developer' }
  },
  {
    id: 6,
    title: 'Payment gateway integration',
    description: 'Integrate new payment gateway to replace the deprecated one. High priority as current gateway support ends next week.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimatedHours: 12,
    actualHours: 8,
    progress: 65,
    dueDate: new Date('2024-09-18'),
    assignedToId: 7,
    assignedTo: { id: 7, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Full Stack Developer' },
    projectId: 2,
    project: { id: 2, name: 'E-commerce Platform', status: 'ACTIVE' },
    tags: ['payment', 'integration', 'gateway'],
    createdAt: new Date('2024-09-05'),
    updatedAt: new Date('2024-09-13'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 7,
    title: 'Data migration for new schema',
    description: 'Migrate 500K+ user records to new database schema. High priority to support new features launching next week.',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    type: TaskType.TASK,
    estimatedHours: 16,
    actualHours: 0,
    progress: 0,
    dueDate: new Date('2024-09-17'),
    assignedToId: 5,
    assignedTo: { id: 5, name: 'David Kim', email: 'david@example.com', role: 'DevOps Engineer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['migration', 'database', 'schema'],
    createdAt: new Date('2024-09-08'),
    updatedAt: new Date('2024-09-10'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 8,
    title: 'Load balancer configuration',
    description: 'Configure load balancer for high traffic handling. Critical for upcoming product launch expected to increase traffic by 500%.',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.CRITICAL,
    type: TaskType.INFRASTRUCTURE,
    estimatedHours: 6,
    actualHours: 5,
    progress: 85,
    dueDate: new Date('2024-09-15'),
    assignedToId: 5,
    assignedTo: { id: 5, name: 'David Kim', email: 'david@example.com', role: 'DevOps Engineer' },
    projectId: 4,
    project: { id: 4, name: 'Infrastructure Upgrade', status: 'ACTIVE' },
    tags: ['load-balancer', 'infrastructure', 'scaling'],
    createdAt: new Date('2024-09-07'),
    updatedAt: new Date('2024-09-12'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  }
]

export default function HighPriorityPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<string>('priority')
  const [tasks, setTasks] = React.useState(mockTasks)

  const filteredAndSortedTasks = React.useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
        case 'due-date':
          return a.dueDate.getTime() - b.dueDate.getTime()
        case 'progress':
          return a.progress - b.progress // Least progress first
        default:
          return 0
      }
    })

    return filtered
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy])

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getDueDateColor = (dueDate: Date) => {
    const daysUntil = getDaysUntilDue(dueDate)
    if (daysUntil < 0) return 'text-error-600 bg-error-100'
    if (daysUntil <= 1) return 'text-warning-600 bg-warning-100'
    if (daysUntil <= 3) return 'text-orange-600 bg-orange-100'
    return 'text-neutral-600 bg-neutral-100'
  }

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
        return <Zap className="h-3 w-3 text-error-600" />
      case TaskPriority.HIGH:
        return <Flag className="h-3 w-3 text-warning-600" />
      default:
        return <Flag className="h-3 w-3 text-neutral-400" />
    }
  }

  const criticalTasks = tasks.filter(t => t.priority === TaskPriority.CRITICAL)
  const highTasks = tasks.filter(t => t.priority === TaskPriority.HIGH)
  const blockedTasks = tasks.filter(t => t.status === TaskStatus.BLOCKED)
  const dueSoonTasks = tasks.filter(t => getDaysUntilDue(t.dueDate) <= 2)

  const stats = [
    {
      name: 'Critical Priority',
      value: criticalTasks.length,
      color: 'text-error-600',
      icon: Zap,
      description: 'Require immediate attention'
    },
    {
      name: 'High Priority',
      value: highTasks.length,
      color: 'text-warning-600',
      icon: Flag,
      description: 'Important tasks to complete'
    },
    {
      name: 'Blocked Tasks',
      value: blockedTasks.length,
      color: 'text-error-600',
      icon: ExclamationTriangle,
      description: 'Need unblocking to proceed'
    },
    {
      name: 'Due Soon',
      value: dueSoonTasks.length,
      color: 'text-orange-600',
      icon: Clock,
      description: 'Due within 2 days'
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-warning-600" />
              <h1 className="text-3xl font-bold text-neutral-900">High Priority Tasks</h1>
            </div>
            <p className="mt-1 text-neutral-600">
              Critical and high-priority tasks that need your immediate focus
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Critical Alert */}
        {criticalTasks.length > 0 && (
          <Card className="border-error-200 bg-error-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-error-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-error-900">
                    {criticalTasks.length} critical task{criticalTasks.length !== 1 ? 's' : ''} require immediate attention
                  </h3>
                  <p className="text-sm text-error-700 mt-1">
                    These tasks are blocking progress and need to be resolved urgently.
                  </p>
                </div>
                <Button size="sm" className="bg-error-600 hover:bg-error-700 text-white">
                  View Critical
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <stat.icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
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
                </div>
                <p className="text-xs text-neutral-600 mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search, Filters, and Sort */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search high priority tasks..."
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
              <option value={TaskPriority.CRITICAL}>Critical Only</option>
              <option value={TaskPriority.HIGH}>High Only</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="priority">Priority Level</option>
              <option value="due-date">Due Date</option>
              <option value="progress">Progress</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredAndSortedTasks.map((task) => {
            const daysUntilDue = getDaysUntilDue(task.dueDate)
            const isPastDue = daysUntilDue < 0
            
            return (
              <Card 
                key={task.id} 
                className={`hover:shadow-warm-lg transition-shadow border-l-4 ${
                  task.priority === TaskPriority.CRITICAL 
                    ? 'border-l-error-500' 
                    : 'border-l-warning-500'
                }`}
              >
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
                            <Badge className={getDueDateColor(task.dueDate)} size="sm">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {isPastDue 
                                    ? `${Math.abs(daysUntilDue)} days overdue`
                                    : daysUntilDue === 0
                                    ? 'Due today'
                                    : daysUntilDue === 1
                                    ? 'Due tomorrow'
                                    : `Due in ${daysUntilDue} days`
                                  }
                                </span>
                              </div>
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
                            className={`h-2 rounded-full transition-all duration-300 ${
                              task.progress >= 75 
                                ? 'bg-success-600' 
                                : task.progress >= 50 
                                ? 'bg-primary-600' 
                                : 'bg-warning-500'
                            }`}
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
                              <TrendingUp className="h-4 w-4 text-neutral-400" />
                              <span className="text-neutral-600">{task.estimatedHours}h estimated</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-1 text-neutral-600">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            Due {formatDate(task.dueDate, 'MMM dd, yyyy')}
                          </span>
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
            )
          })}
        </div>

        {/* Empty State */}
        {filteredAndSortedTasks.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mb-4">
              <CheckSquare className="h-12 w-12 text-success-600" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No high priority tasks found</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Great! No high priority tasks at the moment. Keep up the excellent work!'}
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