const { createClient } = require('@supabase/supabase-js');

// These can be empty during dev if environment variables are not yet set
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('Supabase credentials missing. Supabase client is not initialized.');
}

const getEvents = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }

  // Fetch events from the 'events' table
  const { data, error } = await supabase
    .from('events')
    .select('event_name, page, device, time_on_page, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  // Process data (group by event, date, page as requested)
  // We'll return the raw data and let the controller or frontend group it,
  // or we can group it here. We'll group it here for a cleaner API response.
  
  const processedData = {
    raw: data,
    byEvent: {},
    byDate: {},
    byPage: {}
  };

  data.forEach(event => {
    // Group by event
    if (!processedData.byEvent[event.event_name]) {
      processedData.byEvent[event.event_name] = 0;
    }
    processedData.byEvent[event.event_name]++;

    // Group by date (YYYY-MM-DD)
    const date = new Date(event.created_at).toISOString().split('T')[0];
    if (!processedData.byDate[date]) {
      processedData.byDate[date] = 0;
    }
    processedData.byDate[date]++;

    // Group by page
    if (!processedData.byPage[event.page]) {
      processedData.byPage[event.page] = 0;
    }
    processedData.byPage[event.page]++;
  });

  return processedData;
};

module.exports = {
  getEvents
};
