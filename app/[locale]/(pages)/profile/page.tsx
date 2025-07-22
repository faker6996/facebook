"use client";

import { useEffect, useState } from "react";
import { Camera, MapPin, Calendar, Mail, Phone, Edit3, Settings } from "lucide-react";
import { User } from "@/lib/models/user";
import { loadFromLocalStorage } from "@/lib/utils/local-storage";
import { callApi } from "@/lib/utils/api-client";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { Avatar } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";

export default function ProfilePage() {
  const [user, setUser] = useState(new User());
  const [loading, setLoading] = useState(true);
  const t = useTranslations('ProfilePage');

  useEffect(() => {
    // Load from localStorage first
    const cachedUser = loadFromLocalStorage("user", User);
    setUser(cachedUser);
    
    // Then fetch fresh data from API
    const fetchUserData = async () => {
      try {
        const freshUser = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET);
        if (freshUser) {
          setUser(freshUser);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-muted-foreground">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-80 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-lg overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <Button 
            size="sm" 
            variant="outline" 
            className="absolute bottom-4 right-4 bg-background/90 hover:bg-background"
          >
            <Camera className="h-4 w-4 mr-2" />
            {t('editCoverPhoto')}
          </Button>
        </div>

        {/* Profile Header */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative -mt-16">
                <Avatar 
                  src={user.avatar_url} 
                  size="lg"
                  className="border-4 border-background shadow-lg w-32 h-32"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="absolute bottom-2 right-2 rounded-full bg-background hover:bg-muted"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-foreground">
                  {user.name || user.user_name || t('user')}
                </h1>
                <p className="text-muted-foreground">@{user.user_name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('joinedSince')} {formatDate(user.created_at)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <Edit3 className="h-4 w-4 mr-2" />
                {t('editProfile')}
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* About */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">{t('about')}</h2>
              <div className="space-y-3">
                {user.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{t('joinedSince')} {formatDate(user.created_at)}</span>
                </div>

                {user.updated_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>{t('lastUpdate')} {formatDate(user.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">{t('stats')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">{t('friends')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">{t('groups')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4">{t('recentActivity')}</h2>
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📝</div>
                <p>{t('noActivity')}</p>
                <p className="text-sm">{t('startSharing')}</p>
              </div>
            </div>

            {/* Photos */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{t('photos')}</h2>
                <Button variant="ghost" size="sm">
                  {t('viewAll')}
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📷</div>
                <p>{t('noPhotos')}</p>
              </div>
            </div>

            {/* Friends */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{t('friends')}</h2>
                <Button variant="ghost" size="sm">
                  {t('viewAll')}
                </Button>
              </div>
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">👥</div>
                <p>{t('noFriends')}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  {t('findFriends')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}