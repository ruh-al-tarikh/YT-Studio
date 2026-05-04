// Islamic Reference Toolkit

const ISLAMIC_HTML = `
<div class="islamic-container">
	<div class="islamic-main">
		<div class="section-heading">
			<h2 class="section-title">Reference Library</h2>
			<p class="section-copy">Search and copy verified Quranic and Hadith citations for your scripts.</p>
		</div>

		<div class="islamic-search">
			<i class="fa-solid fa-magnifying-glass"></i>
			<input type="text" id="islamicSearch" placeholder="Search by topic, Surah, or Hadith number...">
		</div>

		<div class="islamic-filters">
			<button class="chip active" data-filter="all">All</button>
			<button class="chip" data-filter="quran">Quran</button>
			<button class="chip" data-filter="hadith">Hadith</button>
			<button class="chip" data-filter="history">Historical Quotes</button>
		</div>

		<div class="reference-list" id="referenceList">
			<!-- Populated by JS -->
		</div>
	</div>

	<aside class="islamic-sidebar">
		<div class="islamic-card">
			<h3><i class="fa-solid fa-bookmark"></i> Quick Collections</h3>
			<ul class="collection-list">
				<li><i class="fa-solid fa-folder"></i> End Times Prophecies <span>(12)</span></li>
				<li><i class="fa-solid fa-folder"></i> Stories of Prophets <span>(8)</span></li>
				<li><i class="fa-solid fa-folder"></i> Golden Age Science <span>(5)</span></li>
			</ul>
			<button class="secondary-button full-width mt-3"><i class="fa-solid fa-plus"></i> New Collection</button>
		</div>
	</aside>
</div>
`;

const mockReferences = [
	{
		id: 1,
		type: 'quran',
		source: 'Surah Al-Baqarah 2:255',
		arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
		translation: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of [all] existence.',
		tags: ['Tawheed', 'Ayatul Kursi']
	},
	{
		id: 2,
		type: 'hadith',
		source: 'Sahih al-Bukhari 1',
		arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
		translation: 'The reward of deeds depends upon the intentions...',
		tags: ['Intentions', 'Basics']
	},
	{
		id: 3,
		type: 'history',
		source: 'Salahuddin Ayyubi',
		arabic: '',
		translation: 'I have become the servant of the two holy sanctuaries.',
		tags: ['Jerusalem', 'Leadership']
	}
];

export function initIslamic() {
	const container = document.getElementById('studio-view-islamic');
	if (!container) return;
	container.innerHTML = ISLAMIC_HTML;

	const listEl = document.getElementById('referenceList');
	const searchEl = document.getElementById('islamicSearch');
	const filters = document.querySelectorAll('.islamic-filters .chip');

	let currentFilter = 'all';
	let searchQuery = '';

	function renderList() {
		const filtered = mockReferences.filter(r => {
			const matchFilter = currentFilter === 'all' || r.type === currentFilter;
			const matchSearch = r.source.toLowerCase().includes(searchQuery) || 
								r.translation.toLowerCase().includes(searchQuery) ||
								r.tags.join(' ').toLowerCase().includes(searchQuery);
			return matchFilter && matchSearch;
		});

		if (filtered.length === 0) {
			listEl.innerHTML = '<p class="text-soft">No references found.</p>';
			return;
		}

		listEl.innerHTML = filtered.map(r => `
			<div class="reference-item">
				<div class="ref-header">
					<span class="ref-source">${r.source}</span>
					<span class="ref-badge ${r.type}">${r.type}</span>
				</div>
				${r.arabic ? `<p class="ref-arabic">${r.arabic}</p>` : ''}
				<p class="ref-translation">${r.translation}</p>
				<div class="ref-footer">
					<div class="ref-tags">${r.tags.map(t => `<span class="ref-tag">#${t}</span>`).join('')}</div>
					<button class="secondary-button small copy-ref-btn" data-id="${r.id}"><i class="fa-regular fa-copy"></i> Copy</button>
				</div>
			</div>
		`).join('');

		listEl.querySelectorAll('.copy-ref-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const id = parseInt(e.currentTarget.dataset.id);
				const ref = mockReferences.find(r => r.id === id);
				const text = `${ref.source}\n${ref.arabic ? ref.arabic + '\n' : ''}${ref.translation}`;
				navigator.clipboard.writeText(text);
				alert('Reference copied!');
			});
		});
	}

	searchEl.addEventListener('input', (e) => {
		searchQuery = e.target.value.toLowerCase();
		renderList();
	});

	filters.forEach(btn => {
		btn.addEventListener('click', (e) => {
			filters.forEach(b => b.classList.remove('active'));
			e.target.classList.add('active');
			currentFilter = e.target.dataset.filter;
			renderList();
		});
	});

	renderList();
}

document.addEventListener('DOMContentLoaded', initIslamic);
