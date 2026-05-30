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



  // Bind close timeline modal handlers
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const journeyModal = document.getElementById('journey-modal');

  const closeModal = function () {
    if (journeyModal) {
      journeyModal.classList.add('hidden');
    }
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
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
      uniqueSessions: uniqueSessions.size,
      errorsLogged: events.filter(function (event) {
        return event.event_name === 'error';
      }).length
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
    tableBody.innerHTML = '<tr><td colspan="7">No matching events.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows.map(function (event) {
    const isError = event.event_name === 'error';
    const rowClass = isError ? 'class="table-row-error"' : '';
    const pillClass = isError ? 'event-pill event-pill-error' : 'event-pill';

    return [
      '<tr ' + rowClass + '>',
      '<td><span class="' + pillClass + '">' + escapeHtml(event.event_name || 'unknown') + '</span></td>',
      '<td>' + escapeHtml(event.page || '/') + '</td>',
      '<td>' + escapeHtml(event.device || 'unknown') + '</td>',
      '<td>' + escapeHtml(event.browser || 'unknown') + '</td>',
      '<td>' + escapeHtml(shortSession(event.session_id)) + '</td>',
      '<td>' + escapeHtml(formatDateTime(event.created_at)) + '</td>',
      '<td><button type="button" class="journey-action-btn" data-session="' + escapeHtml(event.session_id) + '">View Journey</button></td>',
      '</tr>'
    ].join('');
  }).join('');

  // Bind click handlers to "View Journey" buttons
  tableBody.querySelectorAll('.journey-action-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const sessionId = btn.getAttribute('data-session');
      viewJourney(sessionId);
    });
  });
}

function viewJourney(sessionId) {
  if (!sessionId) return;

  // Filter all events belonging to this session
  const sessionEvents = allEvents.filter(function (event) {
    return event.session_id === sessionId;
  });

  if (sessionEvents.length === 0) return;

  // Sort events chronologically (ascending)
  sessionEvents.sort(function (a, b) {
    return new Date(a.created_at) - new Date(b.created_at);
  });

  const firstEvent = sessionEvents[0];
  
  // Set modal summary header information
  document.getElementById('journey-device').textContent = firstEvent.device || 'unknown';
  document.getElementById('journey-browser').textContent = firstEvent.browser || 'unknown';
  document.getElementById('journey-steps').textContent = sessionEvents.length;
  document.getElementById('journey-session-id').textContent = sessionId;

  const timelineContainer = document.getElementById('journey-timeline');
  timelineContainer.innerHTML = '';

  let lastTime = null;

  sessionEvents.forEach(function (event, index) {
    const itemEl = document.createElement('div');
    itemEl.className = 'timeline-item';
    if (event.event_name === 'error') {
      itemEl.classList.add('timeline-item-error');
    }

    const eventName = event.event_name || 'unknown';
    const currentTime = new Date(event.created_at);
    
    // Calculate elapsed time since previous action
    let offsetHtml = '';
    if (lastTime) {
      const diffMs = currentTime - lastTime;
      const diffSec = Math.round(diffMs / 1000);
      if (diffSec < 60) {
        offsetHtml = '<span class="timeline-offset">+' + diffSec + 's</span>';
      } else {
        const diffMin = Math.floor(diffSec / 60);
        const remSec = diffSec % 60;
        offsetHtml = '<span class="timeline-offset">+' + diffMin + 'm ' + remSec + 's</span>';
      }
    } else {
      offsetHtml = '<span class="timeline-offset">Start</span>';
    }
    lastTime = currentTime;

    // Badge styling and display description based on event type
    let badgeClass = 'timeline-badge-view';
    let descHtml = '';
    let extraHtml = '';

    if (eventName === 'error') {
      badgeClass = 'timeline-badge-error';
      
      // Parse error details stored in referrer
      let errorMsg = 'Unknown Runtime Error';
      let errorLoc = '';
      let errorStack = '';
      
      try {
        const parsed = JSON.parse(event.referrer);
        errorMsg = parsed.message || errorMsg;
        errorLoc = parsed.filename ? parsed.filename + ':' + parsed.lineno + ':' + parsed.colno : '';
        errorStack = parsed.stack || '';
      } catch (e) {
        // Fallback to raw referrer if not valid JSON
        errorMsg = event.referrer || 'Unknown Error';
      }

      descHtml = 'Crashed with JavaScript Error:';
      
      const toggleId = 'stack-toggle-' + index;
      const preId = 'stack-pre-' + index;

      extraHtml = [
        '<div class="timeline-error-card">',
        '  <h4 class="timeline-error-title">' + escapeHtml(errorMsg) + '</h4>',
        errorLoc ? '  <p class="timeline-error-loc">Source: ' + escapeHtml(errorLoc) + '</p>' : '',
        errorStack ? [
          '  <button type="button" id="' + toggleId + '" class="timeline-error-stack-toggle">Show Stack Trace</button>',
          '  <pre id="' + preId + '" class="error-stack-pre">' + escapeHtml(errorStack) + '</pre>'
        ].join('') : '',
        '</div>'
      ].join('');

    } else if (eventName === 'page_view') {
      badgeClass = 'timeline-badge-view';
      descHtml = 'Visited page <code>' + escapeHtml(event.page || '/') + '</code>';
    } else if (eventName === 'page_exit') {
      badgeClass = 'timeline-badge-exit';
      descHtml = 'Left page <code>' + escapeHtml(event.page || '/') + '</code> (Active for ' + (event.time_on_page || 0) + 's)';
    } else if (eventName.includes('_click')) {
      badgeClass = 'timeline-badge-click';
      descHtml = 'Clicked on element: <code>' + escapeHtml(eventName) + '</code>';
    } else {
      badgeClass = 'timeline-badge-view';
      descHtml = 'Triggered event: <code>' + escapeHtml(eventName) + '</code>';
    }

    itemEl.innerHTML = [
      '<div class="timeline-badge ' + badgeClass + '"></div>',
      '<div class="timeline-content">',
      '  <div class="timeline-meta">',
      '    <span class="timeline-time">' + escapeHtml(formatDateTime(event.created_at)) + '</span>',
      '    ' + offsetHtml,
      '  </div>',
      '  <p class="timeline-desc">' + descHtml + '</p>',
      '  ' + extraHtml,
      '</div>'
    ].join('');

    timelineContainer.appendChild(itemEl);

    // Bind stack trace toggle click listener if it exists
    if (eventName === 'error') {
      setTimeout(function () {
        const toggleBtn = document.getElementById('stack-toggle-' + index);
        const preEl = document.getElementById('stack-pre-' + index);
        if (toggleBtn && preEl) {
          toggleBtn.addEventListener('click', function () {
            const isOpen = preEl.classList.toggle('open');
            toggleBtn.textContent = isOpen ? 'Hide Stack Trace' : 'Show Stack Trace';
          });
        }
      }, 50);
    }
  });

  // Display the modal
  const modal = document.getElementById('journey-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
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
