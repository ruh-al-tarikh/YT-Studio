let AI_MODAL_HTML=`
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
`;function escapeHTML(t){return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function initAI(){document.getElementById("aiModal")||((t=document.createElement("div")).innerHTML=AI_MODAL_HTML,document.body.appendChild(t));let a=document.getElementById("aiModal");var t=document.getElementById("closeAiModal");let i=document.getElementById("generateAiBtn"),n=document.getElementById("aiResultsArea"),l=document.getElementById("aiVariationsList"),o=document.getElementById("floatingAiToolbar");t.addEventListener("click",()=>{a.setAttribute("aria-hidden","true"),a.classList.remove("show")}),i.addEventListener("click",()=>{i.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Generating...',i.disabled=!0,setTimeout(()=>{i.innerHTML='<i class="fa-solid fa-bolt"></i> Generate',i.disabled=!1,n.style.display="block";var t=document.getElementById("aiActionSelect").value,e=[],e="translate"===t?["வரலாற்றில் ஒரு புதிய அத்தியாயம் தொடங்குகிறது...","இந்த சம்பவத்தின் பின்னணியில் உள்ள ரகசியம் என்ன?"]:"hook"===t?["Have you ever wondered what really happened during the fall of the empire?","The truth they didn't teach you in history class."]:"title"===t?["The Lost Dynasty: Secrets of the Silk Road","Beyond the Empire: A Story of Survival"]:["Here is an expanded variation of your story that adds more cinematic details and emotional depth.","A simpler way to explain this is: The event changed the course of history by shifting the balance of power."];l.innerHTML=e.map((t,e)=>`
				<div class="ai-variation-card">
					<p>${escapeHTML(t)}</p>
					<button class="secondary-button small insert-ai-btn" data-text="${encodeURIComponent(t)}">Insert</button>
				</div>
			`).join(""),document.querySelectorAll(".insert-ai-btn").forEach(t=>{t.addEventListener("click",t=>{insertIntoActiveEditor(decodeURIComponent(t.currentTarget.dataset.text)),a.setAttribute("aria-hidden","true"),a.classList.remove("show")})})},1200)}),document.addEventListener("mouseup",()=>{var t=window.getSelection();3<t.toString().trim().length?(t=t.getRangeAt(0).getBoundingClientRect(),o.style.top=t.top+window.scrollY-50+"px",o.style.left=t.left+window.scrollX+t.width/2+"px",o.style.display="flex"):o.style.display="none"}),document.querySelectorAll(".ai-tool-btn").forEach(t=>{t.addEventListener("click",t=>{var t=t.currentTarget.dataset.action,e=window.getSelection().toString();document.getElementById("aiActionSelect").value="improve"===t?"expand":t,document.getElementById("aiInputText").value=e,a.setAttribute("aria-hidden","false"),a.classList.add("show"),o.style.display="none"})}),document.addEventListener("click",t=>{(t=t.target.closest("#aiTranslateBtn")||t.target.closest("#aiImproveBtn"))&&(t="aiTranslateBtn"===t.id?"translate":"simplify",document.getElementById("aiActionSelect").value=t,a.setAttribute("aria-hidden","false"),a.classList.add("show"))})}function insertIntoActiveEditor(t){var e,a,i=document.querySelectorAll(".script-textarea, .focus-textarea");let n=null;i.forEach(t=>{document.activeElement===t&&(n=t)}),(n=!n&&0<i.length?i[0]:n)&&(i=n.selectionStart,e=n.selectionEnd,a=n.value,n.value=a.substring(0,i)+t+a.substring(e),n.dispatchEvent(new Event("input")))}document.addEventListener("DOMContentLoaded",initAI);export{initAI};