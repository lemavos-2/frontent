// ─────────────────────────────────────────────────────────────────────────────

import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import {
  BarChart3, BookOpen, Users, Target, Search,
  Settings, LogOut, Zap, ChevronRight, ChevronLeft,
  Menu, X, Home, FileText, Activity, Database,
} from "lucide-react";

const DESKTOP_NAV = [
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/habits", icon: Target, label: "Hábitos" },
  { to: "/entities", icon: Users, label: "Entidades" },
  { to: "/connections", icon: Zap, label: "Conexões" },
  { to: "/search", icon: Search, label: "Buscar" },
];

const MOBILE_NAV = [
  { to: "/dashboard", icon: Home, label: "Início" },
  { to: "/journal", icon: FileText, label: "Journal" },
  { to: "/habits", icon: Activity, label: "Hábitos" },
  { to: "/entities", icon: Database, label: "Entidades" },
  { to: "/settings", icon: Settings, label: "Config" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex md:flex-col md:h-screen md:sticky md:top-0 md:border-r md:border-border bg-background-secondary transition-all duration-300 ${
        sidebarCollapsed ? 'md:w-16' : 'md:w-64'
      }`}>
        {/* Header */}
        <div className="md:p-4 md:border-b md:border-border flex items-center justify-between">
          {!sidebarCollapsed && (
            <span className="font-mono text-sm font-bold tracking-wider text-brand">CONTINUUM</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-md hover:bg-background-tertiary transition-colors touch-target"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="md:flex-1 md:px-2 md:py-4 md:space-y-1">
          {DESKTOP_NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-brand/10 text-brand border-l-2 border-brand"
                    : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary"
                } ${sidebarCollapsed ? 'justify-center' : ''}`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="md:p-3 md:border-t md:border-border md:space-y-1">
          {user?.plan === "FREE" && !sidebarCollapsed && (
            <button
              onClick={() => navigate("/upgrade")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-brand/10 text-brand text-xs font-medium hover:bg-brand/15 transition-colors"
            >
              <span>Upgrade PRO</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-all ${
                isActive ? "bg-background-tertiary text-foreground" : "text-foreground-tertiary hover:text-foreground hover:bg-background-tertiary"
              } ${sidebarCollapsed ? 'justify-center' : ''}`
            }
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Configurações</span>}
          </NavLink>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs text-foreground-tertiary hover:text-accent-error hover:bg-accent-error/5 transition-all ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Sair</span>}
          </button>
          {!sidebarCollapsed && user && (
            <div className="px-3 py-2 mt-2 border-t border-border">
              <p className="text-xs text-foreground-tertiary truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded font-mono font-bold ${
                  user.plan === "FREE" ? "bg-background-tertiary text-foreground-tertiary" :
                  user.plan === "PRO" ? "bg-brand/20 text-brand" :
                  "bg-accent-secondary/20 text-accent-secondary"
                }`}>{user.plan}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

           {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-background-secondary border-b border-border">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -m-2 touch-target"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-mono text-sm font-bold text-brand">CONTINUUM</span>
        <div className="w-9" /> {/* Spacer */}
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-64 bg-background-secondary border-r border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-mono text-sm font-bold text-brand">CONTINUUM</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 touch-target">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {DESKTOP_NAV.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-all ${
                      isActive
                        ? "bg-brand/10 text-brand"
                        : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border space-y-2">
              {user?.plan === "FREE" && (
                <button
                  onClick={() => { navigate("/upgrade"); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-brand/10 text-brand text-sm font-medium"
                >
                  <span>Upgrade PRO</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
              <NavLink
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    isActive ? "bg-background-tertiary text-foreground" : "text-foreground-tertiary hover:text-foreground hover:bg-background-tertiary"
                  }`
                }
              >
                <Settings className="h-5 w-5" />
                Configurações
              </NavLink>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground-tertiary hover:text-accent-error hover:bg-accent-error/5"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto w-full px-4 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background-secondary border-t border-border z-40">
        <div className="flex h-full items-stretch justify-around px-2">
          {MOBILE_NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 min-h-16 px-1 py-2 rounded-lg mx-1 transition-all duration-200 ${
                  isActive
                    ? "text-brand bg-brand/10"
                    : "text-foreground-tertiary hover:text-foreground hover:bg-background-tertiary"
                }`
              }
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium leading-none">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
