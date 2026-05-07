<<<<<<< SEARCH
            document.querySelectorAll('.chip').forEach(ch => {
                if (AppState.categories.includes(ch.dataset.cat)) {
                    ch.classList.add('active');
                } else {
                    ch.classList.remove('active');
                }
            });
=======
            document.querySelectorAll('.chip').forEach(ch => {
                const isActive = AppState.categories.includes(ch.dataset.cat);
                ch.classList.toggle('active', isActive);
                ch.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
>>>>>>> REPLACE
