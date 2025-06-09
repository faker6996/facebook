# Base image
FROM node:23 AS builder

# Tạo thư mục app
WORKDIR /app

# Copy file cấu hình trước
COPY package.json package-lock.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Build Next.js
RUN npm run build

# ---------------------
# Stage chạy production
# ---------------------
FROM node:23

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app ./

# Chạy ở chế độ production
ENV NODE_ENV=production

# Mở port
EXPOSE 3000

# Chạy app
CMD ["npm", "run", "start"]
