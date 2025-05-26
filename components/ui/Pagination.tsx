"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  size?: "sm" | "md";
  variant?: "default" | "outline" | "ghost";
}

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange, className, size = "md", variant = "default" }) => {
  const createPageArray = () => {
    const delta = 2;
    const range: (number | string)[] = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    range.push(1);
    if (left > 2) range.push("...");

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    if (right < totalPages - 1) range.push("...");
    if (totalPages > 1) range.push(totalPages);

    return range;
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  }[size];

  const variantClasses = {
    default: "bg-background border",
    outline: "border border-input",
    ghost: "bg-transparent",
  }[variant];

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onChange(Math.min(totalPages, page + 1));
      if (e.key === "ArrowLeft") onChange(Math.max(1, page - 1));
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [page, totalPages, onChange]);

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={cn("flex items-center gap-1 rounded-md hover:bg-accent disabled:opacity-50", sizeClasses, variantClasses)}
      >
        ❮ Previous
      </button>

      {createPageArray().map((p, i) => (
        <button
          key={i}
          onClick={() => typeof p === "number" && onChange(p)}
          disabled={p === "..."}
          className={cn(
            "rounded-md hover:bg-accent",
            sizeClasses,
            variantClasses,
            page === p && "bg-primary text-white",
            p === "..." && "cursor-default opacity-50"
          )}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={cn("flex items-center gap-1 rounded-md hover:bg-accent disabled:opacity-50", sizeClasses, variantClasses)}
      >
        Next ❯
      </button>
    </div>
  );
};
