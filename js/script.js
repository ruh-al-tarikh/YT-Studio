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
