"use client";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "top" | "bottom";
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({ open, onOpenChange, side = "right", children, title, description, className }) => {
  const [show, setShow] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  // Giữ sheet lại trong DOM khi đóng
  useEffect(() => {
    if (open) setShow(true);
    else setTimeout(() => setShow(false), 300);
  }, [open]);

  // Hiệu ứng mở: trượt từ ngoài vào
  useLayoutEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setAnimationClass("translate-x-0"); // trượt vào
    }, 10); // delay 1 frame
    setAnimationClass("translate-x-full"); // bắt đầu ngoài màn hình
    return () => clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setAnimationClass("translate-x-full"); // trượt ra ngoài
    }
  }, [open]);

  if (!show) return null;

  const basePos = {
    right: "right-0 top-0 h-full w-[400px]",
    left: "left-0 top-0 h-full w-[400px]",
    top: "top-0 left-0 w-full h-[400px]",
    bottom: "bottom-0 left-0 w-full h-[400px]",
  }[side];

  const getTransformClass = () => {
    if (side === "right" || side === "left") return animationClass;
    if (side === "top") return animationClass.replace("x", "y");
    if (side === "bottom") return animationClass.replace("x", "y");
    return "";
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn("fixed inset-0 bg-black/50 z-40 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed z-50 bg-white dark:bg-neutral-900 shadow-xl flex flex-col transition-transform duration-300 ease-soft",
          basePos,
          getTransformClass(),
          className
        )}
      >
        <header className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <button onClick={() => onOpenChange(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </div>
    </>
  );
};
