"use client"; // Bắt buộc khi dùng `useEffect`

import { useEffect, useState } from "react";

export default function HomePage() {
  // const [users, setUsers] = useState([]);

  useEffect(() => {
    //getUsers().then(setUsers); tạm đóng lại vì api chưa có
  }, []);

  return (
    <div>
      <h1>Danh sách người dùng:</h1>
      {/* <pre>{JSON.stringify(users, null, 2)}</pre> */}
    </div>
  );
}
