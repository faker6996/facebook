"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Search, Check, X } from "lucide-react";
import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  autoUpdate,
  offset,
  flip,
  size as floatingSize,
  useListNavigation,
  FloatingFocusManager,
} from "@floating-ui/react";

// --- PROPS ---
interface ComboboxProps {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  allowClear?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  usePortal?: boolean;
}

const sizeStyles = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-3 text-base",
};

const variantStyles = {
  default: "border-border bg-background hover:bg-accent/5",
  outline: "border-border bg-transparent hover:bg-accent/5",
  ghost: "border-transparent bg-transparent hover:bg-accent/10",
};

// --- MAIN COMPONENT ---
export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found",
  className,
  disabled = false,
  size = "md",
  variant = "default",
  allowClear = false,
  usePortal = true,
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const listRef = React.useRef<(HTMLLIElement | null)[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Filter options based on query
  const filteredOptions = React.useMemo(() => options.filter((o) => o.toLowerCase().includes(query.toLowerCase())), [options, query]);

  // Floating UI Hooks
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    strategy: "fixed",
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      floatingSize({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
  });

  // Floating UI Interaction Hooks
  const role = useRole(context, { role: "listbox" });
  const dismiss = useDismiss(context);
  const click = useClick(context);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true, // Important for scrolling
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([role, dismiss, click, listNav]);

  // Event Handlers
  const handleSelect = (val: string) => {
    if (val !== undefined && val !== null) {
      onChange(val);
      setOpen(false);
      (refs.domReference.current as HTMLElement)?.focus(); // Return focus to the trigger
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setOpen(false);
  };

  // Reset state when dropdown closes và focus input khi mở
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(null);
    } else {
      // Focus vào input search khi dropdown mở
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const dropdownContent = (
    <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
        className={cn(
          "z-[9999] rounded-lg border bg-popover/95 backdrop-blur-sm text-popover-foreground shadow-xl",
          "transition-opacity duration-150",
          !context.open && "opacity-0 pointer-events-none"
        )}
      >
        {/* Search Input */}
        <div className="relative p-3 border-b border-border/50">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0); // Reset active index on search
            }}
            placeholder={searchPlaceholder}
            className="w-full rounded-md bg-background/50 py-2 pl-8 pr-3 text-sm border-0 focus:outline-none"
            aria-autocomplete="list"
            // Accessibility: Connects input to the active descendant for screen readers
            aria-activedescendant={activeIndex != null ? `combobox-item-${filteredOptions[activeIndex]}` : undefined}
          />
        </div>

        {/* Options List */}
        <div className="max-h-64 overflow-y-auto overscroll-contain">
          <ul className="p-2 space-y-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, index) => (
                <li
                  key={item}
                  ref={(node) => {
                    listRef.current[index] = node;
                  }}
                  // Accessibility: Add required role and aria attributes
                  id={`combobox-item-${item}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={item === value}
                  {...getItemProps({
                    onClick: () => handleSelect(item),
                  })}
                  className={cn(
                    "group flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 transition-colors duration-150",
                    index === activeIndex && "bg-accent text-accent-foreground", // Use activeIndex for keyboard highlight
                    item === value && "bg-primary/5 text-primary font-medium"
                  )}
                >
                  <span className="truncate">{item}</span>
                  {item === value && <Check className="h-4 w-4 text-primary" />}
                </li>
              ))
            ) : (
              <li className="px-3 py-8 text-center text-muted-foreground text-sm">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-6 w-6 opacity-50" />
                  <span>{emptyText}</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </FloatingFocusManager>
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={refs.setReference}
        type="button"
        disabled={disabled}
        // Accessibility: Announce role, state, and controlled element
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={context.floatingId}
        className={cn(
          "group flex w-full items-center justify-between rounded-lg border transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          sizeStyles[size],
          variantStyles[variant],
          open && "ring-2 ring-primary/20 border-primary",
          className
        )}
        {...getReferenceProps()}
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>{value || placeholder}</span>

        <div className="flex items-center gap-1 ml-2">
          {allowClear && value && !disabled && (
            // FIX: Use a div instead of a nested button
            <div
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onClick={handleClear}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClear(e as any)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </div>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>

      {/* Dropdown Portal or Inline */}
      {usePortal ? open && createPortal(dropdownContent, document.body) : open && dropdownContent}
    </>
  );
};
