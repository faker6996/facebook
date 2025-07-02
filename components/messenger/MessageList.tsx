// MessageList.tsx
import React from "react";
import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/formatTime";
import { Message } from "@/lib/models/message";
import { MessageStatusIcon } from "@/components/icons/MessageStatusIcon";

interface MessageListProps {
  messages: Message[];
  senderId: number | undefined;
  onRetrySend: (message: Message) => void;
}

const MessageList = ({ messages, senderId, onRetrySend }: MessageListProps) => {
  console.log("MessageList is rendering..."); // Bạn sẽ thấy log này ít hơn
  return (
    <>
      {messages.map((msg) => {
        const isSender = msg.sender_id === senderId;
        // Log này vẫn sẽ chạy khi MessageList render, nhưng MessageList sẽ không render lại khi bạn typing
        console.log("Rendering message:", msg);
        return (
          <div
            key={msg.id}
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

// Bọc component bằng React.memo
export default React.memo(MessageList);
