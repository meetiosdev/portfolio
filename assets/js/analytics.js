(function () {
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-LXSRQY10PK');

  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-LXSRQY10PK';
  document.head.appendChild(gtagScript);

  /**
   * Tracks standard custom portfolio clicks
   */
  window.trackClick = function (name) {
    let eventName = 'click';
    let category = 'portfolio';
    let label = name;
    const normalized = String(name || '').toLowerCase();

    if (normalized.includes('linkedin')) {
      eventName = 'linkedin_click';
      category = 'social';
      label = 'LinkedIn Profile';
    } else if (normalized.includes('github')) {
      eventName = 'github_click';
      category = 'social';
      label = 'GitHub Profile';
    } else if (normalized.includes('resume')) {
      eventName = 'resume_click';
      category = 'career';
    } else if (normalized.includes('whatsapp')) {
      eventName = 'whatsapp_click';
      category = 'contact';
      label = 'WhatsApp Chat';
    } else if (normalized.includes('email') || normalized.includes('phone')) {
      eventName = 'contact_click';
      category = 'contact';
    } else if (normalized.includes('app store')) {
      eventName = 'app_store_click';
      category = 'conversion';
    } else {
      eventName = normalized.replace(/[^a-z0-9]/g, '_') + '_click';
      category = 'social';
    }

    gtag('event', eventName, {
      event_category: category,
      event_label: label
    });

    if (window.trackSupabaseEvent) {
      window.trackSupabaseEvent(eventName);
    }
  };

  // Track standard elements annotated with data-track
  document.addEventListener('click', function (event) {
    const trackedElement = event.target.closest('[data-track]');
    if (!trackedElement) return;
    window.trackClick(trackedElement.getAttribute('data-track'));
  });

  // ==========================================
  // ADVANCED USER FRICTION TELEMETRY (Rage & Dead Clicks)
  // ==========================================

  let clickQueue = [];

  document.addEventListener('click', function (event) {
    const now = Date.now();
    const target = event.target;

    // Filter queue to keep only clicks within the last 2 seconds
    clickQueue = clickQueue.filter(c => now - c.timestamp < 2000);

    // Push new click metadata
    clickQueue.push({ target, timestamp: now });

    // 1. Detect Rage Clicks: 4 clicks on the EXACT SAME element in < 2 seconds
    const sameElementClicks = clickQueue.filter(c => c.target === target);
    if (sameElementClicks.length >= 4) {
      console.warn('UX Telemetry: Rage Click detected on element:', target);
      gtag('event', 'rage_click', {
        clicked_element_id: target.id || 'none',
        clicked_element_class: target.className || 'none',
        clicked_element_tag: target.tagName,
        page_path: window.location.pathname
      });
      // Clear queue to prevent multi-firing within the same trigger cycle
      clickQueue = [];
      return;
    }

    // 2. Detect Dead Clicks: Clicks landing on non-interactive elements
    const interactiveTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL'];
    const isInteractive = event.composedPath().some(el => {
      if (!el.tagName) return false;
      const tag = el.tagName;
      return interactiveTags.includes(tag) || 
             el.hasAttribute('data-track') || 
             el.hasAttribute('onclick') || 
             el.getAttribute('role') === 'button' ||
             window.getComputedStyle(el).cursor === 'pointer';
    });

    if (!isInteractive) {
      console.info('UX Telemetry: Dead Click detected on page canvas:', target);
      gtag('event', 'dead_click', {
        clicked_element_id: target.id || 'none',
        clicked_element_class: target.className || 'none',
        clicked_element_tag: target.tagName,
        page_path: window.location.pathname
      });
    }
  });

  // Microsoft Clarity Tag Integration
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () {
      (c[a].q = c[a].q || []).push(arguments);
    };
    t = l.createElement(r);
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', 'wkw3du8lgn');
})();
