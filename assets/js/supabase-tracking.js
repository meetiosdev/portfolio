const supabaseUrl = 'https://liffowvslpcykrktlved.supabase.co';
const supabaseKey = 'sb_publishable_YThhUQos4gfieXCElzggWA_ufrtqW7Y';
const supabaseEventsUrl = supabaseUrl + '/rest/v1/events';

let sessionId = localStorage.getItem('session_id');
if (!sessionId) {
  sessionId = window.crypto && window.crypto.randomUUID
    ? window.crypto.randomUUID()
    : 'sess_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('session_id', sessionId);
}

const userAgent = navigator.userAgent;
const device = /mobile/i.test(userAgent) ? 'mobile' : 'desktop';
const browser = userAgent.includes('Chrome')
  ? 'Chrome'
  : userAgent.includes('Safari') && !userAgent.includes('Chrome')
  ? 'Safari'
  : userAgent.includes('Firefox')
  ? 'Firefox'
  : 'Other';

window.__pageStartTime = Date.now();
window.__maxScroll = 0;

window.addEventListener('scroll', function () {
  const scrollableHeight = document.body.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) return;

  const scrollPercent = Math.floor((window.scrollY / scrollableHeight) * 100);
  if (scrollPercent > window.__maxScroll) {
    window.__maxScroll = scrollPercent > 100 ? 100 : scrollPercent;
  }
}, { passive: true });

const lastEventTime = {};

function shouldTrack(eventName) {
  const now = Date.now();
  if (!lastEventTime[eventName] || now - lastEventTime[eventName] > 2000) {
    lastEventTime[eventName] = now;
    return true;
  }
  return false;
}

function buildPayload(eventName, extraData) {
  const timeOnPage = Math.floor((Date.now() - window.__pageStartTime) / 1000);

  return {
    event_name: eventName || 'unknown',
    page: window.location.pathname || '/',
    device: device || 'unknown',
    browser: browser || 'unknown',
    referrer: document.referrer || 'direct',
    session_id: sessionId || 'unknown',
    time_on_page: Number.isNaN(timeOnPage) ? 0 : timeOnPage,
    scroll_depth: Number.isNaN(window.__maxScroll) ? 0 : window.__maxScroll,
    ...extraData
  };
}

window.trackSupabaseEvent = function (eventName, extraData = {}) {
  if (!shouldTrack(eventName)) return;

  window.setTimeout(function () {
    const payload = buildPayload(eventName, extraData);

    fetch(supabaseEventsUrl, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
      headers: {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    }).catch(function () {});
  }, 750);
};

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-event]').forEach(function (el) {
    el.addEventListener('click', function () {
      const eventName = el.getAttribute('data-event');
      if (eventName) {
        window.trackSupabaseEvent(eventName);
      }
    });
  });

  window.trackSupabaseEvent('page_view');
});

window.addEventListener('beforeunload', function () {
  window.trackSupabaseEvent('page_exit');
});
