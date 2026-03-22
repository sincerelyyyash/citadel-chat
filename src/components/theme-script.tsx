export function ThemeScript() {
    const scriptContent = `
    (function() {
      const storageKey = "theme-store";
      const root = document.documentElement;

      let themeState = null;
      try {
        const persistedStateJSON = localStorage.getItem(storageKey);
        if (persistedStateJSON) {
          themeState = JSON.parse(persistedStateJSON)?.state?.themeState;
        }
      } catch (e) {
        console.warn("Theme initialization: Failed to read/parse localStorage:", e);
      }

      const mode = "dark";

      // House Targaryen used hue 145 (green) for --destructive in older builds; fix before paint.
      // Keep in sync with src/lib/theme-utils.ts (house-targaryen preset).
      if (themeState?.selectedThemeUrl === "house-targaryen" && themeState.cssVars) {
        const d = themeState.cssVars.dark?.destructive ?? "";
        if (typeof d === "string" && d.includes("145")) {
          themeState.cssVars.light = themeState.cssVars.light || {};
          themeState.cssVars.dark = themeState.cssVars.dark || {};
          themeState.cssVars.light.destructive = "oklch(0.52 0.20 25)";
          themeState.cssVars.light["destructive-foreground"] =
            themeState.cssVars.light["destructive-foreground"] || "oklch(0.96 0.008 15)";
          themeState.cssVars.dark.destructive = "oklch(0.58 0.22 25)";
          themeState.cssVars.dark["destructive-foreground"] = "oklch(0.96 0.01 15)";
        }
      }

      const activeStyles =
        mode === "dark"
          ? themeState?.cssVars?.dark
          : themeState?.cssVars?.light;

      if (!activeStyles) {
        return;
      }

      const stylesToApply = Object.keys(activeStyles);

      for (const styleName of stylesToApply) {
        const value = activeStyles[styleName];
        if (value !== undefined) {
          root.style.setProperty(\`--\${styleName}\`, value);
        }
      }

      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    })();
  `

    return (
        <script
            // biome-ignore lint/security/noDangerouslySetInnerHtml: this script needs to execute immediately
            dangerouslySetInnerHTML={{ __html: scriptContent }}
            suppressHydrationWarning
        />
    )
}
