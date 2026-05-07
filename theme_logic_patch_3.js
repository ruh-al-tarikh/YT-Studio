<<<<<<< SEARCH
    if (DOM.themeToggle) DOM.themeToggle.addEventListener('click', toggleTheme);
=======
    if (DOM.themeToggle) DOM.themeToggle.addEventListener('click', toggleTheme);

    document.querySelectorAll('.theme-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        setTheme(btn.dataset.theme);
        const menu = document.getElementById('themeMenu');
        if (menu) menu.classList.add('hidden');
      });
    });
>>>>>>> REPLACE
