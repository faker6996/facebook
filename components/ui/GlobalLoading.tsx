"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Activity } from 'lucide-react';
import { loading, LoadingState } from '@/lib/utils/loading';
import { useTranslations } from 'next-intl';

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
        backdrop && 'bg-background/90 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center justify-center space-x-3 bg-card/95 backdrop-blur-sm border border-border rounded-lg px-6 py-4 shadow-lg">
        <Activity className="w-6 h-6 animate-spin text-primary" />
        {state.text && (
          <span className="text-base font-medium text-foreground">
            {state.text}
          </span>
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
  message,
  className
}) => {
  const t = useTranslations("Loading");
  const defaultMessage = message || t("loadingPage");
  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center bg-background',
      className
    )}>
      <div className="text-center space-y-4">
        <Activity className="w-8 h-8 animate-spin text-primary mx-auto" />
        <div>
          <p className="text-lg font-medium text-foreground">
            {defaultMessage}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t("pleaseWait")}
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

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Activity className={cn('animate-spin text-primary', sizeClasses[size])} />
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
          <Activity className="w-4 h-4 animate-spin text-primary-foreground" />
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