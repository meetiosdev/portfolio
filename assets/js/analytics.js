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

  document.addEventListener('click', function (event) {
    const trackedElement = event.target.closest('[data-track]');
    if (!trackedElement) return;
    window.trackClick(trackedElement.getAttribute('data-track'));
  });

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
