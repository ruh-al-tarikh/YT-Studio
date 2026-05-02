// YT Studio - WORKING VIDEO PLAYER
(function() {
  const API_URL = "https://yt-proxy.ruhdevopsytstudio.workers.dev";
  
  // Create container
  const container = document.createElement("div");
  container.id = "video-grid";
  container.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;padding:20px;max-width:1200px;margin:0 auto;";
  
  // Find where to put it
  const target = document.querySelector("main, .container, body");
  if (target) target.appendChild(container);
  
  // Load videos
  async function loadVideos() {
    container.innerHTML = "<div style='text-align:center;padding:40px;'>📺 Loading videos...</div>";
    
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const videos = data.videos || [];
      
      if (!videos.length) {
        container.innerHTML = "<div style='text-align:center;padding:40px;'>No videos found</div>";
        return;
      }
      
      container.innerHTML = videos.map(v => `
        <div onclick='playVideo("${v.videoId}")' style='cursor:pointer;border-radius:12px;overflow:hidden;background:#1a1a2e;border:1px solid #2a2a3e;transition:transform 0.2s;' onmouseover='this.style.transform="scale(1.02)"' onmouseout='this.style.transform="scale(1)"'>
          <img src="${v.thumbnail}" alt="${v.title}" style='width:100%;aspect-ratio:16/9;object-fit:cover;'>
          <div style='padding:12px'>
            <h3 style='margin:0;font-size:16px;'>${escapeHtml(v.title)}</h3>
          </div>
        </div>
      `).join("");
      
      console.log(`✅ Loaded ${videos.length} videos`);
    } catch(err) {
      console.error(err);
      container.innerHTML = "<div style='text-align:center;padding:40px;'>⚠️ Failed to load. <button onclick='location.reload()'>Retry</button></div>";
    }
  }
  
  function escapeHtml(t) {
    const d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
  }
  
  // YouTube Player
  let player = null;
  
  function loadYouTubeAPI() {
    if (document.getElementById("yt-api")) return;
    const script = document.createElement("script");
    script.id = "yt-api";
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  }
  
  window.onYouTubeIframeAPIReady = function() {
    let pDiv = document.getElementById("yt-player");
    if (!pDiv) {
      pDiv = document.createElement("div");
      pDiv.id = "yt-player";
      pDiv.style.cssText = "position:fixed;bottom:20px;right:20px;width:360px;z-index:10000;background:#000;border-radius:8px;overflow:hidden;display:none;box-shadow:0 4px 15px rgba(0,0,0,0.3);";
      
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "✕";
      closeBtn.style.cssText = "position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;z-index:10001;";
      closeBtn.onclick = function() {
        pDiv.style.display = "none";
        if (player) player.stopVideo();
      };
      pDiv.appendChild(closeBtn);
      
      const inner = document.createElement("div");
      inner.id = "yt-player-inner";
      pDiv.appendChild(inner);
      
      document.body.appendChild(pDiv);
    }
    
    player = new YT.Player("yt-player-inner", {
      height: "203",
      width: "360",
      videoId: "",
      events: { onReady: function() { console.log("Player ready"); } }
    });
  };
  
  window.playVideo = function(videoId) {
    const pDiv = document.getElementById("yt-player");
    if (player && player.loadVideoById) {
      player.loadVideoById(videoId);
      if (pDiv) pDiv.style.display = "block";
    } else {
      loadYouTubeAPI();
      setTimeout(function() { playVideo(videoId); }, 500);
    }
    console.log("Playing:", videoId);
  };
  
  // Start
  loadYouTubeAPI();
  document.addEventListener("DOMContentLoaded", loadVideos);
})();
