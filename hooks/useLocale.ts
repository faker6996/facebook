"use client";

import { usePathname } from "next/navigation";
import { LOCALE } from "@/lib/constants/enum";

/**
 * Custom hook to get the current locale from the URL pathname.
 * It extracts the locale from the first segment of the path.
 * Falls back to Vietnamese (vi) if the locale is not present.
 * @returns {string} The current locale.
 */
export function useLocale() {
  const pathname = usePathname();
  // e.g., /vi/dashboard -> ['', 'vi', 'dashboard']
  const locale = pathname.split("/")[1];
  return locale || LOCALE.VI;
}
