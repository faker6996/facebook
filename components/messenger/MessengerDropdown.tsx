// components/messenger/MessengerDropdown.tsx
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { MessengerPreview } from "@/lib/models/messenger_review";
import { formatTime } from "@/lib/utils/formatTime";
import { callApi } from "@/lib/utils/api-client";
import { User } from "@/lib/models/user";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CreateGroupModal from "@/components/messenger/CreateGroupModal";
import { Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MessengerDropdownProps {
  onCloseDropdown: () => void;
  onOpenConversation: (conversation: MessengerPreview) => void; // New prop
}

export default function MessengerDropdown({ onCloseDropdown, onOpenConversation }: MessengerDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchUser, setSearchUser] = useState<string>("");
  const [conversations, setConversations] = useState<MessengerPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'private' | 'groups'>('all');

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
      const target = event.target as Node;
      
      // Don't close if clicking inside the dropdown
      if (dropdownRef.current && dropdownRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking on a modal (check for modal backdrop or modal content)
      const isModalClick = (target as Element)?.closest('[class*="fixed"][class*="inset-0"]') || 
                          (target as Element)?.closest('[class*="modal"]') ||
                          (target as Element)?.closest('[data-modal="true"]');
      
      if (!isModalClick) {
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

  const handleGroupCreated = (groupId: number) => {
    // Refresh conversations to include the new group
    if (user?.id) {
      const fetchConversations = async () => {
        try {
          const res = await callApi<MessengerPreview[]>(API_ROUTES.MESSENGER.RECENT(user.id), HTTP_METHOD_ENUM.GET);
          setConversations(res);
        } catch (err) {
          console.error("Error refreshing conversations:", err);
        }
      };
      fetchConversations();
    }
  };

  // Filter conversations based on selected filter
  const filteredConversations = conversations.filter(conv => {
    if (filter === 'private') return !conv.is_group;
    if (filter === 'groups') return conv.is_group;
    return true; // 'all'
  });

  return (
    <>
      <div ref={dropdownRef} className="absolute right-0 top-14 w-96 bg-card shadow-lg rounded-md p-4 z-50">
        {/* Header with Create Group Button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Tin nhắn gần đây</h3>
          <Button
            size="sm"
            onClick={() => setShowCreateGroupModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo nhóm
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex mb-4 bg-muted/50 rounded-lg p-1">
          <button
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
              filter === 'all' 
                ? "bg-card text-card-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </button>
          <button
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors",
              filter === 'private' 
                ? "bg-card text-card-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setFilter('private')}
          >
            Riêng tư
          </button>
          <button
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-1",
              filter === 'groups' 
                ? "bg-card text-card-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setFilter('groups')}
          >
            <Users className="h-3 w-3" />
            Nhóm
          </button>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Đang tải...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-muted-foreground">
            {filter === 'groups' ? 'Không có nhóm nào' : 
             filter === 'private' ? 'Không có tin nhắn riêng tư nào' : 
             'Không có cuộc trò chuyện nào'}
          </div>
        ) : (
          <div>
            <form onSubmit={handleSearchUser} className="flex gap-2 border-t border-border bg-muted/30 p-4 mb-4">
              <Input value={searchUser} onChange={(e) => setSearchUser(e.target.value)} placeholder="Nhập tên bạn bè..." />
              <Button type="submit">Tìm</Button>
            </form>
            <ul className="space-y-1">
              {filteredConversations.map((item) => {
              const isUnread = !item.last_seen_at || !item.last_message_at || new Date(item.last_message_at) > new Date(item.last_seen_at);

              return (
                <li
                  key={item.conversation_id}
                  onClick={() => handleClickConversation(item)} // Use the new handler
                  className="flex items-center gap-3 py-3 hover:bg-muted/50 cursor-pointer px-3 rounded-lg transition duration-150"
                >
                  <div className={cn(
                    "w-12 h-12 overflow-hidden bg-muted flex-shrink-0",
                    item.is_group ? "rounded-lg" : "rounded-full"
                  )}>
                    <Image
                      src={item.is_group ? (item.group_avatar_url || "/avatar.png") : (item.avatar_url || "/avatar.png")}
                      alt={item.is_group ? (item.name ?? "Group Avatar") : (item.other_user_name ?? "Avatar")}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`font-semibold ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.is_group ? item.name : item.other_user_name}
                      </div>
                      {item.is_group && (
                        <Users className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className={`text-sm truncate ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {item.is_group && item.last_message_sender ? (
                        <span>{item.last_message_sender}: {item.last_message_content || item.last_message}</span>
                      ) : (
                        item.last_message
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{formatTime(item.last_message_at)}</div>
                      {item.is_group && item.member_count && (
                        <div className="text-xs text-muted-foreground">{item.member_count} thành viên</div>
                      )}
                    </div>
                  </div>

                  {isUnread && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      </div>
      
      {/* Create Group Modal */}
      {user && (
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={handleGroupCreated}
          currentUser={user}
        />
      )}
    </>
  );
}
