import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import ChevronRight from "../icons/BreadcrumIcon";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex w-full items-center text-sm", className)} aria-label="breadcrumb">
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {item.href && !isLast ? (
                <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{item.label}</span>
              )}

              {!isLast && (
                <span className="px-1 text-muted-foreground" role="presentation">
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
