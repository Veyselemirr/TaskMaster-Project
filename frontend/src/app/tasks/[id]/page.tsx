'use client'

import React from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Paperclip,
  Tag,
  Edit3,
  Save,
  X,
  Plus,
  MoreVertical,
  CheckCircle2,
  Play,
  Pause,
  Archive,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority, TaskType } from '@/types/task'
import { 
  getTaskStatusColor, 
  getTaskPriorityColor,
  getTaskTypeColor,
  formatDate,
  formatRelativeDate,
  formatMinutesToHours
} from '@/lib/utils'
import Link from 'next/link'

// Mock task data - normalde ID'ye göre API'den gelecek
const mockTask: Task = {
  id: 1,
  title: "Implement user authentication system",
  description: "Create a comprehensive login/register functionality with JWT tokens, password reset, email verification, and two-factor authentication support. This includes both frontend forms and backend API endpoints.",
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
  tags: ['authentication', 'security', 'backend', 'frontend', 'jwt'],
  customFields: {
    "Epic": "User Management",
    "Story Points": "8",
    "Sprint": "Sprint 3"
  },
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-20'),
  assignedTo: { id: 2, email: 'john@example.com', name: 'John Doe' },
  createdBy: { id: 1, email: 'admin@example.com', name: 'Admin' },
  project: { id: 1, name: 'TaskMaster App', status: 'ACTIVE' },
  progress: 65,
  totalTimeSpent: 480,
  comments: [
    { 
      id: 1, 
      taskId: 1, 
      content: 'Started working on the JWT implementation. Basic login endpoint is ready.', 
      authorId: 2, 
      createdAt: new Date('2024-01-16'), 
      updatedAt: new Date('2024-01-16'),
      author: { id: 2, name: 'John Doe', email: 'john@example.com' }
    },
    { 
      id: 2, 
      taskId: 1, 
      content: 'Added password hashing and validation. Working on email verification next.', 
      authorId: 2, 
      createdAt: new Date('2024-01-18'), 
      updatedAt: new Date('2024-01-18'),
      author: { id: 2, name: 'John Doe', email: 'john@example.com' }
    },
    { 
      id: 3, 
      taskId: 1, 
      content: 'Please add input validation on the frontend forms as well.', 
      authorId: 1, 
      createdAt: new Date('2024-01-19'), 
      updatedAt: new Date('2024-01-19'),
      author: { id: 1, name: 'Admin', email: 'admin@example.com' }
    }
  ],
  attachments: [
    { id: 1, name: 'auth-flow-diagram.png', size: 245000, url: '/attachments/auth-flow.png' },
    { id: 2, name: 'api-spec.md', size: 12500, url: '/attachments/api-spec.md' }
  ]
}

const statusOptions = [
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.REVIEW, label: 'In Review' },
  { value: TaskStatus.TESTING, label: 'Testing' },
  { value: TaskStatus.DONE, label: 'Done' },
  { value: TaskStatus.BLOCKED, label: 'Blocked' },
  { value: TaskStatus.CANCELLED, label: 'Cancelled' }
]

interface TaskDetailPageProps {
  params: { id: string }
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const [task, setTask] = React.useState<Task>(mockTask)
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(task.title)
  const [editedDescription, setEditedDescription] = React.useState(task.description)
  const [newComment, setNewComment] = React.useState('')
  const [isSubmittingComment, setIsSubmittingComment] = React.useState(false)

  const handleStatusChange = (newStatus: TaskStatus) => {
    setTask(prev => ({ ...prev, status: newStatus }))
    // API call would go here
    console.log(`Changing task ${task.id} status to ${newStatus}`)
  }

  const handleSaveEdit = () => {
    setTask(prev => ({ 
      ...prev, 
      title: editedTitle, 
      description: editedDescription,
      updatedAt: new Date()
    }))
    setIsEditing(false)
    // API call would go here
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    setIsSubmittingComment(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const comment = {
      id: Date.now(),
      taskId: task.id,
      content: newComment,
      authorId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: 1, name: 'Current User', email: 'current@example.com' }
    }
    
    setTask(prev => ({
      ...prev,
      comments: [...(prev.comments || []), comment]
    }))
    
    setNewComment('')
    setIsSubmittingComment(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/tasks">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tasks
              </Button>
            </Link>
            <div className="h-6 w-px bg-neutral-300" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Task #{task.id}</h1>
              <p className="text-sm text-neutral-600">
                Created {formatRelativeDate(task.createdAt)} • Updated {formatRelativeDate(task.updatedAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </Button>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Title & Description */}
            <Card>
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-lg font-semibold"
                    />
                    <textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={6}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveEdit} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false)
                          setEditedTitle(task.title)
                          setEditedDescription(task.description)
                        }}
                        size="sm"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h2 className="text-xl font-semibold text-neutral-900 pr-4">
                        {task.title}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            {typeof task.progress === 'number' && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-neutral-900">Progress</h3>
                      <span className="text-2xl font-bold text-neutral-900">{task.progress}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-neutral-200">
                      <div
                        className="h-3 rounded-full bg-primary-600 transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-600">Estimated: </span>
                        <span className="font-medium">{task.estimatedHours}h</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Actual: </span>
                        <span className="font-medium">
                          {task.actualHours ? `${task.actualHours}h` : 'Not tracked'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Paperclip className="mr-2 h-5 w-5" />
                    Attachments ({task.attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                            <Paperclip className="h-5 w-5 text-neutral-600" />
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{attachment.name}</p>
                            <p className="text-sm text-neutral-600">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Comments ({task.comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Add Comment */}
                  <div className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAddComment} 
                        disabled={!newComment.trim() || isSubmittingComment}
                        size="sm"
                      >
                        {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  {task.comments && task.comments.length > 0 && (
                    <div className="space-y-4">
                      {task.comments.map((comment) => (
                        <div key={comment.id} className="border-l-2 border-neutral-200 pl-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-700">
                                {comment.author?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900 text-sm">
                                {comment.author?.name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-neutral-600">
                                {formatRelativeDate(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="text-neutral-700 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {task.status !== TaskStatus.DONE && (
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => handleStatusChange(TaskStatus.DONE)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark Complete
                  </Button>
                )}
                
                {task.status === TaskStatus.TODO && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Task
                  </Button>
                )}
                
                {task.status === TaskStatus.IN_PROGRESS && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleStatusChange(TaskStatus.TODO)}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Task
                  </Button>
                )}
                
                <Button variant="outline" className="w-full justify-start">
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
                
                <Button variant="outline" className="w-full justify-start text-error-600 hover:text-error-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardContent>
            </Card>

            {/* Task Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Status</span>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                    className="rounded border border-neutral-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Priority</span>
                  <Badge className={getTaskPriorityColor(task.priority)} size="sm">
                    {task.priority}
                  </Badge>
                </div>

                {/* Type */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Type</span>
                  <Badge className={getTaskTypeColor(task.type)} size="sm">
                    {task.type}
                  </Badge>
                </div>

                {/* Project */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Project</span>
                  <Link href={`/projects/${task.projectId}`} className="text-sm text-primary-600 hover:text-primary-700">
                    {task.project?.name}
                  </Link>
                </div>

                {/* Assignee */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700">Assignee</span>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-700">
                        {task.assignedTo?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-neutral-900">{task.assignedTo?.name}</span>
                  </div>
                </div>

                {/* Due Date */}
                {task.dueDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Due Date</span>
                    <div className="flex items-center space-x-1 text-sm text-neutral-900">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(task.dueDate, 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                )}

                {/* Time Spent */}
                {task.totalTimeSpent && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Time Spent</span>
                    <div className="flex items-center space-x-1 text-sm text-neutral-900">
                      <Clock className="h-4 w-4" />
                      <span>{formatMinutesToHours(task.totalTimeSpent)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Fields */}
            {task.customFields && Object.keys(task.customFields).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(task.customFields).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">{key}</span>
                      <span className="text-sm text-neutral-900">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}