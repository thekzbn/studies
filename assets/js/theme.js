// theme.js — persistent light/dark toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const ICONS = {
    light: '<i class="fa-solid fa-moon" aria-hidden="true"></i>',
    dark: '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
  };

  function setTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      toggle.innerHTML = ICONS.dark;
      toggle.setAttribute('aria-pressed', 'true');
    } else {
      document.body.classList.remove('dark');
      toggle.innerHTML = ICONS.light;
      toggle.setAttribute('aria-pressed', 'false');
    }
    localStorage.setItem('theme', theme);
  }

  // Initialize from localStorage or system preference
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(saved || (prefersDark ? 'dark' : 'light'));

  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  });
});
