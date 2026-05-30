// Register background revalidation events
window.addEventListener('app:loadDashboard', async () => {
  await loadDashboardWithSWR();
});

// Refresh button handler
document.getElementById('refresh-btn')?.addEventListener('click', async () => {
  const refreshBtn = document.getElementById('refresh-btn');
  const originalText = refreshBtn.innerHTML;
  refreshBtn.disabled = true;
  refreshBtn.innerHTML = '<span class="icon animate-spin">↻</span> Syncing...';
  try {
    await fetchFreshDashboard();
  } catch (error) {
    console.error('Manual dashboard sync failed:', error);
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.innerHTML = originalText;
  }
});

/**
 * Executes the Stale-While-Revalidate (SWR) cache flow
 */
async function loadDashboardWithSWR() {
  // 1. Immediately read from localStorage cache
  const cachedData = window.api.getCachedDashboard();
  if (cachedData) {
    console.log('SWR: Immediate layout mounting from localStorage cache.');
    renderDashboard(cachedData);
  } else {
    // If no cache exists, trigger placeholder visual skeleton lines
    toggleSkeletons(true);
  }

  // 2. Silently trigger background fetch to populate fresh credentials
  await fetchFreshDashboard();
}

/**
 * Queries the REST backend, caches the response, and re-renders the dashboard
 */
async function fetchFreshDashboard() {
  try {
    const freshData = await window.api.getDashboard();
    
    // Store in localStorage Cache
    window.api.setCachedDashboard(freshData);
    
    console.log('SWR: Metrics updated from REST backend. Seamlessly re-rendering charts.');
    renderDashboard(freshData);
  } catch (error) {
    console.error('Failed to sync metrics from GA4 Gateway:', error);
    // If there is no cache and the API failed, show connection error
    if (!window.api.getCachedDashboard()) {
      alert('Failed to connect to Analytics Gateway. Check environment configurations.');
    }
  } finally {
    toggleSkeletons(false);
  }
}

/**
 * Toggles shimmer animation masks on loading stats
 */
function toggleSkeletons(show) {
  const kpis = ['stat-users', 'stat-sessions', 'stat-engagement', 'stat-conversions'];
  kpis.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (show) {
        el.classList.add('skeleton');
        el.textContent = '----';
      } else {
        el.classList.remove('skeleton');
      }
    }
  });
}

/**
 * Main dashboard renderer
 */
function renderDashboard(data) {
  const { ga, supabase } = data;

  if (!ga || ga.error) {
    console.error('GA4 analytics query encountered an issue:', ga?.error);
    return;
  }

  // ==========================================
  // 1. UPDATE 4 KPI BOX CARDS (With Sparklines & MoM Trends)
  // ==========================================
  
  // KPI 1: Active Users
  updateKPICard({
    metricId: 'stat-users',
    trendId: 'trend-users',
    sparklineId: 'sparkline-users',
    currentVal: ga.metrics.users.current,
    changeVal: ga.metrics.users.change,
    sparklineData: Object.keys(ga.daily || {}).sort().slice(-7).map(d => ga.daily[d].users)
  });

  // KPI 2: Sessions
  updateKPICard({
    metricId: 'stat-sessions',
    trendId: 'trend-sessions',
    sparklineId: 'sparkline-sessions',
    currentVal: ga.metrics.sessions.current,
    changeVal: ga.metrics.sessions.change,
    sparklineData: Object.keys(ga.daily || {}).sort().slice(-7).map(d => ga.daily[d].sessions)
  });

  // KPI 3: Engagement Rate
  updateKPICard({
    metricId: 'stat-engagement',
    trendId: 'trend-engagement',
    sparklineId: 'sparkline-engagement',
    currentVal: ga.metrics.engagementRate.current,
    changeVal: ga.metrics.engagementRate.change,
    isPercentage: true,
    sparklineData: [62, 64, 63, 65, 64, 66, ga.metrics.engagementRate.current] // mock trend for rate
  });

  // KPI 4: Conversions
  updateKPICard({
    metricId: 'stat-conversions',
    trendId: 'trend-conversions',
    sparklineId: 'sparkline-conversions',
    currentVal: ga.metrics.conversions.current,
    changeVal: ga.metrics.conversions.change,
    sparklineData: [4, 6, 8, 5, 7, 9, ga.metrics.conversions.current] // mock trend for conversions
  });

  // ==========================================
  // 2. RENDER CHARTS & ADVANCED BENTO WIDGETS
  // ==========================================

  // Scatter Chart: Page Speed / Load Time vs Bounce Rate
  if (ga.uxFriction && ga.uxFriction.length > 0) {
    window.dashboardCharts.initScatterChart('frictionChart', ga.uxFriction);
  }

  // Cohort User Retention Rows
  if (ga.retention) {
    ga.retention.forEach((val, idx) => {
      const bar = document.getElementById(`cohort-w${idx + 1}`);
      const text = document.getElementById(`cohort-val-w${idx + 1}`);
      if (bar) bar.style.width = `${val}%`;
      if (text) text.textContent = `${val}%`;
    });
  }

  // Conversion Funnel Chart
  if (ga.funnel) {
    window.dashboardCharts.initFunnelChart('funnelChart', ga.funnel);
  }

  // High-Converting Hot Paths Traversal Routes list
  const hotPathsList = document.getElementById('hot-paths-list');
  if (hotPathsList && ga.hotPaths) {
    hotPathsList.innerHTML = ga.hotPaths.map(item => `
      <div class="hot-path-item">
        <div class="path-route-group">
          <span class="path-route">${item.path}</span>
          <span class="trend-badge ${item.trend === 'up' ? 'positive' : item.trend === 'down' ? 'negative' : ''}">
            ${item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
          </span>
        </div>
        <div class="path-metric-group">
          <span>Conversion Ratio</span>
          <span class="path-cr">${item.conversionRate}%</span>
        </div>
      </div>
    `).join('');
  }

  // Device breakdown split doughnut
  if (ga.devices) {
    const labels = Object.keys(ga.devices);
    const dataPoints = labels.map(l => ga.devices[l]);
    window.dashboardCharts.initDeviceChart('deviceChart', labels, dataPoints);
  }

  // ==========================================
  // 3. POPULATE SUPABASE EVENT LOGS
  // ==========================================
  const statusBadge = document.getElementById('connection-status');
  
  // Save events globally for user journey query tracer
  window.allEvents = (supabase && supabase.raw) ? supabase.raw : [];
  
  if (!supabase || supabase.error) {
    console.warn('Supabase event streams are currently disabled.');
    if (statusBadge) {
      statusBadge.textContent = 'Supabase Offline';
      statusBadge.className = 'status-badge error';
    }
    const tbody = document.getElementById('events-tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No live database connection. Displaying local client events.</td></tr>';
    }
  } else {
    if (statusBadge) {
      statusBadge.textContent = 'Supabase Active';
      statusBadge.className = 'status-badge success';
    }

    populateEventsTable(window.allEvents);
  }
}

/**
 * Updates a single KPI card elements
 */
function updateKPICard({ metricId, trendId, sparklineId, currentVal, changeVal, isPercentage = false, sparklineData }) {
  const metricEl = document.getElementById(metricId);
  const trendEl = document.getElementById(trendId);
  
  if (metricEl) {
    metricEl.textContent = isPercentage ? `${currentVal}%` : currentVal.toLocaleString();
  }

  if (trendEl) {
    const isPositive = changeVal >= 0;
    trendEl.className = `trend-badge ${isPositive ? 'positive' : 'negative'}`;
    trendEl.textContent = `${isPositive ? '↑' : '↓'} ${Math.abs(changeVal)}%`;
  }

  if (sparklineId && sparklineData) {
    window.dashboardCharts.initSparkline(sparklineId, sparklineData, changeVal >= 0);
  }
}

// Helpers and user journey tracing logic for error visualization
function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

function populateEventsTable(events) {
  const tbody = document.getElementById('events-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  let displayEvents = events;
  if (window.errorsFilterActive) {
    displayEvents = events.filter(e => e.event_name === 'error');
  }

  const recentEvents = displayEvents.slice(0, 15);
  
  if (recentEvents.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No user events to display.</td></tr>';
    return;
  }

  recentEvents.forEach(event => {
    const tr = document.createElement('tr');
    const isError = event.event_name === 'error';
    if (isError) {
      tr.className = 'table-row-error';
    }
    const pillClass = isError ? 'badge event-pill-error' : 'badge';
    const time = new Date(event.created_at).toLocaleString();
    tr.innerHTML = `
      <td><span class="${pillClass}">${escapeHtml(event.event_name || '-')}</span></td>
      <td><code>${escapeHtml(event.page || '-')}</code></td>
      <td>${escapeHtml(event.device || '-')}</td>
      <td>${escapeHtml(event.time_on_page || '0')}s</td>
      <td>${escapeHtml(time)}</td>
      <td><button type="button" class="journey-action-btn" data-session="${escapeHtml(event.session_id)}">View Journey</button></td>
    `;
    tbody.appendChild(tr);
  });

  // Bind click handlers to View Journey buttons
  tbody.querySelectorAll('.journey-action-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const sessionId = btn.getAttribute('data-session');
      viewJourney(sessionId);
    });
  });
}

function viewJourney(sessionId) {
  if (!sessionId) return;

  // Filter all events belonging to this session
  const sessionEvents = window.allEvents.filter(function (event) {
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
        offsetHtml = `<span class="timeline-offset">+${diffSec}s</span>`;
      } else {
        const diffMin = Math.floor(diffSec / 60);
        const remSec = diffSec % 60;
        offsetHtml = `<span class="timeline-offset">+${diffMin}m ${remSec}s</span>`;
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

      extraHtml = `
        <div class="timeline-error-card">
          <h4 class="timeline-error-title">${escapeHtml(errorMsg)}</h4>
          ${errorLoc ? `<p class="timeline-error-loc">Source: ${escapeHtml(errorLoc)}</p>` : ''}
          ${errorStack ? `
            <button type="button" id="${toggleId}" class="timeline-error-stack-toggle">Show Stack Trace</button>
            <pre id="${preId}" class="error-stack-pre">${escapeHtml(errorStack)}</pre>
          ` : ''}
        </div>
      `;

    } else if (eventName === 'page_view') {
      badgeClass = 'timeline-badge-view';
      descHtml = `Visited page <code>${escapeHtml(event.page || '/')}</code>`;
    } else if (eventName === 'page_exit') {
      badgeClass = 'timeline-badge-exit';
      descHtml = `Left page <code>${escapeHtml(event.page || '/')}</code> (Active for ${event.time_on_page || 0}s)`;
    } else if (eventName.includes('_click')) {
      badgeClass = 'timeline-badge-click';
      descHtml = `Clicked on element: <code>${escapeHtml(eventName)}</code>`;
    } else {
      badgeClass = 'timeline-badge-view';
      descHtml = `Triggered event: <code>${escapeHtml(eventName)}</code>`;
    }

    itemEl.innerHTML = `
      <div class="timeline-badge ${badgeClass}"></div>
      <div class="timeline-content">
        <div class="timeline-meta">
          <span class="timeline-time">${escapeHtml(formatDateTime(event.created_at))}</span>
          ${offsetHtml}
        </div>
        <p class="timeline-desc">${descHtml}</p>
        ${extraHtml}
      </div>
    `;

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

// Bind modal close listeners on init
document.addEventListener('DOMContentLoaded', function () {
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
});
