// file: components/ui/MessageStatusIcon.tsx

// Đây là type status bạn đã định nghĩa ở file message model
import type { MessageStatus } from "@/lib/models/message";

interface Props {
  status: MessageStatus | undefined;
  className?: string;
}

// Component này chỉ chứa SVG và logic hiển thị, hoàn toàn tự chủ.
export function MessageStatusIcon({ status, className = "size-4" }: Props) {
  switch (status) {
    case "Sending":
      // Icon đồng hồ
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "Sent":
      // Icon 1 dấu check
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "Delivered":
    case "Read":
      // Icon 2 dấu check. Chúng ta sẽ đổi màu cho trạng thái 'read' bằng className.
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M7 13l3 3 7-7" />
          <path d="M14 13l3 3 7-7" />
        </svg>
      );
    default:
      return null;
  }
}
