// YT Studio - Working Video Player
(function() {
  const API_URL = "https://yt-proxy.ruhdevopsytstudio.workers.dev";
  
  async function loadVideos() {
    const container = document.getElementById("video-grid");
    if (!container) return;
    
    container.innerHTML = "<div style='text-align:center;padding:40px;'>Loading videos...</div>";
    
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const videos = data.videos || [];
      
      if (videos.length === 0) {
        container.innerHTML = "<div style='text-align:center;padding:40px;'>No videos found</div>";
        return;
      }
      
      container.innerHTML = videos.map(function(v) {
        return '<div class="video-card" onclick="playVideo(\'' + v.videoId + '\')" style="cursor:pointer;border-radius:12px;overflow:hidden;background:#1a1a2e;margin-bottom:20px;">' +
          '<img src="' + v.thumbnail + '" style="width:100%;aspect-ratio:16/9;object-fit:cover;" loading="lazy">' +
          '<div style="padding:12px"><h3 style="margin:0;font-size:16px;">' + escapeHtml(v.title) + '</h3></div>' +
          '</div>';
      }).join("");
      
      console.log("Loaded " + videos.length + " videos");
    } catch(e) {
      container.innerHTML = "<div style='text-align:center;padding:40px;'>Failed to load. <button onclick='location.reload()'>Retry</button></div>";
    }
  }
  
  function escapeHtml(str) {
    if (!str) return "";
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  
  var player = null;
  var playerDiv = null;
  
  function createPlayer() {
    if (playerDiv) return;
    playerDiv = document.createElement("div");
    playerDiv.id = "floating-player";
    playerDiv.style.cssText = "position:fixed;bottom:20px;right:20px;width:360px;background:#1a1a2e;border-radius:12px;overflow:hidden;z-index:10000;display:none;box-shadow:0 8px 32px rgba(0,0,0,0.4);";
    playerDiv.innerHTML = '<div style="display:flex;justify-content:space-between;padding:8px 12px;background:rgba(0,0,0,0.5);"><span id="player-title"></span><button id="player-close" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;">?</button></div><div id="player-inner"></div>';
    document.body.appendChild(playerDiv);
    
    document.getElementById("player-close").onclick = function() {
      playerDiv.style.display = "none";
      if (player) player.stopVideo();
    };
  }
  
  window.onYouTubeIframeAPIReady = function() {
    createPlayer();
    player = new YT.Player("player-inner", {
      height: "203",
      width: "360",
      videoId: ""
    });
  };
  
  window.playVideo = function(videoId) {
    createPlayer();
    if (player && player.loadVideoById) {
      player.loadVideoById(videoId);
      playerDiv.style.display = "block";
    } else {
      setTimeout(function() { window.playVideo(videoId); }, 500);
    }
  };
  
  function loadYouTubeAPI() {
    if (document.getElementById("yt-api")) return;
    var s = document.createElement("script");
    s.id = "yt-api";
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  }
  
  function initSearch() {
    var input = document.getElementById("search-input");
    if (!input) return;
    input.oninput = function() {
      var term = this.value.toLowerCase();
      var cards = document.querySelectorAll(".video-card");
      cards.forEach(function(card) {
        var title = card.querySelector("h3")?.innerText.toLowerCase() || "";
        card.style.display = title.includes(term) ? "block" : "none";
      });
    };
  }
  
  loadYouTubeAPI();
  initSearch();
  document.addEventListener("DOMContentLoaded", loadVideos);
})();
