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
    
    try {
      console.log("🔥 Loading messages for conversation:", conversation.conversation_id, "page:", page);
      const response = await callApi<{
        messages: any[];
        hasMore: boolean;
        totalCount: number;
        currentPage: number;
      }>(
        API_ROUTES.MESSENGER.MESSAGES_PAGINATED(conversation.conversation_id, page, MESSAGES_PER_PAGE), 
        HTTP_METHOD_ENUM.GET
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
        
        // Cuộn xuống cuối sau khi load messages thành công (chỉ khi không phải load more)
        if (!isLoadMore) {
          console.log("🎯 Auto-scrolling to bottom after loading messages", {
            messagesCount: mappedMessages.length,
            isInitialLoad,
            conversation_id: conversation?.conversation_id
          });
          onScrollToBottom(500, 'loadMessages-initial');
        }
      }
    } catch (err) {
      console.error("❌ Lỗi tải tin nhắn:", err);
    } finally {
      setIsLoadingMessages(false);
      setIsInitialLoad(false);
    }
  }, [conversation, isInitialLoad, onScrollToBottom, onSetMessages]);

  // Load more messages when scrolling up
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMessages) return;
    
    const nextPage = currentPage + 1;
    console.log("📄 Loading more messages, page:", nextPage);
    await loadMessages(nextPage, true);
  }, [hasMoreMessages, isLoadingMessages, currentPage, loadMessages]);

  // Reset pagination state
  const resetPaginationState = useCallback(() => {
    setCurrentPage(1);
    setHasMoreMessages(true);
    setIsInitialLoad(true);
  }, []);

  return {
    currentPage,
    hasMoreMessages,
    isLoadingMessages,
    totalMessageCount,
    isInitialLoad,
    loadMessages,
    loadMoreMessages,
    resetPaginationState
  };
};