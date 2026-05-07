export const FLAGS = {
  AI_ASSISTANT: true,
  THEME_ENGINE: true,
  WEB_VITALS: true,
  BETA_ANALYTICS: true
};

export const isFeatureEnabled = (flag) => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has(`flag_${flag}`)) {
    return urlParams.get(`flag_${flag}`) === 'true';
  }
  return FLAGS[flag] || false;
};
