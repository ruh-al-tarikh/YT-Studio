<<<<<<< SEARCH
function openDashboard() {
    if (!DOM.dashboardModal) return;
    renderDashboard();
    initAnalyticsChart();
=======
const initAIAssistant = () => {
  const scoreBtn = document.getElementById('ai-score-title');
  const hookBtn = document.getElementById('ai-generate-hook');
  const titleInput = document.getElementById('ai-title-input');

  if (scoreBtn) {
    scoreBtn.addEventListener('click', () => {
      const title = titleInput.value.trim();
      if (!title) {
        Utils.showToast('Please enter a title', 'warning');
        return;
      }

      scoreBtn.disabled = true;
      scoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      setTimeout(() => {
        const score = Math.floor(Math.random() * (95 - 65) + 65);
        const result = document.getElementById('ai-score-result');
        const scoreVal = document.getElementById('ai-score-value');
        const scoreBar = document.getElementById('ai-score-bar');

        result.classList.remove('hidden');
        scoreVal.textContent = `${score}/100`;
        scoreBar.style.width = `${score}%`;

        scoreBtn.disabled = false;
        scoreBtn.textContent = 'Score';
        Utils.showToast('Title analyzed!', 'success');
      }, 1000);
    });
  }

  if (hookBtn) {
    hookBtn.addEventListener('click', () => {
      hookBtn.disabled = true;
      hookBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

      const hooks = [
        "What if everything you knew about the fall of Andalusia was wrong?",
        "Behind the silence of history lies a truth far more cinematic than fiction.",
        "The year was 1492. The world was changing. And at the center of it all?",
        "How did one decision change the course of human history forever?"
      ];

      setTimeout(() => {
        const result = document.getElementById('ai-hook-result');
        result.classList.remove('hidden');
        result.textContent = hooks[Math.floor(Math.random() * hooks.length)];

        hookBtn.disabled = false;
        hookBtn.innerHTML = '<i class="fas fa-bolt mr-2 text-primary"></i> Generate Viral Hook';
        Utils.showToast('Hook generated!', 'success');
      }, 1200);
    });
  }
};

function openDashboard() {
    if (!DOM.dashboardModal) return;
    renderDashboard();
    initAnalyticsChart();
    initAIAssistant();
>>>>>>> REPLACE
