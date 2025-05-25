"use client";

import { useEffect, useState } from "react";
import { callApi } from "@/lib/utils/api-client";
import { User } from "@/lib/models/user";
import { HTTP_METHOD_ENUM } from "@/lib/constants/enum";
import { API_ROUTES } from "@/lib/constants/api-routes";
import Input from "../ui/Input";
import Alert from "../ui/Alert";

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
        <div>
          <p>Đang tải dữ liệu...</p>
          <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-4 mt-10">
            <Input name="username" label="Tên người dùng" placeholder="Nhập tên..." required />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Gửi
            </button>
          </form>

          <Alert variant="success" title="Đăng nhập thất bại" description="Sai tên đăng nhập hoặc mật khẩu." />
        </div>
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
