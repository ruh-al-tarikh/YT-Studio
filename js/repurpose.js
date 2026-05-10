let REPURPOSE_HTML=`
<div class="repurpose-container">
	<div class="section-heading">
		<h2 class="section-title">Repurpose Content</h2>
		<p class="section-copy">Generate Shorts, Quotes, and Community Posts from your script automatically.</p>
	</div>

	<div class="repurpose-actions mb-4">
		<button id="generateRepurposeBtn" class="primary-button"><i class="fa-solid fa-wand-magic-sparkles"></i> Auto-Extract Content</button>
	</div>

	<div class="repurpose-grid" id="repurposeGrid" style="display: none;">
		
		<div class="repurpose-card">
			<div class="repurpose-header">
				<h3><i class="fa-brands fa-youtube" style="color:red"></i> YT Shorts Script</h3>
				<button class="icon-button small copy-rep-btn" title="Copy"><i class="fa-regular fa-copy"></i></button>
			</div>
			<textarea id="shortsScript" class="repurpose-textarea" readonly>
Hook: The greatest untold story of the 7th century.
Context: While empires clashed, a small group changed the world.
Payoff: Subscribe to uncover the full truth.
			</textarea>
		</div>

		<div class="repurpose-card">
			<div class="repurpose-header">
				<h3><i class="fa-brands fa-twitter" style="color:#1DA1F2"></i> X / Twitter Thread</h3>
				<button class="icon-button small copy-rep-btn" title="Copy"><i class="fa-regular fa-copy"></i></button>
			</div>
			<textarea id="twitterThread" class="repurpose-textarea" readonly>
1/5 Did you know about the lost archive of...
2/5 The historical documents reveal that...
3/5 Read the full story in our latest documentary.
			</textarea>
		</div>

		<div class="repurpose-card">
			<div class="repurpose-header">
				<h3><i class="fa-solid fa-quote-left"></i> Quote Card</h3>
				<button class="icon-button small copy-rep-btn" title="Copy"><i class="fa-regular fa-copy"></i></button>
			</div>
			<textarea id="quoteSnippets" class="repurpose-textarea" readonly>
"History is not just dates, it's the echo of our ancestors." - Full video out now.
			</textarea>
		</div>

		<div class="repurpose-card">
			<div class="repurpose-header">
				<h3><i class="fa-solid fa-users"></i> Community Post</h3>
				<button class="icon-button small copy-rep-btn" title="Copy"><i class="fa-regular fa-copy"></i></button>
			</div>
			<textarea id="communityPost" class="repurpose-textarea" readonly>
New episode dropping tomorrow! We dive deep into the mysteries of the past. Are you ready? Drop a comment below! 👇
			</textarea>
		</div>

	</div>
</div>
`;function initRepurpose(){var e=document.getElementById("ptab-repurpose");if(e){e.innerHTML=REPURPOSE_HTML;let r=document.getElementById("generateRepurposeBtn"),o=document.getElementById("repurposeGrid");r.addEventListener("click",()=>{r.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Extracting...',r.disabled=!0;let e=document.querySelectorAll(".script-textarea"),t="";e.forEach(e=>t+=e.value+" "),setTimeout(()=>{var e;r.innerHTML='<i class="fa-solid fa-check"></i> Refreshed',r.disabled=!1,o.style.display="grid",50<t.trim().length&&3<(e=t.split(/[.!?]/).filter(e=>10<e.trim().length)).length&&(document.getElementById("shortsScript").value=`Hook: ${e[0].trim()}?
Context: ${e[1].trim()}.
Payoff: Watch the full documentary on our channel!`,document.getElementById("communityPost").value=`Did you know? ${e[2].trim()}. Explore more in our latest upload! 🎥`)},1200)}),document.querySelectorAll(".copy-rep-btn").forEach(e=>{e.addEventListener("click",e=>{(e=e.currentTarget.closest(".repurpose-card").querySelector("textarea"))&&(navigator.clipboard.writeText(e.value.trim()),alert("Copied to clipboard!"))})})}}document.addEventListener("DOMContentLoaded",initRepurpose);export{initRepurpose};