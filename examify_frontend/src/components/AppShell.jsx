import React from "react";
import { useTheme } from "../lib/ThemeContext";
import { useApiClient } from "../lib/useApiClient";
import { 
  Home, BarChart2, User, BookOpen, FileText, 
  Calendar, ClipboardList, Dna, Bot, LogOut, Sun, Moon 
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: <Home size={18} /> },
  { label: "DNA Report", href: "/dna-report", icon: <Dna size={18} /> },
  { label: "Smart Notes", href: "/notes", icon: <FileText size={18} /> },
  { label: "Study Map", href: "/study-plan", icon: <Calendar size={18} /> },
  { label: "Mock Test", href: "/mock-test", icon: <ClipboardList size={18} /> },
  { label: "AI Mentor", href: "/ai-chat", icon: <Bot size={18} /> },
  { label: "Profile", href: "/profile", icon: <User size={18} /> },
];

export default function AppShell({ children, activePath }) {
  const { dark, toggle } = useTheme();
  const { setToken } = useApiClient();
  const currentPath = window.location.pathname;

  const logout = () => {
    setToken(null);
    window.location.href = "/";
  };

  return (
    <div className={`min-h-screen ${dark ? 'theme-dark' : 'theme-light'} bg-[var(--bg)] text-[var(--text)] flex`}>
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col hidden md:flex sticky top-0 h-screen shrink-0">
        <div className="p-8">
          <div className="w-10 h-10 bg-[var(--accent)] text-black rounded-xl flex items-center justify-center font-black text-xl">E</div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = currentPath === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  active ? "bg-[var(--accent)] text-black" : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {item.icon}
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--border)] space-y-2">
          <button onClick={toggle} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-hover)] font-medium text-sm">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 font-medium text-sm">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1">
          {children}
        </div>
        
        {/* Mobile Bottom Bar */}
        <nav className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2 flex justify-around items-center sticky bottom-0">
          {NAV_ITEMS.slice(0, 5).map((item) => (
            <a key={item.href} href={item.href} className={`p-2 rounded-lg ${currentPath === item.href ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
              {item.icon}
            </a>
          ))}
        </nav>
      </main>
    </div>
  );
}
