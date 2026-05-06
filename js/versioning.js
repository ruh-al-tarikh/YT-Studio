let VERSION_KEY="yt_studio_script_versions";function initVersioning(){var e,t=document.querySelector(".script-tools");t&&((e=document.createElement("button")).className="secondary-button small",e.title="Version History",e.innerHTML='<i class="fa-solid fa-clock-rotate-left"></i> History',e.addEventListener("click",showHistoryModal),t.prepend(e)),setInterval(saveVersion,3e4),document.addEventListener("keydown",e=>{var t;(e.ctrlKey||e.metaKey)&&"s"===e.key&&(t=document.getElementById("studio-root"))&&"block"===t.style.display&&(e.preventDefault(),saveVersion(!0))})}function saveVersion(t=!1){var o=document.querySelectorAll(".script-textarea");let s={},i=!1;if(o.forEach(e=>{s[e.dataset.section]=e.value.trim(),0<e.value.trim().length&&(i=!0)}),i){let e=JSON.parse(localStorage.getItem(VERSION_KEY)||"[]");if(0<e.length){o=e[0];if(JSON.stringify(o.content)===JSON.stringify(s))return void(t&&alert("No changes to save."))}e.unshift({time:Date.now(),content:s,manual:t}),20<e.length&&(e=e.slice(0,20)),localStorage.setItem(VERSION_KEY,JSON.stringify(e)),t&&alert("Script saved successfully!")}}function showHistoryModal(){var e=JSON.parse(localStorage.getItem(VERSION_KEY)||"[]");let s=`
		<div id="historyModal" class="ai-modal show" aria-hidden="false">
			<div class="ai-modal-content">
				<div class="ai-modal-header">
					<h3><i class="fa-solid fa-clock-rotate-left"></i> Version History</h3>
					<button onclick="document.getElementById('historyModal').remove()" class="icon-button"><i class="fa-solid fa-xmark"></i></button>
				</div>
				<div class="ai-modal-body">
	`;0===e.length?s+='<p class="text-soft text-center">No history yet. Start typing to auto-save.</p>':(s+='<div class="history-list" style="display:flex; flex-direction:column; gap:12px;">',e.forEach((e,t)=>{var o=new Date(e.time).toLocaleString();s+=`
				<div class="history-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid var(--line-soft); border-radius:8px;">
					<div>
						<strong>${e.manual?"Manual Save":"Auto Save"}</strong>
						<div class="text-sm text-soft">${o}</div>
					</div>
					<button class="secondary-button small" onclick="restoreVersion(${t})">Restore</button>
				</div>
			`}),s+="</div>"),s+=`
				</div>
			</div>
		</div>
	`,document.body.insertAdjacentHTML("beforeend",s)}window.restoreVersion=function(e){if(confirm("Are you sure you want to restore this version? Current unsaved changes will be lost.")){let o=JSON.parse(localStorage.getItem(VERSION_KEY)||"[]")[e];o&&(document.querySelectorAll(".script-textarea").forEach(e=>{var t=e.dataset.section;e.value=o.content[t]||"",e.dispatchEvent(new Event("input"))}),document.getElementById("historyModal")?.remove(),alert("Version restored."))}},document.addEventListener("DOMContentLoaded",()=>{setTimeout(initVersioning,500)});export{initVersioning};