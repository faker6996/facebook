"use client";

import { User } from "@/lib/models/user";
import { callApi } from "@/lib/utils/api-client";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await callApi<User[]>("/api/users", "GET");
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers(); // Đừng quên gọi
  }, []);

  return (
    <div>
      <h1>Danh sách người dùng:</h1>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            ID: {user.id} - Tên: {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
