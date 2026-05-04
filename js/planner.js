// Content Planning Board

const PLANNER_HTML = `
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
`;

export function initPlanner() {
	const container = document.getElementById('studio-view-planner');
	if (!container) return;
	container.innerHTML = PLANNER_HTML;

	const calendarGrid = document.getElementById('calendarGrid');
	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	let calendarHTML = days.map(day => `<div class="calendar-day-header">${day}</div>`).join('');

	for(let i=1; i<=28; i++) {
		const isToday = i === 12;
		const hasVideo = i === 15 || i === 22;
		calendarHTML += `
			<div class="calendar-day ${isToday ? 'today' : ''}">
				<span class="day-number">${i}</span>
				${hasVideo ? `<div class="calendar-event ${i === 15 ? 'writing' : 'editing'}">Video Project</div>` : ''}
			</div>
		`;
	}

	calendarGrid.innerHTML = calendarHTML;
}

document.addEventListener('DOMContentLoaded', initPlanner);
