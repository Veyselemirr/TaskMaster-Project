'use client'

import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { TaskCard } from '@/components/tasks/TaskCard'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'
import { 
  Search, 
  Filter, 
  Plus, 
  Grid3X3, 
  List,
  Calendar,
  Users,
  Clock,
  CheckSquare,
  AlertTriangle,
  MoreVertical
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types/task'
import { getTaskStatusColor } from '@/lib/utils'

// Enhanced mock data - daha fazla task
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
    progress: 65,
    totalTimeSpent: 480,
    comments: [
      { id: 1, taskId: 1, content: 'Progress update', authorId: 2, createdAt: new Date(), updatedAt: new Date() }
    ]
  },
  {
    id: 2,
    title: "Fix responsive layout issues",
    description: "Mobile layout breaks on smaller screens, need to fix CSS grid issues",
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
    description: "Configure automated testing and deployment using GitHub Actions",
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
  },
  {
    id: 4,
    title: "Design user dashboard wireframes",
    description: "Create wireframes for the new user dashboard layout",
    status: TaskStatus.REVIEW,
    priority: TaskPriority.MEDIUM,
    type: TaskType.TASK,
    estimatedHours: 6,
    actualHours: 5,
    startDate: new Date('2024-01-12'),
    dueDate: new Date('2024-01-20'),
    completedAt: null,
    createdById: 1,
    assignedToId: 4,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['design', 'wireframes', 'ux'],
    customFields: null,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
    assignedTo: { id: 4, email: 'design@example.com', name: 'Sarah Wilson' },
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 85
  },
  {
    id: 5,
    title: "Database optimization",
    description: "Optimize database queries and add proper indexing",
    status: TaskStatus.BLOCKED,
    priority: TaskPriority.CRITICAL,
    type: TaskType.IMPROVEMENT,
    estimatedHours: 12,
    actualHours: 3,
    startDate: new Date('2024-01-16'),
    dueDate: new Date('2024-01-28'),
    completedAt: null,
    createdById: 1,
    assignedToId: 2,
    projectId: 1,
    parentTaskId: null,
    isArchived: false,
    tags: ['database', 'performance', 'backend'],
    customFields: null,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-21'),
    assignedTo: { id: 2, email: 'john@example.com', name: 'John Doe' },
    createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
    project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
    progress: 25
  }
]

// Moved inside component to make it dynamic

const priorityOptions = [
  { value: 'all', label: 'All Priority' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedFilter, setSelectedFilter] = React.useState('all')
  const [selectedPriority, setSelectedPriority] = React.useState('all')
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list')
  const [showFilters, setShowFilters] = React.useState(false)
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [tasks, setTasks] = React.useState(mockTasks)

  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: tasks.length },
    { value: 'todo', label: 'To Do', count: tasks.filter(t => t.status === TaskStatus.TODO).length },
    { value: 'in-progress', label: 'In Progress', count: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length },
    { value: 'review', label: 'In Review', count: tasks.filter(t => t.status === TaskStatus.REVIEW).length },
    { value: 'done', label: 'Done', count: tasks.filter(t => t.status === TaskStatus.DONE).length },
    { value: 'blocked', label: 'Blocked', count: tasks.filter(t => t.status === TaskStatus.BLOCKED).length },
  ]

  const handleStatusChange = (taskId: number, status: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status, updatedAt: new Date() } : task
    ))
    console.log(`Changing task ${taskId} to ${status}`)
    // Implement API call
  }

  const handleCreateTask = (taskData: any) => {
    const newTask = {
      ...taskData,
      id: Math.max(...tasks.map(t => t.id)) + 1,
      createdById: 1,
      createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
      assignedTo: taskData.assignedToId ? { 
        id: taskData.assignedToId, 
        email: `user${taskData.assignedToId}@example.com`, 
        name: `User ${taskData.assignedToId}` 
      } : null,
      project: taskData.projectId ? { 
        id: taskData.projectId, 
        name: 'TaskMaster App', 
        status: 'ACTIVE' 
      } : null,
      isArchived: false,
      actualHours: null,
      startDate: null,
      completedAt: null,
      totalTimeSpent: 0,
      comments: [],
      attachments: []
    }
    
    setTasks(prev => [newTask, ...prev])
    console.log('Created new task:', newTask)
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedFilter === 'all' || task.status.toLowerCase().replace('_', '-') === selectedFilter
    
    const matchesPriority = selectedPriority === 'all' || task.priority.toLowerCase() === selectedPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">My Tasks</h1>
            <p className="mt-1 text-neutral-600">
              Manage and track your tasks across all projects
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Search and Quick Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="w-full"
            />
          </div>
          
          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                  <CheckSquare className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Total Tasks</p>
                  <p className="text-xl font-semibold text-neutral-900">{tasks.length}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-100">
                  <Clock className="h-5 w-5 text-warning-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">In Progress</p>
                  <p className="text-xl font-semibold text-neutral-900">
                    {tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Filters Row */}
        {showFilters && (
          <Card className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {filterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Priority</label>
                <select 
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Project</label>
                <select className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                  <option value="all">All Projects</option>
                  <option value="taskmaster">TaskMaster App</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">View</label>
                <div className="flex rounded-lg border border-neutral-300 p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center justify-center rounded px-3 py-1 text-sm font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <List className="h-4 w-4 mr-1" />
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center justify-center rounded px-3 py-1 text-sm font-medium transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-primary-100 text-primary-700' 
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    Grid
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedFilter(option.value)}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedFilter === option.value
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <span>{option.label}</span>
              <Badge variant="default" size="sm">
                {option.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* Tasks List/Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-600">Sort by:</span>
              <select className="rounded border border-neutral-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none">
                <option value="updated">Last Updated</option>
                <option value="created">Created Date</option>
                <option value="due">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          {/* Tasks Display */}
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          {filteredTasks.length === 0 && (
            <Card className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <CheckSquare className="h-12 w-12 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No tasks found</h3>
              <p className="text-neutral-600 mb-6">
                {searchQuery || selectedFilter !== 'all' || selectedPriority !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first task.'}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </Card>
          )}
        </div>

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      </div>
    </Layout>
  )
}