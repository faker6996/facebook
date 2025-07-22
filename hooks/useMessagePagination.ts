"use client";

import { useState, useCallback } from 'react';
import { Message } from "@/lib/models/message";
import { MessengerPreview } from "@/lib/models/messenger_review";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";

interface UseMessagePaginationProps {
  conversation: MessengerPreview;
  onScrollToBottom: (delay?: number, reason?: string) => void;
  onSetMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
}

export const useMessagePagination = ({
  conversation,
  onScrollToBottom,
  onSetMessages
}: UseMessagePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasUserLoadedMore, setHasUserLoadedMore] = useState(false); // Track if user manually loaded more
  
  const MESSAGES_PER_PAGE = 30;

  // Load Messages Function
  const loadMessages = useCallback(async (page: number = 1, isLoadMore: boolean = false) => {
    if (!conversation?.conversation_id) {
      console.log("🆕 New conversation - no messages to load");
      onSetMessages([]);
      setIsInitialLoad(false);
      return;
    }

    setIsLoadingMessages(true);
    setLoadError(null); // Clear previous errors
    
    try {
      console.log("🔥 Loading messages for conversation:", conversation.conversation_id, "page:", page);
      const response = await callApi<{
        messages: any[];
        hasMore: boolean;
        totalCount: number;
        currentPage: number;
      }>(
        API_ROUTES.MESSENGER.MESSAGES_PAGINATED(conversation.conversation_id, page, MESSAGES_PER_PAGE), 
        HTTP_METHOD_ENUM.GET,
        undefined,
        { 
          timeout: 20000, // Tăng timeout lên 20 giây cho pagination
          silent: true // Không hiển thị alert cho loading messages
        }
      );
      
      console.log("✅ Raw API Response:", response);

      if (response) {
        console.log("🔄 Mapping response to Message objects...");
        const mappedMessages = response.messages
          ?.map((m, index) => {
            console.log(`📝 Processing message ${index}:`, m);
            try {
              return new Message(m);
            } catch (err) {
              console.error(`❌ Error processing message ${index}:`, err, m);
              return null;
            }
          })
          .filter((m): m is Message => m !== null) ?? [];

        console.log("🎯 Final mapped messages:", mappedMessages.length);
        
        if (isLoadMore) {
          // Thêm messages cũ hơn vào đầu danh sách
          onSetMessages(prev => [...mappedMessages, ...prev]);
        } else {
          // Load lần đầu
          onSetMessages(mappedMessages);
        }
        
        setHasMoreMessages(response.hasMore);
        setTotalMessageCount(response.totalCount);
        setCurrentPage(response.currentPage);
        
        // Chỉ scroll xuống cuối cho lần đầu load conversation (initial load)
        if (!isLoadMore && isInitialLoad) {
          console.log("🎯 Auto-scrolling to bottom after initial load", {
            messagesCount: mappedMessages.length,
            conversation_id: conversation?.conversation_id
          });
          // Delay để đảm bảo DOM đã render
          setTimeout(() => onScrollToBottom(0, 'initial-load'), 100);
        }
      }
    } catch (err) {
      console.error("❌ Lỗi tải tin nhắn:", err);
      
      // Handle different types of errors
      let errorMessage = "Không thể tải tin nhắn";
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = "Tải tin nhắn quá lâu, vui lòng thử lại";
        } else if (err.message.includes('Network Error')) {
          errorMessage = "Lỗi kết nối, vui lòng kiểm tra mạng";
        } else {
          errorMessage = err.message;
        }
      }
      
      setLoadError(errorMessage);
      
      // Don't reset hasMoreMessages on error for load more
      // Only reset for initial load
      if (!isLoadMore) {
        setHasMoreMessages(false);
      }
    } finally {
      setIsLoadingMessages(false);
      if (!isLoadMore) {
        setIsInitialLoad(false);
      }
    }
  }, [conversation, isInitialLoad, onScrollToBottom, onSetMessages]);

  // Load more messages when scrolling up
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMessages) return;
    
    const nextPage = currentPage + 1;
    console.log("📄 Loading more messages, page:", nextPage);
    setHasUserLoadedMore(true); // Mark that user has manually loaded more
    await loadMessages(nextPage, true);
  }, [hasMoreMessages, isLoadingMessages, currentPage, loadMessages]);

  // Retry loading messages
  const retryLoadMessages = useCallback(async () => {
    if (isLoadingMessages) return;
    console.log("🔄 Retrying to load messages...");
    await loadMessages(currentPage, true);
  }, [isLoadingMessages, currentPage, loadMessages]);

  // Reset pagination state
  const resetPaginationState = useCallback(() => {
    setCurrentPage(1);
    setHasMoreMessages(true);
    setIsInitialLoad(true);
    setLoadError(null);
    setHasUserLoadedMore(false); // Reset user load more flag
  }, []);

  return {
    currentPage,
    hasMoreMessages,
    isLoadingMessages,
    totalMessageCount,
    isInitialLoad,
    loadError,
    hasUserLoadedMore,
    loadMessages,
    loadMoreMessages,
    retryLoadMessages,
    resetPaginationState
  };
};