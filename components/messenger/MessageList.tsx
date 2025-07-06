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

/**
 * MessageList component
 * --------------------------------------------------
 * 1. Đảm bảo **key** duy nhất bằng cách ưu tiên:
 *    - `msg.clientId` (UUID tạm từ FE)
 *    - Fallback: `${msg.id}-${idx}` (id có thể 0 nhưng idx luôn khác nhau)
 * 2. Không thay đổi layout/logic hiển thị ngoài `key`.
 */
const MessageList: React.FC<MessageListProps> = ({ messages, senderId, onRetrySend }) => {
  return (
    <>
      {messages.map((msg, idx) => {
        const isSender = msg.sender_id === senderId;
        const key = (msg as any).clientId ?? `${msg.id}-${idx}`; // <- unique key

        return (
          <div
            key={key}
            className={cn(
              "max-w-[80%] w-fit break-words rounded-xl px-3 py-2 text-sm shadow-md flex flex-col",
              isSender ? "ml-auto bg-blue-600 text-white" : "mr-auto bg-gray-200 text-gray-800",
              msg.status === "Failed" && "bg-red-200 text-red-800 opacity-90"
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
                  <p className={cn("text-[11px]", isSender ? "text-white/70" : "text-gray-500")}>{formatTime(msg.created_at)}</p>
                  {isSender && (
                    <MessageStatusIcon
                      status={msg.status}
                      className={cn("size-4", isSender ? "text-white/80" : "text-gray-500", msg.status === "Read" && "!text-cyan-300")}
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
