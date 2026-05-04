// AI Writing Assistant

const AI_MODAL_HTML = `
<div id="aiModal" class="ai-modal" aria-hidden="true">
	<div class="ai-modal-content">
		<div class="ai-modal-header">
			<h3><i class="fa-solid fa-wand-magic-sparkles"></i> AI Writing Assistant</h3>
			<button id="closeAiModal" class="icon-button"><i class="fa-solid fa-xmark"></i></button>
		</div>
		<div class="ai-modal-body">
			<div class="ai-controls">
				<label>Action</label>
				<select id="aiActionSelect" class="research-select full-width mb-3">
					<option value="hook">Generate Hook</option>
					<option value="title">Improve Title</option>
					<option value="expand">Expand Story</option>
					<option value="simplify">Simplify Concept</option>
					<option value="translate">Translate to Tamil</option>
				</select>
				
				<label>Tone</label>
				<select id="aiToneSelect" class="research-select full-width mb-3">
					<option value="educational">Educational / Analytical</option>
					<option value="emotional">Emotional / Moving</option>
					<option value="storytelling">Storytelling / Cinematic</option>
				</select>

				<label>Context / Input Text</label>
				<textarea id="aiInputText" class="script-textarea" style="min-height: 80px;" placeholder="Paste text here or it will use your current selection..."></textarea>
				
				<button id="generateAiBtn" class="primary-button full-width mt-3"><i class="fa-solid fa-bolt"></i> Generate</button>
			</div>
			
			<div class="ai-results" id="aiResultsArea" style="display: none;">
				<h4>Variations</h4>
				<div id="aiVariationsList" class="ai-variations-list">
					<!-- Mocks injected here -->
				</div>
			</div>
		</div>
	</div>
</div>

<div id="floatingAiToolbar" class="floating-ai-toolbar" style="display: none;">
	<button class="ai-tool-btn" data-action="improve" title="Improve Phrasing"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
	<button class="ai-tool-btn" data-action="translate" title="Translate"><i class="fa-solid fa-language"></i></button>
	<button class="ai-tool-btn" data-action="simplify" title="Simplify"><i class="fa-solid fa-feather"></i></button>
</div>
`;

export function initAI() {
	if (!document.getElementById('aiModal')) {
		const div = document.createElement('div');
		div.innerHTML = AI_MODAL_HTML;
		document.body.appendChild(div);
	}

	const aiModal = document.getElementById('aiModal');
	const closeBtn = document.getElementById('closeAiModal');
	const generateBtn = document.getElementById('generateAiBtn');
	const resultsArea = document.getElementById('aiResultsArea');
	const variationsList = document.getElementById('aiVariationsList');
	const floatingToolbar = document.getElementById('floatingAiToolbar');
	
	closeBtn.addEventListener('click', () => {
		aiModal.setAttribute('aria-hidden', 'true');
		aiModal.classList.remove('show');
	});

	generateBtn.addEventListener('click', () => {
		generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
		generateBtn.disabled = true;
		
		setTimeout(() => {
			generateBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Generate';
			generateBtn.disabled = false;
			resultsArea.style.display = 'block';
			
			const action = document.getElementById('aiActionSelect').value;
			
			let mockResults = [];
			if (action === 'translate') {
				mockResults = [
					"வரலாற்றில் ஒரு புதிய அத்தியாயம் தொடங்குகிறது...",
					"இந்த சம்பவத்தின் பின்னணியில் உள்ள ரகசியம் என்ன?",
				];
			} else if (action === 'hook') {
				mockResults = [
					"Have you ever wondered what really happened during the fall of the empire?",
					"The truth they didn't teach you in history class.",
				];
			} else if (action === 'title') {
				mockResults = [
					"The Lost Dynasty: Secrets of the Silk Road",
					"Beyond the Empire: A Story of Survival",
				];
			} else {
				mockResults = [
					"Here is an expanded variation of your story that adds more cinematic details and emotional depth.",
					"A simpler way to explain this is: The event changed the course of history by shifting the balance of power."
				];
			}

			variationsList.innerHTML = mockResults.map((res, i) => `
				<div class="ai-variation-card">
					<p>${res}</p>
					<button class="secondary-button small insert-ai-btn" data-text="${encodeURIComponent(res)}">Insert</button>
				</div>
			`).join('');

			document.querySelectorAll('.insert-ai-btn').forEach(btn => {
				btn.addEventListener('click', (e) => {
					const text = decodeURIComponent(e.currentTarget.dataset.text);
					insertIntoActiveEditor(text);
					aiModal.setAttribute('aria-hidden', 'true');
					aiModal.classList.remove('show');
				});
			});

		}, 1200);
	});

	// Floating Toolbar Logic
	document.addEventListener('mouseup', () => {
		const selection = window.getSelection();
		const text = selection.toString().trim();
		if (text.length > 3) {
			const range = selection.getRangeAt(0);
			const rect = range.getBoundingClientRect();
			floatingToolbar.style.top = `${rect.top + window.scrollY - 50}px`;
			floatingToolbar.style.left = `${rect.left + window.scrollX + rect.width/2}px`;
			floatingToolbar.style.display = 'flex';
		} else {
			floatingToolbar.style.display = 'none';
		}
	});

	document.querySelectorAll('.ai-tool-btn').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const action = e.currentTarget.dataset.action;
			const selection = window.getSelection().toString();

			document.getElementById('aiActionSelect').value = action === 'improve' ? 'expand' : action;
			document.getElementById('aiInputText').value = selection;

			aiModal.setAttribute('aria-hidden', 'false');
			aiModal.classList.add('show');
			floatingToolbar.style.display = 'none';
		});
	});

	// Hook up sidebar buttons from Script Studio
	document.addEventListener('click', (e) => {
		const target = e.target.closest('#aiTranslateBtn') || e.target.closest('#aiImproveBtn');
		if (target) {
			const action = target.id === 'aiTranslateBtn' ? 'translate' : 'simplify';
			document.getElementById('aiActionSelect').value = action;
			
			aiModal.setAttribute('aria-hidden', 'false');
			aiModal.classList.add('show');
		}
	});
}

function insertIntoActiveEditor(text) {
	const textareas = document.querySelectorAll('.script-textarea, .focus-textarea');
	let activeTA = null;
	textareas.forEach(ta => { if(document.activeElement === ta) activeTA = ta; });

	if (!activeTA && textareas.length > 0) activeTA = textareas[0];

	if (activeTA) {
		const start = activeTA.selectionStart;
		const end = activeTA.selectionEnd;
		const val = activeTA.value;
		activeTA.value = val.substring(0, start) + text + val.substring(end);
		activeTA.dispatchEvent(new Event('input'));
	}
}

document.addEventListener('DOMContentLoaded', initAI);
