/**
 * Global Loading Manager - Singleton Pattern
 * Quản lý trạng thái loading toàn bộ ứng dụng
 */

type LoadingListener = (isLoading: boolean, message?: string) => void;

export class LoadingManager {
  private static instance: LoadingManager;
  private listeners: Set<LoadingListener> = new Set();
  private loadingStates: Map<string, boolean> = new Map();
  private loadingMessages: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  /**
   * Đăng ký listener để lắng nghe thay đổi loading state
   */
  subscribe(listener: LoadingListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Bắt đầu loading với key cụ thể
   */
  start(key: string, message?: string): void {
    this.loadingStates.set(key, true);
    if (message) {
      this.loadingMessages.set(key, message);
    }
    this.notifyListeners();
  }

  /**
   * Kết thúc loading với key cụ thể
   */
  stop(key: string): void {
    this.loadingStates.delete(key);
    this.loadingMessages.delete(key);
    this.notifyListeners();
  }

  /**
   * Kết thúc tất cả loading
   */
  stopAll(): void {
    this.loadingStates.clear();
    this.loadingMessages.clear();
    this.notifyListeners();
  }

  /**
   * Kiểm tra có đang loading không
   */
  isLoading(key?: string): boolean {
    if (key) {
      return this.loadingStates.get(key) || false;
    }
    return this.loadingStates.size > 0;
  }

  /**
   * Kiểm tra có đang loading global không (loại trừ silent keys)
   */
  isGlobalLoading(): boolean {
    const activeKeys = Array.from(this.loadingStates.keys());
    const nonSilentKeys = activeKeys.filter(key => !SILENT_LOADING_KEYS.includes(key as any));
    return nonSilentKeys.length > 0;
  }

  /**
   * Lấy message hiện tại
   */
  getCurrentMessage(): string | undefined {
    const messages = Array.from(this.loadingMessages.values());
    return messages[messages.length - 1]; // Lấy message mới nhất
  }

  /**
   * Lấy tất cả loading keys hiện tại
   */
  getActiveKeys(): string[] {
    return Array.from(this.loadingStates.keys());
  }

  /**
   * Helper method cho async operations
   */
  async withLoading<T>(
    key: string, 
    operation: () => Promise<T>, 
    message?: string
  ): Promise<T> {
    try {
      this.start(key, message);
      const result = await operation();
      return result;
    } finally {
      this.stop(key);
    }
  }

  private notifyListeners(): void {
    const isLoading = this.isGlobalLoading(); // Use global loading instead of all loading
    const message = this.getCurrentMessage();
    
    this.listeners.forEach(listener => {
      try {
        listener(isLoading, message);
      } catch (error) {
        console.error('Error in loading listener:', error);
      }
    });
  }
}

// Export singleton instance
export const loadingManager = LoadingManager.getInstance();

// Loading keys constants
export const LOADING_KEYS = {
  // API calls
  LOGIN: 'login',
  LOGOUT: 'logout',
  SEARCH_USERS: 'search_users',
  LOAD_CONVERSATIONS: 'load_conversations',
  LOAD_MESSAGES: 'load_messages',
  SEND_MESSAGE: 'send_message',
  UPLOAD_FILE: 'upload_file',
  
  // UI operations
  PAGE_LOAD: 'page_load',
  FORM_SUBMIT: 'form_submit',
  DATA_REFRESH: 'data_refresh',
  
  // Video call
  VIDEO_CALL_CONNECT: 'video_call_connect',
  
  // Global
  GLOBAL: 'global'
} as const;

// Keys that should NOT show global loading
const SILENT_LOADING_KEYS = [
  'send_message', // Don't show global loading for sending messages
] as const;