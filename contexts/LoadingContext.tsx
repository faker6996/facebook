"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadingManager } from '@/lib/utils/loading-manager';

interface LoadingContextType {
  isLoading: boolean;
  message?: string;
  activeKeys: string[];
  start: (key: string, message?: string) => void;
  stop: (key: string) => void;
  stopAll: () => void;
  isKeyLoading: (key: string) => boolean;
  withLoading: (key: string, operation: () => Promise<any>, message?: string) => Promise<any>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe((loading, msg) => {
      setIsLoading(loading);
      setMessage(msg);
      setActiveKeys(loadingManager.getActiveKeys());
    });

    // Initialize with current state (use global loading to exclude silent keys)
    setIsLoading(loadingManager.isGlobalLoading());
    setMessage(loadingManager.getCurrentMessage());
    setActiveKeys(loadingManager.getActiveKeys());

    return unsubscribe;
  }, []);

  const contextValue: LoadingContextType = {
    isLoading,
    message,
    activeKeys,
    start: (key: string, message?: string) => loadingManager.start(key, message),
    stop: (key: string) => loadingManager.stop(key),
    stopAll: () => loadingManager.stopAll(),
    isKeyLoading: (key: string) => loadingManager.isLoading(key),
    withLoading: (key: string, operation: () => Promise<any>, message?: string) => 
      loadingManager.withLoading(key, operation, message),
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};