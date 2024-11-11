export function setPopupTheme(theme: ThemeField) {
  const mediaQuery = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
  let isDark: boolean;
  if (theme === "system") {
    isDark = mediaQuery?.matches;
    mediaQuery.addEventListener("change", watchSystemTheme);
  } else {
    isDark = theme === "dark";
    mediaQuery.removeEventListener("change", watchSystemTheme);
  }
  console.log(theme, isDark)
  toggleTheme(isDark);
}

function watchSystemTheme(event: MediaQueryListEvent) {
  toggleTheme(event.matches);
}

export function toggleTheme(isDark: boolean) {
  const html = document.querySelector("html");
  if (!html) return;
  html.classList.remove("dark", "light");
  html.classList.add(isDark ? "dark" : "light");
}
