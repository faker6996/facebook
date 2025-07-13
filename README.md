# Facebook Clone - Full-Stack Social Media Platform

A comprehensive Facebook clone built with modern technologies, featuring real-time messaging, group chat functionality, and a complete UI component library.

![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.7-38B2AC?style=for-the-badge&logo=tailwind-css)
![SignalR](https://img.shields.io/badge/SignalR-Real--time-purple?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)

## 🚀 Features

### **Frontend Features**
- ✅ **Complete UI Component Library** (25+ production-ready components)
- ✅ **Global Real-time Messaging** with instant connectivity after login
- ✅ **Group Chat System** with roles, permissions, and member management
- ✅ **Interactive Style Guide** for development and documentation
- ✅ **Modern Design System** with CSS variables and dark mode
- ✅ **Multi-language Support** (English/Vietnamese)
- ✅ **Authentication System** (Email/Password + OAuth Facebook/Google)
- ✅ **Responsive Design** mobile-first approach

### **Real-time Features**
- ✅ **Global SignalR Connection** - instant messaging everywhere in the app
- ✅ **Private Messaging** with file attachments and reactions
- ✅ **Group Chat** with admin/moderator/member roles
- ✅ **Live Notifications** with toast system
- ✅ **Online/Offline Status** tracking
- ✅ **Message Status** (sent, delivered, read)
- ✅ **File Sharing** (images, documents)
- ✅ **Message Reactions** and replies

### **Backend Features (.NET 9)**
- ✅ **SignalR Hub** for real-time communication
- ✅ **RabbitMQ** message queue system
- ✅ **PostgreSQL** database with comprehensive schema
- ✅ **JWT Authentication** with cookie-based tokens
- ✅ **Group Management API** with role-based permissions
- ✅ **File Upload System** with validation
- ✅ **RESTful APIs** for all operations

## 🏗️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15.3.1 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4.1.7 with custom design system
- **State Management**: React Context + Hooks
- **Real-time**: SignalR client (@microsoft/signalr)
- **Icons**: Lucide React
- **Internationalization**: next-intl

### **Backend**
- **Framework**: .NET 9
- **Real-time**: SignalR
- **Message Queue**: RabbitMQ
- **Database**: PostgreSQL
- **ORM**: Dapper
- **Authentication**: JWT Bearer tokens

### **Development & Deployment**
- **Containerization**: Docker (multi-environment)
- **CI/CD**: Jenkins pipeline
- **Environment**: Development, Staging, Production configs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- .NET 9 SDK
- PostgreSQL
- RabbitMQ
- Docker (optional)

### Frontend Setup

```bash
# Clone the repository
git clone <repository-url>
cd facebook

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure your environment variables

# Run development server
npm run dev
```

### Backend Setup

```bash
# Navigate to chat server directory
cd chat-server

# Restore packages
dotnet restore

# Update database connection in appsettings.json
# Run database migrations
psql -h your-host -d your-db -U your-user -f database_migration.sql

# Start the server
dotnet run
```

### Environment Variables

```env
# Frontend (.env.local)
NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Backend (appsettings.json)
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=facebook_db;Username=user;Password=pass"
  },
  "RabbitMQ": {
    "HostName": "localhost",
    "UserName": "guest",
    "Password": "guest"
  },
  "Jwt": {
    "Secret": "your-secret-key",
    "Issuer": "FacebookClone",
    "Audience": "facebook-client"
  }
}
```

## 📚 UI Component Library

Our Facebook Clone includes a comprehensive UI component library with 25+ production-ready components:

### **Form Controls**
- **Button**: 8 variants with loading states and icons
- **Input**: Advanced validation, focus animations, internationalized errors
- **Textarea**: 3 variants (default, filled, outlined) with size options
- **Checkbox**: Interactive states with smooth animations
- **Switch**: Enhanced toggle with hover effects
- **RadioGroup**: Traditional, card variant, and button group styles

### **Data Display**
- **Card**: Hoverable and clickable variants with backdrop blur
- **Badge**: Count badges, dot indicators, notification badges
- **Alert**: 5 variants with icons and backdrop effects
- **Avatar**: Progressive loading with fallbacks
- **Skeleton**: Multiple layouts for posts, messages, lists, tables

### **Navigation & Interaction**
- **Modal**: Full-featured with escape/overlay close, multiple sizes
- **DropdownMenu**: With icons, separators, destructive actions
- **Toast**: 4 types with positioning, actions, auto-dismiss
- **Progress**: Linear, circular, step progress with animations
- **Tooltip**: Hover information displays
- **Pagination**: Navigation controls

### **Design System Features**
- **CSS Variables**: Complete color system with semantic naming
- **Dark Mode**: Automatic support across all components
- **Backdrop Blur**: Modern glass morphism effects
- **Animation System**: Unified transitions with ease-soft timing
- **Accessibility**: ARIA support, keyboard navigation, WCAG compliance

### **Interactive Style Guide**
Access the live component playground:
```tsx
import UserGuide from "@/components/UserGuide";

// Use in a page to see all components in action
export default function StyleGuidePage() {
  return <UserGuide />;
}
```

## 🔄 Global SignalR System

### **Architecture**
Our SignalR system has been redesigned for optimal performance:

**Before (Per-Component Connection):**
```
Login → Navigate to Messenger → Click Conversation → 
Mount MessengerContainer → Initialize SignalR → Receive Messages
```

**After (Global Connection):**
```
Login → Auto-Initialize Global SignalR → 
Receive Messages Everywhere Instantly! 🚀
```

### **Global Context Usage**
```tsx
import { useSignalR } from "@/contexts/SignalRContext";

const { connection, isConnected, joinGroup, leaveGroup } = useSignalR();
```

### **Connection Status Monitoring**
```tsx
import { SignalRStatus } from "@/components/common/SignalRStatus";

<SignalRStatus />  // Shows: 🟢 Online | 5 users online
```

### **Real-time Features**
- **Global Toast Messages**: New messages display toast notifications anywhere in the app
- **Group Event Notifications**: Member additions, role changes, group updates
- **Connection Status**: Visual indicators for connection state
- **Online Presence**: Real-time user online/offline tracking
- **Performance Optimization**: Single connection instead of multiple

## 💬 Messaging System

### **Private Messaging**
- One-on-one conversations
- File attachments (images, documents)
- Message reactions with emoji
- Reply to specific messages
- Message status tracking
- Online/offline indicators

### **Group Chat**
- Create and manage groups with metadata
- Role-based permissions (Admin, Moderator, Member)
- Join request system for private groups
- Invite links for easy sharing
- Member management (add, remove, promote/demote)
- Group settings (public/private, member limits)
- Real-time group events

### **Message Features**
- Rich text content
- File attachments (max 10MB)
- Emoji reactions
- Reply threading
- Message status (sending, sent, delivered, read)
- Real-time delivery
- Message sync on reconnection

## 🎨 Component Examples

### Basic Button Usage
```tsx
import Button from "@/components/ui/Button";

// Primary action
<Button variant="primary" size="lg" onClick={handleSubmit}>
  Create Post
</Button>

// With loading state
<Button variant="primary" loading={isSubmitting}>
  {isSubmitting ? "Publishing..." : "Publish"}
</Button>

// With icons
<Button variant="outline" icon={ShareIcon} iconRight={ExternalLinkIcon}>
  Share Post
</Button>
```

### Toast Notifications
```tsx
import { useToast } from "@/components/ui/Toast";

const { addToast } = useToast();

// Success notification
addToast({
  type: "success",
  title: "Post Created",
  message: "Your post has been published successfully!",
  duration: 3000
});

// Error with retry action
addToast({
  type: "error",
  title: "Upload Failed",
  message: "Failed to upload image. Please try again.",
  action: {
    label: "Retry",
    onClick: () => retryUpload()
  }
});
```

### Modal Implementation
```tsx
import Modal from "@/components/ui/Modal";

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Create New Post"
  size="lg"
>
  <div className="space-y-4">
    <Textarea
      placeholder="What's on your mind?"
      rows={3}
    />
    <div className="flex justify-between">
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" icon={ImageIcon}>
          Photo
        </Button>
        <Button variant="ghost" size="sm" icon={VideoIcon}>
          Video
        </Button>
      </div>
      <Button variant="primary">Post</Button>
    </div>
  </div>
</Modal>
```

### Progress Components
```tsx
import { Progress, CircularProgress, StepProgress } from "@/components/ui/Progress";

// Linear progress
<Progress 
  value={uploadProgress} 
  label="Uploading..." 
  showValue 
  animated 
/>

// Circular progress
<CircularProgress 
  value={75} 
  size={64} 
  variant="success" 
  showValue 
/>

// Step progress
<StepProgress
  steps={["Upload", "Process", "Publish", "Complete"]}
  currentStep={2}
  variant="primary"
/>
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# Docker operations
npm run docker:local # Start local Docker environment
npm run docker:dev   # Start development Docker environment
npm run docker:prod  # Start production Docker environment
```

### Project Structure

```
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalization
│   │   ├── (pages)/             # Main pages
│   │   └── layout.tsx           # Root layout with providers
│   └── api/                     # API Routes
├── components/                   # React Components
│   ├── ui/                      # Complete UI Library (25+ components)
│   ├── UserGuide.tsx            # Interactive style guide
│   ├── providers/               # Global providers
│   ├── common/                  # Shared components
│   ├── messenger/               # Chat components
│   └── login/                   # Authentication components
├── contexts/                     # React Contexts
│   └── SignalRContext.tsx       # Global SignalR management
├── hooks/                       # Custom React Hooks
│   └── useGlobalSignalR.ts      # Auto SignalR initialization
├── lib/                         # Business Logic
│   ├── models/                  # Data models
│   ├── constants/               # Configuration
│   ├── utils/                   # Utility functions
│   └── middlewares/             # Middleware pipeline
└── i18n/                        # Internationalization
```

### Component Development Guidelines

When creating new components:

- ✅ Use project's CSS variables for colors
- ✅ Support dark mode automatically
- ✅ Include hover/focus states
- ✅ Add smooth transitions
- ✅ Provide TypeScript interfaces
- ✅ Include forwardRef when needed
- ✅ Add accessibility attributes
- ✅ Follow naming conventions
- ✅ Include size variants
- ✅ Document props and usage

### Color System

```css
/* CSS Variables (Auto Dark Mode) */
:root {
  --primary: 240 100% 66%;           /* Blue */
  --success: 142.1 76.2% 36.3%;      /* Green */
  --warning: 45 100% 51%;            /* Amber */
  --info: 200 86% 55%;               /* Blue */
  --destructive: 0 100% 50%;         /* Red */
  
  /* Semantic colors */
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --border: 214.3 31.8% 91.4%;
}

/* Dark mode automatically handled */
@media (prefers-color-scheme: dark) {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... other dark mode colors */
  }
}
```

## 🔧 API Documentation

### Authentication Endpoints
```
POST /api/auth/login              # Email/password login
POST /api/auth/sso_facebook       # Facebook OAuth
POST /api/auth/sso_google         # Google OAuth
GET  /api/auth/me                 # Current user info
POST /api/auth/logout             # Logout
```

### Messaging Endpoints
```
GET  /api/messenger/conversations # User conversations
GET  /api/messenger/messages      # Conversation messages
POST /api/messages                # Send message
GET  /api/messages/sync           # Sync missed messages
```

### Group Management
```
POST /api/groups                  # Create group
PUT  /api/groups/{id}             # Update group
GET  /api/groups/{id}/info        # Group information
GET  /api/groups/{id}/members     # Group members
POST /api/groups/{id}/members     # Add members
DELETE /api/groups/{id}/members/{userId} # Remove member
POST /api/groups/{id}/leave       # Leave group
POST /api/groups/{id}/promote     # Promote/demote member
GET  /api/groups/{id}/invite-link # Generate invite link
```

### SignalR Events
```
# Client → Server
SendMessage(request)              # Send private message
SendGroupMessage(request)         # Send group message
JoinGroup(groupId)               # Join group room
LeaveGroup(groupId)              # Leave group room

# Server → Client
ReceiveMessage                   # New message received
ReceiveReaction                  # Reaction added
RemoveReaction                   # Reaction removed
UserOnline/UserOffline           # User status changes
GroupMemberAdded/Removed         # Group member changes
GroupMemberPromoted              # Role changes
GroupUpdated                     # Group info changes
```

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup
1. Configure database connection
2. Set up RabbitMQ instance
3. Configure JWT secrets
4. Set up OAuth providers (Facebook, Google)
5. Configure file upload directories
6. Set up domain and CORS settings

## 📊 Performance Features

### Frontend Optimizations
- **Single SignalR Connection**: Eliminates resource waste from multiple connections
- **Skeleton Loading**: Better perceived performance with loading states
- **Component Lazy Loading**: Heavy components loaded when needed
- **Memoization**: Expensive calculations cached appropriately
- **Image Optimization**: Progressive loading with fallbacks

### Backend Optimizations
- **Connection Pooling**: Efficient database connections
- **Message Queuing**: RabbitMQ for scalable message processing
- **Automatic Reconnection**: Robust connection management
- **Caching Strategy**: Repository pattern ready for caching layer

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth with httpOnly cookies
- **CORS Configuration**: Proper cross-origin policies
- **Input Validation**: Request sanitization and validation
- **Role-based Access**: Route-level access control
- **Rate Limiting**: API request throttling
- **Cookie Security**: Secure, SameSite attributes

## 🌐 Browser Support

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions  
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Mobile

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: Bach Tran (bach.tv2000@gmail.com)
- **Frontend**: React/Next.js specialist
- **Backend**: .NET/SignalR specialist
- **UI/UX**: Design system architect

## 📞 Support

For support and questions:
- **Email**: bach.tv2000@gmail.com
- **Documentation**: See `UserGuide.md` and `SignalR-Global-Setup.md`
- **Issues**: Create an issue in the repository

---

## 🎉 Latest Updates (December 2024)

### **Major Enhancements**
- ✅ **Complete UI Component Library** (25+ production-ready components)
- ✅ **Global SignalR Architecture** with instant connectivity
- ✅ **Interactive Style Guide** for development reference
- ✅ **Toast Notification System** for global messaging
- ✅ **Performance Optimizations** with single connection architecture

### **Technical Achievements**
- **Enterprise-Grade Components** rivaling commercial libraries
- **Robust Real-time System** with error recovery
- **Comprehensive Documentation** with live examples
- **Production-Ready Architecture** optimized for deployment
- **Modern Development Tools** with TypeScript integration

### **Project Status: Production-Ready** 🚀

This Facebook Clone is now a **complete social media platform** ready for deployment with all features working seamlessly!

---

**Built with ❤️ using modern web technologies**