import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/formatTime";
import { Message, MessageReaction } from "@/lib/models/message";
import { MessageStatusIcon } from "@/components/icons/MessageStatusIcon";
import { FileText, Download, Image, X, FileVideo, FileAudio, Archive, File, Reply, Smile } from "lucide-react";
import Button from "@/components/ui/Button";

interface MessageListProps {
  messages: Message[];
  senderId?: number;
  onRetrySend: (message: Message) => void;
  onReplyMessage?: (message: Message) => void;
  onAddReaction?: (messageId: number, emoji: string) => void;
  onRemoveReaction?: (messageId: number, emoji: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, senderId, onRetrySend, onReplyMessage, onAddReaction, onRemoveReaction }) => {
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageName, setViewingImageName] = useState<string>("");
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);

  const availableReactions = ["❤️", "👍", "😂", "😮", "😢", "😡"];

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

        return (
          <div
            key={key}
            className={cn(
              "max-w-[80%] w-fit break-words rounded-xl px-3 py-2 text-sm shadow-md flex flex-col group relative",
              // Sử dụng màu từ theme
              isSender ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted text-foreground",
              // Sử dụng màu destructive với độ trong suốt 20% cho nền
              msg.status === "Failed" && "bg-destructive/20 text-destructive opacity-90",
              // Nếu không có content và chỉ có attachments, điều chỉnh padding
              !msg.content && msg.attachments && msg.attachments.length > 0 && "py-2"
            )}
          >
            {/* Replied Message Preview */}
            {msg.replied_message && (
              <div className={cn(
                "mb-2 p-2 rounded-lg border-l-2 text-xs opacity-75",
                isSender ? "border-primary-foreground/40 bg-primary-foreground/10" : "border-muted-foreground/40 bg-muted/50"
              )}>
                <p className="font-medium">Trả lời tin nhắn:</p>
                <p className="truncate">{msg.replied_message.content || "File attachment"}</p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className={cn(
              "absolute -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
              isSender ? "left-2" : "right-2"
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
                "absolute -top-12 z-10 bg-background border rounded-lg shadow-lg p-2 flex gap-1",
                isSender ? "left-2" : "right-2"
              )}>
                {availableReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReactionClick(Number(msg.id), emoji)}
                    className="hover:bg-muted p-1 rounded text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {msg.content && <p className="text-pretty">{msg.content}</p>}
            
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
                        className="max-w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageViewer(attachment.file_url || '', attachment.file_name || '')}
                      />
                    ) : (
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-background/70 rounded p-1 transition-colors"
                        onClick={() => downloadFile(attachment.file_url || '', attachment.file_name || '')}
                      >
                        {getFileIcon(attachment.file_type || '')}
                        <div className="flex-1">
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
              <div className="flex flex-wrap gap-1 mt-2">
                {availableReactions.map((emoji) => {
                  const count = getReactionCount(msg.reactions, emoji);
                  const userReacted = hasUserReacted(msg.reactions, emoji);
                  
                  if (count === 0) return null;
                  
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(Number(msg.id), emoji)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
                        userReacted 
                          ? "bg-primary/20 text-primary border border-primary/30" 
                          : "bg-muted hover:bg-muted/70"
                      )}
                    >
                      <span>{emoji}</span>
                      <span className="font-medium">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center self-end mt-1.5 gap-2">
              {msg.status === "Failed" ? (
                <>
                  <span className="text-xs font-semibold">Gửi lỗi</span>
                  <button onClick={() => onRetrySend(msg)} className="text-xs font-bold hover:underline">
                    Thử lại
                  </button>
                </>
              ) : (
                <>
                  <p className={cn("text-[11px]", isSender ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTime(msg.created_at)}</p>
                  {isSender && (
                    <MessageStatusIcon
                      status={msg.status}
                      className={cn(
                        "size-4",
                        isSender ? "text-primary-foreground/80" : "text-muted-foreground",
                        msg.status === "Read" && "!text-cyan-300"
                      )}
                    />
                  )}
                </>
              )}
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
