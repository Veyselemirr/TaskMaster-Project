'use client'

import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { 
  Search, 
  Archive,
  RotateCcw,
  Trash2,
  Calendar,
  Clock,
  CheckSquare,
  Flag,
  MoreVertical,
  Filter,
  Download,
  Eye,
  FileText,
  Folder,
  User
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types/task'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'

// Mock archived tasks data
const mockArchivedTasks: Task[] = [
  {
    id: 101,
    title: 'User authentication system v1',
    description: 'Initial implementation of user login and registration system with basic JWT authentication.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimatedHours: 20,
    actualHours: 24,
    progress: 100,
    dueDate: new Date('2024-08-15'),
    completedAt: new Date('2024-08-14'),
    assignedToId: 2,
    assignedTo: { id: 2, name: 'John Doe', email: 'john@example.com', role: 'Senior Developer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['auth', 'authentication', 'jwt'],
    isArchived: true,
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-08-20'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 102,
    title: 'Database schema design v1',
    description: 'Initial database design for tasks, users, projects, and comments with proper relationships.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    type: TaskType.TASK,
    estimatedHours: 12,
    actualHours: 14,
    progress: 100,
    dueDate: new Date('2024-07-30'),
    completedAt: new Date('2024-07-28'),
    assignedToId: 3,
    assignedTo: { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Backend Developer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['database', 'schema', 'design'],
    isArchived: true,
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-08-05'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 103,
    title: 'Initial UI wireframes',
    description: 'Create wireframes for main application screens including dashboard, task lists, and user profile.',
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    type: TaskType.TASK,
    estimatedHours: 8,
    actualHours: 10,
    progress: 100,
    dueDate: new Date('2024-07-25'),
    completedAt: new Date('2024-07-23'),
    assignedToId: 4,
    assignedTo: { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'UI/UX Designer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['wireframes', 'ui', 'design'],
    isArchived: true,
    createdAt: new Date('2024-07-10'),
    updatedAt: new Date('2024-07-30'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 104,
    title: 'Legacy system migration',
    description: 'Migrate data from old project management system to the new TaskMaster application.',
    status: TaskStatus.DONE,
    priority: TaskPriority.CRITICAL,
    type: TaskType.IMPROVEMENT,
    estimatedHours: 30,
    actualHours: 35,
    progress: 100,
    dueDate: new Date('2024-08-05'),
    completedAt: new Date('2024-08-03'),
    assignedToId: 5,
    assignedTo: { id: 5, name: 'David Kim', email: 'david@example.com', role: 'DevOps Engineer' },
    projectId: 5,
    project: { id: 5, name: 'System Migration', status: 'COMPLETED' },
    tags: ['migration', 'legacy', 'data'],
    isArchived: true,
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-08-10'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 105,
    title: 'API documentation v1',
    description: 'Create comprehensive API documentation for all endpoints with examples and authentication details.',
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    type: TaskType.TASK,
    estimatedHours: 16,
    actualHours: 18,
    progress: 100,
    dueDate: new Date('2024-08-20'),
    completedAt: new Date('2024-08-19'),
    assignedToId: 6,
    assignedTo: { id: 6, name: 'Emma Brown', email: 'emma@example.com', role: 'Technical Writer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['documentation', 'api', 'technical-writing'],
    isArchived: true,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-25'),
    createdById: 1,
    createdBy: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'Full Stack Developer' }
  },
  {
    id: 106,
    title: 'Performance bottleneck investigation',
    description: 'Investigate and fix performance issues in the task loading functionality.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    type: TaskType.BUG,
    estimatedHours: 6,
    actualHours: 8,
    progress: 100,
    dueDate: new Date('2024-08-10'),
    completedAt: new Date('2024-08-08'),
    assignedToId: 3,
    assignedTo: { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Backend Developer' },
    projectId: 1,
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    tags: ['performance', 'optimization', 'investigation'],
    isArchived: true,
    createdAt: new Date('2024-08-05'),
    updatedAt: new Date('2024-08-12'),
    createdById: 2,
    createdBy: { id: 2, name: 'John Doe', email: 'john@example.com', role: 'Senior Developer' }
  }
]

export default function ArchivePage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all')
  const [projectFilter, setProjectFilter] = React.useState<string>('all')
  const [dateRange, setDateRange] = React.useState<string>('all')
  const [sortBy, setSortBy] = React.useState<string>('archived-date')
  const [selectedTasks, setSelectedTasks] = React.useState<number[]>([])
  const [tasks, setTasks] = React.useState(mockArchivedTasks)

  const filteredAndSortedTasks = React.useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      const matchesProject = projectFilter === 'all' || task.project?.name === projectFilter
      
      // Date range filter
      let matchesDateRange = true
      if (dateRange !== 'all' && task.completedAt) {
        const now = new Date()
        const completedDate = new Date(task.completedAt)
        const daysDiff = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (dateRange) {
          case 'week':
            matchesDateRange = daysDiff <= 7
            break
          case 'month':
            matchesDateRange = daysDiff <= 30
            break
          case 'quarter':
            matchesDateRange = daysDiff <= 90
            break
        }
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesDateRange
    })

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'archived-date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'completed-date':
          if (!a.completedAt || !b.completedAt) return 0
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        case 'priority':
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return filtered
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, dateRange, sortBy])

  const handleSelectTask = (taskId: number) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleSelectAll = () => {
    if (selectedTasks.length === filteredAndSortedTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredAndSortedTasks.map(task => task.id))
    }
  }

  const handleRestoreTasks = () => {
    // Implementation for restoring tasks from archive
    console.log('Restoring tasks:', selectedTasks)
    setSelectedTasks([])
  }

  const handleDeleteTasks = () => {
    // Implementation for permanently deleting tasks
    console.log('Deleting tasks:', selectedTasks)
    setSelectedTasks([])
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

  const getPriorityIcon = (priority: TaskPriority) => {
    return <Flag className="h-3 w-3" />
  }

  const projects = Array.from(new Set(tasks.map(t => t.project?.name).filter(Boolean)))

  const stats = [
    {
      name: 'Total Archived',
      value: tasks.length,
      icon: Archive,
      color: 'text-neutral-600'
    },
    {
      name: 'Completed Tasks',
      value: tasks.filter(t => t.status === TaskStatus.DONE).length,
      icon: CheckSquare,
      color: 'text-success-600'
    },
    {
      name: 'This Month',
      value: tasks.filter(t => {
        if (!t.completedAt) return false
        const now = new Date()
        const completed = new Date(t.completedAt)
        return completed.getMonth() === now.getMonth() && completed.getFullYear() === now.getFullYear()
      }).length,
      icon: Calendar,
      color: 'text-primary-600'
    },
    {
      name: 'Avg. Duration',
      value: `${Math.round(tasks.reduce((acc, t) => acc + (t.actualHours || 0), 0) / tasks.length)}h`,
      icon: Clock,
      color: 'text-info-600'
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <div className="flex items-center space-x-2">
              <Archive className="h-8 w-8 text-neutral-600" />
              <h1 className="text-3xl font-bold text-neutral-900">Archived Tasks</h1>
            </div>
            <p className="mt-1 text-neutral-600">
              View and manage your completed and archived tasks
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedTasks.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={handleRestoreTasks}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restore ({selectedTasks.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteTasks} className="text-error-600 border-error-300 hover:bg-error-50">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedTasks.length})
                </Button>
              </>
            )}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
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

        {/* Advanced Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div>
                <Input
                  placeholder="Search archived tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
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
              <div>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Projects</option>
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                </select>
              </div>
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="archived-date">Archived Date</option>
                  <option value="completed-date">Completed Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedTasks.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>Select All</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Showing {filteredAndSortedTasks.length} of {tasks.length} archived tasks
            </p>
            <div className="text-sm text-neutral-600">
              {selectedTasks.length > 0 && `${selectedTasks.length} selected`}
            </div>
          </div>

          {filteredAndSortedTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleSelectTask(task.id)}
                    className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Archive className="h-4 w-4 text-neutral-400" />
                          <h3 className="text-lg font-semibold text-neutral-900">
                            {task.title}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge className={getPriorityColor(task.priority)} size="sm">
                            <div className="flex items-center space-x-1">
                              {getPriorityIcon(task.priority)}
                              <span>{task.priority}</span>
                            </div>
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {task.type}
                          </Badge>
                          <Badge className="bg-success-100 text-success-800 border-success-200" size="sm">
                            Completed
                          </Badge>
                          {task.completedAt && (
                            <span className="text-xs text-neutral-500">
                              Completed {formatRelativeDate(task.completedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                      {task.description}
                    </p>

                    {/* Task Meta Information */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        {task.assignedTo && (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-neutral-400" />
                            <span className="text-neutral-600">{task.assignedTo.name}</span>
                          </div>
                        )}
                        {task.project && (
                          <div className="flex items-center space-x-1">
                            <Folder className="h-4 w-4 text-neutral-400" />
                            <span className="text-neutral-600">{task.project.name}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-neutral-400" />
                          <span className="text-neutral-600">{task.actualHours}h spent</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-neutral-500">
                        <span>Due: {formatDate(task.dueDate, 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span>Archived: {formatDate(task.updatedAt, 'MMM dd, yyyy')}</span>
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
        {filteredAndSortedTasks.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Archive className="h-12 w-12 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No archived tasks found</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery || priorityFilter !== 'all' || projectFilter !== 'all' || dateRange !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Completed tasks will appear here once they are archived.'}
            </p>
          </Card>
        )}
      </div>
    </Layout>
  )
}