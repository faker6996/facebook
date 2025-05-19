export default function LogginLayout({ children }: { children: React.ReactNode }) {
    return (
      <div>
        <header>LoginLayout Header</header>
        <aside>Sidebar Menu</aside>
        <main>{children}</main>
      </div>
    );
  }