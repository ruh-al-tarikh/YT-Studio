// Voiceover Companion

const VOICE_HTML = `
<div class="voice-container">
	<div class="voice-main">
		<div class="section-heading flex-between">
			<div>
				<h2 class="section-title">Voiceover Booth</h2>
				<p class="section-copy">Read Mode, pacing, and recording simulation.</p>
			</div>
			<div class="voice-tools">
				<button id="startReadModeBtn" class="primary-button"><i class="fa-solid fa-microphone-lines"></i> Enter Read Mode</button>
			</div>
		</div>

		<div class="voice-preview" id="voicePreviewArea">
			<div class="empty-state-card">
				<i class="fa-solid fa-file-audio"></i>
				<h3>Script sync pending</h3>
				<p>Your script will appear here for narration. Go to the Script tab to write.</p>
			</div>
		</div>
	</div>

	<aside class="voice-sidebar">
		<div class="voice-card">
			<h3>Pacing Guide</h3>
			<ul class="pacing-legend">
				<li><span class="pacing-dot pause"></span> <code>[PAUSE]</code> - 1 second breath</li>
				<li><span class="pacing-dot emphasis"></span> <code>**Text**</code> - Strong emphasis</li>
			</ul>
			<div class="waveform-mock mt-4">
				<div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
			</div>
		</div>
	</aside>
</div>

<!-- Fullscreen Read Mode Overlay -->
<div id="readModeOverlay" class="read-mode-overlay" aria-hidden="true">
	<div class="read-mode-header">
		<button id="closeReadModeBtn" class="icon-button"><i class="fa-solid fa-xmark"></i></button>
		<div class="read-controls">
			<button id="autoScrollBtn" class="secondary-button"><i class="fa-solid fa-angles-down"></i> Auto-Scroll</button>
			<div class="font-size-controls">
				<button id="fontDecBtn" class="icon-button small">A-</button>
				<button id="fontIncBtn" class="icon-button small">A+</button>
			</div>
		</div>
	</div>
	<div class="read-mode-content-wrapper">
		<div class="read-mode-content" id="readModeContent">
			<!-- Injected script text -->
		</div>
	</div>
</div>
`;

export function initVoice() {
	const container = document.getElementById('ptab-voice');
	if (!container) return;
	container.innerHTML = VOICE_HTML;

	const readModeOverlay = document.getElementById('readModeOverlay');
	const startBtn = document.getElementById('startReadModeBtn');
	const closeBtn = document.getElementById('closeReadModeBtn');
	const contentEl = document.getElementById('readModeContent');
	const previewEl = document.getElementById('voicePreviewArea');
	
	let fontSize = 32;

	startBtn.addEventListener('click', () => {
		readModeOverlay.setAttribute('aria-hidden', 'false');
		readModeOverlay.classList.add('show');
		document.body.style.overflow = 'hidden';
		syncScriptToReadMode();
	});

	closeBtn.addEventListener('click', () => {
		readModeOverlay.setAttribute('aria-hidden', 'true');
		readModeOverlay.classList.remove('show');
		document.body.style.overflow = '';
		stopAutoScroll();
	});

	document.getElementById('fontIncBtn').addEventListener('click', () => {
		fontSize += 4;
		contentEl.style.fontSize = `${fontSize}px`;
	});

	document.getElementById('fontDecBtn').addEventListener('click', () => {
		fontSize = Math.max(16, fontSize - 4);
		contentEl.style.fontSize = `${fontSize}px`;
	});

	let scrollInterval;
	let scrolling = false;
	const autoScrollBtn = document.getElementById('autoScrollBtn');
	
	autoScrollBtn.addEventListener('click', () => {
		if (scrolling) {
			stopAutoScroll();
		} else {
			scrolling = true;
			autoScrollBtn.classList.add('active');
			autoScrollBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Stop Scroll';
			scrollInterval = setInterval(() => {
				const wrapper = document.querySelector('.read-mode-content-wrapper');
				wrapper.scrollTop += 1;
			}, 30);
		}
	});

	function stopAutoScroll() {
		scrolling = false;
		autoScrollBtn.classList.remove('active');
		autoScrollBtn.innerHTML = '<i class="fa-solid fa-angles-down"></i> Auto-Scroll';
		clearInterval(scrollInterval);
	}

	function syncScriptToReadMode() {
		const textareas = document.querySelectorAll('.script-textarea');
		let fullScript = '';
		textareas.forEach(ta => {
			if (ta.value.trim()) {
				fullScript += '<div>' + processMarkers(ta.value.trim()) + '</div><br>';
			}
		});

		if (!fullScript) {
			fullScript = '<p class="text-center text-soft" style="margin-top:20vh;">No script written yet. Go to Script Studio.</p>';
		}

		contentEl.innerHTML = fullScript;
		previewEl.innerHTML = '<div class="voice-script-preview">' + fullScript + '</div>';
	}
	
	window.updateVoicePreview = syncScriptToReadMode;
}

function processMarkers(text) {
	let processed = text.replace(/\n/g, '<br>');
	// Replace [PAUSE] with a stylized badge
	processed = processed.replace(/\[PAUSE\]/gi, '<span class="read-pause-badge">⏱ PAUSE</span>');
	// Replace **Text** with emphasis
	processed = processed.replace(/\*\*(.*?)\*\*/g, '<span class="read-emphasis-text">$1</span>');
	return processed;
}

document.addEventListener('DOMContentLoaded', initVoice);
