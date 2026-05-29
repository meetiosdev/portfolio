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
    const control = document.querySelector('.segmented-control');
    if (!control) return;

    const labels = control.querySelectorAll('label');
    const inputs = Array.from(control.querySelectorAll('input[type="radio"]'));

    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' || 
                       (window.location.pathname.includes('portfolio') && !window.location.pathname.includes('projects'));

    // Helper to store the current active tab index
    function updateStoredIndex(indexToStore) {
      if (typeof indexToStore === 'number') {
        sessionStorage.setItem('prevTabIndex', indexToStore);
        return;
      }
      const checkedInput = control.querySelector('input[type="radio"]:checked');
      if (checkedInput) {
        const index = inputs.indexOf(checkedInput);
        if (index !== -1) {
          sessionStorage.setItem('prevTabIndex', index);
        }
      }
    }

    // 1. Smooth slide-in animation on page load from previous page index
    const prevIndexStr = sessionStorage.getItem('prevTabIndex');
    const currentIndex = inputs.indexOf(control.querySelector('input[type="radio"]:checked'));
    
    if (prevIndexStr !== null && currentIndex !== -1) {
      const prevIndex = parseInt(prevIndexStr, 10);
      if (prevIndex !== -1 && prevIndex !== currentIndex && prevIndex < inputs.length) {
        // Temporarily select the previous tab to starting position
        inputs[prevIndex].checked = true;
        
        const pill = control.querySelector('.selection-pill');
        if (pill) {
          // Disable transition temporarily to avoid an unwanted fast back-slide on DOM init
          const originalTransition = pill.style.transition;
          pill.style.transition = 'none';
          
          // Force layout reflow
          void control.offsetHeight;
          
          // Re-enable transition and smoothly slide to the current target page tab
          setTimeout(() => {
            pill.style.transition = originalTransition;
            inputs[currentIndex].checked = true;
            updateStoredIndex(currentIndex);
          }, 30);
        } else {
          inputs[currentIndex].checked = true;
          updateStoredIndex(currentIndex);
        }
      } else {
        updateStoredIndex(currentIndex);
      }
    } else {
      updateStoredIndex(currentIndex);
    }

    // 2. Dynamic scroll tracking: update active input as user scrolls (home page ONLY)
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
          updateStoredIndex(inputs.indexOf(targetInput));
        }
      }, { passive: true });
    }

    // 3. Click navigation routing handler on labels
    labels.forEach(function (label) {
      label.addEventListener('click', function (e) {
        const href = label.getAttribute('data-href');
        if (!href) return;

        const inputId = label.getAttribute('for');
        const input = document.getElementById(inputId);

        // Capture previous active index before we transition checked states
        const activeInput = control.querySelector('input[type="radio"]:checked');
        const prevIdx = activeInput ? inputs.indexOf(activeInput) : -1;
        if (prevIdx !== -1) {
          sessionStorage.setItem('prevTabIndex', prevIdx);
        }

        // Check if it's an anchor scroll on the same page
        if (href.startsWith('#')) {
          e.preventDefault();
          if (input) {
            input.checked = true;
            updateStoredIndex(inputs.indexOf(input));
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
