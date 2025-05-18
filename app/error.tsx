"use client"; // Bắt buộc vì Next.js sử dụng Server Components

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("Lỗi hệ thống:", error);
  }, [error]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>🛑 Đã có lỗi xảy ra!</h1>
      <p>{error.message}</p>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "red",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginTop: "20px",
        }}
      >
        Thử lại 🔄
      </button>
    </div>
  );
}