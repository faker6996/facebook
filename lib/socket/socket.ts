import { Server } from "socket.io";
import type { Server as HTTPServer } from "http";

declare global {
  var _io: Server | null;
}

global._io = global._io || null;

export const socketIO = {
  init(server: HTTPServer) {
    if (!global._io) {
      global._io = new Server(server, {
        path: "/api/socket",
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      });

      global._io.on("connection", (socket) => {
        console.log("🟢 Socket connected:", socket.id);

        socket.on("join", (roomId) => {
          socket.join(roomId);
          console.log(`👥 ${socket.id} joined room ${roomId}`);
        });

        socket.on("disconnect", () => {
          console.log("🔴 Socket disconnected:", socket.id);
        });
      });
    }

    return global._io;
  },

  getIO(): Server {
    if (!global._io) throw new Error("Socket.IO not initialized");
    return global._io;
  },
};
