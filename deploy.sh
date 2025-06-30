#!/bin/bash
set -euo pipefail

# --- CẤU HÌNH DỰ ÁN ---
# Facebook Next.js App
FB_REPO_URL="https://github.com/faker6996/facebook.git"
FB_WORKDIR="/home/infvn/fb/fb_src"
FB_BRANCH="main"
FB_DOCKER_SERVICE_NAME="web"

# Chat Server (.NET)
CHAT_REPO_URL="https://github.com/faker6996/chat-server.git"
CHAT_WORKDIR="/home/infvn/fb/chat_server_src"
CHAT_BRANCH="main"
CHAT_DOCKER_SERVICE_NAME="chat-server"

# --- HÀM LOG ---
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

# --- BIẾN TRẠNG THÁI ---
SHOULD_BUILD_CHAT_SERVER=false

# ==============================================================================
# BẮT ĐẦU QUÁ TRÌNH DEPLOY
# ==============================================================================

log "🚀 Bắt đầu deploy tổng hợp (Facebook & Chat Server)"

# --- 1. XỬ LÝ SOURCE CODE FACEBOOK ---
log "-----------------------------------------------------"
log "🌐 Xử lý source code Facebook Next.js"
log "-----------------------------------------------------"

if [ ! -d "$(dirname "$FB_WORKDIR")" ]; then
  mkdir -p "$(dirname "$FB_WORKDIR")"
fi

if [ -d "$FB_WORKDIR/.git" ]; then
  log "🔄 Repo Facebook đã tồn tại, pull về branch $FB_BRANCH"
  cd "$FB_WORKDIR"
  git fetch origin
  git checkout "$FB_BRANCH"
  git reset --hard "origin/$FB_BRANCH"
else
  log "📥 Clone mới Facebook về $FB_WORKDIR"
  git clone "$FB_REPO_URL" "$FB_WORKDIR"
  cd "$FB_WORKDIR"
  git checkout "$FB_BRANCH"
fi

log "✅ Đã cập nhật source code Facebook tại: $(pwd)"

# --- 2. XỬ LÝ SOURCE CODE CHAT SERVER ---
log "-----------------------------------------------------"
log "💬 Xử lý source code Chat Server .NET"
log "-----------------------------------------------------"

if [ ! -d "$(dirname "$CHAT_WORKDIR")" ]; then
  mkdir -p "$(dirname "$CHAT_WORKDIR")"
fi

if [ -d "$CHAT_WORKDIR/.git" ]; then
  log "🔄 Repo Chat Server đã tồn tại, kiểm tra thay đổi trên branch $CHAT_BRANCH"
  cd "$CHAT_WORKDIR"
  
  BEFORE_PULL_HASH=$(git rev-parse HEAD)
  log "Commit hash hiện tại: $BEFORE_PULL_HASH"

  git fetch origin
  git checkout "$CHAT_BRANCH"
  git reset --hard "origin/$CHAT_BRANCH"
  
  AFTER_PULL_HASH=$(git rev-parse HEAD)
  log "Commit hash mới nhất: $AFTER_PULL_HASH"

  if [ "$BEFORE_PULL_HASH" != "$AFTER_PULL_HASH" ]; then
    log "✨ Phát hiện có thay đổi mới cho Chat Server. Sẽ tiến hành build lại."
    SHOULD_BUILD_CHAT_SERVER=true
  else
    log "✅ Không có thay đổi mới cho Chat Server. Bỏ qua bước build."
  fi
else
  log "📥 Clone mới Chat Server về $CHAT_WORKDIR"
  git clone "$CHAT_REPO_URL" "$CHAT_WORKDIR"
  cd "$CHAT_WORKDIR"
  git checkout "$CHAT_BRANCH"
  log "✨ Đây là lần clone đầu tiên. Sẽ tiến hành build."
  SHOULD_BUILD_CHAT_SERVER=true
fi

# ĐÃ XÓA: Đoạn kiểm tra file .env của chat-server đã được xóa vì không còn cần thiết.
log "✅ Đã cập nhật source code Chat Server tại: $(pwd)"


# --- 3. DỪNG VÀ BUILD LẠI DOCKER ---
log "-----------------------------------------------------"
log "🐳 Xử lý Docker Compose"
log "-----------------------------------------------------"

log "📂 Di chuyển tới thư mục project chính: $FB_WORKDIR"
cd "$FB_WORKDIR"

log "🛑 Dừng các container cũ nếu có"
docker compose -f docker-compose.prod.yml down --remove-orphans || true

log "🔨 Build lại image cho $FB_DOCKER_SERVICE_NAME (luôn thực hiện)"
docker compose -f docker-compose.prod.yml build "$FB_DOCKER_SERVICE_NAME"

if [ "$SHOULD_BUILD_CHAT_SERVER" = "true" ]; then
  log "🔨 Chat Server có thay đổi, build lại image cho $CHAT_DOCKER_SERVICE_NAME"
  docker compose -f docker-compose.prod.yml build "$CHAT_DOCKER_SERVICE_NAME"
else
  log "👍 Bỏ qua build Chat Server."
fi

log "🚀 Khởi động lại toàn bộ các container..."
docker compose -f docker-compose.prod.yml up -d

log "✅ Hoàn tất deploy!"
