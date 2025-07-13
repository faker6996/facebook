# SignalR Global Setup - Documentation

## Tổng Quan

Đã thực hiện refactor hệ thống SignalR để **global connection** thay vì tạo connection riêng cho từng MessengerContainer. Điều này giải quyết vấn đề:

- ✅ **SignalR hoạt động ngay sau khi login** (không cần vào messenger)
- ✅ **Nhận tin nhắn real-time** ở bất kỳ đâu trong app
- ✅ **Tránh multiple connections** và resource waste
- ✅ **Global notifications** cho tin nhắn mới
- ✅ **Centralized connection management**

## Kiến Trúc Mới

### 1. Global SignalR Context
**File**: `contexts/SignalRContext.tsx`

- Quản lý **single SignalR connection** cho toàn app
- Tự động **reconnect** và **sync missed messages**
- **Global event handlers** cho tin nhắn, reactions, group events
- **Toast notifications** cho tin nhắn mới

```tsx
const { connection, isConnected, joinGroup, leaveGroup } = useSignalR();
```

### 2. Auto-Initialization
**File**: `components/providers/SignalRInit.tsx`

- Tự động detect user login và khởi tạo SignalR
- Listen cho auth changes (login/logout)
- Trigger connection khi cần thiết

### 3. Global Hook
**File**: `hooks/useGlobalSignalR.ts`

- Hook để integrate với authentication
- Tự động setup/teardown connection based on user state

### 4. Messenger Integration
**File**: `components/messenger/useGlobalSignalRConnection.ts`

- Thay thế `useSignalRConnection` cũ
- Kết nối với global connection thay vì tạo mới
- Handle message filtering cho conversation hiện tại

## Setup trong App

### 1. Root Layout Integration

**File**: `app/[locale]/layout.tsx`

```tsx
import { AppProviders } from "@/components/providers/AppProviders";

export default function RootLayout({ children, params }) {
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <AppProviders>  {/* Bao gồm SignalR + Toast providers */}
            {children}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 2. Login Integration

**File**: `components/login/LoginContainer.tsx`

```tsx
import { triggerAuthChange } from "@/components/providers/SignalRInit";

const handleLogin = async () => {
  await callApi(API_ROUTES.AUTH.LOGIN, ...);
  
  // Trigger SignalR initialization
  triggerAuthChange();
  
  router.push('/');
};
```

### 3. Messenger Update

**File**: `components/messenger/MessengerContainer.tsx`

```tsx
// Thay đổi từ:
import { useSignalRConnection } from "./useSignalRConnection";

// Thành:
import { useGlobalSignalRConnection } from "./useGlobalSignalRConnection";

// Sử dụng:
const { isConnected } = useGlobalSignalRConnection({
  sender,
  conversation,
  messages,
  setMessages,
  // ... other props
});
```

## Features Mới

### 1. Global Notifications

Tin nhắn mới sẽ hiển thị **Toast notifications** ngay cả khi không đang trong messenger:

```tsx
// Tự động hiển thị khi có tin nhắn mới
"📨 John Doe: Hello there! How are you doing today?"
```

### 2. Connection Status Indicator

**File**: `components/common/SignalRStatus.tsx`

```tsx
import { SignalRStatus } from "@/components/common/SignalRStatus";

// Hiển thị trong header hoặc bất kỳ đâu
<SignalRStatus />  // Shows: 🟢 Online | 5 online users
```

### 3. Global Online Users

Track tất cả users online trong app:

```tsx
const { onlineUsers, isConnected } = useSignalR();

console.log(`${onlineUsers.size} users online`);
console.log('Connection:', isConnected ? 'CONNECTED' : 'OFFLINE');
```

### 4. Group Management

Centralized group join/leave:

```tsx
const { joinGroup, leaveGroup } = useSignalR();

// Trong group conversation
await joinGroup(groupId);

// Khi rời conversation
await leaveGroup(groupId);
```

## Migration Guide

### Các Thay Đổi Cần Thiết:

1. **Layout**: Đã update `app/[locale]/layout.tsx` với `AppProviders`

2. **Login**: Đã update `LoginContainer.tsx` với `triggerAuthChange()`

3. **Messenger**: Đã update `MessengerContainer.tsx` với `useGlobalSignalRConnection`

4. **Dependencies**: Các file mới được tạo và sẵn sàng sử dụng

### Backward Compatibility:

- ✅ **Không breaking changes** cho existing functionality
- ✅ **Messages vẫn hoạt động** như cũ
- ✅ **Group chat features** vẫn intact
- ✅ **File uploads, reactions** vẫn work

## Flow Hoạt Động

### 1. User Login Flow
```
Login → triggerAuthChange() → SignalRInit detects user → 
Creates global connection → Ready to receive messages
```

### 2. Message Reception Flow
```
Server sends message → Global SignalR receives → 
Toast notification (if not in conversation) → 
MessengerContainer receives (if in conversation) → 
Updates message list
```

### 3. Group Management Flow
```
Enter group conversation → useGlobalSignalRConnection → 
joinGroup() via global connection → 
Receive group-specific events → 
Leave when conversation closes
```

## Debugging & Monitoring

### Console Logs
Hệ thống có comprehensive logging:

```
🚀 SignalRInit: Found logged in user: 123
🔗 SignalR connection status for user 123: CONNECTED
📨 Global: Received new message: {...}
👤 User 456 is now ONLINE
🏠 Global: Joining group: 789
```

### Connection Status
Check connection tại bất kỳ đâu:

```tsx
const { connection, isConnected } = useSignalR();

console.log('Connection state:', connection?.state);
console.log('Is connected:', isConnected);
console.log('Connection ID:', connection?.connectionId);
```

### Toast Notifications
Tự động hiển thị cho:
- ✅ **New messages** từ other users
- ✅ **Group member additions**
- ✅ **Group member role changes**
- ✅ **Connection status changes**

## Benefits

### Performance
- ✅ **Single connection** thay vì multiple
- ✅ **Reduced resource usage**
- ✅ **Faster message delivery**
- ✅ **Better connection stability**

### User Experience
- ✅ **Immediate connectivity** after login
- ✅ **Real-time notifications** everywhere
- ✅ **Connection status visibility**
- ✅ **Seamless messaging experience**

### Development
- ✅ **Centralized connection management**
- ✅ **Easier debugging**
- ✅ **Consistent event handling**
- ✅ **Better error recovery**

## Troubleshooting

### Common Issues

1. **SignalR không connect sau login:**
   - Check console cho `triggerAuthChange()` call
   - Verify `NEXT_PUBLIC_CHAT_SERVER_URL` environment variable
   - Check chat server đang chạy

2. **Không nhận được tin nhắn:**
   - Check `isConnected` status
   - Verify connection.state trong console
   - Check server logs

3. **Multiple connections:**
   - Ensure không còn sử dụng `useSignalRConnection` cũ
   - Check để không có duplicate providers

### Debug Commands

```tsx
// Check global connection
const { connection } = useSignalR();
console.log('Connection:', connection?.state);

// Test connection
connection?.invoke('TestConnection').then(() => {
  console.log('Connection test successful');
});

// Check online users
const { onlineUsers } = useSignalR();
console.log('Online users:', Array.from(onlineUsers));
```

---

## Summary

✅ **Global SignalR connection** được khởi tạo ngay sau login  
✅ **Real-time messaging** hoạt động toàn app  
✅ **Toast notifications** cho tin nhắn mới  
✅ **Centralized connection management**  
✅ **Better performance** và **user experience**  

Hệ thống mới đảm bảo **user luôn online** và **nhận tin nhắn realtime** ngay cả khi không trong messenger! 🚀