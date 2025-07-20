/**
 * Singleton Loading Manager - Đơn giản và dễ sử dụng
 * Chỉ cần gọi loading.show() và loading.hide() từ bất kỳ đâu
 */

type LoadingState = {
  isVisible: boolean;
  text?: string;
};

class LoadingManager {
  private state: LoadingState = { isVisible: false };
  private listeners: Set<(state: LoadingState) => void> = new Set();

  /**
   * Hiển thị loading với text tùy chọn
   */
  show(text?: string) {
    this.state = { isVisible: true, text };
    this.notifyListeners();
  }

  /**
   * Ẩn loading
   */
  hide() {
    this.state = { isVisible: false, text: undefined };
    this.notifyListeners();
  }


  /**
   * Lấy state hiện tại
   */
  getState(): LoadingState {
    return { ...this.state };
  }

  /**
   * Subscribe để nhận thông báo khi state thay đổi
   */
  subscribe(listener: (state: LoadingState) => void): () => void {
    this.listeners.add(listener);
    // Trả về function để unsubscribe
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Singleton instance - export để dùng trực tiếp
export const loading = new LoadingManager();

// Export type cho TypeScript
export type { LoadingState };