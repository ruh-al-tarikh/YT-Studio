/**
 * Script Studio Module
 * Handles script writing, metrics, timeline beats, and AI assistance
 */

// ============================================
// SCRIPT STUDIO HTML TEMPLATE (Single Declaration)
// ============================================

const SCRIPT_HTML = `
<div class="script-studio-container">
    <div class="script-editor-main">
        <div class="section-heading flex-between">
            <div>
                <h2 class="section-title">Script Studio</h2>
                <p class="section-copy">Draft your documentary script with structured sections.</p>
            </div>
            <div class="script-tools">
                <button class="secondary-button small" id="toggleFocusMode" title="Focus Mode">
                    <i class="fa-solid fa-expand"></i> Focus
                </button>
                <button class="secondary-button small" id="insertPauseBtn" title="Insert Pause Marker">
                    ⏱ Add Pause
                </button>
                <button class="secondary-button small" id="insertEmphasisBtn" title="Emphasis">
                    <strong>B</strong>
                </button>
            </div>
        </div>

        <div class="timeline-mapper-container mb-6">
            <h3 class="text-sm font-bold mb-3">
                <i class="fa-solid fa-route mr-2"></i> Timeline Mapper (Visual Beats)
            </h3>
            <div id="timelineBeats" class="timeline-beats-grid" style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem;"></div>
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
            <div class="metric-row"><span class="metric-label">Word Count:</span><span class="metric-value" id="scriptWordCount">0</span></div>
            <div class="metric-row"><span class="metric-label">Est. Duration:</span><span class="metric-value" id="scriptDuration">0:00</span></div>
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
</div>
<div id="focusModeOverlay" class="focus-mode-overlay" aria-hidden="true">
    <button id="exitFocusMode" class="icon-button" aria-label="Exit Focus Mode"><i class="fa-solid fa-compress"></i></button>
    <div class="focus-editor-container">
        <h2 id="focusTitle">Hook</h2>
        <textarea id="focusTextArea" class="focus-textarea"></textarea>
        <div class="focus-footer"><span id="focusMetrics">0 words</span></div>
    </div>
</div>
`;

// ============================================
// INITIALIZATION
// ============================================

function initScriptStudio() {
    const container = document.getElementById('ptab-script');
    if (!container || container.querySelector('.script-studio-container')) return;
    
    container.innerHTML = SCRIPT_HTML;
    
    initTextAreas();
    initButtons();
    loadTimelineBeats();
    updateMetrics();
}

function initTextAreas() {
    document.querySelectorAll('.script-textarea').forEach(ta => {
        const section = ta.dataset.section;
        const saved = localStorage.getItem(`script_section_${section}`);
        if (saved) ta.value = saved;
        
        ta.addEventListener('input', (e) => {
            localStorage.setItem(`script_section_${section}`, e.target.value);
            updateMetrics();
        });
        
        ta.addEventListener('mouseup', () => {
            const selected = ta.value.substring(ta.selectionStart, ta.selectionEnd).trim();
            if (selected.length > 5) showMappingPopup(ta, selected);
            else hideMappingPopup();
        });
    });
}

function initButtons() {
    document.getElementById('insertPauseBtn')?.addEventListener('click', () => insertAtCursor(' [PAUSE] '));
    document.getElementById('insertEmphasisBtn')?.addEventListener('click', () => insertAtCursor(' ** **'));
    document.getElementById('toggleFocusMode')?.addEventListener('click', toggleFocusMode);
    document.getElementById('exitFocusMode')?.addEventListener('click', exitFocusMode);
    document.getElementById('addBeatBtn')?.addEventListener('click', () => addTimelineBeat('New Beat'));
}

// ============================================
// FOCUS MODE
// ============================================

let activeTextarea = null;

function toggleFocusMode() {
    const active = document.activeElement;
    if (!active?.classList?.contains('script-textarea')) {
        alert('Please click inside a section to focus.');
        return;
    }
    
    activeTextarea = active;
    const overlay = document.getElementById('focusModeOverlay');
    const title = document.getElementById('focusTitle');
    const textarea = document.getElementById('focusTextArea');
    
    const label = active.closest('.script-section-block')?.querySelector('label');
    if (title && label) title.textContent = label.textContent;
    if (textarea) {
        textarea.value = active.value;
        textarea.addEventListener('input', updateFocusMetrics);
    }
    if (overlay) {
        overlay.setAttribute('aria-hidden', 'false');
        overlay.classList.add('show');
        textarea?.focus();
        updateFocusMetrics();
    }
}

function exitFocusMode() {
    const overlay = document.getElementById('focusModeOverlay');
    const textarea = document.getElementById('focusTextArea');
    
    if (activeTextarea && textarea) {
        activeTextarea.value = textarea.value;
        activeTextarea.dispatchEvent(new Event('input'));
    }
    if (overlay) {
        overlay.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('show');
    }
    activeTextarea = null;
}

// ============================================
// TIMELINE BEATS
// ============================================

function addTimelineBeat(text = 'New Beat') {
    const container = document.getElementById('timelineBeats');
    if (!container) return;
    
    const beat = document.createElement('div');
    beat.className = 'timeline-beat';
    beat.innerHTML = `<input type="text" value="${escapeHtml(text)}" class="beat-input" style="background:transparent; border:none; width:100px; font-size:0.8rem; font-weight:600;">`;
    container.appendChild(beat);
    beat.querySelector('input').addEventListener('input', saveTimelineBeats);
    saveTimelineBeats();
}

function saveTimelineBeats() {
    const beats = Array.from(document.querySelectorAll('.beat-input')).map(i => i.value);
    localStorage.setItem('timeline_beats', JSON.stringify(beats));
}

function loadTimelineBeats() {
    const saved = JSON.parse(localStorage.getItem('timeline_beats') || '[]');
    const container = document.getElementById('timelineBeats');
    if (container) container.innerHTML = '';
    
    if (saved.length === 0) {
        ['Hook', 'Exposition', 'Climax', 'Resolution'].forEach(t => addTimelineBeat(t));
    } else {
        saved.forEach(t => addTimelineBeat(t));
    }
}

// ============================================
// METRICS
// ============================================

function updateMetrics() {
    let allText = '';
    document.querySelectorAll('.script-textarea').forEach(ta => allText += ta.value + ' ');
    const words = allText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const mins = Math.floor(words / 130);
    const secs = Math.floor((words % 130) / (130 / 60));
    
    const wordEl = document.getElementById('scriptWordCount');
    const durEl = document.getElementById('scriptDuration');
    if (wordEl) wordEl.textContent = words;
    if (durEl) durEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateFocusMetrics() {
    const ta = document.getElementById('focusTextArea');
    if (!ta) return;
    const words = ta.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    const metrics = document.getElementById('focusMetrics');
    if (metrics) metrics.textContent = `${words} words`;
}

// ============================================
// UTILITIES
// ============================================

function insertAtCursor(text) {
    const active = document.activeElement;
    if (!active?.classList?.contains('script-textarea') && !active?.classList?.contains('focus-textarea')) {
        alert('Please focus on a text area first.');
        return;
    }
    
    const start = active.selectionStart;
    const end = active.selectionEnd;
    const value = active.value;
    active.value = value.substring(0, start) + text + value.substring(end);
    active.selectionStart = active.selectionEnd = start + text.length;
    active.focus();
    updateMetrics();
}

function showMappingPopup(element, selectedText) {
    let popup = document.getElementById('mappingPopup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'mappingPopup';
        popup.className = 'mapping-popup';
        popup.innerHTML = '<button id="linkRefBtn"><i class="fa-solid fa-book-quran"></i> Link to Reference</button>';
        document.body.appendChild(popup);
    }
    
    const rect = element.getBoundingClientRect();
    popup.style.display = 'block';
    popup.style.top = `${window.scrollY + rect.top - 40}px`;
    popup.style.left = `${window.scrollX + rect.left + 20}px`;
    
    document.getElementById('linkRefBtn').onclick = () => {
        document.querySelector('.studio-nav-btn[data-tab="islamic"]')?.click();
        hideMappingPopup();
    };
}

function hideMappingPopup() {
    const popup = document.getElementById('mappingPopup');
    if (popup) popup.style.display = 'none';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================
// EXPORTS & INIT
// ============================================

document.addEventListener('DOMContentLoaded', initScriptStudio);
export { initScriptStudio };