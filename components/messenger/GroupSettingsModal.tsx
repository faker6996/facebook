"use client";

import React, { useState, useEffect } from "react";
import { X, Crown, Shield, User, MoreHorizontal, UserMinus, Copy, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Switch } from "@/components/ui/Switch";
import { GroupMember, Group, UpdateGroupRequest } from "@/lib/models/group";
import { User as UserType } from "@/lib/models/user";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { callApi } from "@/lib/utils/api-client";
import { cn } from "@/lib/utils/cn";

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  members: GroupMember[];
  currentUser: UserType;
  currentUserRole: string;
  onGroupUpdated: (group: Group) => void;
  onMemberRemoved: (userId: number) => void;
  onMemberPromoted: (userId: number, newRole: string) => void;
}

type Tab = 'general' | 'members' | 'permissions';

export default function GroupSettingsModal({ 
  isOpen, 
  onClose, 
  group,
  members,
  currentUser,
  currentUserRole,
  onGroupUpdated,
  onMemberRemoved,
  onMemberPromoted
}: GroupSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [loading, setLoading] = useState(false);
  
  // General settings
  const [groupName, setGroupName] = useState(group.name);
  const [groupDescription, setGroupDescription] = useState(group.description || '');
  const [isPublic, setIsPublic] = useState(group.is_public);
  const [requireApproval, setRequireApproval] = useState(group.require_approval);
  const [maxMembers, setMaxMembers] = useState(group.max_members);
  
  // Member management
  const [showMemberActions, setShowMemberActions] = useState<number | null>(null);
  
  // Invite link
  const [inviteLink, setInviteLink] = useState<string>('');
  const [linkCopied, setLinkCopied] = useState(false);

  const isAdmin = currentUserRole === 'admin';
  const isModerator = currentUserRole === 'moderator';
  const canManageSettings = isAdmin;
  const canManageMembers = isAdmin || isModerator;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setGroupName(group.name);
      setGroupDescription(group.description || '');
      setIsPublic(group.is_public);
      setRequireApproval(group.require_approval);
      setMaxMembers(group.max_members);
      setShowMemberActions(null);
      setActiveTab('general');
      
      // Load invite link if admin
      if (isAdmin) {
        loadInviteLink();
      }
    }
  }, [isOpen, group, isAdmin]);

  const loadInviteLink = async () => {
    try {
      const response = await callApi<{ invite_link: string }>(
        API_ROUTES.CHAT_SERVER.GET_INVITE_LINK(group.id),
        HTTP_METHOD_ENUM.GET
      );
      if (response?.invite_link) {
        setInviteLink(response.invite_link);
      }
    } catch (error) {
      console.error('Failed to load invite link:', error);
    }
  };

  const handleUpdateGroup = async () => {
    if (!canManageSettings) return;

    setLoading(true);
    try {
      const updateRequest: UpdateGroupRequest = {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        is_public: isPublic,
        require_approval: requireApproval,
        max_members: maxMembers
      };

      const updatedGroup = await callApi<Group>(
        API_ROUTES.CHAT_SERVER.UPDATE_GROUP(group.id),
        HTTP_METHOD_ENUM.PUT,
        updateRequest
      );

      if (updatedGroup) {
        onGroupUpdated(updatedGroup);
      }
    } catch (error) {
      console.error('Failed to update group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!canManageMembers || userId === currentUser.id) return;

    try {
      await callApi(
        API_ROUTES.CHAT_SERVER.REMOVE_MEMBER(group.id, userId),
        HTTP_METHOD_ENUM.DELETE
      );
      onMemberRemoved(userId);
      setShowMemberActions(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handlePromoteMember = async (userId: number, newRole: 'admin' | 'moderator') => {
    if (!isAdmin || userId === currentUser.id) return;

    try {
      await callApi(
        API_ROUTES.CHAT_SERVER.PROMOTE_MEMBER(group.id),
        HTTP_METHOD_ENUM.POST,
        { user_id: userId, role: newRole }
      );
      onMemberPromoted(userId, newRole);
      setShowMemberActions(null);
    } catch (error) {
      console.error('Failed to promote member:', error);
    }
  };

  const handleDemoteMember = async (userId: number) => {
    if (!isAdmin || userId === currentUser.id) return;

    try {
      await callApi(
        API_ROUTES.CHAT_SERVER.PROMOTE_MEMBER(group.id),
        HTTP_METHOD_ENUM.POST,
        { user_id: userId, role: 'member' }
      );
      onMemberPromoted(userId, 'member');
      setShowMemberActions(null);
    } catch (error) {
      console.error('Failed to demote member:', error);
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteLink) return;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy invite link:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-warning" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-info" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'moderator':
        return 'Điều hành viên';
      default:
        return 'Thành viên';
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { admin: 0, moderator: 1, member: 2 };
    const aOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 2;
    const bOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 2;
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.name || '').localeCompare(b.name || '');
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose} data-modal="true">
      <div className="bg-card rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col border border-border shadow-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">Cài đặt nhóm</h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'general'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('general')}
          >
            Chung
          </button>
          <button
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === 'members'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setActiveTab('members')}
          >
            Thành viên ({members.length})
          </button>
          {isAdmin && (
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'permissions'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab('permissions')}
            >
              Quyền hạn
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'general' && (
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {/* Group Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tên nhóm
                  </label>
                  <Input
                    value={groupName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupName(e.target.value)}
                    disabled={!canManageSettings}
                    maxLength={50}
                  />
                </div>

                {/* Group Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mô tả nhóm
                  </label>
                  <Textarea
                    value={groupDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGroupDescription(e.target.value)}
                    disabled={!canManageSettings}
                    rows={3}
                    maxLength={200}
                  />
                </div>

                {/* Group Settings */}
                {canManageSettings && (
                  <div className="space-y-3">
                    <h3 className="font-medium">Cài đặt</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Nhóm công khai</p>
                        <p className="text-xs text-muted-foreground">
                          Mọi người có thể tìm thấy và tham gia nhóm
                        </p>
                      </div>
                      <Switch
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Yêu cầu duyệt</p>
                        <p className="text-xs text-muted-foreground">
                          Admin phê duyệt yêu cầu tham gia
                        </p>
                      </div>
                      <Switch
                        checked={requireApproval}
                        onCheckedChange={setRequireApproval}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Số thành viên tối đa
                      </label>
                      <Input
                        type="number"
                        value={maxMembers}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxMembers(Math.max(5, Math.min(500, parseInt(e.target.value) || 50)))}
                        min={5}
                        max={500}
                      />
                    </div>
                  </div>
                )}

                {/* Invite Link */}
                {isAdmin && inviteLink && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Link mời
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={inviteLink}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        onClick={handleCopyInviteLink}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        {linkCopied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {linkCopied ? 'Đã sao chép' : 'Sao chép'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {activeTab === 'members' && (
            <ScrollArea className="h-full">
              <div className="p-4">
                <div className="space-y-2">
                  {sortedMembers.map(member => (
                    <div
                      key={member.user_id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 group"
                    >
                      <Avatar src={member.avatar_url} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name}</p>
                          {getRoleIcon(member.role)}
                          <span className="text-sm text-muted-foreground">
                            {getRoleText(member.role)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Tham gia {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Member Actions */}
                      {canManageMembers && member.user_id !== currentUser.id && (
                        <div className="relative">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setShowMemberActions(
                              showMemberActions === member.user_id ? null : member.user_id
                            )}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          
                          {showMemberActions === member.user_id && (
                            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-48" onClick={(e) => e.stopPropagation()}>
                              {/* Role Management (Admin only) */}
                              {isAdmin && member.role !== 'admin' && (
                                <>
                                  {member.role === 'member' && (
                                    <button
                                      className="w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center gap-2"
                                      onClick={() => handlePromoteMember(member.user_id, 'moderator')}
                                    >
                                      <Shield className="h-4 w-4" />
                                      Thăng cấp thành Điều hành viên
                                    </button>
                                  )}
                                  {member.role === 'member' && (
                                    <button
                                      className="w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center gap-2"
                                      onClick={() => handlePromoteMember(member.user_id, 'admin')}
                                    >
                                      <Crown className="h-4 w-4" />
                                      Thăng cấp thành Quản trị viên
                                    </button>
                                  )}
                                  {member.role === 'moderator' && (
                                    <button
                                      className="w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center gap-2"
                                      onClick={() => handleDemoteMember(member.user_id)}
                                    >
                                      <User className="h-4 w-4" />
                                      Hạ cấp thành Thành viên
                                    </button>
                                  )}
                                  <hr />
                                </>
                              )}
                              
                              {/* Remove Member */}
                              <button
                                className="w-full px-4 py-2 text-left hover:bg-muted/50 text-destructive flex items-center gap-2"
                                onClick={() => handleRemoveMember(member.user_id)}
                              >
                                <UserMinus className="h-4 w-4" />
                                Xóa khỏi nhóm
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}

          {activeTab === 'permissions' && isAdmin && (
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Phân quyền</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Quản lý quyền hạn của các thành viên trong nhóm
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Quản trị viên</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Thay đổi cài đặt nhóm</li>
                      <li>• Thêm/xóa thành viên</li>
                      <li>• Thăng/hạ cấp thành viên</li>
                      <li>• Tạo link mời</li>
                      <li>• Xóa tin nhắn</li>
                    </ul>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-info" />
                      <span className="font-medium">Điều hành viên</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Thêm/xóa thành viên</li>
                      <li>• Xóa tin nhắn</li>
                      <li>• Quản lý yêu cầu tham gia</li>
                    </ul>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Thành viên</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Gửi tin nhắn</li>
                      <li>• Xem lịch sử tin nhắn</li>
                      <li>• Rời khỏi nhóm</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'general' && canManageSettings && (
          <div className="p-4 border-t border-border flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateGroup}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}