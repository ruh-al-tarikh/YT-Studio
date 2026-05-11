let RESEARCH_HTML=`
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
`,researchNotes=JSON.parse(localStorage.getItem("yt_studio_research")||"[]");function initResearch(){var e=document.getElementById("ptab-research");if(e){e.innerHTML=RESEARCH_HTML,e=document.getElementById("saveResearchBtn");let t=document.getElementById("researchInput"),a=document.getElementById("researchTag");e.addEventListener("click",()=>{var e=t.value.trim();e&&(e={id:Date.now(),text:e,tag:a.value,date:(new Date).toLocaleDateString()},researchNotes.unshift(e),localStorage.setItem("yt_studio_research",JSON.stringify(researchNotes)),t.value="",renderNotes())}),renderNotes()}}function escapeHTML(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function renderNotes(){var e=document.getElementById("researchGrid");e&&(0===researchNotes.length?e.innerHTML=`
			<div class="empty-state-card" style="grid-column: 1 / -1;">
				<i class="fa-solid fa-book-open"></i>
				<h3>No research notes yet</h3>
				<p>Start pasting text or links above.</p>
			</div>
		`:(e.innerHTML=researchNotes.map(e=>`
		<div class="research-card">
			<div class="research-card-header">
				<span class="research-tag tag-${e.tag.toLowerCase()}">${e.tag}</span>
				<div class="research-card-actions">
					<button class="icon-button small copy-note-btn" data-text="${encodeURIComponent(e.text)}" title="Copy"><i class="fa-regular fa-copy"></i></button>
					<button class="icon-button small delete-note-btn" data-id="${e.id}" title="Delete"><i class="fa-solid fa-trash"></i></button>
				</div>
			</div>
			<p class="research-card-text">${escapeHTML(e.text).replace(/\n/g,"<br>")}</p>
			<div class="research-card-footer">
				<span class="research-date">${e.date}</span>
			</div>
		</div>
	`).join(""),e.querySelectorAll(".copy-note-btn").forEach(e=>{e.addEventListener("click",e=>{e=decodeURIComponent(e.currentTarget.dataset.text),navigator.clipboard.writeText(e),showToast("Copied research note!")})}),e.querySelectorAll(".delete-note-btn").forEach(e=>{e.addEventListener("click",e=>{let t=parseInt(e.currentTarget.dataset.id);researchNotes=researchNotes.filter(e=>e.id!==t),localStorage.setItem("yt_studio_research",JSON.stringify(researchNotes)),renderNotes()})})))}function showToast(e){let t=document.getElementById("toast");t&&(t.textContent=e,t.classList.add("show"),setTimeout(()=>t.classList.remove("show"),3e3))}document.addEventListener("DOMContentLoaded",initResearch);export{initResearch};