// supabase-tracking.js

const supabaseUrl = 'https://liffowvslpcykrktlved.supabase.co';
const supabaseKey = 'sb_publishable_YThhUQos4gfieXCElzggWA_ufrtqW7Y';

let supabaseClient = null;

if (window.supabase) {
  // 1. Fix Supabase client initialization (CORS / credentials omit)
  supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          mode: 'cors',
          credentials: 'omit'
        });
      }
    }
  });
} else {
  console.warn("Supabase script not loaded. Tracking disabled.");
}

// 1. Session Management
let sessionId = localStorage.getItem('session_id');
if (!sessionId) {
  sessionId = (window.crypto && window.crypto.randomUUID) 
    ? window.crypto.randomUUID() 
    : 'sess_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('session_id', sessionId);
}

// 2. Device & Browser Detection
const userAgent = navigator.userAgent;
const device = /mobile/i.test(userAgent) ? 'mobile' : 'desktop';
const browser = userAgent.includes('Chrome')
  ? 'Chrome'
  : userAgent.includes('Safari') && !userAgent.includes('Chrome')
  ? 'Safari'
  : userAgent.includes('Firefox')
  ? 'Firefox'
  : 'Other';

// 3. Page Start Time & Scroll Depth
window.__pageStartTime = Date.now();
window.__maxScroll = 0;

window.addEventListener('scroll', () => {
  const scrollableHeight = document.body.scrollHeight - window.innerHeight;
  if (scrollableHeight <= 0) return;
  
  const scrollPercent = Math.floor((window.scrollY / scrollableHeight) * 100);
  if (scrollPercent > window.__maxScroll) {
    window.__maxScroll = scrollPercent > 100 ? 100 : scrollPercent;
  }
});

// 4. Advanced Tracking Function & Debounce
const lastEventTime = {};

function shouldTrack(eventName) {
  const now = Date.now();
  if (!lastEventTime[eventName] || now - lastEventTime[eventName] > 2000) {
    lastEventTime[eventName] = now;
    return true;
  }
  return false;
}

window.trackSupabaseEvent = function(eventName, extraData = {}) {
  // 6. Make tracking optional-safe (fail silently if not loaded)
  if (!supabaseClient) return;

  if (!shouldTrack(eventName)) {
    return; // Skip duplicate event (debounced)
  }

  // 4. Add delay to avoid tracking blockers (500ms delay)
  setTimeout(async () => {
    // 3. Add try/catch wrapper
    try {
      const timeOnPage = Math.floor((Date.now() - window.__pageStartTime) / 1000);

      // 5. Improve payload safety (strict schema match)
      const payload = {
        event_name: eventName || 'unknown',
        page: window.location.pathname || '/',
        device: device || 'unknown',
        browser: browser || 'unknown',
        referrer: document.referrer || 'direct',
        session_id: sessionId || 'unknown',
        time_on_page: isNaN(timeOnPage) ? 0 : timeOnPage,
        scroll_depth: isNaN(window.__maxScroll) ? 0 : window.__maxScroll
      };

      // 2. Improve insert logic (async/await and deep error logging)
      const { error } = await supabaseClient
        .from('events')
        .insert([payload]);

      if (error) {
        console.warn('Supabase tracking warning:', JSON.stringify(error, null, 2));
      }
    } catch (err) {
      console.warn('Unexpected error in tracking module (safely ignored):', err);
    }
  }, 750); // 750ms delay for robustness
};

// 5. Initialize Listeners and Page View
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-event]').forEach((el) => {
    el.addEventListener('click', () => {
      const eventName = el.getAttribute('data-event');
      if (eventName) {
        window.trackSupabaseEvent(eventName);
      }
    });
  });

  // Automatically track page view
  window.trackSupabaseEvent('page_view');
});

// 6. Track Time Spent on Page Exit
window.addEventListener('beforeunload', () => {
  window.trackSupabaseEvent('page_exit');
});
