"use client";

import { API_ROUTES } from "@/lib/constants/api-routes";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { User } from "@/lib/models/user";
import { callApi } from "@/lib/utils/api-client";
import { useEffect, useState } from "react";
import UserGuild from "../UserGuild";

export default function HomeContainer() {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Đã gửi!");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chào mừng đến với Home 🏡</h1>

      {loading ? (
        <UserGuild></UserGuild>
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
  );
}
