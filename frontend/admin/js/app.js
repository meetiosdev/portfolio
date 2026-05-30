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
  
  if (!supabase || supabase.error) {
    console.warn('Supabase event streams are currently disabled.');
    if (statusBadge) {
      statusBadge.textContent = 'Supabase Offline';
      statusBadge.className = 'status-badge error';
    }
    const tbody = document.getElementById('events-tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No live database connection. Displaying local client events.</td></tr>';
    }
  } else {
    if (statusBadge) {
      statusBadge.textContent = 'Supabase Active';
      statusBadge.className = 'status-badge success';
    }

    const tbody = document.getElementById('events-tbody');
    if (tbody) {
      tbody.innerHTML = '';
      const recentEvents = (supabase.raw || []).slice(0, 15);
      
      if (recentEvents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Database connected. No user click events stored yet.</td></tr>';
      } else {
        recentEvents.forEach(event => {
          const tr = document.createElement('tr');
          const time = new Date(event.created_at).toLocaleString();
          
          let eventNameContent = `<span class="badge">${event.event_name || '-'}</span>`;
          if (event.event_name === 'user_message' && event.referrer) {
            try {
              const msgData = JSON.parse(event.referrer);
              let metaString = '';
              if (msgData.os || msgData.browser) {
                metaString = `
                  <div style="font-size: 0.72rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.06); margin-top: 6px; padding-top: 4px; display: flex; gap: 6px; align-items: center; opacity: 0.8;">
                    <span>💻 ${msgData.os || ''}</span>
                    <span>•</span>
                    <span>🌐 ${msgData.browser || ''}</span>
                  </div>
                `;
              }
              eventNameContent = `
                <div style="display: flex; flex-direction: column; gap: 4px; text-align: left;">
                  <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #10b981; align-self: flex-start;">user_message</span>
                  <div style="font-size: 0.8rem; background: rgba(255, 255, 255, 0.03); border-left: 2px solid #10b981; padding: 6px 10px; border-radius: 4px; color: var(--text-secondary); margin-top: 4px; max-width: 320px; line-height: 1.4; white-space: normal; word-break: break-word;">
                    <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">${msgData.name} &lt;${msgData.email}&gt;</div>
                    <div style="font-style: italic; opacity: 0.9;">"${msgData.message}"</div>
                    ${metaString}
                  </div>
                </div>
              `;
            } catch (e) {
              eventNameContent = `<span class="badge">${event.event_name || '-'}</span>`;
            }
          }

          tr.innerHTML = `
            <td>${eventNameContent}</td>
            <td><code>${event.page || '-'}</code></td>
            <td>${event.device || '-'}</td>
            <td>${event.time_on_page || '0'}s</td>
            <td>${time}</td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
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
