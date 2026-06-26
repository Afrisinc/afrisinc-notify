import { useEffect, useState } from "react";
import { Theme } from "@mui/material/styles";
import THEME, { DARK_THEME } from "./theme";

/**
 * Hook that detects system dark mode via .dark class on html element
 * and returns the appropriate MUI theme
 */
export function useSystemTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(THEME);

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? DARK_THEME : THEME);
    };

    // Initial check
    updateTheme();

    // Watch for class changes on html element
    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Also listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => updateTheme();
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return theme;
}
