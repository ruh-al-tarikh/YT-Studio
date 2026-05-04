// Script Versioning

const VERSION_KEY = 'yt_studio_script_versions';

export function initVersioning() {
	// Add version history UI to Script Studio
	const toolsArea = document.querySelector('.script-tools');
	if (toolsArea) {
		const historyBtn = document.createElement('button');
		historyBtn.className = 'secondary-button small';
		historyBtn.title = 'Version History';
		historyBtn.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> History';
		historyBtn.addEventListener('click', showHistoryModal);
		toolsArea.prepend(historyBtn);
	}

	// Auto-save every 30 seconds if changed
	setInterval(saveVersion, 30000);
	
	// Also save on manual Ctrl+S
	document.addEventListener('keydown', (e) => {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			// Only intercept if we are in studio mode
			const studioRoot = document.getElementById('studio-root');
			if (studioRoot && studioRoot.style.display === 'block') {
				e.preventDefault();
				saveVersion(true);
			}
		}
	});
}

function saveVersion(manual = false) {
	const textareas = document.querySelectorAll('.script-textarea');
	let content = {};
	let hasContent = false;
	
	textareas.forEach(ta => {
		content[ta.dataset.section] = ta.value.trim();
		if (ta.value.trim().length > 0) hasContent = true;
	});

	if (!hasContent) return;

	let versions = JSON.parse(localStorage.getItem(VERSION_KEY) || '[]');
	
	// Simple diff check to avoid saving identical versions
	if (versions.length > 0) {
		const last = versions[0];
		if (JSON.stringify(last.content) === JSON.stringify(content)) {
			if (manual) alert('No changes to save.');
			return; // No changes
		}
	}

	versions.unshift({
		time: Date.now(),
		content: content,
		manual: manual
	});

	// Keep last 20 versions
	if (versions.length > 20) versions = versions.slice(0, 20);

	localStorage.setItem(VERSION_KEY, JSON.stringify(versions));
	if (manual) {
		alert('Script saved successfully!');
	} else {
		// subtle toast could go here
	}
}

function showHistoryModal() {
	const versions = JSON.parse(localStorage.getItem(VERSION_KEY) || '[]');
	
	let html = `
		<div id="historyModal" class="ai-modal show" aria-hidden="false">
			<div class="ai-modal-content">
				<div class="ai-modal-header">
					<h3><i class="fa-solid fa-clock-rotate-left"></i> Version History</h3>
					<button onclick="document.getElementById('historyModal').remove()" class="icon-button"><i class="fa-solid fa-xmark"></i></button>
				</div>
				<div class="ai-modal-body">
	`;

	if (versions.length === 0) {
		html += `<p class="text-soft text-center">No history yet. Start typing to auto-save.</p>`;
	} else {
		html += '<div class="history-list" style="display:flex; flex-direction:column; gap:12px;">';
		versions.forEach((v, idx) => {
			const date = new Date(v.time).toLocaleString();
			html += `
				<div class="history-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--line-soft); border-radius:8px;">
					<div>
						<strong>${v.manual ? 'Manual Save' : 'Auto Save'}</strong>
						<div class="text-sm text-soft">${date}</div>
					</div>
					<button class="secondary-button small" onclick="restoreVersion(${idx})">Restore</button>
				</div>
			`;
		});
		html += '</div>';
	}

	html += `
				</div>
			</div>
		</div>
	`;
	document.body.insertAdjacentHTML('beforeend', html);
}

window.restoreVersion = function(idx) {
	if(!confirm('Are you sure you want to restore this version? Current unsaved changes will be lost.')) return;

	const versions = JSON.parse(localStorage.getItem(VERSION_KEY) || '[]');
	const target = versions[idx];
	if (!target) return;

	const textareas = document.querySelectorAll('.script-textarea');
	textareas.forEach(ta => {
		const sec = ta.dataset.section;
		ta.value = target.content[sec] || '';
		ta.dispatchEvent(new Event('input')); // Trigger word count updates
	});

	document.getElementById('historyModal')?.remove();
	alert('Version restored.');
}

// Hook up into the tab render cycle, we use DOMContentLoaded with a small delay to ensure script DOM is there
document.addEventListener('DOMContentLoaded', () => {
	setTimeout(initVersioning, 500);
});
