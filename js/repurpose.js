// Content Repurposing Engine

const REPURPOSE_HTML = `
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
			<textarea class="repurpose-textarea" readonly>
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
			<textarea class="repurpose-textarea" readonly>
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
			<textarea class="repurpose-textarea" readonly>
"History is not just dates, it's the echo of our ancestors." - Full video out now.
			</textarea>
		</div>

		<div class="repurpose-card">
			<div class="repurpose-header">
				<h3><i class="fa-solid fa-users"></i> Community Post</h3>
				<button class="icon-button small copy-rep-btn" title="Copy"><i class="fa-regular fa-copy"></i></button>
			</div>
			<textarea class="repurpose-textarea" readonly>
New episode dropping tomorrow! We dive deep into the mysteries of the past. Are you ready? Drop a comment below! 👇
			</textarea>
		</div>

	</div>
</div>
`;

export function initRepurpose() {
	const container = document.getElementById('ptab-repurpose');
	if (!container) return;
	container.innerHTML = REPURPOSE_HTML;

	const generateBtn = document.getElementById('generateRepurposeBtn');
	const grid = document.getElementById('repurposeGrid');

	generateBtn.addEventListener('click', () => {
		generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Extracting...';
		generateBtn.disabled = true;

		setTimeout(() => {
			generateBtn.innerHTML = '<i class="fa-solid fa-check"></i> Refreshed';
			generateBtn.disabled = false;
			grid.style.display = 'grid';
		}, 1200);
	});

	document.querySelectorAll('.copy-rep-btn').forEach(btn => {
		btn.addEventListener('click', (e) => {
			const ta = e.currentTarget.closest('.repurpose-card').querySelector('textarea');
			if (ta) {
				navigator.clipboard.writeText(ta.value.trim());
				alert('Copied to clipboard!');
			}
		});
	});
}

document.addEventListener('DOMContentLoaded', initRepurpose);
