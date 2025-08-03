"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { 
  useFloating, 
  autoUpdate, 
  offset, 
  flip, 
  shift, 
  size,
  useClick, 
  useDismiss, 
  useRole, 
  useInteractions,
  useMergeRefs,
  FloatingFocusManager,
  FloatingPortal,
  useListNavigation
} from "@floating-ui/react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Search, Check } from "lucide-react";

interface MultiComboboxProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelected?: number;
  disabledOptions?: string[];
  showTags?: boolean;
  showClear?: boolean;
  className?: string;
  placement?: "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end";
  disabled?: boolean;
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
  className,
  placement = "bottom-start",
  disabled = false,
}) => {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<Array<HTMLElement | null>>([]);

  // Floating UI setup with size matching
  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: setOpen,
    strategy: "fixed",
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          // Make dropdown width match reference element
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            minWidth: `${Math.max(rects.reference.width, 200)}px`,
          });
        },
      }),
    ],
  });

  // Interactions
  const click = useClick(context, {
    enabled: !disabled,
  });
  const dismiss = useDismiss(context, {
    ancestorScroll: false,
    outsidePress: true,
    escapeKey: true,
  });
  const role = useRole(context, { role: "listbox" });
  
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
  ]);

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

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex !== null && filtered[activeIndex]) {
        toggleSelect(filtered[activeIndex]);
      }
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Auto-focus input when dropdown opens
  React.useEffect(() => {
    if (open) {
      // Focus input after dropdown is positioned
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  return (
    <div className={cn("relative w-[250px]", className)}>
      <div className="flex flex-wrap gap-1 mb-1">
        {showTags &&
          value.map((item) => (
            <span key={item} className="flex items-center gap-1 rounded bg-accent px-2 py-1 text-xs text-accent-foreground">
              {item}
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(item);
                }} 
                className="text-xs hover:text-destructive"
              >
                ×
              </button>
            </span>
          ))}
        {showClear && value.length > 0 && (
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearAll();
            }} 
            className="ml-auto text-xs text-muted-foreground hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <button
        ref={refs.setReference}
        type="button"
        disabled={disabled}
        {...getReferenceProps()}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-2 ring-ring ring-offset-2"
        )}
      >
        <span className="truncate">{value.length ? `${value.length} selected` : "Select..."}</span>
        <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
      </button>

      {open && createPortal(
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className={cn(
            "z-[9999] rounded-md border bg-popover text-popover-foreground shadow-lg",
            "backdrop-blur-sm bg-popover/95 border-border/60"
          )}
          data-side={placement.split('-')[0]}
        >
          <div className="relative border-b border-border/60">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full rounded-t-md bg-transparent px-8 py-2 text-sm focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto text-sm p-1">
            {filtered.length ? (
              filtered.map((item, index) => {
                const isSelected = value.includes(item);
                const isDisabled = disabledOptions.includes(item);

                return (
                  <li
                    key={item}
                    ref={(node) => {
                      listRef.current[index] = node;
                    }}
                    {...getItemProps({
                      onClick() {
                        toggleSelect(item);
                        inputRef.current?.focus();
                      },
                    })}
                    className={cn(
                      "flex cursor-pointer items-center justify-between px-3 py-2 rounded-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      index === activeIndex && "bg-accent text-accent-foreground",
                      isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    {item}
                    {isSelected && <Check className="h-4 w-4" />}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-2 text-muted-foreground">No result.</li>
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
};
