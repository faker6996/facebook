export default function LogginLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <header>LogginLayout Header</header>
        <aside>Sidebar Menu</aside>
        <main>{children}</main>
      </div>
    );
  }