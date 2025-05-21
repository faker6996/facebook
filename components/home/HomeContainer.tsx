'use client';

import { useEffect, useState } from 'react';
import { callApi } from '@/lib/utils/api-client';
import { User } from '@/lib/models/user';


export default function HomeContainer() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        debugger
        const res = await callApi<User[]>('/api/users', 'GET');
        setUsers(res);
      } catch (err) {
        console.error('Lỗi lấy danh sách user', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chào mừng đến với Home 🏡</h1>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
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
