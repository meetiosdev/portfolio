const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Swaraj@123';
const AUTH_KEY = 'portfolio_admin_authenticated';
const SUPABASE_URL = 'https://liffowvslpcykrktlved.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YThhUQos4gfieXCElzggWA_ufrtqW7Y';
const EVENTS_ENDPOINT = SUPABASE_URL + '/rest/v1/events?select=*&order=created_at.desc&limit=1000';

let allEvents = [];
let processedData = null;
let charts = {};
let currentRange = '7';
let currentSearch = '';

function init() {
  bindStaticHandlers();
  checkAuth();
}

function bindStaticHandlers() {
  const loginForm = document.getElementById('login-form');
  const logoutButton = document.getElementById('logout-button');
  const searchInput = document.getElementById('table-search');

  if (loginForm) {
    loginForm.addEventListener('submit', loginHandler);
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', logoutHandler);
  }

  document.querySelectorAll('.range-button').forEach(function (button) {
    button.addEventListener('click', function () {
      currentRange = button.dataset.range || '7';
      document.querySelectorAll('.range-button').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      updateDashboard();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentSearch = searchInput.value.trim().toLowerCase();
      renderTable(filterEvents(allEvents));
    });
  }
}

function checkAuth() {
  const isAuthenticated = localStorage.getItem(AUTH_KEY) === 'true';
  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');

  if (isAuthenticated) {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    loadDashboard();
    return true;
  }

  loginScreen.classList.remove('hidden');
  dashboardScreen.classList.add('hidden');
  return false;
}

function loginHandler(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, 'true');
    errorEl.textContent = '';
    checkAuth();
    return;
  }

  errorEl.textContent = 'Incorrect username or password.';
}

function logoutHandler() {
  localStorage.removeItem(AUTH_KEY);
  allEvents = [];
  processedData = null;
  destroyCharts();
  checkAuth();
}

async function loadDashboard() {
  showState('loading');

  const events = await fetchEvents();
  allEvents = Array.isArray(events) ? events : [];

  if (!events) {
    showState('error');
    return;
  }

  if (allEvents.length === 0) {
    showState('empty');
    return;
  }

  updateDashboard();
  showState('content');
}

async function fetchEvents() {
  try {
    const response = await fetch(EVENTS_ENDPOINT, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  }
}

function processData(events) {
  const eventCounts = {};
  const dailyActivity = {};
  const deviceBreakdown = {};
  const topPages = {};
  const uniqueSessions = new Set();

  events.forEach(function (event) {
    const eventName = event.event_name || 'unknown';
    const page = event.page || '/';
    const device = event.device || 'unknown';
    const sessionId = event.session_id || '';
    const date = formatDateKey(event.created_at);

    eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;
    dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;
    topPages[page] = (topPages[page] || 0) + 1;

    if (sessionId) {
      uniqueSessions.add(sessionId);
    }
  });

  return {
    eventCounts,
    dailyActivity,
    deviceBreakdown,
    topPages,
    metrics: {
      totalEvents: events.length,
      pageViews: events.filter(function (event) {
        return event.event_name === 'page_view';
      }).length,
      clickEvents: events.filter(function (event) {
        return String(event.event_name || '').includes('_click');
      }).length,
      uniqueSessions: uniqueSessions.size
    }
  };
}

function renderStats(data) {
  document.getElementById('stat-total').textContent = formatNumber(data.metrics.totalEvents);
  document.getElementById('stat-page-views').textContent = formatNumber(data.metrics.pageViews);
  document.getElementById('stat-clicks').textContent = formatNumber(data.metrics.clickEvents);
  document.getElementById('stat-sessions').textContent = formatNumber(data.metrics.uniqueSessions);
}

function renderCharts(data) {
  if (!window.Chart) return;

  const eventEntries = sortEntries(data.eventCounts).slice(0, 8);
  const dailyEntries = Object.entries(data.dailyActivity).sort(function (a, b) {
    return a[0].localeCompare(b[0]);
  });
  const deviceEntries = sortEntries(data.deviceBreakdown);

  destroyCharts();

  charts.events = new Chart(document.getElementById('event-chart'), {
    type: 'bar',
    data: {
      labels: eventEntries.map(function (entry) { return entry[0]; }),
      datasets: [{
        label: 'Events',
        data: eventEntries.map(function (entry) { return entry[1]; }),
        backgroundColor: 'rgba(104, 167, 255, 0.72)',
        borderColor: 'rgba(104, 167, 255, 1)',
        borderWidth: 1,
        borderRadius: 10
      }]
    },
    options: chartOptions('bar')
  });

  charts.daily = new Chart(document.getElementById('daily-chart'), {
    type: 'line',
    data: {
      labels: dailyEntries.map(function (entry) { return entry[0]; }),
      datasets: [{
        label: 'Events',
        data: dailyEntries.map(function (entry) { return entry[1]; }),
        borderColor: 'rgba(123, 227, 178, 1)',
        backgroundColor: 'rgba(123, 227, 178, 0.14)',
        fill: true,
        tension: 0.38,
        pointRadius: 3,
        pointHoverRadius: 5
      }]
    },
    options: chartOptions('line')
  });

  charts.devices = new Chart(document.getElementById('device-chart'), {
    type: 'pie',
    data: {
      labels: deviceEntries.map(function (entry) { return entry[0]; }),
      datasets: [{
        data: deviceEntries.map(function (entry) { return entry[1]; }),
        backgroundColor: [
          'rgba(104, 167, 255, 0.82)',
          'rgba(123, 227, 178, 0.82)',
          'rgba(184, 167, 255, 0.82)',
          'rgba(255, 159, 181, 0.82)'
        ],
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1
      }]
    },
    options: chartOptions('pie')
  });
}

function renderTable(events) {
  const tableBody = document.getElementById('events-table');
  const rows = events.slice(0, 20);

  if (rows.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No matching events.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows.map(function (event) {
    return [
      '<tr>',
      '<td><span class="event-pill">' + escapeHtml(event.event_name || 'unknown') + '</span></td>',
      '<td>' + escapeHtml(event.page || '/') + '</td>',
      '<td>' + escapeHtml(event.device || 'unknown') + '</td>',
      '<td>' + escapeHtml(event.browser || 'unknown') + '</td>',
      '<td>' + escapeHtml(shortSession(event.session_id)) + '</td>',
      '<td>' + escapeHtml(formatDateTime(event.created_at)) + '</td>',
      '</tr>'
    ].join('');
  }).join('');
}

function updateDashboard() {
  const filteredEvents = filterEvents(allEvents);
  processedData = processData(filteredEvents);

  if (filteredEvents.length === 0) {
    showState('empty');
    return;
  }

  renderStats(processedData);
  renderCharts(processedData);
  renderTable(filteredEvents);
  showState('content');
}

function filterEvents(events) {
  const rangeFiltered = events.filter(function (event) {
    if (currentRange === 'all') return true;
    const createdAt = event.created_at ? new Date(event.created_at) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(currentRange));
    return createdAt >= cutoff;
  });

  if (!currentSearch) {
    return rangeFiltered;
  }

  return rangeFiltered.filter(function (event) {
    return [
      event.event_name,
      event.page,
      event.device,
      event.browser,
      event.referrer,
      event.session_id
    ].join(' ').toLowerCase().includes(currentSearch);
  });
}

function chartOptions(type) {
  const isPie = type === 'pie';

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 720,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        display: isPie,
        labels: {
          color: '#c9d2e3',
          boxWidth: 12,
          padding: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 14, 24, 0.92)',
        borderColor: 'rgba(255, 255, 255, 0.12)',
        borderWidth: 1,
        titleColor: '#f5f7fb',
        bodyColor: '#c9d2e3',
        padding: 12
      }
    },
    scales: isPie ? {} : {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#9ca7bb',
          maxRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.07)'
        },
        ticks: {
          color: '#9ca7bb',
          precision: 0
        }
      }
    }
  };
}

function showState(state) {
  const loading = document.getElementById('loading-state');
  const error = document.getElementById('error-state');
  const empty = document.getElementById('empty-state');
  const content = document.getElementById('dashboard-content');

  loading.classList.toggle('hidden', state !== 'loading');
  error.classList.toggle('hidden', state !== 'error');
  empty.classList.toggle('hidden', state !== 'empty');
  content.classList.toggle('hidden', state !== 'content');
}

function destroyCharts() {
  Object.keys(charts).forEach(function (key) {
    if (charts[key]) {
      charts[key].destroy();
    }
  });
  charts = {};
}

function sortEntries(group) {
  return Object.entries(group).sort(function (a, b) {
    return b[1] - a[1];
  });
}

function formatDateKey(value) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function shortSession(value) {
  if (!value) return 'unknown';
  return value.length > 12 ? value.slice(0, 12) + '...' : value;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', init);
