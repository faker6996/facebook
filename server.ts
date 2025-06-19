import next from "next";
import { createServer } from "http";
import { socketIO } from "./lib/socket/socket.js"; // thêm .js vì Node ESM yêu cầu rõ extension

const app = next({ dev: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handler(req, res));
  socketIO.init(httpServer); // ✅ khởi tạo đúng nơi

  httpServer.listen(3000, () => {
    console.log("✅ Server chạy tại http://localhost:3000");
  });
});
