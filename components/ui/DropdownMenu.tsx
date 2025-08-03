"use client";

import React, { useState } from "react";
import { 
  useFloating, 
  autoUpdate, 
  offset, 
  flip, 
  shift, 
  useClick, 
  useDismiss, 
  useRole, 
  useInteractions,
  useMergeRefs,
  FloatingFocusManager,
  useListNavigation
} from "@floating-ui/react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Check } from "lucide-react";

interface DropdownMenuProps {
  trigger: React.ReactElement;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end";
  closeOnSelect?: boolean;
  disabled?: boolean;
  // Alternative API props
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  items?: Array<{
    label: string;
    icon?: React.ComponentType<any>;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
  }>;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  className,
  contentClassName,
  placement = "bottom-start",
  closeOnSelect = true,
  disabled = false,
  isOpen,
  onOpenChange,
  items
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = React.useRef<Array<HTMLElement | null>>([]);
  
  const actualOpen = isOpen !== undefined ? isOpen : open;
  const handleOpenChange = onOpenChange || setOpen;

  const { refs, floatingStyles, context } = useFloating({
    open: actualOpen,
    onOpenChange: handleOpenChange,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const click = useClick(context, {
    enabled: !disabled,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });
  
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

  // Merge refs with child's ref if it exists
  const ref = useMergeRefs([refs.setReference, (trigger as any).ref]);

  return (
    <>
      {React.cloneElement(trigger, {
        ref,
        ...getReferenceProps(),
        className: cn((trigger.props as any)?.className, className),
      } as any)}
      {actualOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={cn(
              "z-[9999] min-w-[8rem] rounded-md border bg-popover text-popover-foreground shadow-lg",
              "backdrop-blur-sm bg-popover/95 border-border/60",
              "py-1",
              contentClassName
            )}
          >
            {items ? (
              items.map((item, index) => (
                <DropdownMenuItem
                  key={index}
                  ref={(node) => {
                    listRef.current[index] = node;
                  }}
                  {...getItemProps({
                    onClick() {
                      item.onClick();
                      if (closeOnSelect) {
                        handleOpenChange(false);
                      }
                    },
                  })}
                  disabled={item.disabled}
                  destructive={item.destructive}
                  icon={item.icon}
                  className={cn(
                    index === activeIndex && "bg-accent text-accent-foreground"
                  )}
                >
                  {item.label}
                </DropdownMenuItem>
              ))
            ) : (
              React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child as React.ReactElement<any>, {
                    ...getItemProps({
                      onClick() {
                        (child.props as any).onClick?.();
                        if (closeOnSelect) {
                          handleOpenChange(false);
                        }
                      },
                    }),
                    className: cn(
                      (child.props as any).className,
                      index === activeIndex && "bg-accent text-accent-foreground"
                    ),
                  });
                }
                return child;
              })
            )}
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  ref?: React.Ref<HTMLDivElement>;
  disabled?: boolean;
  className?: string;
  destructive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(({
  children,
  onClick,
  disabled = false,
  className,
  destructive = false,
  icon: Icon,
  shortcut
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        destructive && "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="ml-auto text-xs tracking-widest text-muted-foreground">
          {shortcut}
        </span>
      )}
    </div>
  );
});

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} />;
};

export const DropdownMenuLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold text-foreground", className)}>
      {children}
    </div>
  );
};

// Select Dropdown Component
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectDropdownProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  values?: string[];
  onValuesChange?: (values: string[]) => void;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  options,
  value,
  placeholder = "Select option...",
  onValueChange,
  className,
  disabled = false,
  multiple = false,
  values = [],
  onValuesChange
}) => {
  
  const selectedOption = options.find(opt => opt.value === value);
  const selectedOptions = options.filter(opt => values.includes(opt.value));

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = values.includes(optionValue)
        ? values.filter(v => v !== optionValue)
        : [...values, optionValue];
      onValuesChange?.(newValues);
    } else {
      onValueChange?.(optionValue);
    }
  };

  const displayText = multiple 
    ? selectedOptions.length > 0 
      ? `${selectedOptions.length} selected`
      : placeholder
    : selectedOption?.label || placeholder;

  return (
    <DropdownMenu
      trigger={
        <button
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedOption && !selectedOptions.length && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{displayText}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      }
      closeOnSelect={!multiple}
    >
      <div className="p-1">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleSelect(option.value)}
            disabled={option.disabled}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {((multiple && values.includes(option.value)) || 
              (!multiple && value === option.value)) && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
        {options.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No options available
          </div>
        )}
      </div>
    </DropdownMenu>
  );
};

export default DropdownMenu;