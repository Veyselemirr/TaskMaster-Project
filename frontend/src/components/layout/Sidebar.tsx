'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  CheckSquare, 
  Calendar,
  BarChart3,
  Users,
  Settings,
  Plus,
  Clock,
  AlertCircle,
  TrendingUp,
  Archive
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    current: false,
  },
  {
    name: 'My Tasks',
    href: '/tasks',
    icon: CheckSquare,
    current: false,
    badge: 12
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    current: false,
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: Users,
    current: false,
  },
]

const quickActions = [
  {
    name: 'Due Today',
    href: '/tasks?filter=due-today',
    icon: Clock,
    current: false,
    badge: 3
  },
  {
    name: 'Overdue',
    href: '/tasks?filter=overdue',
    icon: AlertCircle,
    current: false,
    badge: 2,
    variant: 'danger' as const
  },
  {
    name: 'High Priority',
    href: '/tasks?filter=high-priority',
    icon: TrendingUp,
    current: false,
    badge: 5
  },
]

const bottomNavigation = [
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    current: false,
  },
  {
    name: 'Archive',
    href: '/archive',
    icon: Archive,
    current: false,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    current: false,
  },
]

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  // Update current state based on pathname
  const updateNavigation = (navItems: typeof navigation) => {
    return navItems.map(item => ({
      ...item,
      current: pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
    }))
  }

  const currentNavigation = updateNavigation(navigation)
  const currentQuickActions = updateNavigation(quickActions)
  const currentBottomNavigation = updateNavigation(bottomNavigation)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <span className="font-bold text-gray-900">TaskMaster</span>
            </div>
          </div>

          {/* Create Task Button */}
          <div className="p-4">
            <Button className="w-full" size="md">
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-8 px-4 pb-4">
            {/* Main Navigation */}
            <div>
              <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Main
              </h3>
              <div className="mt-2 space-y-1">
                {currentNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                      item.current
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    onClick={onClose}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          item.current ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </div>
                    {item.badge && (
                      <Badge variant="info" size="sm">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Quick Actions
              </h3>
              <div className="mt-2 space-y-1">
                {currentQuickActions.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                      item.current
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    onClick={onClose}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          item.current ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                    </div>
                    {item.badge && (
                      <Badge 
                        variant={item.variant || 'info'} 
                        size="sm"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="mt-auto">
              <div className="space-y-1">
                {currentBottomNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200',
                      item.current
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    onClick={onClose}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        item.current ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}