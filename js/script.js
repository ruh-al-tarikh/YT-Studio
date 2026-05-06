let SCRIPT_HTML=`
<div class="script-studio-container">
    <div class="script-editor-main">
        <div class="section-heading flex-between">
            <div>
                <h2 class="section-title">Script Studio</h2>
                <p class="section-copy">Draft your documentary script with structured sections.</p>
            </div>
            <div class="script-tools">
                <button class="secondary-button small" id="toggleFocusMode" title="Focus Mode"><i class="fa-solid fa-expand"></i> Focus</button>
                <button class="secondary-button small" id="insertPauseBtn" title="Insert Pause Marker">⏱ Add Pause</button>
                <button class="secondary-button small" id="insertEmphasisBtn" title="Emphasis"><strong>B</strong></button>
            </div>
        </div>

        <!-- Timeline Mapper -->
        <div class="timeline-mapper-container mb-6">
            <h3 class="text-sm font-bold mb-3"><i class="fa-solid fa-route mr-2"></i> Timeline Mapper (Visual Beats)</h3>
            <div id="timelineBeats" class="timeline-beats-grid" style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem;">
                <!-- Dynamically populated -->
            </div>
            <button class="pill-button small" id="addBeatBtn"><i class="fa-solid fa-plus"></i> Add Beat</button>
        </div>

        <div class="script-sections">
            <div class="script-section-block">
                <label>1. The Hook (0:00 - 0:30)</label>
                <textarea class="script-textarea" data-section="hook" placeholder="Start with a compelling question or statement..."></textarea>
            </div>
            <div class="script-section-block">
                <label>2. The Story / Context</label>
                <textarea class="script-textarea" data-section="story" placeholder="Explain the historical background..."></textarea>
            </div>
            <div class="script-section-block">
                <label>3. Core Lesson / Evidence</label>
                <textarea class="script-textarea" data-section="lesson" placeholder="Provide evidence, Quran/Hadith references..."></textarea>
            </div>
            <div class="script-section-block">
                <label>4. Outro & Call to Action</label>
                <textarea class="script-textarea" data-section="outro" placeholder="Conclude the video..."></textarea>
            </div>
        </div>
    </div>

    <aside class="script-sidebar glass-panel">
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
        </div>
        <div class="ai-assistant-card" id="aiAssistantContainer">
            <h3>AI Assistant</h3>
            <p class="text-sm text-soft mb-3">Highlight text to rewrite or translate.</p>
            <div class="ai-actions">
                <button class="secondary-button full-width mb-2" id="aiTranslateBtn"><i class="fa-solid fa-language"></i> Translate to Tamil</button>
                <button class="secondary-button full-width" id="aiImproveBtn"><i class="fa-solid fa-wand-magic-sparkles"></i> Improve Phrasing</button>
            </div>
        </div>
    </aside>
</div>`;

function initScriptStudio() {
    const container = document.getElementById("ptab-script");
    if (!container || container.querySelector('.script-studio-container')) return;

    container.innerHTML = SCRIPT_HTML;

    const textareas = container.querySelectorAll(".script-textarea");
    textareas.forEach(ta => {
        // Load saved content
        const section = ta.dataset.section;
        ta.value = localStorage.getItem(`script_section_${section}`) || "";

        ta.addEventListener("input", (e) => {
            localStorage.setItem(`script_section_${section}`, e.target.value);
            updateMetrics();
        });
    });

    document.getElementById("addBeatBtn")?.addEventListener("click", () => addTimelineBeat());
    loadTimelineBeats();
    updateMetrics();
}

function addTimelineBeat(text = "New Beat") {
    const beatsContainer = document.getElementById("timelineBeats");
    const beat = document.createElement("div");
    beat.className = "timeline-beat";
    beat.innerHTML = `<input type="text" value="${text}" class="beat-input" style="background:transparent; border:none; width:100px; font-size:0.8rem; font-weight:600;">`;
    beatsContainer.appendChild(beat);

    beat.querySelector('input').addEventListener('input', saveTimelineBeats);
    saveTimelineBeats();
}

function saveTimelineBeats() {
    const beats = Array.from(document.querySelectorAll('.beat-input')).map(input => input.value);
    localStorage.setItem('timeline_beats', JSON.stringify(beats));
}

function loadTimelineBeats() {
    const saved = JSON.parse(localStorage.getItem('timeline_beats') || "[]");
    const container = document.getElementById("timelineBeats");
    if (container) container.innerHTML = "";
    if (saved.length === 0) {
        ["Hook", "Exposition", "Climax", "Resolution"].forEach(t => addTimelineBeat(t));
    } else {
        saved.forEach(t => addTimelineBeat(t));
    }
}

function updateMetrics() {
    let allText = "";
    document.querySelectorAll(".script-textarea").forEach(ta => allText += ta.value + " ");
    const words = allText.trim().split(/\s+/).filter(w => w.length > 0).length;

    const countEl = document.getElementById("scriptWordCount");
    if (countEl) countEl.textContent = words;

    const mins = Math.floor(words / 130);
    const secs = Math.floor((words % 130) / (130 / 60));
    const durEl = document.getElementById("scriptDuration");
    if (durEl) durEl.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
}

document.addEventListener("DOMContentLoaded", initScriptStudio);
export { initScriptStudio };
let SCRIPT_HTML='<div class="script-studio-container"><div class="script-editor-main"><div class="section-heading flex-between"><div><h2 class="section-title">Script Studio</h2><p class="section-copy">Draft your documentary script with structured sections.</p></div><div class="script-tools"><button class="secondary-button small" id="toggleFocusMode" title="Focus Mode"><i class="fa-solid fa-expand"></i> Focus</button><button class="secondary-button small" id="insertPauseBtn" title="Insert Pause Marker">⏱ Add Pause</button><button class="secondary-button small" id="insertEmphasisBtn" title="Emphasis"><strong>B</strong></button></div></div><div class="script-sections"><div class="script-section-block"><label>1. The Hook (0:00 - 0:30)</label><textarea class="script-textarea" data-section="hook" placeholder="Start with a compelling question or statement in Tamil..."></textarea></div><div class="script-section-block"><label>2. The Story / Context</label><textarea class="script-textarea" data-section="story" placeholder="Explain the historical background or context..."></textarea></div><div class="script-section-block"><label>3. Core Lesson / Evidence</label><textarea class="script-textarea" data-section="lesson" placeholder="Provide evidence, Quran/Hadith references, and main arguments..."></textarea></div><div class="script-section-block"><label>4. Outro & Call to Action</label><textarea class="script-textarea" data-section="outro" placeholder="Conclude the video and ask for subscriptions..."></textarea></div></div></div><aside class="script-sidebar"><div class="metrics-card"><h3>Live Metrics</h3><div class="metric-row"><span class="metric-label">Word Count:</span><span class="metric-value" id="scriptWordCount">0</span></div><div class="metric-row"><span class="metric-label">Est. Duration:</span><span class="metric-value" id="scriptDuration">0:00</span></div><div class="metric-row"><span class="metric-label">Reading Pace:</span><span class="metric-value text-accent">Moderate</span></div></div><div class="ai-assistant-card" id="aiAssistantContainer"><h3>AI Assistant</h3><p class="text-sm text-soft mb-3">Highlight text to rewrite or translate.</p><div class="ai-actions"><button class="secondary-button full-width mb-2" id="aiTranslateBtn"><i class="fa-solid fa-language"></i> Translate to Tamil</button><button class="secondary-button full-width" id="aiImproveBtn"><i class="fa-solid fa-wand-magic-sparkles"></i> Improve Phrasing</button></div></div></aside></div><div id="focusModeOverlay" class="focus-mode-overlay" aria-hidden="true"><button id="exitFocusMode" class="icon-button" aria-label="Exit Focus Mode" title="Exit Focus Mode"><i class="fa-solid fa-compress"></i></button><div class="focus-editor-container"><h2 id="focusTitle">Hook</h2><textarea id="focusTextArea" class="focus-textarea"></textarea><div class="focus-footer"><span id="focusMetrics">0 words</span></div></div></div>';function initScriptStudio(){var t=document.getElementById("ptab-script");if(t){t.innerHTML=SCRIPT_HTML,t.querySelectorAll(".script-textarea").forEach(e=>{e.addEventListener("input",updateMetrics),e.addEventListener("mouseup",()=>{var t=e.value.substring(e.selectionStart,e.selectionEnd).trim();5<t.length?showMappingPopup(e,t):hideMappingPopup()})}),document.getElementById("insertPauseBtn")?.addEventListener("click",()=>insertAtCursor(" [PAUSE] ")),document.getElementById("insertEmphasisBtn")?.addEventListener("click",()=>insertAtCursor(" ** **"));let e=document.getElementById("focusModeOverlay"),s=document.getElementById("focusTextArea"),a=document.getElementById("focusTitle"),i=null;document.getElementById("toggleFocusMode")?.addEventListener("click",()=>{var t=document.activeElement;t&&t.classList.contains("script-textarea")?(i=t,a.textContent=t.closest(".script-section-block").querySelector("label").textContent,s.value=t.value,e.setAttribute("aria-hidden","false"),e.classList.add("show"),s.focus(),updateFocusMetrics()):alert("Please click inside a section to focus.")}),document.getElementById("exitFocusMode")?.addEventListener("click",()=>{i&&(i.value=s.value,i.dispatchEvent(new Event("input"))),e.setAttribute("aria-hidden","true"),e.classList.remove("show")}),s.addEventListener("input",updateFocusMetrics),updateMetrics()}}function showMappingPopup(t,e){let s=document.getElementById("mappingPopup");s||((s=document.createElement("div")).id="mappingPopup",s.className="mapping-popup",s.innerHTML='<button id="linkRefBtn"><i class="fa-solid fa-book-quran"></i> Link to Reference</button>',document.body.appendChild(s));t=t.getBoundingClientRect();s.style.display="block",s.style.top=window.scrollY+t.top-40+"px",s.style.left=window.scrollX+t.left+20+"px",document.getElementById("linkRefBtn").onclick=()=>{var t=document.querySelector('.studio-nav-btn[data-tab="islamic"]');t&&t.click(),hideMappingPopup()}}function hideMappingPopup(){var t=document.getElementById("mappingPopup");t&&(t.style.display="none")}function updateMetrics(){var t=document.querySelectorAll(".script-textarea");let e="";t.forEach(t=>e+=t.value+" ");var t=e.trim().split(/\s+/).filter(t=>0<t.length).length,s=document.getElementById("scriptWordCount"),s=(s&&(s.textContent=t),Math.floor(t/130)),t=Math.floor(t%130/(130/60)),a=document.getElementById("scriptDuration");a&&(a.textContent=s+":"+t.toString().padStart(2,"0"))}function updateFocusMetrics(){var e=document.getElementById("focusTextArea");if(e){let t=e.value.trim().split(/\s+/).filter(t=>0<t.length).length;e=document.getElementById("focusMetrics");e&&(e.textContent=t+" words")}let t=document.getElementById("focusTextArea").value.trim().split(/\s+/).filter(t=>0<t.length).length;document.getElementById("focusMetrics").textContent=t+" words"}function insertAtCursor(t){var e,s,a,i=document.activeElement;i&&(i.classList.contains("script-textarea")||i.classList.contains("focus-textarea"))?(e=i.selectionStart,s=i.selectionEnd,a=i.value,i.value=a.substring(0,e)+t+a.substring(s),i.selectionStart=i.selectionEnd=e+t.length,i.focus(),updateMetrics()):alert("Please focus on a text area first to insert markers.")}document.addEventListener("DOMContentLoaded",initScriptStudio);export{initScriptStudio};
