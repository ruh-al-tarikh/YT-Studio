let PLANNER_HTML=`
<div class="planner-container">
	<div class="section-heading flex-between">
		<div>
			<h2 class="section-title">Content Calendar</h2>
			<p class="section-copy">Schedule videos and track your weekly goals.</p>
		</div>
		<div class="planner-actions">
			<button class="secondary-button" id="addGoalBtn"><i class="fa-solid fa-bullseye"></i> Add Goal</button>
		</div>
	</div>

	<div class="planner-layout">
		<div class="planner-main">
			<div class="calendar-grid" id="calendarGrid">
				<!-- Mock Calendar injected here -->
			</div>
		</div>

		<aside class="planner-sidebar">
			<div class="planner-card">
				<h3>Weekly Goals</h3>
				<div class="goal-item">
					<input type="checkbox" id="goal1" checked>
					<label for="goal1">Finish Umayyad script</label>
				</div>
				<div class="goal-item">
					<input type="checkbox" id="goal2">
					<label for="goal2">Record Voiceover</label>
				</div>
				<div class="goal-item">
					<input type="checkbox" id="goal3">
					<label for="goal3">Design Thumbnail</label>
				</div>
				<div class="goal-progress mt-3">
					<div class="bar-wrapper"><div class="bar-fill" style="width: 33%"></div></div>
					<span class="text-sm">1/3 Completed</span>
				</div>
			</div>
		</aside>
	</div>
</div>
`;function initPlanner(){var a=document.getElementById("studio-view-planner");if(a){a.innerHTML=PLANNER_HTML,a=document.getElementById("calendarGrid");let e=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(a=>`<div class="calendar-day-header">${a}</div>`).join("");for(let a=1;a<=28;a++){var i=12===a,d=15===a||22===a;e+=`
			<div class="calendar-day ${i?"today":""}">
				<span class="day-number">${a}</span>
				${d?`<div class="calendar-event ${15===a?"writing":"editing"}">Video Project</div>`:""}
			</div>
		`}a.innerHTML=e}}document.addEventListener("DOMContentLoaded",initPlanner);export{initPlanner};