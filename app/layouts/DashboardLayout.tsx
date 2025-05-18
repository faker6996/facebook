export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <header>Dashboard Header</header>
        <aside>Sidebar Menu</aside>
        <main>{children}</main>
      </div>
    );
  }