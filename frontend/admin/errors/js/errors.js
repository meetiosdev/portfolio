(function () {
  // 1. Enforce SaaS Admin auth security check
  if (!localStorage.getItem('saas_token')) {
    window.location.href = '../index.html';
    return;
  }

  document.addEventListener('DOMContentLoaded', async function () {
    await initErrorsDashboard();
  });

  async function initErrorsDashboard() {
    try {
      const dashboardData = await window.api.getDashboard();
      
      const rawEvents = (dashboardData && dashboardData.supabase && dashboardData.supabase.raw) 
        ? dashboardData.supabase.raw 
        : [];
      
      renderErrors(rawEvents);
    } catch (e) {
      console.error('Failed to load error logs:', e);
      document.getElementById('errors-container').innerHTML = `
        <div class="empty-state glass-card">
          <h2>Failed to load analytics</h2>
          <p>The backend event gateway is temporarily unavailable. Check your environment settings and try again.</p>
        </div>
      `;
    } finally {
      // Hide loading animation overlay
      document.getElementById('loading-overlay')?.classList.add('hidden');
    }
  }

  function renderErrors(events) {
    const container = document.getElementById('errors-container');
    const emptyState = document.getElementById('empty-state');
    
    if (!container) return;

    // Filter events to only 'error' logs
    const errorEvents = events.filter(function (e) {
      return e.event_name === 'error';
    });

    // Sort errors newest first
    errorEvents.sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    if (errorEvents.length === 0) {
      emptyState?.classList.remove('hidden');
      container.innerHTML = '';
      return;
    }

    emptyState?.classList.add('hidden');
    container.innerHTML = '';

    errorEvents.forEach(function (errorEvent, idx) {
      // Parse error JSON details from referrer
      let errorMsg = 'Unknown Runtime Error';
      let errorLoc = '';
      let errorStack = '';
      
      try {
        const parsed = JSON.parse(errorEvent.referrer);
        errorMsg = parsed.message || errorMsg;
        errorLoc = parsed.filename ? parsed.filename + ':' + parsed.lineno + ':' + parsed.colno : '';
        errorStack = parsed.stack || '';
      } catch (e) {
        errorMsg = errorEvent.referrer || 'Unknown Error';
      }

      // Group chronological events matching this user's session
      const sessionEvents = events.filter(function (e) {
        return e.session_id === errorEvent.session_id;
      });

      // Sort session events chronologically (ascending)
      sessionEvents.sort(function (a, b) {
        return new Date(a.created_at) - new Date(b.created_at);
      });

      // Assemble timeline timeline step HTML elements
      let lastTime = null;
      const timelineHtml = sessionEvents.map(function (step, stepIdx) {
        const stepName = step.event_name || 'unknown';
        const currentTime = new Date(step.created_at);
        const isCurrentError = step.created_at === errorEvent.created_at && stepName === 'error';

        // Calculate offset since previous step
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

        let badgeClass = 'timeline-badge-view';
        let descHtml = '';

        if (stepName === 'error') {
          badgeClass = 'timeline-badge-error';
          descHtml = `<span style="color: var(--rose-danger); font-weight: 700;">Crashed!</span> JavaScript runtime exception.`;
        } else if (stepName === 'page_view') {
          badgeClass = 'timeline-badge-view';
          descHtml = `Visited page <code>${escapeHtml(step.page || '/')}</code>`;
        } else if (stepName === 'page_exit') {
          badgeClass = 'timeline-badge-exit';
          descHtml = `Left page <code>${escapeHtml(step.page || '/')}</code> (Active for ${step.time_on_page || 0}s)`;
        } else if (stepName.includes('_click')) {
          badgeClass = 'timeline-badge-click';
          descHtml = `Clicked button: <code>${escapeHtml(stepName)}</code>`;
        } else {
          badgeClass = 'timeline-badge-view';
          descHtml = `Triggered event: <code>${escapeHtml(stepName)}</code>`;
        }

        return `
          <div class="timeline-item ${isCurrentError ? 'timeline-item-error' : ''}">
            <div class="timeline-badge ${badgeClass}"></div>
            <div class="timeline-content">
              <div class="timeline-meta">
                <span class="timeline-time">${formatDateTime(step.created_at)}</span>
                ${offsetHtml}
              </div>
              <p class="timeline-desc">${descHtml}</p>
            </div>
          </div>
        `;
      }).join('');

      const card = document.createElement('article');
      card.className = 'error-card-bento';
      
      const toggleId = 'trace-toggle-' + idx;
      const preId = 'trace-pre-' + idx;

      card.innerHTML = `
        <div class="error-card-header">
          <span class="error-badge-pill">
            <span>⚠️</span> JS Exception
          </span>
          <div class="error-meta-group">
            <span><strong>Device:</strong> ${escapeHtml(errorEvent.device || 'unknown')}</span>
            <span><strong>Browser:</strong> ${escapeHtml(errorEvent.browser || 'unknown')}</span>
            <span><strong>Time:</strong> ${formatDateTime(errorEvent.created_at)}</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <h3 class="error-reason-title">${escapeHtml(errorMsg)}</h3>
          ${errorLoc ? `<p class="error-source-loc">Location: ${escapeHtml(errorLoc)}</p>` : ''}
        </div>

        ${errorStack ? `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button type="button" id="${toggleId}" class="timeline-error-stack-toggle">Show Stack Trace</button>
            <pre id="${preId}" class="error-stack-pre">${escapeHtml(errorStack)}</pre>
          </div>
        ` : ''}

        <div class="timeline-journey-box">
          <div class="timeline-title-bar">Triggering User Journey Timeline</div>
          <div class="journey-timeline">
            ${timelineHtml}
          </div>
        </div>
      `;

      container.appendChild(card);

      // Bind collapsible stack trace toggle action
      if (errorStack) {
        setTimeout(function () {
          const toggleBtn = document.getElementById(toggleId);
          const preEl = document.getElementById(preId);
          if (toggleBtn && preEl) {
            toggleBtn.addEventListener('click', function () {
              const isOpen = preEl.classList.toggle('open');
              toggleBtn.textContent = isOpen ? 'Hide Stack Trace' : 'Show Stack Trace';
            });
          }
        }, 50);
      }
    });
  }

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
      minute: '2-digit',
      second: '2-digit'
    });
  }

})();
