"use client";

import { useEffect, useState } from "react";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { callApi } from "@/lib/utils/api-client";
import { User } from "@/lib/models/user";
import { Menu } from "@/lib/models/menu";

import Card from "@/components/ui/Card";
import Container from "@/components/Container";
import Header from "@/components/layout/Header";
import LeftSidebar from "@/components/layout/SidebarLeft";
import SidebarRight from "@/components/layout/SidebarRight";
import MessengerContainer from "@/components/messenger/MessengerContainer";
import UserGuild from "@/components/UserGuild";
import { saveToLocalStorage } from "@/lib/utils/local-storage";

interface HomeContainerProps {
  menus: Menu[];
}

export default function HomeContainer({ menus }: HomeContainerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const res = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET);

      saveToLocalStorage("user", res);
      return res;
    };
    fetchUserProfile();
  }, []);

  return (
    <>
      <Header />
      <div className="flex min-h-screen w-full pt-16">
        {/* Sidebar trái */}
        <LeftSidebar menus={menus} className="shrink-0 border-r border-border" />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background text-card-foreground">
          <Container className="py-6">
            <div className="space-y-4">
              <Card>📷 Story</Card>
              <Card>📝 Bài viết 1</Card>
              <Card>📝 Bài viết 2</Card>
              <Card>📝 Bài viết 3</Card>
            </div>
            {/* <MessengerContainer></MessengerContainer> */}

            <UserGuild></UserGuild>
          </Container>
        </main>

        {/* Sidebar phải */}
        <aside className="w-[340px] shrink-0 border-l border-border bg-background">
          <SidebarRight />
        </aside>
      </div>
    </>
  );
}
