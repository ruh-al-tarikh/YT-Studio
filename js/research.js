// Research Intelligence Panel

const RESEARCH_HTML = `
<div class="research-container">
	<div class="research-main">
		<div class="section-heading">
			<h2 class="section-title">Research Board</h2>
			<p class="section-copy">Save and tag sources, links, and text excerpts.</p>
		</div>

		<div class="research-input-area">
			<textarea id="researchInput" placeholder="Paste text, links, or type notes here... Highlight text to save as excerpt." rows="4"></textarea>
			<div class="research-actions">
				<select id="researchTag" class="research-select">
					<option value="General">General Note</option>
					<option value="Quran">Quranic Reference</option>
					<option value="Hadith">Hadith</option>
					<option value="History">Historical Fact</option>
					<option value="Link">Web Link</option>
				</select>
				<button id="saveResearchBtn" class="primary-button"><i class="fa-solid fa-plus"></i> Save to Board</button>
			</div>
		</div>

		<div class="research-grid" id="researchGrid">
			<!-- Note cards will be populated here -->
		</div>
	</div>

	<aside class="research-sidebar">
		<div class="related-topics-card">
			<h3>Related Topics</h3>
			<p class="text-sm text-soft mb-3">Suggested based on your notes:</p>
			<div id="relatedTopicsList" class="topics-list">
				<span class="topic-pill">Prophet Muhammad (PBUH)</span>
				<span class="topic-pill">Umayyad Caliphate</span>
				<span class="topic-pill">Battle of Badr</span>
			</div>
		</div>
		<div class="quick-tools-card mt-4">
			<h3>Quick Tools</h3>
			<button class="secondary-button full-width mb-2" onclick="window.open('https://quran.com', '_blank')"><i class="fa-solid fa-book-quran"></i> Open Quran.com</button>
			<button class="secondary-button full-width" onclick="window.open('https://sunnah.com', '_blank')"><i class="fa-solid fa-scroll"></i> Open Sunnah.com</button>
		</div>
	</aside>
</div>
`;

let researchNotes = JSON.parse(localStorage.getItem('yt_studio_research') || '[]');

export function initResearch() {
	const container = document.getElementById('ptab-research');
	if (!container) return;

	container.innerHTML = RESEARCH_HTML;

	const saveBtn = document.getElementById('saveResearchBtn');
	const inputEl = document.getElementById('researchInput');
	const tagEl = document.getElementById('researchTag');

	saveBtn.addEventListener('click', () => {
		const text = inputEl.value.trim();
		if (!text) return;

		const note = {
			id: Date.now(),
			text: text,
			tag: tagEl.value,
			date: new Date().toLocaleDateString()
		};

		researchNotes.unshift(note);
		localStorage.setItem('yt_studio_research', JSON.stringify(researchNotes));
		inputEl.value = '';
		renderNotes();
	});

	renderNotes();
}

function renderNotes() {
	const grid = document.getElementById('researchGrid');
	if (!grid) return;

	if (researchNotes.length === 0) {
		grid.innerHTML = `
			<div class="empty-state-card" style="grid-column: 1 / -1;">
				<i class="fa-solid fa-book-open"></i>
				<h3>No research notes yet</h3>
				<p>Start pasting text or links above.</p>
			</div>
		`;
		return;
	}

	grid.innerHTML = researchNotes.map(note => `
		<div class="research-card">
			<div class="research-card-header">
				<span class="research-tag tag-${note.tag.toLowerCase()}">${note.tag}</span>
				<div class="research-card-actions">
					<button class="icon-button small copy-note-btn" data-text="${encodeURIComponent(note.text)}" title="Copy"><i class="fa-regular fa-copy"></i></button>
					<button class="icon-button small delete-note-btn" data-id="${note.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
				</div>
			</div>
			<p class="research-card-text">${note.text.replace(/\n/g, '<br>')}</p>
			<div class="research-card-footer">
				<span class="research-date">${note.date}</span>
			</div>
		</div>
	`).join('');

	// Attach event listeners
	grid.querySelectorAll('.copy-note-btn').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const text = decodeURIComponent(e.currentTarget.dataset.text);
			navigator.clipboard.writeText(text);
			showToast('Copied research note!');
		});
	});

	grid.querySelectorAll('.delete-note-btn').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const id = parseInt(e.currentTarget.dataset.id);
			researchNotes = researchNotes.filter(n => n.id !== id);
			localStorage.setItem('yt_studio_research', JSON.stringify(researchNotes));
			renderNotes();
		});
	});
}

function showToast(msg) {
	const toast = document.getElementById('toast');
	if(toast) {
		toast.textContent = msg;
		toast.classList.add('show');
		setTimeout(() => toast.classList.remove('show'), 3000);
	}
}

// Auto-init on load
document.addEventListener('DOMContentLoaded', initResearch);
