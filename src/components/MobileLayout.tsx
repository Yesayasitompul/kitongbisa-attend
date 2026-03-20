import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clock, History, CalendarDays, TreePalm, Users, BarChart3, FileText,
  AlertTriangle, Shield, LogOut, Home, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const MobileLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const navItems: NavItem[] = (() => {
    switch (user.role) {
      case "pegawai":
        return [
          { label: "Beranda", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
          { label: "Riwayat", path: "/riwayat", icon: <History className="h-5 w-5" /> },
          { label: "Jadwal", path: "/jadwal", icon: <CalendarDays className="h-5 w-5" /> },
          { label: "Cuti", path: "/cuti", icon: <TreePalm className="h-5 w-5" /> },
        ];
      case "admin":
        return [
          { label: "Beranda", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
          { label: "Pegawai", path: "/pegawai", icon: <Users className="h-5 w-5" /> },
          { label: "Monitoring", path: "/monitoring", icon: <BarChart3 className="h-5 w-5" /> },
          { label: "Laporan", path: "/laporan", icon: <FileText className="h-5 w-5" /> },
        ];
      case "pimpinan":
        return [
          { label: "Beranda", path: "/dashboard", icon: <Home className="h-5 w-5" /> },
          { label: "Rekap", path: "/rekap", icon: <BarChart3 className="h-5 w-5" /> },
          { label: "Evaluasi", path: "/evaluasi", icon: <Shield className="h-5 w-5" /> },
          { label: "Laporan", path: "/laporan", icon: <FileText className="h-5 w-5" /> },
        ];
    }
  })();

  return (
    <div className="min-h-screen bg-background md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card z-50">
        <div className="flex items-center gap-3 px-5 py-5 border-b">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Clock className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-foreground">Kitongbisa</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role === "admin" ? "Admin / HR" : user.role}</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.position}</p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="border-t px-3 py-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-50 border-b bg-card px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-foreground">Kitongbisa</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role === "admin" ? "Admin / HR" : user.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {menuOpen && (
          <div className="mt-3 space-y-1 border-t pt-3">
            <div className="mb-2 px-2">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.position}</p>
            </div>
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMenuOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              Keluar
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="mx-auto w-full px-4 py-4 pb-24 md:pb-6 md:ml-64 md:max-w-5xl md:px-8">{children}</main>

      {/* Bottom nav - mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                location.pathname === item.path
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;
