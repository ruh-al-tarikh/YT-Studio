// YouTube SEO Toolkit

const SEO_HTML = `
<div class="seo-container">
	<div class="seo-main">
		<div class="section-heading">
			<h2 class="section-title">SEO & Metadata</h2>
			<p class="section-copy">Optimize your title, description, and tags for YouTube search.</p>
		</div>

		<div class="seo-form">
			<div class="form-group">
				<label>Video Title <span id="titleCount" class="char-count">0/100</span></label>
				<div class="input-with-action">
					<input type="text" id="seoTitle" class="seo-input" placeholder="Enter an engaging title...">
					<button class="icon-button small" id="aiTitleBtn" title="Generate Titles"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
				</div>
			</div>
			
			<div class="form-group">
				<label>Description <span id="descCount" class="char-count">0/5000</span></label>
				<textarea id="seoDesc" class="seo-textarea" placeholder="Detailed description with keywords..."></textarea>
			</div>

			<div class="form-group">
				<label>Tags <span id="tagCount" class="char-count">0/500</span></label>
				<input type="text" id="seoTags" class="seo-input" placeholder="islamic history, documentary, quran...">
			</div>
		</div>
	</div>

	<aside class="seo-sidebar">
		<div class="seo-card">
			<h3>YouTube Preview</h3>
			<div class="yt-preview-card">
				<div class="yt-thumb-mock" id="thumbMock">
					<div class="thumb-overlay">12:45</div>
					<div class="thumb-title-layer" id="thumbTitle">Your Title</div>
				</div>
				<div class="yt-details-mock">
					<div class="yt-avatar"></div>
					<div class="yt-text-mock">
						<h4 id="previewTitle">Your Title Will Appear Here</h4>
						<p>Ruh Al Tarikh • 1M views • 1 day ago</p>
					</div>
				</div>
			</div>
		</div>

		<div class="seo-card mt-4">
			<h3>Readability & Strength</h3>
			<div class="seo-metrics">
				<div class="seo-metric">
					<span>Title Length</span>
					<span id="scoreTitle" class="score-badge warning">Too Short</span>
				</div>
				<div class="seo-metric">
					<span>Readability Score</span>
					<span id="scoreReadability" class="score-badge good">A-</span>
				</div>
				<div class="seo-metric">
					<span>Keyword Strength</span>
					<span id="scoreKeywords" class="score-badge warning">Low</span>
				</div>
			</div>
		</div>
	</aside>
</div>
`;

export function initSEO() {
	const container = document.getElementById('ptab-seo');
	if (!container) return;
	container.innerHTML = SEO_HTML;

	const titleInput = document.getElementById('seoTitle');
	const thumbTitle = document.getElementById('thumbTitle');
	const previewTitle = document.getElementById('previewTitle');
	const titleCount = document.getElementById('titleCount');
	const scoreTitle = document.getElementById('scoreTitle');
	const scoreKeywords = document.getElementById('scoreKeywords');

	titleInput.addEventListener('input', (e) => {
		const val = e.target.value;
		previewTitle.textContent = val || 'Your Title Will Appear Here';
		thumbTitle.textContent = val || 'Your Title';
		titleCount.textContent = `${val.length}/100`;

		if (val.length < 20) {
			scoreTitle.textContent = 'Too Short';
			scoreTitle.className = 'score-badge warning';
		} else if (val.length > 70) {
			scoreTitle.textContent = 'Too Long';
			scoreTitle.className = 'score-badge warning';
		} else {
			scoreTitle.textContent = 'Optimal';
			scoreTitle.className = 'score-badge good';
		}

		// Mock keyword strength
		const keywords = ['quran', 'history', 'truth', 'secret', 'mystery', 'islam'];
		const hasKeyword = keywords.some(k => val.toLowerCase().includes(k));
		if (hasKeyword) {
			scoreKeywords.textContent = 'Strong';
			scoreKeywords.className = 'score-badge excellent';
		} else {
			scoreKeywords.textContent = 'Low';
			scoreKeywords.className = 'score-badge warning';
		}
	});

	document.getElementById('seoDesc')?.addEventListener('input', (e) => {
		document.getElementById('descCount').textContent = `${e.target.value.length}/5000`;
	});

	document.getElementById('seoTags')?.addEventListener('input', (e) => {
		document.getElementById('tagCount').textContent = `${e.target.value.length}/500`;
	});

	document.getElementById('aiTitleBtn')?.addEventListener('click', () => {
		const modal = document.getElementById('aiModal');
		if(modal) {
			document.getElementById('aiActionSelect').value = 'title';
			modal.classList.add('show');
			modal.setAttribute('aria-hidden', 'false');
		}
	});
}

document.addEventListener('DOMContentLoaded', initSEO);
