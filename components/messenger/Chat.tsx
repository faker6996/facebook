"use client";

import { useState, useEffect, FormEvent } from "react";
import * as signalR from "@microsoft/signalr";

interface Message {
  user: string;
  content: string;
  timestamp: string;
}

const Chat = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState("User" + Math.floor(Math.random() * 100));
  const [input, setInput] = useState("");

  useEffect(() => {
    // Địa chỉ server C# của bạn
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/chathub") // Đảm bảo URL và port chính xác
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => console.log("SignalR Connected!"))
        .catch((err) => console.error("SignalR Connection Error: ", err));

      // Lắng nghe sự kiện "ReceiveMessage" từ server
      connection.on("ReceiveMessage", (user: string, content: string, timestamp: string) => {
        setMessages((prevMessages) => [...prevMessages, { user, content, timestamp }]);
      });
    }

    // Dọn dẹp connection khi component unmount
    return () => {
      connection?.stop();
    };
  }, [connection]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;

    try {
      // Gọi API để gửi tin nhắn, không gửi trực tiếp qua SignalR
      await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user, content: input }),
      });
      setInput("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div>
      <h1>Real-time Chat</h1>
      <div style={{ border: "1px solid #ccc", height: "300px", overflowY: "scroll", padding: "10px" }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.user}:</strong> {msg.content} <em>({new Date(msg.timestamp).toLocaleTimeString()})</em>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your message..." style={{ width: "80%" }} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
