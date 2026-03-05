import { Button } from "../ui/Button";
import { LucideIcon, Home, Notebook, ListChecks, Users, Settings } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: Home },
  { label: "Journal", icon: Notebook },
  { label: "Hábitos", icon: ListChecks },
  { label: "Entidades", icon: Users },
  { label: "Configurações", icon: Settings },
];

export function Sidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-[64px] px-4 font-bold text-[18px] tracking-tight">Continuum</div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-[8px] text-textSecondary hover:bg-hover transition-colors"
            aria-label={item.label}
          >
            <item.icon size={20} strokeWidth={1.5} />
            <span className="text-[15px]">{item.label}</span>
          </button>
        ))}
        {/* ...FolderList, NoteList... */}
      </nav>
      <Button className="mt-4 mx-4 w-full" variant="primary">Nova entrada</Button>
    </div>
  );
}
