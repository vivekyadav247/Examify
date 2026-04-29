import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ dark: true, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("examify_theme") !== "light"; } catch { return true; }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-dark", dark);
    root.classList.toggle("theme-light", !dark);
    try { localStorage.setItem("examify_theme", dark ? "dark" : "light"); } catch {}
  }, [dark]);

  const toggle = () => setDark((v) => !v);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
