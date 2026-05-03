// supabase-tracking.js

const supabaseUrl = 'https://liffowvslpcykrktlved.supabase.co';
const supabaseKey = 'sb_publishable_YThhUQos4gfieXCElzggWA_ufrtqW7Y';

let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} else {
  console.error("Supabase script not loaded. Tracking disabled.");
}

// 1. Session Management
let sessionId = localStorage.getItem('session_id');
if (!sessionId) {
  // Use crypto.randomUUID if available (requires HTTPS), fallback if not
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

window.trackSupabaseEvent = async function(eventName, extraData = {}) {
    if (!supabaseClient) return;

    if (!shouldTrack(eventName)) {
        return; // Skip duplicate event (debounced)
    }

    try {
        const timeOnPage = Math.floor((Date.now() - window.__pageStartTime) / 1000);

        const payload = {
            event_name: eventName,
            page: window.location.pathname,
            device: device,
            browser: browser,
            referrer: document.referrer || 'direct',
            session_id: sessionId,
            time_on_page: timeOnPage,
            scroll_depth: window.__maxScroll || 0,
            ...extraData
        };

        const { error } = await supabaseClient
            .from('events')
            .insert([payload]);

        if (error) {
            console.error('Supabase insert error:', error);
        }
    } catch (err) {
        console.error('Unexpected error tracking event:', err);
    }
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
