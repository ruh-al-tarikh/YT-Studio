<<<<<<< SEARCH
const L = () => {
    l.dashboardModal && (l.dashboardModal.setAttribute("aria-hidden", "false"), l.body.style.overflow = "hidden", l.body.classList.add("modal-open"));
    const t = i("dashboard-total"),
        e = i("dashboard-saved"),
        a = i("dashboard-progress"),
        r = i("dashboardCategories");
    t && (t.textContent = o.videos.length), e && (e.textContent = o.watchLater.length);
    let s = 0;
    0 < o.videos.length && (s = Math.round(Object.keys(o.progress).length / o.videos.length * 100)), a && (a.textContent = s + "%"), r && (r.innerHTML = Object.entries(o.videos.reduce((t, e) => (t[e.category] = (t[e.category] || 0) + 1, t), {})).map(([t, e]) => `
			<div class="category-item">
				<span class="cat-name">${t.charAt(0).toUpperCase()+t.slice(1)}</span>
				<span class="cat-count">${e}</span>
			</div>
		`).join(""))
};
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

const L = () => {
    l.dashboardModal && (l.dashboardModal.setAttribute("aria-hidden", "false"), l.body.style.overflow = "hidden", l.body.classList.add("modal-open"));
    const t = i("dashboard-total"),
        e = i("dashboard-saved"),
        a = i("dashboard-progress"),
        r = i("dashboardCategories");
    t && (t.textContent = o.videos.length), e && (e.textContent = o.watchLater.length);
    let s = 0;
    0 < o.videos.length && (s = Math.round(Object.keys(o.progress).length / o.videos.length * 100)), a && (a.textContent = s + "%"), r && (r.innerHTML = Object.entries(o.videos.reduce((t, e) => (t[e.category] = (t[e.category] || 0) + 1, t), {})).map(([t, e]) => `
			<div class="category-item">
				<span class="cat-name">${t.charAt(0).toUpperCase()+t.slice(1)}</span>
				<span class="cat-count">${e}</span>
			</div>
		`).join(""));
    initAnalyticsChart();
};
>>>>>>> REPLACE
