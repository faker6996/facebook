# Base image
FROM node:23

# Tạo thư mục app
WORKDIR /app

# Copy file cấu hình trước (tối ưu cache)
COPY package.json ./
COPY package-lock.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Expose port
EXPOSE 3000

# Start dev mode
CMD ["npm", "run", "dev"]
