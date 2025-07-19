import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { routing } from "@/i18n/routing";

export default async function RootPage() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // Detect user's preferred language from browser
  const detectedLocale = acceptLanguage.toLowerCase().includes('vi') ? 'vi' : 
                        acceptLanguage.toLowerCase().includes('en') ? 'en' : 
                        routing.defaultLocale;
  
  redirect(`/${detectedLocale}`);
}
