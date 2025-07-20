"use client";

import React from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { cn } from '@/lib/utils/cn';
import { LoadingSpinner } from './Loading';

interface GlobalLoadingProps {
  className?: string;
  showMessage?: boolean;
  backdrop?: boolean;
  position?: 'fixed' | 'absolute';
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  className,
  showMessage = false, // Default to false - chỉ hiện spinner
  backdrop = true,
  position = 'fixed'
}) => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'inset-0 z-[100000] flex items-center justify-center',
        position === 'fixed' ? 'fixed' : 'absolute',
        backdrop && 'bg-black/20 backdrop-blur-sm',
        className
      )}
    >
      {/* Chỉ hiển thị spinner đơn giản */}
      <LoadingSpinner size="lg" color="primary" />
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