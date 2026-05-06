(()=>{let n={API:"/api/youtube/videos",CHANNEL_KEY:"yt_studio_channel_id",FALLBACK_DATA:"/data/demo.json",CACHE_KEY:"yt_studio_videos_cache_v4",CACHE_EXPIRY:864e5,PROJECTS_KEY:"yt_studio_projects",RESEARCH_KEY:"yt_studio_research",WATCH_LATER_KEY:"watch_later_list",THEME_KEY:"ui_theme",SEARCH_HISTORY_KEY:"search_history",PROGRESS_KEY:"watch_progress",ITEMS_PER_PAGE:15,API_CONFIG:{timeout:1e4,retries:3,backoff:1.5,delay:500}},s=[{key:"quran",label:"Quran",terms:["quran","surah","ayah","allah","tafsir","islam"]},{key:"prophecy",label:"Prophecy",terms:["prophecy","dajjal","gog","magog","end times"]},{key:"discussion",label:"Discussion",terms:["podcast","debate","interview","conversation"]},{key:"educational",label:"Educational",terms:["lesson","guide","explained","documentary"]},{key:"history",label:"History",terms:["history","empire","caliph","war","civilization"]}],i=e=>document.getElementById(e),l={body:document.body,grid:i("grid"),modal:i("modal"),player:i("player"),closeModal:i("close"),heroTitle:i("hero-title"),heroDesc:i("hero-desc"),heroSubtitle:i("hero-subtitle"),heroBtn:i("hero-btn"),heroSave:i("hero-save"),heroCategory:i("hero-category"),heroDate:i("hero-date"),search:i("searchInput"),bg:i("bg"),clearSearch:i("clearSearch"),suggestions:i("searchSuggestions"),loadMore:i("loadMoreBtn"),loadMoreContainer:i("loadMoreContainer"),loading:i("loading"),error:i("error"),errorMsg:i("error-msg"),retryBtn:i("retryBtn"),toast:i("toast"),themeToggle:i("darkModeToggle"),mobileToggle:i("mobileMenuToggle"),mobileNav:i("mobileNav"),watchLaterBadge:i("watchLaterBadge"),watchLaterCount:i("watchLaterCount"),watchLaterPage:i("watchLaterPage"),watchLaterContainer:i("watchLaterContainer"),closeWatchLater:i("closeWatchLater"),dashboardBtn:i("dashboardBtn"),dashboardModal:i("dashboardModal"),closeDashboard:i("closeDashboard"),chips:document.querySelectorAll(".chip"),resultsMeta:i("results-meta"),statTotal:i("stat-total"),statSaved:i("stat-saved"),statProgress:i("stat-progress"),dashTotal:i("dashboard-total"),dashSaved:i("dashboard-saved"),dashProgress:i("dashboard-progress"),dashHours:i("dashboard-hours"),dashCategories:i("dashboardCategories"),dashResumeList:i("dashboardResumeList"),toggleTranscript:i("toggleTranscript"),shareEpisode:i("shareEpisode"),transcriptPanel:i("transcriptPanel"),sharePanel:i("sharePanel"),closeTranscript:i("closeTranscript"),closeShare:i("closeShare"),shareLink:i("shareLink"),copyLinkBtn:i("copyLinkBtn"),shareTwitter:i("shareTwitter"),shareFacebook:i("shareFacebook"),shareWhatsApp:i("shareWhatsApp"),scrollToTop:i("scrollToTop"),continueBlock:i("continue-block"),continueRow:i("continue-row"),emptyHistory:i("empty-history"),clearFilters:i("clearFilters"),modeSwitcher:i("modeSwitcher"),modeBtns:document.querySelectorAll(".mode-btn"),studioBreadcrumbs:i("studioBreadcrumbs"),appRoot:i("app-root"),studioRoot:i("studio-root"),heroSection:i("hero"),continueBlockSec:i("continue-block"),trendingBlockSec:i("trending-block"),recommendedBlockSec:i("recommended-block"),trendingRow:i("trending-row"),recommendedRow:i("recommended-row"),studioNavBtns:document.querySelectorAll(".studio-nav-btn"),studioViews:document.querySelectorAll(".studio-view"),projectTabBtns:document.querySelectorAll(".project-tab-btn"),ptabContents:document.querySelectorAll(".ptab-content"),newProjectBtn:i("newProjectBtn"),backToProjectsBtn:i("backToProjectsBtn"),activeProjectView:i("active-project-view"),channelInput:i("channelIdInput"),connectBtn:i("connectChannelBtn"),studioViewProjects:i("studio-view-projects")},o={videos:[],filtered:[],hero:null,current:null,categories:["all"],search:"",page:0,watchLater:JSON.parse(localStorage.getItem(n.WATCH_LATER_KEY)||"[]"),theme:localStorage.getItem(n.THEME_KEY)||(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"),debounceTimer:null,searchHistory:JSON.parse(localStorage.getItem(n.SEARCH_HISTORY_KEY)||"[]"),progress:JSON.parse(localStorage.getItem(n.PROGRESS_KEY)||"{}"),ytPlayer:null,isPlaying:!1,isMuted:!1},d={sanitize:e=>String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"),truncate:(e,t)=>e.length>t?e.slice(0,t)+"...":e,formatDate:e=>{try{return new Intl.DateTimeFormat("en",{month:"short",day:"numeric",year:"numeric"}).format(new Date(e))}catch{return""}},highlight:(e,t)=>t?(t=new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\\\]/g,"\\\\$&")})`,"gi"),e.replace(t,"<mark>$1</mark>")):e,saveLS:(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch(e){console.error("LS Save Error:",e)}},getLS:(e,t=null)=>{try{var a=localStorage.getItem(e);return a?JSON.parse(a):t}catch{return t}},fetchWithRetry:async(a,r=n.API_CONFIG)=>{let s=r.delay;for(let t=0;t<r.retries;t++)try{let e=new AbortController;var o=setTimeout(()=>e.abort(),r.timeout),i=await fetch(a,{signal:e.signal});if(clearTimeout(o),i.ok)return i;throw new Error("API Error: "+i.status)}catch(e){if(t===r.retries-1)throw e;await new Promise(e=>setTimeout(e,s)),s*=r.backoff}},showToast:e=>{l.toast&&(l.toast.textContent=e,l.toast.classList.add("show"),setTimeout(()=>l.toast.classList.remove("show"),3e3))}};function r(t){var e=s.find(e=>e.key===t);return e?e.label:"History"}function c(e){return o.progress[e]||null}function h(e){if(l.studioBreadcrumbs){let a=e.split(" > ");l.studioBreadcrumbs.innerHTML=a.map((e,t)=>t===a.length-1?`<span class="current">${e}</span>`:`<span>${e}</span>`).join(' <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; margin:0 8px; opacity:0.5;"></i> ')}}let u="list";function p(){var a=document.getElementById("studioProjectsList");if(a){var s,o=localStorage.getItem(n.PROJECTS_KEY);let r=o?JSON.parse(o):[{id:"p1",title:"The Fall of the Abbasids",status:"Writing",progress:65,date:"2024-05-10"},{id:"p2",title:"Prophecy & Modernity",status:"Researching",progress:30,date:"2024-05-12"},{id:"p3",title:"The Silent Silk Road",status:"Editing",progress:90,date:"2024-05-08"},{id:"p4",title:"The Golden Age",status:"Published",progress:100,date:"2024-05-01"}],e=(a.innerHTML=r.map(({id:e,title:t,status:a,progress:r,date:s})=>`
			<div class="project-card">
				<div class="project-card-header">
					<span class="status-badge ${a.toLowerCase()}">${a}</span>
					<span class="project-date">${s}</span>
				</div>
				<h3 class="project-title">${t}</h3>
				<div class="project-progress-container">
					<div class="project-progress-bar" style="width: ${r}%"></div>
				</div>
				<div class="project-card-footer">
					<span>${r}% Complete</span>
					<button class="secondary-button small resume-project-btn" data-id="${e}">Resume</button>
				</div>
			</div>
		`).join(""),document.getElementById("listViewBtn")),t=document.getElementById("kanbanViewBtn");e&&!e.hasListener&&(e.addEventListener("click",()=>{u="list",e.classList.add("active"),t.classList.remove("active"),p()}),e.hasListener=!0),t&&!t.hasListener&&(t.addEventListener("click",()=>{u="kanban",t.classList.add("active"),e.classList.remove("active"),p()}),t.hasListener=!0),"kanban"===u?(s=r,(o=document.getElementById("studioProjectsList"))&&(o.className="kanban-grid",o.innerHTML=["Research","Writing","Editing","Published"].map(t=>{var e=s.filter(e=>e.status===t||"Research"===t&&"Researching"===e.status);return`<div class="kanban-column"><h3>${t} <span class="kanban-count">${e.length}</span></h3><div class="kanban-cards">${e.map(e=>`<div class="kanban-card resume-project-btn" data-id="${e.id}"><h4 class="text-sm font-bold mb-2">${e.title}</h4><div class="project-progress-container" style="height:4px;"><div class="project-progress-bar" style="width: ${e.progress}%"></div></div><div class="flex justify-between items-center mt-2 text-xs text-soft"><span>${e.progress}%</span><span>${e.date}</span></div></div>`).join("")}</div></div>`}).join(""),o.querySelectorAll(".resume-project-btn").forEach(e=>{e.addEventListener("click",e=>{let t=e.currentTarget.dataset.id;e=s.find(e=>e.id===t);e&&(l.studioViews.forEach(e=>e.style.display="none"),l.activeProjectView&&(l.activeProjectView.style.display="block"),i("current-project-title")&&(i("current-project-title").textContent=e.title),h("Studio > Projects > "+e.title),l.projectTabBtns[0])&&l.projectTabBtns[0].click()})}))):(a.className="studio-projects-grid",a.innerHTML=r.map(e=>`<div class="project-card"><div class="project-card-header"><span class="status-badge ${e.status.toLowerCase()}">${e.status}</span><span class="project-date">${e.date}</span></div><h3 class="project-title">${e.title}</h3><div class="project-progress-container"><div class="project-progress-bar" style="width: ${e.progress}%"></div></div><div class="project-card-footer"><span>${e.progress}% Complete</span><button class="secondary-button small resume-project-btn" data-id="${e.id}">Resume</button></div></div>`).join(""),a.querySelectorAll(".resume-project-btn").forEach(e=>{e.addEventListener("click",e=>{let t=e.currentTarget.dataset.id;var a,e=r.find(e=>e.id===t);e&&(l.studioViews.forEach(e=>e.style.display="none"),l.activeProjectView&&(l.activeProjectView.style.display="block"),(a=i("current-project-title"))&&(a.textContent=e.title),i("current-project-title")&&(i("current-project-title").textContent=e.title),h("Studio > Projects > "+e.title),l.projectTabBtns[0])&&l.projectTabBtns[0].click()})}))}}function a(){var e;l.continueBlock&&l.continueRow&&(0<(e=o.videos.filter(e=>{e=c(e.id);return e&&5<=e.percent&&e.percent<95}).sort((e,t)=>c(t.id).updated-c(e.id).updated).slice(0,4)).length?(l.continueBlock.style.display="block",l.continueRow.innerHTML=e.map(e=>T(e)).join(""),l.emptyHistory&&(l.emptyHistory.style.display="none")):(l.continueBlock.style.display="none",l.emptyHistory&&0<o.videos.length&&(l.emptyHistory.style.display="block")))}function g(r){var e;r&&l.modal&&l.player&&(e=c((o.current=r).id)?.time||0,l.player.src=`https://www.youtube.com/embed/${r.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&start=`+Math.floor(e),window.YT?.Player&&(o.ytPlayer&&o.ytPlayer.destroy(),o.ytPlayer=new YT.Player("player",{events:{onReady:()=>{var e=i("pipBtn");let a=i("speedOptions"),r=i("qualityOptions"),s=i("currentSpeed");e&&(e.onclick=async()=>{try{document.pictureInPictureElement?await document.exitPictureInPicture():d.showToast("PiP mode toggled via YouTube player")}catch{d.showToast("PiP not supported")}}),a&&(a.onclick=e=>{var t,e=e.target.closest("button");e&&(t=parseFloat(e.dataset.speed),o.ytPlayer.setPlaybackRate(t),s&&(s.textContent=t+"x"),a.querySelectorAll("button").forEach(e=>e.classList.remove("active")),e.classList.add("active"),d.showToast(`Speed: ${t}x`))}),r&&(r.onclick=e=>{var t,e=e.target.closest("button");e&&(t=e.dataset.quality,o.ytPlayer.setPlaybackQuality(t),r.querySelectorAll("button").forEach(e=>e.classList.remove("active")),e.classList.add("active"),d.showToast("Quality: "+t))})},onStateChange:e=>{e.data===YT.PlayerState.PLAYING?o.progressTimer=setInterval(()=>{var e,t,a;o.ytPlayer?.getCurrentTime?(e=o.ytPlayer.getCurrentTime(),0<(t=o.ytPlayer.getDuration())&&(a=e/t*100,o.progress[r.id]={time:e,duration:t,percent:a,updated:Date.now()},d.saveLS(n.PROGRESS_KEY,o.progress),S())):clearInterval(o.progressTimer)},5e3):clearInterval(o.progressTimer)}}})),l.modal.style.display="flex",l.modal.setAttribute("aria-hidden","false"),l.body.style.overflow="hidden",l.body.classList.add("modal-open"),(e=i("video-title"))&&(e.textContent=r.title),l.transcriptPanel?.setAttribute("aria-hidden","true"),l.sharePanel?.setAttribute("aria-hidden","true"),o.search)&&!o.searchHistory.includes(o.search)&&(o.searchHistory.unshift(o.search),o.searchHistory=o.searchHistory.slice(0,5),d.saveLS(n.SEARCH_HISTORY_KEY,o.searchHistory))}function m(){l.modal&&l.player&&(l.player.src="",l.modal.style.display="none",l.modal.setAttribute("aria-hidden","true"),l.body.style.overflow="",l.body.classList.remove("modal-open"),o.current=null,clearInterval(o.progressTimer),a(),C(),l.transcriptPanel?.setAttribute("aria-hidden","true"),l.sharePanel?.setAttribute("aria-hidden","true"))}function y(t){if(o.current&&o.filtered.length){var a=o.filtered.findIndex(e=>e.id===o.current.id);if(-1!==a){let e=a+t;(e=e<0?o.filtered.length-1:e)>=o.filtered.length&&(e=0),g(o.filtered[e])}}}function v(t){var e=o.watchLater.findIndex(e=>e.id===t.id);-1===e?(o.watchLater.push(t),d.showToast("Added to Watch Later")):(o.watchLater.splice(e,1),d.showToast("Removed from Watch Later")),d.saveLS(n.WATCH_LATER_KEY,o.watchLater),S()}function b(){l.watchLaterPage&&(f(),l.watchLaterPage.style.display="block",l.watchLaterPage.setAttribute("aria-hidden","false"),l.body.style.overflow="hidden",l.body.classList.add("modal-open"))}function w(){l.watchLaterPage&&(l.watchLaterPage.style.display="none",l.watchLaterPage.setAttribute("aria-hidden","true"),l.body.style.overflow="",l.body.classList.remove("modal-open"))}function f(){l.watchLaterContainer&&(o.watchLater.length?l.watchLaterContainer.innerHTML=o.watchLater.map(e=>{var t=e.thumbnail||"https://i.ytimg.com/vi/"+e.id+"/hqdefault.jpg";return'<div class="card" data-id="'+e.id+'" data-wl="1" role="button" tabindex="0"><div class="card-thumb-wrapper"><img src="'+t+'" alt="'+d.sanitize(e.title)+'" loading="lazy"><button class="watch-later-btn active" data-id="'+e.id+'" aria-label="Remove from Watch Later"><i class="fa-solid fa-bookmark" aria-hidden="true"></i></button></div><div class="card-copy"><div class="card-title">'+d.highlight(d.sanitize(d.truncate(e.title,60)),o.search)+'</div><div class="card-meta"><span class="card-tag">'+r(e.category)+"</span><span>"+d.formatDate(e.publishedAt)+"</span></div></div></div>"}).join(""):l.watchLaterContainer.innerHTML='<div class="empty-state">No episodes saved yet. Click the bookmark icon on any episode to save it.</div>'),l.watchLaterContainer&&(0<o.watchLater.length?(l.watchLaterContainer.innerHTML=o.watchLater.map(e=>{var t=e.thumbnail||`https://i.ytimg.com/vi/${e.id}/hqdefault.jpg`;return`
						<div class="card" data-id="${e.id}" data-wl="1" role="button" tabindex="0">
							<div class="card-thumb-wrapper">
								<img data-src="${t}" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" alt="${d.sanitize(e.title)}" class="lazy-img" loading="lazy">
								<button class="watch-later-btn active" data-id="${e.id}" aria-label="Remove from Watch Later">
									<i class="fa-solid fa-bookmark"></i>
								</button>
							</div>
							<div class="card-copy">
								<div class="card-title">${d.highlight(d.sanitize(d.truncate(e.title,60)),o.search)}</div>
								<div class="card-meta">
									<span class="card-tag">${r(e.category)}</span>
									<span>${d.formatDate(e.publishedAt)}</span>
								</div>
							</div>
						</div>
					`}).join(""),t()):l.watchLaterContainer.innerHTML='<div class="empty-state">No episodes saved yet. Click the bookmark icon on any episode to save it.</div>')}function L(){if(l.dashboardModal){l.dashTotal&&(l.dashTotal.textContent=o.videos.length),l.dashSaved&&(l.dashSaved.textContent=o.watchLater.length),l.dashProgress&&(l.dashProgress.textContent=0),l.dashHours&&(l.dashHours.textContent=(.5*o.videos.length).toFixed(1)+"h");var t=document.querySelector(".dashboard-panels");if(0===o.videos.length){t&&(t.style.display="none");let e=document.getElementById("dashboard-empty");!e&&((e=document.createElement("div")).id="dashboard-empty",e.className="dashboard-empty-state",e.innerHTML=`
          <i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i>
          <h4>No Channel Connected</h4>
          <p>Connect your YouTube channel to sync your archive, track progress, and unlock personalized insights.</p>
          <button type="button" class="connect-btn" aria-label="Connect YouTube Channel">
            <i class="fa-brands fa-youtube" aria-hidden="true"></i>
            Connect Channel
          </button>
        `,(a=document.querySelector(".dashboard-content"))&&a.appendChild(e),a=e.querySelector(".connect-btn"))&&a.addEventListener("click",()=>d.showToast("Channel connection coming soon!")),e.style.display="flex"}else{t&&(t.style.display="grid");var a=document.getElementById("dashboard-empty");if(a&&(a.style.display="none"),l.dashCategories){let t={};o.videos.forEach(e=>{t[e.category]=(t[e.category]||0)+1}),l.dashCategories.innerHTML=Object.entries(t).sort((e,t)=>t[1]-e[1]).map(([e,t])=>'<div class="dashboard-list-row"><span>'+r(e)+"</span><strong>"+t+"</strong></div>").join("")||'<p style="color:var(--text-soft)">No data yet.</p>'}l.dashResumeList&&(l.dashResumeList.innerHTML=o.watchLater.length?o.watchLater.slice(0,5).map(e=>'<div class="dashboard-list-row"><span>'+d.sanitize(d.truncate(e.title,40))+"</span><strong>"+r(e.category)+"</strong></div>").join(""):'<p style="color:var(--text-soft)">No saved episodes.</p>')}l.dashboardModal.style.display="block",l.dashboardModal.setAttribute("aria-hidden","false"),l.body.style.overflow="hidden",l.body.classList.add("modal-open")}}function k(){l.dashboardModal&&(l.dashboardModal.style.display="none",l.dashboardModal.setAttribute("aria-hidden","true"),l.body.style.overflow="",l.body.classList.remove("modal-open"))}function E(){"light"===o.theme?l.body.classList.add("light-mode"):l.body.classList.remove("light-mode");var e=l.themeToggle?l.themeToggle.querySelector("i"):null;e&&(e.className="dark"===o.theme?"fa-regular fa-moon":"fa-regular fa-sun")}function A(){o.theme="dark"===o.theme?"light":"dark",d.saveLS(n.THEME_KEY,o.theme),E()}function T(t){var e=o.watchLater.some(e=>e.id===t.id),a=t.thumbnail||"https://i.ytimg.com/vi/"+t.id+"/hqdefault.jpg";return'<div class="card" data-id="'+t.id+'" role="button" tabindex="0"><div class="card-thumb-wrapper"><img data-src="'+a+'" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" alt="'+d.sanitize(t.title)+'" class="lazy-img" loading="lazy"><div class="card-thumb-overlay"><i class="fa-solid fa-play play-icon"></i></div><div class="duration-badge">HD</div>'+(c(t.id)?'<div class="progress-bar-container"><div class="progress-bar-fill" style="width:'+c(t.id).percent+'%"></div></div>':"")+'<button class="watch-later-btn '+(e?"active":"")+'" data-id="'+t.id+'" aria-label="'+(e?"Remove from Watch Later":"Save for later")+'"><i class="fa-'+(e?"solid":"regular")+' fa-bookmark" aria-hidden="true"></i></button></div><div class="card-copy"><div class="card-title">'+d.highlight(d.sanitize(d.truncate(t.title,60)),o.search)+'</div><div class="card-meta"><span class="card-tag">'+r(t.category)+"</span><span>"+d.formatDate(t.publishedAt)+"</span></div></div></div>"}function C(){let a=o.search.toLowerCase();o.filtered=o.videos.filter(e=>{var t=o.categories.includes("all")||o.categories.includes(e.category),e=!a||e.title.toLowerCase().includes(a);return t&&e}),l.clearFilters&&(l.clearFilters.style.display=o.categories.includes("all")?"none":"inline-flex"),l.resultsMeta&&(l.resultsMeta.textContent=o.filtered.length+" episode"+(1===o.filtered.length?"":"s")+" found");var e=o.filtered.slice(0,n.ITEMS_PER_PAGE*(o.page+1));if(l.grid)if(0===o.filtered.length)l.grid.innerHTML=`
					<div class="empty-state-card" style="grid-column: 1 / -1; margin-top: 40px;">
						<i class="fa-solid fa-magnifying-glass"></i>
						<h3>No results found</h3>
						<p>Try different keywords or browse by category to find what you're looking for.</p>
						<button type="button" class="secondary-button" style="margin-top: 20px;" onclick="document.getElementById('searchInput').value=''; document.getElementById('searchInput').dispatchEvent(new Event('input'));">
							Clear Search
						</button>
					</div>
				`;else if(l.grid.innerHTML=e.map(T).join(""),e.length<o.filtered.length){e=document.createElement("div");e.id="grid-sentinel",e.style.height="10px",l.grid.appendChild(e);let t=new IntersectionObserver(e=>{e[0].isIntersecting&&(t.disconnect(),o.page++,C())},{rootMargin:"400px"});t.observe(e)}t()}function t(){let t=new IntersectionObserver((e,a)=>{e.forEach(t=>{if(t.isIntersecting){let e=t.target;e.src=e.dataset.src,e.onload=()=>e.classList.add("loaded"),a.unobserve(e)}})},{rootMargin:"100px"});function a(t,a){if(!a)return 1;if((t=t.toLowerCase()).includes(a))return 10;let r=0,s=0;for(let e=0;e<t.length&&s<a.length;e++)t[e]===a[s]&&(r++,s++);return r/a.length}document.querySelectorAll(".lazy-img").forEach(e=>t.observe(e));let r=o.search.toLowerCase();o.filtered=o.videos.filter(e=>!(!o.categories.includes("all")&&!o.categories.includes(e.category))&&(!r||.6<Math.max(a(e.title,r),a(e.description||"",r),e.category.includes(r)?.8:0))),r&&o.filtered.sort((e,t)=>{e=Math.max(a(e.title,r),a(e.description||"",r));return Math.max(a(t.title,r),a(t.description||"",r))-e});var e=o.filtered.slice(0,n.ITEMS_PER_PAGE*(o.page+1));l.clearFilters&&(l.clearFilters.style.display=o.categories.includes("all")?"none":"inline-flex"),l.resultsMeta&&(l.resultsMeta.textContent=o.filtered.length+" episode"+(1===o.filtered.length?"":"s")+" found"),l.grid&&(0===o.filtered.length?l.grid.innerHTML=`<div class="empty-state-card" style="grid-column: 1 / -1; margin-top: 40px;"><i class="fa-solid fa-magnifying-glass"></i><h3>No results found</h3><p>Try different keywords or browse by category to find what you're looking for.</p><button type="button" class="secondary-button" style="margin-top: 20px;" onclick="document.getElementById('searchInput').value=''; document.getElementById('searchInput').dispatchEvent(new Event('input'));">Clear Search</button></div>`:l.grid.innerHTML=e.map(T).join("")),l.loadMoreContainer&&(l.loadMoreContainer.style.display=e.length<o.filtered.length?"block":"none")}function S(){l.statTotal&&(l.statTotal.textContent=o.videos.length),l.statSaved&&(l.statSaved.textContent=o.watchLater.length),l.statProgress&&(l.statProgress.textContent=Object.keys(o.progress).length),l.watchLaterCount&&(l.watchLaterCount.textContent=o.watchLater.length),l.watchLaterBadge&&l.watchLaterBadge.setAttribute("aria-label",`Open watch later list (${o.watchLater.length} episodes)`)}function P(t){var e,a;(o.hero=t)&&l.heroTitle&&(l.heroTitle.textContent=t.title,l.heroDesc&&(l.heroDesc.textContent=t.description||""),l.heroCategory&&(l.heroCategory.textContent=r(t.category)),l.heroDate&&(l.heroDate.textContent=d.formatDate(t.publishedAt)),l.bg&&(l.bg.style.backgroundImage="url("+t.thumbnail+")"),e=o.watchLater.some(e=>e.id===t.id),l.heroSave&&(l.heroSave.innerHTML='<i class="fa-'+(e?"solid":"regular")+' fa-bookmark" aria-hidden="true"></i> <span>'+(e?"Saved":"Save")+"</span>"),e=i("highlight-latest-title"),a=i("highlight-latest-copy"),e&&(e.textContent=d.truncate(t.title,60)),a)&&(a.textContent=d.formatDate(t.publishedAt))}function B(){l.sharePanel&&l.sharePanel.setAttribute("aria-hidden","true")}function j(){l.transcriptPanel&&l.transcriptPanel.setAttribute("aria-hidden","true")}function I(){l.mobileToggle&&l.mobileToggle.addEventListener("click",()=>{var e=l.body.classList.toggle("menu-open"),t=(l.mobileNav&&l.mobileNav.setAttribute("aria-hidden",e?"false":"true"),l.mobileToggle.querySelector("i"));t&&(t.className=e?"fa-solid fa-xmark":"fa-solid fa-bars")}),l.search&&(l.search.addEventListener("keydown",t=>{var a=l.suggestions.querySelectorAll(".suggestion-item");if("block"===l.suggestions.style.display&&0<a.length){let e=Array.from(a).findIndex(e=>e.classList.contains("active"));"ArrowDown"===t.key?(t.preventDefault(),-1!==e&&a[e].classList.remove("active"),a[e=(e+1)%a.length].classList.add("active"),a[e].scrollIntoView({block:"nearest"})):"ArrowUp"===t.key?(t.preventDefault(),-1!==e&&a[e].classList.remove("active"),a[e=(e-1+a.length)%a.length].classList.add("active"),a[e].scrollIntoView({block:"nearest"})):"Enter"===t.key&&-1!==e&&(t.preventDefault(),a[e].click())}}),l.search.addEventListener("input",e=>{var t;o.search=e.target.value,o.page=0,l.clearSearch&&(l.clearSearch.style.display=o.search?"block":"none"),t=o.search,l.suggestions&&(t&&!(t.length<2)&&0<(e=o.videos.filter(e=>e.title.toLowerCase().includes(t.toLowerCase())).slice(0,5)).length?(l.suggestions.innerHTML=e.map(e=>`
        <div class="suggestion-item" role="option" data-id="${e.id}">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>${d.highlight(e.title,t)}</span>
/**
 * YT Studio - Main Application
 * YouTube API V3 Integration via Cloudflare Worker
 * Version: 2.0.0
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // API Endpoints
    API: {
        YOUTUBE_WORKER: 'https://yt-studio-youtube-api.ruhdevopsytstudio.workers.dev',
        FALLBACK_DATA: '/data/demo.json'
    },
    
    // Storage Keys
    STORAGE: {
        CHANNEL_KEY: 'yt_studio_channel_id',
        CACHE_KEY: 'yt_studio_videos_cache_v4',
        CACHE_EXPIRY: 86400000, // 24 hours
        PROJECTS_KEY: 'yt_studio_projects',
        RESEARCH_KEY: 'yt_studio_research',
        WATCH_LATER_KEY: 'watch_later_list',
        THEME_KEY: 'ui_theme',
        SEARCH_HISTORY_KEY: 'search_history',
        PROGRESS_KEY: 'watch_progress'
    },
    
    // UI Settings
    UI: {
        ITEMS_PER_PAGE: 15,
        LAZY_LOAD_THRESHOLD: 400
    },
    
    // API Retry Config
    API_CONFIG: {
        timeout: 10000,
        retries: 3,
        backoff: 1.5,
        delay: 500
    }
};

// ============================================
// CATEGORIES
// ============================================
const CATEGORIES = [
    { key: 'quran', label: 'Quran', terms: ['quran', 'surah', 'ayah', 'allah', 'tafsir', 'islam'] },
    { key: 'prophecy', label: 'Prophecy', terms: ['prophecy', 'dajjal', 'gog', 'magog', 'end times'] },
    { key: 'discussion', label: 'Discussion', terms: ['podcast', 'debate', 'interview', 'conversation'] },
    { key: 'educational', label: 'Educational', terms: ['lesson', 'guide', 'explained', 'documentary'] },
    { key: 'history', label: 'History', terms: ['history', 'empire', 'caliph', 'war', 'civilization'] }
];

// ============================================
// DOM ELEMENTS
// ============================================
const DOM = {
    // Core elements
    body: document.body,
    grid: document.getElementById('grid'),
    modal: document.getElementById('modal'),
    player: document.getElementById('player'),
    closeModal: document.getElementById('close'),
    
    // Hero section
    heroTitle: document.getElementById('hero-title'),
    heroDesc: document.getElementById('hero-desc'),
    heroSubtitle: document.getElementById('hero-subtitle'),
    heroBtn: document.getElementById('hero-btn'),
    heroSave: document.getElementById('hero-save'),
    heroCategory: document.getElementById('hero-category'),
    heroDate: document.getElementById('hero-date'),
    
    // Search
    search: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    suggestions: document.getElementById('searchSuggestions'),
    
    // Pagination
    loadMore: document.getElementById('loadMoreBtn'),
    loadMoreContainer: document.getElementById('loadMoreContainer'),
    
    // Status
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    errorMsg: document.getElementById('error-msg'),
    retryBtn: document.getElementById('retryBtn'),
    toast: document.getElementById('toast'),
    
    // Theme
    themeToggle: document.getElementById('darkModeToggle'),
    
    // Mobile
    mobileToggle: document.getElementById('mobileMenuToggle'),
    mobileNav: document.getElementById('mobileNav'),
    
    // Watch Later
    watchLaterBadge: document.getElementById('watchLaterBadge'),
    watchLaterCount: document.getElementById('watchLaterCount'),
    watchLaterPage: document.getElementById('watchLaterPage'),
    watchLaterContainer: document.getElementById('watchLaterContainer'),
    closeWatchLater: document.getElementById('closeWatchLater'),
    
    // Dashboard
    dashboardBtn: document.getElementById('dashboardBtn'),
    dashboardModal: document.getElementById('dashboardModal'),
    closeDashboard: document.getElementById('closeDashboard'),
    
    // Stats
    resultsMeta: document.getElementById('results-meta'),
    statTotal: document.getElementById('stat-total'),
    statSaved: document.getElementById('stat-saved'),
    statProgress: document.getElementById('stat-progress'),
    dashTotal: document.getElementById('dashboard-total'),
    dashSaved: document.getElementById('dashboard-saved'),
    dashProgress: document.getElementById('dashboard-progress'),
    dashHours: document.getElementById('dashboard-hours'),
    dashCategories: document.getElementById('dashboardCategories'),
    dashResumeList: document.getElementById('dashboardResumeList'),
    
    // Transcript & Share
    toggleTranscript: document.getElementById('toggleTranscript'),
    shareEpisode: document.getElementById('shareEpisode'),
    transcriptPanel: document.getElementById('transcriptPanel'),
    sharePanel: document.getElementById('sharePanel'),
    closeTranscript: document.getElementById('closeTranscript'),
    closeShare: document.getElementById('closeShare'),
    shareLink: document.getElementById('shareLink'),
    copyLinkBtn: document.getElementById('copyLinkBtn'),
    shareTwitter: document.getElementById('shareTwitter'),
    shareFacebook: document.getElementById('shareFacebook'),
    shareWhatsApp: document.getElementById('shareWhatsApp'),
    
    // Scroll
    scrollToTop: document.getElementById('scrollToTop'),
    
    // Blocks
    continueBlock: document.getElementById('continue-block'),
    continueRow: document.getElementById('continue-row'),
    emptyHistory: document.getElementById('empty-history'),
    clearFilters: document.getElementById('clearFilters'),
    trendingRow: document.getElementById('trending-row'),
    recommendedRow: document.getElementById('recommended-row'),
    
    // Studio Mode
    modeSwitcher: document.getElementById('modeSwitcher'),
    modeBtns: document.querySelectorAll('.mode-btn'),
    studioRoot: document.getElementById('studio-root'),
    appRoot: document.getElementById('app-root'),
    heroSection: document.getElementById('hero'),
    continueBlockSec: document.getElementById('continue-block'),
    trendingBlockSec: document.getElementById('trending-block'),
    recommendedBlockSec: document.getElementById('recommended-block'),
    
    // Studio Navigation
    studioNavBtns: document.querySelectorAll('.studio-nav-btn'),
    studioViews: document.querySelectorAll('.studio-view'),
    studioBreadcrumbs: document.getElementById('studioBreadcrumbs'),
    
    // Projects
    projectTabBtns: document.querySelectorAll('.project-tab-btn'),
    ptabContents: document.querySelectorAll('.ptab-content'),
    newProjectBtn: document.getElementById('newProjectBtn'),
    backToProjectsBtn: document.getElementById('backToProjectsBtn'),
    activeProjectView: document.getElementById('active-project-view'),
    studioViewProjects: document.getElementById('studio-view-projects'),
    
    // Channel
    channelInput: document.getElementById('channelIdInput'),
    connectBtn: document.getElementById('connectChannelBtn'),
    
    // Chips
    chips: document.querySelectorAll('.chip'),
    
    // Background
    bg: document.getElementById('bg'),
    
    // Filters
    clearFiltersBtn: document.getElementById('clearFilters')
};

// ============================================
// APPLICATION STATE
// ============================================
const AppState = {
    videos: [],
    filtered: [],
    hero: null,
    current: null,
    categories: ['all'],
    search: '',
    page: 0,
    watchLater: [],
    theme: 'dark',
    debounceTimer: null,
    searchHistory: [],
    progress: {},
    ytPlayer: null,
    isPlaying: false,
    isMuted: false,
    currentView: 'list' // list or kanban
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
    sanitize(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    truncate(str, maxLength) {
        if (!str) return '';
        return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
    },
    
    formatDate(dateStr) {
        try {
            return new Intl.DateTimeFormat('en', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(new Date(dateStr));
        } catch {
            return '';
        }
    },
    
    highlight(text, search) {
        if (!search) return text;
        const regex = new RegExp(`(${this.escapeRegex(search)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },
    
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    
    saveLS(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('LS Save Error:', e);
        }
    },
    
    getLS(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    
    async fetchWithRetry(url, config = CONFIG.API_CONFIG) {
        let delay = config.delay;
        for (let i = 0; i < config.retries; i++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), config.timeout);
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeout);
                if (response.ok) return response;
                throw new Error(`API Error: ${response.status}`);
            } catch (error) {
                if (i === config.retries - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= config.backoff;
            }
        }
    },
    
    showToast(message) {
        if (DOM.toast) {
            DOM.toast.textContent = message;
            DOM.toast.classList.add('show');
            setTimeout(() => DOM.toast.classList.remove('show'), 3000);
        }
    }
};

// ============================================
// CATEGORY HELPERS
// ============================================
function getCategoryLabel(key) {
    const cat = CATEGORIES.find(c => c.key === key);
    return cat ? cat.label : 'History';
}

function detectCategory(title) {
    const text = (title || '').toLowerCase();
    const cat = CATEGORIES.find(c => c.terms.some(term => text.includes(term)));
    return cat ? cat.key : 'history';
}

// ============================================
// PROGRESS TRACKING
// ============================================
function getProgress(videoId) {
    return AppState.progress[videoId] || null;
}

// ============================================
// YOUTUBE API INTEGRATION (via Cloudflare Worker)
// ============================================
async function fetchYouTubeChannelData() {
    try {
        const response = await fetch(`${CONFIG.API.YOUTUBE_WORKER}/api/channel`);
        if (!response.ok) throw new Error('Failed to fetch channel data');
        return await response.json();
    } catch (error) {
        console.error('YouTube Worker Error:', error);
        return null;
    }
}

async function loadVideos() {
    // Check cache first
    const cached = Utils.getLS(CONFIG.STORAGE.CACHE_KEY);
    if (cached && cached.data && cached.data.length && Date.now() - cached.time < CONFIG.STORAGE.CACHE_EXPIRY) {
        return cached.data;
    }
    
    try {
        // Try to fetch from channel ID if available
        const channelId = Utils.getLS(CONFIG.STORAGE.CHANNEL_KEY);
        let url = CONFIG.API.YOUTUBE_WORKER;
        if (channelId) {
            url += `/api/channel/videos?channelId=${channelId}`;
        }
        
        const response = await Utils.fetchWithRetry(url);
        const data = await response.json();
        
        if (data.isDemo) {
            document.body.classList.add('demo-mode');
            Utils.showToast('Using demo archives');
        } else {
            document.body.classList.remove('demo-mode');
        }
        
        const videos = (data.videos || []).map(video => ({
            id: video.id || video.videoId,
            title: video.title || 'Untitled',
            thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
            publishedAt: video.publishedAt || new Date().toISOString(),
            category: detectCategory(video.title),
            description: video.description || 'Deep dive into Islamic history and theology.'
        }));
        
        if (videos.length) {
            Utils.saveLS(CONFIG.STORAGE.CACHE_KEY, { data: videos, time: Date.now() });
        }
        
        return videos;
        
    } catch (error) {
        console.error('Worker fetch failed, using fallback:', error);
        const fallback = await fetch(CONFIG.API.FALLBACK_DATA);
        const data = await fallback.json();
        document.body.classList.add('demo-mode');
        return (data.videos || []).map(video => ({
            ...video,
            category: video.category || 'history',
            description: video.description || 'Deep dive into Islamic history and theology.'
        }));
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================
function renderCard(video) {
    const isSaved = AppState.watchLater.some(v => v.id === video.id);
    const thumbnail = video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
    const progress = getProgress(video.id);
    
    return `
        <div class="card" data-id="${video.id}" role="button" tabindex="0">
            <div class="card-thumb-wrapper">
                <img data-src="${thumbnail}" 
                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" 
                     alt="${Utils.sanitize(video.title)}" 
                     class="lazy-img" 
                     loading="lazy">
                <div class="card-thumb-overlay">
                    <i class="fa-solid fa-play play-icon"></i>
                </div>
                <div class="duration-badge">HD</div>
                ${progress ? `<div class="progress-bar-container"><div class="progress-bar-fill" style="width:${progress.percent}%"></div></div>` : ''}
                <button class="watch-later-btn ${isSaved ? 'active' : ''}" 
                        data-id="${video.id}" 
                        aria-label="${isSaved ? 'Remove from Watch Later' : 'Save for later'}">
                    <i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i>
                </button>
            </div>
            <div class="card-copy">
                <div class="card-title">${Utils.highlight(Utils.sanitize(Utils.truncate(video.title, 60)), AppState.search)}</div>
                <div class="card-meta">
                    <span class="card-tag">${getCategoryLabel(video.category)}</span>
                    <span>${Utils.formatDate(video.publishedAt)}</span>
                </div>
            </div>
        </div>
    `;
}

function renderHero(video) {
    if (!video) return;
    
    if (DOM.heroTitle) DOM.heroTitle.textContent = video.title;
    if (DOM.heroDesc) DOM.heroDesc.textContent = video.description || '';
    if (DOM.heroCategory) DOM.heroCategory.textContent = getCategoryLabel(video.category);
    if (DOM.heroDate) DOM.heroDate.textContent = Utils.formatDate(video.publishedAt);
    if (DOM.bg) DOM.bg.style.backgroundImage = `url(${video.thumbnail})`;
    
    const isSaved = AppState.watchLater.some(v => v.id === video.id);
    if (DOM.heroSave) {
        DOM.heroSave.innerHTML = `<i class="fa-${isSaved ? 'solid' : 'regular'} fa-bookmark"></i> <span>${isSaved ? 'Saved' : 'Save'}</span>`;
    }
}

function renderGrid() {
    const searchTerm = AppState.search.toLowerCase();
    
    AppState.filtered = AppState.videos.filter(video => {
        const categoryMatch = AppState.categories.includes('all') || AppState.categories.includes(video.category);
        const searchMatch = !searchTerm || video.title.toLowerCase().includes(searchTerm);
        return categoryMatch && searchMatch;
    });
    
    if (DOM.clearFilters) {
        DOM.clearFilters.style.display = AppState.categories.includes('all') ? 'none' : 'inline-flex';
    }
    
    if (DOM.resultsMeta) {
        DOM.resultsMeta.textContent = `${AppState.filtered.length} episode${AppState.filtered.length !== 1 ? 's' : ''} found`;
    }
    
    const displayVideos = AppState.filtered.slice(0, CONFIG.UI.ITEMS_PER_PAGE * (AppState.page + 1));
    
    if (DOM.grid) {
        if (AppState.filtered.length === 0) {
            DOM.grid.innerHTML = `
                <div class="empty-state-card" style="grid-column: 1 / -1; margin-top: 40px;">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <h3>No results found</h3>
                    <p>Try different keywords or browse by category to find what you're looking for.</p>
                    <button type="button" class="secondary-button" style="margin-top: 20px;" onclick="document.getElementById('searchInput').value=''; document.getElementById('searchInput').dispatchEvent(new Event('input'));">
                        Clear Search
                    </button>
                </div>
            `;
        } else {
            DOM.grid.innerHTML = displayVideos.map(renderCard).join('');
            
            // Infinite scroll
            if (displayVideos.length < AppState.filtered.length) {
                const sentinel = document.createElement('div');
                sentinel.id = 'grid-sentinel';
                sentinel.style.height = '10px';
                DOM.grid.appendChild(sentinel);
                
                const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting) {
                        observer.disconnect();
                        AppState.page++;
                        renderGrid();
                    }
                }, { rootMargin: '400px' });
                observer.observe(sentinel);
            }
        }
    }
    
    lazyLoadImages();
    
    if (DOM.loadMoreContainer) {
        DOM.loadMoreContainer.style.display = displayVideos.length < AppState.filtered.length ? 'block' : 'none';
    }
}

function lazyLoadImages() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.onload = () => img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '100px' });
    
    document.querySelectorAll('.lazy-img').forEach(img => observer.observe(img));
}

function renderContinueWatching() {
    if (!DOM.continueBlock || !DOM.continueRow) return;
    
    const continueVideos = AppState.videos
        .filter(video => {
            const progress = getProgress(video.id);
            return progress && progress.percent >= 5 && progress.percent < 95;
        })
        .sort((a, b) => getProgress(b.id).updated - getProgress(a.id).updated)
        .slice(0, 4);
    
    if (continueVideos.length) {
        DOM.continueBlock.style.display = 'block';
        DOM.continueRow.innerHTML = continueVideos.map(renderCard).join('');
        if (DOM.emptyHistory) DOM.emptyHistory.style.display = 'none';
    } else {
        DOM.continueBlock.style.display = 'none';
        if (DOM.emptyHistory && AppState.videos.length) DOM.emptyHistory.style.display = 'block';
    }
}

function renderWatchLater() {
    if (!DOM.watchLaterContainer) return;
    
    if (AppState.watchLater.length) {
        DOM.watchLaterContainer.innerHTML = AppState.watchLater.map(video => {
            const thumbnail = video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
            return `
                <div class="card" data-id="${video.id}" data-wl="1" role="button" tabindex="0">
                    <div class="card-thumb-wrapper">
                        <img data-src="${thumbnail}" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" alt="${Utils.sanitize(video.title)}" class="lazy-img" loading="lazy">
                        <button class="watch-later-btn active" data-id="${video.id}" aria-label="Remove from Watch Later">
                            <i class="fa-solid fa-bookmark"></i>
                        </button>
                    </div>
                    <div class="card-copy">
                        <div class="card-title">${Utils.highlight(Utils.sanitize(Utils.truncate(video.title, 60)), AppState.search)}</div>
                        <div class="card-meta">
                            <span class="card-tag">${getCategoryLabel(video.category)}</span>
                            <span>${Utils.formatDate(video.publishedAt)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        lazyLoadImages();
    } else {
        DOM.watchLaterContainer.innerHTML = '<div class="empty-state">No episodes saved yet. Click the bookmark icon on any episode to save it.</div>';
    }
}

function renderDashboard() {
    if (!DOM.dashboardModal) return;
    
    if (DOM.dashTotal) DOM.dashTotal.textContent = AppState.videos.length;
    if (DOM.dashSaved) DOM.dashSaved.textContent = AppState.watchLater.length;
    if (DOM.dashProgress) DOM.dashProgress.textContent = Object.keys(AppState.progress).length;
    if (DOM.dashHours) DOM.dashHours.textContent = (0.5 * AppState.videos.length).toFixed(1) + 'h';
    
    if (DOM.dashCategories && AppState.videos.length) {
        const categoryCount = {};
        AppState.videos.forEach(video => {
            categoryCount[video.category] = (categoryCount[video.category] || 0) + 1;
        });
        DOM.dashCategories.innerHTML = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => `<div class="dashboard-list-row"><span>${getCategoryLabel(cat)}</span><strong>${count}</strong></div>`)
            .join('');
    }
    
    if (DOM.dashResumeList) {
        DOM.dashResumeList.innerHTML = AppState.watchLater.length
            ? AppState.watchLater.slice(0, 5).map(video => `
                <div class="dashboard-list-row">
                    <span>${Utils.sanitize(Utils.truncate(video.title, 40))}</span>
                    <strong>${getCategoryLabel(video.category)}</strong>
                </div>
            `).join('')
            : '<p style="color:var(--text-soft)">No saved episodes.</p>';
    }
}

function updateStats() {
    if (DOM.statTotal) DOM.statTotal.textContent = AppState.videos.length;
    if (DOM.statSaved) DOM.statSaved.textContent = AppState.watchLater.length;
    if (DOM.statProgress) DOM.statProgress.textContent = Object.keys(AppState.progress).length;
    if (DOM.watchLaterCount) DOM.watchLaterCount.textContent = AppState.watchLater.length;
    if (DOM.watchLaterBadge) {
        DOM.watchLaterBadge.setAttribute('aria-label', `Open watch later list (${AppState.watchLater.length} episodes)`);
    }
}

// ============================================
// VIDEO PLAYER FUNCTIONS
// ============================================
function openVideo(video) {
    if (!DOM.modal || !DOM.player) return;
    
    AppState.current = video;
    const progress = getProgress(video.id);
    const startTime = progress?.time || 0;
    
    DOM.player.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&start=${Math.floor(startTime)}`;
    
    DOM.modal.style.display = 'flex';
    DOM.modal.setAttribute('aria-hidden', 'false');
    DOM.body.style.overflow = 'hidden';
    DOM.body.classList.add('modal-open');
    
    const titleEl = document.getElementById('video-title');
    if (titleEl) titleEl.textContent = video.title;
    
    if (DOM.transcriptPanel) DOM.transcriptPanel.setAttribute('aria-hidden', 'true');
    if (DOM.sharePanel) DOM.sharePanel.setAttribute('aria-hidden', 'true');
}

function closeVideo() {
    if (!DOM.modal || !DOM.player) return;
    
    DOM.player.src = '';
    DOM.modal.style.display = 'none';
    DOM.modal.setAttribute('aria-hidden', 'true');
    DOM.body.style.overflow = '';
    DOM.body.classList.remove('modal-open');
    AppState.current = null;
    clearInterval(AppState.progressTimer);
    
    renderContinueWatching();
    renderDashboard();
    
    if (DOM.transcriptPanel) DOM.transcriptPanel.setAttribute('aria-hidden', 'true');
    if (DOM.sharePanel) DOM.sharePanel.setAttribute('aria-hidden', 'true');
}

function navigateVideo(direction) {
    if (!AppState.current || !AppState.filtered.length) return;
    
    const currentIndex = AppState.filtered.findIndex(v => v.id === AppState.current.id);
    if (currentIndex === -1) return;
    
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = AppState.filtered.length - 1;
    if (newIndex >= AppState.filtered.length) newIndex = 0;
    
    openVideo(AppState.filtered[newIndex]);
}

// ============================================
// WATCH LATER FUNCTIONS
// ============================================
function toggleWatchLater(video) {
    const index = AppState.watchLater.findIndex(v => v.id === video.id);
    
    if (index === -1) {
        AppState.watchLater.push(video);
        Utils.showToast('Added to Watch Later');
    } else {
        AppState.watchLater.splice(index, 1);
        Utils.showToast('Removed from Watch Later');
    }
    
    Utils.saveLS(CONFIG.STORAGE.WATCH_LATER_KEY, AppState.watchLater);
    updateStats();
    
    // Re-render affected components
    if (AppState.hero && AppState.hero.id === video.id) renderHero(AppState.hero);
    renderGrid();
    if (DOM.watchLaterContainer) renderWatchLater();
}

function openWatchLater() {
    if (!DOM.watchLaterPage) return;
    renderWatchLater();
    DOM.watchLaterPage.style.display = 'block';
    DOM.watchLaterPage.setAttribute('aria-hidden', 'false');
    DOM.body.style.overflow = 'hidden';
    DOM.body.classList.add('modal-open');
}

function closeWatchLater() {
    if (!DOM.watchLaterPage) return;
    DOM.watchLaterPage.style.display = 'none';
    DOM.watchLaterPage.setAttribute('aria-hidden', 'true');
    DOM.body.style.overflow = '';
    DOM.body.classList.remove('modal-open');
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================
function openDashboard() {
    if (!DOM.dashboardModal) return;
    renderDashboard();
    DOM.dashboardModal.style.display = 'block';
    DOM.dashboardModal.setAttribute('aria-hidden', 'false');
    DOM.body.style.overflow = 'hidden';
    DOM.body.classList.add('modal-open');
}

function closeDashboard() {
    if (!DOM.dashboardModal) return;
    DOM.dashboardModal.style.display = 'none';
    DOM.dashboardModal.setAttribute('aria-hidden', 'true');
    DOM.body.style.overflow = '';
    DOM.body.classList.remove('modal-open');
}

// ============================================
// THEME FUNCTIONS
// ============================================
function setTheme(theme) {
    AppState.theme = theme;
    Utils.saveLS(CONFIG.STORAGE.THEME_KEY, theme);
    
    if (theme === 'light') {
        DOM.body.classList.add('light-mode');
    } else {
        DOM.body.classList.remove('light-mode');
    }
    
    const icon = DOM.themeToggle?.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fa-regular fa-moon' : 'fa-regular fa-sun';
    }
}

function toggleTheme() {
    const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// ============================================
// STUDIO MODE & PROJECTS
// ============================================
function switchMode(mode) {
    if (mode === 'creator') {
        if (DOM.studioRoot) DOM.studioRoot.style.display = 'block';
        if (DOM.appRoot) DOM.appRoot.style.display = 'none';
        if (DOM.heroSection) DOM.heroSection.style.display = 'none';
        if (DOM.continueBlockSec) DOM.continueBlockSec.style.display = 'none';
        updateBreadcrumbs('Studio > Projects');
    } else {
        if (DOM.studioRoot) DOM.studioRoot.style.display = 'none';
        if (DOM.appRoot) DOM.appRoot.style.display = 'block';
        if (DOM.heroSection) DOM.heroSection.style.display = 'block';
        if (DOM.continueBlockSec && AppState.videos.some(v => getProgress(v.id))) {
            DOM.continueBlockSec.style.display = 'block';
        }
    }
}

function updateBreadcrumbs(path) {
    if (!DOM.studioBreadcrumbs) return;
    
    const parts = path.split(' > ');
    DOM.studioBreadcrumbs.innerHTML = parts.map((part, i) => 
        i === parts.length - 1 
            ? `<span class="current">${part}</span>` 
            : `<span>${part}</span>`
    ).join(' <i class="fa-solid fa-chevron-right" style="font-size:0.7rem; margin:0 8px; opacity:0.5;"></i> ');
}

function renderProjects() {
    const projectsList = document.getElementById('studioProjectsList');
    if (!projectsList) return;
    
    const projects = Utils.getLS(CONFIG.STORAGE.PROJECTS_KEY, [
        { id: 'p1', title: 'The Fall of the Abbasids', status: 'Writing', progress: 65, date: '2024-05-10' },
        { id: 'p2', title: 'Prophecy & Modernity', status: 'Researching', progress: 30, date: '2024-05-12' },
        { id: 'p3', title: 'The Silent Silk Road', status: 'Editing', progress: 90, date: '2024-05-08' },
        { id: 'p4', title: 'The Golden Age', status: 'Published', progress: 100, date: '2024-05-01' }
    ]);
    
    if (AppState.currentView === 'list') {
        projectsList.className = 'studio-projects-grid';
        projectsList.innerHTML = projects.map(project => `
            <div class="project-card">
                <div class="project-card-header">
                    <span class="status-badge ${project.status.toLowerCase()}">${project.status}</span>
                    <span class="project-date">${project.date}</span>
                </div>
                <h3 class="project-title">${project.title}</h3>
                <div class="project-progress-container">
                    <div class="project-progress-bar" style="width: ${project.progress}%"></div>
                </div>
                <div class="project-card-footer">
                    <span>${project.progress}% Complete</span>
                    <button class="secondary-button small resume-project-btn" data-id="${project.id}">Resume</button>
                </div>
            </div>
        `).join('');
    } else {
        projectsList.className = 'kanban-grid';
        const columns = ['Research', 'Writing', 'Editing', 'Published'];
        projectsList.innerHTML = columns.map(status => {
            const filtered = projects.filter(p => p.status === status || (status === 'Research' && p.status === 'Researching'));
            return `
                <div class="kanban-column">
                    <h3>${status} <span class="kanban-count">${filtered.length}</span></h3>
                    <div class="kanban-cards">
                        ${filtered.map(project => `
                            <div class="kanban-card resume-project-btn" data-id="${project.id}">
                                <h4 class="text-sm font-bold mb-2">${project.title}</h4>
                                <div class="project-progress-container" style="height:4px;">
                                    <div class="project-progress-bar" style="width: ${project.progress}%"></div>
                                </div>
                                <div class="flex justify-between items-center mt-2 text-xs text-soft">
                                    <span>${project.progress}%</span>
                                    <span>${project.date}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Add event listeners to resume buttons
    projectsList.querySelectorAll('.resume-project-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectId = e.currentTarget.dataset.id;
            const project = projects.find(p => p.id === projectId);
            if (project) {
                // Show project detail view
                if (DOM.studioViews) DOM.studioViews.forEach(v => v.style.display = 'none');
                if (DOM.activeProjectView) DOM.activeProjectView.style.display = 'block';
                const titleEl = document.getElementById('current-project-title');
                if (titleEl) titleEl.textContent = project.title;
                updateBreadcrumbs(`Studio > Projects > ${project.title}`);
                if (DOM.projectTabBtns && DOM.projectTabBtns[0]) DOM.projectTabBtns[0].click();
            }
        });
    });
}

// ============================================
// SEARCH & FILTERS
// ============================================
function initSearch() {
    if (!DOM.search) return;
    
    DOM.search.addEventListener('input', (e) => {
        AppState.search = e.target.value;
        AppState.page = 0;
        if (DOM.clearSearch) DOM.clearSearch.style.display = AppState.search ? 'block' : 'none';
        
        clearTimeout(AppState.debounceTimer);
        AppState.debounceTimer = setTimeout(() => {
            renderGrid();
        }, 250);
    });
    
    if (DOM.clearSearch) {
        DOM.clearSearch.addEventListener('click', () => {
            if (DOM.search) DOM.search.value = '';
            AppState.search = '';
            AppState.page = 0;
            if (DOM.clearSearch) DOM.clearSearch.style.display = 'none';
            renderGrid();
        });
    }
    
    // Category filters
    const filterContainer = document.querySelector('.filter-chips');
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            
            const category = chip.dataset.cat;
            
            if (category === 'all') {
                AppState.categories = ['all'];
            } else {
                AppState.categories = AppState.categories.filter(c => c !== 'all');
                if (AppState.categories.includes(category)) {
                    AppState.categories = AppState.categories.filter(c => c !== category);
                    if (AppState.categories.length === 0) AppState.categories = ['all'];
                } else {
                    AppState.categories.push(category);
                }
            }
            
            document.querySelectorAll('.chip').forEach(ch => {
                if (AppState.categories.includes(ch.dataset.cat)) {
                    ch.classList.add('active');
                } else {
                    ch.classList.remove('active');
                }
            });
            
            AppState.page = 0;
            renderGrid();
        });
    }
    
    if (DOM.clearFilters) {
        DOM.clearFilters.addEventListener('click', () => {
            AppState.categories = ['all'];
            document.querySelectorAll('.chip').forEach(chip => {
                if (chip.dataset.cat === 'all') {
                    chip.classList.add('active');
                } else {
                    chip.classList.remove('active');
                }
            });
            AppState.page = 0;
            renderGrid();
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================
async function init() {
    try {
        // Load saved theme
        const savedTheme = Utils.getLS(CONFIG.STORAGE.THEME_KEY);
        if (savedTheme) setTheme(savedTheme);
        
        // Load watch later
        AppState.watchLater = Utils.getLS(CONFIG.STORAGE.WATCH_LATER_KEY, []);
        AppState.progress = Utils.getLS(CONFIG.STORAGE.PROGRESS_KEY, {});
        
        // Load channel ID
        const savedChannel = Utils.getLS(CONFIG.STORAGE.CHANNEL_KEY);
        if (DOM.channelInput) DOM.channelInput.value = savedChannel || '';
        
        // Show skeleton loading
        if (DOM.grid) {
            DOM.grid.innerHTML = Array(6).fill(0).map(() => `
                <div class="skeleton-card">
                    <div class="skeleton skeleton-thumb" style="aspect-ratio:16/9; border-radius:var(--radius-md);"></div>
                    <div class="skeleton skeleton-text" style="height:24px; width:90%; border-radius:4px;"></div>
                    <div class="skeleton skeleton-text short" style="height:20px; width:50%; border-radius:4px;"></div>
                </div>
            `).join('');
        }
        
        // Load videos
        AppState.videos = await loadVideos();
        AppState.videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        
        if (AppState.videos.length === 0) {
            throw new Error('No videos available in the archive.');
        }
        
        // Set hero
        AppState.hero = AppState.videos[0];
        renderHero(AppState.hero);
        
        // Render grid
        renderGrid();
        renderContinueWatching();
        updateStats();
        
        // Fetch channel stats from Cloudflare Worker (optional)
        const channelStats = await fetchYouTubeChannelData();
        if (channelStats) {
            console.log('Channel Stats:', channelStats);
            // Update UI with channel stats if needed
            const channelStatsEl = document.getElementById('channel-stats');
            if (channelStatsEl) {
                channelStatsEl.innerHTML = `
                    <span>📺 ${channelStats.subscribers?.toLocaleString()} subscribers</span>
                    <span>👁️ ${channelStats.views?.toLocaleString()} views</span>
                    <span>🎬 ${channelStats.videos} videos</span>
                `;
            }
        }
        
        // Initialize projects
        if (!Utils.getLS('yt_studio_demo_loaded_v2')) {
            const demoProjects = [
                { id: 'demo-1', title: 'The Lost Library of Timbuktu', status: 'Writing', progress: 45, date: new Date().toLocaleDateString() },
                { id: 'demo-2', title: 'Secrets of the Ottoman Archives', status: 'Researching', progress: 20, date: new Date().toLocaleDateString() }
            ];
            Utils.saveLS(CONFIG.STORAGE.PROJECTS_KEY, demoProjects);
            localStorage.setItem('yt_studio_demo_loaded_v2', 'true');
            Utils.showToast('Demo data preloaded!');
        }
        
        renderProjects();
        
        // Setup recommended section
        setupRecommendedSection();
        
    } catch (error) {
        console.error('Init Error:', error);
        if (DOM.error) DOM.error.style.display = 'block';
        if (DOM.errorMsg) DOM.errorMsg.textContent = error.message || 'Connection failed. Please try again.';
    } finally {
        if (DOM.loading) DOM.loading.style.display = 'none';
    }
}

function setupRecommendedSection() {
    if (!DOM.recommendedRow) return;
    
    const watchedVideos = Object.keys(AppState.progress)
        .map(id => AppState.videos.find(v => v.id === id))
        .filter(Boolean);
    
    let recommended = [];
    
    if (watchedVideos.length === 0) {
        recommended = AppState.videos.slice(4, 8);
    } else {
        // Get most watched category
        const categoryCount = {};
        watchedVideos.forEach(v => {
            categoryCount[v.category] = (categoryCount[v.category] || 0) + 1;
        });
        const topCategory = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a])[0];
        
        // Find videos in same category not watched
        recommended = AppState.videos
            .filter(v => v.category === topCategory && !watchedVideos.some(w => w.id === v.id))
            .slice(0, 4);
        
        // If not enough, add from other categories
        if (recommended.length < 4) {
            const otherVideos = AppState.videos
                .filter(v => v.category !== topCategory && !watchedVideos.some(w => w.id === v.id))
                .slice(0, 4 - recommended.length);
            recommended.push(...otherVideos);
        }
    }
    
    if (recommended.length) {
        if (DOM.recommendedBlockSec) DOM.recommendedBlockSec.style.display = 'block';
        DOM.recommendedRow.innerHTML = recommended.map(renderCard).join('');
        lazyLoadImages();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function bindEvents() {
    // Theme toggle
    if (DOM.themeToggle) DOM.themeToggle.addEventListener('click', toggleTheme);
    
    // Hero buttons
    if (DOM.heroBtn) DOM.heroBtn.addEventListener('click', () => AppState.hero && openVideo(AppState.hero));
    if (DOM.heroSave) DOM.heroSave.addEventListener('click', () => AppState.hero && toggleWatchLater(AppState.hero));
    
    // Modal close
    if (DOM.closeModal) DOM.closeModal.addEventListener('click', closeVideo);
    if (DOM.modal) DOM.modal.addEventListener('click', (e) => { if (e.target === DOM.modal) closeVideo(); });
    
    // Grid click delegation
    if (DOM.grid) {
        DOM.grid.addEventListener('click', (e) => {
            const wlBtn = e.target.closest('.watch-later-btn');
            if (wlBtn) {
                e.stopPropagation();
                const video = AppState.videos.find(v => v.id === wlBtn.dataset.id);
                if (video) toggleWatchLater(video);
                return;
            }
            
            const card = e.target.closest('.card');
            if (card) {
                const video = AppState.videos.find(v => v.id === card.dataset.id);
                if (video) openVideo(video);
            }
        });
        
        DOM.grid.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const card = e.target.closest('.card');
                if (card) {
                    e.preventDefault();
                    const video = AppState.videos.find(v => v.id === card.dataset.id);
                    if (video) openVideo(video);
                }
            }
        });
    }
    
    // Load more button
    if (DOM.loadMore) {
        DOM.loadMore.addEventListener('click', () => {
            AppState.page++;
            renderGrid();
        });
    }
    
    // Watch Later
    if (DOM.watchLaterBadge) DOM.watchLaterBadge.addEventListener('click', openWatchLater);
    if (DOM.closeWatchLater) DOM.closeWatchLater.addEventListener('click', closeWatchLater);
    if (DOM.watchLaterPage) {
        DOM.watchLaterPage.addEventListener('click', (e) => {
            if (e.target === DOM.watchLaterPage) closeWatchLater();
            
            const wlBtn = e.target.closest('.watch-later-btn');
            if (wlBtn) {
                e.stopPropagation();
                const video = AppState.watchLater.find(v => v.id === wlBtn.dataset.id);
                if (video) toggleWatchLater(video);
                return;
            }
            
            const card = e.target.closest('.card');
            if (card) {
                const video = AppState.watchLater.find(v => v.id === card.dataset.id);
                if (video) {
                    closeWatchLater();
                    openVideo(video);
                }
            }
        });
    }
    
    // Dashboard
    if (DOM.dashboardBtn) DOM.dashboardBtn.addEventListener('click', openDashboard);
    if (DOM.closeDashboard) DOM.closeDashboard.addEventListener('click', closeDashboard);
    if (DOM.dashboardModal) {
        DOM.dashboardModal.addEventListener('click', (e) => {
            if (e.target === DOM.dashboardModal) closeDashboard();
        });
    }
    
    // Retry button
    if (DOM.retryBtn) DOM.retryBtn.addEventListener('click', () => location.reload());
    
    // Connect channel
    if (DOM.connectBtn) {
        DOM.connectBtn.addEventListener('click', () => {
            const channelId = DOM.channelInput?.value.trim();
            if (channelId) {
                localStorage.setItem(CONFIG.STORAGE.CHANNEL_KEY, channelId);
                localStorage.removeItem(CONFIG.STORAGE.CACHE_KEY);
                Utils.showToast('Channel ID saved! Reloading archives...');
                setTimeout(() => location.reload(), 1500);
            } else {
                Utils.showToast('Please enter a valid Channel ID');
            }
        });
    }
    
    // Scroll to top
    if (DOM.scrollToTop) {
        window.addEventListener('scroll', () => {
            DOM.scrollToTop.classList.toggle('show', window.scrollY > 500);
        });
        DOM.scrollToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 20);
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Don't interfere with input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            if (e.key === 'Escape') e.target.blur();
            return;
        }
        
        const key = e.key.toLowerCase();
        
        // Search focus
        if (key === '/' && DOM.search) {
            e.preventDefault();
            DOM.search.focus();
        }
        
        // Escape - close all modals
        if (key === 'escape') {
            closeVideo();
            closeWatchLater();
            closeDashboard();
        }
        
        // Video navigation (when current video is playing)
        if (AppState.current) {
            if (key === 'j') {
                e.preventDefault();
                navigateVideo(-1);
            } else if (key === 'k') {
                e.preventDefault();
                navigateVideo(1);
            }
        }
        
        // Theme toggle
        if (key === 't') {
            toggleTheme();
        }
    });
    
    // Mouse move effect for cards
    document.addEventListener('mousemove', (e) => {
        document.querySelectorAll('.card').forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
    
    // Mode switcher
    if (DOM.modeBtns) {
        DOM.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                DOM.modeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                switchMode(mode);
            });
        });
    }
    
    // New project button
    if (DOM.newProjectBtn) {
        DOM.newProjectBtn.addEventListener('click', () => {
            if (DOM.studioViews) DOM.studioViews.forEach(v => v.style.display = 'none');
            if (DOM.activeProjectView) DOM.activeProjectView.style.display = 'block';
            const titleEl = document.getElementById('current-project-title');
            if (titleEl) titleEl.textContent = 'New Untitled Video';
            updateBreadcrumbs('Studio > Projects > New Untitled Video');
            if (DOM.projectTabBtns && DOM.projectTabBtns[0]) DOM.projectTabBtns[0].click();
        });
    }
    
    // Back to projects
    if (DOM.backToProjectsBtn) {
        DOM.backToProjectsBtn.addEventListener('click', () => {
            if (DOM.activeProjectView) DOM.activeProjectView.style.display = 'none';
            if (DOM.studioViewProjects) DOM.studioViewProjects.style.display = 'block';
            updateBreadcrumbs('Studio > Projects');
            if (DOM.studioNavBtns) {
                DOM.studioNavBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.tab === 'projects') btn.classList.add('active');
                });
            }
        });
    }
    
    // Project tab buttons
    if (DOM.projectTabBtns) {
        DOM.projectTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                DOM.projectTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tabId = btn.dataset.ptab;
                if (DOM.ptabContents) {
                    DOM.ptabContents.forEach(content => content.classList.remove('active'));
                    const activeTab = document.getElementById(`ptab-${tabId}`);
                    if (activeTab) activeTab.classList.add('active');
                }
            });
        });
    }
}

// ============================================
// START APPLICATION
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        bindEvents();
    });
} else {
    init();
    bindEvents();
}