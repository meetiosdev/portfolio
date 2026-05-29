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

  function initSegmentedControl() {
    const nav = document.querySelector('.segmented-control-nav');
    if (!nav) return;

    // Create the sliding indicator background element dynamically
    let indicator = nav.querySelector('.segmented-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'segmented-indicator';
      nav.appendChild(indicator);
    }

    const items = nav.querySelectorAll('.segment-item');
    
    function updateIndicator(activeItem) {
      if (!activeItem) return;
      const navRect = nav.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      
      const left = itemRect.left - navRect.left;
      const width = itemRect.width;
      
      indicator.style.left = left + 'px';
      indicator.style.width = width + 'px';
    }

    // Set initial position
    const activeItem = nav.querySelector('.segment-item.active') || items[0];
    if (activeItem) {
      window.setTimeout(function () {
        updateIndicator(activeItem);
      }, 80);
    }

    // Dynamic scroll tracking: update active section as user scrolls (home page ONLY)
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('portfolio') || 
                       window.location.pathname.endsWith('portfolio/');
                       
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

        // Sync active class on navigation items
        items.forEach(function (item) {
          const href = item.getAttribute('href');
          if (href) {
            const hash = href.split('#')[1] || 'home';
            if (hash === currentSection) {
              items.forEach(i => i.classList.remove('active'));
              item.classList.add('active');
              updateIndicator(item);
            }
          }
        });
      }, { passive: true });
    }

    // Tap support: Slide dynamically on hash navigation click before transition
    items.forEach(function (item) {
      item.addEventListener('click', function (e) {
        const href = item.getAttribute('href');
        
        if (href.startsWith('#') || href.startsWith('index.html#') || href.includes('#')) {
          const hash = href.split('#')[1];
          const targetEl = document.getElementById(hash);
          if (targetEl) {
            e.preventDefault();
            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            updateIndicator(item);

            window.scrollTo({
              top: targetEl.offsetTop - 80,
              behavior: 'smooth'
            });
            // Update URL hash without reload
            window.history.pushState(null, null, '#' + hash);
          }
        }
      });
    });

    // Make sure indicator recalculates on window resize
    window.addEventListener('resize', function () {
      const currentActive = nav.querySelector('.segment-item.active');
      if (currentActive) updateIndicator(currentActive);
    }, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initThemeToggle();
    initSegmentedControl();
  });
})();
