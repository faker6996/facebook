"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import MessageList from "@/components/messenger/MessageList";
import { Message } from "@/lib/models/message";
import { GroupMember } from "@/lib/models/group";
import Button from "@/components/ui/Button";

interface MessengerContentProps {
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  messages: Message[];
  senderId?: number;
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  isInitialLoad: boolean;
  totalMessageCount: number;
  loadError?: string | null;
  isGroup: boolean;
  groupMembers: GroupMember[];
  onRetrySend: (message: Message) => void;
  onReplyMessage: (message: Message) => void;
  onAddReaction: (messageId: number, emoji: string) => void;
  onRemoveReaction: (messageId: number, emoji: string) => void;
  getSenderName: (senderId: number) => string;
  onRetryLoadMessages?: () => void;
}

export const MessengerContent: React.FC<MessengerContentProps> = ({
  messagesContainerRef,
  bottomRef,
  messages,
  senderId,
  isLoadingMessages,
  hasMoreMessages,
  isInitialLoad,
  totalMessageCount,
  loadError,
  isGroup,
  groupMembers,
  onRetrySend,
  onReplyMessage,
  onAddReaction,
  onRemoveReaction,
  getSenderName,
  onRetryLoadMessages
}) => {
  const t = useTranslations('Messenger.content');
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-4"
      >
        <div className="space-y-3 min-h-full flex flex-col justify-end">
          {/* Loading indicator for loading more messages */}
          {isLoadingMessages && hasMoreMessages && !isInitialLoad && (
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                {t('loadingOlderMessages')}
              </div>
            </div>
          )}
          
          {/* Error indicator */}
          {loadError && (
            <div className="flex justify-center py-2">
              <div className="flex flex-col items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{loadError}</span>
                </div>
                {onRetryLoadMessages && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={onRetryLoadMessages}
                    className="text-xs"
                  >
                    Thử lại
                  </Button>
                )}
              </div>
            </div>
          )}
          
          {/* Messages */}
          <MessageList
            messages={messages}
            senderId={senderId}
            onRetrySend={onRetrySend}
            onReplyMessage={onReplyMessage}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            // Group-specific props
            isGroup={isGroup}
            getSenderName={getSenderName}
            groupMembers={groupMembers}
          />
          
          {/* Initial loading indicator */}
          {isInitialLoad && isLoadingMessages && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                {t('loadingMessages')}
              </div>
            </div>
          )}
          
          {/* End of messages indicator */}
          {!hasMoreMessages && messages.length > 0 && (
            <div className="flex justify-center py-2">
              <div className="text-xs text-muted-foreground">
                {t('allMessagesLoaded')} ({totalMessageCount} {t('messageCount')})
              </div>
            </div>
          )}
          
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};