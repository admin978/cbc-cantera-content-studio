import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { LayoutTemplate, FolderOpen, Menu, X } from "lucide-react";

const navItems = [
  { path: "/plantillas", label: "Plantillas", icon: LayoutTemplate },
  { path: "/historial", label: "Historial", icon: FolderOpen },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const esEditor = /^\/(plantillas)\/.+/.test(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#F5F3FF" }}>
      {!esEditor && open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {!esEditor && (
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
          style={{ backgroundColor: "#3B0764" }}
        >
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏀</span>
              <div>
                <p className="text-white font-bold text-sm leading-tight" style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 16 }}>
                  CBC Content Studio
                </p>
                <p className="text-[11px]" style={{ color: "#C4B5FD" }}>Club Baloncesto Valladolid</p>
              </div>
              <button className="lg:hidden ml-auto text-white/50" onClick={() => setOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? "bg-white/20 text-white" : "text-white/55 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 text-center">
            <p className="text-white/20 text-xs">v1.0</p>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {!esEditor && (
          <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-border">
            <button onClick={() => setOpen(true)} className="p-1.5 rounded hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm">CBC Content Studio</span>
          </header>
        )}
        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
