<<<<<<< SEARCH
const initAIAssistant = () => {
  const scoreBtn = document.getElementById('ai-score-title');
=======
const initAIAssistant = () => {
  if (!isFeatureEnabled('AI_ASSISTANT')) {
    const aiPanel = document.getElementById('ai-assistant-panel');
    if (aiPanel) aiPanel.style.display = 'none';
    return;
  }
  const scoreBtn = document.getElementById('ai-score-title');
>>>>>>> REPLACE
