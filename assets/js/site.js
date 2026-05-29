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

  // 1. Calculate dynamic root base directory of the site to support both http:// and file:// protocols
  const siteBase = (function () {
    const currentLoc = window.location.href;
    if (currentLoc.includes('/projects/')) {
      return currentLoc.split('/projects/')[0] + '/';
    }
    if (currentLoc.endsWith('/index.html')) {
      return currentLoc.split('/index.html')[0] + '/';
    }
    // Default fallback to base domain/directory path
    return window.location.protocol + '//' + window.location.host + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
  })();

  // 2. Helper to resolve any relative path correctly relative to site base URL
  function resolveUrl(path) {
    if (!path) return '';
    if (path.startsWith('#') || path.startsWith('http') || path.startsWith('file')) {
      return path;
    }
    // Normalize relative prefix dots
    let cleanPath = path;
    if (cleanPath.startsWith('./')) {
      cleanPath = cleanPath.substring(2);
    } else if (cleanPath.startsWith('../')) {
      cleanPath = cleanPath.substring(3);
    }
    try {
      return new URL(cleanPath, siteBase).href;
    } catch (e) {
      return path;
    }
  }

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

    const resolvedFetchUrl = resolveUrl(url);

    // 1. Add exiting fade out transition class
    contentArea.classList.add('page-exit');

    // 2. Fetch page HTML on the fly
    fetch(resolvedFetchUrl)
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
          let newUrl = resolvedFetchUrl;
          if (hashToScroll) {
            newUrl = resolvedFetchUrl.split('#')[0] + '#' + hashToScroll;
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
          updateNavStateForUrl(resolvedFetchUrl, hashToScroll);
          syncAppStoreDataLive(); // Trigger client-side live App Store metadata sync!

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
        window.location.href = resolvedFetchUrl; // Safe fallback to standard browser redirect
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
            loadPage(resolveUrl('index.html'), href.substring(1));
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
        const targetUrl = resolveUrl('index.html');
        loadPage(targetUrl, hash);
      }
    } else if (href.includes('#')) {
      const parts = href.split('#');
      loadPage(parts[0], parts[1]);
    } else {
      loadPage(href);
    }
  });

  // 3. Real-time dynamic App Store lookup client-side sync engine
  function syncAppStoreDataLive() {
    const versionSpans = document.querySelectorAll('span[id^="version-"]');
    versionSpans.forEach(span => {
      const appStoreId = span.id.replace('version-', '');
      if (!appStoreId) return;

      const ratingSpan = document.getElementById('rating-' + appStoreId);
      
      // Attempt to extract the dynamic release date tag sibling safely
      let dateSpan = null;
      let sibling = span.previousElementSibling;
      while (sibling) {
        const text = sibling.textContent.trim();
        if (text && (text.includes(' ') && !text.toLowerCase().includes('lifestyle') && !text.toLowerCase().includes('business') && !text.toLowerCase().includes('social') && !text.toLowerCase().includes('entertainment') && !text.toLowerCase().includes('news') && !text.toLowerCase().includes('travel') && !text.toLowerCase().includes('finance') && !text.toLowerCase().includes('health'))) {
          dateSpan = sibling;
          break;
        }
        sibling = sibling.previousElementSibling;
      }

      // Live CORS iTunes lookup query direct to Apple database
      fetch(`https://itunes.apple.com/lookup?id=${appStoreId}&country=us`)
        .then(res => res.json())
        .then(data => {
          if (data && data.resultCount > 0) {
            const info = data.results[0];
            const liveVersion = info.version;
            const liveRatingRaw = info.averageUserRating;

            // Stars formatting
            let liveRating = 'Unrated';
            if (typeof liveRatingRaw === 'number' && liveRatingRaw > 0) {
              liveRating = liveRatingRaw.toFixed(1) + '★';
            }

            // Date formatting
            const rawDate = info.currentVersionReleaseDate || info.releaseDate;
            let formattedDate = null;
            if (rawDate) {
              const dt = new Date(rawDate);
              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              formattedDate = `${days[dt.getUTCDay()]} ${String(dt.getUTCDate()).padStart(2, '0')} ${months[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
            }

            // Dynamically update DOM badges in high fidelity smooth transitions
            if (liveVersion && span.textContent !== 'v' + liveVersion) {
              span.style.opacity = '0';
              setTimeout(() => {
                span.textContent = 'v' + liveVersion;
                span.style.opacity = '1';
              }, 300);
            }

            if (liveRating && ratingSpan && ratingSpan.textContent !== liveRating) {
              ratingSpan.style.opacity = '0';
              setTimeout(() => {
                ratingSpan.textContent = liveRating;
                ratingSpan.style.opacity = '1';
              }, 300);
            }

            if (formattedDate && dateSpan && dateSpan.textContent !== formattedDate) {
              dateSpan.style.opacity = '0';
              setTimeout(() => {
                dateSpan.textContent = formattedDate;
                dateSpan.style.opacity = '1';
              }, 300);
            }
          }
        })
        .catch(err => {
          console.warn('Dynamic live App Store sync failed, using static cache:', err);
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initThemeToggle();
    initSegmentedControl();
    syncAppStoreDataLive();
  });
})();
