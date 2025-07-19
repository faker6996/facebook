import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "vi"],

  // Used when no locale matches
  defaultLocale: "vi",
  
  // Always show locale in URL
  localePrefix: "always",
  
  // Automatically detect locale from browser
  localeDetection: true
});
