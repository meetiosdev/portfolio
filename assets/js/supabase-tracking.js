// supabase-tracking.js

const supabaseUrl = 'https://liffowvslpcykrktlved.supabase.co';
const supabaseKey = 'sb_publishable_YThhUQos4gfieXCElzggWA_ufrtqW7Y';

let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
} else {
  console.error("Supabase script not loaded. Tracking disabled.");
}

// Debounce state to prevent rapid spam clicks
const recentEvents = new Set();
const DEBOUNCE_TIME_MS = 2000;

window.trackSupabaseEvent = async function(eventName) {
    if (!supabaseClient) return;

    // Debounce duplicate events within a short timeframe
    if (recentEvents.has(eventName)) {
        return; // Skip duplicate event
    }
    
    recentEvents.add(eventName);
    setTimeout(() => {
        recentEvents.delete(eventName);
    }, DEBOUNCE_TIME_MS);

    try {
        const { error } = await supabaseClient
            .from('events')
            .insert([
                {
                    event_name: eventName,
                    page: window.location.pathname
                }
            ]);

        if (error) {
            console.error('Supabase insert error:', error);
        }
    } catch (err) {
        console.error('Unexpected error tracking event:', err);
    }
};

// Setup generic data-event listeners and initial page_view track
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
