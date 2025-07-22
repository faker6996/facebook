import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/formatTime";
import { Message, MessageReaction } from "@/lib/models/message";
import { GroupMember } from "@/lib/models/group";
import { Avatar } from "@/components/ui/Avatar";
import { MessageStatusIcon } from "@/components/icons/MessageStatusIcon";
import { FileText, Download, Image, X, FileVideo, FileAudio, Archive, File, Reply, Smile, Crown, Shield } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslations } from "next-intl";

interface MessageListProps {
  messages: Message[];
  senderId?: number;
  onRetrySend: (message: Message) => void;
  onReplyMessage?: (message: Message) => void;
  onAddReaction?: (messageId: number, emoji: string) => void;
  onRemoveReaction?: (messageId: number, emoji: string) => void;
  // Group-specific props
  isGroup?: boolean;
  getSenderName?: (senderId: number) => string;
  groupMembers?: GroupMember[];
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, senderId, onRetrySend, onReplyMessage, onAddReaction, onRemoveReaction,
  isGroup = false, getSenderName, groupMembers = []
}) => {
  const t = useTranslations("Messenger.content");
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageName, setViewingImageName] = useState<string>("");
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);

  const availableReactions = ["❤️", "👍", "😂", "😮", "😢", "😡"];

  const getSenderRole = (senderUserId: number): string => {
    if (!isGroup) return '';
    const member = groupMembers.find(m => m.user_id === senderUserId);
    return member?.role || 'member';
  };

  const getSenderAvatar = (senderUserId: number): string => {
    if (!isGroup) return '';
    const member = groupMembers.find(m => m.user_id === senderUserId);
    return member?.avatar_url || '/avatar.png';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType?.startsWith('video/')) return <FileVideo className="h-4 w-4" />;
    if (fileType?.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    if (fileType?.includes('zip') || fileType?.includes('rar') || fileType?.includes('7z')) return <Archive className="h-4 w-4" />;
    if (fileType?.includes('pdf') || fileType?.includes('doc') || fileType?.includes('txt') || fileType?.includes('xls') || fileType?.includes('ppt')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const openImageViewer = (imageUrl: string, imageName: string) => {
    setViewingImage(imageUrl);
    setViewingImageName(imageName);
  };

  const closeImageViewer = () => {
    setViewingImage(null);
    setViewingImageName("");
  };

  const handleReactionClick = (messageId: number, emoji: string) => {
    if (!onAddReaction || !onRemoveReaction) return;
    
    const message = messages.find(m => m.id === messageId);
    const userReaction = message?.reactions?.find(r => r.user_id === senderId && r.emoji === emoji);
    
    if (userReaction) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
    setShowReactionPicker(null);
  };

  const getReactionCount = (reactions: MessageReaction[] | undefined, emoji: string) => {
    return reactions?.filter(r => r.emoji === emoji).length || 0;
  };

  const hasUserReacted = (reactions: MessageReaction[] | undefined, emoji: string) => {
    return reactions?.some(r => r.user_id === senderId && r.emoji === emoji) || false;
  };

  return (
    <>
      {messages.map((msg, idx) => {
        const isSender = msg.sender_id === senderId;
        const key = (msg as any).clientId ?? `${msg.id}-${idx}`;
        const senderName = isGroup && !isSender ? getSenderName?.(msg.sender_id || 0) : '';
        const senderRole = getSenderRole(msg.sender_id || 0);
        const senderAvatar = getSenderAvatar(msg.sender_id || 0);
        
        const showAvatar = isGroup && !isSender && (
          idx === messages.length - 1 || 
          messages[idx + 1]?.sender_id !== msg.sender_id
        );

        return (
          <div
            key={key}
            className={cn(
              "flex gap-2 w-full max-w-none pt-2",
              isSender ? "justify-end" : "justify-start"
            )}
          >
            {/* Avatar for group messages */}
            {showAvatar && (
              <Avatar 
                src={senderAvatar} 
                size="sm" 
                className="mt-auto flex-shrink-0" 
              />
            )}
            
            <div className={cn(
              "flex flex-col gap-1 max-w-[70%] min-w-0 w-full",
              isSender ? "items-end" : "items-start"
            )}>
              {/* Sender name for group messages */}
              {isGroup && !isSender && senderName && (
                <div className="flex items-center gap-1 px-3">
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {senderName}
                  </span>
                  {senderRole === 'admin' && (
                    <Crown className="h-3 w-3 text-warning flex-shrink-0" />
                  )}
                  {senderRole === 'moderator' && (
                    <Shield className="h-3 w-3 text-info flex-shrink-0" />
                  )}
                </div>
              )}

              {/* Message bubble */}
              <div
                className={cn(
                  "relative group px-3 py-2 rounded-2xl text-sm shadow-md flex flex-col",
                  "max-w-full min-w-0 break-words overflow-wrap-anywhere",
                  isSender
                    ? "bg-primary text-primary-foreground"
                    : isGroup 
                      ? "bg-muted text-foreground border-l-2 border-l-primary" // Group message style
                      : "bg-muted text-muted-foreground",
                  msg.status === "Failed" && "bg-destructive/20 text-destructive opacity-90",
                  !msg.content && msg.attachments && msg.attachments.length > 0 && "py-2"
                )}
              >
            {/* Replied Message Preview */}
            {msg.replied_message && (
              <div className={cn(
                "mb-2 p-2 rounded-lg border-l-2 text-xs opacity-75",
                isSender ? "border-primary-foreground/40 bg-primary-foreground/10" : "border-muted-foreground/40 bg-muted/50"
              )}>
                <p className="font-medium">{t('replyTo')}</p>
                <p className="truncate">{msg.replied_message.content || t('fileAttachment')}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className={cn(
              "absolute -top-8 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1 z-30",
              isSender ? "left-0" : "right-0"
            )}>
              {/* Reply Button */}
              {onReplyMessage && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onReplyMessage(msg)}
                  className={cn(
                    "h-6 w-6",
                    isSender ? "bg-primary-foreground/20 hover:bg-primary-foreground/30" : "bg-muted-foreground/20 hover:bg-muted-foreground/30"
                  )}
                >
                  <Reply className="h-3 w-3" />
                </Button>
              )}
              
              {/* Reaction Button */}
              {onAddReaction && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowReactionPicker(showReactionPicker === Number(msg.id) ? null : Number(msg.id))}
                  className={cn(
                    "h-6 w-6",
                    isSender ? "bg-primary-foreground/20 hover:bg-primary-foreground/30" : "bg-muted-foreground/20 hover:bg-muted-foreground/30"
                  )}
                >
                  <Smile className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Reaction Picker */}
            {showReactionPicker === Number(msg.id) && (
              <div className={cn(
                "absolute -top-16 z-40 bg-card border border-border rounded-lg shadow-lg p-2 flex gap-1",
                "min-w-fit whitespace-nowrap",
                isSender ? "right-0" : "left-0"
              )}>
                {availableReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(Number(msg.id), emoji)}
                    className="hover:bg-muted p-2 rounded-md text-lg transition-colors active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {msg.content && <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere hyphens-auto">{msg.content}</p>}
            
            {/* Hiển thị attachments */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className={cn("space-y-2", msg.content ? "mt-2" : "mt-0")}>
                {msg.attachments.map((attachment, attIdx) => (
                  <div
                    key={attIdx}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border",
                      isSender ? "border-primary-foreground/20 bg-primary-foreground/10" : "border-muted-foreground/20 bg-background/50"
                    )}
                  >
                    {attachment.file_type?.startsWith('image/') ? (
                      <img
                        src={attachment.file_url}
                        alt={attachment.file_name}
                        className="w-full max-w-[200px] h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageViewer(attachment.file_url || '', attachment.file_name || '')}
                      />
                    ) : (
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-background/70 rounded p-1 transition-colors"
                        onClick={() => downloadFile(attachment.file_url || '', attachment.file_name || '')}
                      >
                        {getFileIcon(attachment.file_type || '')}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{attachment.file_name}</p>
                          <p className="text-xs opacity-70">{formatFileSize(attachment.file_size || 0)}</p>
                        </div>
                        <Download className="h-3 w-3 opacity-70" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reactions Display */}
            {msg.reactions && msg.reactions.length > 0 && (
              <div className={cn(
                "flex flex-wrap gap-1 mt-2 relative z-10",
                isSender ? "justify-end" : "justify-start"
              )}>
                {availableReactions.map((emoji) => {
                  const count = getReactionCount(msg.reactions, emoji);
                  const userReacted = hasUserReacted(msg.reactions, emoji);
                  
                  if (count === 0) return null;
                  
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(Number(msg.id), emoji)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200",
                        "border shadow-sm hover:shadow-md active:scale-95",
                        userReacted 
                          ? "bg-primary/10 text-primary border-primary/40 hover:bg-primary/20" 
                          : "bg-card border-border hover:bg-muted/50"
                      )}
                    >
                      <span>{emoji}</span>
                      <span className="font-medium">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

              </div>

              {/* Message status */}
              <div className="flex items-center gap-1 px-3">
                <span className="text-xs text-muted-foreground">
                  {formatTime(msg.created_at)}
                </span>
                {isSender && (
                  <MessageStatusIcon
                    status={msg.status}
                    className={cn(
                      "h-3 w-3",
                      isSender ? "text-primary-foreground/80" : "text-muted-foreground",
                      msg.status === "Read" && "!text-cyan-300"
                    )}
                  />
                )}
                {msg.status === 'Failed' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 text-xs text-red-600 hover:text-red-700"
                    onClick={() => onRetrySend(msg)}
                  >
                    {t('retry')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={viewingImage}
              alt={viewingImageName}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => downloadFile(viewingImage, viewingImageName)}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={closeImageViewer}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(MessageList);
