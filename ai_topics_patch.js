<<<<<<< SEARCH
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
=======
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

  const topicChips = document.querySelectorAll('#ai-topics span');
  topicChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const topic = chip.textContent;
      if (titleInput) {
        titleInput.value = topic;
        Utils.showToast(`Selected: ${topic}`, 'info');
      }
    });
  });
};
>>>>>>> REPLACE
