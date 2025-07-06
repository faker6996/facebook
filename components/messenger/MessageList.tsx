import React from "react";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/formatTime";
import { Message } from "@/lib/models/message";
import { MessageStatusIcon } from "@/components/icons/MessageStatusIcon";

interface MessageListProps {
  messages: Message[];
  senderId?: number;
  onRetrySend: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, senderId, onRetrySend }) => {
  return (
    <>
      {messages.map((msg, idx) => {
        const isSender = msg.sender_id === senderId;
        const key = (msg as any).clientId ?? `${msg.id}-${idx}`;

        return (
          <div
            key={key}
            className={cn(
              "max-w-[80%] w-fit break-words rounded-xl px-3 py-2 text-sm shadow-md flex flex-col",
              // Sử dụng màu từ theme
              isSender ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted text-foreground",
              // Sử dụng màu destructive với độ trong suốt 20% cho nền
              msg.status === "Failed" && "bg-destructive/20 text-destructive opacity-90"
            )}
          >
            <p className="text-pretty">{msg.content}</p>
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
    </>
  );
};

export default React.memo(MessageList);
