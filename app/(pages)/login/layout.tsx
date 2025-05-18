import LogginLayout from "@/app/layouts/LogginLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LogginLayout>{children}</LogginLayout>;
}