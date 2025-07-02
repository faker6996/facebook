// components/messenger/MessengerDropdown.tsx
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { MessengerPreview } from "@/lib/models/messenger_review";
import { formatTime } from "@/lib/utils/formatTime";
import { callApi } from "@/lib/utils/api-client";
import { User } from "@/lib/models/user";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
// MessengerContainer is no longer rendered directly by the dropdown
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface MessengerDropdownProps {
  onCloseDropdown: () => void;
  onOpenConversation: (conversation: MessengerPreview) => void; // New prop
}

export default function MessengerDropdown({ onCloseDropdown, onOpenConversation }: MessengerDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchUser, setSearchUser] = useState<string>("");
  const [conversations, setConversations] = useState<MessengerPreview[]>([]);
  const [loading, setLoading] = useState(true);
  // openConversations state is now managed in Header
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = loadFromLocalStorage("user", User);
        if (!user?.id) return;

        setUser(user);

        const res = await callApi<MessengerPreview[]>(API_ROUTES.MESSENGER.RECENT(user.id), HTTP_METHOD_ENUM.GET);

        setConversations(res);
      } catch (err) {
        console.error("Lỗi khi load conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onCloseDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCloseDropdown]);

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await callApi<MessengerPreview[]>(API_ROUTES.SEARCH.USER_NAME(searchUser), HTTP_METHOD_ENUM.GET);
      setConversations(res);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  // Call the new prop when a conversation is clicked
  const handleClickConversation = (item: MessengerPreview) => {
    onOpenConversation(item);
  };

  return (
    <div ref={dropdownRef} className="absolute right-0 top-14 w-96 bg-card shadow-lg rounded-md p-4 z-50">
      <h3 className="text-lg font-bold mb-2 text-foreground">Tin nhắn gần đây</h3>

      {loading ? (
        <div className="text-muted-foreground">Đang tải...</div>
      ) : conversations.length === 0 ? (
        <div className="text-muted-foreground">Không có cuộc trò chuyện nào</div>
      ) : (
        <div>
          <form onSubmit={handleSearchUser} className="flex gap-2 border-t bg-muted p-4">
            <Input value={searchUser} onChange={(e) => setSearchUser(e.target.value)} placeholder="Nhập tên bạn bè..." />
            <Button type="submit">Tìm</Button>
          </form>
          <ul className="divide-y divide-border">
            {conversations.map((item) => {
              const isUnread = !item.last_seen_at || !item.last_message_at || new Date(item.last_message_at) > new Date(item.last_seen_at);

              return (
                <li
                  key={item.conversation_id}
                  onClick={() => handleClickConversation(item)} // Use the new handler
                  className="flex items-center gap-3 py-2 hover:bg-muted cursor-pointer px-2 rounded transition duration-150"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.avatar_url || "/avatar.png"}
                      alt={item.other_user_name ?? "Avatar"}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-1">
                    <div className={`font-semibold ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>{item.other_user_name}</div>
                    <div className={`text-sm truncate ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {item.last_message}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatTime(item.last_message_at)}</div>
                  </div>

                  {isUnread && <div className="w-2 h-2 bg-primary rounded-full self-center"></div>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
