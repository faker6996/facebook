"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import SearchIcon from "../icons/SearchIcon";
import { CheckIcon } from "../icons/CheckIcon";

interface ComboboxProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({ options, value, onChange, placeholder = "Search..." }) => {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (val: string) => {
    onChange(val);
    setQuery("");
    setOpen(false);
    setHighlightIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) setOpen(true);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filtered[highlightIndex];
      if (selected) handleSelect(selected);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} onBlur={handleBlur} className="relative w-[200px]">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 0); // auto focus input
        }}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
      >
        <span>{value ?? "Select..."}</span>
        <ChevronDownIcon className="h-4 w-4 opacity-50" />
      </button>

      <div
        className={cn(
          "absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md transition-all duration-200 ease-out origin-top transform",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="relative">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full rounded-md bg-background px-8 py-2 text-sm focus:outline-none"
          />
        </div>
        <ul className="max-h-60 overflow-y-auto text-sm">
          {filtered.length ? (
            filtered.map((item, index) => (
              <li
                key={item}
                tabIndex={-1}
                onClick={() => handleSelect(item)}
                className={cn(
                  "flex cursor-pointer items-center justify-between px-3 py-2",
                  index === highlightIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item}
                {item === value && <CheckIcon className="h-4 w-4" />}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-muted-foreground">No result.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
