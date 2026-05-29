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

  // Helper to dynamically check if current route is the homepage
  function checkIsHomePage() {
    return (window.location.pathname.endsWith('index.html') || 
            window.location.pathname === '/' || 
            window.location.pathname.includes('portfolio') || 
            window.location.pathname.includes('meetiosdev')) && 
           !window.location.pathname.includes('projects');
  }

  function initMobileMenu() {
    const mobileMenuTrigger = document.getElementById('mobile-menu-trigger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenuTrigger || !mobileMenu) return;

    // Remove existing event listeners to avoid double-binding on SPA re-init
    const newTrigger = mobileMenuTrigger.cloneNode(true);
    mobileMenuTrigger.parentNode.replaceChild(newTrigger, mobileMenuTrigger);

    newTrigger.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
      mobileMenu.classList.toggle('flex');
      newTrigger.textContent = mobileMenu.classList.contains('flex') ? 'close' : 'menu';
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        newTrigger.textContent = 'menu';
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

    // Clone button to strip existing listeners and avoid multiple event binding
    const newBtn = themeToggleBtn.cloneNode(true);
    themeToggleBtn.parentNode.replaceChild(newBtn, themeToggleBtn);
    const newIcon = newBtn.querySelector('#theme-toggle-icon') || themeToggleIcon;

    newBtn.addEventListener('click', function () {
      newIcon.style.transform = 'rotate(90deg) scale(0.5)';
      newIcon.style.opacity = '0';

      window.setTimeout(function () {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        safeStorage.setItem('theme', isDark ? 'dark' : 'light', 'local');
        newIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
        newIcon.style.transform = 'rotate(-90deg) scale(0.5)';
        void newIcon.offsetWidth;
        newIcon.style.transform = 'rotate(0deg) scale(1)';
        newIcon.style.opacity = '1';
      }, 150);
    });
  }

  // ==========================================
  // SaaS persistent SPA router engine
  // ==========================================

  function loadPage(url, hashToScroll = null, shouldPushState = true) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    // 1. Add exiting fade out transition class
    contentArea.classList.add('page-exit');

    // 2. Fetch page HTML on the fly
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('SPA: Page fetch failure');
        return response.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const targetContent = doc.getElementById('content-area');

        if (targetContent) {
          // 3. Update window page title
          document.title = doc.title;

          // 4. Inject target HTML content safely
          contentArea.innerHTML = targetContent.innerHTML;
          contentArea.className = targetContent.className;

          // 5. Update browser history state
          let newUrl = url;
          if (hashToScroll) {
            newUrl = url.split('#')[0] + '#' + hashToScroll;
          }
          if (shouldPushState) {
            window.history.pushState(null, '', newUrl);
          }

          // 6. Track page view telemetry in GA4 and Supabase
          if (window.gtag) {
            window.gtag('event', 'page_view', {
              page_title: document.title,
              page_location: window.location.href,
              page_path: window.location.pathname
            });
          }
          if (window.trackSupabaseEvent) {
            window.__pageStartTime = Date.now();
            window.__maxScroll = 0;
            window.trackSupabaseEvent('page_view');
          }

          // 7. Slide segmented navigation pill seamlessly to new active state position
          updateNavStateForUrl(url, hashToScroll);

          // 8. Trigger exiting transition cleanup and fade-in
          setTimeout(() => {
            contentArea.classList.remove('page-exit');
            contentArea.classList.add('page-enter');

            // 9. Smoothly align layout positions (either section scroll or page top jump)
            if (hashToScroll) {
              const targetEl = document.getElementById(hashToScroll);
              if (targetEl) {
                window.scrollTo({
                  top: targetEl.offsetTop - 80,
                  behavior: 'smooth'
                });
              }
            } else {
              window.scrollTo({ top: 0, behavior: 'instant' });
            }

            setTimeout(() => {
              contentArea.classList.remove('page-enter');
            }, 200);
          }, 50);
        }
      })
      .catch(error => {
        console.error('SPA routing error:', error);
        window.location.href = url; // Safe fallback to standard browser redirect
      });
  }

  function updateNavStateForUrl(url, hash = null) {
    const control = document.querySelector('.segmented-control');
    if (!control) return;

    let targetId = 'nav-home';

    if (url.includes('projects')) {
      targetId = 'nav-projects';
    } else if (hash === 'experience') {
      targetId = 'nav-experience';
    } else if (hash === 'contact') {
      targetId = 'nav-contact';
    }

    const input = document.getElementById(targetId);
    if (input && !input.checked) {
      input.checked = true;
    }
  }

  // Intercept back / forward browser history navigation
  window.addEventListener('popstate', function () {
    const url = window.location.pathname;
    const hash = window.location.hash ? window.location.hash.substring(1) : null;
    loadPage(url, hash, false);
  });

  function initSegmentedControl() {
    const control = document.querySelector('.segmented-control');
    if (!control) return;

    const labels = control.querySelectorAll('label');
    const inputs = Array.from(control.querySelectorAll('input[type="radio"]'));

    // 1. Initial Hash check on page load to prevent pill from jumping/sliding from Home
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const targetInput = document.getElementById('nav-' + hash);
      if (targetInput) {
        const pill = control.querySelector('.selection-pill');
        if (pill) {
          const originalTransition = pill.style.transition;
          pill.style.transition = 'none';
          targetInput.checked = true;
          void control.offsetHeight; // Force reflow
          setTimeout(() => {
            pill.style.transition = originalTransition;
          }, 50);
        } else {
          targetInput.checked = true;
        }
      }
    }

    // 2. Dynamic scroll tracking: update active input as user scrolls (home page ONLY)
    window.addEventListener('scroll', function () {
      if (!checkIsHomePage()) return;

      const sections = ['home', 'experience', 'contact'];
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

    // 3. Click navigation routing handler on labels using SPA content swapper
    labels.forEach(function (label) {
      label.addEventListener('click', function (e) {
        const href = label.getAttribute('data-href');
        if (!href) return;

        const inputId = label.getAttribute('for');
        const input = document.getElementById(inputId);

        // Slide the pill immediately for visual feedback
        if (input) {
          input.checked = true;
        }

        // Check if it's an anchor scroll on the same page
        if (href.startsWith('#')) {
          e.preventDefault();
          if (checkIsHomePage()) {
            // Smooth scroll on the same page
            const hash = href.substring(1);
            const targetEl = document.getElementById(hash);
            if (targetEl) {
              window.scrollTo({
                top: targetEl.offsetTop - 80,
                behavior: 'smooth'
              });
              window.history.pushState(null, null, '#' + hash);
            }
          } else {
            // From projects page to home page anchor
            e.preventDefault();
            loadPage('../index.html', href.substring(1));
          }
        } else if (href.includes('#')) {
          // Cross-page anchor scroll
          e.preventDefault();
          const parts = href.split('#');
          loadPage(parts[0], parts[1]);
        } else {
          // Normal page transition
          e.preventDefault();
          loadPage(href);
        }
      });
    });
  }

  // Intercept logo, mobile menu links, and all header links for absolute SPA feel
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Bypass external links, mailto, tel, and blank targets
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || link.hasAttribute('target') || link.getAttribute('target') === '_blank') {
      return;
    }

    e.preventDefault();

    if (href.startsWith('#')) {
      const hash = href.substring(1);
      if (checkIsHomePage()) {
        const targetEl = document.getElementById(hash);
        if (targetEl) {
          window.scrollTo({
            top: targetEl.offsetTop - 80,
            behavior: 'smooth'
          });
          window.history.pushState(null, null, '#' + hash);
          updateNavStateForUrl(window.location.pathname, hash);
        }
      } else {
        // Intercept logo / Home clicks inside subfolders going back
        const targetUrl = window.location.pathname.includes('projects') ? '../index.html' : './index.html';
        loadPage(targetUrl, hash);
      }
    } else if (href.includes('#')) {
      const parts = href.split('#');
      loadPage(parts[0], parts[1]);
    } else {
      loadPage(href);
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initThemeToggle();
    initSegmentedControl();
  });
})();
