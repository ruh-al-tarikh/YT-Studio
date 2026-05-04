// Tamil Script Studio

const SCRIPT_HTML = `
<div class="script-studio-container">
	<div class="script-editor-main">
		<div class="section-heading flex-between">
			<div>
				<h2 class="section-title">Script Studio</h2>
				<p class="section-copy">Draft your documentary script with structured sections.</p>
			</div>
			<div class="script-tools">
				<button class="secondary-button small" id="insertPauseBtn" title="Insert Pause Marker">⏱ Add Pause</button>
				<button class="secondary-button small" id="insertEmphasisBtn" title="Emphasis"><strong>B</strong></button>
			</div>
		</div>

		<div class="script-sections">
			<div class="script-section-block">
				<label>1. The Hook (0:00 - 0:30)</label>
				<textarea class="script-textarea" data-section="hook" placeholder="Start with a compelling question or statement in Tamil..."></textarea>
			</div>
			<div class="script-section-block">
				<label>2. The Story / Context</label>
				<textarea class="script-textarea" data-section="story" placeholder="Explain the historical background or context..."></textarea>
			</div>
			<div class="script-section-block">
				<label>3. Core Lesson / Evidence</label>
				<textarea class="script-textarea" data-section="lesson" placeholder="Provide evidence, Quran/Hadith references, and main arguments..."></textarea>
			</div>
			<div class="script-section-block">
				<label>4. Outro & Call to Action</label>
				<textarea class="script-textarea" data-section="outro" placeholder="Conclude the video and ask for subscriptions..."></textarea>
			</div>
		</div>
	</div>

	<aside class="script-sidebar">
		<div class="metrics-card">
			<h3>Live Metrics</h3>
			<div class="metric-row">
				<span class="metric-label">Word Count:</span>
				<span class="metric-value" id="scriptWordCount">0</span>
			</div>
			<div class="metric-row">
				<span class="metric-label">Est. Duration:</span>
				<span class="metric-value" id="scriptDuration">0:00</span>
			</div>
			<div class="metric-row">
				<span class="metric-label">Reading Pace:</span>
				<span class="metric-value text-accent">Moderate</span>
			</div>
		</div>

		<div class="ai-assistant-card" id="aiAssistantContainer">
			<!-- AI Assistant module will inject here, or we can add mock tools -->
			<h3>AI Assistant</h3>
			<p class="text-sm text-soft mb-3">Highlight text to rewrite or translate.</p>
			<div class="ai-actions">
				<button class="secondary-button full-width mb-2" id="aiTranslateBtn"><i class="fa-solid fa-language"></i> Translate to Tamil</button>
				<button class="secondary-button full-width" id="aiImproveBtn"><i class="fa-solid fa-wand-magic-sparkles"></i> Improve Phrasing</button>
			</div>
		</div>
	</aside>
</div>
`;

export function initScriptStudio() {
	const container = document.getElementById('ptab-script');
	if (!container) return;

	container.innerHTML = SCRIPT_HTML;

	const textareas = container.querySelectorAll('.script-textarea');
	textareas.forEach(ta => {
		ta.addEventListener('input', updateMetrics);
	});

	document.getElementById('insertPauseBtn')?.addEventListener('click', () => insertAtCursor(' [PAUSE] '));
	document.getElementById('insertEmphasisBtn')?.addEventListener('click', () => insertAtCursor(' ** **'));

	updateMetrics();
}

function updateMetrics() {
	const textareas = document.querySelectorAll('.script-textarea');
	let totalText = '';
	textareas.forEach(ta => totalText += ta.value + ' ');

	const words = totalText.trim().split(/\s+/).filter(w => w.length > 0).length;
	document.getElementById('scriptWordCount').textContent = words;

	// Rough estimate: 130 words per minute for Tamil/English narration
	const minutes = Math.floor(words / 130);
	const seconds = Math.floor((words % 130) / (130 / 60));
	
	document.getElementById('scriptDuration').textContent = \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
}

function insertAtCursor(text) {
	const activeEl = document.activeElement;
	if (activeEl && activeEl.classList.contains('script-textarea')) {
		const start = activeEl.selectionStart;
		const end = activeEl.selectionEnd;
		const val = activeEl.value;
		activeEl.value = val.substring(0, start) + text + val.substring(end);
		activeEl.selectionStart = activeEl.selectionEnd = start + text.length;
		activeEl.focus();
		updateMetrics();
	} else {
		alert('Please focus on a text area first to insert markers.');
	}
}

// Auto-init on load
document.addEventListener('DOMContentLoaded', initScriptStudio);
