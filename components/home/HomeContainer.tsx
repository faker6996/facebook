"use client";

import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { User } from "@/lib/models/user";
import { callApi } from "@/lib/utils/api-client";
import { useEffect, useState } from "react";
import Header from "../layout/Header";

import { Menu } from "@/lib/models/menu";
import LeftSidebar from "../layout/SidebarLeft";
import SidebarRight from "../layout/SidebarRight";
interface HomeContainerProps {
  menus: Menu[];
}
export default function HomeContainer({ menus }: HomeContainerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const res = await callApi<User>(API_ROUTES.AUTH.ME, HTTP_METHOD_ENUM.GET);

      return res;
    };

    const user = fetchUserProfile();
    //setUsers([...user])
  }, []);

  return (
    <>
      <Header />
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Chào mừng đến với Home 🏡</h1>

        {loading ? (
          // <UserGuild></UserGuild>
          <>
            <div className="flex h-screen w-full overflow-hidden">
              <LeftSidebar menus={menus} />

              <main className="flex-1 overflow-y-auto bg-neutral-950 text-white">
                <div className="max-w-[600px] mx-auto p-4 space-y-4">
                  <div className="bg-neutral-800 p-4 rounded">📷 Story</div>
                  <div className="bg-neutral-800 p-4 rounded">📝 Bài viết 1</div>
                  <div className="bg-neutral-800 p-4 rounded">📝 Bài viết 2</div>
                  <div className="bg-neutral-800 p-4 rounded">📝 Bài viết 3</div>
                </div>
              </main>

              <SidebarRight />
            </div>
          </>
        ) : (
          <ul className="list-disc ml-5 space-y-1">
            {users.map((user) => (
              <li key={user.id}>
                {user.name} {user.email && `- ${user.email}`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
