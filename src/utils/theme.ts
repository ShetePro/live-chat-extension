let changeEvent: (isDark: boolean) => void;
const mediaQuery = window.matchMedia
  ? window.matchMedia("(prefers-color-scheme: dark)")
  : null;
export function setThemeMode(
  theme: ThemeField,
  callback?: (isDark: boolean) => void,
) {
  const isDark = handleTheme(theme);
  changeEvent = callback || toggleTheme;
  changeEvent(isDark);
}
export function handleTheme(theme: ThemeField): boolean {
  if (theme === "system") {
    mediaQuery.addEventListener("change", systemThemeChange);
    return mediaQuery?.matches;
  } else {
    mediaQuery.removeEventListener("change", systemThemeChange);
    return theme === "dark";
  }
}
function systemThemeChange(e: MediaQueryListEvent) {
  changeEvent?.(e.matches);
}
export function toggleTheme(isDark: boolean) {
  console.log(isDark, 'theme')
  const html = document.querySelector("html");
  if (!html) return;
  html.classList.remove("dark", "light");
  html.classList.add(isDark ? "dark" : "light");
}
