class DashboardCharts {
  constructor() {
    this.sparklines = {};
    this.frictionChart = null;
    this.funnelChart = null;
    this.deviceChart = null;

    // Premium styling config
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  }

  /**
   * Initializes a minimal, trend-tracking sparkline for KPI Cards
   */
  initSparkline(canvasId, dataPoints, isPositive = true) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    if (this.sparklines[canvasId]) {
      this.sparklines[canvasId].destroy();
    }

    const strokeColor = isPositive ? '#10b981' : '#ef4444';
    const gradient = ctx.createLinearGradient(0, 0, 0, 40);
    gradient.addColorStop(0, isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    // Fallback if dataPoints is empty or too short
    const mockLabels = (dataPoints || [1, 2, 3, 4, 5, 6, 7]).map((_, i) => i);
    const finalData = dataPoints && dataPoints.length > 0 ? dataPoints : [5, 5, 5, 5, 5, 5, 5];

    this.sparklines[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: mockLabels,
        datasets: [{
          data: finalData,
          borderColor: strokeColor,
          backgroundColor: gradient,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 3,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  /**
   * Renders the Page Load vs Bounce Rate Scatter Chart (UX Friction Matrix)
   */
  initScatterChart(canvasId, uxFrictionData) {
    const canvasEl = document.getElementById(canvasId);
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');

    if (this.frictionChart) {
      this.frictionChart.destroy();
    }

    // Format data for Scatter
    const dataset = uxFrictionData.map(item => ({
      x: item.loadTime,
      y: item.bounceRate,
      label: item.page,
      views: item.views
    }));

    this.frictionChart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Pages',
          data: dataset,
          backgroundColor: function(context) {
            const dataPoint = context.raw;
            if (!dataPoint) return '#6366f1';
            // Slow pages (loadTime > 2s) get color-coded rose red
            return dataPoint.x > 2.0 ? '#ef4444' : '#6366f1';
          },
          borderWidth: 0,
          pointRadius: 10,
          pointHoverRadius: 14
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0a0e1c',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            titleColor: '#f8fafc',
            bodyColor: '#94a3b8',
            padding: 12,
            callbacks: {
              label: function(context) {
                const item = context.raw;
                return [
                  `Route: ${item.label}`,
                  `Load Speed: ${item.x}s`,
                  `Bounce Rate: ${item.y}%`,
                  `Page Views: ${item.views}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Page Load Time (seconds)',
              color: '#64748b',
              font: { weight: 600, size: 10 }
            },
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            suggestedMin: 0,
            suggestedMax: 5
          },
          y: {
            title: {
              display: true,
              text: 'Bounce Rate (%)',
              color: '#64748b',
              font: { weight: 600, size: 10 }
            },
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            suggestedMin: 0,
            suggestedMax: 100
          }
        }
      }
    });
  }

  /**
   * Horizontal Funnel Steps Bar Chart
   */
  initFunnelChart(canvasId, funnelData) {
    const canvasEl = document.getElementById(canvasId);
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');

    if (this.funnelChart) {
      this.funnelChart.destroy();
    }

    const labels = funnelData.map(item => item.name);
    const dataPoints = funnelData.map(item => item.count);

    this.funnelChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: dataPoints,
          backgroundColor: [
            'rgba(99, 102, 241, 0.85)',
            'rgba(99, 102, 241, 0.6)',
            'rgba(16, 185, 129, 0.7)'
          ],
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            beginAtZero: true
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }

  /**
   * Device Split Doughnut Chart
   */
  initDeviceChart(canvasId, labels, dataPoints) {
    const canvasEl = document.getElementById(canvasId);
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');

    if (this.deviceChart) {
      this.deviceChart.destroy();
    }

    this.deviceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataPoints,
          backgroundColor: [
            '#6366f1', // Indigo
            '#10b981', // Emerald
            '#ff453a'  // Red
          ],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              boxWidth: 10,
              padding: 15
            }
          }
        }
      }
    });
  }
}

window.dashboardCharts = new DashboardCharts();
