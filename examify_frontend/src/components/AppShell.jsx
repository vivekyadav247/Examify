import React from "react";
import { useTheme } from "../lib/ThemeContext";
import { useApiClient } from "../lib/useApiClient";

import { Home, BarChart2, User, BookOpen, FileText, Calendar, ClipboardList, RefreshCw, Dna, Bot, Trophy, LogOut, Sun, Moon } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: <Home size={20} /> },
  { label: "Analytics", href: "/dashboard", icon: <BarChart2 size={20} /> },
  { label: "Syllabus", href: "/syllabus", icon: <BookOpen size={20} /> },
  { label: "Smart Notes", href: "/notes", icon: <FileText size={20} /> },
  { label: "Study Map", href: "/study-plan", icon: <Calendar size={20} /> },
  { label: "Live Exam", href: "/mock-test", icon: <ClipboardList size={20} /> },
  { label: "DNA Report", href: "/dna-report", icon: <Dna size={20} /> },
  { label: "AI Mentor", href: "/ai-chat", icon: <Bot size={20} /> },
  { label: "Profile", href: "/profile", icon: <User size={20} /> },
];


export default function AppShell({ children, activePath }) {
  const { dark, toggle } = useTheme();
  const { setToken } = useApiClient();
  const current = activePath || window.location.pathname;
  const currentPath = window.location.pathname;
  const hasQuizLock = window.sessionStorage.getItem("quiz_in_progress") === "1";
  const guardNav = (e, href) => {
    if (!hasQuizLock || href === "/quiz") return;
    e.preventDefault();
    window.location.href = "/quiz";
  };
  const logout = () => {
    if (hasQuizLock && currentPath !== "/quiz") {
      window.location.href = "/quiz";
      return;
    }
    setToken(null);
    window.location.href = "/";
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        minHeight: "100vh",
      }}
    >
      {/* Desktop Sidebar */}
      <aside
        className="fixed left-0 top-0 hidden h-screen w-56 flex-col items-center justify-between border-r py-5 md:flex"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface)",
        }}
      >
        <div className="flex w-full flex-col items-center gap-1 px-2">
          <a
            href="/dashboard"
            className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl font-display text-xl font-bold"
            style={{
              backgroundColor: "var(--accent)",
              color: dark ? "#111" : "#fff",
            }}
          >
            E
          </a>
          {NAV_ITEMS.map((item) => {
            const baseHref = item.href.split("?")[0];
            const active =
              current === item.href ||
              currentPath === baseHref ||
              currentPath.startsWith(baseHref + "/");
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => guardNav(e, item.href.split("?")[0])}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 mb-1 text-left transition-all hover:scale-[1.02]"
                style={{
                  color: active ? "var(--accent)" : "var(--text-muted)",
                  backgroundColor: active
                    ? "var(--accent-glow)"
                    : "transparent",
                }}
              >
                <span className="flex items-center justify-center">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-full border px-2 py-1 text-[10px]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {dark ? "Light" : "Dark"}
          </button>
          <button
            onClick={logout}
            className="rounded-full border px-2 py-1 text-[10px]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pb-20 md:pl-56 md:pb-0">{children}</div>

      {/* Mobile Bottom Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t md:hidden"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--surface)",
        }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-start gap-4 overflow-x-auto px-4 py-2 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const baseHref = item.href.split("?")[0];
            const active =
              current === item.href ||
              currentPath === baseHref ||
              currentPath.startsWith(baseHref + "/");
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => guardNav(e, item.href.split("?")[0])}
                className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 transition-all"
                style={{
                  color: active ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="text-[10px]">{item.label}</span>
              </a>
            );
          })}
          <button
            onClick={toggle}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="text-sm">{dark ? "L" : "D"}</span>
            <span className="text-[10px]">Theme</span>
          </button>
          <button
            onClick={logout}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="text-sm">O</span>
            <span className="text-[10px]">Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
