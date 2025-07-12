# Tóm tắt Dự án Facebook Clone

## Thông tin cơ bản

- **Tên dự án**: attendance-system-fe-main (Facebook Clone)
- **Framework**: Next.js 15.3.1 với App Router
- **Ngôn ngữ**: TypeScript
- **Styling**: TailwindCSS 4.1.7
- **Database**: PostgreSQL (pg)
- **Cache**: Redis (ioredis)
- **Authentication**: JWT + Cookie-based auth
- **Real-time**: SignalR (@microsoft/signalr)

## Kiến trúc dự án

### Cấu trúc thư mục chính

```
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Đa ngôn ngữ (en, vi)
│   │   ├── (pages)/             # Các trang chính
│   │   │   ├── home/            # Trang chủ Facebook
│   │   │   ├── login/           # Đăng nhập
│   │   │   ├── forgot-password/ # Quên mật khẩu
│   │   │   └── reset-password/  # Đặt lại mật khẩu
│   │   └── layouts/             # Layout components
│   └── api/                     # API Routes
│       ├── auth/               # Authentication APIs
│       ├── messenger/          # Chat APIs
│       └── users/              # User management APIs
├── components/                   # React Components
│   ├── ui/                     # Base UI components (Button, Input, Textarea, Switch, etc.)
│   ├── layout/                 # Layout components (Header, Sidebar)
│   ├── home/                   # Trang chủ components
│   ├── login/                  # Đăng nhập components
│   └── messenger/              # Chat components
│       ├── MessengerContainer.tsx    # Main chat interface
│       ├── MessengerDropdown.tsx     # Chat dropdown với group filtering
│       ├── MessageList.tsx           # Message display với group support
│       ├── MessageInput.tsx          # Message input component
│       ├── CreateGroupModal.tsx      # Group creation modal ⭐ MỚI
│       ├── GroupSettingsModal.tsx    # Group management modal ⭐ MỚI
│       └── useSignalRConnection.ts   # SignalR hook với group events
├── lib/                         # Business Logic
│   ├── models/                 # Database models
│   │   ├── user.ts            # User model
│   │   ├── message.ts         # Message model với attachments/reactions
│   │   ├── messenger_review.ts # MessengerPreview với group support
│   │   └── group.ts           # Group models (Group, GroupMember, etc.) ⭐ MỚI
│   ├── modules/                # Business modules
│   │   ├── auth/              # Authentication logic
│   │   ├── messenger/         # Chat logic
│   │   └── user/              # User logic
│   ├── constants/             # Hằng số và cấu hình
│   │   ├── api-routes.ts      # API endpoints với group management ⭐ MỚI
│   │   └── enum.ts            # Message types (PRIVATE=1, GROUP=2)
│   ├── utils/                 # Utility functions
│   └── middlewares/           # Middleware pipeline
└── i18n/                       # Internationalization
```

## Tính năng chính

### 1. Authentication & Authorization

- **Đăng nhập thường**: Email/Password với bcrypt hashing
- **SSO**: Facebook và Google OAuth
- **JWT**: Cookie-based authentication với httpOnly
- **Middleware**: Auth pipeline với role-based access control
- **Password Reset**: Forgot/Reset password functionality

### 2. Messenger System (Real-time Chat)

- **SignalR**: Real-time bidirectional communication
- **Private Chat Features**:
  - Private messaging between users
  - File attachments (image, document)
  - Message reactions (emoji)
  - Reply to messages
  - Online/offline status
  - Message status (Sending, Delivered, Failed)
  - Retry failed messages
- **Group Chat Features** ⭐ **MỚI**:
  - Create và manage groups với roles (admin, moderator, member)
  - Group messaging với sender identification
  - Member management (add, remove, promote/demote)
  - Group settings (public/private, approval required, max members)
  - Invite link generation
  - Real-time group events (member join/leave, role changes)
  - Group info modal với member list và permissions
- **Architecture**:
  - Frontend: React components với SignalR hooks
  - Backend: Separate chat server với API integration
  - Database: Message history + group management trong PostgreSQL

### 3. Social Media Features

- **Home Feed**: Facebook-style timeline
- **User Profiles**: Avatar, status, user information
- **Menu System**: Dynamic navigation menu
- **Responsive Design**: Mobile-first approach

### 4. Internationalization (i18n)

- **Supported Languages**: English (en), Vietnamese (vi)
- **Implementation**: next-intl với route-based localization
- **URL Structure**: /[locale]/page-name

## Tech Stack chi tiết

### Frontend

- **Next.js 15.3.1**: App Router, Server Components
- **React 19**: Latest version với Concurrent Features
- **TypeScript 5**: Type safety
- **TailwindCSS 4.1.7**: Utility-first CSS với custom design system
- **Lucide React**: Icon library
- **Redux Toolkit**: State management

### Backend Integration

- **API Routes**: Next.js API handlers
- **PostgreSQL**: Main database
- **Redis**: Caching và session storage
- **External Chat Server**: Separate service cho real-time messaging

### Development & Deployment

- **Docker**: Multi-environment setup (local, dev, prod)
- **Jenkins**: CI/CD pipeline
- **Environment Configs**: Development, staging, production

## Models & Database Schema

### Core Models

- **User**: Thông tin người dùng, SSO support
- **Message**: Tin nhắn với attachments, reactions, reply support
- **MessengerPreview**: Conversation preview với group support
- **Menu**: Dynamic navigation system
- **Attachment**: File uploads
- **Reaction**: Message reactions
- **Group Models** ⭐ **MỚI**:
  - **Group**: Group info (name, description, settings, member count)
  - **GroupMember**: Member info với roles (admin, moderator, member)
  - **GroupJoinRequest**: Join request management
  - **CreateGroupRequest/UpdateGroupRequest**: API request DTOs

## API Endpoints

### Authentication

- `POST /api/auth/login` - Email/password login
- `POST /api/auth/sso_facebook` - Facebook OAuth
- `POST /api/auth/sso_google` - Google OAuth
- `GET /api/auth/me` - Current user info
- `POST /api/auth/logout` - Logout

### Messenger & Groups

**NextJS API Routes:**

- `GET /api/messenger/conversations` - User conversations (private + groups)
- `GET /api/messenger/messages` - Conversation messages
- `GET /api/search/user` - User search cho group invitations

**External Chat Server Endpoints** ⭐ **MỚI**:

**Group Management:**

- `POST /api/groups` - Create new group
- `PUT /api/groups/{id}` - Update group settings
- `GET /api/groups/{id}/info` - Get group information
- `GET /api/groups/{id}/members` - Get group members
- `POST /api/groups/{id}/members` - Add members to group
- `DELETE /api/groups/{id}/members/{userId}` - Remove member
- `POST /api/groups/{id}/leave` - Leave group
- `POST /api/groups/{id}/promote` - Promote/demote member
- `GET /api/groups/{id}/invite-link` - Generate invite link

**Join Requests:**

- `POST /api/groups/{id}/requests` - Request to join group
- `GET /api/groups/{id}/requests` - Get pending join requests
- `PUT /api/groups/{groupId}/requests/{requestId}` - Handle join request
- `POST /api/groups/join/{inviteCode}` - Join via invite link

**Real-time Features:**

- SignalR Hub `/chathub` cho group events

## Deployment & Environment

### Docker Setup

- **Local**: docker-compose.local.yml
- **Development**: docker-compose.dev.yml
- **Production**: docker-compose.prod.yml

### Environment Variables

- Database connection strings
- JWT secrets
- OAuth client IDs/secrets
- Chat server URLs
- Domain configurations

## Security Features

- **CORS**: Configurable cross-origin policies
- **Rate Limiting**: API request throttling
- **JWT**: Secure token-based authentication
- **Role Guards**: Route-level access control
- **Input Validation**: Request sanitization
- **Cookie Security**: HttpOnly, Secure, SameSite attributes

## Development Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
npm run docker:*     # Docker operations cho các environments
```

## Đặc điểm nổi bật

1. **Modular Architecture**: Clean separation của concerns
2. **Real-time Messaging**: Production-ready chat system với group support ⭐
3. **Group Chat System**: Comprehensive group management với roles và permissions ⭐
4. **Internationalization**: Multi-language support
5. **Security**: Comprehensive security measures
6. **Scalability**: Docker-based deployment ready
7. **Type Safety**: Full TypeScript implementation
8. **Modern Stack**: Latest versions của all dependencies
9. **Design System**: Consistent color scheme với dark mode support ⭐
10. **Real-time Events**: SignalR integration cho group events và status updates ⭐

## Group Chat Features Chi Tiết ⭐ **MỚI**

### **UI Components**

- **MessengerDropdown**:

  - Filter tabs (All, Private, Groups)
  - Create Group button
  - Group-specific display với member count
  - Integrated modal management

- **CreateGroupModal**:

  - Two-step wizard (Group Details → Add Members)
  - User search và selection interface
  - Group settings configuration
  - Real-time validation

- **GroupSettingsModal**:

  - Tabbed interface (General, Members, Permissions)
  - Member management với role-based actions
  - Group settings update
  - Invite link generation
  - Permission overview

- **MessageList**:
  - Group message styling với sender names
  - Role indicators (Crown cho admin, Shield cho moderator)
  - Group-specific avatars và layouts

### **Real-time Integration**

- **SignalR Events**:
  - `GroupMemberAdded/Removed`
  - `GroupMemberPromoted`
  - `GroupUpdated`
  - `UserJoinedGroup/LeftGroup`
  - Automatic group join/leave handling

### **Design System**

- **Color Consistency**: Synchronized với project's design system
- **Theme Support**: Responsive color scheme cho dark/light mode
- **Component Reusability**: Extensible UI component architecture

Đây là một Facebook clone hoàn chỉnh với đầy đủ tính năng social media, messaging system và **comprehensive group chat functionality**, sẵn sàng cho production deployment.

---

# Chat Server - Tóm Tắt Dự Án

## Tổng Quan

**Chat Server** là một ứng dụng backend chat realtime được xây dựng bằng **.NET 9**, **SignalR**, **RabbitMQ** và **PostgreSQL**. Dự án sử dụng kiến trúc message-driven để đảm bảo khả năng mở rộng và độ tin cậy cao. Hỗ trợ **private messaging**, **group chat**, **file attachments**, **message reactions**, và **video calling**.

## Công Nghệ Sử Dụng

### Core Technologies

- **.NET 9** - Framework chính
- **SignalR** - Real-time communication
- **RabbitMQ** - Message queue system
- **PostgreSQL** - Database chính
- **Dapper** - Micro ORM
- **JWT Bearer Authentication** - Xác thực qua cookie

### Dependencies

```xml
- Microsoft.AspNetCore.Authentication.JwtBearer (9.0.6)
- Microsoft.AspNetCore.OpenApi (9.0.4)
- Dapper (2.1.66)
- Npgsql (9.0.3)
- RabbitMQ.Client (7.1.2)
```

## Kiến Trúc Hệ Thống

### Message Flow Architecture

```
Client → HTTP POST → MessagesController
                    ↓
                MessageService (Business Logic)
                    ↓
                MessagePublisher → RabbitMQ Exchange
                                        ↓
                            RabbitMQ Queue (durable)
                                        ↓
                RabbitMQConsumerService ← Background Consumer
                    ↓
            SignalR Hub → Connected Clients (Real-time)
```

### Database Schema

**Core Tables:**

- **users** - Thông tin người dùng, online status, SSO support
- **messages** - Tin nhắn chính, support reply, content types
- **attachments** - File đính kèm (images, documents, archives)
- **message_reactions** - Emoji reactions trên tin nhắn
- **message_status** - Message delivery status tracking

**Group Chat Tables:**

- **conversations** - Group conversations với metadata
- **conversation_participants** - Group members với roles
- **group_permissions** - Role-based access control system
- **group_join_requests** - Join request workflow
- **pinned_messages** - Pinned messages trong groups

## Cấu Trúc Thư Mục

```
chat-server/
├── Applications/           # Application Services
│   ├── IChatClientNotifier.cs
│   ├── MessageService/     # Core business logic
│   └── MessagePublisher/   # RabbitMQ publishing
├── Controllers/            # HTTP API Endpoints
│   ├── BaseApiController.cs
│   ├── MessagesController.cs
│   ├── ReactionsController.cs
│   ├── UploadController.cs
│   ├── GroupsController.cs        # Group management
│   └── GroupJoinRequestsController.cs  # Join request workflow
├── Models/                 # Data models & DTOs
│   ├── Entity Models/      # User, Message, Attachment, MessageReaction, Conversation, GroupJoinRequest
│   ├── Request DTOs/       # SendMessageRequest, ReactionRequest, CreateGroupRequest, UpdateGroupRequest
│   └── Response DTOs/      # MessageResponse, ApiResponse<T>, GroupInfoResponse, GroupMemberResponse
├── Repositories/           # Data Access Layer
│   ├── Base/              # Generic repository pattern
│   ├── Messenger/         # Message data access
│   ├── Attachment/        # File attachment data
│   ├── Reaction/          # Reaction data access
│   ├── User/              # User data access
│   └── Group/             # Group management data access
├── SignalR/               # Real-time communication
│   ├── Hubs/              # ChatHub với video calling
│   └── Client notification services
├── Services/              # Background services
│   └── RabbitMQConsumerService.cs
├── Configs/               # Configuration classes
└── Constants/             # Enums và constants
```

## Tính Năng Chính

### 1. **Messaging System**

- **Public Messages**: Broadcast tới all clients
- **Private Messages**: 1-1 messaging với encryption ready
- **Group Messages**: Multi-member chat với roles và permissions
- **Reply Messages**: Trả lời tin nhắn cụ thể với nested replies
- **File Attachments**: Upload và share files/images (max 10MB)
- **Message Sync**: Đồng bộ tin nhắn missed khi reconnect
- **Message Status**: Sending, Sent, Delivered, Read, Failed tracking

### 2. **Real-time Features**

- **Instant Messaging**: SignalR cho tin nhắn realtime với auto-reconnect
- **Online/Offline Status**: Track user presence trong groups
- **Message Reactions**: Emoji reactions với real-time broadcast
- **Video Calling**: WebRTC signaling qua SignalR với ICE support
- **Group Presence**: Real-time member online/offline tracking
- **Live Notifications**: Group events, join requests, member changes

### 3. **Group Chat System** 🆕

- **Group Management**: Tạo, cập nhật, xóa groups với metadata
- **Member Roles**: Admin, Moderator, Member với permissions khác nhau
- **Join Requests**: Approval workflow cho private groups
- **Invite Links**: Unique codes cho easy joining
- **Member Limits**: Configurable max members (default 256)
- **Public/Private Groups**: Visibility và access control
- **Group Statistics**: Member count, online count, activity tracking
- **Permission System**: Granular permissions (add_members, remove_members, edit_info, etc.)

### 4. **File Management**

- **File Upload**: REST API với validation (max 10MB)
- **Multiple Formats**: Images, documents, archives
- **Static File Serving**: `/uploads` endpoint
- **Attachment Metadata**: File type, size tracking
- **Group File Sharing**: File attachments trong group messages

### 5. **Authentication & Security**

- **JWT Authentication**: Token-based auth với claims
- **Cookie-based Tokens**: `access_token` cookie HttpOnly
- **CORS Configuration**: NextJS integration với credentials
- **Route Protection**: All endpoints yêu cầu authentication
- **Role-based Access Control**: Group permissions enforcement

## API Endpoints

### Messages API

- `POST /api/messages` - Gửi tin nhắn mới (private/public/group)
- `GET /api/messages/sync` - Đồng bộ tin nhắn missed

### Groups API 🆕

- `POST /api/groups` - Tạo group mới
- `GET /api/groups` - Lấy danh sách groups của user
- `PUT /api/groups/{id}` - Cập nhật thông tin group
- `DELETE /api/groups/{id}` - Xóa group (admin only)
- `GET /api/groups/{id}/info` - Thông tin chi tiết group
- `GET /api/groups/{id}/members` - Danh sách members
- `POST /api/groups/{id}/members` - Thêm members
- `DELETE /api/groups/{id}/members/{userId}` - Xóa member
- `POST /api/groups/{id}/leave` - Rời khỏi group
- `POST /api/groups/{id}/promote` - Promote/demote member
- `GET /api/groups/{id}/invite-link` - Lấy invite link
- `POST /api/groups/{id}/regenerate-invite` - Regenerate invite link
- `POST /api/groups/join/{inviteCode}` - Join qua invite link
- `GET /api/groups/{id}/stats` - Thống kê group

### Join Requests API 🆕

- `POST /api/groups/{groupId}/requests` - Tạo join request
- `GET /api/groups/{groupId}/requests` - Lấy pending requests (admin)
- `PUT /api/groups/{groupId}/requests/{requestId}` - Approve/reject request
- `DELETE /api/groups/{groupId}/requests/{requestId}` - Cancel request
- `GET /api/groups/{groupId}/requests/my` - User's request status
- `GET /api/groups/{groupId}/requests/history` - Request history

### Reactions API

- `POST /api/reactions/add` - Thêm reaction
- `POST /api/reactions/remove` - Xóa reaction

### Upload API

- `POST /api/upload` - Upload file attachments

### SignalR Hub

- `/chathub` - WebSocket connection cho realtime messaging và group events

## SignalR Events 🆕

### Client → Server Methods

- `SendMessage(request)` - Gửi tin nhắn private/public
- `SendGroupMessage(request)` - Gửi tin nhắn group
- `JoinGroup(groupId)` - Join SignalR group
- `LeaveGroup(groupId)` - Leave SignalR group
- `SendCallOffer/Answer/IceCandidate` - Video calling
- `EndCall` - Kết thúc cuộc gọi

### Server → Client Events

**Messaging Events:**

- `ReceiveMessage` - Tin nhắn mới (private/public)
- `ReceiveGroupMessage` - Tin nhắn group mới
- `ReceiveReaction` - Reaction mới
- `RemoveReaction` - Xóa reaction

**Group Events:**

- `GroupCreated` - Group mới được tạo
- `GroupUpdated` - Thông tin group thay đổi
- `GroupDeleted` - Group bị xóa
- `GroupMemberAdded` - Member mới join
- `GroupMemberRemoved` - Member bị remove/leave
- `GroupMemberPromoted` - Role thay đổi
- `GroupJoinRequest` - Join request mới
- `GroupJoinRequestHandled` - Request được approve/reject

**Presence Events:**

- `UserOnline/UserOffline` - Global online status
- `UserJoinedGroup/UserLeftGroup` - Group presence
- `GroupMemberOnline/GroupMemberOffline` - Member status trong group

**Video Call Events:**

- `ReceiveCallOffer/Answer` - WebRTC signaling
- `ReceiveIceCandidate` - ICE candidate exchange
- `CallEnded` - Cuộc gọi kết thúc

## Configuration

### Database Connection

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=bachtv.ydns.eu;Database=adoria_db;Username=adoria;Password=adoria@2025"
}
```

### RabbitMQ Configuration

```json
"RabbitMQ": {
  "HostName": "bachtv.ydns.eu",
  "UserName": "adoria",
  "Password": "adoria@2025"
}
```

### JWT Settings

```json
"Jwt": {
  "Secret": "U8iWs7OulxJM+0xawBtTKisEQ0E1m7wjUanQIvhptYucj7EYvD9eo3sMMtLwA375Q4lIYtZXftpfa9T/zhnSYg==",
  "Issuer": "Adoria",
  "Audience": "adoria-client"
}
```

## Message Queue Architecture

### RabbitMQ Setup

- **Exchange**: `chat_topic_exchange` (Topic Exchange)
- **Queue**: `chat_messages_queue` (Durable)
- **Routing Keys**:
  - `chat.private.{userId}` - Private messages
  - `chat.group.{groupId}` - Group messages
  - `chat.public.all` - Public broadcasts

### Message Processing

1. **Producer**: MessageService → MessagePublisher → RabbitMQ
2. **Consumer**: RabbitMQConsumerService → Database → SignalR Broadcast
3. **Reliability**: Durable queues, message acknowledgment
4. **Scalability**: Multiple consumer instances supported

## Repository Pattern Implementation

### Base Repository Features

- **Generic CRUD Operations**: Get, Insert, Update, Delete
- **Attribute-based Mapping**: `[Table]`, `[Key]`, `[NotMapped]`
- **Snake_case Conversion**: PostgreSQL naming convention
- **Async Operations**: Non-blocking database calls
- **Partial Updates**: Efficient field-level updates

### Specialized Repositories

- **MessageRepo**: Complex queries cho conversations
- **AttachmentRepo**: File metadata management
- **ReactionRepo**: Duplicate checking, reaction management
- **UserRepo**: Online status và last_seen tracking

## SignalR Implementation

### Hub Methods

- **SendMessage**: Receive messages từ clients
- **JoinGroup/LeaveGroup**: Chat room management
- **Video Call Methods**: WebRTC signaling support
- **Connection Lifecycle**: Online/offline status updates

### Client Notifications

- **ReceiveMessage**: Broadcast tin nhắn mới
- **ReceiveReaction**: Emoji reaction events
- **UserOnline/UserOffline**: Presence notifications
- **Video Call Events**: Call offers, answers, ICE candidates

## Security & Authentication

### JWT Integration

- **Token Source**: HTTP cookies (`access_token`)
- **Claims-based Identity**: User ID extraction
- **Custom UserIdProvider**: SignalR user identification
- **Token Validation**: Issuer, audience, signature verification

### CORS Policy

- **Allowed Origins**: localhost:3000, \*.aistudio.com.vn
- **Credentials Support**: Cookie-based authentication
- **Methods**: All HTTP methods allowed
- **Headers**: Flexible header support

## Database Migrations

### Core Tables

```sql
-- Messages với reply support
ALTER TABLE messages ADD COLUMN reply_to_message_id INTEGER REFERENCES messages(id);
ALTER TABLE messages ADD COLUMN content_type VARCHAR(20) DEFAULT 'text';

-- Attachments system
CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Reaction system
CREATE TABLE message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    emoji VARCHAR(20) NOT NULL,
    reacted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    UNIQUE(message_id, user_id, emoji)
);
```

### Performance Indexes

- `idx_attachments_message_id` - Attachment queries
- `idx_message_reactions_message_id` - Reaction lookups
- `idx_messages_reply_to_message_id` - Reply chains
- `idx_messages_content_type` - Content filtering

## Development & Deployment

### Development Setup

1. **Prerequisites**: .NET 9, PostgreSQL, RabbitMQ
2. **Database**: Run `database_migration.sql`
3. **Configuration**: Update `appsettings.json`
4. **Run**: `dotnet run` hoặc F5 trong IDE

### Docker Support

- `Dockerfile` có sẵn cho containerization
- Multi-stage build pattern
- Production-ready configuration

### Frontend Integration

- **CORS**: Configured cho NextJS (localhost:3000)
- **Static Files**: `/uploads` folder serving
- **WebSocket**: SignalR connection tại `/chathub`
- **Authentication**: Cookie-based JWT tokens

## Monitoring & Logging

### Logging Configuration

- **Console Logging**: Simple formatter với timestamps
- **Log Levels**: Information default, Warning cho ASP.NET Core
- **Structured Logging**: JSON format support
- **Error Tracking**: Comprehensive exception logging

### Health Monitoring

- **Database Connection**: PostgreSQL health checks
- **RabbitMQ Connection**: Message queue monitoring
- **SignalR Connections**: Active connection tracking
- **Background Services**: Consumer service health

## Scalability Considerations

### Horizontal Scaling

- **Stateless Design**: Controllers không lưu state
- **Message Queue**: RabbitMQ cho load balancing
- **Database**: PostgreSQL với connection pooling
- **File Storage**: Local storage có thể chuyển cloud

### Performance Optimizations

- **Async/Await**: Non-blocking operations throughout
- **Connection Pooling**: Database connection efficiency
- **Message Batching**: RabbitMQ batch processing support
- **Caching Strategy**: Repository pattern sẵn sàng cho caching layer

## Future Enhancements

### Planned Features

- **Message Encryption**: End-to-end encryption support
- **File Storage**: Cloud storage integration (AWS S3, Azure Blob)
- **Push Notifications**: Mobile push notification service
- **Message Search**: Full-text search capabilities
- **User Management**: Advanced user roles và permissions

### Technical Improvements

- **Redis Integration**: Caching layer và session storage
- **Microservices**: Service decomposition
- **API Gateway**: Centralized routing và rate limiting
- **Monitoring**: APM tools integration (Application Insights)

---

## Quick Reference Commands

```bash
# Development
dotnet run                          # Start development server
dotnet build                        # Build project
dotnet test                         # Run tests (if available)

# Database
psql -h bachtv.ydns.eu -d adoria_db -U adoria  # Connect to database
\i database_migration.sql           # Run core migrations
\i group_chat_migrations.sql        # Run group chat migrations

# Docker
docker build -t chat-server .       # Build container
docker run -p 5000:80 chat-server   # Run container
```

## Contact & Documentation

- **Project**: Chat Server Backend với Full Group Chat Support
- **Framework**: .NET 9 + SignalR + RabbitMQ
- **Database**: PostgreSQL với Group Chat schema
- **Architecture**: Clean Architecture với Repository Pattern
- **Deployment**: Docker-ready với production configuration
- **Latest Update**: Complete Group Chat implementation với role-based permissions, join requests, invite links, và real-time events

## 🆕 **New Group Chat Features (Latest Update)**

✅ **Group Management** - Create, update, delete groups  
✅ **Role-based Permissions** - Admin, Moderator, Member roles  
✅ **Join Request System** - Approval workflow cho private groups  
✅ **Invite Links** - Unique codes với easy sharing  
✅ **Real-time Group Events** - Live notifications cho tất cả group activities  
✅ **Group File Sharing** - Attachments trong group messages  
✅ **Member Presence** - Online/offline tracking trong groups  
✅ **Group Statistics** - Member counts, activity analytics

**All features are production-ready với comprehensive API documentation và real-time SignalR events!**
