let VOICE_HTML=`
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
`;function initVoice(){if(n=document.getElementById("ptab-voice")){n.innerHTML=VOICE_HTML;let e=document.getElementById("readModeOverlay");var n=document.getElementById("startReadModeBtn"),c=document.getElementById("closeReadModeBtn");let i=document.getElementById("readModeContent"),a=document.getElementById("voicePreviewArea"),t=32;n.addEventListener("click",()=>{e.setAttribute("aria-hidden","false"),e.classList.add("show"),document.body.style.overflow="hidden",r()}),c.addEventListener("click",()=>{e.setAttribute("aria-hidden","true"),e.classList.remove("show"),document.body.style.overflow="",l()}),document.getElementById("fontIncBtn").addEventListener("click",()=>{t+=4,i.style.fontSize=t+"px"}),document.getElementById("fontDecBtn").addEventListener("click",()=>{t=Math.max(16,t-4),i.style.fontSize=t+"px"});let d,s=!1,o=document.getElementById("autoScrollBtn");function l(){s=!1,o.classList.remove("active"),o.innerHTML='<i class="fa-solid fa-angles-down"></i> Auto-Scroll',clearInterval(d)}function r(){let e=document.querySelectorAll(".script-textarea"),t="";e.forEach(e=>{e.value.trim()&&(t+="<div>"+processMarkers(e.value.trim())+"</div><br>")}),t=t||'<p class="text-center text-soft" style="margin-top:20vh;">No script written yet. Go to Script Studio.</p>',i.innerHTML=t,a.innerHTML='<div class="voice-script-preview">'+t+"</div>"}o.addEventListener("click",()=>{s?l():(s=!0,o.classList.add("active"),o.innerHTML='<i class="fa-solid fa-pause"></i> Stop Scroll',d=setInterval(()=>{document.querySelector(".read-mode-content-wrapper").scrollTop+=1},30))}),window.updateVoicePreview=r}}function processMarkers(e){let t=e.replace(/\n/g,"<br>");return t=(t=t.replace(/\[PAUSE\]/gi,'<span class="read-pause-badge">⏱ PAUSE</span>')).replace(/\*\*(.*?)\*\*/g,'<span class="read-emphasis-text">$1</span>')}document.addEventListener("DOMContentLoaded",initVoice);export{initVoice};