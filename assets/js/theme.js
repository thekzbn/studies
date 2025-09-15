// Theme management system
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const themeDropdown = document.getElementById('theme-dropdown');
  const themeOptions = document.querySelectorAll('.theme-option');

  if (!themeToggle || !themeDropdown) return;

  const themes = {
    light: { name: 'Light', icon: 'fa-sun', color: '#6366f1' },
    dark: { name: 'Dark', icon: 'fa-moon', color: '#818cf8' },
    amoled: { name: 'AMOLED Black', icon: 'fa-mobile', color: '#00ff88' },
    neon: { name: 'Neon Glow', icon: 'fa-bolt', color: '#ff0080' },
    cyberpunk: { name: 'Cyberpunk', icon: 'fa-robot', color: '#00ffff' },
    pastel: { name: 'Pastel', icon: 'fa-palette', color: '#ff9a9e' },
    luxury: { name: 'Luxury Gold', icon: 'fa-crown', color: '#ffd700' },
    ocean: { name: 'Ocean Blue', icon: 'fa-water', color: '#0ea5e9' },
    sunset: { name: 'Sunset Glow', icon: 'fa-sun', color: '#f97316' },
    minimalist: { name: 'Minimalist', icon: 'fa-circle', color: '#000000' }
  };

  function setTheme(themeName) {
    // Remove all theme classes
    Object.keys(themes).forEach(theme => {
      document.body.classList.remove(`theme-${theme}`);
    });

    // Add new theme class (except for light which is default)
    if (themeName !== 'light') {
      document.body.classList.add(`theme-${themeName}`);
    }

    // Update toggle button
    const theme = themes[themeName];
    themeToggle.innerHTML = `<i class="fa-solid ${theme.icon}" aria-hidden="true"></i>`;

    // Update active option
    themeOptions.forEach(option => {
      option.classList.remove('active');
      if (option.dataset.theme === themeName) {
        option.classList.add('active');
      }
    });

    // Save to localStorage
    localStorage.setItem('theme', themeName);
  }

  // Initialize theme from localStorage or default to light
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);

  // Toggle dropdown
  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    themeDropdown.classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    themeDropdown.classList.remove('active');
  });

  // Prevent dropdown from closing when clicking inside
  themeDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Handle theme selection
  themeOptions.forEach(option => {
    option.addEventListener('click', () => {
      const themeName = option.dataset.theme;
      setTheme(themeName);
      themeDropdown.classList.remove('active');
    });
  });
});