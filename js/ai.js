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
`;

export function initAI() {
	// Inject AI Modal into body
	if (!document.getElementById('aiModal')) {
		const div = document.createElement('div');
		div.innerHTML = AI_MODAL_HTML;
		document.body.appendChild(div.firstElementChild);
	}

	const aiModal = document.getElementById('aiModal');
	const closeBtn = document.getElementById('closeAiModal');
	const generateBtn = document.getElementById('generateAiBtn');
	const resultsArea = document.getElementById('aiResultsArea');
	const variationsList = document.getElementById('aiVariationsList');
	
	closeBtn.addEventListener('click', () => {
		aiModal.setAttribute('aria-hidden', 'true');
		aiModal.classList.remove('show');
	});

	generateBtn.addEventListener('click', () => {
		generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
		generateBtn.disabled = true;
		
		// Mock API call
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

		}, 1500);
	});

	// Hook up sidebar buttons from Script Studio
	document.addEventListener('click', (e) => {
		if (e.target.closest('#aiTranslateBtn') || e.target.closest('#aiImproveBtn')) {
			const action = e.target.closest('#aiTranslateBtn') ? 'translate' : 'simplify';
			document.getElementById('aiActionSelect').value = action;
			
			// Grab selected text if any
			const selected = window.getSelection().toString();
			if(selected) document.getElementById('aiInputText').value = selected;

			aiModal.setAttribute('aria-hidden', 'false');
			aiModal.classList.add('show');
		}
	});
}

function insertIntoActiveEditor(text) {
	// Find the most recently focused script textarea
	const textareas = document.querySelectorAll('.script-textarea');
	if (textareas.length > 0) {
		const ta = textareas[0]; // Naive fallback
		ta.value += '\\n' + text;
		ta.dispatchEvent(new Event('input')); // trigger word count
	}
}

document.addEventListener('DOMContentLoaded', initAI);
