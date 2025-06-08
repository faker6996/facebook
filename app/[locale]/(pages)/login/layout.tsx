import LoginLayout from "@/app/[locale]/layouts/LoginLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LoginLayout>{children}</LoginLayout>;
}