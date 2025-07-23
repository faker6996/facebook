"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { X, Info, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { MessengerPreview } from "@/lib/models/messenger_review";
import { GroupMember } from "@/lib/models/group";
import { cn } from "@/lib/utils/cn";
import { Video, Phone } from "lucide-react";

interface MessengerHeaderProps {
  conversation: MessengerPreview;
  isOtherUserOnline: boolean;
  groupMembers: GroupMember[];
  currentUserRole: string;
  onClose: (conversationId: number) => void;
  onStartVideoCall: () => void;
  onStartVoiceCall: () => void;
  onStartGroupVideoCall?: () => void;
  onStartGroupVoiceCall?: () => void;
  onShowGroupInfo: (show: boolean) => void;
  onShowGroupSettings: (show: boolean) => void;
}

export const MessengerHeader: React.FC<MessengerHeaderProps> = ({
  conversation,
  isOtherUserOnline,
  groupMembers,
  currentUserRole,
  onClose,
  onStartVideoCall,
  onStartVoiceCall,
  onStartGroupVideoCall,
  onStartGroupVoiceCall,
  onShowGroupInfo,
  onShowGroupSettings
}) => {
  const t = useTranslations('Messenger.header');
  const tGroup = useTranslations('GroupCall');
  const isGroup = conversation.is_group === true;

  return (
    <div className="flex items-center justify-between gap-3 border-b bg-card p-3 md:p-4 min-h-16 md:min-h-auto">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar với chỉ báo trạng thái hoạt động */}
        <div className="relative flex-shrink-0">
          <Avatar
            src={isGroup ? conversation.group_avatar_url : conversation.avatar_url ?? "/avatar.png"}
            size="md"
            className={cn(
              "w-10 h-10 md:w-8 md:h-8",
              isGroup ? "rounded-lg" : "rounded-full"
            )}
          />
          {!isGroup && (
            <span
              className={cn(
                "absolute bottom-0 right-0 block h-3 w-3 md:h-2.5 md:w-2.5 rounded-full ring-2 ring-card",
                isOtherUserOnline ? "bg-success" : "bg-muted-foreground"
              )}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-base md:text-sm truncate">
            {isGroup ? conversation.name : conversation.other_user_name}
          </p>
          <p className="text-sm md:text-xs text-muted-foreground truncate">
            {isGroup
              ? `${groupMembers.length} ${t('members')} • ${groupMembers.filter((m) => m.is_online).length} ${t('membersOnline')}`
              : isOtherUserOnline
              ? t('online')
              : t('offline')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Video Call Buttons - Only for private conversations */}
        {!isGroup && (
          <>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onStartVoiceCall} 
              title={t('voiceCall')}
              className="w-10 h-10 md:w-8 md:h-8"
            >
              <Phone className="h-5 w-5 md:h-4 md:w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onStartVideoCall} 
              title={t('videoCall')}
              className="w-10 h-10 md:w-8 md:h-8"
            >
              <Video className="h-5 w-5 md:h-4 md:w-4" />
            </Button>
          </>
        )}
        
        {isGroup && (
          <>
            {/* Group Call Buttons */}
            {onStartGroupVoiceCall && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={onStartGroupVoiceCall} 
                title={tGroup('voiceCallButton')}
                className="w-10 h-10 md:w-8 md:h-8"
              >
                <Phone className="h-5 w-5 md:h-4 md:w-4" />
              </Button>
            )}
            {onStartGroupVideoCall && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={onStartGroupVideoCall} 
                title={tGroup('videoCallButton')}
                className="w-10 h-10 md:w-8 md:h-8"
              >
                <Video className="h-5 w-5 md:h-4 md:w-4" />
              </Button>
            )}
            
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => onShowGroupInfo(true)} 
              title={t('groupInfo')}
              className="w-10 h-10 md:w-8 md:h-8"
            >
              <Info className="h-5 w-5 md:h-4 md:w-4" />
            </Button>
            {(currentUserRole === "admin" || currentUserRole === "moderator") && (
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => onShowGroupSettings(true)} 
                title={t('groupSettings')}
                className="w-10 h-10 md:w-8 md:h-8"
              >
                <Settings className="h-5 w-5 md:h-4 md:w-4" />
              </Button>
            )}
          </>
        )}
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => onClose(conversation.conversation_id!)}
          className="w-10 h-10 md:w-8 md:h-8"
        >
          <X className="h-6 w-6 md:h-5 md:w-5" />
        </Button>
      </div>
    </div>
  );
};