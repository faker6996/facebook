/**
 * Custom hook để sử dụng API với loading
 * Wrapper cho loading manager với các tính năng bổ sung
 */

import { useState, useCallback } from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { loadingManager, LOADING_KEYS } from '@/lib/utils/loading-manager';

interface UseApiLoadingOptions {
  defaultKey?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
}

export const useApiLoading = (options: UseApiLoadingOptions = {}) => {
  const { isKeyLoading, withLoading } = useLoading();
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(async (
    apiCall: () => Promise<any>,
    loadingKey?: string,
    message?: string
  ) => {
    const key = loadingKey || options.defaultKey || LOADING_KEYS.GLOBAL;
    
    try {
      setError(null);
      const result = await withLoading(key, apiCall, message);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      options.onError?.(error);
      throw error;
    }
  }, [withLoading, options]);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    isLoading: (key?: string) => isKeyLoading(key || options.defaultKey || LOADING_KEYS.GLOBAL),
    error,
    data,
    reset
  };
};

// Specialized hooks for common operations
export const useAuthLoading = () => useApiLoading({ 
  defaultKey: LOADING_KEYS.LOGIN 
});

export const useMessengerLoading = () => useApiLoading({ 
  defaultKey: LOADING_KEYS.LOAD_CONVERSATIONS 
});

export const useSearchLoading = () => useApiLoading({ 
  defaultKey: LOADING_KEYS.SEARCH_USERS 
});