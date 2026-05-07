<<<<<<< SEARCH
function openDashboard() {
    if (!DOM.dashboardModal) return;
    renderDashboard();
    DOM.dashboardModal.style.display = 'block';
=======
const initAnalyticsChart = async () => {
  const canvas = document.getElementById('analyticsChart');
  if (!canvas) return;

  if (!window.Chart) {
    await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  const ctx = canvas.getContext('2d');
  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Subscriber Growth',
        data: [12, 19, 3, 5, 2, 3, 9],
        borderColor: '#e50914',
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { display: false },
        x: { grid: { display: false }, ticks: { color: '#808080', font: { size: 10 } } }
      }
    }
  });
};

function openDashboard() {
    if (!DOM.dashboardModal) return;
    renderDashboard();
    initAnalyticsChart();
    DOM.dashboardModal.style.display = 'block';
>>>>>>> REPLACE
