window.addEventListener('app:loadDashboard', async () => {
  try {
    const data = await window.api.getDashboard();
    renderDashboard(data);
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  }
});

function renderDashboard(data) {
  const { ga, supabase } = data;

  // 1. Update Top Stats
  document.getElementById('stat-users').textContent = ga.error ? 'Error' : (ga.users || 0).toLocaleString();
  document.getElementById('stat-sessions').textContent = ga.error ? 'Error' : (ga.sessions || 0).toLocaleString();
  
  const totalEvents = supabase.error ? 'Error' : (supabase.raw ? supabase.raw.length : 0);
  document.getElementById('stat-events').textContent = totalEvents.toLocaleString();

  // 2. Render GA Charts
  if (!ga.error) {
    // Line Chart: Daily Activity
    const dates = Object.keys(ga.daily || {}).sort();
    const dailyUsers = dates.map(date => ga.daily[date].users);
    
    // Format dates to be more readable (e.g. YYYYMMDD -> MMM DD) if needed, 
    // assuming GA returns YYYYMMDD string
    const formattedDates = dates.map(d => {
      if (d.length === 8) {
        return `${d.substring(4, 6)}/${d.substring(6, 8)}`;
      }
      return d;
    });

    window.dashboardCharts.initLineChart('lineChart', formattedDates, dailyUsers);

    // Pie Chart: Devices
    const devices = Object.keys(ga.devices || {});
    const deviceCounts = devices.map(d => ga.devices[d]);
    window.dashboardCharts.initPieChart('pieChart', devices, deviceCounts);

    // Location Chart: Countries
    const countries = Object.keys(ga.countries || {});
    // Sort by user count descending and take top 10
    countries.sort((a, b) => ga.countries[b] - ga.countries[a]);
    const topCountries = countries.slice(0, 10);
    const countryCounts = topCountries.map(c => ga.countries[c]);
    window.dashboardCharts.initLocationChart('locationChart', topCountries, countryCounts);
  }

  // 3. Render Supabase Charts & Table
  if (!supabase.error) {
    // Bar Chart: Events count
    const events = Object.keys(supabase.byEvent || {});
    // Sort by count descending
    events.sort((a, b) => supabase.byEvent[b] - supabase.byEvent[a]);
    // Take top 5
    const topEvents = events.slice(0, 5);
    const eventCounts = topEvents.map(e => supabase.byEvent[e]);
    
    window.dashboardCharts.initBarChart('barChart', topEvents, eventCounts);

    // Populate Events Table
    const tbody = document.getElementById('events-tbody');
    tbody.innerHTML = ''; // Clear existing
    
    const recentEvents = (supabase.raw || []).slice(0, 20); // Show last 20

    recentEvents.forEach(event => {
      const tr = document.createElement('tr');
      const date = new Date(event.created_at).toLocaleString();
      
      tr.innerHTML = `
        <td>${event.event_name || '-'}</td>
        <td>${event.page || '-'}</td>
        <td>${event.device || '-'}</td>
        <td>${event.time_on_page || '0'}</td>
        <td>${date}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}
