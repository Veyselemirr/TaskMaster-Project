'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  Paperclip, 
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Task, TaskStatus, TaskPriority } from '@/types/task'
import { 
  cn, 
  formatDate, 
  formatRelativeDate, 
  getTaskStatusColor, 
  getTaskPriorityColor,
  getTaskTypeColor,
  isTaskOverdue,
  isTaskDueToday,
  formatMinutesToHours,
  truncateText
} from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onStatusChange?: (taskId: number, status: TaskStatus) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: number) => void
  className?: string
}

export function TaskCard({ 
  task, 
  onStatusChange, 
  onEdit, 
  onDelete,
  className 
}: TaskCardProps) {
  const isOverdue = isTaskOverdue(task)
  const isDueToday = isTaskDueToday(task)
  const isCompleted = task.status === TaskStatus.DONE

  return (
    <Card className={cn(
      'group relative transition-all duration-200 hover:shadow-md',
      isOverdue && !isCompleted && 'border-red-200 bg-red-50/30',
      isDueToday && !isCompleted && 'border-orange-200 bg-orange-50/30',
      className
    )}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Status and Priority */}
            <div className="flex items-center space-x-2">
              <Badge className={getTaskStatusColor(task.status)} size="sm">
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={getTaskPriorityColor(task.priority)} size="sm">
                {task.priority}
              </Badge>
              <Badge className={getTaskTypeColor(task.type)} size="sm">
                {task.type}
              </Badge>
            </div>

            {/* Title and Description */}
            <div className="space-y-1">
              <Link href={`/tasks/${task.id}`} className="block">
                <h3 className={cn(
                  'font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors',
                  isCompleted && 'line-through text-gray-500'
                )}>
                  {task.title}
                </h3>
              </Link>
              {task.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {truncateText(task.description, 100)}
                </p>
              )}
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                  >
                    #{tag}
                  </span>
                ))}
                {task.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{task.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Quick Complete */}
            {task.status !== TaskStatus.DONE && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusChange?.(task.id, TaskStatus.DONE)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Mark as complete"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}

            {/* More actions */}
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {task.progress !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{task.progress}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Subtasks Progress */}
        {task.subtaskProgress && task.subtaskProgress.total > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtasks</span>
              <span className="font-medium text-gray-900">
                {task.subtaskProgress.completed}/{task.subtaskProgress.total}
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-600 transition-all duration-300"
                style={{ width: `${task.subtaskProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Meta Information */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {/* Due Date */}
            {task.dueDate && (
              <div className={cn(
                'flex items-center space-x-1',
                isOverdue && 'text-red-600',
                isDueToday && 'text-orange-600'
              )}>
                {isOverdue && <AlertTriangle className="h-4 w-4" />}
                <Calendar className="h-4 w-4" />
                <span>
                  {isDueToday ? 'Due today' : formatDate(task.dueDate, 'MMM dd')}
                </span>
              </div>
            )}

            {/* Time Tracking */}
            {task.totalTimeSpent && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatMinutesToHours(task.totalTimeSpent)}</span>
              </div>
            )}

            {/* Assignee */}
            {task.assignedTo && (
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{task.assignedTo.name || task.assignedTo.email}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Comments */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{task.comments.length}</span>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center space-x-1">
                <Paperclip className="h-4 w-4" />
                <span>{task.attachments.length}</span>
              </div>
            )}

            {/* Last updated */}
            <span className="text-xs">
              {formatRelativeDate(task.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}