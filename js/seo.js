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
				<div class="yt-thumb-mock"></div>
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
			<h3>SEO Scorecard</h3>
			<div class="seo-metrics">
				<div class="seo-metric">
					<span>Title Length</span>
					<span id="scoreTitle" class="score-badge warning">Too Short</span>
				</div>
				<div class="seo-metric">
					<span>Description Keyword Density</span>
					<span class="score-badge good">Good</span>
				</div>
				<div class="seo-metric">
					<span>Engagement Prediction</span>
					<span class="score-badge excellent">High</span>
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
	const descInput = document.getElementById('seoDesc');
	const tagsInput = document.getElementById('seoTags');
	
	const previewTitle = document.getElementById('previewTitle');
	const titleCount = document.getElementById('titleCount');
	const scoreTitle = document.getElementById('scoreTitle');

	titleInput.addEventListener('input', (e) => {
		const val = e.target.value;
		previewTitle.textContent = val || 'Your Title Will Appear Here';
		titleCount.textContent = `${val.length}/100`;

		if (val.length < 20) {
			scoreTitle.textContent = 'Too Short';
			scoreTitle.className = 'score-badge warning';
		} else if (val.length > 60) {
			scoreTitle.textContent = 'Too Long';
			scoreTitle.className = 'score-badge warning';
		} else {
			scoreTitle.textContent = 'Optimal';
			scoreTitle.className = 'score-badge good';
		}
	});

	descInput.addEventListener('input', (e) => {
		document.getElementById('descCount').textContent = `${e.target.value.length}/5000`;
	});

	tagsInput.addEventListener('input', (e) => {
		document.getElementById('tagCount').textContent = `${e.target.value.length}/500`;
	});

	document.getElementById('aiTitleBtn')?.addEventListener('click', () => {
		// Mock opening AI modal with hook context
		if (window.initAI) {
			const btn = document.getElementById('aiActionSelect');
			if(btn) {
				btn.value = 'hook';
				document.getElementById('aiModal').classList.add('show');
				document.getElementById('aiModal').setAttribute('aria-hidden', 'false');
			}
		} else {
			alert('AI Assistant triggered!');
		}
	});
}

document.addEventListener('DOMContentLoaded', initSEO);
