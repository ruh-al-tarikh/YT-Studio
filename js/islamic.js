import { CitationEngine } from './citation.js';

let ISLAMIC_HTML=`
<div class="islamic-container">
	<div class="islamic-main">
		<div class="section-heading">
			<h2 class="section-title">Reference Library</h2>
			<p class="section-copy">Search and copy verified Quranic and Hadith citations for your scripts.</p>
		</div>

		<div class="islamic-search">
			<i class="fa-solid fa-magnifying-glass"></i>
			<input type="text" id="islamicSearch" placeholder="Search by topic, Surah, or Hadith number...">
		</div>

		<div class="islamic-filters">
			<button class="chip active" data-filter="all">All</button>
			<button class="chip" data-filter="quran">Quran</button>
			<button class="chip" data-filter="hadith">Hadith</button>
			<button class="chip" data-filter="history">Historical Quotes</button>
		</div>

		<div class="reference-list" id="referenceList">
			<!-- Populated by JS -->
		</div>
	</div>

	<aside class="islamic-sidebar">
		<div class="islamic-card">
			<h3><i class="fa-solid fa-bookmark"></i> Quick Collections</h3>
			<ul class="collection-list">
				<li><i class="fa-solid fa-folder"></i> End Times Prophecies <span>(12)</span></li>
				<li><i class="fa-solid fa-folder"></i> Stories of Prophets <span>(8)</span></li>
				<li><i class="fa-solid fa-folder"></i> Golden Age Science <span>(5)</span></li>
			</ul>
			<button class="secondary-button full-width mt-3"><i class="fa-solid fa-plus"></i> New Collection</button>
		</div>
	</aside>
</div>
`,mockReferences=[
    {id:1,type:"quran",source:"Surah Al-Baqarah 2:255",surah:2,ayah:255,translation:"Allah! There is no deity except Him, the Ever-Living, the Sustainer of [all] existence.",tags:["Tawheed","Ayatul Kursi"]},
    {id:2,type:"hadith",source:"Sahih al-Bukhari 1",author:"Bukhari",title:"Sahih al-Bukhari",year:846,city:"Bukhara",translation:"The reward of deeds depends upon the intentions...",tags:["Intentions","Basics"]},
    {id:3,type:"manuscript",author:"Ibn Khaldun",title:"The Muqaddimah",year:1377,city:"Tunis",translation:"I have become the servant of the two holy sanctuaries.",tags:["Jerusalem","Leadership"]}
];

function initIslamic(){
    var e=document.getElementById("ptab-islamic") || document.getElementById("studio-view-islamic");
    if(e){
        e.innerHTML=ISLAMIC_HTML;
        let a=document.getElementById("referenceList");
        let searchInput=document.getElementById("islamicSearch");
        let t=document.querySelectorAll(".islamic-filters .chip"),i="all",s="";

        function c(){
            var e=mockReferences.filter(e=>{
                var a="all"===i||e.type===i,e=e.source?.toLowerCase().includes(s)||e.translation.toLowerCase().includes(s)||e.tags.join(" ").toLowerCase().includes(s);
                return a&&e
            });
            if(0===e.length){
                a.innerHTML='<p class="text-soft">No references found.</p>';
            }else{
                a.innerHTML=e.map(e=>`
                    <div class="reference-item studio-card">
                        <div class="ref-header">
                            <span class="ref-source">${e.source || e.title}</span>
                            <span class="ref-badge ${e.type}">${e.type}</span>
                        </div>
                        ${e.arabic?`<p class="ref-arabic">${e.arabic}</p>`:""}
                        <p class="ref-translation">${e.translation}</p>
                        <div class="ref-footer">
                            <div class="ref-tags">${e.tags.map(e=>`<span class="ref-tag">#${e}</span>`).join("")}</div>
                            <div class="ref-actions">
                                <button class="secondary-button small cite-ref-btn" data-id="${e.id}"><i class="fa-solid fa-scroll"></i> Cite</button>
                                <button class="secondary-button small attach-ref-btn" data-id="${e.id}"><i class="fa-solid fa-paperclip"></i> Attach</button>
                            </div>
                        </div>
                    </div>
                `).join("");

                a.querySelectorAll(".cite-ref-btn").forEach(btn=>{
                    btn.addEventListener("click",ev=>{
                        let id=parseInt(ev.currentTarget.dataset.id);
                        let ref=mockReferences.find(r=>r.id===id);
                        let citation = CitationEngine.format(ref);
                        navigator.clipboard.writeText(citation);
                        n("Citation copied: " + citation);
                    });
                });

                a.querySelectorAll(".attach-ref-btn").forEach(btn=>{
                    btn.addEventListener("click",ev=>{
                        let id=parseInt(ev.currentTarget.dataset.id);
                        let ref=mockReferences.find(r=>r.id===id);
                        let citation = CitationEngine.format(ref);
                        let textareas=document.querySelectorAll(".script-textarea");
                        if(textareas.length > 0){
                            let target = textareas[2] || textareas[0];
                            target.value += "\n[Ref: " + citation + "]";
                            target.dispatchEvent(new Event("input"));
                            n("Attached to Script!");
                        }
                    });
                });
            }
        }

        function n(e){
            let a=document.getElementById("toast");
            if(a){
                a.textContent=e;
                a.classList.add("show");
                setTimeout(()=>a.classList.remove("show"),3e3);
            }
        }

        searchInput.addEventListener("input",e=>{
            s=e.target.value.toLowerCase();
            c();
        });

        t.forEach(e=>{
            e.addEventListener("click",e=>{
                t.forEach(e=>e.classList.remove("active"));
                e.target.classList.add("active");
                i=e.target.dataset.filter;
                c();
            });
        });
        c();
    }
}

document.addEventListener("DOMContentLoaded", initIslamic);
export { initIslamic };
