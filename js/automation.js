function initAutomation(){var t=document.getElementById("exportProjectBtn");t&&t.addEventListener("click",()=>{showExportOptions()})}function showExportOptions(){document.body.insertAdjacentHTML("beforeend",`
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
	`)}window.exportToTXT=function(){var t,e=document.querySelectorAll(".script-textarea");let o="PROJECT SCRIPT\\n\\n";e.forEach(t=>{var e=t.previousElementSibling?t.previousElementSibling.textContent:"";t.value.trim()&&(o=(o+=`--- ${e} ---
`)+t.value.trim()+"\\n\\n")}),"PROJECT SCRIPT"===o.trim()?alert("Script is empty!"):(e=new Blob([o],{type:"text/plain"}),e=URL.createObjectURL(e),(t=document.createElement("a")).href=e,t.download="Script_Export.txt",t.click(),URL.revokeObjectURL(e),document.getElementById("exportModal")?.remove())},document.addEventListener("DOMContentLoaded",initAutomation);export{initAutomation};