"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { LoadingSpinner } from './Loading';
import { loading, LoadingState } from '@/lib/utils/loading';

interface GlobalLoadingProps {
  className?: string;
  backdrop?: boolean;
  position?: 'fixed' | 'absolute';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Component GlobalLoading - tự động lắng nghe singleton loading state
 * Chỉ cần gắn 1 lần ở root của app
 */
export const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  className,
  backdrop = true,
  position = 'fixed',
  size = 'lg'
}) => {
  const [state, setState] = useState<LoadingState>(() => loading.getState());

  useEffect(() => {
    // Subscribe to loading state changes
    const unsubscribe = loading.subscribe(setState);
    return unsubscribe;
  }, []);

  if (!state.isVisible) return null;

  return (
    <div
      className={cn(
        'inset-0 z-[100000] flex items-center justify-center',
        position === 'fixed' ? 'fixed' : 'absolute',
        backdrop && 'bg-black/20 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex flex-col items-center space-y-3">
        <LoadingSpinner size={size} color="primary" />
        {state.text && (
          <p className="text-sm font-medium text-foreground animate-pulse">
            {state.text}
          </p>
        )}
      </div>
    </div>
  );
};

interface PageLoadingProps {
  message?: string;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Đang tải trang...',
  className
}) => {
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center bg-background',
      className
    )}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div>
          <p className="text-lg font-medium text-foreground">
            {message}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Vui lòng đợi một chút...
          </p>
        </div>
      </div>
    </div>
  );
};

// Inline loading component cho buttons hoặc containers nhỏ
interface InlineLoadingProps {
  isLoading: boolean;
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  isLoading,
  text,
  className,
  size = 'md'
}) => {
  if (!isLoading) return null;

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <LoadingSpinner size={size} color="primary" />
      {text && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};

// Button loading wrapper
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loadingText?: string;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  isLoading,
  children,
  className,
  disabled,
  loadingText
}) => {
  return (
    <button 
      className={cn(
        'relative',
        isLoading && 'cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
          {loadingText && (
            <span className="ml-2 text-sm">
              {loadingText}
            </span>
          )}
        </div>
      )}
      
      <div className={cn(isLoading && 'invisible')}>
        {children}
      </div>
    </button>
  );
};