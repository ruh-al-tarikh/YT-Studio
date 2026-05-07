<<<<<<< SEARCH
function setTheme(theme) {
    AppState.theme = theme;
    Utils.saveLS(CONFIG.STORAGE.THEME_KEY, theme);

    if (theme === 'light') {
        DOM.body.classList.add('light-mode');
    } else {
        DOM.body.classList.remove('light-mode');
    }

    const icon = DOM.themeToggle?.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-regular fa-moon' : 'fa-regular fa-sun';
    }
}
=======
function setTheme(theme) {
    AppState.theme = theme;
    Utils.saveLS(CONFIG.STORAGE.THEME_KEY, theme);

    DOM.body.classList.remove('light-mode', 'theme-neon');
    if (theme === 'light') {
        DOM.body.classList.add('light-mode');
    } else if (theme === 'neon') {
        DOM.body.classList.add('theme-neon');
    }

    const icon = DOM.themeToggle?.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-regular fa-moon' : theme === 'neon' ? 'fa-solid fa-bolt' : 'fa-regular fa-sun';
    }

    document.querySelectorAll('.theme-opt').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === theme);
    });
}
>>>>>>> REPLACE
