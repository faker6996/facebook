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
  const [previousScrollHeight, setPreviousScrollHeight] = useState(0);
  const [isLoadingMoreFromScroll, setIsLoadingMoreFromScroll] = useState(false);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const isLoadingMoreRef = useRef(false);
  const lastMessageIdRef = useRef<string | number | null>(null);

  // Check if user is near bottom of scroll
  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return false;
    
    const threshold = 150; // pixels from bottom - tăng threshold để user có nhiều space hơn
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom < threshold;
  }, []);

  // Scroll helper function đơn giản
  const scrollToBottom = useCallback((delay: number = 0, reason: string = '') => {
    console.log(`🎯 scrollToBottom: delay=${delay}, reason=${reason}`);
    
    const executeScroll = () => {
      const container = messagesContainerRef.current;
      if (container) {
        // Sử dụng scrollTop cho control tốt hơn
        container.scrollTop = container.scrollHeight;
        console.log(`🎯 Scrolled to bottom: scrollTop=${container.scrollTop}, scrollHeight=${container.scrollHeight}`);
      }
    };

    if (delay > 0) {
      setTimeout(executeScroll, delay);
    } else {
      // Immediate scroll với requestAnimationFrame để đảm bảo DOM ready
      requestAnimationFrame(executeScroll);
    }
  }, []);

  // Scroll event handler
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if user is near bottom to enable auto-scroll
    const nearBottom = isNearBottom();
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    
    // Chỉ enable auto-scroll khi user thực sự ở gần cuối
    // Disable auto-scroll ngay khi user scroll lên xa
    if (nearBottom) {
      setShouldAutoScroll(true);
    } else if (distanceFromBottom > 200) {
      // User đã scroll lên khá xa, disable auto-scroll
      setShouldAutoScroll(false);
    }
    
    console.log("📜 Scroll position:", { 
      scrollTop: container.scrollTop,
      distanceFromBottom,
      nearBottom, 
      shouldAutoScroll: nearBottom || distanceFromBottom <= 200
    });
    
    // Set user scrolling flag với timeout dài hơn
    setIsUserScrolling(true);
    clearTimeout((window as any).scrollTimeout);
    (window as any).scrollTimeout = setTimeout(() => {
      setIsUserScrolling(false);
    }, 300); // Tăng timeout để tránh auto-scroll quá sớm

    // Kiểm tra nếu user scroll lên đầu để load more messages
    if (container.scrollTop < 100 && hasMoreMessages && !isLoadingMessages && !isLoadingMoreFromScroll) {
      console.log("🔼 User scrolled to top, loading more messages...");
      setIsLoadingMoreFromScroll(true);
      setPreviousScrollHeight(container.scrollHeight);
      isLoadingMoreRef.current = true; // Set ref để block auto-scroll
      onLoadMore();
    }
  }, [isNearBottom, hasMoreMessages, isLoadingMessages, isLoadingMoreFromScroll, onLoadMore]);

  // Add scroll event listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Preserve scroll position after loading more messages - PRIORITY EFFECT
  useEffect(() => {
    const container = messagesContainerRef.current;
    
    console.log("🔧 Preserve position effect check:", {
      isLoadingMessages,
      isLoadingMoreFromScroll,
      previousScrollHeight,
      hasContainer: !!container,
      currentScrollTop: container?.scrollTop,
      currentScrollHeight: container?.scrollHeight
    });
    
    // Khi vừa load more xong (isLoadingMessages từ true -> false)
    if (!isLoadingMessages && isLoadingMoreFromScroll && previousScrollHeight > 0 && container) {
      console.log("🔧 PRESERVING scroll position after loading more messages");
      
      const currentScrollTop = container.scrollTop;
      const newScrollHeight = container.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeight;
      
      console.log("🔧 Scroll calculations:", {
        previousScrollHeight,
        newScrollHeight,
        heightDifference,
        currentScrollTop,
        targetScrollTop: currentScrollTop + heightDifference
      });
      
      // Adjust scroll position to maintain relative position
      if (heightDifference > 0) {
        const newScrollTop = currentScrollTop + heightDifference;
        
        // Multi-step adjustment để đảm bảo
        container.scrollTop = newScrollTop;
        console.log(`🔧 STEP 1 scroll adjustment: ${currentScrollTop} → ${newScrollTop} (+${heightDifference}px)`);
        
        // Step 2: requestAnimationFrame
        requestAnimationFrame(() => {
          container.scrollTop = newScrollTop;
          console.log(`🔧 STEP 2 scroll adjustment: ${container.scrollTop} → ${newScrollTop}`);
          
          // Step 3: setTimeout backup
          setTimeout(() => {
            if (Math.abs(container.scrollTop - newScrollTop) > 10) {
              console.log(`🔧 STEP 3 BACKUP scroll adjustment: ${container.scrollTop} → ${newScrollTop}`);
              container.scrollTop = newScrollTop;
            }
          }, 50);
        });
      }
      
      // Reset state với delay để đảm bảo auto-scroll không trigger
      setTimeout(() => {
        console.log("🔧 Resetting load more states");
        setIsLoadingMoreFromScroll(false);
        setPreviousScrollHeight(0);
        isLoadingMoreRef.current = false; // Reset ref
      }, 200); // Tăng delay lên
    }
  }, [isLoadingMessages, isLoadingMoreFromScroll, previousScrollHeight]);

  // Auto-scroll cho tin nhắn mới (real-time hoặc khi gửi)
  useEffect(() => {
    const currentMessageCount = messages.length;
    const messageCountChanged = currentMessageCount !== previousMessageCount;
    
    console.log("🎯 Auto-scroll check:", {
      currentMessageCount,
      previousMessageCount,
      messageCountChanged,
      isLoadingMessages,
      isInitialLoad,
      shouldAutoScroll,
      isUserScrolling,
      isLoadingMoreFromScroll,
      isLoadingMoreRef: isLoadingMoreRef.current
    });
    
    // Chỉ auto-scroll khi:
    // 1. Có tin nhắn mới được thêm vào (không phải load more)
    // 2. Không đang loading
    // 3. Không phải initial load
    // 4. User ở gần cuối (shouldAutoScroll = true)
    // 5. User không scroll thủ công
    // 6. Không đang load more từ scroll
    
    const shouldTriggerAutoScroll = 
      messageCountChanged && 
      currentMessageCount > 0 && 
      !isLoadingMessages && 
      !isInitialLoad && 
      shouldAutoScroll && 
      !isUserScrolling && 
      !isLoadingMoreFromScroll &&
      !isLoadingMoreRef.current; // Block auto-scroll khi đang load more
    
    if (shouldTriggerAutoScroll) {
      // Kiểm tra xem có phải tin nhắn mới ở cuối không
      const lastMessage = messages[messages.length - 1];
      const lastMessageId = lastMessage?.id;
      const isNewMessageAtEnd = lastMessageId && lastMessageId !== lastMessageIdRef.current;
      
      console.log("🎯 New message detection:", {
        lastMessageId,
        previousLastMessageId: lastMessageIdRef.current,
        isNewMessageAtEnd,
        messageCountIncreased: currentMessageCount > previousMessageCount
      });
      
      // Chỉ auto-scroll khi có tin nhắn mới ở cuối (không phải load more ở đầu)
      if (isNewMessageAtEnd && currentMessageCount > previousMessageCount) {
        console.log("🎯 Auto-scrolling to bottom for new message at end");
        scrollToBottom(100, 'new-message-auto-scroll');
      }
      
      // Update last message ID
      if (lastMessageId) {
        lastMessageIdRef.current = lastMessageId;
      }
    }
    
    // Update previous count
    setPreviousMessageCount(currentMessageCount);
  }, [messages.length, previousMessageCount, isLoadingMessages, isInitialLoad, shouldAutoScroll, isUserScrolling, isLoadingMoreFromScroll, scrollToBottom]);

  // Backup scroll after initial load hoàn tất
  useEffect(() => {
    console.log("🎯 Backup scroll check:", {
      messagesLength: messages.length,
      isInitialLoad,
      isLoadingMessages,
      conversationId: conversation?.conversation_id,
      isLoadingMoreRef: isLoadingMoreRef.current
    });
    
    // Chỉ trigger khi vừa hoàn thành initial load (isInitialLoad từ true -> false)
    // VÀ không đang load more
    if (messages.length > 0 && 
        !isInitialLoad && 
        !isLoadingMessages && 
        conversation?.conversation_id &&
        !isLoadingMoreRef.current) {
      console.log("🎯 Backup scroll after initial load complete");
      // Single backup scroll attempt
      setTimeout(() => scrollToBottom(0, 'initial-load-backup'), 200);
    }
  }, [isInitialLoad, messages.length, isLoadingMessages, conversation?.conversation_id, scrollToBottom]);

  // Reset scroll states when conversation changes
  const resetScrollState = useCallback(() => {
    setShouldAutoScroll(true);
    setIsUserScrolling(false);
    setIsLoadingMoreFromScroll(false);
    setPreviousScrollHeight(0);
    setPreviousMessageCount(0);
    isLoadingMoreRef.current = false;
    lastMessageIdRef.current = null;
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