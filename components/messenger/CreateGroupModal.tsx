"use client";

import React, { useState, useEffect } from "react";
import { X, Users, Plus, Check, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Switch } from "@/components/ui/Switch";
import { User } from "@/lib/models/user";
import { CreateGroupRequest } from "@/lib/models/group";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { callApi } from "@/lib/utils/api-client";
import { cn } from "@/lib/utils/cn";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (groupId: number) => void;
  currentUser: User;
}

interface UserSearchResult extends User {
  isSelected: boolean;
}

export default function CreateGroupModal({ 
  isOpen, 
  onClose, 
  onGroupCreated, 
  currentUser 
}: CreateGroupModalProps) {
  const t = useTranslations("CreateGroup");
  
  const [step, setStep] = useState<'details' | 'members'>('details');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [requireApproval, setRequireApproval] = useState(false);
  const [maxMembers, setMaxMembers] = useState(50);
  
  // Member selection
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent modal from closing when clicking inside
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setGroupName('');
      setGroupDescription('');
      setIsPublic(true);
      setRequireApproval(false);
      setMaxMembers(50);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
    }
  }, [isOpen]);

  // Search users function
  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await callApi<User[]>(
        API_ROUTES.SEARCH.USER_NAME(query),
        HTTP_METHOD_ENUM.GET
      );
      
      // Filter out current user and already selected users
      const filteredUsers = (users || [])
        .filter(user => user.id !== currentUser.id)
        .map(user => ({
          ...user,
          isSelected: selectedUsers.some(selected => selected.id === user.id)
        }));
      
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Failed to search users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Auto search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => searchUsers(searchQuery), 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedUsers, currentUser.id]);

  // Handle Enter key search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault();
      searchUsers(searchQuery);
    }
  };

  const handleUserToggle = (user: UserSearchResult) => {
    if (user.isSelected) {
      setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers(prev => [...prev, { ...user, isSelected: true }]);
    }
    
    // Update search results
    setSearchResults(prev => prev.map(u => 
      u.id === user.id ? { ...u, isSelected: !u.isSelected } : u
    ));
  };

  const handleRemoveSelectedUser = (userId: number) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
    setSearchResults(prev => prev.map(u => 
      u.id === userId ? { ...u, isSelected: false } : u
    ));
  };

  const canProceedToMembers = () => {
    return groupName.trim().length >= 3;
  };

  const canCreateGroup = () => {
    return canProceedToMembers() && selectedUsers.length >= 1;
  };

  const handleCreateGroup = async () => {
    if (!canCreateGroup()) return;

    setIsCreating(true);
    try {
      const createRequest: CreateGroupRequest = {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
        is_public: isPublic,
        require_approval: requireApproval,
        max_members: maxMembers,
        initial_members: selectedUsers.map(user => user.id!)
      };

      const response = await callApi<{ group_id: number }>(
        API_ROUTES.CHAT_SERVER.CREATE_GROUP,
        HTTP_METHOD_ENUM.POST,
        createRequest
      );

      if (response?.group_id) {
        onGroupCreated(response.group_id);
        onClose();
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      // You can add toast notification here
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" 
      onClick={handleBackdropClick}
      data-modal="true"
    >
      <div 
        className="bg-card rounded-lg w-full max-w-md mx-4 max-h-[90vh] flex flex-col border border-border shadow-lg" 
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            {step === 'details' ? t('title') : t('addMembers')}
          </h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {step === 'details' ? (
            <div className="p-4 space-y-4">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('groupName')} *
                </label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={t('groupNamePlaceholder')}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {groupName.length}/50 {t('charactersCount')}
                </p>
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('groupDescription')}
                </label>
                <Textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  placeholder={t('groupDescriptionPlaceholder')}
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {groupDescription.length}/200 {t('charactersCount')}
                </p>
              </div>

              {/* Group Settings */}
              <div className="space-y-3">
                <h3 className="font-medium">{t('groupSettings')}</h3>
                
                {/* Public/Private */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t('publicGroup')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('publicGroupDescription')}
                    </p>
                  </div>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>

                {/* Require Approval */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t('requireApproval')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('requireApprovalDescription')}
                    </p>
                  </div>
                  <Switch
                    checked={requireApproval}
                    onCheckedChange={setRequireApproval}
                  />
                </div>

                {/* Max Members */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('maxMembers')}
                  </label>
                  <Input
                    type="number"
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Math.max(5, Math.min(500, parseInt(e.target.value) || 50)))}
                    min={5}
                    max={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('maxMembersRange')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={t('searchPlaceholder')}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="p-4 border-b border-border">
                  <p className="text-sm font-medium mb-2">
                    {t('selected')} ({selectedUsers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user, index) => (
                      <div
                        key={`selected-${user.id}-${user.user_name || user.email}-${index}`}
                        className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        <Avatar src={user.avatar_url} size="sm" />
                        <span>{user.name || user.user_name}</span>
                        <button
                          onClick={() => handleRemoveSelectedUser(user.id!)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              <ScrollArea className="flex-1 p-4">
                {isSearching ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('searching')}
                  </div>
                ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('noUsersFound')}
                  </div>
                ) : searchQuery.length < 2 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('enterToSearch')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((user, index) => (
                      <div
                        key={`search-${user.id}-${user.user_name || user.email}-${index}`}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                          user.isSelected && "bg-primary/10"
                        )}
                        onClick={() => handleUserToggle(user)}
                      >
                        <Avatar src={user.avatar_url} size="sm" />
                        <div className="flex-1">
                          <p className="font-medium">{user.name || user.user_name}</p>
                          <p className="text-sm text-muted-foreground">@{user.user_name}</p>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          user.isSelected 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "border-border"
                        )}>
                          {user.isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-2">
          {step === 'details' ? (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t('cancel')}
              </Button>
              <Button 
                onClick={() => setStep('members')}
                disabled={!canProceedToMembers()}
                className="flex-1"
              >
                {t('next')}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setStep('details')} 
                className="flex-1"
              >
                {t('back')}
              </Button>
              <Button 
                onClick={handleCreateGroup}
                disabled={!canCreateGroup() || isCreating}
                className="flex-1"
              >
                {isCreating ? t('creating') : t('create')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}