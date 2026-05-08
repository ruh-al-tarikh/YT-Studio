<img width="1200" height="675" alt="gitcity-ruhdevops-landscape" src="https://github.com/user-attachments/assets/78f27b70-ffce-47ca-8c56-22ce98cfc38e" />


## ✨ Overview

This project is not just a video gallery 
>it’s a **progressive content platform** engineered for:

- ⚡ Speed & responsiveness  
- 🧠 Intelligent UX patterns  
- 🎬 Immersive viewing experience  
- 📱 Mobile-first interaction design  

---

## 🧩 Feature Set

### 🧠 Advanced UX Layer (7 Enhancements)

- 🔍 **Smart Search**
  - Autocomplete suggestions
  - Search history (localStorage-backed)

- ⌨️ **Keyboard Navigation**
  - `/` → Focus search  
  - `J / K` → Navigate episodes  
  - `Esc` → Close UI layers  
  - Arrow keys → Grid traversal  

- ♾️ **Infinite Scroll + Pagination**
  - Hybrid model (12 items/page)
  - Smooth content loading

- 📝 **Episode Intelligence**
  - Notes / transcript panel
  - Contextual content expansion

- 📱 **Responsive System**
  - Optimized layouts for all breakpoints
  - Touch-friendly interactions

- 🎯 **Recommendation Engine**
  - Based on viewing history
  - Lightweight personalization (client-side)

- 🔗 **Social Sharing**
  - WhatsApp, Twitter, Facebook
  - Copyable deep links

---

### ⚙️ Core Platform Features

- 🎞️ Video grid with lazy-loaded thumbnails  
- ⏯️ Continue Watching system  
- 🔥 Trending episodes section  
- 🌙 Dark / Light mode toggle  
- 📌 Watch Later queue (localStorage)  
- 📊 Progress tracking dashboard  
- 🧭 Category filtering + search  

---

## 🏗️ Architecture Overview

            ┌──────────────────────────┐
            │      Frontend (SPA)      │
            │  HTML + CSS + Vanilla JS │
            └────────────┬─────────────┘
                         │ API Calls
                         ▼
            ┌──────────────────────────┐
            │   Cloudflare Workers API │
            │  (Edge Backend Layer)    │
            └────────────┬─────────────┘
                         │ Fetch
                         ▼
            ┌──────────────────────────┐
            │   External Data Source   │
            │ (YouTube / Custom Feeds) │
            └──────────────────────────┘

    ┌────────────────────────────────────────────┐
    │ Deployment & Delivery Layer                │
    │ - Docker + Nginx                           │
    │ - Google Cloud Run                         │
    │ - Vercel (optional)                        │
    │ - Cloudflare CDN + Analytics               │
    └────────────────────────────────────────────┘
	
---

## 🛠️ Tech Stack

| Layer        | Technology |
|--------------|-----------|
| Frontend     | HTML5, CSS3, Vanilla JavaScript |
| Build Tool   | Vite |
| Backend API  | Cloudflare Workers |
| Server       | Nginx (Dockerized) |
| Deployment   | Google Cloud Run / Vercel |
| Analytics    | Vercel Speed Insights + Cloudflare Web Analytics |

---

## ⚡ Quick Start

### 🧪 Local Development

```bash
npm install
npm run dev
👉 http://localhost:5173


🐳 Docker
docker build -t yt-studio:latest .
docker run -p 8080:80 yt-studio:latest
👉 http://localhost:8080


📦 Docker Compose
docker-compose up


☁️ Deployment
Google Cloud Run
gcloud auth login
gcloud auth configure-docker

docker tag yt-studio:latest gcr.io/yt-studio-493116/yt-studio:latest
docker push gcr.io/yt-studio-493116/yt-studio:latest

gcloud run deploy yt-studio \
  --image gcr.io/yt-studio-493116/yt-studio:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated


🔄 CI/CD (GitHub Actions)
Automated pipeline:

Build Docker image
Push to Google Container Registry
Deploy to Cloud Run (main branch)
Config:
.github/workflows/deploy-gcr.yml


▲ Vercel Deployment
vercel deploy


⚙️ Configuration
Environment Variables
VITE_API_URL=https://yt-studio-api.example.com
Default:
http://127.0.0.1:8787


📁 Project Structure
├── index.html
├── js/
│   └── app.js
├── css/
│   └── style.css
├── src/
│   └── api.js
├── Dockerfile
├── docker-compose.yml
├── package.json
└── .github/workflows/


📊 Performance Strategy
⚡ Lazy Loading → Intersection Observer
🗄️ Aggressive Caching → 1-year static assets
🗜️ Compression → Gzip via Nginx
🔁 SPA Routing → All routes → index.html
📦 Pagination → 12 items/page
🧠 Local Storage → Search + watch history


🔌 API Integration
Endpoint:
https://yt-studio-api.ruhdevopsytstudio.workers.dev

Sample Response
{
  "videos": [
    {
      "id": "video-id",
      "title": "Episode title",
      "thumbnail": "https://i.ytimg.com/...",
      "publishedAt": "2024-01-01T00:00:00Z",
      "channel": "Ruh Al Tarikh"
    }
  ]
}


⌨️ Keyboard Shortcuts
| Key       | Action           |
| --------- | ---------------- |
| `/`       | Focus search     |
| `J`       | Previous episode |
| `K`       | Next episode     |
| `Esc`     | Close modals     |
| `↑ ↓ ← →`| Navigate grid    |  


🌐 Browser Support
Chrome / Edge ≥ 90
Firefox ≥ 88
Safari ≥ 14
Mobile browsers


📜 License
MIT

👤 Author
Azeez Mohammed Rizwan


🧠 Final Note
This project emphasizes:

Perceived performance over raw speed ⚡
User intent-driven design 🎯
Minimal stack, maximum experience 🧩

A lightweight architecture delivering a premium, app-like viewing platform directly in the browser 🚀


