import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-textPrimary">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-backgroundSecondary border-r border-border">
        <Sidebar />
      </aside>
      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] mx-auto px-4 py-8">
        {children}
      </main>
      {/* FooterNav Mobile */}
      <MobileNav />
    </div>
  );
}
