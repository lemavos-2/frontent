import { Home, Notebook, ListChecks, Users, Settings } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Journal", icon: Notebook },
  { label: "Hábitos", icon: ListChecks },
  { label: "Entidades", icon: Users },
  { label: "Configurações", icon: Settings },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full h-[64px] bg-surface border-t border-border flex md:hidden z-50">
      {navItems.map((item) => (
        <button
          key={item.label}
          className="flex flex-col items-center justify-center flex-1 h-full text-textSecondary hover:text-accent transition-colors"
          aria-label={item.label}
        >
          <item.icon size={20} strokeWidth={1.5} />
          <span className="text-[13px] mt-1">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
