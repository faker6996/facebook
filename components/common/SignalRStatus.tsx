"use client";

import { useSignalR } from "@/contexts/SignalRContext";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

/**
 * Component hiển thị trạng thái kết nối SignalR
 * Có thể đặt trong header hoặc bất kỳ đâu để theo dõi connection
 */
export const SignalRStatus: React.FC = () => {
  const { isConnected, onlineUsers } = useSignalR();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-success" />
            <Badge variant="success" size="sm">Online</Badge>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-destructive" />
            <Badge variant="danger" size="sm">Offline</Badge>
          </>
        )}
      </div>
      
      {onlineUsers.size > 0 && (
        <Badge variant="info" size="sm">
          {onlineUsers.size} online
        </Badge>
      )}
    </div>
  );
};