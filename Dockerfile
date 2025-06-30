# ---------- Build Stage ----------
    FROM node:23 AS builder

    WORKDIR /app
    
    # Copy cấu hình và cài đặt tất cả dependencies
    COPY package.json package-lock.json ./
    RUN npm install
    
    # Copy toàn bộ mã nguồn
    COPY . .
    
    # --- THAY ĐỔI QUAN TRỌNG ---
    # 1. Khai báo một build argument. Docker sẽ nhận giá trị này từ docker-compose.
    ARG NEXT_PUBLIC_CHAT_SERVER_URL
    # 2. Đặt giá trị của argument đó vào một biến môi trường để `npm run build` có thể đọc được
    ENV NEXT_PUBLIC_CHAT_SERVER_URL=$NEXT_PUBLIC_CHAT_SERVER_URL
    # --- KẾT THÚC THAY ĐỔI ---
    
    # Build ứng dụng
    RUN npm run build
    
    # ---------- Production Stage ----------
    FROM node:23-slim
    
    WORKDIR /app
    ENV NODE_ENV=production
    
    # Copy cần thiết từ stage build
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/package.json ./package.json
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/next.config.ts ./next.config.ts
    
    # Expose port
    EXPOSE 3000
    
    # Run production server
    CMD ["npm", "run", "start"]
    