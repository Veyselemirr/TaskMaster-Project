import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', shadow = 'sm', ...props }, ref) => {
    const baseClasses = 'bg-white border border-neutral-200 rounded-lg'
    
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }
    
    const shadows = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-warm',
      lg: 'shadow-warm-lg'
    }

    return (
      <div
        className={cn(
          baseClasses,
          paddings[padding],
          shadows[shadow],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn('flex flex-col space-y-1.5 pb-6', className)}
      ref={ref}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight text-neutral-900', className)}
      ref={ref}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      className={cn('text-sm text-neutral-600', className)}
      ref={ref}
      {...props}
    />
  )
)

CardDescription.displayName = 'CardDescription'

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn('', className)}
      ref={ref}
      {...props}
    />
  )
)

CardContent.displayName = 'CardContent'

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      className={cn('flex items-center pt-6', className)}
      ref={ref}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }