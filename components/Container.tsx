// components/ui/Container.tsx
import React from "react";
import { cn } from "@/lib/utils/cn"; // nếu bạn có helper merge classNames

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string; // ví dụ "600px" hoặc "screen-lg"
  padding?: string; // ví dụ "p-4" hoặc "px-6 py-8"
}

export default function Container({ children, className = "", maxWidth = "max-w-[600px]", padding = "p-4" }: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full mx-auto bg-card", // full width nhưng centered
        maxWidth,
        padding,
        className
      )}
    >
      {children}
    </div>
  );
}
