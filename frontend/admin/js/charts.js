class DashboardCharts {
  constructor() {
    this.lineChart = null;
    this.pieChart = null;
    this.barChart = null;

    // Common styling for Apple aesthetic
    Chart.defaults.color = '#8e8e93';
    Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  }

  initLineChart(canvasId, labels, dataPoints) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Create a gradient for the line chart fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(10, 132, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(10, 132, 255, 0.0)');

    if (this.lineChart) this.lineChart.destroy();

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Active Users',
          data: dataPoints,
          borderColor: '#0a84ff',
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#000',
          pointBorderColor: '#0a84ff',
          fill: true,
          tension: 0.4 // Smooth curve
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            beginAtZero: true
          }
        }
      }
    });
  }

  initPieChart(canvasId, labels, dataPoints) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataPoints,
          backgroundColor: [
            '#0a84ff', // Blue
            '#30d158', // Green
            '#ff9f0a', // Orange
            '#ff453a'  // Red
          ],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#fff' }
          }
        }
      }
    });
  }

  initBarChart(canvasId, labels, dataPoints) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (this.barChart) this.barChart.destroy();

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Event Count',
          data: dataPoints,
          backgroundColor: '#0a84ff',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            beginAtZero: true
          }
        }
      }
    });
  }

  initLocationChart(canvasId, labels, dataPoints) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (this.locationChart) this.locationChart.destroy();

    this.locationChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Active Users',
          data: dataPoints,
          backgroundColor: '#30d158',
          borderRadius: 4
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
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            beginAtZero: true
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }
}

window.dashboardCharts = new DashboardCharts();
