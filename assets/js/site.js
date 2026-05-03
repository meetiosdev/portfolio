(function () {
  function initMobileMenu() {
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenuTrigger || !mobileMenu) return;

    mobileMenuTrigger.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('flex');
      mobileMenuTrigger.textContent = mobileMenu.classList.contains('flex') ? 'close' : 'menu';
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        mobileMenuTrigger.textContent = 'menu';
      });
    });
  }

  function initThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    if (!themeToggleBtn || !themeToggleIcon) return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    const shouldUseDark = storedTheme === 'dark' || (!storedTheme && prefersDark);

    document.documentElement.classList.toggle('dark', shouldUseDark);
    themeToggleIcon.textContent = shouldUseDark ? 'light_mode' : 'dark_mode';

    themeToggleBtn.addEventListener('click', function () {
      themeToggleIcon.style.transform = 'rotate(90deg) scale(0.5)';
      themeToggleIcon.style.opacity = '0';

      window.setTimeout(function () {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggleIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
        themeToggleIcon.style.transform = 'rotate(-90deg) scale(0.5)';
        void themeToggleIcon.offsetWidth;
        themeToggleIcon.style.transform = 'rotate(0deg) scale(1)';
        themeToggleIcon.style.opacity = '1';
      }, 150);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initThemeToggle();
  });
})();
