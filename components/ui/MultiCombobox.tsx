"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import ChevronDownIcon from "../icons/ChevronDownIcon";
import SearchIcon from "../icons/SearchIcon";
import { CheckIcon } from "../icons/CheckIcon";

interface MultiComboboxProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelected?: number;
  disabledOptions?: string[];
  showTags?: boolean;
  showClear?: boolean;
}

export const MultiCombobox: React.FC<MultiComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = "Search...",
  maxSelected,
  disabledOptions = [],
  showTags = true,
  showClear = true,
}) => {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  const toggleSelect = (val: string) => {
    if (disabledOptions.includes(val)) return;
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      if (!maxSelected || value.length < maxSelected) {
        onChange([...value, val]);
      }
    }
  };

  const handleRemove = (val: string) => {
    onChange(value.filter((v) => v !== val));
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
      if (selected) toggleSelect(selected);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div ref={containerRef} onBlur={handleBlur} className="relative w-[250px]">
      <div className="flex flex-wrap gap-1 mb-1">
        {showTags &&
          value.map((item) => (
            <span key={item} className="flex items-center gap-1 rounded bg-accent px-2 py-1 text-xs text-accent-foreground">
              {item}
              <button type="button" onClick={() => handleRemove(item)} className="text-xs hover:text-red-500">
                ×
              </button>
            </span>
          ))}
        {showClear && value.length > 0 && (
          <button type="button" onClick={handleClearAll} className="ml-auto text-xs text-muted-foreground hover:underline">
            Clear all
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
      >
        <span className="truncate">{value.length ? `${value.length} selected` : "Select..."}</span>
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
            filtered.map((item, index) => {
              const isSelected = value.includes(item);
              const isDisabled = disabledOptions.includes(item);

              return (
                <li
                  key={item}
                  tabIndex={-1}
                  onClick={() => toggleSelect(item)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between px-3 py-2",
                    index === highlightIndex && !isDisabled ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {item}
                  {isSelected && <CheckIcon className="h-4 w-4" />}
                </li>
              );
            })
          ) : (
            <li className="px-3 py-2 text-muted-foreground">No result.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
