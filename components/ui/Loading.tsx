"use client";

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'white' | 'muted';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  const colorClasses = {
    primary: 'text-primary',
    white: 'text-white',
    muted: 'text-muted-foreground'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )} 
    />
  );
};

interface LoadingDotsProps {
  className?: string;
  color?: 'primary' | 'white' | 'muted';
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  className,
  color = 'primary' 
}) => {
  const colorClasses = {
    primary: 'bg-primary',
    white: 'bg-white',
    muted: 'bg-muted-foreground'
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full animate-pulse',
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
};

interface LoadingBarProps {
  progress?: number; // 0-100
  className?: string;
  animated?: boolean;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ 
  progress,
  className,
  animated = true 
}) => {
  return (
    <div className={cn('w-full bg-muted rounded-full h-2', className)}>
      <div
        className={cn(
          'bg-primary h-2 rounded-full transition-all duration-300',
          animated && !progress && 'animate-pulse'
        )}
        style={{
          width: progress ? `${Math.min(Math.max(progress, 0), 100)}%` : '30%'
        }}
      />
    </div>
  );
};

interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots';
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = '',
  size = 'md',
  variant = 'spinner',
  className
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {variant === 'spinner' ? (
        <LoadingSpinner size={size} />
      ) : (
        <LoadingDots />
      )}
      {message && message.trim() && (
        <span className="text-sm text-muted-foreground">
          {message}
        </span>
      )}
    </div>
  );
};