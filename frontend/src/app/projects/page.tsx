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
  Users, 
  Calendar,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  Folder,
  Clock,
  Target,
  Briefcase
} from 'lucide-react'
import { Task, TaskStatus, TaskPriority } from '@/types/task'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'

interface Project {
  id: number
  name: string
  description: string
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED'
  startDate: Date
  dueDate?: Date
  completedAt?: Date
  progress: number
  teamMembers: Array<{
    id: number
    name: string
    email: string
    role: string
  }>
  totalTasks: number
  completedTasks: number
  createdAt: Date
  updatedAt: Date
}

// Mock projects data
const mockProjects: Project[] = [
  {
    id: 1,
    name: 'TaskMaster Application',
    description: 'Complete task management system with advanced features, real-time collaboration, and comprehensive reporting capabilities.',
    status: 'ACTIVE',
    startDate: new Date('2024-08-01'),
    dueDate: new Date('2024-12-15'),
    progress: 75,
    teamMembers: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Lead Developer' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Frontend Developer' },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Backend Developer' },
      { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'UI/UX Designer' }
    ],
    totalTasks: 45,
    completedTasks: 34,
    createdAt: new Date('2024-07-15'),
    updatedAt: new Date('2024-09-11')
  },
  {
    id: 2,
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design, improved UX, and mobile-first approach.',
    status: 'ACTIVE',
    startDate: new Date('2024-09-01'),
    dueDate: new Date('2024-11-30'),
    progress: 35,
    teamMembers: [
      { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'UI/UX Designer' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Frontend Developer' },
      { id: 5, name: 'Tom Brown', email: 'tom@example.com', role: 'Content Manager' }
    ],
    totalTasks: 28,
    completedTasks: 10,
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-09-10')
  },
  {
    id: 3,
    name: 'Mobile App Development',
    description: 'Native mobile applications for iOS and Android with offline capabilities and push notifications.',
    status: 'ACTIVE',
    startDate: new Date('2024-07-15'),
    dueDate: new Date('2024-10-31'),
    progress: 60,
    teamMembers: [
      { id: 6, name: 'Alex Chen', email: 'alex@example.com', role: 'Mobile Developer' },
      { id: 7, name: 'Lisa Park', email: 'lisa@example.com', role: 'Mobile Developer' },
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Technical Lead' }
    ],
    totalTasks: 35,
    completedTasks: 21,
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-09-09')
  },
  {
    id: 4,
    name: 'Data Analytics Platform',
    description: 'Business intelligence platform with real-time dashboards, advanced reporting, and machine learning insights.',
    status: 'COMPLETED',
    startDate: new Date('2024-03-01'),
    dueDate: new Date('2024-08-31'),
    completedAt: new Date('2024-08-28'),
    progress: 100,
    teamMembers: [
      { id: 8, name: 'David Kumar', email: 'david@example.com', role: 'Data Engineer' },
      { id: 9, name: 'Emily Zhang', email: 'emily@example.com', role: 'Data Scientist' },
      { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Backend Developer' }
    ],
    totalTasks: 52,
    completedTasks: 52,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-08-28')
  },
  {
    id: 5,
    name: 'Security Audit',
    description: 'Comprehensive security assessment and implementation of enhanced security measures across all systems.',
    status: 'ON_HOLD',
    startDate: new Date('2024-08-15'),
    dueDate: new Date('2024-10-15'),
    progress: 20,
    teamMembers: [
      { id: 10, name: 'Robert Martinez', email: 'robert@example.com', role: 'Security Specialist' },
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Technical Consultant' }
    ],
    totalTasks: 15,
    completedTasks: 3,
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-20')
  }
]

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [projects, setProjects] = React.useState(mockProjects)

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success-100 text-success-800 border-success-200'
      case 'COMPLETED':
        return 'bg-primary-100 text-primary-800 border-primary-200'
      case 'ON_HOLD':
        return 'bg-warning-100 text-warning-800 border-warning-200'
      case 'CANCELLED':
        return 'bg-error-100 text-error-800 border-error-200'
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-success-600'
    if (progress >= 50) return 'bg-primary-600'
    if (progress >= 25) return 'bg-warning-600'
    return 'bg-error-600'
  }

  const isOverdue = (project: Project) => {
    if (!project.dueDate || project.status === 'COMPLETED') return false
    return new Date() > project.dueDate
  }

  const stats = [
    {
      name: 'Total Projects',
      value: projects.length,
      change: '+2',
      changeType: 'increase' as const,
      icon: Folder,
      color: 'text-primary-600'
    },
    {
      name: 'Active Projects',
      value: projects.filter(p => p.status === 'ACTIVE').length,
      change: '+1',
      changeType: 'increase' as const,
      icon: Briefcase,
      color: 'text-success-600'
    },
    {
      name: 'Completed',
      value: projects.filter(p => p.status === 'COMPLETED').length,
      change: '+1',
      changeType: 'increase' as const,
      icon: CheckSquare,
      color: 'text-neutral-600'
    },
    {
      name: 'Overdue',
      value: projects.filter(p => isOverdue(p)).length,
      change: '0',
      changeType: 'neutral' as const,
      icon: AlertTriangle,
      color: 'text-error-600'
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Projects</h1>
            <p className="mt-1 text-neutral-600">
              Manage and track your project portfolio
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
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
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-neutral-900">
                          {stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase' ? 'text-success-600' : 
                          stat.changeType === 'decrease' ? 'text-error-600' : 'text-neutral-600'
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

        {/* Search and Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search projects..."
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
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-warm-lg transition-shadow">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link 
                      href={`/projects/${project.id}`}
                      className="block hover:text-primary-600 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                        {project.name}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge className={getStatusColor(project.status)} size="sm">
                        {project.status.replace('_', ' ')}
                      </Badge>
                      {isOverdue(project) && (
                        <Badge variant="danger" size="sm">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-neutral-600">Progress</span>
                    <span className="font-semibold text-neutral-900">{project.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-200">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Tasks Summary */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <CheckSquare className="h-4 w-4 text-neutral-400" />
                      <span className="text-neutral-600">
                        {project.completedTasks}/{project.totalTasks} tasks
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-neutral-400" />
                      <span className="text-neutral-600">
                        {project.teamMembers.length} members
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 4).map((member, index) => (
                      <div
                        key={member.id}
                        className="h-8 w-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center"
                        title={`${member.name} - ${member.role}`}
                      >
                        <span className="text-xs font-medium text-primary-700">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    ))}
                    {project.teamMembers.length > 4 && (
                      <div className="h-8 w-8 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-medium text-neutral-600">
                          +{project.teamMembers.length - 4}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Due Date */}
                  {project.dueDate && (
                    <div className={`flex items-center space-x-1 text-sm ${
                      isOverdue(project) ? 'text-error-600' : 'text-neutral-600'
                    }`}>
                      <Calendar className="h-4 w-4" />
                      <span>
                        Due {formatDate(project.dueDate, 'MMM dd')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Card className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Folder className="h-12 w-12 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No projects found</h3>
            <p className="text-neutral-600 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first project.'}
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  )
}