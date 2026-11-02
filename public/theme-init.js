// Runs before first paint (see index.html). Keep in sync with src/lib/theme.ts.
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark =
      stored === "dark" ||
      (stored !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch {
    // Storage blocked: fall back to the light theme.
  }
})();
