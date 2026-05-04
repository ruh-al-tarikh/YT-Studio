// Content Planning Board

const PLANNER_HTML = `
<div class="planner-container">
	<div class="section-heading flex-between">
		<div>
			<h2 class="section-title">Content Planner</h2>
			<p class="section-copy">Schedule videos and track your weekly goals.</p>
		</div>
		<div class="planner-actions">
			<button class="secondary-button" id="addGoalBtn"><i class="fa-solid fa-bullseye"></i> Add Goal</button>
		</div>
	</div>

	<div class="planner-layout">
		<div class="planner-main">
			<div class="kanban-board">
				<div class="kanban-column" id="col-idea">
					<h3 class="kanban-title">Ideas</h3>
					<div class="kanban-cards">
						<div class="kanban-card" draggable="true">The Last Caliphate</div>
						<div class="kanban-card" draggable="true">Tariq bin Ziyad</div>
					</div>
				</div>

				<div class="kanban-column" id="col-scripting">
					<h3 class="kanban-title">Scripting <span class="status-dot warning"></span></h3>
					<div class="kanban-cards">
						<div class="kanban-card" draggable="true">Umayyad Architecture</div>
					</div>
				</div>

				<div class="kanban-column" id="col-production">
					<h3 class="kanban-title">Production <span class="status-dot active"></span></h3>
					<div class="kanban-cards">
						<div class="kanban-card" draggable="true">Rise of the Ottomans</div>
					</div>
				</div>

				<div class="kanban-column" id="col-done">
					<h3 class="kanban-title">Ready to Publish</h3>
					<div class="kanban-cards">
						<!-- Empty -->
					</div>
				</div>
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

			<div class="planner-card mt-4">
				<h3>Upcoming Reminders</h3>
				<ul class="reminder-list">
					<li><i class="fa-solid fa-bell" style="color: var(--accent)"></i> Publish Ottomans <span>(Tomorrow)</span></li>
					<li><i class="fa-solid fa-bell"></i> Community Post <span>(Friday)</span></li>
				</ul>
			</div>
		</aside>
	</div>
</div>
`;

export function initPlanner() {
	const container = document.getElementById('studio-view-planner');
	if (!container) return;
	container.innerHTML = PLANNER_HTML;

	// Simple Drag and Drop mock
	const cards = container.querySelectorAll('.kanban-card');
	const columns = container.querySelectorAll('.kanban-cards');

	let dragged = null;

	cards.forEach(card => {
		card.addEventListener('dragstart', (e) => {
			dragged = card;
			setTimeout(() => card.style.opacity = '0.5', 0);
		});
		card.addEventListener('dragend', () => {
			dragged.style.opacity = '1';
			dragged = null;
		});
	});

	columns.forEach(col => {
		col.addEventListener('dragover', (e) => {
			e.preventDefault();
			col.classList.add('drag-over');
		});
		col.addEventListener('dragleave', () => {
			col.classList.remove('drag-over');
		});
		col.addEventListener('drop', (e) => {
			e.preventDefault();
			col.classList.remove('drag-over');
			if (dragged) {
				col.appendChild(dragged);
			}
		});
	});
}

document.addEventListener('DOMContentLoaded', initPlanner);
