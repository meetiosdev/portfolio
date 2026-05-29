(function () {
  // Safe storage wrappers to prevent DOM Exception security errors on local file:// previews or in Private mode
  const safeStorage = {
    getItem: function (key, type = 'session') {
      try {
        const storage = type === 'local' ? localStorage : sessionStorage;
        return storage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    setItem: function (key, value, type = 'session') {
      try {
        const storage = type === 'local' ? localStorage : sessionStorage;
        storage.setItem(key, value);
      } catch (e) {
        // ignore security exceptions
      }
    },
    removeItem: function (key, type = 'session') {
      try {
        const storage = type === 'local' ? localStorage : sessionStorage;
        storage.removeItem(key);
      } catch (e) {
        // ignore security exceptions
      }
    }
  };

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
    const storedTheme = safeStorage.getItem('theme', 'local');
    const shouldUseDark = storedTheme === 'dark' || (!storedTheme && prefersDark);

    document.documentElement.classList.toggle('dark', shouldUseDark);
    themeToggleIcon.textContent = shouldUseDark ? 'light_mode' : 'dark_mode';

    themeToggleBtn.addEventListener('click', function () {
      themeToggleIcon.style.transform = 'rotate(90deg) scale(0.5)';
      themeToggleIcon.style.opacity = '0';

      window.setTimeout(function () {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        safeStorage.setItem('theme', isDark ? 'dark' : 'light', 'local');
        themeToggleIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
        themeToggleIcon.style.transform = 'rotate(-90deg) scale(0.5)';
        void themeToggleIcon.offsetWidth;
        themeToggleIcon.style.transform = 'rotate(0deg) scale(1)';
        themeToggleIcon.style.opacity = '1';
      }, 150);
    });
  }

  function initSegmentedControl() {
    const control = document.querySelector('.segmented-control');
    if (!control) return;

    const labels = control.querySelectorAll('label');
    const inputs = Array.from(control.querySelectorAll('input[type="radio"]'));

    const isHomePage = (window.location.pathname.endsWith('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.includes('portfolio') || 
                        window.location.pathname.includes('meetiosdev')) && 
                       !window.location.pathname.includes('projects');

    // 1. Dynamic scroll tracking: update active input as user scrolls (home page ONLY)
    if (isHomePage) {
      const sections = ['home', 'experience', 'contact'];
      
      window.addEventListener('scroll', function () {
        let currentSection = 'home';
        const scrollPos = window.scrollY + 140; // navigation offset bar

        sections.forEach(function (id) {
          const sectionEl = document.getElementById(id);
          if (sectionEl) {
            const top = sectionEl.offsetTop;
            const height = sectionEl.offsetHeight;
            if (scrollPos >= top && scrollPos < top + height) {
              currentSection = id;
            }
          }
        });

        // Set checked state on the corresponding radio button
        const targetInput = document.getElementById('nav-' + currentSection);
        if (targetInput && !targetInput.checked) {
          targetInput.checked = true;
        }
      }, { passive: true });
    }

    // 2. Click navigation routing handler on labels
    labels.forEach(function (label) {
      label.addEventListener('click', function (e) {
        const href = label.getAttribute('data-href');
        if (!href) return;

        const inputId = label.getAttribute('for');
        const input = document.getElementById(inputId);

        // Check if it's an anchor scroll on the same page
        if (href.startsWith('#')) {
          e.preventDefault();
          if (input) {
            input.checked = true;
          }

          const hash = href.substring(1);
          const targetEl = document.getElementById(hash);
          if (targetEl) {
            window.scrollTo({
              top: targetEl.offsetTop - 80,
              behavior: 'smooth'
            });
            window.history.pushState(null, null, '#' + hash);
          }
        } else if (href.includes('#')) {
          // Navigating back to home page hash from projects
          e.preventDefault();
          if (input) input.checked = true; // Slide the pill first!
          
          setTimeout(() => {
            window.location.href = href;
          }, 280); // Let the slide animation complete beautifully!
        } else {
          // Normal external page transition (e.g. going to Projects or Home)
          e.preventDefault();
          if (input) input.checked = true; // Slide the pill first!

          setTimeout(() => {
            window.location.href = href;
          }, 280); // Let the slide animation complete beautifully!
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initThemeToggle();
    initSegmentedControl();
  });
})();
