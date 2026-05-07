/* Islamic History Hub - Timeline Logic */
export const initIslamic = () => {
  const container = document.getElementById('studio-view-islamic');
  if (!container) return;

  const events = [
    { year: '610 CE', title: 'The First Revelation', desc: 'The Prophet Muhammad (PBUH) receives the first revelation of the Quran at Cave Hira.' },
    { year: '622 CE', title: 'The Hijrah', desc: 'Migration from Makkah to Madinah, marking the beginning of the Islamic calendar.' },
    { year: '632 CE', title: 'Farewell Pilgrimage', desc: 'The completion of the message and the passing of the Prophet (PBUH).' },
    { year: '750 CE', title: 'Abbasid Caliphate', desc: 'The beginning of the Golden Age of Islam, focusing on science, philosophy, and culture.' },
    { year: '1099 CE', title: 'The First Crusade', desc: 'The Siege of Jerusalem and the beginning of a long period of conflict and cultural exchange.' },
    { year: '1453 CE', title: 'Conquest of Constantinople', desc: 'The Ottoman Empire establishes its dominance and shifts the course of European history.' }
  ];

  container.innerHTML = `
    <div class="flex items-center justify-between mb-8">
      <h3 class="font-display text-2xl">Historical Timeline</h3>
      <div class="flex gap-2">
        <button class="chip active">Global</button>
        <button class="chip">Theology</button>
        <button class="chip">Science</button>
      </div>
    </div>
    <div class="timeline-container">
      <div class="timeline-line"></div>
      ${events.map((ev, i) => `
        <div class="timeline-event ${i % 2 === 0 ? 'left' : 'right'}">
          <div class="timeline-dot"></div>
          <span class="timeline-date">${ev.year}</span>
          <div class="timeline-card glass-card p-6">
            <h4 class="font-bold mb-2">${ev.title}</h4>
            <p class="text-sm text-soft leading-relaxed">${ev.desc}</p>
            <button class="mt-4 text-[10px] uppercase font-bold text-primary flex items-center gap-2 hover:gap-3 transition-all">
              Research Archive <i class="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
};
