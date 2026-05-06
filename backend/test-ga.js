require('dotenv').config();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

async function testGA() {
  console.log('Testing Google Analytics Connection...\n');
  
  const propertyId = process.env.GA_PROPERTY_ID;
  if (!propertyId || propertyId === 'YOUR_PROPERTY_ID_HERE') {
    console.error('❌ Error: GA_PROPERTY_ID is missing in your .env file!');
    console.log('Please find your Property ID in Google Analytics (Admin > Property Details) and add it to the .env file.');
    return;
  }

  console.log(`Using Property ID: ${propertyId}`);
  console.log(`Using Credentials File: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient();
    
    console.log('\nFetching Active Users for the last 7 days...');
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    });

    console.log('\n✅ Connection Successful!');
    if (response.rows && response.rows.length > 0) {
      response.rows.forEach(row => {
        console.log(`Total Active Users (Last 7 Days): ${row.metricValues[0].value}`);
      });
    } else {
      console.log('Data fetched successfully, but there are 0 active users in the last 7 days.');
    }
    
    console.log('\nYour service account and API are perfectly configured. Your admin panel dashboard will now show live data!');
  } catch (error) {
    console.error('\n❌ Connection Failed!');
    console.error('Error Details:', error.message);
    if (error.message.includes('Permission denied') || error.message.includes('User does not have sufficient permissions')) {
      console.log('\nTroubleshooting:');
      console.log('1. Ensure you added analytics-dashboard@euphoric-effect-304417.iam.gserviceaccount.com as a Viewer in the Google Analytics Property Access Management.');
      console.log('2. Ensure you copied the correct Property ID.');
      console.log('3. Ensure the Google Analytics Data API is enabled in your Google Cloud Console.');
    }
  }
}

testGA();
