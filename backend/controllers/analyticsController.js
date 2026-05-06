const supabaseService = require('../services/supabaseService');
const gaService = require('../services/gaService');

const getEvents = async (req, res) => {
  try {
    const data = await supabaseService.getEvents();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Supabase events:', error);
    res.status(500).json({ error: 'Failed to fetch events from Supabase' });
  }
};

const getGaAnalytics = async (req, res) => {
  try {
    const data = await gaService.getAnalyticsData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching GA data:', error);
    res.status(500).json({ error: 'Failed to fetch GA analytics' });
  }
};

const getDashboard = async (req, res) => {
  try {
    // Attempt to fetch from both concurrently
    const [supabaseData, gaData] = await Promise.allSettled([
      supabaseService.getEvents(),
      gaService.getAnalyticsData()
    ]);

    const result = {
      supabase: supabaseData.status === 'fulfilled' ? supabaseData.value : { error: supabaseData.reason.message },
      ga: gaData.status === 'fulfilled' ? gaData.value : { error: gaData.reason.message }
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assemble dashboard data' });
  }
};

module.exports = {
  getEvents,
  getGaAnalytics,
  getDashboard
};
