"use client";

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseMessengerScrollProps {
  messages: any[];
  isLoadingMessages: boolean;
  isInitialLoad: boolean;
  conversation?: any;
  onLoadMore: () => void;
  hasMoreMessages: boolean;
}

export const useMessengerScroll = ({
  messages,
  isLoadingMessages,
  isInitialLoad,
  conversation,
  onLoadMore,
  hasMoreMessages
}: UseMessengerScrollProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Check if user is near bottom of scroll
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return false;
    
    const threshold = 100; // pixels from bottom
    return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
  }, []);

  // Scroll helper function với debug và multiple fallbacks
  const scrollToBottom = useCallback((delay: number = 100, reason: string = '') => {
    console.log(`🎯 scrollToBottom called: delay=${delay}, reason=${reason}`);
    
    const executeScroll = () => {
      console.log(`🎯 scrollToBottom executing: bottomRef=${!!bottomRef.current}, container=${!!messagesContainerRef.current}`);
      
      if (bottomRef.current) {
        console.log('🎯 Using bottomRef.scrollIntoView');
        bottomRef.current.scrollIntoView({ 
          behavior: "smooth",
          block: "end"
        });
        
        // Backup với instant scroll nếu smooth không hoạt động
        setTimeout(() => {
          if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ 
              behavior: "auto",
              block: "end"
            });
          }
        }, 500);
        
      } else if (messagesContainerRef.current) {
        console.log('🎯 Using container scrollTop fallback');
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      } else {
        console.warn('🎯 No scroll target available');
      }
    };

    if (delay > 0) {
      setTimeout(executeScroll, delay);
    } else {
      // Sử dụng requestAnimationFrame để đảm bảo DOM đã render
      requestAnimationFrame(() => {
        requestAnimationFrame(executeScroll);
      });
    }
  }, []);

  // Scroll event handler
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if user is near bottom to enable auto-scroll
    const nearBottom = isNearBottom();
    setShouldAutoScroll(nearBottom);
    console.log("📜 Scroll position:", { 
      scrollTop: container.scrollTop, 
      nearBottom, 
      shouldAutoScroll: nearBottom 
    });
    
    // Set user scrolling flag
    setIsUserScrolling(true);
    
    // Clear the scrolling flag after a delay
    clearTimeout((window as any).scrollTimeout);
    (window as any).scrollTimeout = setTimeout(() => {
      setIsUserScrolling(false);
    }, 150);

    // Kiểm tra nếu user scroll lên đầu (near top) để load more messages
    if (container.scrollTop < 100 && hasMoreMessages && !isLoadingMessages) {
      console.log("🔼 User scrolled to top, loading more messages...");
      onLoadMore();
    }
  }, [isNearBottom, hasMoreMessages, isLoadingMessages, onLoadMore]);

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Cuộn xuống cuối khi có tin nhắn mới được gửi (real-time messages)
  useEffect(() => {
    console.log("🎯 useEffect scroll trigger:", {
      messagesLength: messages.length,
      isLoadingMessages,
      isInitialLoad,
      shouldAutoScroll,
      isUserScrolling
    });
    
    // Chỉ cuộn khi:
    // 1. Có tin nhắn mới được thêm
    // 2. Không đang loading
    // 3. Không phải initial load
    // 4. User không đang scroll lên trên (shouldAutoScroll = true)
    // 5. User không đang scroll thủ công
    if (messages.length > 0 && !isLoadingMessages && !isInitialLoad && shouldAutoScroll && !isUserScrolling) {
      console.log("🎯 useEffect auto-scroll triggered");
      scrollToBottom(100, 'useEffect-newMessage');
    }
  }, [messages.length, isLoadingMessages, isInitialLoad, shouldAutoScroll, isUserScrolling, scrollToBottom]);

  // Force scroll after initial load complete với multiple attempts
  useEffect(() => {
    console.log("🎯 Initial load complete effect:", {
      messagesLength: messages.length,
      isInitialLoad,
      isLoadingMessages,
      conversation_id: conversation?.conversation_id
    });
    
    // Khi vừa load xong conversation lần đầu
    if (messages.length > 0 && !isInitialLoad && !isLoadingMessages && conversation?.conversation_id) {
      console.log("🎯 Force scroll after initial load complete - multiple attempts");
      
      // Multiple scroll attempts với delay tăng dần
      setTimeout(() => scrollToBottom(0, 'initial-attempt-1'), 100);
      setTimeout(() => scrollToBottom(0, 'initial-attempt-2'), 300);
      setTimeout(() => scrollToBottom(0, 'initial-attempt-3'), 600);
      setTimeout(() => scrollToBottom(0, 'initial-attempt-4'), 1000);
    }
  }, [isInitialLoad, messages.length, isLoadingMessages, conversation?.conversation_id, scrollToBottom]);

  // Reset scroll states when conversation changes
  const resetScrollState = useCallback(() => {
    setShouldAutoScroll(true);
    setIsUserScrolling(false);
  }, []);

  return {
    bottomRef,
    messagesContainerRef,
    shouldAutoScroll,
    setShouldAutoScroll,
    scrollToBottom,
    resetScrollState
  };
};