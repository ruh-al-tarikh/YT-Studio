// YT Studio - Working Video Player - Clean Version
(function() {
  "use strict";
  
  const API_URL = "https://yt-proxy.ruhdevopsytstudio.workers.dev";
  
  // Create video container
  function createContainer() {
    let container = document.querySelector(".videos-grid, .grid, #grid, .episodes-grid");
    if (!container) {
      container = document.createElement("div");
      container.className = "videos-grid";
      container.id = "grid";
      container.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;padding:20px;max-width:1400px;margin:0 auto;";
      const target = document.querySelector("main, .container, body");
      if (target) target.appendChild(container);
      else document.body.appendChild(container);
    }
    return container;
  }
  
  // Load videos from API
  async function loadVideos() {
    const container = createContainer();
    container.innerHTML = "<div style=\"text-align:center;padding:40px;\">🎬 Loading archive...</div>";
    
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      const videos = data.videos || [];
      
      if (videos.length === 0) {
        container.innerHTML = "<div style=\"text-align:center;padding:40px;\">No episodes found.</div>";
        return;
      }
      
      container.innerHTML = videos.map(function(v) {
        var escapedTitle = v.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return "<div class=\"video-card\" style=\"cursor:pointer;border-radius:12px;overflow:hidden;background:#1a1a2e;transition:transform 0.2s;border:1px solid #2a2a3e;\" onclick=\"window.playVideo(\'" + v.videoId + "\')\">" +
          "<img src=\"" + v.thumbnail + "\" alt=\"" + escapedTitle + "\" style=\"width:100%;aspect-ratio:16/9;object-fit:cover;display:block;\" loading=\"lazy\">" +
          "<div style=\"padding:12px\">" +
          "<h3 style=\"margin:0 0 6px;font-size:16px;line-height:1.4;\">" + escapedTitle + "</h3>" +
          "<div style=\"font-size:12px;opacity:0.7;\">📅 " + (v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : "Recently") + "</div>" +
          "</div></div>";
      }).join("");
      
      console.log("✅ Loaded " + videos.length + " videos");
      
    } catch (err) {
      console.error("Error loading videos:", err);
      container.innerHTML = "<div style=\"text-align:center;padding:40px;\">⚠️ Failed to load. <button onclick=\"location.reload()\">Retry</button></div>";
    }
  }
  
  // YouTube player
  var player = null;
  var playerContainer = null;
  
  function loadYouTubeAPI() {
    if (document.getElementById("youtube-api")) return;
    var tag = document.createElement("script");
    tag.id = "youtube-api";
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
  
  function createPlayerContainer() {
    if (playerContainer) return playerContainer;
    
    playerContainer = document.createElement("div");
    playerContainer.id = "yt-player-container";
    playerContainer.style.cssText = "position:fixed;bottom:20px;right:20px;width:360px;z-index:10000;background:#000;border-radius:8px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.3);display:none;";
    
    var closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = "position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.5);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;z-index:10001;font-size:12px;";
    closeBtn.onclick = function() {
      playerContainer.style.display = "none";
      if (player) player.stopVideo();
    };
    playerContainer.appendChild(closeBtn);
    
    var inner = document.createElement("div");
    inner.id = "yt-player-inner";
    playerContainer.appendChild(inner);
    
    document.body.appendChild(playerContainer);
    return playerContainer;
  }
  
  window.onYouTubeIframeAPIReady = function() {
    createPlayerContainer();
    player = new YT.Player("yt-player-inner", {
      height: "203",
      width: "360",
      videoId: "",
      playerVars: { autoplay: 1, rel: 0 }
    });
  };
  
  window.playVideo = function(videoId) {
    createPlayerContainer();
    if (player && player.loadVideoById) {
      player.loadVideoById(videoId);
      playerContainer.style.display = "block";
    } else {
      loadYouTubeAPI();
      var check = setInterval(function() {
        if (player && player.loadVideoById) {
          clearInterval(check);
          player.loadVideoById(videoId);
          playerContainer.style.display = "block";
        }
      }, 200);
    }
    console.log("🎬 Playing: " + videoId);
  };
  
  // Initialize
  loadYouTubeAPI();
  document.addEventListener("DOMContentLoaded", loadVideos);
})();
