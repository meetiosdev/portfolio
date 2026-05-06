const { BetaAnalyticsDataClient } = require('@google-analytics/data');

// Initializes the GA4 Data Client.
// Note: It automatically looks for the GOOGLE_APPLICATION_CREDENTIALS environment variable.
const analyticsDataClient = new BetaAnalyticsDataClient();

const getAnalyticsData = async () => {
  const propertyId = process.env.GA_PROPERTY_ID;

  if (!propertyId) {
    throw new Error('Google Analytics Property ID is not configured.');
  }

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      dimensions: [
        { name: 'country' },
        { name: 'deviceCategory' },
        { name: 'date' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
      ],
    });

    // Process the data to return a structured format
    const processedData = {
      users: 0,
      sessions: 0,
      countries: {},
      devices: {},
      daily: {}
    };

    response.rows.forEach(row => {
      const country = row.dimensionValues[0].value;
      const device = row.dimensionValues[1].value;
      const date = row.dimensionValues[2].value;
      
      const users = parseInt(row.metricValues[0].value, 10);
      const sessions = parseInt(row.metricValues[1].value, 10);

      // Aggregate totals
      processedData.users += users;
      processedData.sessions += sessions;

      // Aggregate by country
      if (!processedData.countries[country]) processedData.countries[country] = 0;
      processedData.countries[country] += users;

      // Aggregate by device
      if (!processedData.devices[device]) processedData.devices[device] = 0;
      processedData.devices[device] += users;

      // Aggregate by date
      if (!processedData.daily[date]) {
        processedData.daily[date] = { users: 0, sessions: 0 };
      }
      processedData.daily[date].users += users;
      processedData.daily[date].sessions += sessions;
    });

    return processedData;
  } catch (error) {
    console.error('Error fetching GA data:', error);
    throw error;
  }
};

module.exports = {
  getAnalyticsData
};
