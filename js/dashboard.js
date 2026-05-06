let DASHBOARD_HTML=`
<div class="studio-dashboard-container">
	<div class="section-heading">
		<h2 class="section-title">Smart Insights</h2>
		<p class="section-copy">Actionable takeaways based on your past performance.</p>
	</div>

	<div class="insights-grid">
		
		<div class="insight-card highlight">
			<h3><i class="fa-solid fa-lightbulb"></i> What to Create Next</h3>
			<p class="insight-text">Your audience heavily engages with <strong>Prophetic History</strong>. We recommend your next video be about "The early days of the Umayyads" based on search trends.</p>
			<button class="primary-button mt-3" id="startSuggestedProject"><i class="fa-solid fa-plus"></i> Start Project</button>
		</div>

		<div class="insight-card">
			<h3><i class="fa-solid fa-arrow-trend-up"></i> Best Performing Topic</h3>
			<div class="metric-big">Quranic Mysteries</div>
			<p class="insight-sub">Drives 45% of your total watch time. Keep creating these!</p>
			<div class="simple-bar-chart mt-3">
				<div class="bar-wrapper"><div class="bar-fill" style="width: 80%"></div><span>Quran</span></div>
				<div class="bar-wrapper"><div class="bar-fill" style="width: 45%"></div><span>History</span></div>
				<div class="bar-wrapper"><div class="bar-fill" style="width: 30%"></div><span>Debate</span></div>
			</div>
		</div>

		<div class="insight-card warning">
			<h3><i class="fa-solid fa-triangle-exclamation"></i> Underperforming Area</h3>
			<p class="insight-text">Videos over 30 minutes long have a 60% drop-off in the first 5 minutes. Try tightening your <strong>Hooks</strong>.</p>
			<button class="secondary-button mt-3" id="reviewHooksBtn">Review Scripts</button>
		</div>

		<div class="insight-card">
			<h3><i class="fa-solid fa-users"></i> Audience Retention</h3>
			<p class="insight-text">You are retaining viewers better than 80% of similar creators in the <em>Islamic History</em> niche.</p>
		</div>

	</div>
</div>
`;function initDashboard(){var t=document.getElementById("studio-view-dashboard");t&&(t.innerHTML=DASHBOARD_HTML,document.getElementById("startSuggestedProject")?.addEventListener("click",()=>{var t=document.getElementById("newProjectBtn");t&&(t.click(),t=document.getElementById("current-project-title"))&&(t.textContent="The early days of the Umayyads")}),document.getElementById("reviewHooksBtn")?.addEventListener("click",()=>{document.querySelector('[data-tab="projects"]')?.click()}))}document.addEventListener("DOMContentLoaded",initDashboard);export{initDashboard};