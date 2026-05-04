// Automation and Export Tools

export function initAutomation() {
	const exportBtn = document.getElementById('exportProjectBtn');
	
	if (exportBtn) {
		exportBtn.addEventListener('click', () => {
			showExportOptions();
		});
	}
}

function showExportOptions() {
	// Simple mock modal for export options
	const html = `
		<div id="exportModal" class="ai-modal show" aria-hidden="false">
			<div class="ai-modal-content" style="max-width: 400px;">
				<div class="ai-modal-header">
					<h3><i class="fa-solid fa-file-export"></i> Export Project</h3>
					<button onclick="document.getElementById('exportModal').remove()" class="icon-button"><i class="fa-solid fa-xmark"></i></button>
				</div>
				<div class="ai-modal-body">
					<button class="secondary-button full-width mb-3" onclick="exportToTXT()">Export as TXT</button>
					<button class="secondary-button full-width mb-3" onclick="alert('PDF Export generated!')">Export as PDF</button>
					<button class="primary-button full-width" onclick="alert('Metadata packaged for YouTube upload!')">Upload-Ready Format</button>
				</div>
			</div>
		</div>
	`;
	document.body.insertAdjacentHTML('beforeend', html);
}

window.exportToTXT = function() {
	const textareas = document.querySelectorAll('.script-textarea');
	let content = "PROJECT SCRIPT\\n\\n";
	
	textareas.forEach(ta => {
		const section = ta.previousElementSibling ? ta.previousElementSibling.textContent : '';
		if (ta.value.trim()) {
			content += `--- ${section} ---\n`;
			content += ta.value.trim() + "\\n\\n";
		}
	});

	if (content.trim() === "PROJECT SCRIPT") {
		alert('Script is empty!');
		return;
	}

	const blob = new Blob([content], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'Script_Export.txt';
	a.click();
	URL.revokeObjectURL(url);
	
	document.getElementById('exportModal')?.remove();
}

document.addEventListener('DOMContentLoaded', initAutomation);
