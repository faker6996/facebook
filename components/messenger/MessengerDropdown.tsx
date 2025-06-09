"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MessengerPreview } from "@/lib/models/messenger_review";
import { formatTime } from "@/lib/utils/formatTime";
import { callApi } from "@/lib/utils/api-client";
import { User } from "@/lib/models/user";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import MessengerContainer from "@/components/messenger/MessengerContainer";

export default function MessengerDropdown() {
  const [conversations, setConversations] = useState<MessengerPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<MessengerPreview | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET);
        if (!user?.id) return;
        setCurrentUser(user);

        const res = await callApi<MessengerPreview[]>(API_ROUTES.MESSENGER.RECENT(user.id), HTTP_METHOD_ENUM.GET);
        debugger;
        setConversations(res);
      } catch (err) {
        console.error("Lỗi khi load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="absolute right-0 top-14 w-96 bg-white shadow-lg rounded-md p-4 z-50">
        <h3 className="text-lg font-bold mb-2">Tin nhắn gần đây</h3>

        {loading ? (
          <div className="text-gray-500">Đang tải...</div>
        ) : conversations.length === 0 ? (
          <div className="text-gray-500">Không có cuộc trò chuyện nào</div>
        ) : (
          <ul className="divide-y">
            {conversations.map((item) => {
              const isUnread =
                !item.last_seen_at || // chưa từng xem
                !item.last_message_at || // chưa từng có tin nhắn (coi như chưa xem)
                new Date(item.last_message_at) > new Date(item.last_seen_at);

              return (
                <li
                  key={item.conversation_id}
                  onClick={() => setSelectedConversation(item)}
                  className="flex items-center gap-3 py-2 hover:bg-gray-100 cursor-pointer px-2 rounded"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src={item.avatar_url || "/avatar.png"}
                      alt={item.other_user_name ?? "Avatar"}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-1">
                    <div className={`font-semibold ${isUnread ? "text-black" : "text-gray-800"}`}>{item.other_user_name}</div>
                    <div className={`text-sm truncate ${isUnread ? "text-black font-medium" : "text-gray-500"}`}>{item.last_message}</div>
                    <div className="text-xs text-gray-400">{formatTime(item.last_message_at)}</div>
                  </div>

                  {isUnread && <div className="w-2 h-2 bg-blue-500 rounded-full self-center"></div>}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 💬 Hiển thị khung chat khi chọn 1 conversation */}
      {selectedConversation && currentUser && (
        <MessengerContainer conversation={selectedConversation} currentUserId={currentUser.id!} onClose={() => setSelectedConversation(null)} />
      )}
    </>
  );
}
